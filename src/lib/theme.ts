import { createContext, useContext } from "react";

// ── The app's light theme, for previewing assets the way the app shows them ──────────
// Values are the Mist light palette in huawei-2026/src/styles/tokens.css. The dark theme
// is the artwork's own colours.

export type Theme = "dark" | "light";

export const ThemeContext = createContext<Theme>("dark");
export const useTheme = () => useContext(ThemeContext);

/** Light-theme surfaces and text (tokens.css, Mist). */
export const LIGHT = {
  page: "#e8edf4", // --background
  card: "#f5f8fb",
  secondary: "#dbe3ee",
  border: "#a3b3c9",
  borderStrong: "#74869f",
  outline: "#0f1a33", // dark outlines and pixel shadows
  onFill: "#0a0e1a", // navy text on a neon fill
  fg: "#0f1a33",
  strong: "#050b1c",
  soft: "#3b4d6b",
  muted: "#506485",
  shadow: "#0f1a3338",
} as const;

/** Each neon: its light-theme text ink and its line tier (borders), as in tokens.css. */
const NEON: Record<string, { ink: string; line: string }> = {
  "#00ff88": { ink: "#007a4d", line: "#269555" },
  "#ffe66d": { ink: "#8a6200", line: "#aa7b23" },
  "#4ecdc4": { ink: "#0b7770", line: "#27928c" },
  "#ff2d55": { ink: "#d0103a", line: "#f53756" },
  "#ff6b35": { ink: "#b93d0b", line: "#e05724" },
  "#c77dff": { ink: "#7c3aed", line: "#b555f4" },
  "#00d4ff": { ink: "#0072a3", line: "#278ea9" },
  "#ff71c5": { ink: "#c0267e", line: "#ec2fac" },
};
/** Dark-theme neutrals and their light-theme tokens. */
const NEUTRAL: Record<string, string> = {
  "#0a0e1a": LIGHT.page, "#111827": LIGHT.card, "#1a2340": LIGHT.secondary, "#2a3a5c": LIGHT.border, "#3a4a6c": LIGHT.borderStrong,
  "#e8f4f8": LIGHT.fg, "#ffffff": LIGHT.strong, "#9bb0c8": LIGHT.soft, "#6b8ba4": LIGHT.muted, "#7f93a8": LIGHT.muted,
};

const key = (c: string) => c.trim().toLowerCase();
export const isNeon = (c: string | undefined) => !!c && key(c) in NEON;

/** A colour used for text: neon becomes its darker ink in light, neutrals their light token. */
export function textColor(theme: Theme, c: string) {
  if (theme === "dark") return c;
  return NEON[key(c)]?.ink ?? NEUTRAL[key(c)] ?? c;
}
/** A colour used for a border or line: neon becomes its line tier in light. */
export function lineColor(theme: Theme, c: string) {
  if (theme === "dark") return c;
  return NEON[key(c)]?.line ?? NEUTRAL[key(c)] ?? c;
}
/** A surface colour (background, card): the neutrals swap; neon fills stay neon. */
export function surfaceColor(theme: Theme, c: string) {
  if (theme === "dark") return c;
  return NEUTRAL[key(c)] ?? c;
}

// ── Icons in light: neon with a dark outline ────────────────────────────────────
// The app draws hue icons in the neon with a 1px dark outline (a CSS drop-shadow). The
// holes inside an icon are <path class="px-hole">, and a few dark details are
// <path class="px-ink"> (see the vendored icons). Here the outline is drawn as shapes,
// so it scales with zoom and stays in an exported file:
//   outer  – holes are paper, the outline runs only around the outside (the app today)
//   thin   – like outer, plus a thinner dark line inside each hole
//   full   – holes stay see-through and the outline traces them too (the app before)

export type InnerMode = "outer" | "thin" | "full";
export const INNER_MODES: Array<{ id: InnerMode; label: string; hint: string }> = [
  { id: "outer", label: "OUTER ONLY", hint: "Holes are paper. The outline runs only around the outside. This is what the app and site do now." },
  { id: "thin", label: "THIN INNER", hint: "Like outer only, plus a thinner dark line inside each hole." },
  { id: "full", label: "FULL", hint: "Holes stay see-through and get the full outline too (the look before the fix)." },
];
export const DEFAULT_INNER: InnerMode = "outer";
export const DEFAULT_THIN_PX = 0.5;

const SVG_NS = "http://www.w3.org/2000/svg";
type Box = [number, number, number, number];

/** Boxes from a path made only of "M x y h w v h h -w z" runs (what icon-holes.mjs writes). */
function boxesFromPath(d: string | null): Box[] {
  const boxes: Box[] = [];
  for (const m of (d ?? "").matchAll(/M\s*(-?[\d.]+)[\s,]+(-?[\d.]+)\s*h\s*(-?[\d.]+)\s*v\s*(-?[\d.]+)/g)) {
    boxes.push([Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4])]);
  }
  return boxes;
}

const num = (el: Element, name: string) => {
  const v = el.getAttribute(name);
  if (v === null) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
};

function boxLayer(doc: Document, boxes: Box[], grow: number, fill: string, cls: string) {
  const g = doc.createElementNS(SVG_NS, "g");
  g.setAttribute("class", cls);
  g.setAttribute("fill", fill);
  for (const [x, y, w, h] of boxes) {
    const r = doc.createElementNS(SVG_NS, "rect");
    r.setAttribute("x", String(round(x - grow)));
    r.setAttribute("y", String(round(y - grow)));
    r.setAttribute("width", String(round(w + grow * 2)));
    r.setAttribute("height", String(round(h + grow * 2)));
    g.appendChild(r);
  }
  return g;
}
const round = (n: number) => Math.round(n * 10000) / 10000;

export type IconInfo = { holes: number; outlined: boolean };

/** Hole cells and whether the icon gets the outline, for the review board. */
export function iconInfo(markup: string, color: string | undefined, edge: boolean): IconInfo {
  const holes = boxesFromPath(markup.match(/class="px-hole"[^>]*\sd="([^"]*)"/)?.[1] ?? markup.match(/\sd="([^"]*)"[^>]*class="px-hole"/)?.[1] ?? null)
    .reduce((n, [, , w, h]) => n + w * h, 0);
  return { holes, outlined: edge || isNeon(color) };
}

/**
 * Turns an exported icon SVG into how the app's light theme draws it. The canvas grows by
 * 1px on every side so the outline isn't cut off.
 */
export function lightIcon(markup: string, opts: { color?: string; edge?: boolean; inner: InnerMode; thinPx: number }): { markup: string; width: number; height: number } {
  const doc = new DOMParser().parseFromString(markup, "image/svg+xml");
  const root = doc.documentElement;
  const vb = (root.getAttribute("viewBox") ?? "").trim().split(/[\s,]+/).map(Number);
  const width = Number(root.getAttribute("width"));
  const height = Number(root.getAttribute("height"));
  if (vb.length !== 4 || vb.some((v) => !Number.isFinite(v)) || !width || !height) return { markup, width, height };
  const upp = vb[2] / width; // viewBox units per screen pixel

  // An icon drawn in a neutral (grey, white) uses the light token; the inside of the
  // browser window is the card colour.
  const neutral = opts.color && !isNeon(opts.color) ? key(opts.color) : null;
  for (const el of Array.from(root.querySelectorAll("[fill]"))) {
    const f = key(el.getAttribute("fill") ?? "");
    if (neutral && f === neutral) el.setAttribute("fill", NEUTRAL[f] ?? f);
    else if (f === "#111827") el.setAttribute("fill", LIGHT.card);
  }

  const outlined = !!opts.edge || isNeon(opts.color);
  if (!outlined) return { markup: new XMLSerializer().serializeToString(root), width, height };

  const hole = root.querySelector("path.px-hole");
  const ink = root.querySelector("path.px-ink");
  ink?.setAttribute("fill", LIGHT.outline);
  const holeBoxes = hole && opts.inner !== "full" ? boxesFromPath(hole.getAttribute("d")) : [];
  if (hole && opts.inner !== "full") hole.setAttribute("fill", LIGHT.card);

  // Everything else that draws. Plain rects can be outlined as shapes; anything else
  // (a rotated group, a path) falls back to an SVG filter.
  const drawn = Array.from(root.querySelectorAll("rect, path, circle, ellipse, polygon, polyline, line, image, text, use"))
    .filter((el) => !el.classList.contains("px-hole") && !el.classList.contains("px-ink") && key(el.getAttribute("fill") ?? "") !== "none");
  const plain = drawn.every((el) => el.tagName === "rect" && el.parentElement === root && !el.getAttribute("transform")
    && ["x", "y", "width", "height"].every((a) => Number.isFinite(num(el, a))));
  const r = upp;
  const firstArt = Array.from(root.children).find((c) => c.tagName !== "title" && c.tagName !== "defs" && c.tagName !== "style") ?? null;

  if (plain) {
    const fg = drawn.map((el) => [num(el, "x"), num(el, "y"), num(el, "width"), num(el, "height")] as Box);
    // 1. The outline: every shape grown by 1px (a square dilation, same as the drop-shadows).
    root.insertBefore(boxLayer(doc, [...fg, ...holeBoxes], r, LIGHT.outline, "px-light-outline"), firstArt);
    // 2. Thin inner line: the shapes grown by less, showing only inside the paper holes.
    if (opts.inner === "thin" && holeBoxes.length) {
      const t = Math.min(Math.max(opts.thinPx, 0.1), 1) * upp;
      const thin = boxLayer(doc, fg, t, LIGHT.outline, "px-light-inner");
      const after = ink ?? (hole ? hole.nextSibling : firstArt);
      root.insertBefore(thin, after);
    }
  } else {
    const id = `px-outline-${Math.random().toString(36).slice(2, 8)}`;
    const defs = doc.createElementNS(SVG_NS, "defs");
    defs.innerHTML = `<filter id="${id}" x="-20%" y="-20%" width="140%" height="140%"><feMorphology in="SourceAlpha" operator="dilate" radius="${round(r)}" result="d"/><feFlood flood-color="${LIGHT.outline}"/><feComposite in2="d" operator="in" result="o"/><feMerge><feMergeNode in="o"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
    const g = doc.createElementNS(SVG_NS, "g");
    g.setAttribute("filter", `url(#${id})`);
    for (const child of Array.from(root.childNodes)) {
      if (child instanceof Element && ["title", "defs", "style"].includes(child.tagName)) continue;
      g.appendChild(child);
    }
    root.appendChild(defs);
    root.appendChild(g);
  }

  // Room for the outline: 1px on every side.
  root.setAttribute("viewBox", [vb[0] - r, vb[1] - r, vb[2] + 2 * r, vb[3] + 2 * r].map(round).join(" "));
  root.setAttribute("width", String(width + 2));
  root.setAttribute("height", String(height + 2));
  root.setAttribute("overflow", "visible");
  // Without this, the hairline seams between neighbouring pixels let the dark outline layer
  // underneath show through at zooms that aren't whole pixels.
  root.setAttribute("shape-rendering", "crispEdges");
  return { markup: new XMLSerializer().serializeToString(root), width: width + 2, height: height + 2 };
}
