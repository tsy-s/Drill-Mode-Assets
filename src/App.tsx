import { useEffect, useMemo, useState } from "react";
import { Stars } from "./components/Stars";
import { Logo } from "./components/Logo";
import { AssetList } from "./components/AssetList";
import { Preview } from "./components/Preview";
import { SettingsPanel } from "./components/SettingsPanel";
import { ALL_ASSETS, TABS } from "./registry";
import { processSvg, renderAsset, slug } from "./lib/svg";
import { useFontsReady } from "./lib/text";
import type { AssetDef, CanvasOptions, Props } from "./lib/types";

const STORAGE_KEY = "drill-mode-svg-studio-v1";

type Saved = {
  tab: string;
  subTab: Record<string, string>;
  selected: Record<string, string>;
  values: Record<string, Props>;
  palettes: Record<string, Record<string, string>>;
  canvases: Record<string, CanvasOptions>;
};

function load(): Saved {
  const empty: Saved = { tab: TABS[0].id, subTab: {}, selected: {}, values: {}, palettes: {}, canvases: {} };
  try {
    // `trims` was the old on/off canvas setting; canvases replace it.
    const { trims: _old, ...saved } = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    return { ...empty, ...saved };
  } catch {
    return empty;
  }
}

export default function App() {
  const fontsVersion = useFontsReady();
  const [state, setState] = useState<Saved>(load);
  const [resets, setResets] = useState(0);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* storage full or blocked */ }
  }, [state]);

  const tab = TABS.find((t) => t.id === state.tab) ?? TABS[0];
  const subTab = tab.subTabs?.find((s) => s.id === state.subTab[tab.id]) ?? tab.subTabs?.[0];
  const listKey = subTab ? `${tab.id}/${subTab.id}` : tab.id;
  const assets = subTab?.assets ?? tab.assets ?? [];
  const def = assets.find((a) => a.id === state.selected[listKey]) ?? assets[0];
  const accent = tab.accent;

  const valuesOf = (a: AssetDef): Props => ({ ...a.defaults, ...state.values[a.id] });
  const values = valuesOf(def);
  const palette = state.palettes[def.id] ?? {};
  const canvas: CanvasOptions = state.canvases[def.id] ?? { mode: def.canvas ?? "trim" };

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

  const svg = useMemo(() => {
    try {
      return processSvg(renderAsset(def, values), { palette, canvas });
    } catch (error) {
      return { markup: "", width: 0, height: 0, colors: [], error: (error as Error).message };
    }
    // fontsVersion: text-based assets measure their labels with the loaded fonts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [def, JSON.stringify(values), JSON.stringify(palette), JSON.stringify(canvas), fontsVersion]);

  const filename = def.filename?.(values) ?? slug(def.name);

  return (
    <div className="app">
      <header className="app-header">
        <Stars />
        <Logo />
        <div className="header-meta">
          <span className="header-title">SVG ASSET STUDIO</span>
          <span className="header-sub">{ALL_ASSETS.length} ASSETS · PREVIEW · CUSTOMISE · EXPORT</span>
        </div>
      </header>

      <nav className="main-tabs" role="tablist" aria-label="Asset categories">
        {TABS.map((t) => {
          const on = t.id === tab.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={on}
              className="main-tab"
              onClick={() => setState((s) => ({ ...s, tab: t.id }))}
              style={on ? { color: "#ffffff", background: "#111827", borderBottomColor: t.accent } : undefined}
            >
              <t.Icon size={16} color={on ? t.accent : "#6b8ba4"} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </nav>

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
                style={on ? { background: accent, color: "#0a0e1a", borderColor: "#0a0e1a", boxShadow: "3px 3px 0 #0a0e1a" } : undefined}
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
        />
      </main>
    </div>
  );
}
