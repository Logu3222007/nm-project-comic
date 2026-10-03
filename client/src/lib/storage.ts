import { ComicProject } from "@/types/comic";
import { ComicCharacter } from "@/types/character";
import { ModelProviderConfig } from "@/types/model";
import { AuthSession } from "@/types/auth";
import { DEFAULT_MODELS } from "./constants";

const STORAGE_KEYS = {
  PROJECTS: "panelcraft_projects",
  CHARACTERS: "panelcraft_characters",
  MODELS: "panelcraft_models",
  SESSION: "panelcraft_session",
  ACTIVE_PROJECT: "panelcraft_active_project_id",
};

// Default seed project for first-time users
export const SEED_PROJECT: ComicProject = {
  id: "proj_midnight_detective",
  userId: "user_demo_01",
  title: "The Midnight Hourglass",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  readingDirection: "ltr",
  styleId: "style_graphic_novel_noir",
  characterIds: ["char_det_marlowe", "char_elena_vance"],
  version: 1,
  coverImage: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1000&auto=format&fit=crop&q=80",
  metadata: {
    title: "The Midnight Hourglass",
    logline: "A detective discovers that the city loses exactly one hour of time every midnight.",
    premise: "In the rain-soaked metropolis of New Aethelgard, clocks strike 12:00 AM and freeze for sixty minutes in an extradimensional stillness known as the Blank Hour.",
    synopsis: "Private investigator Sean Marlowe is hired to locate a watchmaker who vanished during the 25th hour. What he uncovers is a subterranean temporal engine draining the city's collective memories.",
    genre: ["Supernatural Detective", "Noir", "Psychological Thriller"],
    targetAudience: "Young Adult / Mature",
    tone: "Brooding, atmospheric, suspenseful, philosophical",
    worldSetting: "1940s retro-futuristic urban sprawl bathed in neon rain and perpetual mist",
    continuityRules: [
      "Marlowe always wears his distressed trench coat with a cracked bronze lapel pin.",
      "During the Blank Hour, shadows fall in impossible angles opposite to light sources.",
      "Elena Vance carries an antique pocket chronometer with two second hands.",
    ],
  },
  negativeConstraints: [
    "excessive saturation",
    "deformed hands",
    "extra fingers",
    "modern smartphones",
    "random text watermark",
  ],
  chapters: [
    {
      id: "chap_01",
      chapterNumber: 1,
      title: "The 25th Hour",
      summary: "Sean Marlowe waits in his damp office as the clock ticks towards 11:59 PM.",
      scenes: [
        {
          id: "scene_01",
          sceneNumber: 1,
          location: "Marlowe's Office - 4th Floor, Old Port District",
          timeOfDay: "11:58 PM",
          weather: "Heavy rainfall",
          synopsis: "The streetlamps flicker outside the rain-streaked Venetian blinds. Marlowe pours his last cup of bitter chicory.",
          characterIds: ["char_det_marlowe"],
          pages: [
            {
              id: "page_01",
              pageNumber: 1,
              layoutTemplate: "grid-4",
              panels: [
                {
                  id: "panel_p1_1",
                  order: 1,
                  prompt: "A gritty 1940s detective office, Venetian blinds casting hard diagonal shadows, cigarette smoke curling into a dim brass ceiling fan, rainy night outside.",
                  aspectRatio: "4:3",
                  colSpan: 6,
                  rowSpan: 1,
                  imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80",
                  visualDirection: {
                    environment: "Gritty detective office with Venetian blinds",
                    camera: "medium-shot",
                    lighting: "Hard chiaroscuro with streetlamp reflections",
                    composition: "Rule of thirds, blinds slicing frame diagonally",
                    characterAction: "Sitting hunched behind mahogany desk",
                    characterEmotions: { char_det_marlowe: "exhausted, hyper-alert" },
                    timeOfDay: "11:58 PM",
                    weather: "Heavy rain",
                  },
                  bubbles: [
                    {
                      id: "b1",
                      type: "narration",
                      text: "In this city, sixty seconds after midnight doesn't lead to 12:01.",
                      x: 8,
                      y: 10,
                      width: 55,
                    },
                  ],
                },
                {
                  id: "panel_p1_2",
                  order: 2,
                  prompt: "Extreme close up of an antique bronze mantel clock on a cluttered desk, the brass pendulum suspended mid-swing, rain droplets frozen in air outside the window.",
                  aspectRatio: "4:3",
                  colSpan: 6,
                  rowSpan: 1,
                  imageUrl: "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=800&auto=format&fit=crop&q=80",
                  visualDirection: {
                    environment: "Cluttered desk with pocket watches and damp blueprints",
                    camera: "extreme-close-up",
                    lighting: "Gleam of brass under solitary desk lamp",
                    composition: "Centered macro focus on clock hands frozen at 12:00",
                    characterAction: "None",
                    characterEmotions: {},
                    soundEffects: ["*TICK... SILENCE*"],
                  },
                  bubbles: [
                    {
                      id: "b2",
                      type: "sfx",
                      text: "CLACK!",
                      x: 65,
                      y: 15,
                      fontSize: 18,
                    },
                    {
                      id: "b3",
                      type: "narration",
                      text: "It leads to the Hour that never was.",
                      x: 10,
                      y: 70,
                      width: 50,
                    },
                  ],
                },
                {
                  id: "panel_p1_3",
                  order: 3,
                  prompt: "Detective Sean Marlowe standing at the rain-streaked window, trench coat collar turned up, piercing grey eyes gazing out into a city where all vehicle headlights have turned deep violet.",
                  aspectRatio: "4:3",
                  colSpan: 6,
                  rowSpan: 1,
                  imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80",
                  visualDirection: {
                    environment: "Window overlooking skyline of New Aethelgard",
                    camera: "close-up",
                    lighting: "Violet backlight from streets, rim lighting on facial stubble",
                    composition: "Profile shot looking out",
                    characterAction: "Resting palm on cold glass",
                    characterEmotions: { char_det_marlowe: "grim anticipation" },
                    referenceCharacterIds: ["char_det_marlowe"],
                  },
                  bubbles: [
                    {
                      id: "b4",
                      type: "thought",
                      text: "The silence always rolls in like a sudden drop in barometric pressure.",
                      speaker: "Sean Marlowe",
                      x: 12,
                      y: 12,
                      width: 60,
                    },
                  ],
                },
                {
                  id: "panel_p1_4",
                  order: 4,
                  prompt: "A mysterious silhouette in an emerald coat stepping into the doorway of the office, holding an ornate clockmaker's briefcase with glowing steam valves.",
                  aspectRatio: "4:3",
                  colSpan: 6,
                  rowSpan: 1,
                  imageUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80",
                  visualDirection: {
                    environment: "Frosted glass office door swinging open slowly",
                    camera: "low-angle",
                    lighting: "Corridor fog backlit with amber hue",
                    composition: "Dramatic framed entry",
                    characterAction: "Stepping over threshold silently",
                    characterEmotions: { char_elena_vance: "coldly determined" },
                    referenceCharacterIds: ["char_elena_vance"],
                  },
                  bubbles: [
                    {
                      id: "b5",
                      type: "speech",
                      text: "Are you still tracking stolen time, Mr. Marlowe?",
                      speaker: "Elena Vance",
                      x: 20,
                      y: 20,
                      width: 60,
                    },
                  ],
                },
              ],
            },
            {
              id: "page_02",
              pageNumber: 2,
              layoutTemplate: "cinematic-wide",
              panels: [
                {
                  id: "panel_p2_1",
                  order: 1,
                  prompt: "Elena Vance placing an intricate brass clock mechanism onto Marlowe's desk, gears interlocked with small crystal vials glowing with liquid temporal resonance.",
                  aspectRatio: "16:9",
                  colSpan: 12,
                  imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1000&auto=format&fit=crop&q=80",
                  visualDirection: {
                    environment: "Desk surface littered with case files",
                    camera: "wide-shot",
                    lighting: "Warm glow from glowing crystal mechanism",
                    composition: "Two characters facing off across the desk",
                    characterAction: "Revealing the stolen clockwork core",
                    characterEmotions: {
                      char_det_marlowe: "stunned disbelief",
                      char_elena_vance: "composed urgency",
                    },
                  },
                  bubbles: [
                    {
                      id: "b6",
                      type: "speech",
                      text: "My father didn't disappear. Someone bottled his hour.",
                      speaker: "Elena Vance",
                      x: 10,
                      y: 15,
                      width: 45,
                    },
                    {
                      id: "b7",
                      type: "speech",
                      text: "That's impossible. Time doesn't leave fingerprints.",
                      speaker: "Sean Marlowe",
                      x: 55,
                      y: 55,
                      width: 40,
                    },
                  ],
                },
                {
                  id: "panel_p2_2",
                  order: 2,
                  prompt: "Close up of Sean Marlowe's weathered face, his cracked bronze lapel pin catching the luminescent glow, a cigarette forgotten between his fingers.",
                  aspectRatio: "16:9",
                  colSpan: 6,
                  imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80",
                  visualDirection: {
                    environment: "Dim corner of desk",
                    camera: "close-up",
                    lighting: "Dual tone amber and emerald reflection",
                    composition: "Intense gaze downwards at evidence",
                    characterAction: "Leaning forward intently",
                    characterEmotions: { char_det_marlowe: "sharp analytical focus" },
                    referenceCharacterIds: ["char_det_marlowe"],
                  },
                  bubbles: [
                    {
                      id: "b8",
                      type: "thought",
                      text: "Unless someone figured out how to forge the pendulum.",
                      speaker: "Sean Marlowe",
                      x: 15,
                      y: 15,
                      width: 70,
                    },
                  ],
                },
                {
                  id: "panel_p2_3",
                  order: 3,
                  prompt: "Wide panoramic view of New Aethelgard city street during the Blank Hour, rain completely suspended motionless in midair like diamond beads, pedestrians frozen in mid-stride.",
                  aspectRatio: "16:9",
                  colSpan: 6,
                  imageUrl: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&auto=format&fit=crop&q=80",
                  visualDirection: {
                    environment: "Frozen city avenue under violet mist",
                    camera: "wide-shot",
                    lighting: "Surreal ambient violet haze, zero shadows",
                    composition: "Vanishing perspective down grand boulevard",
                    characterAction: "World in suspended animation",
                    characterEmotions: {},
                  },
                  bubbles: [
                    {
                      id: "b9",
                      type: "narration",
                      text: "Outside, forty million heartbeats paused together.",
                      x: 10,
                      y: 70,
                      width: 80,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export const SEED_CHARACTERS: ComicCharacter[] = [
  {
    id: "char_kaelen_warlord",
    name: "Kaelen Vane",
    alias: "The Constellation Warlord",
    role: "protagonist",
    ageCategory: "adult",
    personality: ["Indomitable", "Honorable", "Tactical", "Fierce"],
    backstory: "High Chieftain of the Astraea Steppes who bears the sacred star constellation mantle and the serpent-sun seal, channeling ancestral storm winds through ancient battle runes.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    colorPalette: ["#A52A2A", "#1E3A8A", "#D97706", "#292524"],
    referenceImages: ["/characters/kaelen-warlord.jpg"],
    approvedPanelImages: ["/characters/kaelen-warlord.jpg"],
    stats: {
      strength: 96,
      speed: 82,
      power: 94,
      defense: 90,
      aura: 95,
    },
    soundFx: "KRA-THOOM!",
    quote: "The stars do not negotiate with the dark — and neither do I.",
    comicIssueTitle: "ISSUE #01: DAWN OF THE ASTRAL WARLORD",
    auraColor: "#FFCC00",
    memory: {
      faceShape: "Chiseled warrior jaw with dark braided beard and mustache",
      hairStyle: "Long jet-black warrior braid with twin forward braids and silver clasps",
      hairColor: "Jet black",
      eyeColor: "Piercing obsidian amber",
      eyeShape: "Fierce hooded gaze",
      skinTone: "Weathered sun-bronzed",
      signatureFeatures: [
        "Geometric constellation tattoos across chest and shoulders",
        "Golden serpent ouroboros belt buckle with royal sapphire jewel",
        "Constellation sash woven with celestial star alignments",
        "Heavy engraved gold bracers studded with blue sapphires",
      ],
      bodyType: "Imposing, muscular titan warrior build",
      heightCategory: "tall",
      defaultCostume: {
        upperBody: "Deep crimson battle mantle over draped navy indigo tunic and pearl talisman necklace",
        lowerBody: "Linen warrior pants with celestial constellation tabard",
        footwear: "Laced leather combat sandals with ankle bells",
        accessories: ["Sapphire serpent belt", "Carved gold arm bracers", "Pearl astral necklace"],
        colorPalette: ["#A52A2A", "#1E3A8A", "#D97706", "#292524"],
      },
      expressions: {
        neutral: "Commanding chieftain resolve",
        intense: "War-cry glare, brow furrowed in unyielding power",
      },
    },
    referenceSheet: {
      frontViewUrl: "/characters/kaelen-warlord.jpg",
    },
  },
  {
    id: "char_aoi_spark",
    name: "Aoi Hoshino",
    alias: "The Sonic Alchemist",
    role: "deuteragonist",
    ageCategory: "young-adult",
    personality: ["Rebellious", "Electric", "Genius Hacker", "Unpredictable"],
    backstory: "A synth-wave street hacker whose custom sub-harmonic audio deck can shatter cryptographic firewalls and materialize hard-light acoustic barriers across the neon rooftops of Neo-Shibuya.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    colorPalette: ["#00E5FF", "#FF2A8D", "#FBBF24", "#1E293B"],
    referenceImages: ["/characters/aoi-spark.jpg"],
    approvedPanelImages: ["/characters/aoi-spark.jpg"],
    stats: {
      strength: 72,
      speed: 96,
      power: 91,
      defense: 78,
      aura: 97,
    },
    soundFx: "BZZZZT-DROP!",
    quote: "Don't blink. The bass hasn't even dropped yet.",
    comicIssueTitle: "ISSUE #02: ELECTRIC REBEL ANTHEM",
    auraColor: "#FF2A8D",
    memory: {
      faceShape: "Delicate anime heart-shaped face with blush cheeks",
      hairStyle: "Textured feathered black bob with warm honey-blonde underlayer highlights",
      hairColor: "Jet black with golden honey underdye",
      eyeColor: "Radiant golden amber",
      eyeShape: "Large expressive anime eyes with star sparkle",
      skinTone: "Porcelain ivory",
      signatureFeatures: [
        "White celestial star hair pin on left temple",
        "Silver star pendant on choker necklace",
        "Multiple cartilage piercings and silver ear cuffs",
        "Glossy vinyl track pants with electric white lightning bolt stripe",
      ],
      bodyType: "Agile, slender cyber-dancer build",
      heightCategory: "medium",
      defaultCostume: {
        upperBody: "Distressed raw denim cropped jacket draped off-shoulder over high-neck white lace crop top",
        lowerBody: "High-shine black vinyl track trousers with white lightning chevron stripe",
        footwear: "Cyberpunk high-top neon sneakers",
        accessories: ["Star hair pin", "Star pendant necklace", "Triple ear piercings"],
        colorPalette: ["#1D4ED8", "#FFFFFF", "#111827", "#F59E0B"],
      },
      expressions: {
        neutral: "Playful confident smirk",
        intense: "Focused DJ hacker flow state",
      },
    },
    referenceSheet: {
      frontViewUrl: "/characters/aoi-spark.jpg",
    },
  },
  {
    id: "char_lord_thalassor",
    name: "Lord Thalassor",
    alias: "Sovereign of the Sunken Abyss",
    role: "mentor",
    ageCategory: "elder",
    personality: ["Regal", "Ancient", "Commanding", "Unrelenting"],
    backstory: "Primordial monarch of the submerged continental empire. Wielding the Crystalline Abyssal Claymore, he rules the deep trenches with ancient tide-sorcery alongside his legion of heavy-armored deep-sea paladins.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    colorPalette: ["#00E5FF", "#1E1B4B", "#6366F1", "#F43F5E"],
    referenceImages: ["/characters/lord-thalassor.jpg"],
    approvedPanelImages: ["/characters/lord-thalassor.jpg"],
    stats: {
      strength: 98,
      speed: 85,
      power: 99,
      defense: 96,
      aura: 98,
    },
    soundFx: "TIDAL CRASH!",
    quote: "The ocean remembers every kingdom that ever thought it was eternal.",
    comicIssueTitle: "ISSUE #03: WRATH OF THE ABYSSAL KING",
    auraColor: "#00E5FF",
    memory: {
      faceShape: "Chiseled weathered sea-king visage with stone-crack markings",
      hairStyle: "Flowing oceanic silver-white hair and magnificent full beard",
      hairColor: "Silver white",
      eyeColor: "Blinding luminescence cyan blue",
      eyeShape: "Glowing ocular rift with no pupils",
      skinTone: "Granite grey with bio-luminescent cracked fissures",
      signatureFeatures: [
        "Glowing blue eyes illuminating underwater darkness",
        "Living coral and aqua crystal gorgon medallion around chest",
        "Massive single-edged runic broadsword forged from deep sea glass",
        "Abyssal Royal Guard sentinels with red ocular visors behind him",
      ],
      bodyType: "Colossal mythological titan build",
      heightCategory: "tall",
      defaultCostume: {
        upperBody: "Draped iridescent royal blue and purple abyss mantle over bare granite chest with coral wreath medallion",
        lowerBody: "Silver embroidered ceremonial royal war kilt with deep purple battle sash",
        footwear: "Reinforced deep-sea grieves",
        accessories: ["Runic broadsword", "Aqua sea-stone belt", "Coral chest medallion"],
        colorPalette: ["#00E5FF", "#3B82F6", "#8B5CF6", "#1E1B4B"],
      },
      expressions: {
        neutral: "Majestic abyssal emperor stillness",
        intense: "Godly command summoning tidal maelstroms",
      },
    },
    referenceSheet: {
      frontViewUrl: "/characters/lord-thalassor.jpg",
    },
  },
  {
    id: "char_elena_diaz",
    name: "Elena Diaz",
    alias: "The Solar Catalyst",
    role: "protagonist",
    ageCategory: "young-adult",
    personality: ["Passionate", "Charming", "Perceptive", "Courageous"],
    backstory: "A photographer who unlocked ancient heliocentric latent genetics, allowing her to store ambient photons and unleash blinding light barriers to protect her borough from underworld syndicates.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    colorPalette: ["#38BDF8", "#F59E0B", "#F8FAFC", "#1E293B"],
    referenceImages: ["/characters/elena-diaz.jpg"],
    approvedPanelImages: ["/characters/elena-diaz.jpg"],
    stats: {
      strength: 76,
      speed: 91,
      power: 89,
      defense: 84,
      aura: 94,
    },
    soundFx: "SOLAR FLASH!",
    quote: "Even through the darkest alleys, the morning light always breaks.",
    comicIssueTitle: "ISSUE #04: RADIANT HORIZON",
    auraColor: "#F59E0B",
    memory: {
      faceShape: "Stunning oval silhouette with soft defined jawline",
      hairStyle: "Voluminous cascading waves with auburn-chestnut ombre tips",
      hairColor: "Deep espresso brunette with warm copper highlights",
      eyeColor: "Dazzling electric sapphire blue",
      eyeShape: "Almond shaped with bold natural lashes and dark defined brows",
      skinTone: "Warm honey sun-kissed",
      signatureFeatures: [
        "Striking bright blue eyes contrasting against warm tan skin",
        "Polished gold hoop earrings",
        "Minimalist aesthetic with high-waisted denim jeans",
      ],
      bodyType: "Athletic, graceful hourglass silhouette",
      heightCategory: "medium",
      defaultCostume: {
        upperBody: "Classic pure white crew-neck cropped fitted baby tee",
        lowerBody: "High-waisted faded indigo denim jeans with contrast brass rivets",
        footwear: "Clean white streetwear sneakers",
        accessories: ["Thick gold hoop earrings", "Gold chain ring"],
        colorPalette: ["#FFFFFF", "#60A5FA", "#D97706", "#1F2937"],
      },
      expressions: {
        neutral: "Confident, thoughtful warm gaze",
        intense: "Focused determination with glowing sapphire eyes",
      },
    },
    referenceSheet: {
      frontViewUrl: "/characters/elena-diaz.jpg",
    },
  },
  {
    id: "char_ren_volt",
    name: "Ren Kurogane",
    alias: "The Hyper-Drive Bruiser",
    role: "antagonist",
    ageCategory: "young-adult",
    personality: ["Fierce", "Ruthless", "Hyper-Focused", "Explosive"],
    backstory: "An underground neon tournament champion grafted with sub-dermal voltage conductors. Every punch channels thousands of volts of localized plasma, making him an unstoppable human battery.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    colorPalette: ["#00E5FF", "#FF2A8D", "#10B981", "#0F172A"],
    referenceImages: ["/characters/ren-volt.jpg"],
    approvedPanelImages: ["/characters/ren-volt.jpg"],
    stats: {
      strength: 95,
      speed: 97,
      power: 96,
      defense: 88,
      aura: 93,
    },
    soundFx: "THUNDER-STRIKE!",
    quote: "I don't need a weapon. I am the high-voltage wire.",
    comicIssueTitle: "ISSUE #05: MAXIMUM OVERVOLTAGE",
    auraColor: "#00E5FF",
    memory: {
      faceShape: "Chiseled angular masculine jawline with fierce intense smirk",
      hairStyle: "Spiked anime undercut with electric-cyan glowing flame crest and black side curls",
      hairColor: "Jet black with neon electric blue spikes",
      eyeColor: "Luminescent predatory amber gold",
      eyeShape: "Sharp almond feline eyes with black eyeliner rim",
      skinTone: "Deep warm bronze",
      signatureFeatures: [
        "Glowing electric cyan circuit traces across hoodie shoulders",
        "Bio-luminescent hot-magenta mesh lattice glowing on chiseled abs",
        "Fingerless combat gauntlets with glowing teal cuff rings",
        "Silver ear hoop and industrial tribal wrist branding",
      ],
      bodyType: "Ultra-shredded, powerful muscular athletic build",
      heightCategory: "tall",
      defaultCostume: {
        upperBody: "Black cropped cyber-hoodie with neon-green circuit illumination and glowing pink abdomen mesh",
        lowerBody: "Tactical slate-grey cargo combat pants with chrome waist chain and glowing pocket beacons",
        footwear: "Reinforced magnetic steel-toed combat boots",
        accessories: ["Neon-ring fingerless gloves", "Chrome belt chain", "Silver ear ring"],
        colorPalette: ["#00E5FF", "#EC4899", "#10B981", "#1E293B"],
      },
      expressions: {
        neutral: "Predatory challenge with intense golden stare",
        intense: "Overcharged battle roar surrounded by blue lightning arcs",
      },
    },
    referenceSheet: {
      frontViewUrl: "/characters/ren-volt.jpg",
    },
  },
];

export const DEFAULT_CREATOR_SESSION: AuthSession = {
  isAuthenticated: true,
  user: {
    id: "creator_studio_pro",
    name: "Studio Creator",
    email: "creator@comiccraft.studio",
    avatarUrl: "/characters/aoi-spark.jpg",
    role: "creator",
    plan: "studio-pro",
    credits: 100000, // 100,000 starting credits (10 credits/page)
    tokenUsage: 0,
    totalComicsCreated: 1,
    verified: true,
    createdAt: new Date().toISOString(),
  },
};

export const DEMO_USER = DEFAULT_CREATOR_SESSION;

// Storage helper functions
export function getStoredProjects(): ComicProject[] {
  if (typeof window === "undefined") return [SEED_PROJECT];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify([SEED_PROJECT]));
      return [SEED_PROJECT];
    }
    return JSON.parse(raw);
  } catch {
    return [SEED_PROJECT];
  }
}

export function saveStoredProject(project: ComicProject): void {
  if (typeof window === "undefined") return;
  try {
    const projects = getStoredProjects();
    const idx = projects.findIndex((p) => p.id === project.id);
    if (idx >= 0) {
      projects[idx] = { ...project, updatedAt: new Date().toISOString(), version: (project.version || 1) + 1 };
    } else {
      projects.unshift(project);
    }
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  } catch (e) {
    console.error("Failed to save project to storage", e);
  }
}

export function getProjectById(id: string): ComicProject | undefined {
  const projects = getStoredProjects();
  return projects.find((p) => p.id === id);
}

export function deleteStoredProject(id: string): void {
  if (typeof window === "undefined") return;
  const projects = getStoredProjects().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
}

export function getStoredCharacters(): ComicCharacter[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHARACTERS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (c) =>
        c.id !== "char_kaelen_warlord" &&
        c.id !== "char_aoi_hoshino" &&
        c.id !== "char_thalassor" &&
        c.id !== "char_elena_diaz" &&
        c.id !== "char_ren_kurogane" &&
        c.id !== "char_ren_volt"
    );
  } catch {
    return [];
  }
}

export function saveStoredCharacter(character: ComicCharacter): void {
  if (typeof window === "undefined") return;
  try {
    const chars = getStoredCharacters();
    const idx = chars.findIndex((c) => c.id === character.id);
    if (idx >= 0) {
      chars[idx] = { ...character, updatedAt: new Date().toISOString() };
    } else {
      chars.unshift(character);
    }
    localStorage.setItem(STORAGE_KEYS.CHARACTERS, JSON.stringify(chars));
  } catch (e) {
    console.error("Failed to save character to storage", e);
  }
}

export function getStoredModels(): ModelProviderConfig[] {
  if (typeof window === "undefined") return DEFAULT_MODELS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MODELS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.MODELS, JSON.stringify(DEFAULT_MODELS));
      return DEFAULT_MODELS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_MODELS;
  }
}

export function saveStoredModels(models: ModelProviderConfig[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.MODELS, JSON.stringify(models));
}

export function getStoredSession(): AuthSession {
  if (typeof window === "undefined") return DEFAULT_CREATOR_SESSION;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(DEFAULT_CREATOR_SESSION));
      return DEFAULT_CREATOR_SESSION;
    }
    const session: AuthSession = JSON.parse(raw);
    if (session.user) {
      // Ensure 100,000 credits default if missing or legacy
      if (typeof session.user.credits !== "number" || isNaN(session.user.credits)) {
        session.user.credits = 100000;
      }
      session.user.verified = true;
      if (session.user.email?.includes("panelcraft") || session.user.email?.includes("alex")) {
        session.user.name = "Studio Creator";
        session.user.email = "creator@comiccraft.studio";
      }
    }
    return session;
  } catch {
    return DEFAULT_CREATOR_SESSION;
  }
}

export function saveStoredSession(session: AuthSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
}

export function deductUserCredits(pageCount: number): boolean {
  if (typeof window === "undefined") return true;
  try {
    const session = getStoredSession();
    if (!session.user) return false;
    const cost = pageCount * 10;
    if ((session.user.credits ?? 0) < cost) return false;
    session.user.credits -= cost;
    saveStoredSession(session);
    return true;
  } catch {
    return false;
  }
}

export function addUserCredits(amount: number): number {
  if (typeof window === "undefined") return 100000;
  try {
    const session = getStoredSession();
    if (!session.user) return 100000;
    session.user.credits = (session.user.credits || 0) + amount;
    saveStoredSession(session);
    return session.user.credits;
  } catch {
    return 100000;
  }
}

