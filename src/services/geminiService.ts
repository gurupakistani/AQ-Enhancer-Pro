import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";

// Fix: Use process.env.API_KEY as per the guidelines. This also resolves the TypeScript error on import.meta.env.
if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set. Please set it to your Google AI API key.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MAX_RETRIES = 8;
const INITIAL_BACKOFF_MS = 7500;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const editImage = async (
  base64ImageData: string,
  mimeType: string,
  prompt: string,
  onRetry?: (attempt: number, delay: number) => void
): Promise<string> => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64ImageData,
                mimeType: mimeType,
              },
            },
            {
              text: prompt,
            },
          ],
        },
        config: {
          responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
      });

      const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

      if (imagePart && imagePart.inlineData) {
        return imagePart.inlineData.data;
      } else {
        const textResponse = response.text || "No text response found.";
        if (textResponse.toLowerCase().includes("i can't") || textResponse.toLowerCase().includes("i am unable")) {
          // This is a definitive response from the model, not a transient error, so we don't retry.
          throw new Error(`The model was unable to process this request. Reason: ${textResponse}`);
        }
        // Also not a retryable error.
        throw new Error('The API did not return an image. Please try a different image or effect.');
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Gemini API Error (Attempt ${attempt + 1}/${MAX_RETRIES}):`, lastError);

      const isRateLimitError = lastError.message.includes("429") || lastError.message.toLowerCase().includes("resource_exhausted") || lastError.message.toLowerCase().includes("rate limit exceeded");

      if (isRateLimitError && attempt < MAX_RETRIES - 1) {
        const backoffTime = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
        const jitter = backoffTime * 0.2 * (Math.random() - 0.5);
        const totalDelay = backoffTime + jitter;
        
        console.log(`Rate limit hit. Retrying in ${Math.round(totalDelay / 1000)}s...`);
        if (onRetry) {
          onRetry(attempt + 1, totalDelay);
        }
        await delay(totalDelay);
      } else {
        if (isRateLimitError) {
          throw new Error(`The service is still busy after ${MAX_RETRIES} retries. This can happen on shared platforms due to high traffic. Please try again later.`);
        }
        throw new Error(`Failed to edit image: ${lastError.message}`);
      }
    }
  }
  
  throw new Error(`Failed to edit image after ${MAX_RETRIES} attempts. Last error: ${lastError?.message}`);
};