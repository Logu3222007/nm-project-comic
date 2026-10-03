"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArtStylePreset } from "@/types/style";
import {
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface StyleReferenceBookProps {
  styles: ArtStylePreset[];
  onSelectStyleForStory?: (style: ArtStylePreset) => void;
  onOpenCreateModal?: () => void;
}

export function StyleReferenceBook({
  styles,
  onSelectStyleForStory,
  onOpenCreateModal,
}: StyleReferenceBookProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<"next" | "prev">("next");
  const [targetPageIndex, setTargetPageIndex] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isPlayingAuto, setIsPlayingAuto] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentStyle = styles[currentPageIndex] || styles[0];
  const nextStyle = styles[targetPageIndex] || currentStyle;

  // Synthesized realistic paper-turn sound using Web Audio API
  const playPageTurnSound = () => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const sampleRate = ctx.sampleRate;
      const totalDuration = 1.0;
      const bufferSize = Math.floor(sampleRate * totalDuration);
      const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        const t = i / sampleRate;
        let amp = 0;
        if (t < 0.25) {
          amp = (t / 0.25) * 0.12;
        } else if (t < 0.8) {
          amp = 0.12 - ((t - 0.25) / 0.55) * 0.04;
        } else {
          const settleT = (t - 0.8) / 0.2;
          amp = Math.exp(-settleT * 6) * 0.15;
        }
        data[i] = (Math.random() * 2 - 1) * amp;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1200, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.5);
      filter.frequency.exponentialRampToValueAtTime(340, ctx.currentTime + 0.95);

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.35, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.98);

      noise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      noise.start();
    } catch {
      // Audio autoplay policy fallback
    }
  };

  // Flip to page with realistic page-turning motion
  const flipToPage = (newIndex: number) => {
    if (isFlipping || newIndex === currentPageIndex) return;
    if (newIndex < 0 || newIndex >= styles.length) return;

    const dir = newIndex > currentPageIndex ? "next" : "prev";
    setFlipDirection(dir);
    setTargetPageIndex(newIndex);
    setIsFlipping(true);
    playPageTurnSound();

    setTimeout(() => {
      setCurrentPageIndex(newIndex);
      setIsFlipping(false);
    }, 1200);
  };

  const handleNext = () => {
    if (isFlipping) return;
    if (currentPageIndex < styles.length - 1) {
      flipToPage(currentPageIndex + 1);
    } else {
      flipToPage(0);
    }
  };

  const handlePrev = () => {
    if (isFlipping) return;
    if (currentPageIndex > 0) {
      flipToPage(currentPageIndex - 1);
    } else {
      flipToPage(styles.length - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPageIndex, isFlipping, styles.length]);

  const handleNextRef = useRef(handleNext);
  handleNextRef.current = handleNext;

  // Auto-play slideshow timer
  useEffect(() => {
    if (isPlayingAuto) {
      autoPlayTimerRef.current = setInterval(() => {
        handleNextRef.current();
      }, 7000);
    }
    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [isPlayingAuto]);

  // 3D Parallax tilt tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 8, y: -y * 8 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  if (!currentStyle) return null;

  // Clean Left Page: Shows the Comic Model Art cleanly
  const renderLeftPage = (style: ArtStylePreset, pageNum: number) => {
    return (
      <div className="w-full h-full bg-[#FAF8F5] text-[#111110] p-3 sm:p-5 flex flex-col justify-between relative overflow-hidden select-none">
        {/* Paper Texture Overlay */}
        <div className="absolute inset-0 paper-texture pointer-events-none opacity-40" />

        {/* Spine Fold Shadows */}
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black/25 via-black/10 to-transparent pointer-events-none z-20" />
        <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/15 to-transparent pointer-events-none z-20" />

        {/* Clean Comic Page Content */}
        <div className="relative z-10 w-full h-full flex flex-col justify-between">
          {/* Header Line */}
          <div className="flex items-center justify-between pb-1.5 border-b border-black/15 text-[10px] font-mono tracking-widest uppercase text-slate-600 font-semibold">
            <span className="flex items-center gap-1.5 text-black font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]" />
              {style.name}
            </span>
            <span>VOL. 1 • ISSUE #{pageNum}</span>
          </div>

          {/* Comic Model Art Container */}
          <div className="flex-1 my-2 rounded-lg overflow-hidden border-2 border-black/80 shadow-md bg-black relative group">
            <img
              src={style.previewUrl}
              alt={style.name}
              className="w-full h-full object-cover object-center filter brightness-102 contrast-105"
            />
            {/* Subtle Comic Ink Grain Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-2 left-3 right-3 text-white">
              <h3 className="font-bangers text-lg sm:text-xl tracking-wide drop-shadow-md">
                {style.name}
              </h3>
            </div>
          </div>

          {/* Page Footer */}
          <div className="flex items-center justify-between pt-1 border-t border-black/10 text-[10px] font-mono text-slate-500">
            <span>ART STYLE SPECIFICATION</span>
            <span className="font-bold text-black">PAGE {pageNum}</span>
          </div>
        </div>
      </div>
    );
  };

  // Clean Right Page: Full Cinematic Comic Model Showcase
  const renderRightPage = (style: ArtStylePreset, pageNum: number, isTurning = false) => {
    return (
      <div className="w-full h-full bg-[#0B0F19] relative overflow-hidden flex flex-col justify-between select-none">
        {/* Spine Fold Shadow */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black/40 via-black/15 to-transparent pointer-events-none z-20" />
        <div className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-l from-black/20 to-transparent pointer-events-none z-20" />

        {/* Stacked Paper Edge on the Right */}
        <div className="absolute right-0 top-0 bottom-0 w-2.5 bg-gradient-to-r from-slate-300 via-white to-slate-400 border-l border-black/40 pointer-events-none z-30" />

        {/* Full-Bleed Artwork with 3D Parallax Tilt */}
        <div
          className="absolute inset-0 transition-transform duration-200 ease-out"
          style={
            isTurning
              ? undefined
              : {
                  transform: `scale(1.04) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
                }
          }
        >
          <img
            src={style.previewUrl}
            alt={style.name}
            className="w-full h-full object-cover object-center brightness-105 contrast-110 filter"
          />

          {/* Soft Comic Gradient Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/25 pointer-events-none" />
        </div>

        {/* Header Bar */}
        <div className="relative z-10 p-3.5 flex items-center justify-between">
          <span className="font-bangers text-xs tracking-wider uppercase px-2.5 py-0.5 rounded bg-black/75 backdrop-blur-md text-[#00E5FF] border border-[#00E5FF]/40 shadow-sm">
            COMIC MODEL PREVIEW
          </span>
          <span className="text-[10px] font-mono text-white/70 bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
            PAGE {pageNum}
          </span>
        </div>

        {/* Bottom Clean Floating Action Bar */}
        <div className="relative z-10 p-4 sm:p-5 flex items-center justify-between bg-gradient-to-t from-black via-black/75 to-transparent">
          <div>
            <h2 className="font-bangers text-2xl sm:text-3xl text-white tracking-wider drop-shadow-lg leading-tight">
              {style.name}
            </h2>
            <p className="text-xs text-slate-300 font-sans line-clamp-1 max-w-xs">
              {style.description}
            </p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onSelectStyleForStory) {
                onSelectStyleForStory(style);
              } else if (onOpenCreateModal) {
                onOpenCreateModal();
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00E5FF] hover:bg-[#38BDF8] text-black text-xs font-bangers tracking-wider uppercase font-bold shadow-lg cursor-pointer transition-transform hover:scale-105"
          >
            <span>Use Style</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col items-center select-none py-2 space-y-4">
      {/* Viewer Header Bar */}
      <div className="w-full max-w-5xl flex items-center justify-between px-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] animate-ping" />
          <span className="font-bangers tracking-wider text-xl sm:text-2xl text-white">
            <span className="text-[#00E5FF]">COMIC STYLE</span>{" "}
            <span className="text-[#FF2A8D]">SHOWCASE</span>
          </span>
        </div>

        {/* Controls: Audio & Auto-Turn */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? "Mute paper-turn sound" : "Enable paper-turn sound"}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              soundEnabled
                ? "bg-slate-800 border-slate-700 text-slate-200 hover:text-white"
                : "bg-slate-900 border-slate-800 text-slate-500"
            }`}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span className="hidden md:inline font-mono text-[11px]">SFX On</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden md:inline font-mono text-[11px]">SFX Muted</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsPlayingAuto(!isPlayingAuto)}
            title={isPlayingAuto ? "Pause auto-slideshow" : "Auto-turn pages"}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isPlayingAuto
                ? "bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.3)] animate-pulse"
                : "bg-slate-800 border-slate-700 text-slate-200 hover:text-white"
            }`}
          >
            {isPlayingAuto ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span className="font-mono text-[11px] hidden sm:inline">Playing</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span className="font-mono text-[11px] hidden sm:inline">Auto</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3D Viewport with Perspective */}
      <div
        className="w-full max-w-5xl relative comic-viewport flex items-center justify-center px-1 sm:px-4"
        style={{ perspective: "2800px" }}
      >
        {/* Physical Comic Book Open Folio */}
        <div className="relative w-full aspect-[16/10] max-h-[600px] min-h-[460px] flex rounded-2xl shadow-[0_35px_80px_-15px_rgba(0,0,0,0.98),0_0_45px_rgba(0,229,255,0.2)] overflow-hidden border-2 border-slate-700/80 bg-[#070A12]">
          
          {/* ===================================================================== */}
          {/* LEFT UNDERLYING PAGE */}
          {/* ===================================================================== */}
          <div
            onClick={handlePrev}
            title="Click to turn back"
            className="w-1/2 h-full cursor-pointer group relative overflow-hidden border-r-2 border-black/40"
          >
            {isFlipping && flipDirection === "prev"
              ? renderLeftPage(nextStyle, targetPageIndex * 2 + 1)
              : renderLeftPage(currentStyle, currentPageIndex * 2 + 1)}

            {isFlipping && flipDirection === "next" && (
              <div className="absolute inset-0 pointer-events-none z-25 cast-shadow-right" />
            )}
          </div>

          {/* ===================================================================== */}
          {/* RIGHT UNDERLYING PAGE */}
          {/* ===================================================================== */}
          <div
            onClick={handleNext}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            title="Click to turn forward"
            className="w-1/2 h-full cursor-pointer group relative overflow-hidden"
          >
            {isFlipping && flipDirection === "next"
              ? renderRightPage(nextStyle, targetPageIndex * 2 + 2)
              : renderRightPage(currentStyle, currentPageIndex * 2 + 2)}

            {isFlipping && flipDirection === "prev" && (
              <div className="absolute inset-0 pointer-events-none z-25 cast-shadow-left" />
            )}

            {!isFlipping && (
              <div className="absolute bottom-2 right-4 z-20 pointer-events-none flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-xs text-[10px] font-mono text-[#FFCC00] border border-[#FFCC00]/50 shadow-md animate-pulse">
                <span>Click page to turn</span>
                <span className="text-xs font-bold">↷</span>
              </div>
            )}
          </div>

          {/* ===================================================================== */}
          {/* 3D TWO-SIDED REALISTIC TURNING PAGE SHEET */}
          {/* ===================================================================== */}
          {isFlipping && (
            <div
              className={`absolute top-0 bottom-0 w-1/2 z-40 page-flipper ${
                flipDirection === "next" ? "right-0 turning-next" : "left-0 turning-prev"
              }`}
              style={{
                transformOrigin: flipDirection === "next" ? "left center" : "right center",
              }}
            >
              <div
                className={`absolute inset-0 pointer-events-none z-30 ${
                  flipDirection === "next" ? "curl-sheen-next" : "curl-sheen-prev"
                }`}
              />

              {/* FRONT FACE */}
              <div className="page-face page-face-front border border-black/30 shadow-2xl">
                {flipDirection === "next"
                  ? renderRightPage(currentStyle, currentPageIndex * 2 + 2, true)
                  : renderLeftPage(currentStyle, currentPageIndex * 2 + 1)}
                <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-black/25 pointer-events-none" />
              </div>

              {/* BACK FACE */}
              <div className="page-face page-face-back border border-black/30 shadow-2xl">
                {flipDirection === "next"
                  ? renderLeftPage(nextStyle, targetPageIndex * 2 + 1)
                  : renderRightPage(nextStyle, targetPageIndex * 2 + 2, true)}
                <div className="absolute inset-0 bg-gradient-to-l from-black/35 via-transparent to-black/25 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Spine Binding Center Shadow & Stitch Line */}
          <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-8 bg-gradient-to-r from-black/50 via-black/80 to-black/50 pointer-events-none z-30 opacity-70" />
          <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-[1px] bg-black pointer-events-none z-30" />
        </div>

        {/* Previous Page Navigation Clicker */}
        <button
          onClick={handlePrev}
          title="Previous Model"
          className="absolute -left-3 sm:-left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#0E1424] hover:bg-[#00E5FF] text-white hover:text-black border-2 border-slate-700 hover:border-[#00E5FF] shadow-2xl flex items-center justify-center transition-all cursor-pointer z-40 group"
        >
          <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
        </button>

        {/* Next Page Navigation Clicker */}
        <button
          onClick={handleNext}
          title="Next Model"
          className="absolute -right-3 sm:-right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#0E1424] hover:bg-[#00E5FF] text-white hover:text-black border-2 border-slate-700 hover:border-[#00E5FF] shadow-2xl flex items-center justify-center transition-all cursor-pointer z-40 group"
        >
          <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* COMIC MODEL THUMBNAIL SELECTOR (CLEAN - NO CLUTTER, NO CHARACTER NAMES) */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 p-2 bg-[#0E1424] border border-slate-800 rounded-2xl shadow-xl max-w-full overflow-x-auto">
        {styles.slice(0, 8).map((style, idx) => {
          const isSelected = idx === currentPageIndex;

          return (
            <button
              key={style.id}
              onClick={() => flipToPage(idx)}
              title={style.name}
              className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex-shrink-0 ${
                isSelected
                  ? "bg-[#00E5FF]/20 border-[#00E5FF] text-white shadow-[0_0_12px_rgba(0,229,255,0.4)]"
                  : "border-slate-800 hover:border-slate-600 text-slate-400 hover:text-white bg-slate-900/60"
              }`}
            >
              <img
                src={style.previewUrl}
                alt={style.name}
                className={`w-8 h-8 rounded-lg object-cover border ${
                  isSelected ? "border-[#00E5FF]" : "border-slate-700"
                }`}
              />
              <div className="text-left hidden sm:block">
                <div className="font-bangers text-xs leading-none tracking-wide text-white max-w-[130px] truncate">
                  {style.name}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
