import { ICON_ASSETS } from "../assets/icons";
import { ALL_ASSETS, TABS } from "../registry";
import { renderAsset } from "./svg";
import { INNER_MODES, iconInfo, markupInner, type InnerMode } from "./theme";
import type { AssetDef } from "./types";

/** inner: the inner lines picked; edge: outline a grey icon. Unset = the icon's default. */
export type ReviewEntry = { inner?: InnerMode; edge?: boolean; note?: string };

/** Hole cells and outline for an icon at its defaults (what the review lists). */
export function iconFacts(def: AssetDef) {
  return iconInfo(renderAsset(def, def.defaults), def.defaults.color, !!def.edge || !!def.greyEdge);
}

const defaultsCache = new Map<string, { inner: InnerMode; edge: boolean }>();
/** What the app and site draw today: the inner lines in the icon's markup (data-inner), and
 *  whether a grey icon is outlined anyway (greyEdge). The review only stores changes from these. */
export function iconDefaults(def: AssetDef): { inner: InnerMode; edge: boolean } {
  let d = defaultsCache.get(def.id);
  if (!d) {
    d = { inner: def.light === "icon" ? iconFacts(def).inner : "outer", edge: !!def.greyEdge };
    defaultsCache.set(def.id, d);
  }
  return d;
}

const innerLabel = (m: InnerMode) => INNER_MODES.find((x) => x.id === m)!.label.toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
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
    "(default) is what the app and site draw now. Neon icons always get the outline; grey ones only when it is on.",
    "",
    "## Icons",
    "",
    "| Icon | Holes | Inner lines | Outline | Note |",
    "|---|---|---|---|---|",
  ];
  for (const def of ICON_ASSETS) {
    const r = review[def.id] ?? {};
    const facts = iconFacts(def);
    const base = iconDefaults(def);
    const edge = r.edge ?? base.edge;
    const outlined = !facts.neutral || !!def.edge || edge;
    const pick = r.inner ?? base.inner;
    // A grey icon whose markup picks other inner lines in a colour (the gear: thin when yellow).
    const coloured = facts.neutral && !r.inner ? markupInner(renderAsset(def, { ...def.defaults, color: "#ffe66d" })) : pick;
    const inColour = coloured !== pick ? `; ${innerLabel(coloured).toLowerCase()} in a colour` : "";
    const inner = !facts.holes ? "n/a (no holes)"
      : !outlined ? `n/a (no outline)${inColour}`
      : `${innerLabel(pick)}${pick === base.inner ? " (default)" : ""}${inColour}`;
    const outline = !facts.neutral ? "neon" : def.edge ? "always" : `${edge ? "on" : "off"} (grey)${edge === base.edge ? " (default)" : ""}`;
    out.push(`| ${def.name} | ${facts.holes || "–"} | ${inner} | ${outline} | ${cell(r.note ?? "")} |`);
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
