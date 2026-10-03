"use client";

import React, { useState, useEffect } from "react";
import { ComicProject } from "@/types/comic";
import { ComicCharacter } from "@/types/character";
import { ArtStylePreset } from "@/types/style";
import { AuthSession, UserProfile } from "@/types/auth";
import { StyleReferenceBook } from "@/components/styles/StyleReferenceBook";
import {
  BookOpen,
  Plus,
  Sparkles,
  Users,
  Palette,
  ArrowRight,
  Eye,
  Trash2,
  Calendar,
  Layers,
  Zap,
  Maximize2,
  Download,
  Flame,
} from "lucide-react";

interface DashboardViewProps {
  projects: ComicProject[];
  characters: ComicCharacter[];
  styles: ArtStylePreset[];
  session?: AuthSession;
  onOpenCreateModal: () => void;
  onOpenQuickGenerate: () => void;
  onSelectProject: (project: ComicProject) => void;
  onDeleteProject: (projectId: string) => void;
  onOpenReader: (project: ComicProject) => void;
  onOpenProfile?: () => void;
}

export function DashboardView({
  projects,
  characters,
  styles,
  session,
  onOpenCreateModal,
  onOpenQuickGenerate,
  onSelectProject,
  onDeleteProject,
  onOpenReader,
  onOpenProfile,
}: DashboardViewProps) {
  const [realUsers, setRealUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        if (data.users && Array.isArray(data.users)) {
          setRealUsers(data.users);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-12 text-[#F8FAFC]">
      {/* ========================================================================= */}
      {/* HERO SECTION — Matching & Elevating the Reference Image */}
      {/* ========================================================================= */}
      <section className="relative pt-2 pb-8">
        {/* Ambient atmospheric glows */}
        <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-[#00E5FF]/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-1/10 w-[450px] h-[450px] bg-[#FF2A8D]/15 blur-[140px] rounded-full pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Comic Title, Description, Stats & CTA */}
          <div className="lg:col-span-5 space-y-6 z-10">
            {/* Iconic Comic Headline in BANGERS */}
            <h1 className="font-bangers text-5xl sm:text-6xl xl:text-7xl tracking-wide uppercase leading-[0.93] drop-shadow-2xl">
              <span className="comic-title-cyan inline-block transform hover:-rotate-1 transition-transform cursor-default">
                CREATE
              </span>{" "}
              <span className="comic-title-pink inline-block transform hover:rotate-2 transition-transform cursor-default ml-1">
                EPIC
              </span>
              <br />
              <span className="comic-title-yellow inline-block transform hover:-rotate-2 transition-transform cursor-default">
                COMICS
              </span>{" "}
              <span className="comic-title-cyan inline-block transform hover:rotate-1 transition-transform cursor-default ml-1">
                WITH AI
              </span>
            </h1>

            {/* Subtitle / Description */}
            <p className="text-base sm:text-lg text-slate-300 font-sans max-w-lg leading-relaxed font-normal">
              Design characters, generate scenes, lay out pages and speech bubbles — all in one AI-powered comic studio.
            </p>

            {/* Social Proof Numbers (Cyan, Pink, Yellow) */}
            <div className="flex items-center gap-6 sm:gap-8 pt-1">
              <div>
                <div className="font-bangers text-3xl sm:text-4xl text-[#00E5FF] tracking-wider drop-shadow-md">
                  500K+
                </div>
                <div className="text-xs text-slate-400 font-medium">Users</div>
              </div>
              <div className="border-l border-slate-800 pl-6 sm:pl-8">
                <div className="font-bangers text-3xl sm:text-4xl text-[#FF2A8D] tracking-wider drop-shadow-md">
                  100K+
                </div>
                <div className="text-xs text-slate-400 font-medium">Characters created</div>
              </div>
              <div className="border-l border-slate-800 pl-6 sm:pl-8">
                <div className="font-bangers text-3xl sm:text-4xl text-[#FFCC00] tracking-wider drop-shadow-md">
                  10M+
                </div>
                <div className="text-xs text-slate-400 font-medium">Scenes Generated</div>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                {/* Big Cyan Hero Button */}
                <button
                  onClick={onOpenCreateModal}
                  className="comic-btn-cyan flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bangers text-2xl tracking-wider uppercase cursor-pointer"
                >
                  <span>Start Creating</span>
                  <ArrowRight className="w-5 h-5 stroke-[3]" />
                </button>

                {/* Secondary AI Story Button */}
                <button
                  onClick={onOpenQuickGenerate}
                  className="flex items-center justify-center gap-2 px-5 py-4 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-sm font-semibold hover:border-[#00E5FF]/60 transition-all cursor-pointer shadow-lg"
                >
                  <Sparkles className="w-4 h-4 text-[#FF2A8D]" />
                  <span>"Make It For Me" AI</span>
                </button>
              </div>

              {/* Tagline below CTA */}
              <p className="text-xs text-slate-400 tracking-wide font-sans">
                Start free — upgrade anytime • No art skills needed.
              </p>
            </div>
          </div>

          {/* Right Column: 3D Realistic Anime Style Reference Book */}
          <div className="lg:col-span-7 z-10 w-full flex items-center justify-center">
            <StyleReferenceBook
              styles={styles}
              onSelectStyleForStory={(style) => {
                onOpenCreateModal();
              }}
              onOpenCreateModal={onOpenCreateModal}
            />
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* QUICK INSPIRATION GENERATOR BAR */}
      {/* ========================================================================= */}
      <section className="p-4 sm:p-5 rounded-2xl border border-slate-800 bg-[#0F1524]/90 backdrop-blur-md shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md border border-amber-400/40 bg-[#090D16] shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Create Comic Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-bangers text-lg tracking-wide text-white flex items-center gap-2">
              Ready to create something legendary?
              <span className="text-xs font-sans font-medium px-2 py-0.5 rounded-full bg-[#FF2A8D]/20 text-[#FF2A8D] border border-[#FF2A8D]/40">
                1-Click Prompts
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Pick a trending comic universe and generate a multi-page story in seconds.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenQuickGenerate}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:border-[#00E5FF] text-slate-200 hover:text-[#00E5FF] transition-all cursor-pointer"
          >
            🐉 Thunder Dragon Chronicles
          </button>
          <button
            onClick={onOpenQuickGenerate}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:border-[#FF2A8D] text-slate-200 hover:text-[#FF2A8D] transition-all cursor-pointer"
          >
            🏙️ Neo-Tokyo 2099 Cyberpunk
          </button>
          <button
            onClick={onOpenCreateModal}
            className="text-xs font-bold px-3.5 py-1.5 rounded-lg bg-[#00E5FF] text-black hover:bg-[#38BDF8] transition-colors cursor-pointer"
          >
            + Custom Story
          </button>
        </div>
      </section>



      {/* ========================================================================= */}
      {/* RECENT PROJECTS SECTION */}
      {/* ========================================================================= */}
      <section className="space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-[#00E5FF]" />
            <h2 className="font-bangers text-2xl tracking-wide text-white">Your Comic Library</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono">{projects.length} Projects</span>
            <button
              onClick={onOpenCreateModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>New Comic</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const pageCount = project.chapters.reduce(
              (acc, c) => acc + c.scenes.reduce((pAcc, s) => pAcc + s.pages.length, 0),
              0
            );

            return (
              <div
                key={project.id}
                className="group bg-[#0E1424] border border-slate-800 hover:border-[#00E5FF] rounded-xl overflow-hidden shadow-lg hover:shadow-cyan-glow/20 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail / Cover Art */}
                  <div className="relative h-48 bg-slate-900 overflow-hidden border-b border-slate-800">
                    {project.coverImage ? (
                      <img
                        src={project.coverImage}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500 font-bangers text-base">
                        No Cover Rendered
                      </div>
                    )}

                    {/* Format Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="font-bangers text-xs tracking-wider uppercase px-2.5 py-0.5 rounded bg-black/80 backdrop-blur-md text-[#00E5FF] border border-[#00E5FF]/40">
                        {project.readingDirection === "rtl" ? "Manga (RTL)" : "Comic (LTR)"}
                      </span>
                    </div>

                    {/* Quick Read Icon Overlay */}
                    <button
                      onClick={() => onOpenReader(project)}
                      title="Read in physical page turn mode"
                      className="absolute top-3 right-3 p-2 rounded-full bg-black/80 hover:bg-[#FF2A8D] text-white transition-colors cursor-pointer shadow-md"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2">
                    <h3 className="font-bangers text-xl text-white group-hover:text-[#00E5FF] transition-colors line-clamp-1 tracking-wide">
                      {project.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {project.metadata.logline || project.metadata.premise}
                    </p>

                    {/* Genre tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {project.metadata.genre.slice(0, 3).map((g, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800/90 text-slate-300 border border-slate-700"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 bg-slate-950/40">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-semibold text-slate-300">
                      {pageCount} {pageCount === 1 ? "Page" : "Pages"}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      v{project.version || 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {projects.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteProject(project.id);
                        }}
                        title="Delete project"
                        className="text-slate-500 hover:text-[#EF4444] p-1.5 rounded hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => onSelectProject(project)}
                      className="px-3.5 py-1.5 rounded-lg bg-[#00E5FF] hover:bg-[#38BDF8] text-black text-xs font-bangers tracking-wider uppercase flex items-center gap-1.5 transition-colors cursor-pointer font-bold shadow-md"
                    >
                      <span>Open Studio</span>
                      <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* CHARACTER CONTINUITY & ART ENGINE TILES */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
        {/* Real Community Creators & Logged-In Users */}
        <div className="bg-[#0E1424] border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#00E5FF]" />
              <h3 className="font-bangers text-lg tracking-wide text-white">Registered Creators</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {realUsers.length > 0 ? `${realUsers.length} Members` : "Community"}
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Authentic registered creators and authenticated studio members.
          </p>
          <div className="flex items-center gap-4 pt-2 overflow-x-auto pb-1">
            {realUsers.map((user) => {
              const isOnline = Boolean(
                session?.isAuthenticated &&
                  (session.user?.id === user.id || session.user?.email === user.email)
              );

              return (
                <div
                  key={user.id}
                  onClick={() => {
                    if (onOpenProfile) onOpenProfile();
                  }}
                  title="Click to view creator profile & creativity matrix"
                  className="flex flex-col items-center gap-1.5 group shrink-0 cursor-pointer"
                >
                  <div className="relative">
                    <img
                      src={
                        user.avatarUrl ||
                        `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(user.email)}`
                      }
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-slate-700 group-hover:border-[#00E5FF] transition-colors shadow-md bg-slate-900"
                    />
                    {isOnline && (
                      <span
                        title="Online"
                        className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#10B981] border-2 border-[#0E1424] shadow-sm animate-pulse"
                      />
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-slate-200 max-w-[85px] truncate text-center group-hover:text-white">
                    {user.name}
                  </span>
                  {isOnline && (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Online
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Style Engine */}
        <div className="bg-[#0E1424] border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#FFCC00]" />
              <h3 className="font-bangers text-lg tracking-wide text-white">Art Style Engines</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">{styles.length} Styles</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Authentic Manga screentone, Graphic Novel Noir, High-Octane Anime, and Golden Age Comic Book rendering.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-2">
            {styles.map((s) => (
              <span
                key={s.id}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:border-[#FFCC00] hover:text-[#FFCC00] transition-colors cursor-pointer"
              >
                {s.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
