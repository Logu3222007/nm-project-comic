import { GoogleGenAI } from "@google/genai";

let genAIClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({ apiKey });
  }
  return genAIClient;
}

/**
 * Text & Story Reasoning with Google Gemini 3.8 Flash
 */
export async function callGeminiReasoning(
  prompt: string,
  systemInstruction?: string,
  model = "gemini-3.8-flash"
): Promise<string> {
  const client = getGeminiClient();
  if (!client) {
    throw new Error("GEMINI_API_KEY is not set on the server.");
  }

  try {
    // Attempt using interactions API
    const interaction = await client.interactions.create({
      model,
      input: prompt,
      ...(systemInstruction ? { system_instruction: systemInstruction } : {}),
    });

    if (interaction.output_text) {
      return interaction.output_text;
    }
  } catch (err) {
    console.warn("Interactions API call failed, attempting models.generateContent fallback...", err);
    try {
      const clientAny = client as any;
      if (clientAny.models?.generateContent) {
        const res = await clientAny.models.generateContent({
          model,
          contents: prompt,
          config: systemInstruction ? { systemInstruction } : undefined,
        });
        return res.text || "";
      }
    } catch (fallbackErr) {
      console.error("Both interactions and generateContent failed:", fallbackErr);
      throw fallbackErr;
    }
    throw err;
  }

  return "";
}

/**
 * Image Generation with Gemini Image Models (gemini-3.1-flash-image / gemini-3-pro-image)
 */
export async function generateGeminiImage(
  prompt: string,
  aspectRatio: string = "4:3",
  model = "gemini-3.1-flash-image"
): Promise<string | null> {
  const client = getGeminiClient();
  if (!client) return null;

  const comicArtPrompt = `Masterpiece graphic novel comic panel illustration, ${prompt}. Clean professional ink line art, expressive comic coloration, dynamic camera composition, cinematic lighting, high resolution, award-winning comic illustration, strictly no speech bubbles, no text watermarks.`;

  // 1. Try client.interactions.create with gemini-3.1-flash-image (Official Gemini 3 Image workflow)
  try {
    const interaction = await client.interactions.create({
      model,
      input: comicArtPrompt,
    });
    const outputImage = (interaction as any).output_image;
    if (outputImage?.data) {
      return `data:${outputImage.mime_type || "image/png"};base64,${outputImage.data}`;
    }
  } catch (err) {
    console.warn("Gemini interactions.create for image failed, trying models.generateContent...", err);
  }

  // 2. Try models.generateContent with gemini-3.1-flash-image
  try {
    const clientAny = client as any;
    if (clientAny.models?.generateContent) {
      const response = await clientAny.models.generateContent({
        model,
        contents: comicArtPrompt,
      });

      const parts = response.candidates?.[0]?.content?.parts || response.parts || [];
      for (const part of parts) {
        if (part.inlineData?.data) {
          const mimeType = part.inlineData.mimeType || "image/jpeg";
          return `data:${mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
  } catch (err) {
    console.warn("Gemini generateContent for image failed, trying Imagen models.generateImages...", err);
  }

  // 3. Try client.models.generateImages with Imagen 3
  try {
    const clientAny = client as any;
    if (clientAny.models?.generateImages) {
      const response = await clientAny.models.generateImages({
        model: "imagen-3.0-generate-002",
        prompt: comicArtPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: "image/jpeg",
          aspectRatio: aspectRatio === "16:9" ? "16:9" : "4:3",
        },
      });

      if (response.generatedImages?.[0]?.image?.imageBytes) {
        const base64Data = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64Data}`;
      }
    }
  } catch (err) {
    console.warn("Gemini generateImages call failed:", err);
  }

  return null;
}
