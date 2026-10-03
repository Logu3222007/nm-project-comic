"use client";

import React from "react";
import {
  BookOpen,
  Palette,
  Users,
  Cpu,
  Eye,
  Download,
  Save,
  CheckCircle2,
  Sparkles,
  Layers,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Zap,
  User,
} from "lucide-react";
import { AuthSession } from "@/types/auth";
import { ComicProject } from "@/types/comic";

export type ActiveTab = "dashboard" | "editor" | "characters" | "styles" | "models";

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeProject: ComicProject | null;
  saveStatus: "saved" | "saving" | "offline";
  onOpenReader: () => void;
  onOpenExport: () => void;
  session: AuthSession;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onOpenUpgrade: () => void;
  onOpenProfile?: () => void;
}

export function Navbar({
  activeTab,
  setActiveTab,
  activeProject,
  saveStatus,
  onOpenReader,
  onOpenExport,
  session,
  onOpenAuth,
  onSignOut,
  onOpenUpgrade,
  onOpenProfile,
}: NavbarProps) {
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#0B0F19]/95 backdrop-blur-md px-4 lg:px-6 py-2.5 flex items-center justify-between text-[#F8FAFC]">
      {/* Brand & Project Info */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => setActiveTab("dashboard")}
          className="flex items-center gap-2.5 group cursor-pointer text-left focus:outline-none"
        >
          {/* Comic Action Logo Badge */}
          <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(0,229,255,0.4)] border border-amber-400/40 group-hover:scale-105 transition-transform bg-[#090D16] shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Create Comic App Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="font-bangers tracking-wider text-base text-white flex items-center gap-1.5 leading-none">
              <span className="text-[#00E5FF]">CREATE</span>
              <span className="text-[#FFB800]">COMIC</span>
              <span className="text-[10px] tracking-normal font-mono font-bold px-1.5 py-0.5 rounded bg-[#FF2A8D]/20 text-[#FF2A8D] border border-[#FF2A8D]/40">
                APP
              </span>
            </div>
          </div>
        </button>

        {/* Current Project & Save Status Indicator */}
        {activeProject && (
          <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-800">
            <span className="text-xs font-semibold text-slate-200 max-w-[180px] truncate">
              {activeProject.title}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
              {saveStatus === "saving" ? (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                  <span>Saved</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Studio Navigation Tabs */}
      <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === "dashboard"
              ? "bg-[#00E5FF] text-black font-bold shadow-md"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Projects</span>
        </button>

        <button
          onClick={() => setActiveTab("editor")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === "editor"
              ? "bg-[#00E5FF] text-black font-bold shadow-md"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Studio Editor</span>
        </button>

        <button
          onClick={() => setActiveTab("characters")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === "characters"
              ? "bg-[#00E5FF] text-black font-bold shadow-md"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Characters</span>
        </button>

        <button
          onClick={() => setActiveTab("styles")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === "styles"
              ? "bg-[#00E5FF] text-black font-bold shadow-md"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Styles</span>
        </button>

        <button
          onClick={() => setActiveTab("models")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === "models"
              ? "bg-[#00E5FF] text-black font-bold shadow-md"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Models</span>
        </button>

      </nav>

      {/* Reader, Export, Credits Balance & User Account Actions */}
      <div className="flex items-center gap-2.5">

        {/* Credits Balance & Upgrade CTA */}
        <div className="flex items-center gap-1.5 bg-[#0E1424] border border-slate-800 rounded-xl p-1 pl-2.5 text-xs shadow-inner">
          <div className="flex items-center gap-1 font-mono text-slate-200">
            <Zap className="w-3.5 h-3.5 text-[#FFCC00] fill-[#FFCC00]" />
            <span className="font-bold text-[#FFCC00]" suppressHydrationWarning>
              {(session.user?.credits ?? 100000).toLocaleString("en-US")}
            </span>
            <span className="text-[10px] text-slate-400 font-sans hidden lg:inline">Credits</span>
          </div>
          <button
            onClick={onOpenUpgrade}
            title="Add Studio Credits (Plans from ₹20)"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#FF2A8D] to-[#FF5E00] hover:brightness-110 text-white font-bangers text-xs tracking-wider uppercase shadow-sm transition-all cursor-pointer"
          >
            <span>Upgrade</span>
          </button>
        </div>

        {activeProject && (
          <>
            <button
              onClick={onOpenReader}
              title="Enter Physical Comic Reading Mode"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:border-[#00E5FF] text-xs font-medium transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span className="hidden sm:inline">Read Comic</span>
            </button>

            <button
              onClick={onOpenExport}
              title="Export as PDF, CBZ, or High-Res Images"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:border-[#FF2A8D] text-xs font-medium transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#FF2A8D]" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </>
        )}

        {/* User Account / Google OAuth */}
        {session.isAuthenticated && session.user ? (
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1 pl-2.5 rounded-full border border-slate-800 bg-slate-900 hover:border-slate-700 transition-all text-left cursor-pointer"
            >
              <span className="text-xs font-medium text-slate-200 max-w-[100px] truncate hidden sm:inline">
                {session.user.name}
              </span>
              <img
                src={session.user.avatarUrl}
                alt={session.user.name}
                className="w-6 h-6 rounded-full object-cover border border-slate-700"
              />
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-[#0D1322] border border-slate-800 rounded-xl shadow-2xl p-2.5 text-xs z-50">
                <div className="px-2 py-1.5 border-b border-slate-800 mb-1.5">
                  <div className="font-semibold text-white flex items-center justify-between">
                    <span>{session.user.name}</span>
                    <span className="text-[10px] text-[#10B981] font-mono flex items-center gap-0.5">
                      ✓ Verified
                    </span>
                  </div>
                  <div className="text-slate-400 text-[11px] truncate">{session.user.email}</div>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="inline-block px-2 py-0.5 rounded bg-[#00E5FF]/20 border border-[#00E5FF]/40 text-[10px] text-[#00E5FF] font-bold uppercase">
                      Gemini Creator Studio
                    </span>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenUpgrade();
                      }}
                      className="text-[10px] font-mono text-[#FFCC00] hover:underline flex items-center gap-1 cursor-pointer font-bold"
                    >
                      <Zap className="w-3 h-3 fill-[#FFCC00]" />
                      <span>Top Up</span>
                    </button>
                  </div>
                </div>

                {/* Creator Profile & Creative Thinking Matrix Button */}
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    onOpenProfile?.();
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left bg-gradient-to-r from-slate-900 to-[#121A2E] hover:from-slate-800 hover:to-[#17233D] border border-[#00E5FF]/30 hover:border-[#00E5FF]/60 mb-2 transition-all cursor-pointer group shadow-sm"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#00E5FF]/20 border border-[#00E5FF]/40 flex items-center justify-center text-[#00E5FF] shrink-0 group-hover:scale-105 transition-transform">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white group-hover:text-[#00E5FF] transition-colors">
                        Creator Profile
                      </span>
                      <span className="text-[9px] font-mono font-bold text-[#00E5FF] px-1 py-0.2 rounded bg-[#00E5FF]/20 border border-[#00E5FF]/30">
                        Level 9
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 truncate">
                      PFP, Routine, Works & CQ Matrix
                    </span>
                  </div>
                </button>

                <div className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800/80 mb-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-300">
                    <span>AI Engine:</span>
                    <span className="font-mono font-bold text-[#00E5FF]">
                      Gemini 3.1 Pro & Flash
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Enterprise Multimodal Comic Studio
                  </div>
                </div>

                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    onSignOut();
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#00E5FF] hover:bg-[#38BDF8] text-black text-xs font-bangers tracking-wider uppercase transition-colors cursor-pointer font-bold shadow-md"
          >
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
