import { NextResponse } from "next/server";
import { DEFAULT_MODELS } from "@/lib/constants";
import { ModelProviderConfig } from "@/types/model";

// In-memory / server-side model store
let serverModels: ModelProviderConfig[] = [...DEFAULT_MODELS];

export async function GET() {
  // Strip out any sensitive secrets before returning to client
  const safeModels = serverModels.map((m) => ({
    ...m,
    apiKeyConfigured: !!(m.isCustom ? m.apiKeyConfigured : process.env.GEMINI_API_KEY),
  }));

  return NextResponse.json({
    models: safeModels,
    geminiKeyConfigured: !!process.env.GEMINI_API_KEY,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { modelConfig, apiKey } = body;

    if (!modelConfig || !modelConfig.name) {
      return NextResponse.json({ error: "Invalid model configuration" }, { status: 400 });
    }

    const newModel: ModelProviderConfig = {
      ...modelConfig,
      id: modelConfig.id || `custom_model_${Date.now()}`,
      isCustom: true,
      apiKeyConfigured: !!apiKey,
    };

    const existingIdx = serverModels.findIndex((m) => m.id === newModel.id);
    if (existingIdx >= 0) {
      serverModels[existingIdx] = newModel;
    } else {
      serverModels.push(newModel);
    }

    return NextResponse.json({
      success: true,
      model: { ...newModel, apiKeyConfigured: !!apiKey },
    });
  } catch (error: any) {
    console.error("Models API error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update models" },
      { status: 500 }
    );
  }
}
