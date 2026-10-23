import { PixelMascot } from "../vendor/avatars/PixelMascot";
import { PixelAvatar } from "../vendor/avatars/PixelAvatar";
import { PixiLegacy } from "../vendor/avatars/PixiLegacy";
import { CharDad } from "../vendor/avatars/characters/CharDad";
import { CharGrandma } from "../vendor/avatars/characters/CharGrandma";
import { CharKid } from "../vendor/avatars/characters/CharKid";
import { CharMum } from "../vendor/avatars/characters/CharMum";
import { MascotHead } from "./MascotHead";
import { asset, type AssetDef, type ChoiceOption } from "../lib/types";
import { slug } from "../lib/svg";

const chips = (values: string[]): ChoiceOption[] => values.map((v) => ({ value: v, label: v.toUpperCase() }));
const HATS = chips(["None", "Cap", "Helmet", "Crown"]);
const EYES = chips(["Default", "Shades", "Visor", "Goggles"]);
const OUTFITS = chips(["Standard", "Camo", "Neon", "Stealth", "Custom"]);
const HEAD = [{ value: "separated", label: "SEPARATED" }, { value: "attached", label: "ATTACHED" }];

// PixelAvatar's rank colours, without the repeats (ranks 7–9 reuse earlier ones).
const RANK_COLORS = ["#00ff88", "#ff6b35", "#4ecdc4", "#ffe66d", "#ff2d55", "#c77dff", "#6b8ba4"].map((color) => ({ color }));

const FRAMES: ChoiceOption[] = [0, 1, 2, 3].map((f) => ({ value: f, label: `FRAME ${f + 1}` }));
const frameControl = { kind: "choice", key: "frame", label: "IDLE FRAME", options: FRAMES, style: "chips", columns: 4 } as const;
const npcNote = "The idle animation shifts the character between frames.";

const NPCS = [
  { id: "grandma", name: "Grandma", Component: CharGrandma, size: 48 },
  { id: "mum", name: "Mum", Component: CharMum, size: 48 },
  { id: "dad", name: "Dad", Component: CharDad, size: 52 },
  { id: "kid", name: "Kid", Component: CharKid, size: 40 },
];

export const CHARACTER_ASSETS: AssetDef[] = [
  asset({
    id: "char-pixel-mascot",
    name: "Pixi",
    group: "PIXI",
    defaults: {
      size: 64, color: "#4ecdc4", head: "separated", hat: "None", eyes: "Default", outfit: "Standard",
      bodyColor: "#00ff88", accentColor: "#00ff88",
    },
    controls: [
      { kind: "size", key: "size", label: "WIDTH", min: 16, max: 1024 },
      { kind: "color", key: "color", label: "COLOUR" },
      { kind: "choice", key: "head", label: "HEAD", options: HEAD, style: "chips", columns: 2 },
      { kind: "choice", key: "hat", label: "HAT", options: HATS, style: "chips", columns: 4 },
      { kind: "choice", key: "eyes", label: "EYES", options: EYES, style: "chips", columns: 4 },
      { kind: "choice", key: "outfit", label: "OUTFIT", options: OUTFITS, style: "chips", columns: 3 },
      { kind: "color", key: "bodyColor", label: "OUTFIT BODY", visible: (p) => p.outfit === "Custom" },
      { kind: "color", key: "accentColor", label: "OUTFIT ACCENT", visible: (p) => p.outfit === "Custom" },
    ],
    render: (p) => (
      <PixelMascot
        size={p.size} color={p.color} hat={p.hat} eyes={p.eyes} outfit={p.outfit}
        separated={p.head === "separated"}
        outfitColors={p.outfit === "Custom" ? { body: p.bodyColor, accent: p.accentColor } : undefined}
      />
    ),
    filename: (p) => slug("pixi", p.head === "attached" && "attached", p.outfit !== "Standard" && p.outfit, p.hat !== "None" && p.hat, p.eyes !== "Default" && p.eyes, p.size),
    note: "Pixi is the app's PixelMascot. SEPARATED leaves a one-pixel gap between head and body.",
  }),
  asset({
    id: "char-mascot-head",
    name: "Pixi Head",
    group: "PIXI",
    defaults: { size: 64, color: "#4ecdc4", hat: "None", eyes: "Default" },
    controls: [
      { kind: "size", key: "size", label: "WIDTH", min: 16, max: 1024 },
      { kind: "color", key: "color", label: "COLOUR" },
      { kind: "choice", key: "hat", label: "HAT", options: HATS, style: "chips", columns: 4 },
      { kind: "choice", key: "eyes", label: "EYES", options: EYES, style: "chips", columns: 4 },
    ],
    render: (p) => <MascotHead size={p.size} color={p.color} hat={p.hat} eyes={p.eyes} />,
    filename: (p) => slug("pixi-head", p.hat !== "None" && p.hat, p.eyes !== "Default" && p.eyes, p.size),
    note: "Pixi's head alone, as used in the DRILL MODE logo.",
  }),
  asset({
    id: "char-pixi",
    name: "Fake Pixi",
    group: "OTHER",
    defaults: { size: 32 },
    controls: [{ kind: "size", key: "size", min: 16, max: 1024 }],
    render: (p) => <PixiLegacy size={p.size} />,
    filename: (p) => slug("fake-pixi", p.size),
    note: "The old PixiAvatar robot from 9-22/assets. Not the real Pixi: that is PixelMascot.",
  }),
  ...NPCS.map(({ id, name, Component, size }) =>
    asset({
      id: `char-${id}`,
      name,
      group: "FAMILY NPCS",
      defaults: { size, frame: 0 },
      controls: [{ kind: "size", key: "size", label: "WIDTH", min: 16, max: 1024 }, frameControl],
      render: (p) => <Component size={p.size} frame={p.frame} />,
      filename: (p) => slug("char", id, p.frame && `frame-${p.frame + 1}`, p.size),
      note: npcNote,
    }),
  ),
  asset({
    id: "char-pixel-avatar",
    name: "Leaderboard Avatar",
    group: "OTHER",
    defaults: { size: 40, color: "#00ff88" },
    controls: [
      { kind: "size", key: "size", min: 16, max: 1024 },
      { kind: "color", key: "color", label: "COLOUR", presets: RANK_COLORS },
    ],
    render: (p) => <PixelAvatar size={p.size} color={p.color} />,
    filename: (p) => slug("leaderboard-avatar", p.color, p.size),
    note: "The presets are the leaderboard's rank colours. Type any hex code for a custom colour.",
  }),
];
