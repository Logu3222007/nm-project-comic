"use client";

import React, { useState, useRef } from "react";
import { SpeechBubble, BubbleType } from "@/types/comic";
import { Trash2, MessageSquare, Cloud, Volume2, Radio, Zap } from "lucide-react";

interface SpeechBubbleProps {
  bubble: SpeechBubble;
  onUpdate: (updated: SpeechBubble) => void;
  onDelete: (id: string) => void;
  isSelected?: boolean;
  onSelect?: () => void;
  readingDirection?: "ltr" | "rtl" | "vertical";
}

export function SpeechBubbleComponent({
  bubble,
  onUpdate,
  onDelete,
  isSelected,
  onSelect,
  readingDirection = "ltr",
}: SpeechBubbleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(bubble.text);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.();
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: bubble.x,
      origY: bubble.y,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragRef.current) return;
      const deltaX = ((moveEvent.clientX - dragRef.current.startX) / 400) * 100;
      const deltaY = ((moveEvent.clientY - dragRef.current.startY) / 300) * 100;

      const newX = Math.max(2, Math.min(85, dragRef.current.origX + deltaX));
      const newY = Math.max(2, Math.min(85, dragRef.current.origY + deltaY));

      onUpdate({ ...bubble, x: Math.round(newX), y: Math.round(newY) });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragRef.current = null;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleTextBlur = () => {
    setIsEditing(false);
    onUpdate({ ...bubble, text });
  };

  // Determine styling based on bubble type
  const getBubbleClasses = () => {
    switch (bubble.type) {
      case "thought":
        return "bg-white border-2 border-dashed border-[#171717] rounded-3xl shadow-sm text-[#171717]";
      case "shout":
        return "bg-white border-[2.5px] border-[#171717] font-bold text-[#171717] uppercase tracking-wide shadow-md";
      case "narration":
        return "bg-[#FAF6ED] border-2 border-[#171717] rounded-sm shadow-[3px_3px_0px_#171717] font-serif text-[#171717]";
      case "whisper":
        return "bg-white/95 border-[1.5px] border-dashed border-[#77736C] rounded-xl text-[#55534E] italic";
      case "radio":
        return "bg-[#F3F0EA] border-2 border-[#2A2927] rounded-md font-mono text-xs text-[#171717]";
      case "sfx":
        return "bg-transparent text-[#B84A39] font-black italic tracking-widest text-xl drop-shadow-[2px_2px_0px_#171717]";
      case "speech":
      default:
        return "bg-white border-2 border-[#171717] rounded-2xl shadow-sm text-[#171717]";
    }
  };

  return (
    <div
      style={{
        left: `${bubble.x}%`,
        top: `${bubble.y}%`,
        maxWidth: bubble.width ? `${bubble.width}%` : "60%",
      }}
      className={`absolute z-30 select-none cursor-move group ${
        isSelected ? "ring-2 ring-[#B84A39] ring-offset-2" : ""
      }`}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
    >
      <div className={`p-2.5 relative transition-all ${getBubbleClasses()}`}>
        {/* Tail for normal speech bubble */}
        {bubble.type === "speech" && (
          <div
            className={`absolute -bottom-2 w-3 h-3 bg-white border-r-2 border-b-2 border-[#171717] transform rotate-45 ${
              readingDirection === "rtl" ? "right-5" : "left-5"
            }`}
          />
        )}

        {/* Thought bubbles small trailing circles */}
        {bubble.type === "thought" && (
          <>
            <div className="absolute -bottom-2 left-6 w-2 h-2 rounded-full bg-white border border-[#171717]" />
            <div className="absolute -bottom-3.5 left-7 w-1 h-1 rounded-full bg-white border border-[#171717]" />
          </>
        )}

        {/* Speaker Name Tag */}
        {bubble.speaker && bubble.type !== "narration" && bubble.type !== "sfx" && (
          <div className="text-[10px] font-bold text-[#77736C] uppercase tracking-wider mb-0.5 font-sans">
            {bubble.speaker}
          </div>
        )}

        {/* Bubble Text or Inline Editor */}
        {isEditing ? (
          <textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleTextBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleTextBlur();
              }
            }}
            className="w-full bg-transparent resize-none focus:outline-none text-xs leading-relaxed font-comic"
            rows={2}
          />
        ) : (
          <div
            onDoubleClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className={`text-xs leading-snug break-words ${
              bubble.type === "narration"
                ? "font-serif text-[11px]"
                : bubble.type === "sfx"
                ? "font-black tracking-wider text-sm font-sans"
                : "font-comic font-medium"
            }`}
          >
            {bubble.text || "Double click to edit..."}
          </div>
        )}

        {/* Action controls when hovered or selected */}
        <div className="absolute -top-7 right-0 hidden group-hover:flex items-center gap-1 bg-[#171717] text-[#FAF8F5] px-1.5 py-0.5 rounded shadow-editorial text-[10px] z-40">
          <button
            onClick={(e) => {
              e.stopPropagation();
              const nextType: Record<BubbleType, BubbleType> = {
                speech: "thought",
                thought: "shout",
                shout: "narration",
                narration: "whisper",
                whisper: "radio",
                radio: "sfx",
                sfx: "speech",
              };
              onUpdate({ ...bubble, type: nextType[bubble.type] });
            }}
            title="Cycle bubble style"
            className="hover:text-[#B84A39] p-0.5"
          >
            {bubble.type}
          </button>
          <span className="text-[#55534E]">|</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(bubble.id);
            }}
            title="Delete bubble"
            className="hover:text-[#B84A39] p-0.5"
          >
            <Trash2 className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
