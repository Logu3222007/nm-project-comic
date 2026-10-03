export type ModelModality = "text" | "image" | "multimodal" | "vision";

export interface ModelProviderConfig {
  id: string;
  name: string;
  provider: "google-gemini" | "custom-endpoint" | "openai-compatible" | "stability-sd";
  modelName: string;
  modality: ModelModality;
  contextWindow: number;
  maxOutputTokens: number;
  supportsImageInput: boolean;
  supportsImageOutput: boolean;
  supportsStreaming: boolean;
  costPer1kTokens?: number;
  enabled: boolean;
  isCustom?: boolean;
  customEndpoint?: string;
  apiKeyConfigured?: boolean; // Secure flag, never sends actual secret to client
  defaultTemperature?: number;
  imageDimensions?: { width: number; height: number };
  systemPrompt?: string;
}

export interface ModelRegistryState {
  activeReasoningModel: string;
  activeImageModel: string;
  availableModels: ModelProviderConfig[];
}
