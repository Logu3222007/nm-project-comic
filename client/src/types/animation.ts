export type AnimationCategory =
  | "2d-sakuga"
  | "3d-cinematic"
  | "spider-verse"
  | "ghibli-watercolor"
  | "cyberpunk-cel"
  | "dark-gothic"
  | "retro-cartoon"
  | "kawaii-chibi";

export interface ModelAnimationPreset {
  id: string;
  name: string;
  category: AnimationCategory;
  tagline: string;
  badge: string;
  icon: string;
  description: string;
  frameRate: string;
  cameraMovement: string;
  lightingPacing: string;
  motionKeywords: string[];
  autoPromptTemplate: string;
  suggestedActionPrompts: {
    title: string;
    description: string;
    prompt: string;
  }[];
  accentColor: string;
  previewGradient: string;
}
