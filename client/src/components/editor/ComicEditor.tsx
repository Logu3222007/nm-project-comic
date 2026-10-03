"use client";

import React, { useState, useEffect } from "react";
import { ComicProject, ComicPage, ComicPanel, PageLayoutTemplate } from "@/types/comic";
import { ComicCharacter } from "@/types/character";
import { ArtStylePreset } from "@/types/style";
import { ContinuityValidationReport } from "@/types/continuity";
import { EditorSidebar } from "./EditorSidebar";
import { ComicCanvas } from "./ComicCanvas";
import { AIPanel } from "./AIPanel";
import { PageTimeline } from "./PageTimeline";
import { CoverEditor } from "./CoverEditor";
import { validateProjectContinuity } from "@/lib/ai/continuity-validator";
import { DEFAULT_STYLES } from "@/lib/constants";
import { getCuratedArtisticFallback } from "@/lib/ai/image-generator";

interface ComicEditorProps {
  project: ComicProject;
  characters: ComicCharacter[];
  onUpdateProject: (updated: ComicProject) => void;
  onSaveNotification?: () => void;
}

export function ComicEditor({
  project,
  characters,
  onUpdateProject,
  onSaveNotification,
}: ComicEditorProps) {
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [selectedPanelId, setSelectedPanelId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isCoverMode, setIsCoverMode] = useState(false);
  const [isGeneratingPanel, setIsGeneratingPanel] = useState(false);

  // Continuity Report state
  const [continuityReport, setContinuityReport] = useState<ContinuityValidationReport | null>(null);

  // Active Scene and Page Resolution
  const activeChapter = project.chapters[0];
  const activeScene = activeChapter?.scenes[0];
  const allPages = activeScene?.pages || [];
  const activePage = allPages[activePageIndex] || allPages[0];

  const activeStyle =
    DEFAULT_STYLES.find((s) => s.id === project.styleId) || DEFAULT_STYLES[0];

  // Currently selected panel
  const selectedPanel =
    activePage?.panels.find((p) => p.id === selectedPanelId) || activePage?.panels[0] || null;

  // Run continuity check
  const handleRunContinuityCheck = () => {
    const report = validateProjectContinuity(project, characters);
    setContinuityReport(report);
  };

  // Update a single panel
  const handleUpdatePanel = (updatedPanel: ComicPanel) => {
    if (!activePage) return;
    const updatedPanels = activePage.panels.map((p) => (p.id === updatedPanel.id ? updatedPanel : p));
    const updatedPage: ComicPage = { ...activePage, panels: updatedPanels };
    handleUpdatePage(updatedPage);
  };

  // Update page
  const handleUpdatePage = (updatedPage: ComicPage) => {
    const updatedPages = allPages.map((p, idx) => (idx === activePageIndex ? updatedPage : p));
    const updatedProject: ComicProject = {
      ...project,
      chapters: [
        {
          ...activeChapter,
          scenes: [
            {
              ...activeScene,
              pages: updatedPages,
            },
          ],
        },
      ],
    };
    onUpdateProject(updatedProject);
    onSaveNotification?.();
  };

  // Regenerate panel with AI (Smart Single-Panel Regeneration with Context Isolation)
  const handleRegeneratePanel = async (panel: ComicPanel) => {
    setIsGeneratingPanel(true);
    // Mark only this selected panel as generating and clear prior errors
    handleUpdatePanel({ ...panel, isGenerating: true, generationError: undefined });

    try {
      // Find prior panel on the page for sequential narrative continuity
      const panelIndex = activePage?.panels.findIndex((p) => p.id === panel.id) ?? -1;
      const prevPanel = panelIndex > 0 ? activePage?.panels[panelIndex - 1] : undefined;
      const previousPanelContext = prevPanel
        ? `Preceding panel (#${prevPanel.order}): ${prevPanel.prompt}. Ongoing action: ${prevPanel.visualDirection?.characterAction || "in progress"}`
        : undefined;

      const res = await fetch("/api/ai/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: panel.prompt,
          styleId: project.styleId,
          visualDirection: panel.visualDirection,
          characters,
          previousPanelContext,
          continuityRules: project.metadata?.continuityRules || [],
          aspectRatio: panel.aspectRatio,
          location: activeScene?.location,
          keyObjects: panel.visualDirection?.keyObjects || [],
          storyboardBeat: panel.visualDirection?.storyboardBeat,
          panelIndex: panel.order,
        }),
      });

      const data = await res.json();
      if (data.imageUrl) {
        handleUpdatePanel({
          ...panel,
          imageUrl: data.imageUrl,
          isGenerating: false,
          generationError: undefined,
        });
      } else {
        handleUpdatePanel({
          ...panel,
          isGenerating: false,
          generationError: data.error || "Image generation returned no result. Click to retry.",
        });
      }
    } catch (err: any) {
      console.error("Panel render error:", err);
      handleUpdatePanel({
        ...panel,
        isGenerating: false,
        generationError: err?.message || "Failed to render panel. Click to retry.",
      });
    } finally {
      setIsGeneratingPanel(false);
    }
  };

  // Add Panel to current page
  const handleAddPanel = () => {
    if (!activePage) return;
    const initialImg = getCuratedArtisticFallback(
      activeStyle.category,
      "New action sequence, dynamic perspective and focus.",
      undefined,
      activePage.panels.length
    );
    const newPanel: ComicPanel = {
      id: `panel_${Date.now()}`,
      order: activePage.panels.length + 1,
      prompt: "New action sequence, dynamic perspective and focus.",
      imageUrl: initialImg,
      aspectRatio: "4:3",
      colSpan: 6,
      visualDirection: {
        environment: activeScene?.location || "Urban street",
        camera: "medium-shot",
        lighting: "Atmospheric ambient lighting",
        composition: "Dynamic character framing",
        characterAction: "Engaging with scene",
        characterEmotions: {},
      },
      bubbles: [],
    };
    handleUpdatePage({
      ...activePage,
      panels: [...activePage.panels, newPanel],
    });
    setSelectedPanelId(newPanel.id);
  };

  // Delete Panel
  const handleDeletePanel = (panelId: string) => {
    if (!activePage || activePage.panels.length <= 1) return;
    const filtered = activePage.panels.filter((p) => p.id !== panelId);
    handleUpdatePage({
      ...activePage,
      panels: filtered.map((p, idx) => ({ ...p, order: idx + 1 })),
    });
    setSelectedPanelId(null);
  };

  // Duplicate Panel
  const handleDuplicatePanel = (panel: ComicPanel) => {
    if (!activePage) return;
    const cloned: ComicPanel = {
      ...panel,
      id: `panel_${Date.now()}`,
      order: activePage.panels.length + 1,
      bubbles: panel.bubbles.map((b) => ({ ...b, id: `bubble_${Date.now()}_${Math.random()}` })),
    };
    handleUpdatePage({
      ...activePage,
      panels: [...activePage.panels, cloned],
    });
  };

  // Add new Page
  const handleAddPage = () => {
    const initialImg = getCuratedArtisticFallback(
      activeStyle.category,
      "Establishing wide shot of next scene.",
      undefined,
      0
    );
    const newPage: ComicPage = {
      id: `page_${Date.now()}`,
      pageNumber: allPages.length + 1,
      layoutTemplate: project.readingDirection === "rtl" ? "manga-dynamic" : "grid-4",
      panels: [
        {
          id: `panel_${Date.now()}_1`,
          order: 1,
          prompt: "Establishing wide shot of next scene.",
          imageUrl: initialImg,
          aspectRatio: "16:9",
          visualDirection: {
            environment: "Atmospheric location",
            camera: "wide-shot",
            lighting: "Soft ambient cinematic light",
            composition: "Horizon rule of thirds",
            characterAction: "Scene begins",
            characterEmotions: {},
          },
          bubbles: [],
        },
      ],
    };

    const updatedPages = [...allPages, newPage];
    onUpdateProject({
      ...project,
      chapters: [
        {
          ...activeChapter,
          scenes: [{ ...activeScene, pages: updatedPages }],
        },
      ],
    });
    setActivePageIndex(updatedPages.length - 1);
  };

  // Duplicate Page
  const handleDuplicatePage = (index: number) => {
    const targetPage = allPages[index];
    if (!targetPage) return;

    const clonedPage: ComicPage = {
      ...targetPage,
      id: `page_${Date.now()}`,
      pageNumber: allPages.length + 1,
      panels: targetPage.panels.map((p, pIdx) => ({
        ...p,
        id: `panel_${Date.now()}_${pIdx}`,
        bubbles: p.bubbles.map((b) => ({ ...b, id: `bubble_${Date.now()}_${Math.random()}` })),
      })),
    };

    const updatedPages = [...allPages, clonedPage];
    onUpdateProject({
      ...project,
      chapters: [
        {
          ...activeChapter,
          scenes: [{ ...activeScene, pages: updatedPages }],
        },
      ],
    });
  };

  // Delete Page
  const handleDeletePage = (index: number) => {
    if (allPages.length <= 1) return;
    const updatedPages = allPages
      .filter((_, idx) => idx !== index)
      .map((p, idx) => ({ ...p, pageNumber: idx + 1 }));

    onUpdateProject({
      ...project,
      chapters: [
        {
          ...activeChapter,
          scenes: [{ ...activeScene, pages: updatedPages }],
        },
      ],
    });
    setActivePageIndex(Math.max(0, index - 1));
  };

  // Change page layout template
  const handleSelectLayout = (layoutTemplate: PageLayoutTemplate) => {
    if (!activePage) return;
    handleUpdatePage({ ...activePage, layoutTemplate });
  };

  // Insert character reference into selected panel
  const handleInsertCharacter = (character: ComicCharacter) => {
    if (!selectedPanel) return;
    const existingRef = selectedPanel.visualDirection.referenceCharacterIds || [];
    const updatedRef = Array.from(new Set([...existingRef, character.id]));
    handleUpdatePanel({
      ...selectedPanel,
      prompt: `${selectedPanel.prompt} Featuring ${character.name}, wearing ${character.memory.defaultCostume.upperBody}.`,
      visualDirection: {
        ...selectedPanel.visualDirection,
        referenceCharacterIds: updatedRef,
      },
    });
  };

  if (!activePage) {
    return <div className="p-8 text-center text-xs">Loading comic studio canvas...</div>;
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden text-[#171717]">
      {/* Central 3-Pane Work Area */}
      <div className="flex-1 flex flex-row overflow-hidden relative">
        {/* Left Tools & Layouts Sidebar */}
        <EditorSidebar
          currentPage={activePage}
          onSelectLayout={handleSelectLayout}
          characters={characters}
          onInsertCharacter={handleInsertCharacter}
          negativeConstraints={project.negativeConstraints}
          onUpdateNegativeConstraints={(constraints) =>
            onUpdateProject({ ...project, negativeConstraints: constraints })
          }
          isCoverMode={isCoverMode}
          setIsCoverMode={setIsCoverMode}
          storyBible={{
            logline: project.metadata.logline,
            worldSetting: project.metadata.worldSetting,
            continuityRules: project.metadata.continuityRules,
          }}
        />

        {/* Center Canvas / Cover Editor */}
        {isCoverMode ? (
          <div className="flex-1 overflow-y-auto bg-[#FAF8F5] flex items-center justify-center p-6">
            <CoverEditor
              project={project}
              characters={characters}
              style={activeStyle}
              onUpdateCover={(coverUrl) => {
                onUpdateProject({ ...project, coverImage: coverUrl });
              }}
            />
          </div>
        ) : (
          <ComicCanvas
            page={activePage}
            selectedPanelId={selectedPanelId}
            onSelectPanel={setSelectedPanelId}
            onUpdatePanel={handleUpdatePanel}
            onDeletePanel={handleDeletePanel}
            onDuplicatePanel={handleDuplicatePanel}
            onRegeneratePanel={handleRegeneratePanel}
            onAddPanel={handleAddPanel}
            readingDirection={project.readingDirection}
            zoomLevel={zoomLevel}
            setZoomLevel={setZoomLevel}
            continuityWarningPanelIds={continuityReport?.issues.map((i) => i.panelId) || []}
          />
        )}

        {/* Right AI Orchestrator & Continuity Panel */}
        <AIPanel
          selectedPanel={selectedPanel}
          activePage={activePage}
          characters={characters}
          style={activeStyle}
          onUpdatePanel={handleUpdatePanel}
          onRegeneratePanel={handleRegeneratePanel}
          continuityReport={continuityReport}
          onRunContinuityCheck={handleRunContinuityCheck}
          isGenerating={isGeneratingPanel}
        />
      </div>

      {/* Bottom Page Thumbnail Strip */}
      <PageTimeline
        pages={allPages}
        activePageIndex={activePageIndex}
        onSelectPage={setActivePageIndex}
        onAddPage={handleAddPage}
        onDuplicatePage={handleDuplicatePage}
        onDeletePage={handleDeletePage}
        readingDirection={project.readingDirection}
      />
    </div>
  );
}
