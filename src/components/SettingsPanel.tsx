import { useEffect, useState } from "react";
import { IconCheck, IconDownload } from "../vendor/icons";
import { PixelButton } from "../vendor/ui/PixelButton";
import { APP_COLORS, ColorInput, ControlView } from "./Controls";
import { Chip, Field, NumberInput, Section, Swatch } from "./kit";
import { downloadSvg, svgFile, type ProcessedSvg } from "../lib/svg";
import type { AssetDef, CanvasMode, CanvasOptions, Props } from "../lib/types";

export function SettingsPanel({ def, values, set, reset, accent, svg, palette, setPalette, canvas, setCanvas, filename }: {
  def: AssetDef;
  values: Props;
  set: (patch: Props) => void;
  reset: () => void;
  accent: string;
  svg: ProcessedSvg;
  palette: Record<string, string>;
  setPalette: (next: Record<string, string>) => void;
  canvas: CanvasOptions;
  setCanvas: (next: CanvasOptions) => void;
  filename: string;
}) {
  const Custom = def.Settings;
  const controls = def.controls.filter((c) => c.visible?.(values) ?? true);
  return (
    <aside className="settings" aria-label="Settings">
      <div className="settings-head">
        <div>
          <div className="settings-kicker" style={{ color: accent }}>SETTINGS</div>
          <h2 className="settings-title">{def.name.toUpperCase()}</h2>
        </div>
        <button type="button" className="mini-btn" onClick={reset} title="Reset this asset's settings, palette, canvas and file name">RESET</button>
      </div>
      {def.note && <p className="settings-note">{def.note}</p>}

      <div className="settings-body">
        {controls.length > 0 && (
          <Section title="PROPERTIES" accent={accent}>
            <div className="controls">
              {controls.map((c) => <ControlView key={c.key} control={c} values={values} defaults={def.defaults} set={set} accent={accent} />)}
            </div>
          </Section>
        )}

        {Custom && <Custom values={values} set={set} accent={accent} />}

        <PaletteSection colors={svg.colors} palette={palette} setPalette={setPalette} accent={accent} />

        <ExportSection svg={svg} filename={filename} canvas={canvas} setCanvas={setCanvas} defaultMode={def.canvas ?? "trim"} accent={accent} />
      </div>
    </aside>
  );
}

function PaletteSection({ colors, palette, setPalette, accent }: {
  colors: string[]; palette: Record<string, string>; setPalette: (p: Record<string, string>) => void; accent: string;
}) {
  const [active, setActive] = useState<string | null>(null);
  const selected = active && colors.includes(active) ? active : null;
  const changed = colors.filter((c) => palette[c] && palette[c] !== c).length;
  const recolor = (from: string, to: string) => setPalette({ ...palette, [from]: to });
  const restore = (from: string) => {
    const { [from]: _gone, ...rest } = palette;
    setPalette(rest);
  };

  return (
    <Section
      title="COLOUR PALETTE"
      accent={accent}
      note="Every colour in the artwork. Pick one to recolour it everywhere it is used."
      right={changed > 0 && <button type="button" className="mini-btn" onClick={() => setPalette({})}>RESET {changed}</button>}
    >
      {colors.length === 0 ? (
        <div className="section-note">No colours found.</div>
      ) : (
        <>
          <div className="palette">
            {colors.map((c) => {
              const now = palette[c] ?? c;
              const edited = now !== c;
              const on = selected === c;
              return (
                <button
                  key={c}
                  type="button"
                  className="palette-item"
                  aria-pressed={on}
                  title={edited ? `${c} → ${now}` : c}
                  onClick={() => setActive(on ? null : c)}
                >
                  <span className="palette-chip" style={{ background: now, boxShadow: on ? `0 0 0 3px ${accent}` : edited ? `0 0 0 2px ${accent}88` : undefined }}>
                    {edited && <span className="palette-was" style={{ background: c }} />}
                  </span>
                  <span className="palette-hex" style={on ? { color: "#ffffff" } : undefined}>{now.replace("#", "")}</span>
                </button>
              );
            })}
          </div>

          {selected && (
            <div className="palette-editor" style={{ borderColor: accent }}>
              <div className="field-head">
                <span className="field-label">
                  RECOLOUR <span className="palette-from" style={{ background: selected }} /> {selected}
                </span>
                {palette[selected] && palette[selected] !== selected && (
                  <button type="button" className="link-btn" onClick={() => restore(selected)}>ORIGINAL</button>
                )}
              </div>
              <ColorInput value={palette[selected] ?? selected} onChange={(hex) => recolor(selected, hex)} label={`Recolour ${selected}`} />
              <div className="preset-row">
                {APP_COLORS.map((c) => (
                  <Swatch key={c} color={c} label={c} selected={(palette[selected] ?? selected) === c} onClick={() => recolor(selected, c)} accent={accent} style={{ borderWidth: 3 }} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </Section>
  );
}

const CANVAS_MODES: Array<{ id: CanvasMode; label: string; hint: string }> = [
  { id: "trim", label: "TRIM", hint: "Cropped to the drawn artwork." },
  { id: "original", label: "ORIGINAL", hint: "The component's own canvas, including any built-in padding." },
  { id: "custom", label: "CUSTOM", hint: "Any size. The artwork keeps its size and sits at the chosen anchor." },
];
const ANCHORS: Array<[number, number]> = [0, 0.5, 1].flatMap((y) => [0, 0.5, 1].map((x) => [x, y] as [number, number]));

function ExportSection({ svg, filename, canvas, setCanvas, defaultMode, accent }: {
  svg: ProcessedSvg; filename: string; canvas: CanvasOptions; setCanvas: (c: CanvasOptions) => void; defaultMode: CanvasMode; accent: string;
}) {
  const [name, setName] = useState(filename);
  const [edited, setEdited] = useState(false);
  const [copied, setCopied] = useState(false);
  // Follows the auto name until the user types their own; the parent remounts per asset.
  useEffect(() => { if (!edited) setName(filename); }, [filename, edited]);

  const bytes = new Blob([svgFile(svg.markup)]).size;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(svgFile(svg.markup));
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  const pickMode = (mode: CanvasMode) => {
    if (mode !== "custom") return setCanvas({ ...canvas, mode });
    // Start a custom canvas from the current output size.
    setCanvas({
      mode,
      width: canvas.width ?? Math.ceil(svg.width),
      height: canvas.height ?? Math.ceil(svg.height),
      anchor: canvas.anchor ?? [0.5, 0.5],
    });
  };
  const [ax, ay] = canvas.anchor ?? [0.5, 0.5];

  return (
    <Section title="EXPORT" accent={accent}>
      <div className="controls">
        <div className="field">
          <div className="field-head">
            <label className="field-label" htmlFor="export-name">FILE NAME</label>
            {edited && <button type="button" className="link-btn" onClick={() => { setEdited(false); setName(filename); }}>AUTO</button>}
          </div>
          <div className="filename">
            <input id="export-name" className="text-input" value={name} spellCheck={false} onChange={(e) => { setName(e.target.value); setEdited(true); }} />
            <span className="filename-ext">.svg</span>
          </div>
        </div>

        <Field label="CANVAS" hint={CANVAS_MODES.find((m) => m.id === canvas.mode)?.hint}>
          <div className="choice-grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
            {CANVAS_MODES.map((m) => (
              <Chip key={m.id} selected={canvas.mode === m.id} accent={accent} onClick={() => pickMode(m.id)} title={m.id === defaultMode ? "Default for this asset" : undefined}>
                {m.label}
              </Chip>
            ))}
          </div>
        </Field>

        {canvas.mode === "custom" && (
          <div className="custom-canvas">
            <div className="canvas-dims">
              <Field label="WIDTH">
                <NumberInput label="Canvas width" value={canvas.width ?? Math.ceil(svg.width)} min={1} max={10000} suffix="px" width={110} onChange={(v) => setCanvas({ ...canvas, width: v })} />
              </Field>
              <Field label="HEIGHT">
                <NumberInput label="Canvas height" value={canvas.height ?? Math.ceil(svg.height)} min={1} max={10000} suffix="px" width={110} onChange={(v) => setCanvas({ ...canvas, height: v })} />
              </Field>
            </div>
            <Field label="ANCHOR">
              <div className="anchor-grid" role="group" aria-label="Artwork position">
                {ANCHORS.map(([x, y]) => {
                  const on = x === ax && y === ay;
                  return (
                    <button
                      key={`${x}-${y}`}
                      type="button"
                      aria-pressed={on}
                      aria-label={`Anchor ${["left", "centre", "right"][x * 2]} ${["top", "middle", "bottom"][y * 2]}`}
                      onClick={() => setCanvas({ ...canvas, anchor: [x, y] })}
                      style={on ? { background: accent, borderColor: "#0a0e1a" } : undefined}
                    />
                  );
                })}
              </div>
            </Field>
          </div>
        )}

        <div className="export-meta">
          {fmt(svg.width)} × {fmt(svg.height)} px · {(bytes / 1024).toFixed(1)} KB
        </div>
        <PixelButton onClick={() => downloadSvg(svg.markup, name.trim() || "asset")} color="#00ff88" textColor="#0a0e1a" size="md" full disabled={!!svg.error}>
          <span className="btn-inner"><IconDownload size={18} color="#0a0e1a" /> EXPORT TO SVG</span>
        </PixelButton>
        <PixelButton onClick={copy} color="#2a3a5c" textColor="#e8f4f8" size="sm" full disabled={!!svg.error}>
          <span className="btn-inner">{copied ? <><IconCheck size={14} color="#00ff88" /> COPIED</> : "COPY SVG CODE"}</span>
        </PixelButton>
      </div>
    </Section>
  );
}

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0+$/, "").replace(/\.$/, ""));
