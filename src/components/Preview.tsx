import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { Slider } from "./kit";
import type { ProcessedSvg } from "../lib/svg";

type Backdrop = "dark" | "checker" | "light";
const BACKDROPS: Array<{ id: Backdrop; label: string }> = [
  { id: "dark", label: "DARK" },
  { id: "checker", label: "CLEAR" },
  { id: "light", label: "LIGHT" },
];

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 64;
const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

/**
 * Shows the exact markup that will be exported. Zoom only scales the view: the
 * SVG's own width/height (the export size) are untouched.
 */
export function Preview({ svg, accent, name }: { svg: ProcessedSvg; accent: string; name: string }) {
  const viewport = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number | null>(null);
  const [backdrop, setBackdrop] = useState<Backdrop>("dark");

  const fitZoom = () => {
    const el = viewport.current;
    if (!el || !svg.width || !svg.height) return 1;
    const z = Math.min((el.clientWidth * 0.72) / svg.width, (el.clientHeight * 0.72) / svg.height);
    // Whole-number zooms keep pixel art on the pixel grid once it is scaled up.
    return clampZoom(z >= 1 ? Math.floor(z) : Math.floor(z * 20) / 20 || MIN_ZOOM);
  };

  // Fit once when the asset first appears; the parent remounts us per asset. After
  // that, size changes visibly grow/shrink the art instead of refitting.
  useLayoutEffect(() => {
    if (zoom === null && svg.width) setZoom(fitZoom());
  });

  // Ctrl/⌘ + wheel zooms around the current view.
  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      setZoom((z) => clampZoom((z ?? 1) * (e.deltaY < 0 ? 1.15 : 1 / 1.15)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const z = zoom ?? 1;
  const log = Math.log2(z);
  const step = (dir: 1 | -1) => setZoom(clampZoom(2 ** (Math.round(log * 2) / 2 + dir * 0.5)));

  return (
    <div className="preview">
      <div className="preview-toolbar">
        <span className="toolbar-label">PREVIEW</span>
        <div className="zoom">
          <button type="button" className="icon-btn" aria-label="Zoom out" onClick={() => step(-1)}>−</button>
          <Slider label="Zoom" value={log} min={Math.log2(MIN_ZOOM)} max={Math.log2(MAX_ZOOM)} step={0.01} onChange={(v) => setZoom(clampZoom(2 ** v))} accent={accent} />
          <button type="button" className="icon-btn" aria-label="Zoom in" onClick={() => step(1)}>+</button>
          <span className="zoom-value">{Math.round(z * 100)}%</span>
          <button type="button" className="mini-btn" onClick={() => setZoom(fitZoom())}>FIT</button>
          <button type="button" className="mini-btn" onClick={() => setZoom(1)}>1:1</button>
        </div>
        <div className="segmented" role="group" aria-label="Preview background">
          {BACKDROPS.map((b) => (
            <button key={b.id} type="button" aria-pressed={backdrop === b.id} onClick={() => setBackdrop(b.id)} style={backdrop === b.id ? { background: accent, color: "#0a0e1a" } : undefined}>
              {b.label}
            </button>
          ))}
        </div>
      </div>

      <div ref={viewport} className={`preview-viewport backdrop-${backdrop}`}>
        {svg.error ? (
          <div className="preview-error">Could not render {name}: {svg.error}</div>
        ) : (
          <div
            className="preview-art"
            style={{ "--w": `${svg.width * z}px`, "--h": `${svg.height * z}px`, visibility: zoom === null ? "hidden" : "visible" } as CSSProperties}
            dangerouslySetInnerHTML={{ __html: svg.markup }}
          />
        )}
      </div>

      <div className="preview-footer">
        <span>OUTPUT <b style={{ color: accent }}>{fmt(svg.width)} × {fmt(svg.height)} px</b></span>
        <span>VIEW {Math.round(z * 100)}% · zoom never changes the export</span>
        <span>{svg.colors.length} COLOURS</span>
      </div>
    </div>
  );
}

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0+$/, "").replace(/\.$/, ""));
