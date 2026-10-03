"use client";

import React, { useState, useEffect } from "react";
import { ComicProject } from "@/types/comic";
import { ComicCharacter } from "@/types/character";
import { ArtStylePreset } from "@/types/style";
import { AuthSession } from "@/types/auth";
import {
  getStoredProjects,
  saveStoredProject,
  deleteStoredProject,
  getStoredCharacters,
  saveStoredCharacter,
  getStoredSession,
  saveStoredSession,
  SEED_PROJECT,
  SEED_CHARACTERS,
} from "@/lib/storage";
import { DEFAULT_STYLES } from "@/lib/constants";
import { Navbar, ActiveTab } from "@/components/layout/Navbar";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { ComicEditor } from "@/components/editor/ComicEditor";
import { CharacterStudio } from "@/components/characters/CharacterStudio";
import { StyleStudio } from "@/components/styles/StyleStudio";
import { ModelManager } from "@/components/models/ModelManager";
import { CreateComicModal } from "@/components/dashboard/CreateComicModal";
import { QuickGenerateModal } from "@/components/dashboard/QuickGenerateModal";
import { ReaderModal } from "@/components/reader/ReaderModal";
import { ExportModal } from "@/components/export/ExportModal";
import { AuthModal } from "@/components/auth/AuthModal";
import { CreateCharacterModal } from "@/components/characters/CreateCharacterModal";
import { UploadStyleModal } from "@/components/styles/UploadStyleModal";
import { SecurityApp } from "@/components/security/SecurityApp";
import { UpgradeModal } from "@/components/billing/UpgradeModal";
import { ProfileModal } from "@/components/profile/ProfileModal";

export function ComicStudioApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [projects, setProjects] = useState<ComicProject[]>([SEED_PROJECT]);
  const [activeProject, setActiveProject] = useState<ComicProject | null>(SEED_PROJECT);
  const [characters, setCharacters] = useState<ComicCharacter[]>([]);
  const [styles, setStyles] = useState<ArtStylePreset[]>(DEFAULT_STYLES);
  const [session, setSession] = useState<AuthSession>({
    user: null,
    isAuthenticated: false,
  });
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "offline">("saved");

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isQuickGenerateOpen, setIsQuickGenerateOpen] = useState(false);
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isCreateCharacterOpen, setIsCreateCharacterOpen] = useState(false);
  const [isUploadStyleOpen, setIsUploadStyleOpen] = useState(false);

  // Load persistent local data & synchronize server session
  useEffect(() => {
    const loadedProjects = getStoredProjects();
    const loadedChars = getStoredCharacters();
    const loadedSession = getStoredSession();

    setProjects(loadedProjects);
    setActiveProject(loadedProjects[0] || SEED_PROJECT);

    // Keep only real user-created characters without fake persona seeds
    const realOnlyChars = loadedChars.filter(
      (c) =>
        c.id !== "char_kaelen_warlord" &&
        c.id !== "char_aoi_hoshino" &&
        c.id !== "char_thalassor" &&
        c.id !== "char_elena_diaz" &&
        c.id !== "char_ren_kurogane"
    );
    setCharacters(realOnlyChars);
    if (typeof window !== "undefined") {
      localStorage.setItem("panelcraft_characters", JSON.stringify(realOnlyChars));
    }

    setSession(loadedSession);

    // Reconcile server-side authentication session
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.isAuthenticated && data.user) {
          const verifiedSession: AuthSession = {
            user: data.user,
            isAuthenticated: true,
          };
          setSession(verifiedSession);
          saveStoredSession(verifiedSession);
        }
      })
      .catch(() => {
        // Fallback gracefully to local stored session if offline
      });
  }, []);

  // Update active project with autosave
  const handleUpdateActiveProject = (updated: ComicProject) => {
    setSaveStatus("saving");
    setActiveProject(updated);

    const updatedProjects = projects.map((p) => (p.id === updated.id ? updated : p));
    setProjects(updatedProjects);
    saveStoredProject(updated);

    setTimeout(() => {
      setSaveStatus("saved");
    }, 600);
  };

  const handleSelectProject = (project: ComicProject) => {
    setActiveProject(project);
    setActiveTab("editor");
  };

  const handleDeleteProject = (projectId: string) => {
    deleteStoredProject(projectId);
    const remaining = projects.filter((p) => p.id !== projectId);
    setProjects(remaining);
    if (activeProject?.id === projectId) {
      setActiveProject(remaining[0] || null);
    }
  };

  const handleProjectCreated = (newProject: ComicProject, newChars: ComicCharacter[]) => {
    saveStoredProject(newProject);
    setProjects((prev) => [newProject, ...prev]);
    setActiveProject(newProject);

    newChars.forEach((c) => saveStoredCharacter(c));
    setCharacters((prev) => [...newChars, ...prev]);

    // Re-sync session credits following deduction
    const updatedSession = getStoredSession();
    setSession(updatedSession);

    setActiveTab("editor");
  };

  const handleUpgradeSuccess = (newCredits: number) => {
    const current = getStoredSession();
    if (current.user) {
      current.user.credits = newCredits;
      setSession({ ...current });
      saveStoredSession(current);
    }
  };

  const handleSaveCharacter = (char: ComicCharacter) => {
    saveStoredCharacter(char);
    const updated = characters.map((c) => (c.id === char.id ? char : c));
    setCharacters(updated);
  };

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Continue client cleanup
    }
    const clearedSession: AuthSession = { user: null, isAuthenticated: false };
    saveStoredSession(clearedSession);
    setSession(clearedSession);
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#090D16] comic-dot-grid text-[#F8FAFC]">
      {/* Studio Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeProject={activeProject}
        saveStatus={saveStatus}
        onOpenReader={() => setIsReaderOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        session={session}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSignOut={handleSignOut}
        onOpenUpgrade={() => setIsUpgradeOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Main Studio Viewport with smooth transition enter */}
      <main key={activeTab} className="flex-1 flex overflow-hidden tab-fade-enter">
        {activeTab === "dashboard" && (
          <DashboardView
            projects={projects}
            characters={characters}
            styles={styles}
            session={session}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            onOpenQuickGenerate={() => setIsQuickGenerateOpen(true)}
            onSelectProject={handleSelectProject}
            onDeleteProject={handleDeleteProject}
            onOpenReader={(p) => {
              setActiveProject(p);
              setIsReaderOpen(true);
            }}
            onOpenProfile={() => setIsProfileOpen(true)}
          />
        )}

        {activeTab === "editor" && activeProject && (
          <ComicEditor
            project={activeProject}
            characters={characters}
            onUpdateProject={handleUpdateActiveProject}
            onSaveNotification={() => {
              setSaveStatus("saving");
              setTimeout(() => setSaveStatus("saved"), 500);
            }}
          />
        )}

        {activeTab === "characters" && (
          <CharacterStudio
            characters={characters}
            onSaveCharacter={handleSaveCharacter}
            onCreateNewCharacter={() => setIsCreateCharacterOpen(true)}
            onOpenUploadStyle={() => setIsUploadStyleOpen(true)}
          />
        )}

        {activeTab === "styles" && (
          <StyleStudio
            activeStyleId={activeProject?.styleId || DEFAULT_STYLES[0].id}
            onSelectStyle={(newStyle) => {
              if (activeProject) {
                handleUpdateActiveProject({ ...activeProject, styleId: newStyle.id });
              }
            }}
          />
        )}

        {activeTab === "models" && <ModelManager />}
      </main>

      {/* Modals */}
      <CreateComicModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={handleProjectCreated}
        currentCredits={session.user?.credits ?? 100000}
        onOpenUpgrade={() => setIsUpgradeOpen(true)}
      />

      <QuickGenerateModal
        isOpen={isQuickGenerateOpen}
        onClose={() => setIsQuickGenerateOpen(false)}
        onProjectCreated={handleProjectCreated}
        currentCredits={session.user?.credits ?? 100000}
        onOpenUpgrade={() => setIsUpgradeOpen(true)}
      />

      {activeProject && (
        <>
          <ReaderModal
            project={activeProject}
            characters={characters}
            isOpen={isReaderOpen}
            onClose={() => setIsReaderOpen(false)}
          />

          <ExportModal
            project={activeProject}
            characters={characters}
            activePageIndex={0}
            isOpen={isExportOpen}
            onClose={() => setIsExportOpen(false)}
          />
        </>
      )}

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(newSession) => setSession(newSession)}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        session={session}
        projects={projects}
        onUpdateUser={(updatedUser) => {
          const updatedSession: AuthSession = { user: updatedUser, isAuthenticated: true };
          setSession(updatedSession);
          saveStoredSession(updatedSession);
        }}
        onSelectProject={handleSelectProject}
      />

      <CreateCharacterModal
        isOpen={isCreateCharacterOpen}
        onClose={() => setIsCreateCharacterOpen(false)}
        onSaveCharacter={(newChar) => {
          saveStoredCharacter(newChar);
          setCharacters((prev) => [newChar, ...prev]);
        }}
      />

      <UploadStyleModal
        isOpen={isUploadStyleOpen}
        onClose={() => setIsUploadStyleOpen(false)}
        onSaveStyle={(newStyle) => {
          setStyles((prev) => [newStyle, ...prev]);
        }}
      />

      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        currentCredits={session.user?.credits ?? 100000}
        onUpgradeSuccess={handleUpgradeSuccess}
      />
    </div>
  );
}
