"use client";

import React from "react";
import { ComicPage } from "@/types/comic";
import { Plus, Copy, Trash2, BookOpen, Layers } from "lucide-react";

interface PageTimelineProps {
  pages: ComicPage[];
  activePageIndex: number;
  onSelectPage: (index: number) => void;
  onAddPage: () => void;
  onDuplicatePage: (index: number) => void;
  onDeletePage: (index: number) => void;
  readingDirection?: "ltr" | "rtl" | "vertical";
}

export function PageTimeline({
  pages,
  activePageIndex,
  onSelectPage,
  onAddPage,
  onDuplicatePage,
  onDeletePage,
  readingDirection = "ltr",
}: PageTimelineProps) {
  return (
    <div className="w-full border-t border-[#D8D3CA] bg-[#FAF8F5] px-4 py-2.5 flex items-center justify-between z-30 select-none">
      {/* Left indicator */}
      <div className="flex items-center gap-2 text-xs font-medium text-[#77736C]">
        <Layers className="w-3.5 h-3.5 text-[#B84A39]" />
        <span className="hidden sm:inline">Timeline:</span>
        <span className="font-semibold text-[#171717]">
          {pages.length} {pages.length === 1 ? "Page" : "Pages"}
        </span>
      </div>

      {/* Center Thumbnails Strip */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 px-2 max-w-[70vw]">
        {pages.map((page, idx) => {
          const isActive = idx === activePageIndex;
          return (
            <div
              key={page.id}
              onClick={() => onSelectPage(idx)}
              className={`relative flex flex-col items-center gap-1 group cursor-pointer transition-all ${
                isActive ? "scale-105" : "opacity-80 hover:opacity-100"
              }`}
            >
              {/* Miniature Page Thumbnail Paper */}
              <div
                className={`w-12 h-16 rounded-xs border-2 bg-white flex flex-col justify-between p-1 transition-all ${
                  isActive
                    ? "border-[#B84A39] shadow-medium ring-2 ring-[#B84A39]/30"
                    : "border-[#D8D3CA] group-hover:border-[#171717]"
                }`}
              >
                {/* Micro panel grid indicator */}
                <div className="w-full h-full grid grid-cols-2 gap-0.5 bg-[#F3F0EA] p-0.5 rounded-xs overflow-hidden">
                  {page.panels.slice(0, 4).map((p, pIdx) => (
                    <div
                      key={pIdx}
                      className={`rounded-xs ${
                        p.imageUrl ? "bg-[#77736C]" : "bg-[#D8D3CA]"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Page Number Label */}
              <span
                className={`text-[10px] font-mono font-medium ${
                  isActive ? "text-[#B84A39] font-bold" : "text-[#77736C]"
                }`}
              >
                P.{String(page.pageNumber).padStart(2, "0")}
              </span>

              {/* Hover Actions: Duplicate / Delete */}
              <div className="absolute -top-7 hidden group-hover:flex items-center gap-0.5 bg-[#171717] text-[#FAF8F5] px-1 py-0.5 rounded shadow-sm text-[9px] z-40">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicatePage(idx);
                  }}
                  title="Duplicate page"
                  className="hover:text-[#B84A39] p-0.5"
                >
                  <Copy className="w-2.5 h-2.5" />
                </button>
                {pages.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePage(idx);
                    }}
                    title="Delete page"
                    className="hover:text-[#B84A39] p-0.5"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Add New Page Button */}
        <button
          onClick={onAddPage}
          title="Add New Blank Page"
          className="w-12 h-16 rounded-xs border-2 border-dashed border-[#A8A297] hover:border-[#171717] bg-[#F7F5F0] hover:bg-[#EBE6DE] flex flex-col items-center justify-center gap-1 text-[#77736C] hover:text-[#171717] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#B84A39]" />
          <span className="text-[9px] font-sans">New</span>
        </button>
      </div>

      {/* Reading direction badge */}
      <div className="text-[10px] font-mono text-[#77736C] uppercase bg-[#EBE6DE] px-2 py-1 rounded">
        {readingDirection === "rtl" ? "RTL Manga" : "LTR Comic"}
      </div>
    </div>
  );
}
