import { ICON_ASSETS } from "../assets/icons";
import { ALL_ASSETS, TABS } from "../registry";
import { renderAsset } from "./svg";
import { DEFAULT_INNER, INNER_MODES, iconInfo, type InnerMode } from "./theme";
import type { AssetDef } from "./types";

export type ReviewEntry = { inner?: InnerMode; note?: string };

/** Hole cells and outline for an icon at its defaults (what the review lists). */
export function iconFacts(def: AssetDef) {
  return iconInfo(renderAsset(def, def.defaults), def.defaults.color, !!def.edge);
}

const innerLabel = (m: InnerMode | undefined) => INNER_MODES.find((x) => x.id === (m ?? DEFAULT_INNER))!.label.toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
const cell = (s: string) => s.replace(/\|/g, "\\|").replace(/\s*\n\s*/g, " / ").trim();

function tabOf(def: AssetDef) {
  for (const t of TABS) {
    if (t.assets?.includes(def)) return t.label;
    const sub = t.subTabs?.find((s) => s.assets.includes(def));
    if (sub) return `${t.label} › ${sub.label}`;
  }
  return "";
}

/** The review as Markdown, to paste into a chat or a doc. */
export function reviewMarkdown(review: Record<string, ReviewEntry>, thinPx: number): string {
  const out = [
    "# Drill Mode · light theme review",
    "",
    `Exported ${new Date().toISOString().slice(0, 10)} from the SVG Asset Studio. Thin inner line: ${thinPx}px (the outer outline is 1px).`,
    "",
    "## Icons",
    "",
    "| Icon | Holes | Inner lines | Note |",
    "|---|---|---|---|",
  ];
  for (const def of ICON_ASSETS) {
    const r = review[def.id] ?? {};
    const facts = iconFacts(def);
    const inner = facts.holes ? `${innerLabel(r.inner)}${r.inner && r.inner !== DEFAULT_INNER ? "" : " (default)"}` : "n/a (no holes)";
    out.push(`| ${def.name} | ${facts.holes || "–"} | ${inner} | ${cell(r.note ?? "")} |`);
  }
  const others = ALL_ASSETS.filter((a) => a.light !== "icon" && review[a.id]?.note?.trim());
  out.push("", "## Other assets", "");
  if (!others.length) out.push("No notes yet.");
  else {
    out.push("| Tab | Asset | Note |", "|---|---|---|");
    for (const a of others) out.push(`| ${tabOf(a)} | ${a.name} | ${cell(review[a.id]!.note!)} |`);
  }
  return out.join("\n") + "\n";
}

export function downloadText(text: string, filename: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/markdown" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
