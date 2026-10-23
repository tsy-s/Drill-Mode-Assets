import { useMemo, useState } from "react";
import type { AssetDef, Props } from "../lib/types";

/** Searchable, grouped list of a tab's assets with live thumbnails. */
export function AssetList({ assets, selectedId, onSelect, valuesOf, accent }: {
  assets: AssetDef[]; selectedId: string; onSelect: (id: string) => void; valuesOf: (def: AssetDef) => Props; accent: string;
}) {
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
              return (
                <button
                  key={a.id}
                  type="button"
                  className="asset-item"
                  aria-current={selected}
                  onClick={() => onSelect(a.id)}
                  style={selected ? { borderColor: accent, background: `${accent}1f`, boxShadow: `3px 3px 0 ${accent}` } : undefined}
                >
                  <span className="asset-thumb">{a.render(valuesOf(a))}</span>
                  <span className="asset-name" style={selected ? { color: "#ffffff" } : undefined}>{a.name}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </nav>
  );
}
