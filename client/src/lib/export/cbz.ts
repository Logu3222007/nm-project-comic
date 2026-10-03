import JSZip from "jszip";
import { saveAs } from "file-saver";
import { ComicProject } from "@/types/comic";

export async function exportToCbz(project: ComicProject): Promise<void> {
  const zip = new JSZip();

  // Create standard ComicInfo.xml metadata
  const comicInfoXml = `<?xml version="1.0" encoding="utf-8"?>
<ComicInfo xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <Title>${escapeXml(project.title)}</Title>
  <Series>${escapeXml(project.title)}</Series>
  <Number>1</Number>
  <Summary>${escapeXml(project.metadata.synopsis || "")}</Summary>
  <Genre>${escapeXml(project.metadata.genre.join(", "))}</Genre>
  <LanguageISO>en</LanguageISO>
  <Manga>${project.readingDirection === "rtl" ? "YesAndRightToLeft" : "No"}</Manga>
</ComicInfo>`;

  zip.file("ComicInfo.xml", comicInfoXml);

  // Collect page images or representations
  let pageCounter = 1;
  const imageFolder = zip.folder("pages") || zip;

  for (const chapter of project.chapters) {
    for (const scene of chapter.scenes) {
      for (const page of scene.pages) {
        // Collect panels for this page
        const pageFileName = `page_${String(pageCounter).padStart(3, "0")}.json`;
        imageFolder.file(
          pageFileName,
          JSON.stringify(
            {
              pageNumber: page.pageNumber,
              layoutTemplate: page.layoutTemplate,
              panels: page.panels.map((p) => ({
                order: p.order,
                prompt: p.prompt,
                imageUrl: p.imageUrl,
                bubbles: p.bubbles,
              })),
            },
            null,
            2
          )
        );
        pageCounter++;
      }
    }
  }

  const content = await zip.generateAsync({ type: "blob" });
  const filename = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_issue_01.cbz`;
  saveAs(content, filename);
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}
