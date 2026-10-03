"use client";

import React, { useState, useEffect, useRef } from "react";
import { ComicCharacter } from "@/types/character";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ArrowRight,
  Flame,
  Star,
} from "lucide-react";

interface CharacterComicBookProps {
  characters: ComicCharacter[];
  onSelectCharacterForStory?: (character: ComicCharacter) => void;
  onOpenCreateCharacter?: () => void;
  onOpenUploadStyle?: () => void;
}

export function CharacterComicBook({
  characters,
  onSelectCharacterForStory,
  onOpenCreateCharacter,
  onOpenUploadStyle,
}: CharacterComicBookProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<"next" | "prev">("next");
  const [targetPageIndex, setTargetPageIndex] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isPlayingAuto, setIsPlayingAuto] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [activeFxBounce, setActiveFxBounce] = useState(false);
  const [statsAnimated, setStatsAnimated] = useState(true);

  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentCharacter = characters[currentPageIndex] || characters[0];
  const nextCharacter = characters[targetPageIndex] || currentCharacter;

  // Synthesized realistic multi-phase paper-turn sound using Web Audio API
  const playPageTurnSound = () => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const sampleRate = ctx.sampleRate;
      const totalDuration = 1.1; // 1.1s sound duration matching slower realistic turn
      const bufferSize = Math.floor(sampleRate * totalDuration);
      const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        const t = i / sampleRate;
        // Phase 1: lift friction (0 - 0.25s)
        // Phase 2: airborne paper curl wave (0.25 - 0.85s)
        // Phase 3: settle paper slap (0.85 - 1.1s)
        let amp = 0;
        if (t < 0.25) {
          amp = (t / 0.25) * 0.14;
        } else if (t < 0.85) {
          amp = 0.14 - ((t - 0.25) / 0.6) * 0.05;
        } else {
          const settleT = (t - 0.85) / 0.25;
          amp = Math.exp(-settleT * 6) * 0.18;
        }
        data[i] = (Math.random() * 2 - 1) * amp;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1100, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(1900, ctx.currentTime + 0.55);
      filter.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 1.05);

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.08);

      noise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      noise.start();
    } catch {
      // Audio autoplay policy fallback
    }
  };

  // Flip to page with slower, natural 1.3s duration
  const flipToPage = (newIndex: number) => {
    if (isFlipping || newIndex === currentPageIndex) return;
    if (newIndex < 0 || newIndex >= characters.length) return;

    const dir = newIndex > currentPageIndex ? "next" : "prev";
    setFlipDirection(dir);
    setTargetPageIndex(newIndex);
    setIsFlipping(true);
    setStatsAnimated(false);
    playPageTurnSound();

    // 1300ms slower realistic page turning duration
    setTimeout(() => {
      setCurrentPageIndex(newIndex);
      setIsFlipping(false);
      setStatsAnimated(true);
    }, 1300);
  };

  const handleNext = () => {
    if (isFlipping) return;
    if (currentPageIndex < characters.length - 1) {
      flipToPage(currentPageIndex + 1);
    } else {
      flipToPage(0); // Loop to start
    }
  };

  const handlePrev = () => {
    if (isFlipping) return;
    if (currentPageIndex > 0) {
      flipToPage(currentPageIndex - 1);
    } else {
      flipToPage(characters.length - 1); // Loop to end
    }
  };

  // Keyboard navigation (Left / Right arrow keys)
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
  }, [currentPageIndex, isFlipping, characters.length]);

  const handleNextRef = useRef(handleNext);
  handleNextRef.current = handleNext;

  // Auto-play slideshow timer with longer reading time
  useEffect(() => {
    if (isPlayingAuto) {
      autoPlayTimerRef.current = setInterval(() => {
        handleNextRef.current();
      }, 7500);
    }
    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [isPlayingAuto]);

  // Parallax 3D tilt tracking for cover art
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 10, y: -y * 10 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Trigger Sound FX bounce on click
  const triggerFxBounce = () => {
    setActiveFxBounce(true);
    setTimeout(() => setActiveFxBounce(false), 500);
  };

  if (!currentCharacter) return null;

  // =========================================================================
  // SUBCOMPONENT: Left Dossier Spread
  // =========================================================================
  const renderDossierContent = (char: ComicCharacter, pageNum: number) => (
    <div className="w-full h-full bg-[#FAF8F5] text-[#111110] p-4 sm:p-7 flex flex-col justify-between relative overflow-hidden select-none">
      {/* Paper Texture Overlay */}
      <div className="absolute inset-0 paper-texture pointer-events-none opacity-45" />

      {/* Spine Fold Shadow (Physical depth at the binding) */}
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black/25 via-black/10 to-transparent pointer-events-none z-20" />
      <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/15 to-transparent pointer-events-none z-20" />

      {/* Vintage Comic Header Strip */}
      <div className="relative z-10 border-b-2 border-black pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bangers text-xs sm:text-sm tracking-wider uppercase px-2 py-0.5 bg-black text-[#FFCC00] rounded">
            COLLECTOR ARCHIVE
          </span>
          <span className="font-mono text-[11px] font-bold text-slate-700">
            {char.comicIssueTitle || `ISSUE #${pageNum}`}
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-700 font-bold">
          <span>$3.99 US</span>
          <span>•</span>
          <span className="px-1 py-0.5 bg-slate-200 border border-slate-400 rounded text-[9px]">
            CCA APPROVED
          </span>
        </div>
      </div>

      {/* Character Title & Hero Name in Bangers */}
      <div className="relative z-10 space-y-1 mt-1">
        <div className="text-[10px] font-mono uppercase tracking-widest text-[#B84A39] font-black flex items-center gap-1.5">
          <span>{char.alias || "HERO ARCHIVE"}</span>
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: char.auraColor || "#FF2A8D" }} />
        </div>
        <h2 className="font-bangers text-3xl sm:text-4xl text-[#111110] leading-none tracking-wide drop-shadow-[1px_1px_0_#FFF]">
          {char.name}
        </h2>
      </div>

      {/* Action Quote Speech Bubble */}
      <div className="relative z-10 my-1">
        <div className="bg-white border-2 border-black rounded-2xl p-3 shadow-[3px_3px_0px_#000] relative">
          <p className="font-bangers text-sm sm:text-base text-black tracking-wide leading-snug">
            "{char.quote || char.backstory.slice(0, 75) + "..."}"
          </p>
          {/* Speech Bubble Tail */}
          <div className="absolute -bottom-2 left-6 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[9px] border-t-black" />
        </div>
      </div>

      {/* Interactive Sound FX Badge */}
      <div className="relative z-10 flex items-center gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            triggerFxBounce();
          }}
          className={`font-bangers text-xl sm:text-2xl px-4 py-1.5 rounded-xl border-2 border-black text-black shadow-[3px_3px_0px_#000] cursor-pointer transition-all ${
            activeFxBounce ? "scale-125 rotate-6 bg-[#FFCC00]" : "hover:scale-105"
          }`}
          style={{
            backgroundColor: char.auraColor || "#FF2A8D",
            color: char.id === "char-aoi" || char.id === "char-kaelen" ? "#111" : "#FFF",
          }}
        >
          {char.soundFx || "KRA-THOOM!"}
        </button>
        <span className="text-[10px] font-mono text-slate-600 uppercase tracking-wider font-semibold">
          [CLICK SOUND FX]
        </span>
      </div>

      {/* Power Attribute Rating Bars */}
      <div className="relative z-10 space-y-1.5 bg-white/85 backdrop-blur-xs p-3 rounded-xl border-2 border-black/20 shadow-xs">
        <div className="text-[10px] font-bangers tracking-wider text-black flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-[#FFCC00]" />
            COMBAT STATS INDEX
          </span>
          <span className="text-slate-600 font-mono text-[9px] font-bold">CLASS: {char.role.toUpperCase()}</span>
        </div>
        <div className="space-y-1.5">
          {[
            { label: "STRENGTH", val: char.stats?.strength || 92, col: "#EF4444" },
            { label: "SPEED & AGILITY", val: char.stats?.speed || 88, col: "#00E5FF" },
            { label: "AURA / POWER", val: char.stats?.power || 95, col: "#FF2A8D" },
            { label: "DEFENSE", val: char.stats?.defense || 89, col: "#10B981" },
          ].map((stat, idx) => (
            <div key={idx} className="flex items-center gap-2 text-[10px] font-bold font-mono">
              <span className="w-24 text-[9px] text-slate-800 truncate">{stat.label}</span>
              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden border border-black/20">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: statsAnimated ? `${stat.val}%` : "0%",
                    backgroundColor: stat.col,
                  }}
                />
              </div>
              <span className="w-6 text-right text-[10px] text-black font-mono font-bold">
                {stat.val}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Footer & Page Number */}
      <div className="relative z-10 pt-2 border-t border-black/20 flex items-center justify-between text-[11px] font-mono text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-black">CLASS:</span>
          <span className="uppercase text-[#0099AA] font-bold">{char.role}</span>
        </div>
        <div className="font-bold text-black text-xs">
          PAGE {pageNum}
        </div>
      </div>
    </div>
  );

  // =========================================================================
  // SUBCOMPONENT: Right Variant Cover Spread with Dynamic FX
  // =========================================================================
  const renderCoverContent = (char: ComicCharacter, pageNum: number, isTurning = false) => (
    <div className="w-full h-full bg-[#0B0F19] relative overflow-hidden flex flex-col justify-between select-none">
      {/* Spine Fold Shadow (Shadow deepening from center binding) */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black/40 via-black/15 to-transparent pointer-events-none z-20" />
      <div className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-l from-black/20 to-transparent pointer-events-none z-20" />

      {/* Stacked Paper Edge on the Right (Gives physical book thickness) */}
      <div className="absolute right-0 top-0 bottom-0 w-2.5 bg-gradient-to-r from-slate-300 via-white to-slate-400 border-l border-black/40 pointer-events-none z-30" />

      {/* Full-Bleed Artwork with 3D Parallax Tilt */}
      <div
        className="absolute inset-0 transition-transform duration-200 ease-out"
        style={
          isTurning
            ? undefined
            : {
                transform: `scale(1.05) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
              }
        }
      >
        <img
          src={char.referenceImages[0] || "/characters/kaelen-warlord.jpg"}
          alt={char.name}
          className="w-full h-full object-cover object-top brightness-105 contrast-115 filter"
        />

        {/* ------------------------------------------------------------- */}
        {/* CHARACTER SIGNATURE ANIMATIONS & AMBIENT AURAS */}
        {/* ------------------------------------------------------------- */}
        {/* 1. Lord Thalassor: Aquatic rising bubbles and deep sea caustic light */}
        {char.id === "char-thalassor" && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute bottom-2 left-6 w-3 h-3 rounded-full bg-cyan-200/60 border border-white/80 shadow-[0_0_8px_#00E5FF] bubble-float-1" />
            <div className="absolute bottom-4 left-16 w-4 h-4 rounded-full bg-cyan-200/50 border border-white/80 shadow-[0_0_10px_#00E5FF] bubble-float-2" />
            <div className="absolute bottom-6 right-10 w-2.5 h-2.5 rounded-full bg-cyan-200/70 border border-white/80 shadow-[0_0_6px_#00E5FF] bubble-float-3" />
            <div className="absolute bottom-1 right-20 w-3.5 h-3.5 rounded-full bg-cyan-200/60 border border-white/80 shadow-[0_0_8px_#00E5FF] bubble-float-4" />
            <div className="absolute bottom-20 left-12 w-32 h-32 bg-[#00E5FF]/25 blur-xl rounded-full animate-pulse" />
          </div>
        )}

        {/* 2. Ren Volt: Cyber lightning arcs and glowing abs bio-mesh grid */}
        {char.id === "char-ren-volt" && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute inset-0 bg-radial from-[#10B981]/20 via-transparent to-transparent electric-pulse" />
            <div className="absolute top-1/4 right-8 w-1 h-28 bg-[#00E5FF] blur-[1px] rotate-12 opacity-75 animate-ping" />
            <div className="absolute top-1/3 left-10 w-1 h-20 bg-[#10B981] blur-[1px] -rotate-12 opacity-80 animate-pulse" />
          </div>
        )}

        {/* 3. Aoi Spark: Cyber-pop star rotation and digital neon wave */}
        {char.id === "char-aoi" && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-16 right-12 text-[#FFCC00] animate-spin" style={{ animationDuration: "12s" }}>
              <Star className="w-8 h-8 fill-[#FFCC00]/40 text-[#FFCC00]" />
            </div>
            <div className="absolute bottom-24 right-6 flex items-end gap-1 h-8 opacity-80">
              <span className="w-1 bg-[#00E5FF] h-full animate-pulse rounded-full" />
              <span className="w-1 bg-[#FF2A8D] h-3/4 animate-bounce rounded-full" />
              <span className="w-1 bg-[#FFCC00] h-5/6 animate-pulse rounded-full" />
              <span className="w-1 bg-[#00E5FF] h-1/2 animate-bounce rounded-full" />
            </div>
          </div>
        )}

        {/* 4. Kaelen Warlord: Celestial Constellation Twinkle */}
        {char.id === "char-kaelen" && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-28 left-8 w-2 h-2 rounded-full bg-[#FFCC00] shadow-[0_0_12px_#FFCC00] constellation-star" />
            <div className="absolute top-36 left-14 w-1.5 h-1.5 rounded-full bg-[#FFCC00] shadow-[0_0_8px_#FFCC00] constellation-star" />
            <div className="absolute top-48 left-10 w-2.5 h-2.5 rounded-full bg-[#FFCC00] shadow-[0_0_14px_#FFCC00] constellation-star" />
            <div className="absolute bottom-36 left-16 w-3 h-3 rounded-full bg-[#00E5FF] shadow-[0_0_15px_#00E5FF] animate-pulse" />
          </div>
        )}

        {/* 5. Elena Diaz: Solar flare warmth */}
        {char.id === "char-elena" && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-10 right-6 w-36 h-36 bg-[#FF2A8D]/25 blur-2xl rounded-full solar-flare" />
            <div className="absolute top-24 left-1/3 w-2 h-2 rounded-full bg-amber-200/80 shadow-[0_0_10px_#FFAA00] animate-ping" />
          </div>
        )}

        {/* General Aura Color Blend */}
        <div
          className="absolute inset-0 mix-blend-color-dodge opacity-25 pointer-events-none animate-pulse"
          style={{
            background: `radial-gradient(circle at 50% 40%, ${char.auraColor || "#00E5FF"}, transparent 70%)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-black/30 pointer-events-none" />
      </div>

      {/* Comic Variant Top Corner Seal */}
      <div className="relative z-10 p-4 flex items-center justify-between">
        <div className="bg-[#FFCC00] text-black font-bangers tracking-wider text-xs px-2.5 py-1 rounded border-2 border-black shadow-[2px_2px_0_#000] rotate-[-2deg]">
          VARIANT COVER ART
        </div>
        <div className="w-10 h-10 rounded-full bg-black/80 backdrop-blur-md border border-white/40 flex items-center justify-center text-white font-bangers text-xs shadow-lg">
          ★ 1st
        </div>
      </div>

      {/* Floating Character Lore Card at Bottom */}
      <div className="relative z-10 p-4 sm:p-6 space-y-2 bg-gradient-to-t from-black via-black/85 to-transparent">
        <div className="flex items-center justify-between">
          <span className="font-bangers text-xl sm:text-2xl text-white tracking-wider drop-shadow-md">
            {char.name}
          </span>
          <span
            className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border"
            style={{
              color: char.auraColor || "#00E5FF",
              borderColor: char.auraColor || "#00E5FF",
              backgroundColor: "rgba(0,0,0,0.6)",
            }}
          >
            {char.ageCategory}
          </span>
        </div>

        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-sans">
          {char.backstory}
        </p>

        {/* Action Prompt / Use in Story CTA */}
        <div className="pt-2 flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {char.personality.slice(0, 2).map((p, i) => (
              <span
                key={i}
                className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-200 border border-white/20"
              >
                {p}
              </span>
            ))}
          </div>

          {onSelectCharacterForStory && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectCharacterForStory(char);
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#00E5FF] hover:bg-[#38BDF8] text-black text-xs font-bangers tracking-wider uppercase font-bold shadow-md cursor-pointer transition-transform hover:scale-105"
            >
              <span>Use in Story</span>
              <ArrowRight className="w-3 h-3 stroke-[2.5]" />
            </button>
          )}
        </div>

        <div className="text-right text-[10px] font-mono text-slate-400 pt-1">
          PAGE {pageNum}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full flex flex-col items-center select-none py-2 space-y-4">
      {/* Comic Book Viewer Header Bar */}
      <div className="w-full max-w-5xl flex flex-col gap-2.5 px-3 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#00E5FF] animate-ping" />
            <span className="font-bangers tracking-wider text-xl sm:text-2xl text-white">
              <span className="text-[#00E5FF]">ANIMATION STYLE</span>{" "}
              <span className="text-[#FF2A8D]">MODELS</span>
            </span>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono text-[#FFCC00]">
              5 AI VISUAL MODELS • REALISTIC 3D TURN
            </span>
          </div>

          {/* Action Controls & Character Creation CTAs */}
          <div className="flex items-center gap-2">
            {onOpenCreateCharacter && (
              <button
                onClick={onOpenCreateCharacter}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#00E5FF] to-[#38BDF8] text-black font-bangers tracking-wider text-xs uppercase font-bold shadow-[0_0_12px_rgba(0,229,255,0.4)] hover:scale-105 transition-all cursor-pointer"
              >
                <span>+ Build Character</span>
              </button>
            )}

            {onOpenUploadStyle && (
              <button
                onClick={onOpenUploadStyle}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF2A8D]/20 hover:bg-[#FF2A8D] text-[#FF2A8D] hover:text-white border border-[#FF2A8D]/50 font-bangers tracking-wider text-xs uppercase font-bold transition-all cursor-pointer"
              >
                <span>+ Upload Style</span>
              </button>
            )}

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? "Mute Turn Sound" : "Enable Turn Sound"}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-[#00E5FF]" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {/* Auto-Play Flip */}
            <button
              onClick={() => setIsPlayingAuto(!isPlayingAuto)}
              title={isPlayingAuto ? "Pause Auto-Flip" : "Start Auto-Flip Slideshow"}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                isPlayingAuto
                  ? "bg-[#FF2A8D] border-[#FF2A8D] text-white shadow-[0_0_15px_rgba(255,42,141,0.5)]"
                  : "bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700"
              }`}
            >
              {isPlayingAuto ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isPlayingAuto ? "Auto Turning" : "Auto Turn"}</span>
            </button>
          </div>
        </div>

        {/* Informative Note: Anime Styles Not Fixed Characters */}
        <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[#FFCC00] font-bold">★ ANIMATION STYLE DNA:</span>
            <span>
              The 5 presets shown here are <strong>AI Animation & Art Style Rendering Models</strong>. Use them to render pages, or click <strong>Build Character</strong> to create your own hero with 3 separate reference image uploads!
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3D PHYSICAL COMIC BOOK CONTAINER */}
      {/* ========================================================================= */}
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
            title="Click to turn back (or use Left Arrow key)"
            className="w-1/2 h-full cursor-pointer group relative overflow-hidden border-r-2 border-black/40"
          >
            {/* If flipping PREV, underlying left page shows nextCharacter */}
            {isFlipping && flipDirection === "prev"
              ? renderDossierContent(nextCharacter, targetPageIndex * 2 + 1)
              : renderDossierContent(currentCharacter, currentPageIndex * 2 + 1)}

            {/* Cast shadow appearing on left page when turning NEXT towards it! */}
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
            title="Click to turn forward (or use Right Arrow key)"
            className="w-1/2 h-full cursor-pointer group relative overflow-hidden"
          >
            {/* If flipping NEXT, underlying right page shows nextCharacter */}
            {isFlipping && flipDirection === "next"
              ? renderCoverContent(nextCharacter, targetPageIndex * 2 + 2)
              : renderCoverContent(currentCharacter, currentPageIndex * 2 + 2)}

            {/* Cast shadow appearing on right page when turning PREV towards it! */}
            {isFlipping && flipDirection === "prev" && (
              <div className="absolute inset-0 pointer-events-none z-25 cast-shadow-left" />
            )}

            {/* Turn Page Callout Indicator */}
            {!isFlipping && (
              <div className="absolute bottom-2 right-4 z-20 pointer-events-none flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-xs text-[10px] font-mono text-[#FFCC00] border border-[#FFCC00]/50 shadow-md animate-pulse">
                <span>Click to turn page</span>
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
              {/* Dynamic travelling 3D curl sheen wave */}
              <div
                className={`absolute inset-0 pointer-events-none z-30 ${
                  flipDirection === "next" ? "curl-sheen-next" : "curl-sheen-prev"
                }`}
              />

              {/* FRONT FACE OF TURNING SHEET */}
              <div className="page-face page-face-front border border-black/30 shadow-2xl">
                {flipDirection === "next"
                  ? renderCoverContent(currentCharacter, currentPageIndex * 2 + 2, true)
                  : renderDossierContent(currentCharacter, currentPageIndex * 2 + 1)}
                {/* Dynamic bending page shadow/sheen overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-black/25 pointer-events-none" />
              </div>

              {/* BACK FACE OF TURNING SHEET (Revealed once page crosses 90 degrees) */}
              <div className="page-face page-face-back border border-black/30 shadow-2xl">
                {flipDirection === "next"
                  ? renderDossierContent(nextCharacter, targetPageIndex * 2 + 1)
                  : renderCoverContent(nextCharacter, targetPageIndex * 2 + 2, true)}
                {/* Dynamic landing shadow overlay */}
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
          title="Previous Page (Left Arrow)"
          className="absolute -left-3 sm:-left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#0E1424] hover:bg-[#00E5FF] text-white hover:text-black border-2 border-slate-700 hover:border-[#00E5FF] shadow-2xl flex items-center justify-center transition-all cursor-pointer z-40 group"
        >
          <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
        </button>

        {/* Next Page Navigation Clicker */}
        <button
          onClick={handleNext}
          title="Next Page (Right Arrow)"
          className="absolute -right-3 sm:-right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#0E1424] hover:bg-[#00E5FF] text-white hover:text-black border-2 border-slate-700 hover:border-[#00E5FF] shadow-2xl flex items-center justify-center transition-all cursor-pointer z-40 group"
        >
          <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* CHARACTER THUMBNAIL SCRUBBER / QUICK SWITCHER */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 sm:gap-3 p-2 bg-[#0E1424] border border-slate-800 rounded-2xl shadow-xl">
        {characters.map((char, idx) => (
          <button
            key={char.id}
            onClick={() => flipToPage(idx)}
            title={char.name}
            className={`group flex items-center justify-center p-1.5 rounded-xl border transition-all cursor-pointer ${
              idx === currentPageIndex
                ? "bg-[#00E5FF]/20 border-[#00E5FF] text-white shadow-[0_0_12px_rgba(0,229,255,0.4)]"
                : "border-slate-800 hover:border-slate-600 text-slate-400 hover:text-white bg-slate-900/60"
            }`}
          >
            <img
              src={char.referenceImages[0]}
              alt={char.name}
              className={`w-8 h-8 rounded-full object-cover border ${
                idx === currentPageIndex ? "border-[#00E5FF]" : "border-slate-700"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
