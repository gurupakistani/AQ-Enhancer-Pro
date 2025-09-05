import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set. Please set it to your Google AI API key.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MAX_RETRIES = 4;
const INITIAL_BACKOFF_MS = 3000;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const editImage = async (
  base64ImageData: string,
  mimeType: string,
  prompt: string
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

      const isRateLimitError = lastError.message.includes("429") || lastError.message.toLowerCase().includes("resource_exhausted");

      if (isRateLimitError && attempt < MAX_RETRIES - 1) {
        const backoffTime = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
        const jitter = backoffTime * 0.2 * (Math.random() - 0.5);
        console.log(`Rate limit hit. Retrying in ${Math.round((backoffTime + jitter) / 1000)}s...`);
        await delay(backoffTime + jitter);
      } else {
        if (isRateLimitError) {
          throw new Error(`The service is currently busy. Please try again in a few moments. (Rate limit exceeded after ${MAX_RETRIES} retries)`);
        }
        throw new Error(`Failed to edit image: ${lastError.message}`);
      }
    }
  }
  
  throw new Error(`Failed to edit image after ${MAX_RETRIES} attempts. Last error: ${lastError?.message}`);
};