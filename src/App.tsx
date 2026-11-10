import { useEffect, useMemo, useState } from "react";
import { Stars } from "./components/Stars";
import { Logo } from "./components/Logo";
import { AssetList } from "./components/AssetList";
import { Preview } from "./components/Preview";
import { SettingsPanel } from "./components/SettingsPanel";
import { ReviewBoard } from "./components/ReviewBoard";
import { ALL_ASSETS, REVIEW_TAB, TABS, locate } from "./registry";
import { renderAsset, slug } from "./lib/svg";
import { useFontsReady } from "./lib/text";
import { DEFAULT_THIN_PX, ThemeContext, lineColor, markupInner, type InnerMode, type Theme } from "./lib/theme";
import { renderForTheme } from "./lib/themed";
import type { AssetDef, CanvasOptions, Props } from "./lib/types";
import { iconDefaults, type ReviewEntry } from "./lib/review";
import { IconMoon, IconSun } from "./vendor/icons";

const STORAGE_KEY = "drill-mode-svg-studio-v1";


type Saved = {
  tab: string;
  subTab: Record<string, string>;
  selected: Record<string, string>;
  values: Record<string, Props>;
  palettes: Record<string, Record<string, string>>;
  canvases: Record<string, CanvasOptions>;
  /** null until picked: then the device's light/dark setting decides. */
  theme: Theme | null;
  review: Record<string, ReviewEntry>;
  thinPx: number;
};

function load(): Saved {
  const empty: Saved = { tab: TABS[0].id, subTab: {}, selected: {}, values: {}, palettes: {}, canvases: {}, theme: null, review: {}, thinPx: DEFAULT_THIN_PX };
  try {
    // `trims` was the old on/off canvas setting; canvases replace it.
    const { trims: _old, ...saved } = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    return { ...empty, ...saved };
  } catch {
    return empty;
  }
}

function useDeviceTheme(): Theme {
  const query = typeof window !== "undefined" ? window.matchMedia?.("(prefers-color-scheme: light)") : undefined;
  const [light, setLight] = useState(() => !!query?.matches);
  useEffect(() => {
    if (!query) return;
    const on = (e: MediaQueryListEvent) => setLight(e.matches);
    query.addEventListener?.("change", on);
    return () => query.removeEventListener?.("change", on);
  }, [query]);
  return light ? "light" : "dark";
}

export default function App() {
  const fontsVersion = useFontsReady();
  const [state, setState] = useState<Saved>(load);
  const [resets, setResets] = useState(0);
  const device = useDeviceTheme();
  const theme: Theme = state.theme ?? device;
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* storage full or blocked */ }
  }, [state]);
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);

  const reviewing = state.tab === REVIEW_TAB.id;
  const tab = TABS.find((t) => t.id === state.tab) ?? TABS[0];
  const subTab = tab.subTabs?.find((s) => s.id === state.subTab[tab.id]) ?? tab.subTabs?.[0];
  const listKey = subTab ? `${tab.id}/${subTab.id}` : tab.id;
  const assets = subTab?.assets ?? tab.assets ?? [];
  const def = assets.find((a) => a.id === state.selected[listKey]) ?? assets[0];
  const accent = reviewing ? REVIEW_TAB.accent : tab.accent;

  const valuesOf = (a: AssetDef): Props => ({ ...a.defaults, ...state.values[a.id] });
  const values = valuesOf(def);
  const palette = state.palettes[def.id] ?? {};
  const canvas: CanvasOptions = state.canvases[def.id] ?? { mode: def.canvas ?? "trim" };
  const review = state.review[def.id] ?? {};
  // An icon's inner lines and (grey icons) outline: the review's pick, else what the app draws.
  // The inner-line default comes from the icon's markup at its current settings, so it can depend
  // on the colour (the gear: thin in a colour, outline only when grey); renderForTheme reads it.
  const defaultsOf = (id: string, values?: Props) => {
    const a = ALL_ASSETS.find((x) => x.id === id);
    if (!a) return { inner: "outer" as InnerMode, edge: false };
    const base = iconDefaults(a);
    return a.light === "icon" ? { ...base, inner: markupInner(renderAsset(a, values ?? valuesOf(a))) } : base;
  };
  const innerOf = (id: string): InnerMode | undefined => state.review[id]?.inner;
  const edgeOf = (id: string): boolean => state.review[id]?.edge ?? defaultsOf(id).edge;

  const set = (patch: Props) =>
    setState((s) => ({ ...s, values: { ...s.values, [def.id]: { ...valuesOf(def), ...s.values[def.id], ...patch } } }));
  const reset = () => {
    setState((s) => {
      const { [def.id]: _v, ...values } = s.values;
      const { [def.id]: _p, ...palettes } = s.palettes;
      const { [def.id]: _c, ...canvases } = s.canvases;
      return { ...s, values, palettes, canvases };
    });
    setResets((n) => n + 1);
  };
  const setReview = (id: string, patch: ReviewEntry) =>
    setState((s) => {
      const next = { ...s.review[id], ...patch };
      if (!next.note?.trim()) delete next.note;
      const a = ALL_ASSETS.find((x) => x.id === id);
      const base = defaultsOf(id, a ? { ...a.defaults, ...s.values[id] } : undefined);
      if (!next.inner || next.inner === base.inner) delete next.inner;
      if (next.edge === undefined || next.edge === base.edge) delete next.edge;
      const { [id]: _old, ...rest } = s.review;
      return { ...s, review: Object.keys(next).length ? { ...rest, [id]: next } : rest };
    });

  const svg = useMemo(
    () => renderForTheme(def, values, { theme, palette, canvas, inner: innerOf(def.id), edge: edgeOf(def.id), thinPx: state.thinPx }),
    // fontsVersion: text-based assets measure their labels with the loaded fonts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [def, JSON.stringify(values), JSON.stringify(palette), JSON.stringify(canvas), fontsVersion, theme, innerOf(def.id), edgeOf(def.id), state.thinPx],
  );

  const baseName = def.filename?.(values) ?? slug(def.name);
  const filename = theme === "light" && def.light ? `${baseName}-light` : baseName;

  return (
    <ThemeContext.Provider value={theme}>
      <div className="app">
        <header className="app-header">
          <Stars />
          <Logo />
          <div className="header-side">
            <div className="segmented theme-switch" role="group" aria-label="Theme">
              {(["dark", "light"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={theme === t}
                  onClick={() => setState((s) => ({ ...s, theme: t }))}
                  title={t === "light" ? "Show every asset the way the app's light theme draws it" : "The artwork's own colours (the app's dark theme)"}
                >
                  {t === "light" ? <IconSun size={14} color={theme === t ? "#0a0e1a" : "var(--muted)"} /> : <IconMoon size={14} color={theme === t ? "#0a0e1a" : "var(--muted)"} />}
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="header-meta">
              <span className="header-title">SVG ASSET STUDIO</span>
              <span className="header-sub">{ALL_ASSETS.length} ASSETS · PREVIEW · CUSTOMISE · EXPORT</span>
            </div>
          </div>
        </header>

        <nav className="main-tabs" role="tablist" aria-label="Asset categories">
          {[...TABS, REVIEW_TAB].map((t) => {
            const on = t.id === (reviewing ? REVIEW_TAB.id : tab.id);
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={on}
                className="main-tab"
                onClick={() => setState((s) => ({ ...s, tab: t.id }))}
                style={on ? { color: "var(--strong)", background: "var(--card)", borderBottomColor: lineColor(theme, t.accent) } : undefined}
              >
                <t.Icon size={16} color={on ? t.accent : "var(--muted)"} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </nav>

        {reviewing ? (
          <ReviewBoard
            valuesOf={valuesOf}
            review={state.review}
            setReview={setReview}
            thinPx={state.thinPx}
            setThinPx={(v) => setState((s) => ({ ...s, thinPx: v }))}
            onOpen={(id) => {
              const where = locate(id);
              if (!where) return;
              setState((s) => ({
                ...s,
                tab: where.tab.id,
                subTab: where.subTabId ? { ...s.subTab, [where.tab.id]: where.subTabId } : s.subTab,
                selected: { ...s.selected, [where.listKey]: id },
              }));
            }}
          />
        ) : (
          <>
            {tab.subTabs && (
              <nav className="sub-tabs" role="tablist" aria-label={`${tab.label} sections`}>
                {tab.subTabs.map((s) => {
                  const on = s.id === subTab?.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      role="tab"
                      aria-selected={on}
                      className="sub-tab"
                      onClick={() => setState((st) => ({ ...st, subTab: { ...st.subTab, [tab.id]: s.id } }))}
                      style={on ? { background: accent, color: "#0a0e1a", borderColor: "var(--outline)", boxShadow: "3px 3px 0 var(--outline)" } : undefined}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </nav>
            )}

            <main className={`workspace ${assets.length > 1 ? "with-list" : ""}`}>
              {assets.length > 1 && (
                <AssetList
                  key={listKey}
                  assets={assets}
                  selectedId={def.id}
                  onSelect={(id) => setState((s) => ({ ...s, selected: { ...s.selected, [listKey]: id } }))}
                  valuesOf={valuesOf}
                  accent={accent}
                  innerOf={innerOf}
                  edgeOf={edgeOf}
                  thinPx={state.thinPx}
                  reviewed={(id) => !!state.review[id]}
                />
              )}
              <Preview key={def.id} svg={svg} accent={accent} name={def.name} />
              <SettingsPanel
                key={`${def.id}-${resets}`}
                def={def}
                values={values}
                set={set}
                reset={reset}
                accent={accent}
                svg={svg}
                palette={palette}
                setPalette={(next) => setState((s) => ({ ...s, palettes: { ...s.palettes, [def.id]: next } }))}
                canvas={canvas}
                setCanvas={(v) => setState((s) => ({ ...s, canvases: { ...s.canvases, [def.id]: v } }))}
                filename={filename}
                review={review}
                setReview={(patch) => setReview(def.id, patch)}
                thinPx={state.thinPx}
                setThinPx={(v) => setState((s) => ({ ...s, thinPx: v }))}
              />
            </main>
          </>
        )}
      </div>
    </ThemeContext.Provider>
  );
}
