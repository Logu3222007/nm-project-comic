import { NextResponse } from "next/server";
import {
  scanAndSanitizePrompt,
  getSecurityHealthStatus,
  getSecurityAuditLogs,
} from "@/lib/security/securityService";

export async function POST(req: Request) {
  try {
    let prompt = "";
    try {
      const body = await req.json();
      prompt = body?.prompt || "";
    } catch {
      const text = await req.text();
      prompt = text;
    }

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt string is required" }, { status: 400 });
    }

    const result = scanAndSanitizePrompt(prompt);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Security scan API error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to scan prompt" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const health = getSecurityHealthStatus();
    const logs = getSecurityAuditLogs();
    return NextResponse.json({ health, logs });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch security health" }, { status: 500 });
  }
}
