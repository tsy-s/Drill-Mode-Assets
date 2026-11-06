import { useMemo, useState, type CSSProperties } from "react";
import { ICON_ASSETS } from "../assets/icons";
import { ALL_ASSETS } from "../registry";
import { DEFAULT_INNER, INNER_MODES, iconInfo, type InnerMode } from "../lib/theme";
import { renderForTheme } from "../lib/themed";
import { downloadText, reviewMarkdown, type ReviewEntry } from "../lib/review";
import type { AssetDef, Props } from "../lib/types";
import { Chip, Slider } from "./kit";

const ACCENT = "#00d4ff";
type Filter = "all" | "holes" | "noted";

/**
 * Every icon as the app's light theme would draw it, with each inner-line option side by
 * side. Pick one per icon and leave a note; COPY REVIEW gives the whole list as Markdown.
 */
export function ReviewBoard({ valuesOf, review, setReview, thinPx, setThinPx, onOpen }: {
  valuesOf: (def: AssetDef) => Props;
  review: Record<string, ReviewEntry>;
  setReview: (id: string, patch: ReviewEntry) => void;
  thinPx: number;
  setThinPx: (v: number) => void;
  onOpen: (id: string) => void;
}) {
  const [zoom, setZoom] = useState(3);
  const [filter, setFilter] = useState<Filter>("all");
  const [copied, setCopied] = useState(false);

  // Recomputed when an icon's settings or the thin width change, not on every note keystroke.
  const valuesKey = JSON.stringify(ICON_ASSETS.map(valuesOf));
  const rows = useMemo(() => ICON_ASSETS.map((def) => {
    const values = valuesOf(def);
    const original = { mode: "original" as const };
    const dark = renderForTheme(def, values, { theme: "dark", canvas: original });
    const info = iconInfo(dark.markup, values.color, !!def.edge);
    const variants = INNER_MODES.map((m) => ({ ...m, svg: renderForTheme(def, values, { theme: "light", canvas: original, inner: m.id, thinPx }) }));
    return { def, dark, info, variants };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [valuesKey, thinPx]);

  const visible = rows.filter((r) => filter === "all" || (filter === "holes" ? r.info.holes > 0 && r.info.outlined : !!review[r.def.id]));
  const picked = rows.filter((r) => review[r.def.id]?.inner && review[r.def.id]!.inner !== DEFAULT_INNER).length;
  const noted = Object.values(review).filter((r) => r.note?.trim()).length;
  const otherNotes = ALL_ASSETS.filter((a) => a.light !== "icon" && review[a.id]?.note?.trim());

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(reviewMarkdown(review, thinPx));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { setCopied(false); }
  };

  const art = (svg: { markup: string; width: number; height: number }, z: number) => (
    <span className="review-art" style={{ "--w": `${svg.width * z}px`, "--h": `${svg.height * z}px` } as CSSProperties} dangerouslySetInnerHTML={{ __html: svg.markup }} />
  );

  return (
    <main className="review">
      <div className="review-toolbar">
        <div>
          <div className="settings-kicker" style={{ color: "var(--title)" }}>LIGHT THEME REVIEW</div>
          <p className="review-intro">
            Every icon the way the app's light theme draws it: the neon with a dark outline. For icons with holes, pick how the
            inside should look: <b>outer only</b> (holes are paper, today's look), <b>thin inner</b> (paper holes with a thinner
            dark line inside) or <b>full</b> (see-through holes with the full outline, the look before). Click a picture to pick it,
            and add a note. Choices are saved in this browser.
          </p>
        </div>
        <div className="review-controls">
          <div className="review-control">
            <span className="field-label">ZOOM</span>
            <div className="chip-row">{[1, 2, 3, 4].map((z) => <Chip key={z} selected={zoom === z} accent={ACCENT} onClick={() => setZoom(z)}>{z}×</Chip>)}</div>
          </div>
          <div className="review-control">
            <span className="field-label">SHOW</span>
            <div className="chip-row">
              <Chip selected={filter === "all"} accent={ACCENT} onClick={() => setFilter("all")}>ALL {rows.length}</Chip>
              <Chip selected={filter === "holes"} accent={ACCENT} onClick={() => setFilter("holes")}>WITH HOLES</Chip>
              <Chip selected={filter === "noted"} accent={ACCENT} onClick={() => setFilter("noted")}>REVIEWED</Chip>
            </div>
          </div>
          <div className="review-control review-thin">
            <span className="field-label">THIN LINE {thinPx.toFixed(2).replace(/0$/, "")}PX</span>
            <Slider label="Thin inner line width" value={thinPx} min={0.25} max={1} step={0.05} onChange={setThinPx} accent={ACCENT} />
          </div>
          <div className="review-control review-actions">
            <span className="field-label">{picked} PICKED · {noted} NOTED</span>
            <div className="chip-row">
              <button type="button" className="mini-btn" onClick={copy}>{copied ? "COPIED" : "COPY REVIEW"}</button>
              <button type="button" className="mini-btn" onClick={() => downloadText(reviewMarkdown(review, thinPx), "drill-mode-light-review.md")}>DOWNLOAD .MD</button>
            </div>
          </div>
        </div>
      </div>

      <div className="review-scroll">
        <div className="review-head" aria-hidden="true">
          <span>ICON</span><span>DARK</span>
          {INNER_MODES.map((m) => <span key={m.id} title={m.hint}>LIGHT · {m.label}</span>)}
          <span>NOTE</span>
        </div>
        {visible.map(({ def, dark, info, variants }) => {
          const entry = review[def.id] ?? {};
          const current: InnerMode = entry.inner ?? DEFAULT_INNER;
          const choosable = info.outlined && info.holes > 0;
          return (
            <div key={def.id} className="review-row">
              <div className="review-name">
                <button type="button" className="link-btn" onClick={() => onOpen(def.id)} title="Open in the Icons tab">{def.name}</button>
                <span className="review-facts">
                  {!info.outlined ? "NOT OUTLINED · drawn in a neutral, like the app's grey icons" : info.holes ? `${info.holes} HOLE CELLS` : "NO HOLES · one look"}
                </span>
              </div>
              <div className="review-cell is-dark" data-theme="dark">{art(dark, zoom)}{zoom > 1 && art(dark, 1)}</div>
              {choosable ? variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  className="review-cell is-light"
                  aria-pressed={current === v.id}
                  title={`${v.label}: ${v.hint}`}
                  onClick={() => setReview(def.id, { inner: v.id })}
                >
                  {art(v.svg, zoom)}{zoom > 1 && art(v.svg, 1)}
                  <span className="review-pick">{current === v.id ? "✓ PICKED" : "PICK"}</span>
                </button>
              )) : (
                <div className="review-cell is-light is-single">{art(variants[0].svg, zoom)}{zoom > 1 && art(variants[0].svg, 1)}</div>
              )}
              <textarea
                className="text-input review-note"
                rows={2}
                placeholder="Note on this icon"
                value={entry.note ?? ""}
                onChange={(e) => setReview(def.id, { note: e.target.value })}
                aria-label={`Note on ${def.name}`}
              />
            </div>
          );
        })}
        {visible.length === 0 && <div className="asset-empty">NOTHING HERE YET</div>}

        <section className="review-others">
          <div className="section-title" style={{ color: "var(--title)" }}>NOTES ON OTHER ASSETS</div>
          <p className="section-note">Add a note to any asset (UI, screens, avatars, furniture) from its Settings panel. They are listed here and in the copied review.</p>
          {otherNotes.length === 0 ? <div className="section-note">None yet.</div> : otherNotes.map((a) => (
            <div key={a.id} className="review-other">
              <button type="button" className="link-btn" onClick={() => onOpen(a.id)}>{a.name}</button>
              <span>{review[a.id]?.note}</span>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
