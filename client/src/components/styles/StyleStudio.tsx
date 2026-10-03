"use client";

import React, { useState } from "react";
import { ArtStylePreset, VisualCategory, StyleMixingSettings } from "@/types/style";
import { DEFAULT_STYLES } from "@/lib/constants";
import { Palette, Sliders, Check, Sparkles, Image as ImageIcon } from "lucide-react";

interface StyleStudioProps {
  activeStyleId: string;
  onSelectStyle: (style: ArtStylePreset) => void;
}

export function StyleStudio({ activeStyleId, onSelectStyle }: StyleStudioProps) {
  const [selectedCategory, setSelectedCategory] = useState<VisualCategory | "all">("all");
  const [styles, setStyles] = useState<ArtStylePreset[]>(DEFAULT_STYLES);

  const activePreset = styles.find((s) => s.id === activeStyleId) || styles[0];
  const [mixing, setMixing] = useState<StyleMixingSettings>(activePreset.mixing);

  const categories: { id: VisualCategory | "all"; label: string }[] = [
    { id: "all", label: "All Art Categories" },
    { id: "manga", label: "Manga & Screentone" },
    { id: "anime", label: "Anime & Theatrical" },
    { id: "western-comic", label: "Western & Noir Graphic Novel" },
    { id: "illustration-fine-art", label: "Watercolor & Fine Art" },
  ];

  const filteredStyles =
    selectedCategory === "all"
      ? styles
      : styles.filter((s) => s.category === selectedCategory);

  const handleApplyMixing = () => {
    const updatedStyle: ArtStylePreset = {
      ...activePreset,
      mixing,
    };
    onSelectStyle(updatedStyle);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden text-[#171717] bg-[#FAF8F5]">
      {/* Left Presets Browser */}
      <aside className="w-full lg:w-96 border-r border-[#D8D3CA] bg-[#FAF8F5] flex flex-col">
        <div className="p-4 border-b border-[#D8D3CA]">
          <h2 className="font-serif font-bold text-sm text-[#171717]">Art Style Presets</h2>
          <div className="text-[11px] text-[#77736C]">Curated aesthetic rendering engines</div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1 mt-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-[#171717] text-[#FAF8F5]"
                    : "bg-[#EBE6DE] text-[#77736C] hover:text-[#171717]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {filteredStyles.map((style) => {
            const isSelected = style.id === activeStyleId;
            return (
              <div
                key={style.id}
                onClick={() => {
                  onSelectStyle(style);
                  setMixing(style.mixing);
                }}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? "bg-[#FFFFFF] border-[#171717] ring-1 ring-[#171717] shadow-sm"
                    : "bg-[#FAF8F5] border-[#D8D3CA] hover:border-[#171717]"
                }`}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div className="font-bold text-xs text-[#171717]">{style.name}</div>
                  <span className="text-[10px] font-mono capitalize text-[#77736C] bg-[#EBE6DE] px-1.5 py-0.5 rounded">
                    {style.category}
                  </span>
                </div>
                <p className="text-[11px] text-[#77736C] leading-snug line-clamp-2 mb-2">
                  {style.description}
                </p>

                {/* Preview Thumbnail */}
                <div className="w-full h-24 rounded border border-[#D8D3CA] overflow-hidden bg-black/5">
                  <img
                    src={style.previewUrl}
                    alt={style.name}
                    className="w-full h-full object-cover select-none pointer-events-none"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main Style Mixing Studio */}
      <main className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto flex flex-col gap-6 text-xs">
        <div className="flex items-center justify-between pb-4 border-b border-[#D8D3CA]">
          <div>
            <div className="font-serif font-black text-xl text-[#171717]">{activePreset.name}</div>
            <div className="text-xs text-[#77736C]">{activePreset.description}</div>
          </div>
          <button
            onClick={handleApplyMixing}
            className="flex items-center gap-1.5 px-4 py-2 rounded bg-[#171717] hover:bg-[#2A2927] text-[#FAF8F5] font-semibold transition-colors cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Mixing Settings</span>
          </button>
        </div>

        {/* Style Mixing Sliders */}
        <div className="bg-[#FFFFFF] border border-[#D8D3CA] rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#EBE6DE]">
            <Sliders className="w-4 h-4 text-[#B84A39]" />
            <h3 className="font-bold text-sm text-[#171717]">Fine-Tuned Style Parameters</h3>
          </div>

          <div className="space-y-4">
            {/* Style Strength */}
            <div>
              <div className="flex justify-between mb-1 font-medium">
                <span>Style Influence Strength</span>
                <span className="font-mono text-[#B84A39]">{mixing.styleStrength}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={mixing.styleStrength}
                onChange={(e) => setMixing({ ...mixing, styleStrength: Number(e.target.value) })}
                className="w-full accent-[#B84A39]"
              />
            </div>

            {/* Line Art Strength */}
            <div>
              <div className="flex justify-between mb-1 font-medium">
                <span>Ink Line Art Weight</span>
                <span className="font-mono text-[#B84A39]">{mixing.lineArtStrength}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={mixing.lineArtStrength}
                onChange={(e) => setMixing({ ...mixing, lineArtStrength: Number(e.target.value) })}
                className="w-full accent-[#B84A39]"
              />
            </div>

            {/* Shading Strength */}
            <div>
              <div className="flex justify-between mb-1 font-medium">
                <span>Shading & Shadow Density</span>
                <span className="font-mono text-[#B84A39]">{mixing.shadingStrength}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={mixing.shadingStrength}
                onChange={(e) => setMixing({ ...mixing, shadingStrength: Number(e.target.value) })}
                className="w-full accent-[#B84A39]"
              />
            </div>

            {/* Color Level */}
            <div>
              <div className="flex justify-between mb-1 font-medium">
                <span>Color Saturation (0 = Monochrome B&W Manga)</span>
                <span className="font-mono text-[#B84A39]">{mixing.colorLevel}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={mixing.colorLevel}
                onChange={(e) => setMixing({ ...mixing, colorLevel: Number(e.target.value) })}
                className="w-full accent-[#B84A39]"
              />
            </div>

            {/* Paper Texture Level */}
            <div>
              <div className="flex justify-between mb-1 font-medium">
                <span>Paper Grain & Screentone Texture</span>
                <span className="font-mono text-[#B84A39]">{mixing.textureLevel}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={mixing.textureLevel}
                onChange={(e) => setMixing({ ...mixing, textureLevel: Number(e.target.value) })}
                className="w-full accent-[#B84A39]"
              />
            </div>
          </div>
        </div>

        {/* Prompt keywords info */}
        <div className="bg-[#FFFFFF] border border-[#D8D3CA] rounded-lg p-4 shadow-xs space-y-2">
          <div className="font-bold text-[#171717]">Injected Aesthetic Anchor Keywords</div>
          <div className="flex flex-wrap gap-1.5">
            {activePreset.promptKeywords.map((kw, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded bg-[#FAF6ED] border border-[#D8D3CA] text-[11px] text-[#171717]"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
