"use client";

import React, { useState } from "react";
import { ComicProject } from "@/types/comic";
import { ComicCharacter } from "@/types/character";
import { exportToCbz } from "@/lib/export/cbz";
import { exportPageToPdf, exportFullComicPdf, exportProjectMetadataBackup } from "@/lib/export/pdf";
import { PdfPageFormat } from "@/lib/export/pdfBookEngine";
import {
  Download,
  FileText,
  Archive,
  ScrollText,
  X,
  CheckCircle2,
  RefreshCw,
  BookOpen,
  ShieldCheck,
  Printer,
} from "lucide-react";

interface ExportModalProps {
  project: ComicProject;
  characters?: ComicCharacter[];
  activePageIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export function ExportModal({
  project,
  characters = [],
  activePageIndex,
  isOpen,
  onClose,
}: ExportModalProps) {
  const [format, setFormat] = useState<"pdf-book" | "single-pdf" | "cbz" | "json">("pdf-book");
  const [pdfPageFormat, setPdfPageFormat] = useState<PdfPageFormat>("us-comic");
  const [resolution, setResolution] = useState<150 | 300>(300);
  const [includeCover, setIncludeCover] = useState(true);
  const [includeCastCredits, setIncludeCastCredits] = useState(true);
  const [includeBackCover, setIncludeBackCover] = useState(true);
  const [includeDrmStamp, setIncludeDrmStamp] = useState(true);

  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const [exportStatus, setExportStatus] = useState<string>("Ready");
  const [exportPercent, setExportPercent] = useState<number>(0);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    setExportComplete(false);
    setExportStatus("Initializing...");
    setExportPercent(5);

    try {
      if (format === "pdf-book") {
        await exportFullComicPdf(project, characters, {
          format: pdfPageFormat,
          qualityDpi: resolution,
          includeCover,
          includeEditorialPage: includeCastCredits,
          includeBackCover,
          includeDrmStamp,
          onProgress: (status, percent) => {
            setExportStatus(status);
            setExportPercent(percent);
          },
        });
      } else if (format === "single-pdf") {
        await exportPageToPdf("active-comic-page-canvas", project.title, activePageIndex + 1);
      } else if (format === "cbz") {
        await exportToCbz(project);
      } else if (format === "json") {
        await exportProjectMetadataBackup(project);
      }

      setExportComplete(true);
      setTimeout(() => {
        setExportComplete(false);
        onClose();
      }, 1800);
    } catch (e) {
      console.error("Export error", e);
      setExportStatus("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 text-[#171717]">
      <div className="bg-[#FAF8F5] border border-[#111110] rounded-xl max-w-xl w-full p-6 shadow-2xl flex flex-col gap-4 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#D8D3CA]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#171717] flex items-center justify-center text-[#00E5FF]">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif font-black text-base text-[#171717] leading-none">
                Export Publication
              </h2>
              <p className="text-[11px] text-[#77736C] mt-0.5">
                Choose between physical book PDF format, digital reader format, or universal comic archive.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-sm text-[#77736C] hover:text-[#171717] p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Format Selector */}
        <div>
          <label className="font-bold text-[#77736C] block mb-2 uppercase tracking-wider text-[10px]">
            Choose Export Format
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {/* Multi-Page PDF Book (Recommended) */}
            <button
              onClick={() => setFormat("pdf-book")}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                format === "pdf-book"
                  ? "border-[#171717] bg-[#FFFFFF] shadow-sm ring-2 ring-[#00E5FF]"
                  : "border-[#D8D3CA] bg-[#FAF8F5] hover:border-[#171717]"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 font-bold text-xs text-[#171717]">
                  <BookOpen className="w-4 h-4 text-[#B84A39]" />
                  <span>Comic Book PDF</span>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                  Recommended
                </span>
              </div>
              <p className="text-[10px] text-[#77736C] leading-snug">
                Complete multi-page book with cover, cast bio page, high-res panels, and back cover.
              </p>
            </button>

            {/* Single Page PDF */}
            <button
              onClick={() => setFormat("single-pdf")}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                format === "single-pdf"
                  ? "border-[#171717] bg-[#FFFFFF] shadow-sm ring-2 ring-[#00E5FF]"
                  : "border-[#D8D3CA] bg-[#FAF8F5] hover:border-[#171717]"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs text-[#171717] mb-1">
                <FileText className="w-4 h-4 text-[#B84A39]" />
                <span>Single Page PDF</span>
              </div>
              <p className="text-[10px] text-[#77736C] leading-snug">
                High-resolution vector/raster print export of current active page (P.{activePageIndex + 1}).
              </p>
            </button>

            {/* CBZ Comic Archive */}
            <button
              onClick={() => setFormat("cbz")}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                format === "cbz"
                  ? "border-[#171717] bg-[#FFFFFF] shadow-sm ring-2 ring-[#00E5FF]"
                  : "border-[#D8D3CA] bg-[#FAF8F5] hover:border-[#171717]"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs text-[#171717] mb-1">
                <Archive className="w-4 h-4 text-[#B84A39]" />
                <span>CBZ Comic Archive</span>
              </div>
              <p className="text-[10px] text-[#77736C] leading-snug">
                Standard digital comic bundle compatible with CDisplayEx, Chunky, and Calibre.
              </p>
            </button>

            {/* Project JSON Backup */}
            <button
              onClick={() => setFormat("json")}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                format === "json"
                  ? "border-[#171717] bg-[#FFFFFF] shadow-sm ring-2 ring-[#00E5FF]"
                  : "border-[#D8D3CA] bg-[#FAF8F5] hover:border-[#171717]"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs text-[#171717] mb-1">
                <ScrollText className="w-4 h-4 text-[#B84A39]" />
                <span>Project JSON Backup</span>
              </div>
              <p className="text-[10px] text-[#77736C] leading-snug">
                Full story bible, panel prompts, character biometric memory, and continuity state.
              </p>
            </button>
          </div>
        </div>

        {/* PDF Book Specific Fine-Tuning Options */}
        {format === "pdf-book" && (
          <div className="bg-[#FFFFFF] p-3.5 rounded-lg border border-[#D8D3CA] space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-[#77736C] block mb-1">Book Page Dimensions</label>
                <select
                  value={pdfPageFormat}
                  onChange={(e) => setPdfPageFormat(e.target.value as PdfPageFormat)}
                  className="w-full bg-[#FAF8F5] border border-[#D8D3CA] rounded p-1.5 text-xs text-[#171717] focus:outline-none"
                >
                  <option value="us-comic">Standard US Comic (170 x 260 mm)</option>
                  <option value="a4-graphic-novel">A4 European Graphic Novel (210 x 297 mm)</option>
                  <option value="a5-manga">A5 Pocket Manga Tankobon (148 x 210 mm)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#77736C] block mb-1">Resolution Quality</label>
                <select
                  value={resolution}
                  onChange={(e) => setResolution(Number(e.target.value) as 150 | 300)}
                  className="w-full bg-[#FAF8F5] border border-[#D8D3CA] rounded p-1.5 text-xs text-[#171717] focus:outline-none"
                >
                  <option value={300}>300 DPI (Print-Ready Crispness)</option>
                  <option value={150}>150 DPI (Fast Digital Web)</option>
                </select>
              </div>
            </div>

            {/* Book Section Checkboxes */}
            <div>
              <label className="font-semibold text-[#77736C] block mb-1.5">Book Spread Elements</label>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeCover}
                    onChange={(e) => setIncludeCover(e.target.checked)}
                    className="rounded border-[#D8D3CA]"
                  />
                  <span>Front Cover Artwork & Title</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeCastCredits}
                    onChange={(e) => setIncludeCastCredits(e.target.checked)}
                    className="rounded border-[#D8D3CA]"
                  />
                  <span>Cast Credits & Story Bible</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeBackCover}
                    onChange={(e) => setIncludeBackCover(e.target.checked)}
                    className="rounded border-[#D8D3CA]"
                  />
                  <span>Back Cover & Synopsis</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeDrmStamp}
                    onChange={(e) => setIncludeDrmStamp(e.target.checked)}
                    className="rounded border-[#D8D3CA]"
                  />
                  <span className="flex items-center gap-1 text-[#2D6A4F] font-semibold">
                    <ShieldCheck className="w-3 h-3" /> DRM Copyright Stamp
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Live Export Progress Indicator */}
        {isExporting && (
          <div className="bg-[#FAF6ED] border border-[#D8D3CA] p-3 rounded-lg flex flex-col gap-1.5">
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="text-[#B84A39] font-bold flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                {exportStatus}
              </span>
              <span className="text-[#171717] font-bold">{exportPercent}%</span>
            </div>
            <div className="w-full bg-[#EBE6DE] h-1.5 rounded-full overflow-hidden">
              <div
                style={{ width: `${exportPercent}%` }}
                className="bg-[#B84A39] h-full transition-all duration-300"
              />
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-[#D8D3CA]">
          <span className="text-[11px] text-[#77736C]">
            Reading Order: <strong className="uppercase">{project.readingDirection}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded text-[#77736C] hover:text-[#171717] cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="px-5 py-2 rounded-lg bg-[#171717] hover:bg-[#2A2927] text-[#FAF8F5] font-semibold flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50 transition-all"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#00E5FF]" />
                  <span>Packaging Publication...</span>
                </>
              ) : exportComplete ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-[#00E5FF]" />
                  <span>
                    {format === "pdf-book"
                      ? "Download Comic Book PDF"
                      : format === "single-pdf"
                      ? "Download Single Page PDF"
                      : "Download Publication"}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
