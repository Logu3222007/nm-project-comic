"use client";

import React, { useState, useRef } from "react";
import { ComicCharacter } from "@/types/character";
import {
  X,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Zap,
  Trash2,
  Check,
  Plus,
  Shield,
  Palette,
  Eye,
  ArrowRight,
} from "lucide-react";

interface CreateCharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCharacter: (character: ComicCharacter) => void;
}

export function CreateCharacterModal({
  isOpen,
  onClose,
  onSaveCharacter,
}: CreateCharacterModalProps) {
  const [name, setName] = useState("");
  const [alias, setAlias] = useState("");
  const [role, setRole] = useState<ComicCharacter["role"]>("protagonist");
  const [ageCategory, setAgeCategory] = useState<ComicCharacter["ageCategory"]>("young-adult");
  const [selectedStyleId, setSelectedStyleId] = useState("style_astral");
  const [backstory, setBackstory] = useState("");
  const [quote, setQuote] = useState("");
  const [soundFx, setSoundFx] = useState("KRA-THOOM!");
  const [personalityTags, setPersonalityTags] = useState<string[]>(["Brave", "Determined"]);
  const [customTagInput, setCustomTagInput] = useState("");

  // Three separate uploaded image slots, all working independently!
  const [portraitImg, setPortraitImg] = useState<string | null>(null);
  const [fullBodyImg, setFullBodyImg] = useState<string | null>(null);
  const [accessoryImg, setAccessoryImg] = useState<string | null>(null);

  // Hidden file input refs for each independent slot
  const portraitInputRef = useRef<HTMLInputElement>(null);
  const fullBodyInputRef = useRef<HTMLInputElement>(null);
  const accessoryInputRef = useRef<HTMLInputElement>(null);

  // Combat stats
  const [stats, setStats] = useState({
    strength: 88,
    speed: 85,
    power: 90,
    defense: 82,
    aura: 90,
  });

  if (!isOpen) return null;

  // The 5 Animation Style Models
  const animationStyles = [
    {
      id: "style_astral",
      name: "Astral Mythic Shonen",
      color: "#FF9900",
      preview: "/characters/kaelen-warlord.jpg",
      tag: "Fantasy Warlord",
    },
    {
      id: "style_cyberpop",
      name: "Neo-Tokyo Cyber-Pop",
      color: "#00E5FF",
      preview: "/characters/aoi-spark.jpg",
      tag: "Vibrant Webtoon",
    },
    {
      id: "style_abyssal",
      name: "Abyssal Ocean Titan",
      color: "#38BDF8",
      preview: "/characters/lord-thalassor.jpg",
      tag: "Deep Fantasy",
    },
    {
      id: "style_solar",
      name: "Solar Glow Aesthetic",
      color: "#FF2A8D",
      preview: "/characters/elena-diaz.jpg",
      tag: "Modern Cel-Shade",
    },
    {
      id: "style_volt",
      name: "Neon Bio-Circuit Cyberpunk",
      color: "#10B981",
      preview: "/characters/ren-volt.jpg",
      tag: "Sci-Fi Action",
    },
  ];

  // Independent file upload handlers
  const handleImageFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        setter(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddTag = () => {
    if (!customTagInput.trim()) return;
    if (!personalityTags.includes(customTagInput.trim())) {
      setPersonalityTags([...personalityTags, customTagInput.trim()]);
    }
    setCustomTagInput("");
  };

  const handleRemoveTag = (tag: string) => {
    setPersonalityTags(personalityTags.filter((t) => t !== tag));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Compile uploaded images in order
    const referenceImages: string[] = [];
    if (portraitImg) referenceImages.push(portraitImg);
    if (fullBodyImg) referenceImages.push(fullBodyImg);
    if (accessoryImg) referenceImages.push(accessoryImg);

    // If no images uploaded, fallback to selected style preview
    const chosenStyle = animationStyles.find((s) => s.id === selectedStyleId) || animationStyles[0];
    if (referenceImages.length === 0) {
      referenceImages.push(chosenStyle.preview);
    }

    const newChar: ComicCharacter = {
      id: `char_${Date.now()}`,
      name: name.trim(),
      alias: alias.trim() || "THE UNSTOPPABLE",
      role,
      ageCategory,
      personality: personalityTags.length > 0 ? personalityTags : ["Brave", "Adaptable"],
      backstory:
        backstory.trim() ||
        `${name.trim()} was trained in the ${chosenStyle.name} universe, wielding immense combat instincts and an unmistakable presence.`,
      quote: quote.trim() || "My story is just beginning!",
      soundFx: soundFx.trim() || "KRA-THOOM!",
      auraColor: chosenStyle.color,
      comicIssueTitle: `VOL. 1 • ${chosenStyle.name.toUpperCase()}`,
      stats,
      referenceImages,
      approvedPanelImages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      colorPalette: [chosenStyle.color, "#000000", "#FFFFFF"],
      memory: {
        faceShape: "Heroic structured jawline",
        hairStyle: "Dynamic stylized anime cut",
        hairColor: "Obsidian Black",
        eyeColor: chosenStyle.color,
        eyeShape: "Focused almond",
        skinTone: "Warm anime tone",
        signatureFeatures: ["Visual style emblem", "Distinctive energy aura"],
        bodyType: "Athletic hero build",
        heightCategory: "tall",
        defaultCostume: {
          upperBody: `Styled according to ${chosenStyle.name}`,
          lowerBody: "Reinforced tactical attire",
          footwear: "High-mobility combat boots",
          accessories: ["Power emblem", "Signature wrist guard"],
          colorPalette: [chosenStyle.color, "#0B0F19"],
        },
        expressions: {
          neutral: "Focused calm determination",
          intense: "Peak power battle state",
        },
      },
      referenceSheet: {
        frontViewUrl: referenceImages[0],
      },
    };

    onSaveCharacter(newChar);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto select-none">
      <div className="bg-[#0B0F19] border-2 border-slate-700/80 rounded-2xl max-w-3xl w-full p-5 sm:p-7 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.95),0_0_40px_rgba(0,229,255,0.2)] text-slate-200 relative my-auto max-h-[92vh] overflow-y-auto">
        {/* Glow ambient background accents */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00E5FF]/10 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#FF2A8D]/10 blur-[120px] pointer-events-none rounded-full" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00E5FF] to-[#FF2A8D] flex items-center justify-center text-black font-bangers text-xl shadow-md">
              ★
            </div>
            <div>
              <h2 className="font-bangers text-2xl tracking-wide text-white leading-none">
                BUILD YOUR OWN CUSTOM CHARACTER
              </h2>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Upload your reference photos and select an animation style DNA.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4 relative z-10">
          {/* ========================================================================= */}
          {/* STEP 1: Basic Identity */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-slate-300 mb-1">
                Character Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Kaelen, Kira, Marcus"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-[#00E5FF] text-white text-sm outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-slate-300 mb-1">
                Hero Alias / Title
              </label>
              <input
                type="text"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder="e.g., The Astral Warlord, Lightning Rogue"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-[#FF2A8D] text-white text-sm outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-slate-300 mb-1">
                Story Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-[#00E5FF] text-white text-sm outline-none transition-colors"
              >
                <option value="protagonist">Protagonist (Hero / Lead)</option>
                <option value="antagonist">Antagonist (Villain / Rival)</option>
                <option value="supporting">Sidekick / Ally</option>
                <option value="mentor">Mentor / Guardian</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-slate-300 mb-1">
                Age Category
              </label>
              <select
                value={ageCategory}
                onChange={(e) => setAgeCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-[#00E5FF] text-white text-sm outline-none transition-colors"
              >
                <option value="teen">Teen (14 - 18)</option>
                <option value="young-adult">Young Adult (19 - 28)</option>
                <option value="adult">Adult (29 - 49)</option>
                <option value="elder">Elder / Ancient (50+)</option>
              </select>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* STEP 2: Choose Animation Style DNA */}
          {/* ========================================================================= */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold uppercase text-[#00E5FF] flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" />
                Select Animation Style Model (AI Art DNA)
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                The 5 models represent distinct rendering styles
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {animationStyles.map((style) => {
                const isSelected = selectedStyleId === style.id;
                return (
                  <div
                    key={style.id}
                    onClick={() => setSelectedStyleId(style.id)}
                    className={`p-2 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center text-center ${
                      isSelected
                        ? "bg-[#111827] border-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.3)] scale-[1.03]"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-700 mb-1.5">
                      <img
                        src={style.preview}
                        alt={style.name}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    <div className="font-bangers text-xs text-white leading-tight line-clamp-1">
                      {style.name}
                    </div>
                    <div
                      className="text-[9px] font-mono mt-0.5"
                      style={{ color: style.color }}
                    >
                      {style.tag}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* STEP 3: Uploaded Image Options (All Working Separately!) */}
          {/* ========================================================================= */}
          <div className="space-y-2.5 bg-[#070A12] border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold uppercase text-[#FFCC00] flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                Upload Your Reference Images (Working Independently)
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                Optional: Upload 1, 2, or 3 separate angles
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Slot 1: Face / Portrait */}
              <div className="p-3 rounded-xl border border-slate-800 bg-[#0E1424] space-y-2">
                <div className="text-[11px] font-bold text-slate-300 font-mono flex items-center justify-between">
                  <span>1. Front Portrait</span>
                  {portraitImg && (
                    <span className="text-emerald-400 text-[9px] flex items-center gap-0.5">
                      <Check className="w-3 h-3 stroke-[3]" /> Ready
                    </span>
                  )}
                </div>

                <div
                  onClick={() => portraitInputRef.current?.click()}
                  className="h-28 rounded-lg border-2 border-dashed border-slate-700 hover:border-[#00E5FF] bg-slate-900/60 flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden relative group"
                >
                  {portraitImg ? (
                    <>
                      <img
                        src={portraitImg}
                        alt="Portrait reference"
                        className="w-full h-full object-cover object-top"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPortraitImg(null);
                        }}
                        className="absolute top-1 right-1 p-1 rounded-md bg-black/80 hover:bg-rose-600 text-white transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-2 text-slate-400">
                      <Upload className="w-5 h-5 mx-auto mb-1 text-[#00E5FF]" />
                      <div className="text-[10px] font-semibold text-slate-300">Upload Face Photo</div>
                      <div className="text-[8px] text-slate-500 font-mono">PNG, JPG, WEBP</div>
                    </div>
                  )}
                  <input
                    ref={portraitInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageFileChange(e, setPortraitImg)}
                  />
                </div>
              </div>

              {/* Slot 2: Full Body / Action */}
              <div className="p-3 rounded-xl border border-slate-800 bg-[#0E1424] space-y-2">
                <div className="text-[11px] font-bold text-slate-300 font-mono flex items-center justify-between">
                  <span>2. Full Body Costume</span>
                  {fullBodyImg && (
                    <span className="text-emerald-400 text-[9px] flex items-center gap-0.5">
                      <Check className="w-3 h-3 stroke-[3]" /> Ready
                    </span>
                  )}
                </div>

                <div
                  onClick={() => fullBodyInputRef.current?.click()}
                  className="h-28 rounded-lg border-2 border-dashed border-slate-700 hover:border-[#FF2A8D] bg-slate-900/60 flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden relative group"
                >
                  {fullBodyImg ? (
                    <>
                      <img
                        src={fullBodyImg}
                        alt="Full body reference"
                        className="w-full h-full object-cover object-top"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFullBodyImg(null);
                        }}
                        className="absolute top-1 right-1 p-1 rounded-md bg-black/80 hover:bg-rose-600 text-white transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-2 text-slate-400">
                      <Upload className="w-5 h-5 mx-auto mb-1 text-[#FF2A8D]" />
                      <div className="text-[10px] font-semibold text-slate-300">Upload Full Body</div>
                      <div className="text-[8px] text-slate-500 font-mono">Pose / Costume</div>
                    </div>
                  )}
                  <input
                    ref={fullBodyInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageFileChange(e, setFullBodyImg)}
                  />
                </div>
              </div>

              {/* Slot 3: Weapon / Detail Prop */}
              <div className="p-3 rounded-xl border border-slate-800 bg-[#0E1424] space-y-2">
                <div className="text-[11px] font-bold text-slate-300 font-mono flex items-center justify-between">
                  <span>3. Weapon / Gear Detail</span>
                  {accessoryImg && (
                    <span className="text-emerald-400 text-[9px] flex items-center gap-0.5">
                      <Check className="w-3 h-3 stroke-[3]" /> Ready
                    </span>
                  )}
                </div>

                <div
                  onClick={() => accessoryInputRef.current?.click()}
                  className="h-28 rounded-lg border-2 border-dashed border-slate-700 hover:border-[#FFCC00] bg-slate-900/60 flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden relative group"
                >
                  {accessoryImg ? (
                    <>
                      <img
                        src={accessoryImg}
                        alt="Accessory reference"
                        className="w-full h-full object-cover object-top"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAccessoryImg(null);
                        }}
                        className="absolute top-1 right-1 p-1 rounded-md bg-black/80 hover:bg-rose-600 text-white transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-2 text-slate-400">
                      <Upload className="w-5 h-5 mx-auto mb-1 text-[#FFCC00]" />
                      <div className="text-[10px] font-semibold text-slate-300">Upload Weapon / Gear</div>
                      <div className="text-[8px] text-slate-500 font-mono">Weapon / Accessory</div>
                    </div>
                  )}
                  <input
                    ref={accessoryInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageFileChange(e, setAccessoryImg)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* STEP 4: Dialogue Quote & Backstory */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-slate-300 mb-1">
                Signature Dialogue Quote
              </label>
              <input
                type="text"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="e.g., Even in the abyss, the stars answer to me!"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-[#00E5FF] text-white text-sm outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-slate-300 mb-1">
                Sound FX Action Cry
              </label>
              <input
                type="text"
                value={soundFx}
                onChange={(e) => setSoundFx(e.target.value)}
                placeholder="e.g., KRA-THOOM!, SKRR-SHING!"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-[#FF2A8D] text-white text-sm outline-none transition-colors"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-mono font-bold uppercase text-slate-300 mb-1">
                Character Lore & Backstory
              </label>
              <textarea
                rows={2}
                value={backstory}
                onChange={(e) => setBackstory(e.target.value)}
                placeholder="Describe your character's origin, visual personality, and fighting style..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-[#00E5FF] text-white text-sm outline-none transition-colors resize-none"
              />
            </div>
          </div>

          {/* ========================================================================= */}
          {/* Personality Tags */}
          {/* ========================================================================= */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-slate-300 mb-1.5">
              Personality Traits
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {personalityTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 flex items-center gap-1.5 font-mono"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-400 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add trait (e.g. Cunning, Loyal, Cybernetic)..."
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white outline-none"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white border border-slate-700 cursor-pointer font-bold"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Footer Submit Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="comic-btn-cyan flex items-center gap-2 px-6 py-2.5 rounded-xl font-bangers text-lg tracking-wider uppercase cursor-pointer"
            >
              <span>Register & Save Character</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
