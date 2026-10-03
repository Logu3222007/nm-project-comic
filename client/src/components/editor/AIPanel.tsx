"use client";

import React, { useState } from "react";
import { ComicPanel, ComicPage, CameraAngle } from "@/types/comic";
import { ComicCharacter } from "@/types/character";
import { ArtStylePreset } from "@/types/style";
import { ContinuityValidationReport } from "@/types/continuity";
import { MODEL_ANIMATION_PRESETS } from "@/lib/constants/animations";
import { ModelAnimationPreset } from "@/types/animation";
import {
  Sparkles,
  Sliders,
  Users,
  ShieldCheck,
  Bot,
  RefreshCw,
  Camera,
  Sun,
  Palette,
  AlertCircle,
  CheckCircle2,
  Send,
  Zap,
  Film,
  Play,
  ArrowRight,
  Flame,
} from "lucide-react";

interface AIPanelProps {
  selectedPanel: ComicPanel | null;
  activePage: ComicPage;
  characters: ComicCharacter[];
  style: ArtStylePreset;
  onUpdatePanel: (updated: ComicPanel) => void;
  onRegeneratePanel: (panel: ComicPanel) => void;
  continuityReport: ContinuityValidationReport | null;
  onRunContinuityCheck: () => void;
  isGenerating?: boolean;
}

export function AIPanel({
  selectedPanel,
  activePage,
  characters,
  style,
  onUpdatePanel,
  onRegeneratePanel,
  continuityReport,
  onRunContinuityCheck,
  isGenerating,
}: AIPanelProps) {
  const [activeTab, setActiveTab] = useState<
    "prompt" | "animations" | "characters" | "continuity" | "assistant"
  >("prompt");

  const [selectedAnimation, setSelectedAnimation] = useState<ModelAnimationPreset>(
    MODEL_ANIMATION_PRESETS[0]
  );
  const [autoPromptNotification, setAutoPromptNotification] = useState<string | null>(null);

  const [assistantMessages, setAssistantMessages] = useState<{ sender: "user" | "ai"; text: string }[]>([
    {
      sender: "ai",
      text: "Welcome to ComicCraft Studio! Select any model animation above or type below. When you choose an animation model, an auto-prompt will be loaded onto this chat board instantly.",
    },
  ]);
  const [assistantInput, setAssistantInput] = useState("");
  const [isAssistantThinking, setIsAssistantThinking] = useState(false);

  // Triggered when user picks any model animation
  const handleSelectModelAnimation = (anim: ModelAnimationPreset) => {
    setSelectedAnimation(anim);

    // Build the dynamic auto-prompt
    const characterContext =
      characters.length > 0
        ? `featuring ${characters[0].name} (${characters[0].memory.defaultCostume.upperBody})`
        : "";

    const fullAutoPrompt = `${anim.autoPromptTemplate} ${characterContext} ${
      selectedPanel?.visualDirection.lighting ? `Lighting: ${selectedPanel.visualDirection.lighting}.` : ""
    } Camera: ${selectedPanel?.visualDirection.camera || "dynamic-shot"}.`.trim();

    // Auto-select onto the Chat Board input
    setAssistantInput(fullAutoPrompt);

    // If a panel is currently selected, also update its prompt & visual direction
    if (selectedPanel) {
      onUpdatePanel({
        ...selectedPanel,
        prompt: fullAutoPrompt,
        visualDirection: {
          ...selectedPanel.visualDirection,
          environment: selectedPanel.visualDirection.environment || anim.tagline,
          characterAction: anim.motionKeywords[0] || selectedPanel.visualDirection.characterAction,
        },
      });
    }

    // Set notification badge
    setAutoPromptNotification(`Auto-prompt loaded for ${anim.name}`);
    setTimeout(() => setAutoPromptNotification(null), 3000);

    // Add assistant feedback message
    setAssistantMessages((prev) => [
      ...prev,
      {
        sender: "ai",
        text: `⚡ Model Animation switched to "${anim.name}". I've selected the auto-prompt with ${anim.frameRate} pacing and ${anim.cameraMovement}.`,
      },
    ]);
  };

  const handleAssistantSend = async () => {
    if (!assistantInput.trim() || isAssistantThinking) return;

    const userText = assistantInput;
    setAssistantInput("");
    setAssistantMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setIsAssistantThinking(true);

    try {
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: userText,
          context: {
            activePage,
            selectedPanel: selectedPanel || undefined,
            characters,
            styleName: style.name,
            animationModel: selectedAnimation.name,
          },
        }),
      });

      const data = await res.json();
      setAssistantMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: data.reply || `Direction aligned with ${selectedAnimation.name} animation pacing!`,
        },
      ]);

      if (data.suggestedAction && selectedPanel) {
        if (data.suggestedAction.type === "update_lighting" && data.suggestedAction.payload) {
          onUpdatePanel({
            ...selectedPanel,
            prompt: data.suggestedAction.payload.updatedPrompt || selectedPanel.prompt,
            visualDirection: {
              ...selectedPanel.visualDirection,
              lighting: data.suggestedAction.payload.lighting || selectedPanel.visualDirection.lighting,
            },
          });
        } else if (data.suggestedAction.type === "update_panel" && data.suggestedAction.payload) {
          onUpdatePanel({
            ...selectedPanel,
            prompt: data.suggestedAction.payload.updatedPrompt || selectedPanel.prompt,
          });
        }
      }
    } catch (err) {
      setAssistantMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `Applied "${selectedAnimation.name}" kinetic direction and choreography to your comic scene.`,
        },
      ]);
    } finally {
      setIsAssistantThinking(false);
    }
  };

  const cameraAngles: CameraAngle[] = [
    "extreme-close-up",
    "close-up",
    "medium-shot",
    "wide-shot",
    "establishing-shot",
    "low-angle",
    "high-angle",
    "dutch-angle",
  ];

  return (
    <aside className="w-80 lg:w-96 border-l border-[#D8D3CA] bg-[#FAF8F5] flex flex-col h-full z-20 text-[#171717] select-none">
      {/* Top Header Tabs */}
      <div className="flex items-center border-b border-[#D8D3CA] bg-[#EBE6DE]/50 p-1 text-xs">
        <button
          onClick={() => setActiveTab("prompt")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md font-medium transition-all ${
            activeTab === "prompt"
              ? "bg-[#FFFFFF] text-[#171717] shadow-sm font-semibold"
              : "text-[#77736C] hover:text-[#171717]"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Prompt</span>
        </button>

        <button
          onClick={() => setActiveTab("animations")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md font-medium transition-all ${
            activeTab === "animations"
              ? "bg-[#FFFFFF] text-[#171717] shadow-sm font-semibold"
              : "text-[#77736C] hover:text-[#171717]"
          }`}
        >
          <Film className="w-3.5 h-3.5 text-[#00E5FF]" />
          <span>Animate</span>
        </button>

        <button
          onClick={() => setActiveTab("characters")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md font-medium transition-all ${
            activeTab === "characters"
              ? "bg-[#FFFFFF] text-[#171717] shadow-sm font-semibold"
              : "text-[#77736C] hover:text-[#171717]"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Cast</span>
        </button>

        <button
          onClick={() => setActiveTab("continuity")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md font-medium transition-all ${
            activeTab === "continuity"
              ? "bg-[#FFFFFF] text-[#171717] shadow-sm font-semibold"
              : "text-[#77736C] hover:text-[#171717]"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#B84A39]" />
          <span>Continuity</span>
        </button>

        <button
          onClick={() => setActiveTab("assistant")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md font-medium transition-all ${
            activeTab === "assistant"
              ? "bg-[#FFFFFF] text-[#171717] shadow-sm font-semibold"
              : "text-[#77736C] hover:text-[#171717]"
          }`}
        >
          <Bot className="w-3.5 h-3.5 text-[#FF2A8D]" />
          <span>Director</span>
        </button>
      </div>

      {/* Model Animations Quick Bar (Always accessible on Top of AIPanel) */}
      <div className="px-3 py-2 bg-[#FAF6ED] border-b border-[#D8D3CA]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold text-[#77736C] uppercase tracking-wider flex items-center gap-1">
            <Zap className="w-3 h-3 text-[#B84A39]" />
            Model Animations & Auto-Prompt
          </span>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800 font-bold">
            {selectedAnimation.badge}
          </span>
        </div>

        {/* Scrollable Model Animation Pill Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {MODEL_ANIMATION_PRESETS.map((anim) => (
            <button
              key={anim.id}
              onClick={() => handleSelectModelAnimation(anim)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                selectedAnimation.id === anim.id
                  ? "bg-[#171717] text-[#FAF8F5] shadow-sm ring-1 ring-[#00E5FF]"
                  : "bg-white border border-[#D8D3CA] text-[#77736C] hover:text-[#171717] hover:border-[#171717]"
              }`}
            >
              <span>{anim.badge}</span>
            </button>
          ))}
        </div>

        {autoPromptNotification && (
          <div className="mt-1 text-[10px] text-cyan-800 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded flex items-center gap-1 animate-pulse">
            <CheckCircle2 className="w-3 h-3 text-cyan-600" />
            <span>{autoPromptNotification} on Chat Board!</span>
          </div>
        )}
      </div>

      {/* Tab 1: Panel Prompt Composer */}
      {activeTab === "prompt" && (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5 text-xs">
          {selectedPanel ? (
            <>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-xs text-[#171717]">
                    Panel #{selectedPanel.order} Composition
                  </span>
                  <span className="font-mono text-[10px] text-[#77736C] px-1.5 py-0.5 rounded bg-[#EBE6DE]">
                    {selectedPanel.aspectRatio}
                  </span>
                </div>
                <textarea
                  value={selectedPanel.prompt}
                  onChange={(e) =>
                    onUpdatePanel({ ...selectedPanel, prompt: e.target.value })
                  }
                  className="w-full bg-[#FFFFFF] border border-[#D8D3CA] rounded-md p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#171717] resize-none leading-relaxed"
                  rows={4}
                  placeholder="Describe scene action, character posture, focal point..."
                />
              </div>

              {/* Camera Angle Selector */}
              <div>
                <label className="font-medium text-[#77736C] mb-1.5 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-[#B84A39]" />
                  <span>Cinematic Camera Angle</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {cameraAngles.map((cam) => {
                    const isSelected = selectedPanel.visualDirection.camera === cam;
                    return (
                      <button
                        key={cam}
                        onClick={() =>
                          onUpdatePanel({
                            ...selectedPanel,
                            visualDirection: {
                              ...selectedPanel.visualDirection,
                              camera: cam,
                            },
                          })
                        }
                        className={`px-2 py-1.5 rounded text-[11px] font-sans text-left capitalize border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#171717] text-[#FAF8F5] border-[#171717] font-semibold"
                            : "bg-[#FFFFFF] border-[#D8D3CA] text-[#77736C] hover:border-[#171717] hover:text-[#171717]"
                        }`}
                      >
                        {cam.replace("-", " ")}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Lighting & Atmosphere */}
              <div>
                <label className="font-medium text-[#77736C] mb-1.5 flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-[#B84A39]" />
                  <span>Lighting & Atmosphere</span>
                </label>
                <input
                  type="text"
                  value={selectedPanel.visualDirection.lighting || ""}
                  onChange={(e) =>
                    onUpdatePanel({
                      ...selectedPanel,
                      visualDirection: {
                        ...selectedPanel.visualDirection,
                        lighting: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g. Chiaroscuro streetlamp shadows, neon rain glow"
                  className="w-full bg-[#FFFFFF] border border-[#D8D3CA] rounded p-2 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                />
              </div>

              {/* Active Art Style & Animation Indicator */}
              <div className="p-3 bg-[#EBE6DE]/40 rounded-lg border border-[#D8D3CA] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#77736C]">Active Art Style</span>
                  <span className="font-semibold text-[#171717]">{style.name}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-[#D8D3CA]">
                  <span className="font-medium text-[#77736C]">Animation Model</span>
                  <span className="font-bold text-[#00E5FF] bg-black px-1.5 py-0.5 rounded text-[10px]">
                    {selectedAnimation.badge}
                  </span>
                </div>
              </div>

              {/* Generate / Regenerate Action Button */}
              <div className="mt-auto pt-2">
                <button
                  onClick={() => onRegeneratePanel(selectedPanel)}
                  disabled={isGenerating}
                  className="w-full py-2.5 rounded-md bg-[#171717] hover:bg-[#2A2927] text-[#FAF8F5] font-medium shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#00E5FF]" />
                      <span>Synthesizing Illustration...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#00E5FF]" />
                      <span>Render Panel with Multimodal AI</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center text-[#77736C] p-4">
              <Sliders className="w-8 h-8 text-[#A8A297] mb-2" />
              <div className="font-medium text-[#171717] mb-1">No Panel Selected</div>
              <div className="text-[11px]">
                Click on any panel in the comic canvas to adjust prompt composition, camera framing, and lighting.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Model Animations Browser */}
      {activeTab === "animations" && (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-[#171717] uppercase tracking-wider">
              Choose Model Animation
            </span>
            <span className="text-[10px] text-[#00E5FF] bg-black font-bold px-2 py-0.5 rounded">
              Auto-Select Enabled
            </span>
          </div>
          <p className="text-[11px] text-[#77736C]">
            Selecting an animation engine automatically generates and selects the prompt into the chat board.
          </p>

          <div className="space-y-3 mt-1">
            {MODEL_ANIMATION_PRESETS.map((anim) => {
              const isSelected = selectedAnimation.id === anim.id;
              return (
                <div
                  key={anim.id}
                  onClick={() => handleSelectModelAnimation(anim)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-white border-[#171717] shadow-md ring-2 ring-[#00E5FF]"
                      : "bg-[#FFFFFF]/70 border-[#D8D3CA] hover:border-[#171717]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-[#171717] flex items-center gap-1.5">
                      <span>{anim.badge}</span>
                    </span>
                    {isSelected && (
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Selected
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-[#77736C] mb-2 leading-relaxed">
                    {anim.description}
                  </p>

                  <div className="bg-[#FAF8F5] p-2 rounded border border-[#EBE6DE] space-y-1 font-mono text-[10px] text-[#77736C]">
                    <div>
                      <strong className="text-[#171717]">Framerate:</strong> {anim.frameRate}
                    </div>
                    <div>
                      <strong className="text-[#171717]">Camera:</strong> {anim.cameraMovement}
                    </div>
                  </div>

                  {/* Quick Action Suggested Prompts */}
                  <div className="mt-2.5 pt-2 border-t border-[#EBE6DE] space-y-1.5">
                    <span className="text-[10px] font-bold text-[#77736C]">Preset Action Prompts:</span>
                    <div className="flex flex-wrap gap-1">
                      {anim.suggestedActionPrompts.map((act, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAnimation(anim);
                            setAssistantInput(act.prompt);
                            if (selectedPanel) {
                              onUpdatePanel({ ...selectedPanel, prompt: act.prompt });
                            }
                            setAutoPromptNotification(`Selected: "${act.title}"`);
                            setActiveTab("assistant");
                          }}
                          className="px-2 py-0.5 rounded bg-[#FAF6ED] hover:bg-[#171717] hover:text-white border border-[#D8D3CA] text-[10px] text-[#171717] transition-colors cursor-pointer"
                        >
                          + {act.title}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Character Memory & Consistency Anchors */}
      {activeTab === "characters" && (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#171717]">Character Consistency Engine</span>
            <span className="text-[10px] text-[#B84A39] font-medium bg-[#F6EDE8] px-2 py-0.5 rounded">
              Active Memory
            </span>
          </div>
          <p className="text-[11px] text-[#77736C]">
            These persistent biometric and costume profiles are automatically injected into every panel generation prompt.
          </p>

          <div className="flex flex-col gap-3">
            {characters.map((char) => (
              <div
                key={char.id}
                className="bg-[#FFFFFF] border border-[#D8D3CA] rounded-lg p-3 shadow-xs"
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <img
                    src={
                      char.referenceImages[0] ||
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
                    }
                    alt={char.name}
                    className="w-10 h-10 rounded-full object-cover border border-[#D8D3CA]"
                  />
                  <div>
                    <div className="font-bold text-[#171717]">{char.name}</div>
                    <div className="text-[10px] text-[#77736C] capitalize">
                      {char.role} • {char.ageCategory}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px] border-t border-[#EBE6DE] pt-2 text-[#77736C]">
                  <div>
                    <span className="font-semibold text-[#171717]">Costume: </span>
                    {char.memory.defaultCostume.upperBody}
                  </div>
                  <div>
                    <span className="font-semibold text-[#171717]">Signatures: </span>
                    {char.memory.signatureFeatures.join(", ")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Continuity Check Engine */}
      {activeTab === "continuity" && (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#171717]">Continuity Validator</span>
            <button
              onClick={onRunContinuityCheck}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#171717] text-[#FAF8F5] text-[11px] hover:bg-[#2A2927] transition-colors"
            >
              <RefreshCw className="w-3 h-3 text-[#00E5FF]" />
              <span>Verify Now</span>
            </button>
          </div>

          {continuityReport ? (
            <div className="space-y-3">
              <div className="bg-[#FFFFFF] border border-[#D8D3CA] rounded-lg p-3 text-center">
                <div className="text-[11px] text-[#77736C] uppercase tracking-wider mb-1">
                  Overall Continuity Index
                </div>
                <div className="text-3xl font-black font-mono text-[#B84A39]">
                  {continuityReport.overallConsistencyScore}%
                </div>
                <div className="w-full bg-[#EBE6DE] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    style={{ width: `${continuityReport.overallConsistencyScore}%` }}
                    className="h-full bg-[#B84A39] rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-[#FFFFFF] border border-[#D8D3CA] rounded-lg text-center text-[#77736C]">
              <ShieldCheck className="w-8 h-8 text-[#B84A39] mx-auto mb-2" />
              <p className="font-medium text-[#171717] mb-1">Continuity Audit Ready</p>
              <button
                onClick={onRunContinuityCheck}
                className="mt-2 px-3 py-1.5 rounded bg-[#171717] text-[#FAF8F5] font-medium hover:bg-[#2A2927] transition-colors"
              >
                Start Verification
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: AI Comic Director Chat Board */}
      {activeTab === "assistant" && (
        <div className="flex-1 flex flex-col h-full overflow-hidden text-xs">
          {/* Active Model Animation Badge Bar */}
          <div className="p-2.5 bg-[#FAF6ED] border-b border-[#D8D3CA] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span className="font-bold text-[#171717] text-[11px]">Chat Board</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black text-[#00E5FF] font-bold">
              {selectedAnimation.badge}
            </span>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {assistantMessages.map((msg, i) => (
              <div
                key={i}
                className={`p-2.5 rounded-lg text-xs leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-[#171717] text-[#FAF8F5] ml-6 shadow-sm"
                    : "bg-[#FFFFFF] text-[#171717] border border-[#D8D3CA] mr-4 shadow-xs font-serif"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {isAssistantThinking && (
              <div className="bg-[#FFFFFF] text-[#77736C] border border-[#D8D3CA] p-2 rounded-lg text-[11px] flex items-center gap-1.5 w-fit">
                <RefreshCw className="w-3 h-3 animate-spin text-[#00E5FF]" />
                <span>Director is refining animation choreography...</span>
              </div>
            )}
          </div>

          {/* Animation Action Quick Triggers */}
          <div className="p-2 border-t border-[#E8E4DC] flex gap-1.5 overflow-x-auto bg-[#FAF8F5]">
            {selectedAnimation.suggestedActionPrompts.map((act, idx) => (
              <button
                key={idx}
                onClick={() => setAssistantInput(act.prompt)}
                className="px-2 py-1 rounded bg-[#FFFFFF] border border-[#D8D3CA] hover:border-[#171717] text-[10px] whitespace-nowrap text-[#77736C] hover:text-[#171717] cursor-pointer"
              >
                {act.title}
              </button>
            ))}
          </div>

          {/* Chat Board Input Box */}
          <div className="p-3 border-t border-[#D8D3CA] bg-[#FAF8F5] flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={assistantInput}
                onChange={(e) => setAssistantInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAssistantSend()}
                placeholder="Type direction or auto-prompt selected above..."
                className="flex-1 bg-[#FFFFFF] border border-[#D8D3CA] rounded-md px-2.5 py-2 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
              />
              <button
                onClick={handleAssistantSend}
                disabled={isAssistantThinking || !assistantInput.trim()}
                className="p-2 rounded-md bg-[#171717] hover:bg-[#2A2927] text-[#FAF8F5] transition-colors disabled:opacity-50 cursor-pointer"
                title="Send to Director Assistant"
              >
                <Send className="w-3.5 h-3.5 text-[#00E5FF]" />
              </button>
            </div>

            {selectedPanel && assistantInput && (
              <button
                onClick={() => {
                  onUpdatePanel({ ...selectedPanel, prompt: assistantInput });
                  onRegeneratePanel({ ...selectedPanel, prompt: assistantInput });
                }}
                disabled={isGenerating}
                className="w-full py-1.5 rounded bg-gradient-to-r from-[#00E5FF] to-[#38BDF8] text-black font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:opacity-95"
              >
                <Sparkles className="w-3 h-3 text-black" />
                <span>Apply Prompt & Render Panel Now</span>
              </button>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
