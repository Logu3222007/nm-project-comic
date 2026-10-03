"use client";

import React, { useState } from "react";
import { ComicProject, ComicPage } from "@/types/comic";
import { ComicCharacter } from "@/types/character";
import { ArtStylePreset } from "@/types/style";
import { Sparkles, Type, Image as ImageIcon, RefreshCw, Palette } from "lucide-react";

interface CoverEditorProps {
  project: ComicProject;
  characters: ComicCharacter[];
  style: ArtStylePreset;
  onUpdateCover: (coverUrl: string, coverData: any) => void;
}

export function CoverEditor({ project, characters, style, onUpdateCover }: CoverEditorProps) {
  const [title, setTitle] = useState(project.metadata.title);
  const [subtitle, setSubtitle] = useState(project.metadata.logline);
  const [issueNumber, setIssueNumber] = useState("#01");
  const [authorName, setAuthorName] = useState("Alex Vance");
  const [typographyStyle, setTypographyStyle] = useState<"editorial-serif" | "bold-comic" | "minimalist-sans" | "japanese-kanji">("editorial-serif");
  const [coverImageUrl, setCoverImageUrl] = useState(
    project.coverImage || "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1000&auto=format&fit=crop&q=80"
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateCoverArt = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Epic comic book cover art for "${title}". ${project.metadata.worldSetting}. Dramatic high-impact composition, central protagonist silhouette, atmospheric lighting.`,
          styleId: style.id,
          aspectRatio: "4:3",
        }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        setCoverImageUrl(data.imageUrl);
        onUpdateCover(data.imageUrl, { title, subtitle, issueNumber, authorName, typographyStyle });
      }
    } catch (err) {
      console.error("Cover generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 max-w-6xl mx-auto text-[#171717]">
      {/* Cover Live Canvas Preview */}
      <div className="flex-1 flex justify-center items-center">
        <div
          id="comic-cover-preview"
          className="relative w-[360px] h-[520px] bg-[#111110] border-4 border-[#111110] rounded-sm shadow-editorial overflow-hidden flex flex-col justify-between p-6 select-none"
        >
          {/* Background Illustration */}
          {coverImageUrl && (
            <img
              src={coverImageUrl}
              alt="Cover Art"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />
          )}

          {/* Vignette Gradients for Title Readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/85 pointer-events-none" />

          {/* Top Typography Layer: Issue Header */}
          <div className="relative z-10 flex items-center justify-between text-[#FAF8F5]">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-1.5 py-0.5 bg-[#B84A39] text-[#FAF8F5] rounded-xs shadow-sm">
                ISSUE {issueNumber}
              </span>
              <span className="text-[10px] tracking-widest font-sans uppercase text-[#E5E0D8]">
                PANELCRAFT EDITIONS
              </span>
            </div>
            <div className="font-mono text-[10px] text-[#D8D3CA]">FIRST PRINTING</div>
          </div>

          {/* Middle Typography: Main Comic Title */}
          <div className="relative z-10 text-center my-auto">
            <h1
              className={`text-3xl tracking-tight font-black uppercase text-[#FAF8F5] drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] ${
                typographyStyle === "editorial-serif"
                  ? "font-serif tracking-widest text-4xl"
                  : typographyStyle === "bold-comic"
                  ? "font-sans tracking-tight uppercase"
                  : "font-mono font-medium"
              }`}
            >
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-xs font-sans text-[#E5E0D8] max-w-[280px] mx-auto italic drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {subtitle}
              </p>
            )}
          </div>

          {/* Bottom Typography: Creator Credits & Barcode Area */}
          <div className="relative z-10 flex items-end justify-between text-[#FAF8F5] pt-4 border-t border-white/20">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-[#A8A297]">STORY & ART BY</div>
              <div className="text-xs font-serif font-bold text-[#FAF8F5]">{authorName}</div>
            </div>

            {/* Faux Comic Barcode & Rating */}
            <div className="flex flex-col items-end">
              <div className="text-[9px] font-mono tracking-widest text-[#E5E0D8]">RATED T+</div>
              <div className="font-mono text-[10px] tracking-tighter text-[#A8A297] opacity-80">
                ||| | |||| || | |||
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cover Controls Sidebar */}
      <div className="w-full lg:w-80 flex flex-col gap-4 bg-[#FFFFFF] border border-[#D8D3CA] rounded-lg p-5 shadow-sm">
        <div className="flex items-center gap-2 pb-3 border-b border-[#EBE6DE]">
          <Type className="w-4 h-4 text-[#B84A39]" />
          <h2 className="font-serif font-bold text-sm text-[#171717]">Cover Typography & Composition</h2>
        </div>

        <div className="flex flex-col gap-3 text-xs">
          <div>
            <label className="font-medium text-[#77736C] block mb-1">Comic Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#D8D3CA] rounded p-2 text-[#171717] focus:outline-none focus:border-[#171717]"
            />
          </div>

          <div>
            <label className="font-medium text-[#77736C] block mb-1">Subtitle / Logline</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#D8D3CA] rounded p-2 text-[#171717] focus:outline-none focus:border-[#171717]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-medium text-[#77736C] block mb-1">Issue #</label>
              <input
                type="text"
                value={issueNumber}
                onChange={(e) => setIssueNumber(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#D8D3CA] rounded p-2 text-[#171717] focus:outline-none focus:border-[#171717]"
              />
            </div>
            <div>
              <label className="font-medium text-[#77736C] block mb-1">Creator Name</label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#D8D3CA] rounded p-2 text-[#171717] focus:outline-none focus:border-[#171717]"
              />
            </div>
          </div>

          <div>
            <label className="font-medium text-[#77736C] block mb-1">Typography Style</label>
            <select
              value={typographyStyle}
              onChange={(e) => setTypographyStyle(e.target.value as any)}
              className="w-full bg-[#FAF8F5] border border-[#D8D3CA] rounded p-2 text-[#171717] focus:outline-none focus:border-[#171717]"
            >
              <option value="editorial-serif">Editorial Classic Serif</option>
              <option value="bold-comic">Bold Modern Comic Block</option>
              <option value="minimalist-sans">Minimalist Graphic Novel</option>
            </select>
          </div>

          <div className="pt-3 border-t border-[#EBE6DE] flex flex-col gap-2">
            <button
              onClick={handleGenerateCoverArt}
              disabled={isGenerating}
              className="w-full py-2.5 rounded bg-[#171717] hover:bg-[#2A2927] text-[#FAF8F5] font-medium shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#B84A39]" />
                  <span>Generating Cover Art...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#B84A39]" />
                  <span>Generate New Cover Illustration</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                onUpdateCover(coverImageUrl, { title, subtitle, issueNumber, authorName, typographyStyle });
              }}
              className="w-full py-2 rounded border border-[#D8D3CA] bg-[#FAF8F5] hover:bg-[#F3F0EA] text-[#171717] font-medium transition-colors cursor-pointer"
            >
              Apply to Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
