"use client";

import React, { useState } from "react";
import { ComicProject, ReadingDirection } from "@/types/comic";
import { ComicCharacter } from "@/types/character";
import { DEFAULT_STYLES } from "@/lib/constants";
import { deductUserCredits } from "@/lib/storage";
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  X,
  RefreshCw,
  CheckCircle2,
  Sliders,
  Palette,
  Zap,
} from "lucide-react";

interface CreateComicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: ComicProject, characters: ComicCharacter[]) => void;
  currentCredits?: number;
  onOpenUpgrade?: () => void;
}

export function CreateComicModal({
  isOpen,
  onClose,
  onProjectCreated,
  currentCredits = 100000,
  onOpenUpgrade,
}: CreateComicModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [prompt, setPrompt] = useState("");
  const [readingDirection, setReadingDirection] = useState<ReadingDirection>("ltr");
  const [selectedStyleId, setSelectedStyleId] = useState(DEFAULT_STYLES[0].id);
  const [targetPages, setTargetPages] = useState(3);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  // Review & Edit state returned by AI
  const [generatedDraft, setGeneratedDraft] = useState<any>(null);

  if (!isOpen) return null;

  const handleSynthesizeStory = async () => {
    if (!prompt.trim()) return;
    setIsSynthesizing(true);

    try {
      const res = await fetch("/api/ai/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          styleId: selectedStyleId,
          targetPages,
          readingDirection,
        }),
      });

      const data = await res.json();
      if (data.project && data.characters) {
        setGeneratedDraft(data);
        setStep(4);
      }
    } catch (e) {
      console.error("Story creation error", e);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleFinalizeProject = () => {
    if (!generatedDraft) return;

    const requiredCredits = targetPages * 10;
    if ((currentCredits ?? 100000) < requiredCredits) {
      if (onOpenUpgrade) {
        onOpenUpgrade();
      }
      return;
    }

    deductUserCredits(targetPages);

    const newProject: ComicProject = {
      id: `proj_${Date.now()}`,
      userId: "user_demo_01",
      title: generatedDraft.project.title || "New Comic Project",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      readingDirection,
      styleId: selectedStyleId,
      characterIds: generatedDraft.characters.map((c: any) => c.id),
      version: 1,
      metadata: generatedDraft.project.metadata,
      chapters: generatedDraft.project.chapters,
      negativeConstraints: [
        "extra fingers",
        "deformed faces",
        "random watermark text",
        "inconsistent clothes",
      ],
      coverImage: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1000&auto=format&fit=crop&q=80",
    };

    onProjectCreated(newProject, generatedDraft.characters);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 text-[#171717]">
      <div className="bg-[#FAF8F5] border border-[#111110] rounded-lg max-w-2xl w-full p-6 shadow-editorial flex flex-col gap-5 text-xs max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#D8D3CA]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-xs bg-[#B84A39] text-[#FAF8F5] flex items-center justify-center font-serif font-black text-sm">
              冊
            </div>
            <h2 className="font-serif font-black text-base text-[#171717]">
              Create New Comic Experience
            </h2>
          </div>
          <button onClick={onClose} className="text-[#77736C] hover:text-[#171717]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between px-2 text-[#77736C]">
          <span className={step === 1 ? "font-bold text-[#171717]" : ""}>1. Story Concept</span>
          <span>→</span>
          <span className={step === 2 ? "font-bold text-[#171717]" : ""}>2. Reading Format</span>
          <span>→</span>
          <span className={step === 3 ? "font-bold text-[#171717]" : ""}>3. Art Aesthetic</span>
          <span>→</span>
          <span className={step === 4 ? "font-bold text-[#171717]" : ""}>4. Review & Launch</span>
        </div>

        {/* Step 1: Story Concept */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="font-semibold text-sm text-[#171717] block mb-1">
                What story do you want to create?
              </label>
              <p className="text-[11px] text-[#77736C] mb-2 leading-relaxed">
                Enter a sentence, paragraph, premise, character description, or screenplay fragment.
                Gemini will transform it into structured chapters, scenes, characters, and panel compositions.
              </p>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Example: A detective in a rain-drenched coastal town discovers that nobody in the city casts a shadow..."
                className="w-full bg-[#FFFFFF] border border-[#D8D3CA] rounded-lg p-3 text-xs text-[#171717] focus:outline-none focus:border-[#171717] leading-relaxed resize-none"
                rows={5}
              />
            </div>

            {/* Quick Inspiration Prompts */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-[#77736C] font-semibold uppercase">
                Or try an editorial prompt:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "A clockmaker finds a gear that winds backward through human memories.",
                  "A cyberpunk ronin protects the last botanical greenhouse in Neo-Shinjuku.",
                  "Two rival architects duel by constructing impossible buildings in each other's dreams.",
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(item)}
                    className="p-1.5 rounded bg-[#FAF6ED] border border-[#D8D3CA] hover:border-[#171717] text-[11px] text-[#171717] text-left transition-colors"
                  >
                    "{item}"
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#D8D3CA]">
              <button
                onClick={() => setStep(2)}
                disabled={!prompt.trim()}
                className="px-4 py-2 rounded bg-[#171717] hover:bg-[#2A2927] text-[#FAF8F5] font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Format & Scope */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="font-semibold text-sm text-[#171717] block mb-1">
                Reading Direction & Target Length
              </label>
              <p className="text-[11px] text-[#77736C] mb-3">
                Choose the publishing format that suits your storytelling rhythm.
              </p>

              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setReadingDirection("ltr")}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                    readingDirection === "ltr"
                      ? "border-[#171717] bg-[#FFFFFF] ring-1 ring-[#171717] shadow-xs"
                      : "border-[#D8D3CA] bg-[#FAF8F5] hover:border-[#171717]"
                  }`}
                >
                  <div className="font-bold text-xs text-[#171717] mb-1">Western Comic</div>
                  <div className="text-[10px] text-[#77736C]">Left to right panel sequence.</div>
                </button>

                <button
                  type="button"
                  onClick={() => setReadingDirection("rtl")}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                    readingDirection === "rtl"
                      ? "border-[#171717] bg-[#FFFFFF] ring-1 ring-[#171717] shadow-xs"
                      : "border-[#D8D3CA] bg-[#FAF8F5] hover:border-[#171717]"
                  }`}
                >
                  <div className="font-bold text-xs text-[#171717] mb-1">Authentic Manga</div>
                  <div className="text-[10px] text-[#77736C]">Right to left Japanese reading flow.</div>
                </button>

                <button
                  type="button"
                  onClick={() => setReadingDirection("vertical")}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                    readingDirection === "vertical"
                      ? "border-[#171717] bg-[#FFFFFF] ring-1 ring-[#171717] shadow-xs"
                      : "border-[#D8D3CA] bg-[#FAF8F5] hover:border-[#171717]"
                  }`}
                >
                  <div className="font-bold text-xs text-[#171717] mb-1">Webtoon Strip</div>
                  <div className="text-[10px] text-[#77736C]">Continuous vertical scrolling.</div>
                </button>
              </div>
            </div>

            <div>
              <label className="font-semibold text-xs text-[#77736C] block mb-1">
                Target Page Count: <span className="text-[#171717] font-bold">{targetPages} Pages</span>
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 6, 12].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setTargetPages(num)}
                    className={`flex-1 py-1.5 rounded border text-xs font-mono font-medium transition-all ${
                      targetPages === num
                        ? "bg-[#171717] text-[#FAF8F5] border-[#171717]"
                        : "bg-[#FFFFFF] border-[#D8D3CA] text-[#77736C] hover:border-[#171717]"
                    }`}
                  >
                    {num} P.
                  </button>
                ))}
              </div>

              {/* Studio Engine Indicator */}
              <div className="mt-3 p-2.5 rounded-lg bg-[#F5F2EB] border border-[#D8D3CA] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#00E5FF]/20 text-[#00838F] flex items-center justify-center font-bold text-xs">
                    ✨
                  </div>
                  <div>
                    <div className="font-serif text-xs font-bold text-[#171717]">
                      Gemini 3.1 Multimodal Comic Engine
                    </div>
                    <div className="text-[10px] text-[#77736C]">
                      Full script breakdown, panel layouts & character visual continuity
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-[#10B981] font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                  ✓ Ready to Synthesize
                </span>
              </div>
            </div>

            <div className="flex justify-between pt-3 border-t border-[#D8D3CA]">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-3 py-1.5 rounded text-[#77736C] hover:text-[#171717] flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-4 py-2 rounded bg-[#171717] hover:bg-[#2A2927] text-[#FAF8F5] font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Art Style Selection & AI Story Synthesis Trigger */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="font-semibold text-sm text-[#171717] block mb-1">
                Select Visual Style Engine
              </label>
              <div className="grid grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                {DEFAULT_STYLES.map((style) => (
                  <div
                    key={style.id}
                    onClick={() => setSelectedStyleId(style.id)}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                      selectedStyleId === style.id
                        ? "border-[#171717] bg-[#FFFFFF] ring-1 ring-[#171717] shadow-xs"
                        : "border-[#D8D3CA] bg-[#FAF8F5] hover:border-[#171717]"
                    }`}
                  >
                    <div className="font-bold text-xs text-[#171717] mb-0.5">{style.name}</div>
                    <p className="text-[10px] text-[#77736C] line-clamp-2">{style.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-3 border-t border-[#D8D3CA]">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-3 py-1.5 rounded text-[#77736C] hover:text-[#171717] flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                type="button"
                onClick={handleSynthesizeStory}
                disabled={isSynthesizing}
                className="px-5 py-2.5 rounded bg-[#171717] hover:bg-[#2A2927] text-[#FAF8F5] font-semibold flex items-center gap-2 cursor-pointer shadow-sm"
              >
                {isSynthesizing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#B84A39]" />
                    <span>Gemini is Orchestrating Story & Cast...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#B84A39]" />
                    <span>Synthesize Story & Comic Pages</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review Generated Story & Enter Studio */}
        {step === 4 && generatedDraft && (
          <div className="space-y-4">
            <div className="p-4 bg-[#FFFFFF] border border-[#D8D3CA] rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#171717]">
                  {generatedDraft.project.title}
                </span>
                <span className="font-mono text-[10px] bg-[#FAF6ED] px-2 py-0.5 rounded text-[#B84A39]">
                  {generatedDraft.characters.length} Characters • {targetPages} Pages
                </span>
              </div>
              <p className="text-xs text-[#77736C] leading-relaxed italic">
                "{generatedDraft.project.metadata.premise}"
              </p>
              <div className="text-[11px] text-[#77736C] pt-2 border-t border-[#EBE6DE]">
                <strong>World: </strong> {generatedDraft.project.metadata.worldSetting}
              </div>
            </div>

            {/* Character list preview */}
            <div>
              <div className="font-bold text-xs text-[#171717] mb-2">Generated Cast Profiles</div>
              <div className="grid grid-cols-2 gap-2">
                {generatedDraft.characters.map((char: any) => (
                  <div
                    key={char.id}
                    className="p-2.5 rounded border border-[#D8D3CA] bg-[#FFFFFF] text-[11px]"
                  >
                    <div className="font-bold text-[#171717]">{char.name}</div>
                    <div className="text-[#77736C] text-[10px] capitalize">{char.role}</div>
                    <div className="text-[#77736C] text-[10px] mt-1 truncate">
                      {char.memory.defaultCostume.upperBody}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-3 border-t border-[#D8D3CA]">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-3 py-1.5 rounded text-[#77736C] hover:text-[#171717]"
              >
                Start Over
              </button>
              <button
                type="button"
                onClick={handleFinalizeProject}
                className="px-5 py-2.5 rounded bg-[#171717] hover:bg-[#2A2927] text-[#FAF8F5] font-semibold flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
                <span>Open in Comic Studio Editor</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
