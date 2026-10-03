import { ComicCharacter } from "@/types/character";
import { ArtStylePreset } from "@/types/style";
import { PanelVisualDirection } from "@/types/comic";
import { DEFAULT_NEGATIVE_CONSTRAINTS } from "../constants";

export interface ComposePromptParams {
  type: "panel" | "page" | "character-sheet" | "cover" | "environment";
  scenePrompt: string;
  visualDirection?: PanelVisualDirection;
  characters?: ComicCharacter[];
  style: ArtStylePreset;
  previousPanelContext?: string;
  continuityRules?: string[];
  customNegativePrompt?: string[];
  aspectRatio?: string;
  locationDetails?: {
    name?: string;
    environment?: string;
    background?: string;
    lighting?: string;
    weather?: string;
    atmosphere?: string;
  };
  keyObjects?: string[];
  storyboardBeat?: string;
}

export function composeComicPrompt(params: ComposePromptParams): {
  positivePrompt: string;
  negativePrompt: string;
  styleKeywords: string[];
} {
  const {
    type,
    scenePrompt,
    visualDirection,
    characters = [],
    style,
    previousPanelContext,
    continuityRules = [],
    customNegativePrompt = [],
    locationDetails,
    keyObjects = [],
    storyboardBeat,
  } = params;

  const parts: string[] = [];

  // 1. Master Comic Art Style & Medium Directive
  parts.push(`[ART STYLE: ${style.name}]`);
  parts.push(
    `Masterpiece professional graphic novel panel illustration, ${style.promptKeywords.join(", ")}, publication quality comic art, crisp ink lines, intentional color grading`
  );

  // 2. Storyboard Beat & Cinematic Camera Composition
  const beat = storyboardBeat || visualDirection?.storyboardBeat;
  if (beat) {
    parts.push(`[STORYBOARD BEAT: ${beat.toUpperCase()}]`);
  }

  if (visualDirection?.camera) {
    const camAngle = visualDirection.camera.replace(/-/g, " ");
    parts.push(`[CINEMATIC CAMERA]: ${camAngle} angle`);
  }

  if (visualDirection?.composition) {
    parts.push(`[COMPOSITION]: ${visualDirection.composition}`);
  }

  if (visualDirection?.shotType) {
    parts.push(`[SHOT TYPE]: ${visualDirection.shotType}`);
  }

  // 3. Scene Setting & Environment Continuity
  const envDesc = visualDirection?.environment || locationDetails?.environment;
  if (envDesc) {
    parts.push(`[ENVIRONMENT & SCENE]: ${envDesc}`);
  }

  const bgDesc = visualDirection?.background || locationDetails?.background;
  if (bgDesc) {
    parts.push(`[BACKGROUND DETAILS]: ${bgDesc}`);
  }

  // 4. Lighting & Atmospheric Continuity
  const lightingDesc = visualDirection?.lighting || locationDetails?.lighting;
  if (lightingDesc) {
    parts.push(`[LIGHTING]: ${lightingDesc}`);
  }

  const timeOfDay = visualDirection?.timeOfDay || locationDetails?.atmosphere;
  if (timeOfDay) {
    parts.push(`[TIME OF DAY]: ${timeOfDay}`);
  }

  const weather = visualDirection?.weather || locationDetails?.weather;
  if (weather) {
    parts.push(`[WEATHER/ATMOSPHERE]: ${weather}`);
  }

  // 5. Subject & Scene Narrative Action
  parts.push(`[PANEL SCENE]: ${scenePrompt}`);

  if (visualDirection?.characterAction) {
    parts.push(`[ACTION & MOVEMENT]: ${visualDirection.characterAction}`);
  }

  // 6. Character Biometric & Costume Continuity Lock
  if (characters.length > 0) {
    // If specific characters are referenced in this panel, prioritize them; otherwise use available characters
    const targetChars =
      visualDirection?.referenceCharacterIds && visualDirection.referenceCharacterIds.length > 0
        ? characters.filter((c) => visualDirection.referenceCharacterIds!.includes(c.id))
        : characters.slice(0, 2);

    const charDescriptions = (targetChars.length > 0 ? targetChars : characters.slice(0, 1)).map((c) => {
      const mem = c.memory;
      const emotion =
        visualDirection?.characterEmotions?.[c.id] ||
        visualDirection?.characterEmotions?.[c.name] ||
        "focused intentional expression";

      const costumeOverride = visualDirection?.characterCostumes?.[c.id];
      const upper = mem.defaultCostume?.upperBody || "signature jacket";
      const lower = mem.defaultCostume?.lowerBody || "tailored trousers";
      const footwear = mem.defaultCostume?.footwear ? `, shoes: ${mem.defaultCostume.footwear}` : "";
      const accessories =
        mem.defaultCostume?.accessories && mem.defaultCostume.accessories.length > 0
          ? ` (accessories: ${mem.defaultCostume.accessories.join(", ")})`
          : "";
      const costumeText = costumeOverride || `${upper} and ${lower}${footwear}${accessories}`;

      const paletteText =
        mem.defaultCostume?.colorPalette && mem.defaultCostume.colorPalette.length > 0
          ? ` [Costume Colors: ${mem.defaultCostume.colorPalette.join(", ")}]`
          : "";

      const features =
        mem.signatureFeatures && mem.signatureFeatures.length > 0
          ? `; Key visual traits: ${mem.signatureFeatures.join(", ")}`
          : "";

      return `[CHARACTER IDENTITY LOCK - ${c.name}]: ${c.ageCategory || "adult"} ${c.role || "hero"}, ${mem.bodyType || "proportional"} build, ${mem.faceShape || "defined face"}, ${mem.hairColor} ${mem.hairStyle} hair, ${mem.eyeColor} ${mem.eyeShape || "expressive"} eyes, ${mem.skinTone || "natural"} skin${features}. MUST WEAR: ${costumeText}${paletteText}. Current facial expression: ${emotion}.`;
    });

    parts.push(charDescriptions.join(" "));
  }

  // 7. Key Objects & Prop Consistency Memory
  const allObjects = Array.from(new Set([...keyObjects, ...(visualDirection?.keyObjects || [])]));
  if (allObjects.length > 0) {
    parts.push(`[LOCKED PROPS & OBJECTS]: ${allObjects.join("; ")}. Keep visual design, color, and materials strictly identical to established design.`);
  }

  // 8. Panel-to-Panel Sequential Narrative Flow
  const priorAction = visualDirection?.previousPanelAction || previousPanelContext;
  if (priorAction) {
    parts.push(
      `[SEQUENTIAL NARRATIVE CONTINUITY]: Directly continuing from prior moment: "${priorAction}". Maintain spatial consistency and unbroken character trajectory.`
    );
  }

  // 9. Sound Effects & Onomatopoeia Visual Direction
  if (visualDirection?.soundEffects && visualDirection.soundEffects.length > 0) {
    parts.push(`[ENVIRONMENTAL SOUND VIBE]: ${visualDirection.soundEffects.join(", ")} (visual atmosphere only)`);
  }

  // 10. Mandatory Continuity Rules from Story Bible
  if (continuityRules.length > 0) {
    parts.push(`[CONTINUITY ENFORCEMENT]: ${continuityRules.slice(0, 3).join("; ")}`);
  }

  // 11. Rigorous Comic Negative Constraints
  const comicSpecificNegatives = [
    "speech bubbles",
    "word balloons",
    "text captions",
    "dialogue text",
    "watermarks",
    "artist signature",
    "misspelled text",
    "deformed faces",
    "mutated extra fingers",
    "missing limbs",
    "distorted anatomy",
    "cloned duplicate characters in same frame",
    "random costume changes",
    "inconsistent clothing colors",
    "blurry amateur render",
    "oversaturated noise",
  ];

  const combinedNegatives = Array.from(
    new Set([
      ...comicSpecificNegatives,
      ...DEFAULT_NEGATIVE_CONSTRAINTS,
      ...style.negativeKeywords,
      ...customNegativePrompt,
    ])
  );

  return {
    positivePrompt: parts.join(". "),
    negativePrompt: combinedNegatives.join(", "),
    styleKeywords: style.promptKeywords,
  };
}
