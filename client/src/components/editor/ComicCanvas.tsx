"use client";

import React from "react";
import { ComicPage, ComicPanel, ReadingDirection } from "@/types/comic";
import { ComicPanelComponent } from "./ComicPanel";
import { Plus, LayoutGrid, Split, Trash2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface ComicCanvasProps {
  page: ComicPage;
  selectedPanelId: string | null;
  onSelectPanel: (panelId: string) => void;
  onUpdatePanel: (updated: ComicPanel) => void;
  onDeletePanel: (panelId: string) => void;
  onDuplicatePanel: (panel: ComicPanel) => void;
  onRegeneratePanel: (panel: ComicPanel) => void;
  onAddPanel: () => void;
  readingDirection: ReadingDirection;
  zoomLevel: number;
  setZoomLevel: (zoom: number) => void;
  continuityWarningPanelIds?: string[];
}

export function ComicCanvas({
  page,
  selectedPanelId,
  onSelectPanel,
  onUpdatePanel,
  onDeletePanel,
  onDuplicatePanel,
  onRegeneratePanel,
  onAddPanel,
  readingDirection,
  zoomLevel,
  setZoomLevel,
  continuityWarningPanelIds = [],
}: ComicCanvasProps) {
  // Determine CSS grid layout based on page.layoutTemplate
  const getGridClasses = () => {
    switch (page.layoutTemplate) {
      case "single":
        return "grid grid-cols-1 gap-4";
      case "grid-4":
        return "grid grid-cols-1 md:grid-cols-2 gap-4";
      case "classic-6":
        return "grid grid-cols-1 md:grid-cols-2 gap-3.5";
      case "cinematic-wide":
        return "grid grid-cols-1 gap-4";
      case "webtoon-strip":
        return "flex flex-col gap-8 max-w-lg mx-auto";
      case "manga-dynamic":
      default:
        return "grid grid-cols-1 md:grid-cols-12 gap-3.5";
    }
  };

  return (
    <div className="relative flex-1 h-full overflow-auto flex flex-col items-center p-6 bg-[#EBE6DE]/40">
      {/* Zoom and Page Canvas Controls Floating Bar */}
      <div className="sticky top-2 z-30 mb-4 flex items-center gap-1.5 bg-[#FFFFFF]/90 backdrop-blur-sm border border-[#D8D3CA] rounded-full px-3 py-1 shadow-sm text-xs text-[#171717]">
        <button
          onClick={() => setZoomLevel(Math.max(50, zoomLevel - 15))}
          title="Zoom Out"
          className="p-1 hover:text-[#B84A39] transition-colors"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <span className="font-mono text-[11px] min-w-[36px] text-center">{zoomLevel}%</span>
        <button
          onClick={() => setZoomLevel(Math.min(150, zoomLevel + 15))}
          title="Zoom In"
          className="p-1 hover:text-[#B84A39] transition-colors"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setZoomLevel(100)}
          title="Reset Zoom"
          className="p-1 hover:text-[#B84A39] transition-colors ml-1 border-l border-[#D8D3CA] pl-2"
        >
          <RotateCcw className="w-3 h-3" />
        </button>

        <span className="text-[#A8A297] mx-1">|</span>
        <span className="text-[11px] font-serif text-[#77736C]">
          Page {page.pageNumber} {page.title ? `• ${page.title}` : ""}
        </span>
      </div>

      {/* Physical Comic Book Paper Sheet Canvas */}
      <div
        id="active-comic-page-canvas"
        style={{
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: "top center",
          transition: "transform 0.15s ease-out",
        }}
        className={`w-full max-w-[850px] min-h-[1100px] bg-[#FAF8F5] paper-texture border-2 border-[#D8D3CA] rounded-sm p-8 shadow-page flex flex-col justify-between select-none relative ${
          readingDirection === "rtl" ? "direction-rtl" : ""
        }`}
      >
        {/* Subtle Page Paper Header (Marginalia) */}
        <div className="flex items-center justify-between text-[11px] font-mono text-[#77736C] pb-3 border-b border-[#E8E4DC] mb-4">
          <span className="uppercase tracking-widest text-[#9E9991]">
            {readingDirection === "rtl" ? "MANGA • RIGHT-TO-LEFT" : "COMIC • LEFT-TO-RIGHT"}
          </span>
          <span className="font-semibold text-[#171717]">PAGE {String(page.pageNumber).padStart(2, "0")}</span>
        </div>

        {/* Panel Grid Layout */}
        <div className={`flex-1 ${getGridClasses()}`}>
          {page.panels.map((panel, idx) => {
            // Compute dynamic grid spans for manga-dynamic layout
            let colSpanClass = "";
            if (page.layoutTemplate === "manga-dynamic") {
              if (idx === 0) colSpanClass = "md:col-span-12";
              else if (idx === 1) colSpanClass = "md:col-span-7";
              else if (idx === 2) colSpanClass = "md:col-span-5";
              else colSpanClass = "md:col-span-6";
            }

            return (
              <div key={panel.id} className={colSpanClass}>
                <ComicPanelComponent
                  panel={panel}
                  isSelected={selectedPanelId === panel.id}
                  onSelect={() => onSelectPanel(panel.id)}
                  onUpdate={onUpdatePanel}
                  onDelete={() => onDeletePanel(panel.id)}
                  onDuplicate={() => onDuplicatePanel(panel)}
                  onRegenerate={() => onRegeneratePanel(panel)}
                  readingDirection={readingDirection}
                  hasContinuityWarning={continuityWarningPanelIds.includes(panel.id)}
                />
              </div>
            );
          })}
        </div>

        {/* Bottom Gutter Action: Add Panel & Page Footer */}
        <div className="mt-6 pt-3 border-t border-[#E8E4DC] flex items-center justify-between text-xs text-[#77736C]">
          <button
            onClick={onAddPanel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-dashed border-[#A8A297] hover:border-[#171717] hover:bg-[#F3F0EA] text-[#171717] font-medium transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#B84A39]" />
            <span>Add Panel to Page</span>
          </button>

          <span className="font-serif italic text-[11px] text-[#9E9991]">
            Panelcraft Dynamic Pacing Engine
          </span>
        </div>
      </div>
    </div>
  );
}
