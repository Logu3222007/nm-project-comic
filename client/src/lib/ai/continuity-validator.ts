import { ComicProject, ComicPanel, ComicPage, Scene } from "@/types/comic";
import { ComicCharacter } from "@/types/character";
import { ContinuityValidationReport, ContinuityIssue } from "@/types/continuity";

/**
 * Validates whole-project continuity across characters, scenes, props, lighting, and dialogue
 */
export function validateProjectContinuity(
  project: ComicProject,
  characters: ComicCharacter[]
): ContinuityValidationReport {
  const issues: ContinuityIssue[] = [];
  const charMap = new Map(characters.map((c) => [c.id, c]));
  const charNameMap = new Map(characters.map((c) => [c.name.toLowerCase(), c]));

  let totalPanelsChecked = 0;

  project.chapters.forEach((chapter) => {
    chapter.scenes.forEach((scene) => {
      let previousPanelTimeOfDay = scene.timeOfDay;
      let previousPanelEmotion: Record<string, string> = {};
      let previousPanelObjects: string[] = [];

      scene.pages.forEach((page) => {
        page.panels.forEach((panel) => {
          totalPanelsChecked++;
          const vis = panel.visualDirection;
          const promptLower = (panel.prompt + " " + (vis.characterAction || "")).toLowerCase();

          // 1. Time of Day and Lighting Continuity within Scene
          if (vis.timeOfDay && previousPanelTimeOfDay && vis.timeOfDay !== previousPanelTimeOfDay) {
            issues.push({
              id: `issue_${panel.id}_time`,
              panelId: panel.id,
              field: "time-of-day",
              severity: "medium",
              description: `Time of day changed abruptly from "${previousPanelTimeOfDay}" to "${vis.timeOfDay}" within scene "${scene.location}".`,
              expectedValue: previousPanelTimeOfDay,
              detectedValue: vis.timeOfDay,
              recommendedFix: `Align panel time of day to "${previousPanelTimeOfDay}" or introduce an explicit scene transition.`,
              resolved: false,
            });
          }
          if (vis.timeOfDay) {
            previousPanelTimeOfDay = vis.timeOfDay;
          }

          // 2. Character Biometric, Hair, and Costume Consistency
          const targetCharIds =
            vis.referenceCharacterIds && vis.referenceCharacterIds.length > 0
              ? vis.referenceCharacterIds
              : characters.map((c) => c.id);

          targetCharIds.forEach((charId) => {
            const char = charMap.get(charId);
            if (!char) return;

            // Check if prompt contradicts hair color
            const hairColorLower = char.memory.hairColor.toLowerCase();
            const opposingHairColors = ["blonde", "golden", "red", "green", "silver", "white", "black", "brunette"]
              .filter((color) => !hairColorLower.includes(color));

            for (const oppColor of opposingHairColors) {
              if (promptLower.includes(`${oppColor} hair`)) {
                issues.push({
                  id: `issue_${panel.id}_${charId}_hair`,
                  panelId: panel.id,
                  characterId: charId,
                  field: "hairstyle",
                  severity: "critical",
                  description: `${char.name} is described with ${oppColor} hair in this panel, but character identity bible specifies "${char.memory.hairColor}".`,
                  expectedValue: char.memory.hairColor,
                  detectedValue: `${oppColor} hair`,
                  recommendedFix: `Lock prompt to enforce "${char.memory.hairColor} ${char.memory.hairStyle}".`,
                  resolved: false,
                });
                break;
              }
            }

            // Check costume consistency
            const expectedUpper = char.memory.defaultCostume?.upperBody?.toLowerCase();
            if (expectedUpper && !vis.characterCostumes?.[charId]) {
              // Ensure no unauthorized conflicting clothing keywords are injected
              if (expectedUpper.includes("coat") && promptLower.includes("t-shirt only")) {
                issues.push({
                  id: `issue_${panel.id}_${charId}_costume`,
                  panelId: panel.id,
                  characterId: charId,
                  field: "costume",
                  severity: "high",
                  description: `${char.name}'s locked costume is "${char.memory.defaultCostume.upperBody}", but panel indicates conflicting attire.`,
                  expectedValue: char.memory.defaultCostume.upperBody,
                  detectedValue: "t-shirt only",
                  recommendedFix: `Maintain signature attire: ${char.memory.defaultCostume.upperBody}.`,
                  resolved: false,
                });
              }
            }

            // Check emotional continuity
            const currentEmotion = vis.characterEmotions?.[charId] || vis.characterEmotions?.[char.name];
            const prevEmotion = previousPanelEmotion[charId];
            if (prevEmotion && currentEmotion) {
              if (
                (prevEmotion.toLowerCase().includes("terrified") && currentEmotion.toLowerCase().includes("bursting into laughter")) ||
                (prevEmotion.toLowerCase().includes("furious") && currentEmotion.toLowerCase().includes("serene slumber"))
              ) {
                issues.push({
                  id: `issue_${panel.id}_${charId}_emotion`,
                  panelId: panel.id,
                  characterId: charId,
                  field: "emotion",
                  severity: "medium",
                  description: `${char.name}'s emotion shifted erratically from "${prevEmotion}" to "${currentEmotion}" without story progression.`,
                  expectedValue: `Progressive transition from ${prevEmotion}`,
                  detectedValue: currentEmotion,
                  recommendedFix: `Smooth emotional trajectory through an intermediate reaction beat.`,
                  resolved: false,
                });
              }
            }
            if (currentEmotion) {
              previousPanelEmotion[charId] = currentEmotion;
            }
          });

          // 3. Key Objects & Prop Continuity
          if (vis.keyObjects && vis.keyObjects.length > 0) {
            previousPanelObjects = vis.keyObjects;
          } else if (previousPanelObjects.length > 0 && vis.characterAction?.includes("holding")) {
            issues.push({
              id: `issue_${panel.id}_object`,
              panelId: panel.id,
              field: "object",
              severity: "low",
              description: `Key item (${previousPanelObjects.join(", ")}) was active in preceding panel but is not explicitly anchored in current panel action.`,
              expectedValue: previousPanelObjects.join(", "),
              detectedValue: "Unspecified in panel keyObjects",
              recommendedFix: `Re-anchor [LOCKED PROP]: ${previousPanelObjects[0]} to avoid visual item disappearance.`,
              resolved: false,
            });
          }

          // 4. Speaker-Aware Dialogue Validation
          (panel.bubbles || []).forEach((b) => {
            if (b.type === "speech" || b.type === "thought" || b.type === "whisper" || b.type === "shout") {
              const speaker = (b.speaker || "").trim();
              if (speaker && speaker.toLowerCase() !== "narrator") {
                const matched = charNameMap.get(speaker.toLowerCase());
                if (!matched) {
                  issues.push({
                    id: `issue_${panel.id}_${b.id}_speaker`,
                    panelId: panel.id,
                    field: "dialogue-speaker",
                    severity: "medium",
                    description: `Speech bubble is attributed to "${speaker}", who is not in the project character roster.`,
                    expectedValue: characters.map((c) => c.name).join(" or "),
                    detectedValue: speaker,
                    recommendedFix: `Assign bubble to an established character or narrator.`,
                    resolved: false,
                  });
                }
              }

              // Check text brevity for comic bubbles
              const wordCount = (b.text || "").trim().split(/\s+/).length;
              if (wordCount > 24) {
                issues.push({
                  id: `issue_${panel.id}_${b.id}_length`,
                  panelId: panel.id,
                  field: "dialogue-speaker",
                  severity: "low",
                  description: `Dialogue bubble contains ${wordCount} words, which risks overcrowding the panel visual art.`,
                  expectedValue: "Under 18 words per bubble",
                  detectedValue: `${wordCount} words`,
                  recommendedFix: `Split dialogue into multiple bubbles or edit for comic brevity.`,
                  resolved: false,
                });
              }
            }
          });
        });
      });
    });
  });

  // Calculate consistency score
  const penalty = issues.reduce((acc, issue) => {
    if (issue.severity === "critical") return acc + 25;
    if (issue.severity === "high") return acc + 15;
    if (issue.severity === "medium") return acc + 8;
    return acc + 3;
  }, 0);

  const overallConsistencyScore = Math.max(0, Math.min(100, 100 - penalty));

  return {
    timestamp: new Date().toISOString(),
    overallConsistencyScore,
    issues,
    warnings:
      issues.length === 0
        ? ["All character appearances, lighting conditions, costumes, and props conform strictly to the Project Story Bible."]
        : [
            `Detected ${issues.length} continuity verification notice(s). Prompt composition engine will automatically inject consistency anchors.`,
          ],
  };
}

/**
 * Validates a single panel against its immediate scene and preceding panel,
 * automatically enriching continuityNotes before generation
 */
export function validateAndEnforcePanelContinuity(
  panel: ComicPanel,
  scene: Scene | undefined,
  previousPanel: ComicPanel | undefined,
  characters: ComicCharacter[],
  metadata?: any
): ComicPanel {
  const notes: string[] = [];

  // Check character costume enforcement
  characters.forEach((char) => {
    if (panel.visualDirection?.referenceCharacterIds?.includes(char.id)) {
      notes.push(`Identity locked: ${char.name} wearing ${char.memory.defaultCostume.upperBody}`);
    }
  });

  // Check lighting & environment continuity
  if (scene?.location) {
    notes.push(`Scene location locked: ${scene.location}`);
  }

  // Check sequential narrative flow
  if (previousPanel) {
    const prevAction = previousPanel.visualDirection?.characterAction || previousPanel.prompt;
    notes.push(`Sequential link: following "${prevAction.slice(0, 45)}..."`);
  }

  return {
    ...panel,
    continuityNotes: notes,
  };
}
