"use client";

import React, { useState, useEffect, useRef } from "react";
import { ComicPage, ReadingDirection, ComicProject } from "@/types/comic";
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react";

interface PhysicalPageTurnProps {
  pages: ComicPage[];
  currentPageIndex: number;
  onPageChange: (newIndex: number) => void;
  readingDirection: ReadingDirection;
  project?: ComicProject;
  viewLayout?: "spread" | "single";
}

/**
 * Realistic Web Audio API acoustic paper rustle & gentle air whoosh
 */
function playPaperTurnSound() {
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const duration = 0.55; // 550ms gentle tactile rustle matching slow turn
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const progress = i / bufferSize;
      // Gentle arching envelope with soft tactile fade
      const envelope = Math.sin(progress * Math.PI) * Math.pow(1 - progress, 0.4);
      data[i] = (Math.random() * 2 - 1) * 0.07 * envelope;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(520, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + duration * 0.6);
    filter.frequency.exponentialRampToValueAtTime(450, ctx.currentTime + duration);
    filter.Q.setValueAtTime(0.85, ctx.currentTime);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.005, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.12);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    noise.start();
  } catch {
    // AudioContext policy
  }
}

// 1100ms slow, velvety, physical paper turn
const TURN_DURATION_MS = 1100;

export function PhysicalPageTurn({
  pages,
  currentPageIndex,
  onPageChange,
  readingDirection,
  project,
  viewLayout = "spread",
}: PhysicalPageTurnProps) {
  const [turningDirection, setTurningDirection] = useState<"next" | "prev" | null>(null);
  const [turnProgress, setTurnProgress] = useState<number>(0); // 0 -> 1
  const [isAnimating, setIsAnimating] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const isRtl = readingDirection === "rtl";

  // Calculate pages for current spread mode
  const isCover = currentPageIndex === 0;
  const leftPageIndex = isCover ? -1 : currentPageIndex % 2 === 1 ? currentPageIndex : currentPageIndex - 1;
  const rightPageIndex = isCover ? -1 : leftPageIndex + 1;

  const leftPage = leftPageIndex >= 0 && leftPageIndex < pages.length ? pages[leftPageIndex] : null;
  const rightPage = rightPageIndex >= 0 && rightPageIndex < pages.length ? pages[rightPageIndex] : null;

  // Next and Prev Target Indices
  const getNextIndex = () => {
    if (viewLayout === "spread") {
      if (isCover) return 1;
      return Math.min(currentPageIndex + 2, pages.length - 1);
    }
    return Math.min(currentPageIndex + 1, pages.length - 1);
  };

  const getPrevIndex = () => {
    if (viewLayout === "spread") {
      if (currentPageIndex <= 2) return 0;
      return Math.max(currentPageIndex - 2, 0);
    }
    return Math.max(currentPageIndex - 1, 0);
  };

  const handleNext = () => {
    if (currentPageIndex >= pages.length - 1 || isAnimating) return;
    setIsAnimating(true);
    setTurningDirection("next");
    setTurnProgress(0);

    if (soundEnabled) playPaperTurnSound();

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTurnProgress(1);
      });
    });

    setTimeout(() => {
      onPageChange(getNextIndex());
      setTurningDirection(null);
      setTurnProgress(0);
      setIsAnimating(false);
    }, TURN_DURATION_MS);
  };

  const handlePrev = () => {
    if (currentPageIndex <= 0 || isAnimating) return;
    setIsAnimating(true);
    setTurningDirection("prev");
    setTurnProgress(0);

    if (soundEnabled) playPaperTurnSound();

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTurnProgress(1);
      });
    });

    setTimeout(() => {
      onPageChange(getPrevIndex());
      setTurningDirection(null);
      setTurnProgress(0);
      setIsAnimating(false);
    }, TURN_DURATION_MS);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        if (isRtl) handlePrev();
        else handleNext();
      } else if (e.key === "ArrowLeft") {
        if (isRtl) handleNext();
        else handlePrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPageIndex, isAnimating, isRtl, viewLayout, soundEnabled]);

  // Compute target pages during animation
  const nextTargetIdx = getNextIndex();
  const nextIsCover = nextTargetIdx === 0;
  const nextLeftIdx = nextIsCover ? -1 : nextTargetIdx % 2 === 1 ? nextTargetIdx : nextTargetIdx - 1;
  const nextRightIdx = nextIsCover ? -1 : nextLeftIdx + 1;
  const targetNextLeftPage = nextLeftIdx >= 0 && nextLeftIdx < pages.length ? pages[nextLeftIdx] : null;
  const targetNextRightPage = nextRightIdx >= 0 && nextRightIdx < pages.length ? pages[nextRightIdx] : null;

  const prevTargetIdx = getPrevIndex();
  const prevIsCover = prevTargetIdx === 0;
  const prevLeftIdx = prevIsCover ? -1 : prevTargetIdx % 2 === 1 ? prevTargetIdx : prevTargetIdx - 1;
  const prevRightIdx = prevIsCover ? -1 : prevLeftIdx + 1;
  const targetPrevLeftPage = prevLeftIdx >= 0 && prevLeftIdx < pages.length ? pages[prevLeftIdx] : null;
  const targetPrevRightPage = prevRightIdx >= 0 && prevRightIdx < pages.length ? pages[prevRightIdx] : null;

  // Single page render helper
  const renderSingleComicPage = (page: ComicPage, isLeft: boolean, isRight: boolean) => {
    return (
      <div
        className={`relative flex-1 h-full bg-[#FAF8F5] flex flex-col justify-between p-5 overflow-hidden select-none ${
          isLeft ? "border-r border-[#D8D3CA]" : ""
        }`}
        style={{
          boxShadow: isLeft
            ? "inset -12px 0 24px -12px rgba(0, 0, 0, 0.18)"
            : "inset 12px 0 24px -12px rgba(0, 0, 0, 0.18)",
        }}
      >
        {/* Page Top Margins */}
        <div className="flex items-center justify-between text-[11px] font-mono text-[#77736C] pb-2 border-b border-[#E8E4DC]">
          <span className="uppercase tracking-widest text-[9px] font-bold text-[#171717]">
            {project?.title || "COMIC PUBLICATION"}
          </span>
          <span className="font-bold text-[#B84A39]">PAGE {page.pageNumber}</span>
        </div>

        {/* Panel Rendering on Page */}
        <div className="flex-1 my-3 grid grid-cols-2 gap-2.5 overflow-hidden">
          {page.panels.map((panel, idx) => (
            <div
              key={panel.id || idx}
              className={`relative border-2 border-[#111110] bg-[#F3F0EA] overflow-hidden rounded-xs shadow-sm ${
                panel.aspectRatio === "16:9" || page.panels.length === 1 ? "col-span-2" : "col-span-1"
              }`}
            >
              {panel.imageUrl ? (
                <img
                  src={panel.imageUrl}
                  alt={panel.prompt}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center p-3 text-center text-xs text-[#77736C] italic">
                  {panel.prompt}
                </div>
              )}

              {/* Dialogue bubbles */}
              {panel.bubbles.map((b) => (
                <div
                  key={b.id}
                  className={`absolute max-w-[85%] text-[10px] font-comic shadow-md ${
                    b.type === "narration"
                      ? "top-1 left-1 bg-[#FEF08A] text-[#171717] border border-[#111110] px-2 py-0.5 font-bold"
                      : "bottom-1.5 left-2 bg-white/95 text-[#171717] border border-[#111110] px-2.5 py-0.5 rounded-full font-medium"
                  }`}
                >
                  {b.speaker ? <span className="font-bold text-[#77736C]">{b.speaker}: </span> : null}
                  {b.text}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Page Footer */}
        <div className="flex items-center justify-between text-[10px] text-[#77736C] pt-2 border-t border-[#E8E4DC]">
          <span className="font-serif italic text-[#9E9991]">
            {isRtl ? "RTL Manga Sequence" : "Graphic Novel Spread"}
          </span>
          <span className="font-mono text-[#171717] font-bold">
            {Math.round((page.pageNumber / Math.max(pages.length, 1)) * 100)}%
          </span>
        </div>
      </div>
    );
  };

  // Front Cover Render
  const renderCover = (page?: ComicPage) => {
    const coverImage = project?.coverImage || page?.panels[0]?.imageUrl;
    return (
      <div className="relative w-full h-full bg-[#111110] rounded-xs shadow-2xl flex flex-col justify-between overflow-hidden border-4 border-[#2A2927]">
        {coverImage && (
          <div className="absolute inset-0">
            <img
              src={coverImage}
              alt="Comic Cover"
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/80" />
          </div>
        )}

        <div className="relative z-10 p-5 flex items-center justify-between">
          <div className="bg-[#FF2A8D] text-white px-2.5 py-1 rounded text-xs font-bangers tracking-wider shadow-lg">
            ISSUE #1
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#00E5FF] uppercase block">
              CREATE COMIC APP
            </span>
            <span className="text-[9px] text-slate-300">COLLECTOR EDITION</span>
          </div>
        </div>

        <div className="relative z-10 px-6 text-center my-auto">
          <h1 className="text-3xl md:text-4xl font-bangers tracking-wider text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)] uppercase mb-2">
            {project?.title || "THE ADVENTURE BEGINS"}
          </h1>
          <p className="text-xs text-slate-300 font-serif italic max-w-sm mx-auto line-clamp-2">
            {project?.metadata.logline || "A groundbreaking tale rendered with Multimodal AI."}
          </p>
        </div>

        <div className="relative z-10 p-5 bg-[#090D16]/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
          <div>
            <div className="font-bold text-white uppercase text-[11px]">
              {project?.metadata.genre.join(" • ") || "GRAPHIC NOVEL"}
            </div>
            <div className="text-[10px] text-slate-400">
              Direction: {project?.readingDirection.toUpperCase() || "LTR"}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-white p-1 rounded">
              <div className="h-6 w-16 bg-black flex items-center justify-center text-[7px] text-white font-mono font-bold">
                BARCODE
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />
      </div>
    );
  };

  // Inside Cover Editorial Page
  const renderInsideCover = () => {
    return (
      <div className="relative w-full h-full bg-[#FAF8F5] p-8 flex flex-col justify-between border-r border-[#D8D3CA] text-[#171717] select-none">
        <div className="border-b-2 border-black pb-3">
          <h2 className="font-bangers text-2xl tracking-wide uppercase text-black">
            {project?.title || "CREATE COMIC"}
          </h2>
          <div className="text-[10px] font-mono text-[#77736C]">
            OFFICIAL FIRST EDITION • ALL RIGHTS RESERVED
          </div>
        </div>

        <div className="my-auto space-y-4 text-xs font-serif leading-relaxed text-[#44403C]">
          <p className="italic">
            &ldquo;Every legend begins on an empty page. Drawn with intention, bound by imagination.&rdquo;
          </p>
          <div className="pt-2 border-t border-[#E8E4DC] text-[11px] font-mono space-y-1 text-[#77736C]">
            <div>STORY & CONCEPT: {project?.metadata.targetAudience || "General Readers"}</div>
            <div>GENRE: {project?.metadata.genre.join(", ") || "Action"}</div>
            <div>VISUAL ENGINE: Create Comic Studio</div>
          </div>
        </div>

        <div className="pt-4 border-t border-black flex items-center justify-between text-[10px] font-mono text-[#77736C]">
          <span>ISSUE #1</span>
          <span>PAGE 0 • PROLOGUE</span>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full max-w-[1120px] h-[86vh] flex items-center justify-center select-none px-4">
      {/* Sound Toggle Floating Control */}
      <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="absolute top-2 right-4 z-40 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        title={soundEnabled ? "Mute Page Turn Sound" : "Enable Realistic Paper Sound"}
      >
        {soundEnabled ? (
          <>
            <Volume2 className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span className="text-[10px] hidden sm:inline">Audio On</span>
          </>
        ) : (
          <>
            <VolumeX className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] hidden sm:inline">Audio Muted</span>
          </>
        )}
      </button>

      {/* Navigation Arrow Left */}
      <button
        onClick={isRtl ? handleNext : handlePrev}
        disabled={isRtl ? currentPageIndex >= pages.length - 1 : currentPageIndex <= 0 || isAnimating}
        className="absolute left-1 md:-left-12 z-40 p-3.5 rounded-full bg-[#FAF8F5]/90 hover:bg-[#FFFFFF] border border-[#D8D3CA] text-[#171717] shadow-2xl disabled:opacity-20 cursor-pointer transition-all hover:scale-105 active:scale-95"
        title="Previous Page (Left Arrow)"
      >
        <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* 3D Perspective Stage — 2800px deep perspective for natural paper curvature */}
      <div
        className={`relative w-full h-full flex items-center justify-center ${
          viewLayout === "spread" && !isCover ? "max-w-[1040px]" : "max-w-[560px]"
        }`}
        style={{
          perspective: "2800px",
          perspectiveOrigin: "50% 50%",
        }}
      >
        {/* ========================================================================= */}
        {/* 1. FRONT COVER TO OPEN BOOK SPREAD TRANSITION */}
        {/* ========================================================================= */}
        {isCover ? (
          <div
            className="relative w-full h-full flex items-center justify-center"
            style={{
              perspective: "2800px",
            }}
          >
            {/* The Front Cover Sheet */}
            <div
              className="relative w-full h-full rounded-sm"
              style={{
                transformStyle: "preserve-3d",
                transformOrigin: "left center",
                transition: isAnimating && turningDirection === "next"
                  ? `transform ${TURN_DURATION_MS}ms cubic-bezier(0.28, 0.84, 0.42, 1), box-shadow ${TURN_DURATION_MS}ms ease`
                  : "none",
                transform:
                  turningDirection === "next" && turnProgress === 1
                    ? "rotateY(-180deg) translateZ(4px)"
                    : "rotateY(0deg) translateZ(0px)",
                boxShadow:
                  turningDirection === "next" && turnProgress === 1
                    ? "-35px 20px 50px rgba(0, 0, 0, 0.6)"
                    : "0 25px 60px rgba(0, 0, 0, 0.85)",
                willChange: "transform, box-shadow",
              }}
            >
              {/* Front Face: Glossy Comic Cover */}
              <div
                className="absolute inset-0 w-full h-full overflow-hidden rounded-sm"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
              >
                {renderCover(pages[0])}

                {/* Moving paper curvature shadow & highlight sheen during open */}
                <div
                  className="absolute inset-0 pointer-events-none transition-opacity"
                  style={{
                    background:
                      "linear-gradient(to right, rgba(0,0,0,0.5) 0%, rgba(255,255,255,0.2) 25%, rgba(0,0,0,0.3) 60%, transparent 100%)",
                    opacity: turnProgress === 1 ? 0.7 : 0,
                    transition: `opacity ${TURN_DURATION_MS}ms ease`,
                  }}
                />
              </div>

              {/* Back Face: Inside Front Cover Editorial */}
              <div
                className="absolute inset-0 w-full h-full overflow-hidden rounded-sm"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                {renderInsideCover()}

                {/* Shading settling on left */}
                <div
                  className="absolute inset-0 pointer-events-none transition-opacity"
                  style={{
                    background:
                      "linear-gradient(to left, rgba(0,0,0,0.35) 0%, transparent 40%)",
                    opacity: turnProgress === 1 ? 0.1 : 0.6,
                    transition: `opacity ${TURN_DURATION_MS}ms ease`,
                  }}
                />
              </div>
            </div>

            {/* Revealed Page 1 underneath on the right as cover opens */}
            {turningDirection === "next" && pages[1] && (
              <div
                className="absolute top-0 right-0 w-[50%] h-full rounded-sm border-4 border-[#171717] overflow-hidden -z-10 bg-[#FAF8F5] shadow-xl"
                style={{
                  transform: "translateX(50%)",
                }}
              >
                {renderSingleComicPage(pages[1], false, true)}
              </div>
            )}
          </div>
        ) : viewLayout === "spread" ? (
          /* ========================================================================= */
          /* 2. TWO-PAGE OPEN SPREAD: BENDING 3D PHYSICAL DUAL-LEAF PAGE TURN */
          /* ========================================================================= */
          <div
            className="relative w-full h-full flex rounded-sm border-4 border-[#171717] shadow-[0_30px_70px_rgba(0,0,0,0.9)] bg-[#FAF8F5]"
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            {/* Left Static Base Slot */}
            <div className="flex-1 h-full flex overflow-hidden relative">
              {turningDirection === "prev"
                ? targetPrevLeftPage
                  ? renderSingleComicPage(targetPrevLeftPage, true, false)
                  : prevIsCover
                  ? renderInsideCover()
                  : <div className="flex-1 bg-[#F5F2EB]" />
                : leftPage
                ? renderSingleComicPage(leftPage, true, false)
                : <div className="flex-1 bg-[#F5F2EB]" />}

              {/* Dynamic drop-shadow cast onto left page when turning left/back */}
              <div
                className="absolute inset-0 pointer-events-none transition-opacity"
                style={{
                  background: "linear-gradient(to right, transparent 50%, rgba(0,0,0,0.35) 100%)",
                  opacity: turningDirection === "next" && turnProgress === 1 ? 0.45 : 0,
                  transition: `opacity ${TURN_DURATION_MS}ms ease`,
                }}
              />
            </div>

            {/* Central Book Spine & Natural Binding Depth */}
            <div className="w-2 bg-[#111110] shadow-[0_0_12px_rgba(0,0,0,0.8)] z-20 flex-shrink-0 relative">
              {/* Dynamic Crease Shadow Spans */}
              <div className="absolute inset-y-0 -left-8 w-8 bg-gradient-to-r from-transparent to-black/25 pointer-events-none" />
              <div className="absolute inset-y-0 -right-8 w-8 bg-gradient-to-l from-transparent to-black/25 pointer-events-none" />
            </div>

            {/* Right Static Base Slot */}
            <div className="flex-1 h-full flex overflow-hidden relative">
              {turningDirection === "next"
                ? targetNextRightPage
                  ? renderSingleComicPage(targetNextRightPage, false, true)
                  : <div className="flex-1 bg-[#F5F2EB]" />
                : rightPage
                ? renderSingleComicPage(rightPage, false, true)
                : <div className="flex-1 bg-[#F5F2EB]" />}

              {/* Dynamic drop-shadow cast onto right page when right leaf lifts */}
              <div
                className="absolute inset-0 pointer-events-none transition-opacity"
                style={{
                  background: "linear-gradient(to left, transparent 50%, rgba(0,0,0,0.35) 100%)",
                  opacity: turningDirection === "prev" && turnProgress === 1 ? 0.45 : 0,
                  transition: `opacity ${TURN_DURATION_MS}ms ease`,
                }}
              />
            </div>

            {/* ========================================================================= */}
            {/* NEXT TURN LEAF: Bends from right to left across the spine */}
            {/* ========================================================================= */}
            {turningDirection === "next" && rightPage && (
              <div
                className="absolute top-0 right-0 w-[calc(50%-4px)] h-full z-30 pointer-events-none"
                style={{
                  transformOrigin: "left center",
                  transformStyle: "preserve-3d",
                  transition: `transform ${TURN_DURATION_MS}ms cubic-bezier(0.28, 0.84, 0.42, 1), box-shadow ${TURN_DURATION_MS}ms ease`,
                  transform:
                    turnProgress === 1
                      ? "rotateY(-180deg) translateZ(4px) skewY(0deg)"
                      : "rotateY(0deg) translateZ(0px) skewY(0deg)",
                  boxShadow:
                    turnProgress === 1
                      ? "-32px 16px 45px rgba(0, 0, 0, 0.55)"
                      : "0px 0px 0px rgba(0, 0, 0, 0)",
                  willChange: "transform, box-shadow",
                }}
              >
                {/* Front Face: Current Right Page Lifting & Curving */}
                <div
                  className="absolute inset-0 w-full h-full overflow-hidden bg-[#FAF8F5]"
                  style={{
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                  }}
                >
                  {renderSingleComicPage(rightPage, false, true)}

                  {/* Physical Cylindrical Paper Crease Highlight & Shadow */}
                  <div
                    className="absolute inset-0 pointer-events-none transition-opacity"
                    style={{
                      background:
                        "linear-gradient(to left, rgba(0,0,0,0.45) 0%, rgba(255,255,255,0.25) 20%, rgba(0,0,0,0.3) 45%, transparent 100%)",
                      opacity: turnProgress === 1 ? 0.85 : 0,
                      transition: `opacity ${TURN_DURATION_MS}ms ease`,
                    }}
                  />
                </div>

                {/* Back Face: Target Next Left Page Landing */}
                <div
                  className="absolute inset-0 w-full h-full overflow-hidden bg-[#FAF8F5]"
                  style={{
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  {targetNextLeftPage ? (
                    renderSingleComicPage(targetNextLeftPage, true, false)
                  ) : (
                    <div className="flex-1 h-full bg-[#F5F2EB]" />
                  )}

                  {/* Gentle shadow dissipating as page settles onto left spread */}
                  <div
                    className="absolute inset-0 pointer-events-none transition-opacity"
                    style={{
                      background:
                        "linear-gradient(to right, rgba(0,0,0,0.4) 0%, rgba(255,255,255,0.18) 25%, transparent 70%)",
                      opacity: turnProgress === 1 ? 0.05 : 0.7,
                      transition: `opacity ${TURN_DURATION_MS}ms ease`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PREV TURN LEAF: Bends from left to right across the spine */}
            {/* ========================================================================= */}
            {turningDirection === "prev" && (leftPage || prevIsCover) && (
              <div
                className="absolute top-0 left-0 w-[calc(50%-4px)] h-full z-30 pointer-events-none"
                style={{
                  transformOrigin: "right center",
                  transformStyle: "preserve-3d",
                  transition: `transform ${TURN_DURATION_MS}ms cubic-bezier(0.28, 0.84, 0.42, 1), box-shadow ${TURN_DURATION_MS}ms ease`,
                  transform:
                    turnProgress === 1
                      ? "rotateY(180deg) translateZ(4px) skewY(0deg)"
                      : "rotateY(0deg) translateZ(0px) skewY(0deg)",
                  boxShadow:
                    turnProgress === 1
                      ? "32px 16px 45px rgba(0, 0, 0, 0.55)"
                      : "0px 0px 0px rgba(0, 0, 0, 0)",
                  willChange: "transform, box-shadow",
                }}
              >
                {/* Front Face: Current Left Page Lifting & Curving */}
                <div
                  className="absolute inset-0 w-full h-full overflow-hidden bg-[#FAF8F5]"
                  style={{
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                  }}
                >
                  {leftPage ? renderSingleComicPage(leftPage, true, false) : renderInsideCover()}

                  {/* Dynamic Shading on Front Face while turning right */}
                  <div
                    className="absolute inset-0 pointer-events-none transition-opacity"
                    style={{
                      background:
                        "linear-gradient(to right, rgba(0,0,0,0.45) 0%, rgba(255,255,255,0.25) 20%, rgba(0,0,0,0.3) 45%, transparent 100%)",
                      opacity: turnProgress === 1 ? 0.85 : 0,
                      transition: `opacity ${TURN_DURATION_MS}ms ease`,
                    }}
                  />
                </div>

                {/* Back Face: Target Prev Right Page Landing */}
                <div
                  className="absolute inset-0 w-full h-full overflow-hidden bg-[#FAF8F5]"
                  style={{
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  {targetPrevRightPage ? (
                    renderSingleComicPage(targetPrevRightPage, false, true)
                  ) : prevIsCover ? (
                    renderCover(pages[0])
                  ) : (
                    <div className="flex-1 h-full bg-[#F5F2EB]" />
                  )}

                  {/* Gentle shadow dissipating as page settles onto right spread */}
                  <div
                    className="absolute inset-0 pointer-events-none transition-opacity"
                    style={{
                      background:
                        "linear-gradient(to left, rgba(0,0,0,0.4) 0%, rgba(255,255,255,0.18) 25%, transparent 70%)",
                      opacity: turnProgress === 1 ? 0.05 : 0.7,
                      transition: `opacity ${TURN_DURATION_MS}ms ease`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ========================================================================= */
          /* 3. SINGLE PAGE FOCUS MODE: TACTILE 3D PAPER SLIDE & CURL */
          /* ========================================================================= */
          <div
            className="relative w-full h-full rounded-sm border-4 border-[#171717] shadow-2xl overflow-hidden bg-[#FAF8F5]"
            style={{
              transformStyle: "preserve-3d",
              transition: isAnimating
                ? `transform ${TURN_DURATION_MS}ms cubic-bezier(0.28, 0.84, 0.42, 1), opacity ${TURN_DURATION_MS}ms ease, box-shadow ${TURN_DURATION_MS}ms ease`
                : "none",
              transformOrigin: isRtl ? "right center" : "left center",
              transform:
                isAnimating && turnProgress === 1
                  ? turningDirection === "next"
                    ? "rotateY(-35deg) scale(0.96) translateZ(20px)"
                    : "rotateY(35deg) scale(0.96) translateZ(20px)"
                  : "rotateY(0deg) scale(1) translateZ(0px)",
              opacity: isAnimating && turnProgress === 1 ? 0.25 : 1,
              boxShadow:
                isAnimating && turnProgress === 1
                  ? "0 35px 60px rgba(0,0,0,0.6)"
                  : "0 20px 45px rgba(0,0,0,0.4)",
              willChange: "transform, opacity, box-shadow",
            }}
          >
            {renderSingleComicPage(pages[currentPageIndex], false, false)}
          </div>
        )}
      </div>

      {/* Navigation Arrow Right */}
      <button
        onClick={isRtl ? handlePrev : handleNext}
        disabled={isRtl ? currentPageIndex <= 0 : currentPageIndex >= pages.length - 1 || isAnimating}
        className="absolute right-1 md:-right-12 z-40 p-3.5 rounded-full bg-[#FAF8F5]/90 hover:bg-[#FFFFFF] border border-[#D8D3CA] text-[#171717] shadow-2xl disabled:opacity-20 cursor-pointer transition-all hover:scale-105 active:scale-95"
        title="Next Page (Right Arrow)"
      >
        <ChevronRight className="w-6 h-6 stroke-[2.5]" />
      </button>
    </div>
  );
}
