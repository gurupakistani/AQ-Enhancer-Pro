import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";

// Lazily initialized client to avoid crashing the app on load if the key is missing.
let aiClient: GoogleGenAI | null = null;

/**
 * Initializes and returns the GoogleGenAI client if it hasn't been already.
 * This function is called on the first API request.
 * Throws an error if the API key is not configured, which is then caught by the UI.
 */
function getAiClient(): GoogleGenAI {
    if (aiClient) {
        return aiClient;
    }

    const apiKey = process.env.API_KEY;

    if (!apiKey || apiKey === 'undefined') {
        throw new Error("API key not configured. Please go to your Vercel project settings, add an Environment Variable for 'API_KEY', and then redeploy.");
    }

    aiClient = new GoogleGenAI({ apiKey });
    return aiClient;
}


const MAX_RETRIES = 8;
const INITIAL_BACKOFF_MS = 7500;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const editImage = async (
  base64ImageData: string,
  mimeType: string,
  prompt: string,
  onRetry?: (attempt: number, delay: number) => void
): Promise<string> => {
  // getAiClient will throw a user-friendly error if the key is missing.
  // This error will be caught in the UI and displayed to the user.
  const aiInstance = getAiClient(); 

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response: GenerateContentResponse = await aiInstance.models.generateContent({
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
          throw new Error(`The model was unable to process this request. Reason: ${textResponse}`);
        }
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
        // For non-rate-limit errors, we shouldn't retry.
        // Re-throw the original error to be handled by the UI.
        throw lastError;
      }
    }
  }
  
  // This line is now only reachable if all retries for a rate limit error fail.
  throw new Error(`Failed to edit image after ${MAX_RETRIES} attempts due to repeated rate limiting. Last error: ${lastError?.message}`);
};