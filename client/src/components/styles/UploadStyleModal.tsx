"use client";

import React, { useState, useRef } from "react";
import { ArtStylePreset, VisualCategory } from "@/types/style";
import {
  X,
  Upload,
  Palette,
  Sparkles,
  ArrowRight,
  Sliders,
  Check,
} from "lucide-react";

interface UploadStyleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveStyle: (style: ArtStylePreset) => void;
}

export function UploadStyleModal({
  isOpen,
  onClose,
  onSaveStyle,
}: UploadStyleModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<VisualCategory>("anime");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [keywords, setKeywords] = useState("dynamic anime linework, rich cel-shading, vibrant lighting");
  const [styleColor, setStyleColor] = useState("#00E5FF");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        setPreviewUrl(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newStyle: ArtStylePreset = {
      id: `style_custom_${Date.now()}`,
      name: name.trim(),
      category,
      description: description.trim() || `Custom ${category} animation and comic style model.`,
      previewUrl: previewUrl || "/characters/kaelen-warlord.jpg",
      screentoneSupported: category === "manga",
      idealAspectRatios: ["16:9", "4:3", "1:1"],
      mixing: {
        styleStrength: 90,
        characterStyle: `${name.toLowerCase().replace(/\s+/g, "-")}-custom`,
        environmentStyle: "painterly-atmospheric",
        lineArtStrength: 85,
        shadingStrength: 80,
        colorLevel: 80,
        realismLevel: 50,
        textureLevel: 60,
        detailLevel: 85,
      },
      promptKeywords: keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
      negativeKeywords: ["blurry", "amateur", "deformed anatomy", "bad ink pooling"],
    };

    onSaveStyle(newStyle);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none overflow-y-auto">
      <div className="bg-[#0B0F19] border-2 border-slate-700/80 rounded-2xl max-w-xl w-full p-5 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),0_0_35px_rgba(0,229,255,0.18)] text-slate-200 relative my-auto">
        {/* Glow ambient background accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00E5FF]/10 blur-[100px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FF2A8D]/10 blur-[100px] pointer-events-none rounded-full" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00E5FF] to-[#FF2A8D] flex items-center justify-center text-black font-bangers text-lg shadow-md">
              🎨
            </div>
            <div>
              <h2 className="font-bangers text-2xl tracking-wide text-white leading-none">
                UPLOAD ANIMATION STYLE MODEL
              </h2>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Register a new visual AI art style or custom aesthetic model.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 relative z-10">
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-slate-300 mb-1">
              Style Model Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., 90s Retro Mecha, Dark Shonen Ink, Pastel Webtoon"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-[#00E5FF] text-white text-sm outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-slate-300 mb-1">
                Visual Art Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-[#00E5FF] text-white text-xs outline-none transition-colors"
              >
                <option value="anime">Anime & Theatrical Animation</option>
                <option value="manga">Manga & Screentone</option>
                <option value="western-comic">Western Graphic Novel / Comic</option>
                <option value="illustration-fine-art">Watercolor & Fine Art</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-slate-300 mb-1">
                Signature Accent Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={styleColor}
                  onChange={(e) => setStyleColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={styleColor}
                  onChange={(e) => setStyleColor(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* Reference Image Upload Dropzone */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-[#FFCC00] mb-1">
              Upload Style Reference Artwork *
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="h-36 rounded-xl border-2 border-dashed border-slate-700 hover:border-[#00E5FF] bg-slate-900/60 flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden relative group"
            >
              {previewUrl ? (
                <>
                  <img
                    src={previewUrl}
                    alt="Style Reference"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs text-white font-bold">
                    Click to change image
                  </div>
                </>
              ) : (
                <div className="text-center p-3 text-slate-400">
                  <Upload className="w-6 h-6 mx-auto mb-1 text-[#00E5FF]" />
                  <div className="text-xs font-semibold text-slate-200">
                    Click to browse or drop style artwork
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    PNG, JPG, WEBP (Ideal 16:9 or 1:1)
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-slate-300 mb-1">
              Style Prompt Keywords / Aesthetics
            </label>
            <textarea
              rows={2}
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g., dynamic ink lines, sharp cross-hatching, vibrant neon reflections"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-[#00E5FF] text-white text-xs outline-none transition-colors resize-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="comic-btn-cyan flex items-center gap-2 px-6 py-2.5 rounded-xl font-bangers text-lg tracking-wider uppercase cursor-pointer"
            >
              <span>Register Style Model</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
