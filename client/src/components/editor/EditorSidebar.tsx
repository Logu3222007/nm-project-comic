"use client";

import React, { useState } from "react";
import { ComicPage, PageLayoutTemplate, ReadingDirection } from "@/types/comic";
import { ComicCharacter } from "@/types/character";
import { TEMPLATE_LAYOUTS } from "@/lib/constants";
import {
  Layout,
  Users,
  ShieldAlert,
  BookMarked,
  Sparkles,
  Plus,
  Book,
  FileText,
} from "lucide-react";

interface EditorSidebarProps {
  currentPage: ComicPage;
  onSelectLayout: (template: PageLayoutTemplate) => void;
  characters: ComicCharacter[];
  onInsertCharacter: (character: ComicCharacter) => void;
  negativeConstraints: string[];
  onUpdateNegativeConstraints: (constraints: string[]) => void;
  isCoverMode: boolean;
  setIsCoverMode: (isCover: boolean) => void;
  storyBible: {
    logline: string;
    worldSetting: string;
    continuityRules: string[];
  };
}

export function EditorSidebar({
  currentPage,
  onSelectLayout,
  characters,
  onInsertCharacter,
  negativeConstraints,
  onUpdateNegativeConstraints,
  isCoverMode,
  setIsCoverMode,
  storyBible,
}: EditorSidebarProps) {
  const [activeTab, setActiveTab] = useState<"layouts" | "cast" | "constraints" | "bible">("layouts");
  const [newConstraint, setNewConstraint] = useState("");

  const handleAddConstraint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConstraint.trim()) return;
    onUpdateNegativeConstraints([...negativeConstraints, newConstraint.trim()]);
    setNewConstraint("");
  };

  const handleRemoveConstraint = (index: number) => {
    onUpdateNegativeConstraints(negativeConstraints.filter((_, i) => i !== index));
  };

  return (
    <aside className="w-64 lg:w-72 border-r border-[#D8D3CA] bg-[#FAF8F5] flex flex-col h-full z-20 text-[#171717] select-none text-xs">
      {/* View Switcher: Page vs Cover */}
      <div className="p-3 border-b border-[#D8D3CA] bg-[#EBE6DE]/40">
        <div className="flex bg-[#FAF8F5] p-1 rounded-md border border-[#D8D3CA]">
          <button
            onClick={() => setIsCoverMode(false)}
            className={`flex-1 py-1.5 rounded text-xs font-medium transition-all ${
              !isCoverMode
                ? "bg-[#171717] text-[#FAF8F5] font-semibold shadow-xs"
                : "text-[#77736C] hover:text-[#171717]"
            }`}
          >
            Page Canvas
          </button>
          <button
            onClick={() => setIsCoverMode(true)}
            className={`flex-1 py-1.5 rounded text-xs font-medium transition-all ${
              isCoverMode
                ? "bg-[#171717] text-[#FAF8F5] font-semibold shadow-xs"
                : "text-[#77736C] hover:text-[#171717]"
            }`}
          >
            Issue Cover
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#D8D3CA] bg-[#FAF8F5]">
        <button
          onClick={() => setActiveTab("layouts")}
          className={`flex-1 py-2 text-center border-b-2 font-medium transition-colors ${
            activeTab === "layouts"
              ? "border-[#B84A39] text-[#171717] font-semibold"
              : "border-transparent text-[#77736C] hover:text-[#171717]"
          }`}
        >
          Layouts
        </button>
        <button
          onClick={() => setActiveTab("cast")}
          className={`flex-1 py-2 text-center border-b-2 font-medium transition-colors ${
            activeTab === "cast"
              ? "border-[#B84A39] text-[#171717] font-semibold"
              : "border-transparent text-[#77736C] hover:text-[#171717]"
          }`}
        >
          Characters
        </button>
        <button
          onClick={() => setActiveTab("constraints")}
          className={`flex-1 py-2 text-center border-b-2 font-medium transition-colors ${
            activeTab === "constraints"
              ? "border-[#B84A39] text-[#171717] font-semibold"
              : "border-transparent text-[#77736C] hover:text-[#171717]"
          }`}
        >
          Constraints
        </button>
        <button
          onClick={() => setActiveTab("bible")}
          className={`flex-1 py-2 text-center border-b-2 font-medium transition-colors ${
            activeTab === "bible"
              ? "border-[#B84A39] text-[#171717] font-semibold"
              : "border-transparent text-[#77736C] hover:text-[#171717]"
          }`}
        >
          Bible
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Layouts Tab */}
        {activeTab === "layouts" && (
          <div className="space-y-3">
            <div className="font-semibold text-[#171717] text-xs">
              Page {currentPage.pageNumber} Layout Template
            </div>
            <div className="space-y-2">
              {TEMPLATE_LAYOUTS.map((t) => {
                const isSelected = currentPage.layoutTemplate === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => onSelectLayout(t.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? "border-[#171717] bg-[#FFFFFF] shadow-sm ring-1 ring-[#171717]"
                        : "border-[#D8D3CA] bg-[#FAF8F5] hover:border-[#171717]"
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold text-[#171717] mb-1">
                      <span>{t.name}</span>
                      <span className="font-mono text-[10px] text-[#77736C]">
                        {t.defaultPanelCount} panels
                      </span>
                    </div>
                    <p className="text-[11px] text-[#77736C] leading-snug">{t.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Cast Tab */}
        {activeTab === "cast" && (
          <div className="space-y-3">
            <div className="font-semibold text-[#171717] text-xs">Project Cast</div>
            <p className="text-[11px] text-[#77736C]">
              Click on a character to insert their dialogue anchor into the active panel.
            </p>
            <div className="space-y-2">
              {characters.map((char) => (
                <div
                  key={char.id}
                  onClick={() => onInsertCharacter(char)}
                  className="p-2.5 rounded-lg border border-[#D8D3CA] bg-[#FFFFFF] hover:border-[#171717] cursor-pointer flex items-center justify-between shadow-xs transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={char.referenceImages[0] || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"}
                      alt={char.name}
                      className="w-8 h-8 rounded-full object-cover border border-[#D8D3CA]"
                    />
                    <div>
                      <div className="font-bold text-[#171717]">{char.name}</div>
                      <div className="text-[10px] text-[#77736C] capitalize">{char.role}</div>
                    </div>
                  </div>
                  <Plus className="w-3.5 h-3.5 text-[#B84A39]" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Negative Constraints Tab */}
        {activeTab === "constraints" && (
          <div className="space-y-3">
            <div className="font-semibold text-[#171717] text-xs">Negative Constraints</div>
            <p className="text-[11px] text-[#77736C]">
              Global negative rules automatically appended to every AI image render request.
            </p>

            <form onSubmit={handleAddConstraint} className="flex gap-1.5">
              <input
                type="text"
                value={newConstraint}
                onChange={(e) => setNewConstraint(e.target.value)}
                placeholder="e.g. 3d plastic look"
                className="flex-1 bg-[#FFFFFF] border border-[#D8D3CA] rounded p-1.5 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
              />
              <button
                type="submit"
                className="px-2.5 py-1.5 rounded bg-[#171717] text-[#FAF8F5] font-medium"
              >
                Add
              </button>
            </form>

            <div className="flex flex-wrap gap-1.5 pt-2">
              {negativeConstraints.map((nc, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EBE6DE] text-[#171717] text-[11px] border border-[#D8D3CA]"
                >
                  <span>{nc}</span>
                  <button
                    onClick={() => handleRemoveConstraint(idx)}
                    className="text-[#77736C] hover:text-[#B84A39] ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Story Bible Tab */}
        {activeTab === "bible" && (
          <div className="space-y-3">
            <div className="font-semibold text-[#171717] text-xs">Story & Continuity Bible</div>
            <div className="bg-[#FFFFFF] p-3 rounded-lg border border-[#D8D3CA] space-y-2">
              <div>
                <div className="font-bold text-[10px] text-[#77736C] uppercase">Premise</div>
                <div className="text-[11px] text-[#171717]">{storyBible.logline}</div>
              </div>
              <div className="border-t border-[#EBE6DE] pt-2">
                <div className="font-bold text-[10px] text-[#77736C] uppercase">World Rules</div>
                <div className="text-[11px] text-[#171717]">{storyBible.worldSetting}</div>
              </div>
              <div className="border-t border-[#EBE6DE] pt-2">
                <div className="font-bold text-[10px] text-[#77736C] uppercase">Mandatory Continuities</div>
                <ul className="list-disc pl-4 text-[10px] text-[#77736C] space-y-1 mt-1">
                  {storyBible.continuityRules.map((rule, idx) => (
                    <li key={idx}>{rule}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
