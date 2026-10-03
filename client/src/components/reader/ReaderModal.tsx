"use client";

import React, { useState } from "react";
import { ComicProject, ReadingDirection } from "@/types/comic";
import { ComicCharacter } from "@/types/character";
import { PhysicalPageTurn } from "./PhysicalPageTurn";
import { exportFullComicPdf } from "@/lib/export/pdf";
import {
  X,
  Maximize2,
  Minimize2,
  BookOpen,
  Layers,
  ScrollText,
  Download,
  FileText,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";

interface ReaderModalProps {
  project: ComicProject;
  characters?: ComicCharacter[];
  isOpen: boolean;
  onClose: () => void;
}

export function ReaderModal({ project, characters = [], isOpen, onClose }: ReaderModalProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [mode, setMode] = useState<ReadingDirection>(project.readingDirection || "ltr");
  const [viewLayout, setViewLayout] = useState<"spread" | "single">("spread");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportProgress, setExportProgress] = useState<{ status: string; percent: number } | null>(null);

  if (!isOpen) return null;

  // Flatten all pages from all chapters and scenes
  const allPages = project.chapters.flatMap((c) => c.scenes.flatMap((s) => s.pages));

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    try {
      await exportFullComicPdf(project, characters, {
        format: "us-comic",
        qualityDpi: 300,
        includeCover: true,
        includeEditorialPage: true,
        includeBackCover: true,
        onProgress: (status, percent) => {
          setExportProgress({ status, percent });
        },
      });
      setTimeout(() => {
        setIsExportingPdf(false);
        setExportProgress(null);
      }, 1000);
    } catch (e) {
      console.error("PDF export error", e);
      setIsExportingPdf(false);
      setExportProgress(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#090D16]/95 backdrop-blur-md flex flex-col justify-between select-none text-[#FAF8F5]">
      {/* Top Reader Controls Header */}
      <header className="px-6 py-3 border-b border-slate-800 bg-[#0B0F19]/95 flex items-center justify-between z-50">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#00E5FF] to-[#FF2A8D] flex items-center justify-center text-black font-bangers text-sm">
            📖
          </div>
          <div>
            <span className="font-bangers tracking-wider text-base text-white uppercase block leading-none">
              {project.title}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Issue #1 • {allPages.length} Pages • {project.metadata.genre[0] || "Graphic Novel"}
            </span>
          </div>
        </div>

        {/* Reader Layout Controls */}
        <div className="flex items-center gap-2">
          {/* Format Chooser: Book Spread vs Single vs Webtoon */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => {
                setMode("ltr");
                setViewLayout("spread");
              }}
              title="Read like an open Comic Book (2-Page Spread)"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                mode !== "vertical" && viewLayout === "spread"
                  ? "bg-[#00E5FF] text-black font-bold shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Book Spread</span>
            </button>

            <button
              onClick={() => {
                setMode("ltr");
                setViewLayout("single");
              }}
              title="Single Page Presentation"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                mode !== "vertical" && viewLayout === "single"
                  ? "bg-[#00E5FF] text-black font-bold shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Single Page</span>
            </button>

            <button
              onClick={() => setMode("vertical")}
              title="Continuous Vertical Webtoon Stream"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                mode === "vertical"
                  ? "bg-[#00E5FF] text-black font-bold shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <ScrollText className="w-3.5 h-3.5" />
              <span>Webtoon</span>
            </button>
          </div>

          {/* Direct PDF Download Action */}
          <button
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            title="Download publication-ready multi-page PDF Book"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#FF2A8D] to-rose-600 hover:from-[#ff439c] hover:to-rose-500 text-white text-xs font-bangers tracking-wider uppercase shadow-md transition-all cursor-pointer font-bold disabled:opacity-50"
          >
            {isExportingPdf ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span className="text-[11px]">Generating PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF Book</span>
              </>
            )}
          </button>
        </div>

        {/* Fullscreen and Close */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            title="Toggle Fullscreen"
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            title="Close Reader"
            className="p-2 rounded-lg hover:bg-rose-500 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Live PDF Export Toast Progress */}
      {exportProgress && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-[#00E5FF] rounded-xl px-5 py-2.5 shadow-2xl flex items-center gap-3 text-xs text-white">
          <RefreshCw className="w-4 h-4 text-[#00E5FF] animate-spin" />
          <div>
            <div className="font-bold text-[#00E5FF]">{exportProgress.status}</div>
            <div className="w-48 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
              <div
                style={{ width: `${exportProgress.percent}%` }}
                className="bg-[#00E5FF] h-full transition-all duration-300"
              />
            </div>
          </div>
          <span className="font-mono text-slate-400 text-[11px]">{exportProgress.percent}%</span>
        </div>
      )}

      {/* Main Reading Stage */}
      <main className="flex-1 overflow-y-auto flex items-center justify-center p-4">
        {mode === "vertical" ? (
          /* Webtoon Continuous Vertical Scroll Mode */
          <div className="w-full max-w-xl flex flex-col gap-6 py-8">
            {allPages.map((page) => (
              <div
                key={page.id}
                className="bg-[#FAF8F5] paper-texture p-6 border-2 border-[#2A2927] shadow-2xl rounded-xs flex flex-col gap-6"
              >
                <div className="text-right text-[10px] font-mono text-[#77736C]">
                  PAGE {page.pageNumber}
                </div>
                {page.panels.map((panel) => (
                  <div
                    key={panel.id}
                    className="relative border-2 border-[#111110] bg-[#FAF8F5] overflow-hidden rounded-xs"
                    style={{ aspectRatio: panel.aspectRatio === "16:9" ? "16/9" : "4/3" }}
                  >
                    {panel.imageUrl && (
                      <img
                        src={panel.imageUrl}
                        alt={panel.prompt}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {panel.bubbles.map((b) => (
                      <div
                        key={b.id}
                        className="absolute bottom-2 left-2 bg-white/95 border border-[#111110] px-2.5 py-1 rounded-xl text-xs font-comic font-medium text-[#171717] shadow-sm max-w-[80%]"
                      >
                        {b.speaker ? <span className="font-bold text-[#77736C]">{b.speaker}: </span> : null}
                        {b.text}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          /* Realistic Physical Graphic Novel Turn 3D Mode */
          <PhysicalPageTurn
            pages={allPages}
            currentPageIndex={currentPageIndex}
            onPageChange={setCurrentPageIndex}
            readingDirection={mode}
            project={project}
            viewLayout={viewLayout}
          />
        )}
      </main>

      {/* Bottom Page Scrub Bar */}
      <footer className="px-6 py-2.5 border-t border-slate-800 bg-[#0B0F19]/95 flex items-center justify-between text-xs text-slate-400">
        <div className="font-mono flex items-center gap-2">
          <span className="text-white font-bold">
            {currentPageIndex === 0 ? "Cover Page" : `Page ${currentPageIndex} of ${allPages.length}`}
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-[11px] text-slate-400 uppercase font-sans">
            {viewLayout === "spread" ? "2-Page Spread View" : "Single Page View"}
          </span>
        </div>

        {/* Thumbnail Page Jumpers */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-md py-1">
          {allPages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPageIndex(idx)}
              className={`w-7 h-7 rounded text-[11px] font-mono font-medium transition-all ${
                idx === currentPageIndex
                  ? "bg-[#00E5FF] text-black font-bold shadow-md scale-105"
                  : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {idx === 0 ? "C" : idx}
            </button>
          ))}
        </div>

        <div className="text-[11px] text-slate-400 hidden sm:block">
          Use <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white font-mono">←</kbd> and{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white font-mono">→</kbd> keys to flip pages
        </div>
      </footer>
    </div>
  );
}
