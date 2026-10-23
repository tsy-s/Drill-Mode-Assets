import type { ComponentType } from "react";
import * as Icons from "../vendor/icons";
import { asset, type AssetDef } from "../lib/types";
import { slug } from "../lib/svg";

type IconComponent = ComponentType<{ size?: number; color?: string }>;

// Defaults mirror each icon's own signature in huawei-2026/src/app/components/icons.
const SIMPLE_ICONS: Array<[name: string, Component: IconComponent, size: number, color: string]> = [
  ["Attachment", Icons.IconAttachment, 16, "#c77dff"],
  ["Badge", Icons.IconBadge, 24, "#4ecdc4"],
  ["Bell", Icons.IconBell, 20, "#ffe66d"],
  ["Browser Window", Icons.IconBrowserWindow, 20, "#4ecdc4"],
  ["Bulb", Icons.IconBulb, 16, "#ffe66d"],
  ["Chat", Icons.IconChat, 20, "#4ecdc4"],
  ["Chat Bubble", Icons.IconChatBubble, 20, "#4ecdc4"],
  ["Check", Icons.IconCheck, 16, "#00ff88"],
  ["Coin", Icons.IconCoin, 16, "#ffe66d"],
  ["Download", Icons.IconDownload, 16, "#00ff88"],
  ["Envelope", Icons.IconEnvelope, 20, "#4ecdc4"],
  ["Eye Inspect", Icons.IconEyeInspect, 16, "#4ecdc4"],
  ["Family", Icons.IconFamily, 20, "#00d4ff"],
  ["Flame", Icons.IconFlame, 24, "#ff6b35"],
  ["Gear", Icons.IconGear, 16, "#6b8ba4"],
  ["House", Icons.IconHouse, 20, "#00ff88"],
  ["Link", Icons.IconLink, 16, "#4ecdc4"],
  ["Lock", Icons.IconLock, 16, "#6b8ba4"],
  ["Person", Icons.IconPerson, 20, "#4ecdc4"],
  ["Phone", Icons.IconPhone, 20, "#4ecdc4"],
  ["Real Email", Icons.IconRealEmail, 20, "#ff6b35"],
  ["Report Flag", Icons.IconReportFlag, 16, "#ff6b35"],
  ["Sell", Icons.IconSell, 14, "#ff6b35"],
  ["Shield", Icons.IconShield, 24, "#00ff88"],
  ["Skull", Icons.IconSkull, 24, "#ff2d55"],
  ["Star", Icons.IconStar, 16, "#ffe66d"],
  ["Store", Icons.IconStore, 20, "#c77dff"],
  ["Telegram", Icons.IconTelegram, 20, "#00d4ff"],
  ["Trash Bin", Icons.IconTrashBin, 16, "#ff2d55"],
  ["Trophy", Icons.IconTrophy, 24, "#ffe66d"],
  ["Warning", Icons.IconWarning, 16, "#ff6b35"],
  ["X", Icons.IconX, 16, "#ff2d55"],
];

const sizeControl = { kind: "size", key: "size", min: 8, max: 512 } as const;

const simple: AssetDef[] = SIMPLE_ICONS.map(([name, Component, size, color]) =>
  asset({
    id: `icon-${slug(name)}`,
    name,
    defaults: { size, color },
    controls: [sizeControl, { kind: "color", key: "color", label: "COLOUR" }],
    render: (p) => <Component size={p.size} color={p.color} />,
    filename: (p) => slug("icon", name, p.size, p.color),
  }),
);

// IconMedal's rank colours (1st, 2nd, 3rd, unranked).
const MEDAL_COLORS = [
  { color: "#ffe66d", label: "GOLD" },
  { color: "#c0c0c0", label: "SILVER" },
  { color: "#cd7f32", label: "BRONZE" },
  { color: "#6b8ba4", label: "UNRANKED" },
];

const special: AssetDef[] = [
  asset({
    id: "icon-medal",
    name: "Medal",
    defaults: { size: 20, color: "#ffe66d" },
    controls: [sizeControl, { kind: "color", key: "color", label: "COLOUR", presets: MEDAL_COLORS }],
    render: (p) => <Icons.IconMedal size={p.size} color={p.color} />,
    filename: (p) => slug("icon-medal", MEDAL_COLORS.find((m) => m.color === p.color)?.label ?? p.color, p.size),
  }),
  asset({
    id: "icon-speaker",
    name: "Speaker",
    defaults: { size: 16, color: "#6b8ba4", muted: false },
    controls: [sizeControl, { kind: "color", key: "color", label: "COLOUR" }, { kind: "toggle", key: "muted", label: "MUTED" }],
    render: (p) => <Icons.IconSpeaker size={p.size} color={p.color} muted={p.muted} />,
    filename: (p) => slug("icon-speaker", p.muted ? "off" : "on", p.size, p.color),
  }),
  asset({
    id: "icon-tree",
    name: "Tree",
    defaults: { size: 20, color: "#00ff88", trunk: "#c77d4a" },
    controls: [sizeControl, { kind: "color", key: "color", label: "LEAVES" }, { kind: "color", key: "trunk", label: "TRUNK" }],
    render: (p) => <Icons.IconTree size={p.size} color={p.color} trunk={p.trunk} />,
    filename: (p) => slug("icon-tree", p.size, p.color),
  }),
];

export const ICON_ASSETS: AssetDef[] = [...simple, ...special].sort((a, b) => a.name.localeCompare(b.name));
