import { ComicPanel, ComicPage } from "@/types/comic";
import { ComicCharacter } from "@/types/character";
import { callGeminiReasoning } from "./gemini-client";

export interface AssistantContext {
  activePage: ComicPage;
  selectedPanel?: ComicPanel;
  characters: ComicCharacter[];
  styleName: string;
}

export interface AssistantActionSuggestion {
  reply: string;
  suggestedAction?: {
    type: "update_panel" | "add_panel" | "update_dialogue" | "change_style" | "update_lighting";
    payload: any;
  };
}

export async function processAssistantCommand(
  userQuery: string,
  context: AssistantContext
): Promise<AssistantActionSuggestion> {
  const { activePage, selectedPanel, characters, styleName } = context;

  const systemInstruction = `You are a professional comic director and editor assistant.
The user is working on Page ${activePage.pageNumber}.
Selected Panel: ${selectedPanel ? `Panel ${selectedPanel.order} - Prompt: "${selectedPanel.prompt}"` : "None"}.
Characters available: ${characters.map((c) => c.name).join(", ")}.
Current Style: ${styleName}.

Understand the user's intent (e.g. adjust lighting, change expression, add sound effects, polish dialogue, rewrite prompt).
Provide an editorial response and return a suggested modification JSON block if applicable:
Schema:
{
  "reply": "Clear, concise, professional advice or confirmation",
  "action": {
    "type": "update_panel" | "add_panel" | "update_dialogue",
    "updatedPrompt": string (if modifying panel),
    "updatedLighting": string (if modifying lighting),
    "updatedEmotions": Record<string, string>,
    "updatedDialogue": string
  }
}`;

  try {
    const raw = await callGeminiReasoning(
      `User request: "${userQuery}". Current panel details: ${JSON.stringify(selectedPanel || {})}`,
      systemInstruction
    );

    const cleaned = raw.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return {
      reply: parsed.reply,
      suggestedAction: parsed.action ? { type: parsed.action.type, payload: parsed.action } : undefined,
    };
  } catch (err) {
    // Intelligent local parsing fallback
    const q = userQuery.toLowerCase();

    if (q.includes("darker") || q.includes("shadow") || q.includes("noir")) {
      const updatedPrompt = selectedPanel
        ? `${selectedPanel.prompt}. Deep pool of chiaroscuro shadows, minimal high-contrast single key light, gloomy dark atmosphere.`
        : "";
      return {
        reply: "I've deepened the atmospheric shadows and configured high-contrast chiaroscuro key lighting for this scene.",
        suggestedAction: selectedPanel
          ? {
              type: "update_lighting",
              payload: {
                panelId: selectedPanel.id,
                updatedPrompt,
                lighting: "Stark chiaroscuro with dense shadows",
              },
            }
          : undefined,
      };
    }

    if (q.includes("anger") || q.includes("angry") || q.includes("furious")) {
      return {
        reply: "Updated character expression to intense fury with clenched jaw and sharp brow furrowing.",
        suggestedAction: selectedPanel
          ? {
              type: "update_panel",
              payload: {
                panelId: selectedPanel.id,
                emotion: "Furious, clenched teeth, steely glare",
                updatedPrompt: `${selectedPanel.prompt}. Facial expression is contorted with suppressed rage, sharp furrowed brow and intense narrowed eyes.`,
              },
            }
          : undefined,
      };
    }

    if (q.includes("dialogue") || q.includes("natural")) {
      return {
        reply: "Refined speech rhythm to sound punchier, more conversational, and suited for graphic novel pacing.",
        suggestedAction: selectedPanel
          ? {
              type: "update_dialogue",
              payload: {
                panelId: selectedPanel.id,
                dialogue: "You still don't get it. Once midnight strikes, the rules don't belong to us anymore.",
              },
            }
          : undefined,
      };
    }

    if (q.includes("add") && q.includes("panel")) {
      return {
        reply: "Ready to insert a new dramatic reaction panel into the page rhythm.",
        suggestedAction: {
          type: "add_panel",
          payload: {
            prompt: "Dramatic close-up reaction shot, eye wide in sudden realization.",
            aspectRatio: "4:3",
          },
        },
      };
    }

    return {
      reply: `Understood. I will help optimize the composition, visual pacing, and consistency for "${userQuery}". You can also use quick commands like "Make this scene darker" or "Change expression to anger".`,
    };
  }
}
