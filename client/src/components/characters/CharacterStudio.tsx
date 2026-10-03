"use client";

import React, { useState } from "react";
import { ComicCharacter } from "@/types/character";
import { CharacterComicBook } from "./CharacterComicBook";
import {
  Users,
  Plus,
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
  Save,
  Check,
  Palette,
  ShieldCheck,
  BookOpen,
  Sliders,
} from "lucide-react";

interface CharacterStudioProps {
  characters: ComicCharacter[];
  onSaveCharacter: (character: ComicCharacter) => void;
  onCreateNewCharacter: () => void;
  onOpenUploadStyle?: () => void;
}

export function CharacterStudio({
  characters,
  onSaveCharacter,
  onCreateNewCharacter,
  onOpenUploadStyle,
}: CharacterStudioProps) {
  const [viewMode, setViewMode] = useState<"comic-book" | "editor">("comic-book");
  const [selectedCharId, setSelectedCharId] = useState<string>(characters[0]?.id || "");
  const [activeTab, setActiveTab] = useState<"memory" | "sheets" | "palette">("memory");

  const selectedChar = characters.find((c) => c.id === selectedCharId) || characters[0];
  const [formData, setFormData] = useState<ComicCharacter | null>(selectedChar || null);
  const [isGeneratingSheet, setIsGeneratingSheet] = useState(false);
  const [showSavedNotification, setShowSavedNotification] = useState(false);

  React.useEffect(() => {
    if (selectedChar) {
      setFormData(selectedChar);
    }
  }, [selectedCharId, selectedChar]);

  if (!formData) {
    return (
      <div className="p-8 text-center text-slate-400">
        <Users className="w-10 h-10 mx-auto mb-2 text-slate-500" />
        <p className="font-semibold text-sm text-slate-200">No characters available</p>
        <button
          onClick={onCreateNewCharacter}
          className="mt-3 px-4 py-2 rounded-xl bg-[#00E5FF] text-black font-bangers text-sm tracking-wider uppercase cursor-pointer"
        >
          Create First Character
        </button>
      </div>
    );
  }

  const handleSave = () => {
    if (!formData) return;
    onSaveCharacter(formData);
    setShowSavedNotification(true);
    setTimeout(() => setShowSavedNotification(false), 2000);
  };

  const handleGenerateTurnaround = async () => {
    setIsGeneratingSheet(true);
    try {
      const res = await fetch("/api/ai/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Character reference model sheet for ${formData.name}. ${formData.memory.faceShape}, ${formData.memory.hairColor} ${formData.memory.hairStyle}, wearing ${formData.memory.defaultCostume.upperBody}. Front view, side profile view, three-quarter view on white studio background. Crisp ink lines, high consistency.`,
          aspectRatio: "16:9",
        }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        setFormData({
          ...formData,
          referenceSheet: {
            ...formData.referenceSheet,
            frontViewUrl: data.imageUrl,
          },
        });
      }
    } catch (e) {
      console.error("Turnaround error", e);
    } finally {
      setIsGeneratingSheet(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden text-[#F8FAFC] bg-[#090D16]">
      {/* Studio Header Mode Switcher Bar */}
      <div className="px-6 py-3 border-b border-slate-800 bg-[#0B0F19]/90 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00E5FF] to-[#FF2A8D] flex items-center justify-center text-black font-bangers text-base shadow-md">
            ★
          </div>
          <div>
            <h1 className="font-bangers text-xl text-white tracking-wide flex items-center gap-2">
              Animation Style & Character Studio
              <span className="text-xs font-mono text-[#00E5FF] px-2 py-0.5 rounded bg-[#00E5FF]/20 border border-[#00E5FF]/40">
                5 Style Models • {characters.length} Cast
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 font-sans">
              Choose an AI visual rendering style, or build custom characters with independent image uploads
            </p>
          </div>
        </div>

        {/* View Mode Toggle: 3D Comic Book vs Model Memory Editor */}
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode("comic-book")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bangers tracking-wider uppercase transition-all cursor-pointer ${
              viewMode === "comic-book"
                ? "bg-[#00E5FF] text-black font-bold shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>3D Style Book View</span>
          </button>
          <button
            onClick={() => setViewMode("editor")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bangers tracking-wider uppercase transition-all cursor-pointer ${
              viewMode === "editor"
                ? "bg-[#00E5FF] text-black font-bold shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Character Memory Editor</span>
          </button>
        </div>
      </div>

      {/* Mode 1: 3D Physical Comic Book Turn */}
      {viewMode === "comic-book" ? (
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex items-center justify-center comic-dot-grid">
          <CharacterComicBook
            characters={characters}
            onSelectCharacterForStory={(char) => {
              setSelectedCharId(char.id);
              setViewMode("editor");
            }}
            onOpenCreateCharacter={onCreateNewCharacter}
            onOpenUploadStyle={onOpenUploadStyle}
          />
        </div>
      ) : (
        /* Mode 2: Detailed Model Memory & Reference Sheets Editor */
        <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
          {/* Left List of Cast Members */}
          <aside className="w-full md:w-64 border-r border-slate-800 bg-[#0B0F19] flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="font-bangers text-base text-white tracking-wide">Cast & Personas</h2>
                <div className="text-[11px] text-slate-400">{characters.length} Active Profiles</div>
              </div>
              <button
                onClick={onCreateNewCharacter}
                className="p-2 rounded-lg bg-[#00E5FF] text-black hover:bg-[#38BDF8] transition-colors cursor-pointer shadow-md"
                title="Create New Character"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {characters.map((char) => {
                const isSelected = char.id === selectedCharId;
                return (
                  <div
                    key={char.id}
                    onClick={() => {
                      setSelectedCharId(char.id);
                      setFormData(char);
                    }}
                    className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
                      isSelected
                        ? "bg-[#0E1424] border-[#00E5FF] shadow-md ring-1 ring-[#00E5FF]"
                        : "border-slate-800/80 hover:bg-slate-900/60 text-slate-400"
                    }`}
                  >
                    <img
                      src={char.referenceImages[0] || "/characters/kaelen-warlord.jpg"}
                      alt={char.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-700"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bangers text-sm text-white truncate tracking-wide">{char.name}</div>
                      <div className="text-[10px] text-slate-400 capitalize truncate font-mono">
                        {char.role} • {char.ageCategory}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Main Character Editor Stage */}
      <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 max-w-4xl mx-auto">
        {/* Header with Save status */}
        <div className="flex items-center justify-between pb-4 border-b border-[#D8D3CA]">
          <div className="flex items-center gap-3">
            <img
              src={formData.referenceImages[0] || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"}
              alt={formData.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-[#111110] shadow-sm"
            />
            <div>
              <h1 className="font-serif font-black text-xl text-[#171717]">{formData.name}</h1>
              <div className="text-xs text-[#77736C] flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase bg-[#EBE6DE] px-1.5 py-0.5 rounded">
                  {formData.id}
                </span>
                <span>• {formData.role}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {showSavedNotification && (
              <span className="text-xs text-[#2D6A4F] flex items-center gap-1 font-medium">
                <Check className="w-3.5 h-3.5" /> Saved!
              </span>
            )}
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#171717] hover:bg-[#2A2927] text-[#FAF8F5] text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Identity Profile</span>
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-[#D8D3CA]">
          <button
            onClick={() => setActiveTab("memory")}
            className={`px-4 py-2 border-b-2 font-medium text-xs transition-colors ${
              activeTab === "memory"
                ? "border-[#B84A39] text-[#171717] font-bold"
                : "border-transparent text-[#77736C] hover:text-[#171717]"
            }`}
          >
            Biometric & Costume Memory
          </button>
          <button
            onClick={() => setActiveTab("sheets")}
            className={`px-4 py-2 border-b-2 font-medium text-xs transition-colors ${
              activeTab === "sheets"
                ? "border-[#B84A39] text-[#171717] font-bold"
                : "border-transparent text-[#77736C] hover:text-[#171717]"
            }`}
          >
            Turnaround & Model Sheets
          </button>
          <button
            onClick={() => setActiveTab("palette")}
            className={`px-4 py-2 border-b-2 font-medium text-xs transition-colors ${
              activeTab === "palette"
                ? "border-[#B84A39] text-[#171717] font-bold"
                : "border-transparent text-[#77736C] hover:text-[#171717]"
            }`}
          >
            Color Anchors & Backstory
          </button>
        </div>

        {/* Tab 1: Memory */}
        {activeTab === "memory" && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-[#77736C] block mb-1">Character Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#FFFFFF] border border-[#D8D3CA] rounded p-2 text-[#171717] focus:outline-none focus:border-[#171717]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#77736C] block mb-1">Role in Story</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full bg-[#FFFFFF] border border-[#D8D3CA] rounded p-2 text-[#171717] focus:outline-none focus:border-[#171717]"
                >
                  <option value="protagonist">Protagonist</option>
                  <option value="antagonist">Antagonist</option>
                  <option value="deuteragonist">Deuteragonist</option>
                  <option value="supporting">Supporting</option>
                  <option value="mentor">Mentor</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#77736C] block mb-1">Face Shape & Features</label>
                <input
                  type="text"
                  value={formData.memory.faceShape}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      memory: { ...formData.memory, faceShape: e.target.value },
                    })
                  }
                  className="w-full bg-[#FFFFFF] border border-[#D8D3CA] rounded p-2 text-[#171717] focus:outline-none focus:border-[#171717]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#77736C] block mb-1">Hairstyle & Color</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.memory.hairStyle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        memory: { ...formData.memory, hairStyle: e.target.value },
                      })
                    }
                    placeholder="Style"
                    className="flex-1 bg-[#FFFFFF] border border-[#D8D3CA] rounded p-2 text-[#171717]"
                  />
                  <input
                    type="text"
                    value={formData.memory.hairColor}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        memory: { ...formData.memory, hairColor: e.target.value },
                      })
                    }
                    placeholder="Color"
                    className="w-28 bg-[#FFFFFF] border border-[#D8D3CA] rounded p-2 text-[#171717]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#77736C] block mb-1">Eyes (Color & Shape)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.memory.eyeColor}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        memory: { ...formData.memory, eyeColor: e.target.value },
                      })
                    }
                    placeholder="Color"
                    className="flex-1 bg-[#FFFFFF] border border-[#D8D3CA] rounded p-2 text-[#171717]"
                  />
                  <input
                    type="text"
                    value={formData.memory.eyeShape}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        memory: { ...formData.memory, eyeShape: e.target.value },
                      })
                    }
                    placeholder="Shape"
                    className="flex-1 bg-[#FFFFFF] border border-[#D8D3CA] rounded p-2 text-[#171717]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#77736C] block mb-1">Skin Tone & Body Type</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.memory.skinTone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        memory: { ...formData.memory, skinTone: e.target.value },
                      })
                    }
                    placeholder="Skin tone"
                    className="flex-1 bg-[#FFFFFF] border border-[#D8D3CA] rounded p-2 text-[#171717]"
                  />
                  <input
                    type="text"
                    value={formData.memory.bodyType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        memory: { ...formData.memory, bodyType: e.target.value },
                      })
                    }
                    placeholder="Body type"
                    className="flex-1 bg-[#FFFFFF] border border-[#D8D3CA] rounded p-2 text-[#171717]"
                  />
                </div>
              </div>
            </div>

            {/* Signature Costume */}
            <div className="border-t border-[#D8D3CA] pt-4 space-y-3">
              <div className="font-bold text-xs text-[#171717]">Default Signature Attire</div>
              <div>
                <label className="text-[#77736C] block mb-1">Upper Body & Jacket</label>
                <input
                  type="text"
                  value={formData.memory.defaultCostume.upperBody}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      memory: {
                        ...formData.memory,
                        defaultCostume: {
                          ...formData.memory.defaultCostume,
                          upperBody: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full bg-[#FFFFFF] border border-[#D8D3CA] rounded p-2 text-[#171717]"
                />
              </div>

              <div>
                <label className="text-[#77736C] block mb-1">Lower Body & Footwear</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.memory.defaultCostume.lowerBody}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        memory: {
                          ...formData.memory,
                          defaultCostume: {
                            ...formData.memory.defaultCostume,
                            lowerBody: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="Pants / Skirt"
                    className="flex-1 bg-[#FFFFFF] border border-[#D8D3CA] rounded p-2 text-[#171717]"
                  />
                  <input
                    type="text"
                    value={formData.memory.defaultCostume.footwear}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        memory: {
                          ...formData.memory,
                          defaultCostume: {
                            ...formData.memory.defaultCostume,
                            footwear: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="Footwear"
                    className="flex-1 bg-[#FFFFFF] border border-[#D8D3CA] rounded p-2 text-[#171717]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Turnaround Model Sheets */}
        {activeTab === "sheets" && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-[#171717]">Visual Consistency Anchor Sheet</div>
                <div className="text-[11px] text-[#77736C]">
                  Generated 3-view turnaround sheet referenced by Gemini during all panel creations.
                </div>
              </div>
              <button
                onClick={handleGenerateTurnaround}
                disabled={isGeneratingSheet}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#171717] hover:bg-[#2A2927] text-[#FAF8F5] text-xs font-medium cursor-pointer"
              >
                {isGeneratingSheet ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#B84A39]" />
                    <span>Rendering Sheet...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#B84A39]" />
                    <span>Generate Turnaround Sheet</span>
                  </>
                )}
              </button>
            </div>

            <div className="border-2 border-[#111110] bg-[#FFFFFF] rounded p-4 flex items-center justify-center min-h-[300px] overflow-hidden">
              {formData.referenceSheet.frontViewUrl ? (
                <img
                  src={formData.referenceSheet.frontViewUrl}
                  alt={`${formData.name} model sheet`}
                  className="w-full h-auto object-contain max-h-[420px]"
                />
              ) : (
                <div className="text-center text-[#77736C]">
                  <ImageIcon className="w-10 h-10 mx-auto mb-2 text-[#A8A297]" />
                  <p className="font-semibold text-[#171717]">No Turnaround Sheet Rendered</p>
                  <p className="text-[11px] max-w-sm mt-1">
                    Click "Generate Turnaround Sheet" above to synthesize a multi-angle front, side, and expression sheet for {formData.name}.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Palette & Backstory */}
        {activeTab === "palette" && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-[#77736C] block mb-1">Backstory & Motivations</label>
              <textarea
                value={formData.backstory}
                onChange={(e) => setFormData({ ...formData, backstory: e.target.value })}
                className="w-full bg-[#FFFFFF] border border-[#D8D3CA] rounded p-2.5 text-[#171717] focus:outline-none focus:border-[#171717] leading-relaxed"
                rows={4}
              />
            </div>

            <div>
              <div className="font-semibold text-[#77736C] mb-2 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-[#B84A39]" />
                <span>Color Identity Anchors</span>
              </div>
              <div className="flex items-center gap-3">
                {formData.colorPalette.map((color, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => {
                        const newPalette = [...formData.colorPalette];
                        newPalette[i] = e.target.value;
                        setFormData({ ...formData, colorPalette: newPalette });
                      }}
                      className="w-8 h-8 rounded-full border border-[#D8D3CA] cursor-pointer"
                    />
                    <span className="font-mono text-[10px] text-[#77736C]">{color}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )}
</div>
);
}
