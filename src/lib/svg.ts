import { renderToStaticMarkup } from "react-dom/server";
import type { AssetDef, CanvasOptions, Props } from "./types";

const SVG_NS = "http://www.w3.org/2000/svg";
const COLOR_ATTRS = ["fill", "stroke", "stop-color", "flood-color", "lighting-color", "color"] as const;

export type ProcessedSvg = {
  markup: string;
  width: number;
  height: number;
  /** Unique colours in the artwork before palette overrides, most used first. */
  colors: string[];
  error?: string;
};

// ── Colour helpers ─────────────────────────────────────────────────────────

let colorCtx: CanvasRenderingContext2D | null = null;

/** Normalises any CSS colour to lowercase #rrggbb. Returns null for none/url()/currentColor. */
export function normalizeColor(value: string | null | undefined): string | null {
  if (!value) return null;
  const v = value.trim().toLowerCase();
  if (!v || v === "none" || v === "transparent" || v === "currentcolor" || v.startsWith("url(") || v === "inherit") return null;
  if (/^#[0-9a-f]{6}$/.test(v)) return v;
  if (/^#[0-9a-f]{3}$/.test(v)) return `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`;
  if (/^#[0-9a-f]{8}$/.test(v)) return v.slice(0, 7);
  colorCtx ??= document.createElement("canvas").getContext("2d");
  if (!colorCtx) return null;
  colorCtx.fillStyle = "#000000";
  colorCtx.fillStyle = v;
  const out = String(colorCtx.fillStyle);
  return /^#[0-9a-f]{6}$/.test(out) ? out : null;
}

// ── Rendering ──────────────────────────────────────────────────────────────

export function renderAsset(def: AssetDef, props: Props): string {
  return renderToStaticMarkup(def.render(props));
}

function parse(markup: string): SVGSVGElement {
  // React omits the namespace for inline SVG; a standalone file needs it.
  const withNs = /^<svg[^>]*\sxmlns=/.test(markup) ? markup : markup.replace(/^<svg/, `<svg xmlns="${SVG_NS}"`);
  const doc = new DOMParser().parseFromString(withNs, "image/svg+xml");
  const root = doc.documentElement;
  if (root.nodeName !== "svg") {
    throw new Error(doc.querySelector("parsererror")?.textContent?.split("\n")[0] ?? "Component did not render an <svg>.");
  }
  return root as unknown as SVGSVGElement;
}

function viewBoxOf(root: Element): [number, number, number, number] | null {
  const raw = root.getAttribute("viewBox");
  if (!raw) return null;
  const parts = raw.trim().split(/[\s,]+/).map(Number);
  return parts.length === 4 && parts.every(Number.isFinite) ? (parts as [number, number, number, number]) : null;
}

function length(value: string | null): number | null {
  if (!value || value.endsWith("%")) return null;
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : null;
}

/** Bounding box of the drawn content, measured in a hidden live copy of the SVG. */
function measureContent(root: SVGSVGElement): DOMRect | null {
  const host = document.createElement("div");
  host.style.cssText = "position:fixed;left:-10000px;top:0;visibility:hidden;pointer-events:none;";
  document.body.appendChild(host);
  try {
    const live = document.importNode(root, true) as SVGSVGElement;
    host.appendChild(live);
    const box = live.getBBox();
    return box.width > 0 && box.height > 0 ? box : null;
  } catch {
    return null;
  } finally {
    host.remove();
  }
}

const round = (n: number) => Math.round(n * 1000) / 1000;

function walkColors(root: Element, visit: (color: string, apply: (next: string) => void) => void) {
  const nodes = [root, ...Array.from(root.querySelectorAll("*"))];
  for (const node of nodes) {
    for (const attr of COLOR_ATTRS) {
      const c = normalizeColor(node.getAttribute(attr));
      if (c) visit(c, (next) => node.setAttribute(attr, next));
    }
    const style = (node as SVGElement).style;
    if (style) {
      for (const prop of COLOR_ATTRS) {
        const c = normalizeColor(style.getPropertyValue(prop));
        if (c) visit(c, (next) => style.setProperty(prop, next));
      }
    }
  }
}

type Box = [x: number, y: number, w: number, h: number];

function intersect(a: Box, b: Box): Box | null {
  const x0 = Math.max(a[0], b[0]);
  const y0 = Math.max(a[1], b[1]);
  const x1 = Math.min(a[0] + a[2], b[0] + b[2]);
  const y1 = Math.min(a[1] + a[3], b[1] + b[3]);
  return x1 > x0 && y1 > y0 ? [x0, y0, x1 - x0, y1 - y0] : null;
}

function union(a: Box, b: Box): Box {
  const x0 = Math.min(a[0], b[0]);
  const y0 = Math.min(a[1], b[1]);
  return [x0, y0, Math.max(a[0] + a[2], b[0] + b[2]) - x0, Math.max(a[1] + a[3], b[1] + b[3]) - y0];
}

/**
 * Turns raw component markup into the exact file that will be exported:
 * namespace added, canvas set (trimmed to the artwork, the component's own
 * canvas, or a custom size), palette overrides applied. The preview shows this
 * same markup.
 */
export function processSvg(markup: string, opts: { palette?: Record<string, string>; canvas?: CanvasOptions; title?: string } = {}): ProcessedSvg {
  let root: SVGSVGElement;
  try {
    root = parse(markup);
  } catch (error) {
    return { markup: "", width: 0, height: 0, colors: [], error: (error as Error).message };
  }

  let vb = viewBoxOf(root);
  let width = length(root.getAttribute("width"));
  let height = length(root.getAttribute("height"));
  if (!vb) {
    vb = [0, 0, width ?? 100, height ?? 100];
    root.setAttribute("viewBox", vb.join(" "));
  }
  width ??= vb[2];
  height ??= vb[3];
  const scaleX = width / vb[2];
  const scaleY = height / vb[3];

  const canvas = opts.canvas ?? { mode: "original" };
  // Art drawn outside the viewBox shows in-app (overflow: visible) but would be cut
  // from a file, so the canvas always grows to include it.
  const overflowVisible = /overflow\s*:\s*visible/.test(root.getAttribute("style") ?? "") || root.getAttribute("overflow") === "visible";
  let art: Box | null = null;
  if (canvas.mode !== "original" || overflowVisible) {
    const box = measureContent(root);
    if (box) {
      art = [box.x, box.y, box.width, box.height];
      // getBBox ignores clipping: drop anything the component's own canvas hides.
      if (!overflowVisible) art = intersect(art, vb);
    }
  }

  let next: Box = vb;
  if (canvas.mode === "trim" && art) {
    next = art;
  } else if (canvas.mode === "custom") {
    const base = art ?? vb;
    const [ax, ay] = canvas.anchor ?? [0.5, 0.5];
    const vw = (canvas.width ?? width) / scaleX;
    const vh = (canvas.height ?? height) / scaleY;
    next = [base[0] - (vw - base[2]) * ax, base[1] - (vh - base[3]) * ay, vw, vh];
  } else if (art && overflowVisible) {
    next = union(vb, art);
  }
  if (next.some((v, i) => Math.abs(v - vb![i]) > 1e-6)) {
    vb = next.map(round) as Box;
    width = round(vb[2] * scaleX);
    height = round(vb[3] * scaleY);
    root.setAttribute("viewBox", vb.join(" "));
  }
  root.setAttribute("width", String(round(width)));
  root.setAttribute("height", String(round(height)));

  if (opts.title) {
    let title = root.querySelector(":scope > title");
    if (!title) {
      title = root.ownerDocument.createElementNS(SVG_NS, "title");
      root.insertBefore(title, root.firstChild);
    }
    title.textContent = opts.title;
  }

  const counts = new Map<string, number>();
  walkColors(root, (c) => counts.set(c, (counts.get(c) ?? 0) + 1));
  const colors = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c);

  const palette = opts.palette ?? {};
  if (Object.keys(palette).length) {
    walkColors(root, (c, apply) => {
      const next = palette[c];
      if (next && next !== c) apply(next);
    });
  }

  return { markup: new XMLSerializer().serializeToString(root), width: round(width), height: round(height), colors };
}

// ── Export ─────────────────────────────────────────────────────────────────

export function svgFile(markup: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>\n${markup}\n`;
}

export function downloadSvg(markup: string, filename: string) {
  const name = filename.toLowerCase().endsWith(".svg") ? filename : `${filename}.svg`;
  const url = URL.createObjectURL(new Blob([svgFile(markup)], { type: "image/svg+xml" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function slug(...parts: Array<string | number | undefined | null | false>): string {
  return parts
    .filter((p) => p !== undefined && p !== null && p !== false && p !== "")
    .map((p) => String(p).toLowerCase().replace(/#/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""))
    .filter(Boolean)
    .join("-");
}
