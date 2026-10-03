"use client";

import React, { useState } from "react";
import { ComicProject } from "@/types/comic";
import { ComicCharacter } from "@/types/character";
import { MODEL_ANIMATION_PRESETS } from "@/lib/constants/animations";
import { ModelAnimationPreset } from "@/types/animation";
import { deductUserCredits } from "@/lib/storage";
import { Sparkles, RefreshCw, X, ArrowRight, CheckCircle2, Zap, Film } from "lucide-react";

interface QuickGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: ComicProject, characters: ComicCharacter[]) => void;
  currentCredits?: number;
  onOpenUpgrade?: () => void;
}

export function QuickGenerateModal({
  isOpen,
  onClose,
  onProjectCreated,
  currentCredits = 100000,
  onOpenUpgrade,
}: QuickGenerateModalProps) {
  const [selectedAnim, setSelectedAnim] = useState<ModelAnimationPreset>(MODEL_ANIMATION_PRESETS[0]);
  const [prompt, setPrompt] = useState(
    "Create an explosive cyberpunk anime comic with high-speed motorcycle chases, neon rain reflections, and a renegade hacker discovering a sentient quantum core."
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStage, setCurrentStage] = useState<string>("");

  if (!isOpen) return null;

  const handleSelectAnimation = (anim: ModelAnimationPreset) => {
    setSelectedAnim(anim);
    // Auto-select tailored auto prompt into the input
    setPrompt(
      `${anim.suggestedActionPrompts[0]?.prompt || anim.autoPromptTemplate} Paced as a dramatic 3-page comic issue.`
    );
  };

  const handleMakeItForMe = async () => {
    if (!prompt.trim() || isGenerating) return;

    const requiredCredits = 30;
    if ((currentCredits ?? 100000) < requiredCredits) {
      if (onOpenUpgrade) {
        onOpenUpgrade();
      }
      return;
    }

    setIsGenerating(true);

    const stages = [
      "Analyzing story premise & model animation parameters...",
      "Designing protagonist biometric memory & personality...",
      "Composing cinematic panel layouts & pacing...",
      "Generating authentic dialogue & narration boxes...",
      "Rendering atmospheric panel illustrations...",
      "Validating continuity across all scenes...",
    ];

    let stageIdx = 0;
    setCurrentStage(stages[0]);
    const interval = setInterval(() => {
      stageIdx++;
      if (stageIdx < stages.length) {
        setCurrentStage(stages[stageIdx]);
      }
    }, 1200);

    try {
      const res = await fetch("/api/ai/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          styleId: prompt.toLowerCase().includes("manga") ? "style_manga_screentone" : "style_cinematic_anime",
          targetPages: 3,
          readingDirection: prompt.toLowerCase().includes("manga") ? "rtl" : "ltr",
          animationModel: selectedAnim.name,
        }),
      });

      const data = await res.json();
      clearInterval(interval);

      if (data.project && data.characters) {
        deductUserCredits(3);

        const newProject: ComicProject = {
          id: `proj_quick_${Date.now()}`,
          userId: "user_demo_01",
          title: data.project.title || "The Quantum Core",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          readingDirection: prompt.toLowerCase().includes("manga") ? "rtl" : "ltr",
          styleId: prompt.toLowerCase().includes("manga") ? "style_manga_screentone" : "style_cinematic_anime",
          characterIds: data.characters.map((c: any) => c.id),
          version: 1,
          metadata: data.project.metadata,
          chapters: data.project.chapters,
          negativeConstraints: ["extra fingers", "distorted face", "watermark"],
          coverImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1000&auto=format&fit=crop&q=80",
        };

        onProjectCreated(newProject, data.characters);
        onClose();
      }
    } catch (err) {
      clearInterval(interval);
      console.error("Quick generate error", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 text-[#F8FAFC]">
      <div className="bg-[#0E1424] border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#00E5FF]" />
            <h2 className="font-bangers text-xl tracking-wide text-white">
              "Make It For Me" AI Autopilot
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Model Animation Selector Bar */}
        <div>
          <label className="font-bangers text-xs text-slate-300 tracking-wider flex items-center justify-between mb-1.5 uppercase">
            <span className="flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-[#00E5FF]" />
              Choose Model Animation
            </span>
            <span className="text-[10px] text-[#00E5FF] font-mono lowercase">
              auto-selects prompt
            </span>
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {MODEL_ANIMATION_PRESETS.map((anim) => (
              <button
                key={anim.id}
                type="button"
                onClick={() => handleSelectAnimation(anim)}
                className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                  selectedAnim.id === anim.id
                    ? "bg-[#00E5FF]/20 border-[#00E5FF] text-white shadow-md ring-1 ring-[#00E5FF]"
                    : "bg-[#080B13] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                <div className="text-[11px] font-bold truncate">{anim.badge}</div>
                <div className="text-[9px] text-slate-400 font-mono truncate">{anim.frameRate.slice(0, 14)}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="font-bangers text-xs text-slate-200 tracking-wide uppercase">
              Story Universe & Auto Prompt
            </label>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              ✓ {selectedAnim.name} Ready
            </span>
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating}
            className="w-full bg-[#080B13] border border-slate-700/80 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-[#00E5FF] leading-relaxed resize-none transition-colors"
            rows={4}
          />
        </div>

        {/* Progress Pipeline Animation */}
        {isGenerating && (
          <div className="p-3.5 bg-[#080B13] border border-slate-700/80 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <RefreshCw className="w-4 h-4 animate-spin text-[#00E5FF]" />
              <span>Generating Publication Draft...</span>
            </div>
            <div className="text-[11px] font-mono text-[#00E5FF]">{currentStage}</div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#00E5FF] to-[#FF2A8D] rounded-full animate-pulse w-3/4" />
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
            <span className="flex items-center gap-1 font-bold text-[#FFCC00]">
              <Zap className="w-3.5 h-3.5 fill-[#FFCC00]" /> 30 Credits
            </span>
            <span className="text-[10px] text-slate-400 font-sans" suppressHydrationWarning>
              ({(currentCredits ?? 100000).toLocaleString("en-US")} available)
            </span>
            {(currentCredits ?? 100000) < 30 && onOpenUpgrade && (
              <button
                type="button"
                onClick={onOpenUpgrade}
                className="text-[11px] text-[#00E5FF] hover:underline font-bold font-sans cursor-pointer"
              >
                Top Up
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="px-3.5 py-2 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleMakeItForMe}
              disabled={isGenerating || !prompt.trim()}
              className="px-6 py-2.5 rounded-xl bg-[#00E5FF] hover:bg-[#38BDF8] text-black font-bangers tracking-wider uppercase text-sm font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? "Synthesizing..." : "Generate Complete Comic"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
