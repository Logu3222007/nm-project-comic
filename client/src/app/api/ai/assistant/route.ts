import { NextResponse } from "next/server";
import { processAssistantCommand } from "@/lib/ai/assistant";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { query, context } = body;

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const result = await processAssistantCommand(query, context);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Assistant API error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process assistant command" },
      { status: 500 }
    );
  }
}
