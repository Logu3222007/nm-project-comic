export interface CharacterMemory {
  faceShape: string;
  hairStyle: string;
  hairColor: string;
  eyeColor: string;
  eyeShape: string;
  skinTone: string;
  signatureFeatures: string[]; // e.g. "scar across left cheek", "silver spectacles"
  bodyType: string;
  heightCategory: string; // tall, medium, short
  defaultCostume: {
    upperBody: string;
    lowerBody: string;
    footwear: string;
    accessories: string[];
    colorPalette: string[];
  };
  expressions: Record<string, string>; // e.g. "intense detective gaze", "wry cynical smirk"
}

export interface CharacterReferenceSheet {
  frontViewUrl?: string;
  sideViewUrl?: string;
  backViewUrl?: string;
  threeQuarterViewUrl?: string;
  expressionSheetUrl?: string;
  poseSheetUrl?: string;
  clothingSheetUrl?: string;
}

export interface ComicCharacter {
  id: string; // e.g. "char_hero_001"
  projectId?: string;
  name: string;
  alias?: string;
  role: "protagonist" | "antagonist" | "deuteragonist" | "supporting" | "mentor" | "extra";
  ageCategory: string; // child, teen, young-adult, adult, elder
  personality: string[];
  backstory: string;
  memory: CharacterMemory;
  referenceSheet: CharacterReferenceSheet;
  referenceImages: string[];
  approvedPanelImages: string[]; // historical reference anchors for high consistency
  colorPalette: string[];
  stats?: {
    strength: number;
    speed: number;
    power: number;
    defense: number;
    aura: number;
  };
  soundFx?: string;
  quote?: string;
  comicIssueTitle?: string;
  auraColor?: string;
  createdAt: string;
  updatedAt: string;
}
