import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { ComicProject } from "@/types/comic";
import { ComicCharacter } from "@/types/character";
import { generateComicBookPdf, PdfExportOptions } from "./pdfBookEngine";

export async function exportPageToPdf(
  elementId: string,
  projectTitle: string,
  pageNumber: number
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id ${elementId} not found.`);
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#FAF8F5",
  });

  const imgData = canvas.toDataURL("image/jpeg", 0.95);
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  pdf.addImage(imgData, "JPEG", 10, 10, pdfWidth - 20, pdfHeight - 20);
  pdf.save(`${projectTitle.toLowerCase().replace(/[^a-z0-9]/g, "_")}_page_${pageNumber}.pdf`);
}

export async function exportFullComicPdf(
  project: ComicProject,
  characters: ComicCharacter[],
  options?: Partial<PdfExportOptions>
): Promise<void> {
  const mergedOptions: PdfExportOptions = {
    format: options?.format || "us-comic",
    qualityDpi: options?.qualityDpi || 300,
    includeCover: options?.includeCover ?? true,
    includeEditorialPage: options?.includeEditorialPage ?? true,
    includeBackCover: options?.includeBackCover ?? true,
    includeDrmStamp: options?.includeDrmStamp ?? true,
    onProgress: options?.onProgress,
  };

  const pdfBlob = await generateComicBookPdf(project, characters, mergedOptions);
  const url = URL.createObjectURL(pdfBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_comic_book.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportProjectMetadataBackup(project: ComicProject): Promise<void> {
  const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_project_backup.json`;
  a.click();
  URL.revokeObjectURL(url);
}
