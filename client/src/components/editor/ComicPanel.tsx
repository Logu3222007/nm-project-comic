"use client";

import React, { useState } from "react";
import { ComicPanel, SpeechBubble, CameraAngle } from "@/types/comic";
import { SpeechBubbleComponent } from "./SpeechBubbleComponent";
import {
  Sparkles,
  RefreshCw,
  MessageSquarePlus,
  Trash2,
  Copy,
  Camera,
  AlertTriangle,
  Maximize2,
  Sliders,
} from "lucide-react";

interface ComicPanelProps {
  panel: ComicPanel;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updated: ComicPanel) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onRegenerate: () => void;
  readingDirection?: "ltr" | "rtl" | "vertical";
  hasContinuityWarning?: boolean;
}

export function ComicPanelComponent({
  panel,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  onRegenerate,
  readingDirection = "ltr",
  hasContinuityWarning,
}: ComicPanelProps) {
  const [showPromptEdit, setShowPromptEdit] = useState(false);
  const [promptText, setPromptText] = useState(panel.prompt);
  const [imageError, setImageError] = useState(false);

  const handleAddBubble = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newBubble: SpeechBubble = {
      id: `bubble_${Date.now()}`,
      type: "speech",
      text: "New dialogue...",
      x: 20 + panel.bubbles.length * 8,
      y: 20 + panel.bubbles.length * 8,
      width: 45,
    };
    onUpdate({
      ...panel,
      bubbles: [...panel.bubbles, newBubble],
    });
  };

  const handleUpdateBubble = (updatedBubble: SpeechBubble) => {
    onUpdate({
      ...panel,
      bubbles: panel.bubbles.map((b) => (b.id === updatedBubble.id ? updatedBubble : b)),
    });
  };

  const handleDeleteBubble = (bubbleId: string) => {
    onUpdate({
      ...panel,
      bubbles: panel.bubbles.filter((b) => b.id !== bubbleId),
    });
  };

  return (
    <div
      onClick={onSelect}
      className={`relative group bg-[#FAF8F5] border-2 border-[#111110] overflow-hidden transition-all duration-200 cursor-pointer ${
        isSelected
          ? "ring-2 ring-[#B84A39] shadow-editorial z-20"
          : "hover:border-[#2A2927] shadow-sm hover:shadow-medium"
      }`}
      style={{
        aspectRatio: panel.aspectRatio === "16:9" ? "16/9" : panel.aspectRatio === "21:9" ? "21/9" : "4/3",
      }}
    >
      {/* Background Illustration or Generating Skeleton */}
      {panel.isGenerating ? (
        <div className="absolute inset-0 bg-[#EBE6DE] animate-pulse flex flex-col items-center justify-center gap-2 p-4 text-[#77736C]">
          <RefreshCw className="w-6 h-6 animate-spin text-[#B84A39]" />
          <div className="text-xs font-medium tracking-wide">Rendering Panel Illustration...</div>
          <div className="text-[10px] text-center max-w-[200px] truncate text-[#9E9991]">
            {panel.prompt}
          </div>
        </div>
      ) : panel.imageUrl ? (
        <div className="w-full h-full relative">
          <img
            src={imageError ? "/styles/dramatic-ensemble-graphic-novel.jpg" : panel.imageUrl}
            alt={panel.prompt}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover select-none pointer-events-none"
            loading="lazy"
          />
          {/* Subtle vignette for comic depth */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/25 via-transparent to-black/10" />
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-[#77736C] bg-[#F7F5F0]">
          <div className="w-10 h-10 rounded-full border border-dashed border-[#A8A297] flex items-center justify-center mb-2 text-[#77736C]">
            <Sparkles className="w-4 h-4" />
          </div>
          <p className="text-xs font-medium text-[#171717] mb-1">Empty Panel</p>
          <p className="text-[11px] text-[#77736C] line-clamp-2 max-w-[220px] mb-3">
            {panel.prompt || "No prompt composed yet"}
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRegenerate();
            }}
            className="px-2.5 py-1 rounded bg-[#171717] hover:bg-[#2A2927] text-[#FAF8F5] text-xs font-medium shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3 h-3 text-[#B84A39]" />
            <span>Generate Art</span>
          </button>
        </div>
      )}

      {/* Top Left: Panel Badge & Camera Angle */}
      <div className="absolute top-2 left-2 flex items-center gap-1.5 z-20 pointer-events-none">
        <span className="bg-[#111110] text-[#FAF8F5] text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow-sm">
          #{panel.order}
        </span>
        {panel.visualDirection?.camera && (
          <span className="hidden sm:inline-flex items-center gap-1 bg-[#FAF8F5]/90 backdrop-blur-xs border border-[#D8D3CA] text-[#171717] text-[10px] font-sans px-1.5 py-0.5 rounded shadow-sm">
            <Camera className="w-2.5 h-2.5 text-[#B84A39]" />
            <span className="capitalize">{panel.visualDirection.camera.replace("-", " ")}</span>
          </span>
        )}
      </div>

      {/* Top Right: Continuity warning indicator if flagged */}
      {hasContinuityWarning && (
        <div
          title="Continuity alert: potential mismatch with Character or Story Bible"
          className="absolute top-2 right-2 bg-[#B84A39] text-[#FAF8F5] p-1 rounded shadow-sm z-20 flex items-center gap-1 text-[10px]"
        >
          <AlertTriangle className="w-3 h-3" />
        </div>
      )}

      {/* Speech Bubbles Overlay */}
      {panel.bubbles.map((bubble) => (
        <SpeechBubbleComponent
          key={bubble.id}
          bubble={bubble}
          onUpdate={handleUpdateBubble}
          onDelete={handleDeleteBubble}
          readingDirection={readingDirection}
        />
      ))}

      {/* Failed Panel Isolated Recovery Alert */}
      {panel.generationError && !panel.isGenerating && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-x-2 bottom-12 bg-[#171717]/95 border border-[#B84A39]/80 text-[#FAF8F5] text-[11px] p-2 rounded shadow-editorial z-30 flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <AlertTriangle className="w-3.5 h-3.5 text-[#B84A39] shrink-0" />
            <span className="truncate">{panel.generationError}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRegenerate();
            }}
            className="px-2 py-0.5 rounded bg-[#B84A39] hover:bg-[#A33C2D] text-white text-[10px] font-semibold uppercase tracking-wider shrink-0 transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Interactive Floating Action Bar on Hover/Selection */}
      <div
        className={`absolute bottom-2 right-2 flex items-center gap-1 bg-[#171717]/95 backdrop-blur-sm text-[#FAF8F5] p-1 rounded-md shadow-editorial z-30 transition-opacity duration-150 ${
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRegenerate();
          }}
          title="Regenerate Panel with AI"
          className="p-1 hover:text-[#B84A39] transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={handleAddBubble}
          title="Add Speech / Thought Bubble"
          className="p-1 hover:text-[#B84A39] transition-colors"
        >
          <MessageSquarePlus className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowPromptEdit(!showPromptEdit);
          }}
          title="Edit Panel Prompt & Composition"
          className="p-1 hover:text-[#B84A39] transition-colors"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          title="Duplicate Panel"
          className="p-1 hover:text-[#B84A39] transition-colors"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title="Delete Panel"
          className="p-1 hover:text-[#B84A39] transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Inline Quick Prompt Editor Modal / Flyout */}
      {showPromptEdit && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-x-2 bottom-12 bg-[#FAF8F5] border border-[#171717] rounded-md p-2.5 shadow-editorial z-40 text-xs"
        >
          <div className="font-semibold text-[#171717] mb-1 flex items-center justify-between">
            <span>Edit Panel Prompt</span>
            <button
              onClick={() => setShowPromptEdit(false)}
              className="text-[#77736C] hover:text-[#171717] text-sm"
            >
              ✕
            </button>
          </div>
          <textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            className="w-full bg-[#FFFFFF] border border-[#D8D3CA] rounded p-1.5 text-xs text-[#171717] focus:outline-none focus:border-[#171717] resize-none"
            rows={3}
          />
          <div className="flex justify-end gap-1.5 mt-2">
            <button
              onClick={() => setShowPromptEdit(false)}
              className="px-2 py-1 rounded text-[#77736C] hover:text-[#171717]"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onUpdate({ ...panel, prompt: promptText });
                setShowPromptEdit(false);
              }}
              className="px-2.5 py-1 rounded bg-[#171717] text-[#FAF8F5] hover:bg-[#2A2927] font-medium"
            >
              Save Prompt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
