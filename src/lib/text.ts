import { useEffect, useState } from "react";

export const MONO = "'Share Tech Mono', monospace";
export const PIXEL = "'Press Start 2P', monospace";
export const VT = "'VT323', monospace";

/**
 * Linked from inside exported SVGs that contain text, so browsers render the same
 * fonts. `&amp;` because the markup is parsed as XML.
 */
export const FONT_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&amp;family=VT323&amp;family=Share+Tech+Mono&amp;display=swap');";

let ctx: CanvasRenderingContext2D | null = null;

/** Rendered text width in px, used to size SVG buttons and tabs around their labels. */
export function textWidth(text: string, fontFamily: string, fontSize: number, letterSpacing = 0): number {
  ctx ??= document.createElement("canvas").getContext("2d");
  if (!ctx) return text.length * fontSize * 0.6;
  ctx.font = `${fontSize}px ${fontFamily}`;
  return ctx.measureText(text).width + Math.max(0, text.length - 1) * letterSpacing;
}

/** Re-renders once the web fonts have loaded, so text measurements are correct. */
export function useFontsReady(): number {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let alive = true;
    Promise.all([
      document.fonts.load(`16px ${MONO}`),
      document.fonts.load(`16px ${PIXEL}`),
      document.fonts.load(`16px ${VT}`),
    ])
      .catch(() => undefined)
      .then(() => document.fonts.ready)
      .then(() => alive && setVersion((v) => v + 1));
    return () => { alive = false; };
  }, []);
  return version;
}
