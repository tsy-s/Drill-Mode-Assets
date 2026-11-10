import { useEffect, useState } from "react";
import { IconCheck, IconDownload } from "../vendor/icons";
import { PixelButton } from "../vendor/ui/PixelButton";
import { APP_COLORS, ColorInput, ControlView } from "./Controls";
import { Chip, Field, NumberInput, Section, Slider, Swatch } from "./kit";
import { downloadSvg, svgFile, type ProcessedSvg } from "../lib/svg";
import type { AssetDef, CanvasMode, CanvasOptions, Props } from "../lib/types";
import { INNER_MODES, iconInfo, textColor, useTheme } from "../lib/theme";
import { iconDefaults, type ReviewEntry } from "../lib/review";

export function SettingsPanel({ def, values, set, reset, accent, svg, palette, setPalette, canvas, setCanvas, filename, review, setReview, thinPx, setThinPx }: {
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
  review: ReviewEntry;
  setReview: (patch: ReviewEntry) => void;
  thinPx: number;
  setThinPx: (v: number) => void;
}) {
  const theme = useTheme();
  const Custom = def.Settings;
  const controls = def.controls.filter((c) => c.visible?.(values) ?? true);
  return (
    <aside className="settings" aria-label="Settings">
      <div className="settings-head">
        <div>
          <div className="settings-kicker" style={{ color: textColor(theme, accent) }}>SETTINGS</div>
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

        <LightSection def={def} values={values} svg={svg} review={review} setReview={setReview} thinPx={thinPx} setThinPx={setThinPx} accent={accent} />

        <Section title="REVIEW NOTE" accent={accent} note="A comment on this asset for the group. Every note is listed on the REVIEW tab and in its copied review.">
          <textarea
            className="text-input"
            rows={3}
            placeholder="e.g. keep the inner outline here, the details read better"
            value={review.note ?? ""}
            onChange={(e) => setReview({ note: e.target.value })}
            aria-label={`Review note on ${def.name}`}
          />
        </Section>

        <PaletteSection colors={svg.colors} palette={palette} setPalette={setPalette} accent={accent} />

        <ExportSection svg={svg} filename={filename} canvas={canvas} setCanvas={setCanvas} defaultMode={def.canvas ?? "trim"} accent={accent} />
      </div>
    </aside>
  );
}

/** What the light theme does to this asset, and (icons with holes) the inner-line choice. */
function LightSection({ def, values, svg, review, setReview, thinPx, setThinPx, accent }: {
  def: AssetDef; values: Props; svg: ProcessedSvg; review: ReviewEntry; setReview: (p: ReviewEntry) => void;
  thinPx: number; setThinPx: (v: number) => void; accent: string;
}) {
  const theme = useTheme();
  if (theme !== "light") return null;
  if (def.light === "props") {
    return <div className="settings-flag">LIGHT THEME · drawn with the app's light colours: light surfaces, neon fills with navy text, darker inks for neon text, dark outlines.</div>;
  }
  if (def.light !== "icon") {
    return <div className="settings-flag">LIGHT THEME · looks the same in both themes. In the app, characters, furniture and the room scenes keep their colours, and the title and call screens stay dark.</div>;
  }
  const base = iconDefaults(def);
  const edge = review.edge ?? base.edge;
  const info = iconInfo(svg.markup, values.color, !!def.edge || edge);
  // Unpicked: what the icon's markup asks for at its current colour (the gear: thin in a colour).
  const current = review.inner ?? info.inner;
  return (
    <Section
      title="LIGHT THEME OUTLINE"
      accent={accent}
      note={!info.outlined
        ? "Drawn in a neutral colour, so the app gives it no outline (like grey nav icons). Turn the outline on below, or pick a neon colour above."
        : "A 1px dark outline, as in the app. The canvas grows by 1px on each side for it."}
    >
      {info.neutral && !def.edge && (
        <div className="controls" style={{ marginBottom: 12 }}>
          <Field label="OUTLINE ON THIS GREY ICON" hint={base.edge ? "The app outlines it (e.g. the header gear, next to the neon icons)." : "The app leaves grey icons without an outline."}>
            <div className="choice-grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
              <Chip selected={!edge} accent={accent} onClick={() => setReview({ edge: false })}>NO OUTLINE</Chip>
              <Chip selected={edge} accent={accent} onClick={() => setReview({ edge: true })}>OUTLINE</Chip>
            </div>
          </Field>
        </div>
      )}
      {info.outlined && info.holes > 0 ? (
        <div className="controls">
          <Field label="INNER LINES" hint={INNER_MODES.find((m) => m.id === current)?.hint}>
            <div className="choice-grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
              {INNER_MODES.map((m) => (
                <Chip key={m.id} selected={current === m.id} accent={accent} onClick={() => setReview({ inner: m.id })} title={m.hint}>{m.label}</Chip>
              ))}
            </div>
          </Field>
          {current === "thin" && (
            <Field label={`THIN LINE WIDTH · ${thinPx}PX`} hint="One width for every icon. The outer outline is 1px.">
              <Slider label="Thin inner line width" value={thinPx} min={0.25} max={1} step={0.05} onChange={setThinPx} accent={accent} />
            </Field>
          )}
        </div>
      ) : (
        <div className="section-note">{info.outlined ? "No holes inside, so there are no inner lines to choose." : ""}</div>
      )}
    </Section>
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
                  <span className="palette-hex" style={on ? { color: "var(--strong)" } : undefined}>{now.replace("#", "")}</span>
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
                      style={on ? { background: accent, borderColor: "var(--outline)" } : undefined}
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
        <PixelButton onClick={copy} color="var(--border)" textColor="var(--fg)" size="sm" full disabled={!!svg.error}>
          <span className="btn-inner">{copied ? <><IconCheck size={14} color="#00ff88" /> COPIED</> : "COPY SVG CODE"}</span>
        </PixelButton>
      </div>
    </Section>
  );
}

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0+$/, "").replace(/\.$/, ""));
