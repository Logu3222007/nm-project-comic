export type ReadingDirection = "ltr" | "rtl" | "vertical"; // ltr = Western, rtl = Manga, vertical = Webtoon
export type PageLayoutTemplate = "single" | "grid-4" | "manga-dynamic" | "classic-6" | "cinematic-wide" | "webtoon-strip";
export type BubbleType = "speech" | "thought" | "whisper" | "shout" | "narration" | "radio" | "sfx";

export type CameraAngle =
  | "extreme-close-up"
  | "close-up"
  | "medium-shot"
  | "wide-shot"
  | "establishing-shot"
  | "low-angle"
  | "high-angle"
  | "dutch-angle"
  | "over-the-shoulder"
  | "bird-eye"
  | "side-angle"
  | "front-angle"
  | "back-angle"
  | "reaction-shot";

export interface SpeechBubble {
  id: string;
  type: BubbleType;
  text: string;
  speaker?: string;
  x: number; // percentage (0-100) of panel width
  y: number; // percentage (0-100) of panel height
  width?: number; // percentage of panel width
  fontSize?: number; // in pt
  tailX?: number; // target speaker position
  tailY?: number;
}

export interface PanelVisualDirection {
  environment: string;
  camera: CameraAngle;
  lighting: string;
  composition: string;
  characterAction: string;
  characterEmotions: Record<string, string>; // characterId -> emotion
  characterCostumes?: Record<string, string>; // characterId -> clothing note
  timeOfDay?: string;
  weather?: string;
  soundEffects?: string[];
  referenceCharacterIds?: string[];
  shotType?: string; // e.g. "establishing", "action-focus", "reaction-reverse", "detail cut-in", "climax"
  background?: string;
  keyObjects?: string[]; // props, vehicles, or items locked in this panel
  storyboardBeat?: string; // e.g. "establishing", "introduction", "conflict", "reaction", "action", "outcome"
  previousPanelAction?: string; // action continuing from previous panel
  nextPanelTease?: string; // narrative transition to next panel
  locationId?: string;
}

export interface ComicPanel {
  id: string;
  order: number;
  prompt: string;
  negativePrompt?: string;
  imageUrl?: string;
  aspectRatio: string; // e.g. "16:9", "1:1", "4:3", "9:16", "21:9"
  colSpan?: number; // 1 to 12
  rowSpan?: number;
  visualDirection: PanelVisualDirection;
  bubbles: SpeechBubble[];
  dialogue?: string;
  narration?: string;
  isGenerating?: boolean;
  generationError?: string;
  continuityNotes?: string[];
}

export interface ComicPage {
  id: string;
  pageNumber: number;
  title?: string;
  layoutTemplate: PageLayoutTemplate;
  panels: ComicPanel[];
  notes?: string;
  isCover?: boolean;
  coverData?: {
    title: string;
    subtitle?: string;
    issueNumber?: string;
    authorName?: string;
    artistName?: string;
    typographyStyle?: "editorial-serif" | "bold-comic" | "minimalist-sans" | "japanese-kanji";
  };
}

export interface Scene {
  id: string;
  sceneNumber: number;
  location: string;
  timeOfDay: string;
  weather?: string;
  synopsis: string;
  characterIds: string[];
  pages: ComicPage[];
  locationId?: string;
  keyObjects?: string[];
  emotionalArc?: string;
}

export interface Chapter {
  id: string;
  chapterNumber: number;
  title: string;
  summary: string;
  scenes: Scene[];
}

export interface LocationMemory {
  id: string;
  name: string;
  environment: string;
  background: string;
  lighting: string;
  weather?: string;
  atmosphere: string;
  keyFeatures?: string[];
}

export interface ImportantObjectMemory {
  id: string;
  name: string;
  category: "vehicle" | "weapon" | "tool" | "device" | "relic" | "clothing-item" | "prop";
  description: string;
  visualMarkers: string; // e.g. "cherry red paint, matte black tank, chrome twin exhaust"
  holder?: string;
}

export interface StoryMetadata {
  title: string;
  logline: string;
  premise: string;
  synopsis: string;
  genre: string[];
  targetAudience: string;
  tone: string;
  worldSetting: string;
  continuityRules: string[];
  locations?: Record<string, LocationMemory>;
  importantObjects?: Record<string, ImportantObjectMemory>;
}

export interface ComicProject {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  readingDirection: ReadingDirection;
  metadata: StoryMetadata;
  styleId: string;
  characterIds: string[];
  chapters: Chapter[];
  negativeConstraints: string[];
  version: number;
  coverImage?: string;
}
