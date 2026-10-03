export type VisualCategory =
  | "anime"
  | "manga"
  | "western-comic"
  | "realistic"
  | "illustration-fine-art";

export interface StyleMixingSettings {
  styleStrength: number; // 0-100
  characterStyle: string; // e.g. "classic-manga", "cinematic-anime", "graphic-ink"
  environmentStyle: string; // e.g. "detailed-cityscape", "watercolor-wash", "high-contrast-noir"
  lineArtStrength: number; // 0-100
  shadingStrength: number; // 0-100
  colorLevel: number; // 0 (B&W) - 100 (Full vibrant saturation)
  realismLevel: number; // 0 (Stylized cartoon) - 100 (Cinematic photorealism)
  textureLevel: number; // 0 (Clean digital vector) - 100 (Rough paper grain & screentone)
  detailLevel: number; // 0 (Minimalist) - 100 (Hyper-detailed ink hatch)
}

export interface ArtStylePreset {
  id: string;
  name: string;
  category: VisualCategory;
  description: string;
  previewUrl: string;
  mixing: StyleMixingSettings;
  promptKeywords: string[];
  negativeKeywords: string[];
  screentoneSupported: boolean;
  idealAspectRatios: string[];
}
