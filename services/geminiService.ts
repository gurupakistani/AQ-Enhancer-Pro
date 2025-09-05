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
        throw new Error("API key not configured. Please go to your project settings, add an Environment Variable for 'API_KEY', and then redeploy.");
    }

    aiClient = new GoogleGenAI({ apiKey });
    return aiClient;
}

/**
 * Performs a single image editing request to the Gemini API.
 * This function no longer contains retry logic; all throttling is handled by the requestQueue.
 */
export const editImage = async (
  base64ImageData: string,
  mimeType: string,
  prompt: string
): Promise<string> => {
  const aiInstance = getAiClient(); 

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
    const lastError = error instanceof Error ? error : new Error(String(error));
    console.error(`Gemini API Error:`, lastError);

    const isRateLimitError = lastError.message.includes("429") || lastError.message.toLowerCase().includes("resource_exhausted") || lastError.message.toLowerCase().includes("rate limit exceeded");
    
    if (isRateLimitError) {
      // This is a more critical error now, as the queue should prevent it.
      // We throw a specific, user-friendly message.
      throw new Error(`The service is experiencing unusually high traffic. Please try again in a few minutes.`);
    }
    
    // Re-throw other errors to be handled by the UI's main error display.
    throw new Error(`Failed to edit image: ${lastError.message}`);
  }
};