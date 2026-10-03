import { NextResponse } from "next/server";
import { validateProjectContinuity } from "@/lib/ai/continuity-validator";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { project, characters } = body;

    if (!project || !characters) {
      return NextResponse.json({ error: "Project and characters are required" }, { status: 400 });
    }

    const report = validateProjectContinuity(project, characters);
    return NextResponse.json(report);
  } catch (error: any) {
    console.error("Continuity API error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to validate continuity" },
      { status: 500 }
    );
  }
}
