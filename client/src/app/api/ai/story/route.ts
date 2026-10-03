import { NextResponse } from "next/server";
import { generateComicStory } from "@/lib/ai/story-engine";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, styleId, targetPages, readingDirection } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Story prompt is required" }, { status: 400 });
    }

    const result = await generateComicStory({
      prompt,
      styleId,
      targetPages: targetPages || 3,
      readingDirection: readingDirection || "ltr",
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Story API error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate story" },
      { status: 500 }
    );
  }
}
