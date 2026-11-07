import { useMemo, useState } from "react";
import type { AssetDef, Props } from "../lib/types";
import { lineColor, useTheme, type InnerMode } from "../lib/theme";
import { renderForTheme, themedProps } from "../lib/themed";

/** Searchable, grouped list of a tab's assets with live thumbnails. */
export function AssetList({ assets, selectedId, onSelect, valuesOf, accent, innerOf, thinPx, reviewed }: {
  assets: AssetDef[]; selectedId: string; onSelect: (id: string) => void; valuesOf: (def: AssetDef) => Props; accent: string;
  innerOf: (id: string) => InnerMode; thinPx: number; reviewed: (id: string) => boolean;
}) {
  const theme = useTheme();
  const [query, setQuery] = useState("");
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const map = new Map<string, AssetDef[]>();
    for (const a of assets) {
      if (q && !a.name.toLowerCase().includes(q) && !(a.group ?? "").toLowerCase().includes(q)) continue;
      const g = a.group ?? "";
      map.set(g, [...(map.get(g) ?? []), a]);
    }
    return [...map.entries()];
  }, [assets, query]);

  // Icons in light are drawn with their outline, so their thumbnails use the same file
  // the preview shows (on their own canvas, which needs no measuring).
  const thumb = (a: AssetDef) => {
    if (theme === "light" && a.light === "icon") {
      const out = renderForTheme(a, valuesOf(a), { theme, canvas: { mode: "original" }, inner: innerOf(a.id), thinPx });
      return <span className="asset-thumb-art" dangerouslySetInnerHTML={{ __html: out.markup }} />;
    }
    return a.render(themedProps(a, valuesOf(a), theme));
  };

  return (
    <nav className="asset-list" aria-label="Assets">
      <div className="asset-search">
        <input className="text-input" placeholder={`SEARCH ${assets.length} ASSETS`} value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search assets" />
      </div>
      <div className="asset-scroll">
        {groups.length === 0 && <div className="asset-empty">NO MATCHES</div>}
        {groups.map(([group, items]) => (
          <div key={group || "_"} className="asset-group">
            {group && <div className="asset-group-title">{group}</div>}
            {items.map((a) => {
              const selected = a.id === selectedId;
              const line = lineColor(theme, accent);
              return (
                <button
                  key={a.id}
                  type="button"
                  className="asset-item"
                  aria-current={selected}
                  onClick={() => onSelect(a.id)}
                  style={selected ? { borderColor: line, background: `${accent}1f`, boxShadow: `3px 3px 0 ${line}` } : undefined}
                >
                  <span className="asset-thumb">{thumb(a)}</span>
                  <span className="asset-name" style={selected ? { color: "var(--strong)" } : undefined}>{a.name}</span>
                  {reviewed(a.id) && <span className="asset-reviewed" title="Has a review note or choice">●</span>}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </nav>
  );
}
