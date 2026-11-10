import { processSvg, renderAsset, type ProcessedSvg } from "./svg";
import { DEFAULT_THIN_PX, lightIcon, markupInner, type InnerMode, type Theme } from "./theme";
import type { AssetDef, CanvasOptions, Props } from "./types";

export type RenderOptions = {
  theme: Theme;
  palette?: Record<string, string>;
  canvas?: CanvasOptions;
  /** The inner lines to draw. Unset: what the icon's own markup asks for at these props
   *  (data-inner, so the gear is thin in a colour and outline-only when grey). */
  inner?: InnerMode;
  thinPx?: number;
  /** Outline a grey icon too (the review's OUTLINE choice). */
  edge?: boolean;
};

/** The props an asset renders with in a theme ("props" assets get `theme`). */
export function themedProps(def: AssetDef, values: Props, theme: Theme): Props {
  return def.light === "props" ? { ...values, theme } : values;
}

/** The exact file for an asset in a theme: what the preview shows and the export writes. */
export function renderForTheme(def: AssetDef, values: Props, opts: RenderOptions): ProcessedSvg {
  let base: ProcessedSvg;
  try {
    base = processSvg(renderAsset(def, themedProps(def, values, opts.theme)), { palette: opts.palette, canvas: opts.canvas });
  } catch (error) {
    return { markup: "", width: 0, height: 0, colors: [], error: (error as Error).message };
  }
  if (opts.theme !== "light" || def.light !== "icon" || base.error) return base;
  const light = lightIcon(base.markup, {
    color: typeof values.color === "string" ? values.color : undefined,
    edge: def.edge || opts.edge,
    inner: opts.inner ?? markupInner(base.markup),
    thinPx: opts.thinPx ?? DEFAULT_THIN_PX,
  });
  return { ...base, ...light };
}
