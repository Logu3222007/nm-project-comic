import { NextResponse } from "next/server";
import { generatePanelImage } from "@/lib/ai/image-generator";
import { DEFAULT_STYLES } from "@/lib/constants";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      prompt,
      styleId,
      visualDirection,
      characters,
      previousPanelContext,
      continuityRules,
      customNegativePrompt,
      aspectRatio,
      modelId,
      location,
      keyObjects,
      locationDetails,
      storyboardBeat,
      panelIndex,
    } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Panel prompt is required" }, { status: 400 });
    }

    const style = DEFAULT_STYLES.find((s) => s.id === styleId) || DEFAULT_STYLES[0];

    const result = await generatePanelImage({
      prompt,
      style,
      visualDirection,
      characters,
      previousPanelContext,
      continuityRules,
      customNegativePrompt,
      aspectRatio: aspectRatio || "4:3",
      modelId,
      location,
      keyObjects,
      locationDetails,
      storyboardBeat,
      panelIndex,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Image API error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate image" },
      { status: 500 }
    );
  }
}
