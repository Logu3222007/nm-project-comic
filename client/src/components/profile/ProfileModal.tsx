"use client";

import React, { useState } from "react";
import { UserProfile, AuthSession } from "@/types/auth";
import { ComicProject } from "@/types/comic";
import {
  X,
  Camera,
  Check,
  Brain,
  Sparkles,
  Zap,
  BookOpen,
  Calendar,
  Layers,
  Clock,
  ShieldCheck,
  Award,
  ChevronRight,
  Edit3,
  Loader2,
} from "lucide-react";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: AuthSession;
  projects: ComicProject[];
  onUpdateUser: (updatedUser: UserProfile) => void;
  onSelectProject?: (project: ComicProject) => void;
}

const PRESET_AVATARS = [
  {
    name: "Aoi Spark (Anime)",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
  },
  {
    name: "Ren Kurogane (Manga)",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
  },
  {
    name: "Elena Diaz (Cyberpunk)",
    url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80",
  },
  {
    name: "Julian Vance (Noir)",
    url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80",
  },
  {
    name: "Ren Volt Style",
    url: "/characters/ren-volt.jpg",
  },
  {
    name: "Aoi Spark Style",
    url: "/characters/aoi-spark.jpg",
  },
  {
    name: "Elena Diaz Style",
    url: "/characters/elena-diaz.jpg",
  },
  {
    name: "Kaelen Warlord Style",
    url: "/characters/kaelen-warlord.jpg",
  },
];

export function ProfileModal({
  isOpen,
  onClose,
  session,
  projects,
  onUpdateUser,
  onSelectProject,
}: ProfileModalProps) {
  const user = session.user;

  // Tabs: overview | pfp | routine | works
  const [activeTab, setActiveTab] = useState<"overview" | "pfp" | "routine" | "works">("overview");

  // Edit PFP state
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState(user?.avatarUrl || "");
  const [customAvatarInput, setCustomAvatarInput] = useState("");
  const [isSavingPfp, setIsSavingPfp] = useState(false);
  const [pfpSuccessMessage, setPfpSuccessMessage] = useState<string | null>(null);

  // Edit Routine state
  const [routineText, setRoutineText] = useState(
    user?.routine || "Morning Concept Ideation & World-Building • Evening Panel Inking & Visual Synthesis"
  );
  const [isSavingRoutine, setIsSavingRoutine] = useState(false);
  const [routineSuccessMessage, setRoutineSuccessMessage] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const handleSavePfp = async () => {
    if (!selectedAvatarUrl) return;
    setIsSavingPfp(true);
    setPfpSuccessMessage(null);

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: selectedAvatarUrl }),
      });

      const data = await res.json();
      if (data.user) {
        onUpdateUser(data.user);
        setPfpSuccessMessage("Profile picture updated successfully!");
        setTimeout(() => setPfpSuccessMessage(null), 3000);
      }
    } catch (err) {
      console.error("Failed to update PFP:", err);
    } finally {
      setIsSavingPfp(false);
    }
  };

  const handleSaveRoutine = async () => {
    setIsSavingRoutine(true);
    setRoutineSuccessMessage(null);

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ routine: routineText }),
      });

      const data = await res.json();
      if (data.user) {
        onUpdateUser(data.user);
        setRoutineSuccessMessage("Creative routine updated!");
        setTimeout(() => setRoutineSuccessMessage(null), 3000);
      }
    } catch (err) {
      console.error("Failed to update routine:", err);
    } finally {
      setIsSavingRoutine(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none overflow-y-auto">
      <div className="bg-[#0B0F19] border-2 border-slate-700/80 rounded-2xl max-w-2xl w-full shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),0_0_35px_rgba(0,229,255,0.2)] text-slate-200 relative my-auto overflow-hidden">
        {/* Glow ambient background accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00E5FF]/10 blur-[100px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FF2A8D]/10 blur-[100px] pointer-events-none rounded-full" />

        {/* Modal Header Banner */}
        <div className="relative bg-gradient-to-r from-slate-900 via-[#0E1526] to-slate-900 border-b border-slate-800 p-5 sm:p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer z-10"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            {/* User Avatar with Edit Badge */}
            <div className="relative group cursor-pointer" onClick={() => setActiveTab("pfp")}>
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.4)] bg-slate-950">
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera className="w-5 h-5 text-[#00E5FF]" />
              </div>
            </div>

            {/* User Details */}
            <div className="text-center sm:text-left flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h2 className="text-xl font-bold text-white tracking-tight">{user.name}</h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified Creator</span>
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40 uppercase">
                  {user.plan || "Studio Pro"}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">{user.email}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-2.5 text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#FFCC00] fill-[#FFCC00]" />
                  <span className="font-mono font-bold text-[#FFCC00]">
                    {(user.credits ?? 100000).toLocaleString("en-US")}
                  </span>
                  <span className="text-slate-500 text-[11px]">Credits</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span className="font-mono font-bold text-white">{projects.length}</span>
                  <span className="text-slate-500 text-[11px]">Published Works</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-1 mt-6 border-b border-slate-800 -mb-5 sm:-mb-6 pt-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "overview"
                  ? "border-[#00E5FF] text-[#00E5FF]"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Thinking & Creativity Matrix</span>
            </button>
            <button
              onClick={() => setActiveTab("pfp")}
              className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "pfp"
                  ? "border-[#00E5FF] text-[#00E5FF]"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Change PFP</span>
            </button>
            <button
              onClick={() => setActiveTab("routine")}
              className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "routine"
                  ? "border-[#00E5FF] text-[#00E5FF]"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Routine</span>
            </button>
            <button
              onClick={() => setActiveTab("works")}
              className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "works"
                  ? "border-[#00E5FF] text-[#00E5FF]"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Works ({projects.length})</span>
            </button>
          </div>
        </div>

        {/* Modal Body Tab Content */}
        <div className="p-5 sm:p-6 max-h-[60vh] overflow-y-auto">
          {/* TAB 1: THINKING, IMAGINATION & CREATIVITY MATRIX */}
          {activeTab === "overview" && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#00E5FF]/10 via-transparent to-[#FF2A8D]/10 border border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-[#00E5FF]" />
                  <h3 className="font-bangers text-base tracking-wider text-white uppercase">
                    Creator Cognitive & Imagination Quotient
                  </h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Calculated from your multimodal storyboard direction, prompt density, scene continuity consistency, and narrative complexity.
                </p>
              </div>

              {/* 1. Level of Thinking / Conceptual Depth */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold font-mono">
                      L9
                    </div>
                    <div>
                      <div className="font-bold text-white">Level of Thinking: Multiverse Architect</div>
                      <div className="text-[11px] text-slate-400 font-mono">High Conceptual Depth & Narrative Structure</div>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-indigo-400">96%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full w-[96%]" />
                </div>
                <p className="text-[11px] text-slate-400 pt-1 leading-normal">
                  Excels at multi-branch story architectures, non-linear causal pacing, and high-fidelity psychological character motivations.
                </p>
              </div>

              {/* 2. Imagination Index */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30 flex items-center justify-center font-bold font-mono">
                      98
                    </div>
                    <div>
                      <div className="font-bold text-white">Imagination Index: Visionary Speculator</div>
                      <div className="text-[11px] text-slate-400 font-mono">World-Building & Metaphorical Ideation</div>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-[#00E5FF]">98/100</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#00E5FF] to-teal-400 rounded-full w-[98%]" />
                </div>
                <p className="text-[11px] text-slate-400 pt-1 leading-normal">
                  Effortlessly weaves speculative technological concepts, surreal environmental atmospheres, and evocative fictional mythologies.
                </p>
              </div>

              {/* 3. Creativity Quotient (CQ) */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#FF2A8D]/20 text-[#FF2A8D] border border-[#FF2A8D]/30 flex items-center justify-center font-bold font-mono">
                      CQ
                    </div>
                    <div>
                      <div className="font-bold text-white">Creativity Quotient: Master Storyteller</div>
                      <div className="text-[11px] text-slate-400 font-mono">Top 1% Divergent Thinking & Visual Cinematic Flow</div>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-[#FF2A8D]">94%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#FF2A8D] to-amber-500 rounded-full w-[94%]" />
                </div>
                <p className="text-[11px] text-slate-400 pt-1 leading-normal">
                  Pioneers bold camera angles, dynamic panel transitions, dramatic key lighting, and emotionally punchy speech bubble pacing.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: CHANGE PROFILE PICTURE (PFP) */}
          {activeTab === "pfp" && (
            <div className="space-y-5">
              <div>
                <h3 className="font-bold text-sm text-white mb-1">Choose a Comic Studio Avatar</h3>
                <p className="text-xs text-slate-400">
                  Select a high-resolution illustrated persona below or input your custom avatar URL.
                </p>
              </div>

              {pfpSuccessMessage && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{pfpSuccessMessage}</span>
                </div>
              )}

              {/* Preset Comic Avatars Grid */}
              <div className="grid grid-cols-4 gap-3">
                {PRESET_AVATARS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAvatarUrl(item.url)}
                    className={`relative rounded-xl overflow-hidden border-2 transition-all p-0.5 cursor-pointer ${
                      selectedAvatarUrl === item.url
                        ? "border-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.4)] scale-105"
                        : "border-slate-800 hover:border-slate-600 opacity-80 hover:opacity-100"
                    }`}
                  >
                    <div className="aspect-square w-full rounded-lg overflow-hidden bg-slate-900">
                      <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    {selectedAvatarUrl === item.url && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#00E5FF] text-black flex items-center justify-center shadow">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Custom Image URL Input */}
              <div className="pt-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Or enter custom Avatar Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customAvatarInput}
                    onChange={(e) => setCustomAvatarInput(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00E5FF]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customAvatarInput.trim()) {
                        setSelectedAvatarUrl(customAvatarInput.trim());
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors cursor-pointer"
                  >
                    Preview
                  </button>
                </div>
              </div>

              {/* Save PFP Action */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-[#00E5FF]">
                    <img src={selectedAvatarUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs text-slate-400">Selected Avatar Preview</span>
                </div>
                <button
                  type="button"
                  onClick={handleSavePfp}
                  disabled={isSavingPfp || selectedAvatarUrl === user.avatarUrl}
                  className="comic-btn-cyan px-5 py-2.5 rounded-xl font-bangers text-sm tracking-wider uppercase cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {isSavingPfp ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save New PFP</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: CREATIVE ROUTINE */}
          {activeTab === "routine" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-sm text-white mb-1">Creator Studio Routine & Workflow</h3>
                <p className="text-xs text-slate-400">
                  Your personalized comic creation rhythm, daily scripting goals, and generation habits.
                </p>
              </div>

              {routineSuccessMessage && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{routineSuccessMessage}</span>
                </div>
              )}

              {/* Routine Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="text-slate-400 flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#00E5FF]" />
                    <span>Daily Rhythm</span>
                  </div>
                  <div className="text-white font-bold text-sm">4-6 Studio Hours / Day</div>
                  <div className="text-[11px] text-slate-500">Morning Storyboard • Evening Inking</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="text-slate-400 flex items-center gap-1.5 font-medium">
                    <Zap className="w-3.5 h-3.5 text-[#FFCC00]" />
                    <span>Active Streak</span>
                  </div>
                  <div className="text-white font-bold text-sm">🔥 7-Day Continuous Streak</div>
                  <div className="text-[11px] text-slate-500">Active Comic Creator Studio Session</div>
                </div>
              </div>

              {/* Routine Description Text Area */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>Custom Studio Routine & Objectives</span>
                </label>
                <textarea
                  rows={3}
                  value={routineText}
                  onChange={(e) => setRoutineText(e.target.value)}
                  placeholder="Describe your comic production routine..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-[#00E5FF] leading-relaxed resize-none"
                />
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleSaveRoutine}
                  disabled={isSavingRoutine}
                  className="comic-btn-cyan px-5 py-2 rounded-xl font-bangers text-sm tracking-wider uppercase cursor-pointer disabled:opacity-50"
                >
                  {isSavingRoutine ? "Saving Routine..." : "Save Routine"}
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: WORKS & PORTFOLIO */}
          {activeTab === "works" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white">Your Comic Works</h3>
                  <p className="text-xs text-slate-400">All graphic novels and issues authored by your account.</p>
                </div>
                <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-[#00E5FF] font-bold">
                  {projects.length} Total
                </span>
              </div>

              {projects.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                  No comics created yet. Click &quot;Create New Comic&quot; on the dashboard to start!
                </div>
              ) : (
                <div className="space-y-3">
                  {projects.map((proj) => {
                    const totalPages = proj.chapters.reduce(
                      (acc, chap) =>
                        acc + chap.scenes.reduce((pAcc, sc) => pAcc + sc.pages.length, 0),
                      0
                    );

                    return (
                      <div
                        key={proj.id}
                        className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-[#00E5FF]/60 flex items-center justify-between gap-3 transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-16 rounded-lg overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                            <img
                              src={proj.coverImage || "/styles/dramatic-ensemble-graphic-novel.jpg"}
                              alt={proj.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-sm text-white truncate">{proj.title}</div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {proj.metadata?.genre?.join(", ") || "Graphic Novel"}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono mt-1 flex items-center gap-2">
                              <span>{proj.chapters.length} Chapters</span>
                              <span>•</span>
                              <span>{totalPages} Pages</span>
                              <span>•</span>
                              <span>{new Date(proj.updatedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        {onSelectProject && (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectProject(proj);
                              onClose();
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-[#00E5FF] hover:text-black text-xs font-semibold text-slate-200 transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                          >
                            <span>Open</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
