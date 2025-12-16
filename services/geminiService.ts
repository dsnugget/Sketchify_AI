import { GoogleGenAI } from "@google/genai";
import { SketchStyle } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSketchFromImage = async (base64Image: string, style: SketchStyle): Promise<string> => {
  try {
    // We strip the data prefix if present to ensure clean base64 for the API
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpg|jpeg|webp);base64,/, '');

    const prompt = style === 'bw'
      ? 'Transform this image into a high-quality, professional pencil sketch. The style should be artistic, black and white, with strong shading and charcoal textures. Do not include any colors. Return only the image.'
      : 'Transform this image into a high-quality, professional colored pencil sketch. The style should be artistic, vibrant, with visible pencil strokes and texture. Keep the original colors but render them as a hand-drawn sketch. Return only the image.';

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: 'image/jpeg', 
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        // We don't need systemInstruction for a simple image transformation usually, 
        // but setting a low temperature can help with fidelity.
        temperature: 0.4,
        imageConfig: {
          aspectRatio: '1:1', // Ensures the output is a 1:1 square, typically 1024x1024 pixels
        }
      }
    });

    // Parse response to find the image part
    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) {
      throw new Error("No content generated");
    }

    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image data found in response");

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};