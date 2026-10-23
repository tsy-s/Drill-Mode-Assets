import { useState } from "react";
import {
  ACCESSORIES,
  AccessoryPreview,
  CharacterAvatar,
  DEFAULT_CHARACTER_CONFIG,
  HAIR_COLORS,
  HAIR_STYLES,
  OUTFITS,
  OutfitPreview,
  SKIN_TONES,
  type AccessoryId,
  type CharacterConfig,
  type HairColorId,
  type HairStyleId,
  type OutfitId,
} from "../vendor/avatars/character";
import { accessoryRegistry } from "../vendor/avatars/character/accessories/accessoryRegistry";
import { hairRegistry } from "../vendor/avatars/character/hair/hairRegistry";
import { outfitRegistry } from "../vendor/avatars/character/outfits/outfitRegistry";
import { hairPalettes, skinPalettes } from "../vendor/avatars/character/palettes/palettes";
import { PixelLayer } from "../vendor/avatars/character/shared/PixelLayer";
import { Choice, Section, Swatch } from "../components/kit";
import { ColorInput } from "../components/Controls";
import type { PixelMap, PixelPalette } from "../vendor/avatars/character/types";
import { asset, type AssetDef, type ChoiceOption, type SettingsPanel, type SubTab } from "../lib/types";
import { slug } from "../lib/svg";

const ACCENT = "#c77dff";
const labelOf = <T extends string>(items: ReadonlyArray<{ id: T; label: string }>, id: T) => items.find((i) => i.id === id)?.label ?? id;

/**
 * One art pixel = size ÷ 32 px, the same scale CharacterAvatar uses for its height,
 * so a part exported untrimmed at size N lines up exactly on a character exported at N.
 */
function PartFrame({ size, title, children }: { size: number; title: string; children: React.ReactNode }) {
  return (
    <svg width={size * 0.625} height={size} viewBox="0 0 20 32" shapeRendering="crispEdges" style={{ imageRendering: "pixelated" }}>
      <title>{title}</title>
      {children}
    </svg>
  );
}

const sizeControl = {
  kind: "size", key: "size", label: "AVATAR HEIGHT", min: 16, max: 1280, step: 1,
  hint: "Same scale as a full character of this height (1 art pixel = height ÷ 32).",
} as const;
const partNote = "Exports the part alone, without the body. Set CANVAS to ORIGINAL in Export to keep the full 20×32 avatar frame, so it layers over a character export.";

// ── Custom colours ─────────────────────────────────────────────────────────
// Skin tones and hair colours are preset ids; a typed hex code is used as-is.

const isHex = (v: string) => /^#[0-9a-f]{6}$/i.test(v);

function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v: number) => Math.round(Math.min(255, Math.max(0, v * (1 + amount)))).toString(16).padStart(2, "0");
  return `#${ch(n >> 16)}${ch((n >> 8) & 255)}${ch(n & 255)}`;
}

/** Skin palette from one colour: shadow and features darkened like the presets. */
const skinPalette = (tone: string): PixelPalette | undefined =>
  skinPalettes[tone as keyof typeof skinPalettes] ? undefined
    : isHex(tone) ? { m: tone, s: shade(tone, -0.1), f: shade(tone, -0.35), e: "#0a0e1a", r: "#e8e1d5" } : undefined;
const hairPalette = (color: string): PixelPalette => hairPalettes[color as HairColorId] ?? { h: isHex(color) ? color : "#2b3445" };

/** Hairstyle thumbnail (like HairPreview) that also accepts a custom hex colour. */
function HairThumb({ style, color, label }: { style: Exclude<HairStyleId, "none">; color: string; label: string }) {
  const map: PixelMap = hairRegistry[style];
  let [x0, y0, x1, y1] = [20, 32, -1, -1];
  map.forEach((row, y) => [...row].forEach((c, x) => {
    if (c === ".") return;
    x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
  }));
  return (
    <svg width={62} height={48} viewBox={`${x0 - 1} ${y0 - 1} ${x1 - x0 + 3} ${y1 - y0 + 3}`} role="img" aria-label={label} shapeRendering="crispEdges" style={{ display: "block", imageRendering: "pixelated" }}>
      <PixelLayer map={map} palette={hairPalette(color)} name={`preview-hair-${style}`} />
    </svg>
  );
}

/** A labelled hex field that marks itself selected when the value is a custom colour. */
function CustomColorRow({ value, fallback, onChange, disabled }: { value: string; fallback: string; onChange: (hex: string) => void; disabled?: boolean }) {
  const custom = isHex(value);
  return (
    <div className="custom-color" style={{ borderColor: custom ? ACCENT : "#2a3a5c", opacity: disabled ? 0.35 : 1, pointerEvents: disabled ? "none" : undefined }}>
      <span className="field-label" style={{ color: custom ? "#ffffff" : undefined }}>CUSTOM</span>
      <ColorInput value={custom ? value : fallback} onChange={onChange} label="Custom colour" />
    </div>
  );
}

// ── Custom character: follows AvatarCustomisationScreen ────────────────────

type CustomTab = "skin" | "hair" | "outfit" | "accessories";
const CUSTOM_TABS: ReadonlyArray<{ id: CustomTab; label: string; short: string }> = [
  { id: "skin", label: "Skin tone", short: "SKIN" },
  { id: "hair", label: "Hair", short: "HAIR" },
  { id: "outfit", label: "Outfit", short: "OUTFIT" },
  { id: "accessories", label: "Accessories", short: "EXTRAS" },
];

const grid = { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 } as const;

const CustomCharacterSettings: SettingsPanel = ({ values, set }) => {
  const [tab, setTab] = useState<CustomTab>("skin");
  const draft = values as CharacterConfig & { size: number };
  const hairEnabled = draft.hairStyle !== "none";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div role="tablist" aria-label="Character customisation categories" className="custom-tabs">
        {CUSTOM_TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            aria-label={item.label}
            onClick={() => setTab(item.id)}
            className="custom-tab"
            style={{
              borderBottomColor: tab === item.id ? ACCENT : "transparent",
              background: tab === item.id ? "#1a2340" : "transparent",
              color: tab === item.id ? "#ffffff" : "#7f93a8",
            }}
          >
            {item.short}
          </button>
        ))}
      </div>

      {tab === "skin" && (
        <Section title="SKIN TONE">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8 }}>
            {SKIN_TONES.map((tone) => {
              const selected = draft.skinTone === tone.id;
              return (
                <button
                  key={tone.id}
                  type="button"
                  aria-label={tone.label}
                  aria-pressed={selected}
                  title={tone.label}
                  onClick={() => set({ skinTone: tone.id })}
                  className="skin-choice"
                  style={{
                    background: selected ? `${ACCENT}22` : "#0a0e1a",
                    borderColor: selected ? ACCENT : "#2a3a5c",
                    boxShadow: selected ? `2px 2px 0 ${ACCENT}` : "none",
                  }}
                >
                  <span aria-hidden="true" style={{ display: "block", width: "100%", height: "100%", background: tone.swatch, border: "2px solid #0a0e1a" }} />
                </button>
              );
            })}
          </div>
          <div style={{ marginTop: 10 }}>
            <CustomColorRow value={draft.skinTone} fallback={SKIN_TONES.find((t) => t.id === draft.skinTone)?.swatch ?? "#f2ae85"} onChange={(hex) => set({ skinTone: hex })} />
          </div>
        </Section>
      )}

      {tab === "hair" && (
        <>
          <Section title="HAIR COLOUR">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 7, opacity: hairEnabled ? 1 : 0.35 }}>
              {HAIR_COLORS.map((color) => (
                <Swatch
                  key={color.id}
                  color={color.swatch}
                  label={color.label}
                  selected={draft.hairColor === color.id}
                  disabled={!hairEnabled}
                  onClick={() => set({ hairColor: color.id })}
                  style={{ height: 39, width: "100%" }}
                />
              ))}
            </div>
            <div style={{ marginTop: 10 }}>
              <CustomColorRow value={draft.hairColor} fallback={hairPalette(draft.hairColor).h} disabled={!hairEnabled} onChange={(hex) => set({ hairColor: hex })} />
            </div>
          </Section>
          <Section title="HAIRSTYLE">
            <div style={grid}>
              {HAIR_STYLES.map((style) => (
                <Choice key={style.id} selected={draft.hairStyle === style.id} label={style.label} onClick={() => set({ hairStyle: style.id })}>
                  {style.id === "none" ? (
                    <span aria-hidden="true" className="bald-glyph">∅</span>
                  ) : (
                    <HairThumb style={style.id} color={draft.hairColor} label={`${style.label} hairstyle`} />
                  )}
                </Choice>
              ))}
            </div>
          </Section>
        </>
      )}

      {tab === "outfit" && (
        <Section title="OUTFIT">
          <div style={grid}>
            {OUTFITS.map((outfit) => (
              <Choice key={outfit.id} selected={draft.outfit === outfit.id} label={outfit.label} onClick={() => set({ outfit: outfit.id })}>
                <OutfitPreview outfit={outfit.id} label={`${outfit.label} outfit`} />
              </Choice>
            ))}
          </div>
        </Section>
      )}

      {tab === "accessories" && (
        <Section title="ACCESSORIES">
          <div style={grid}>
            {ACCESSORIES.map((accessory) => {
              const selected = draft.accessories.includes(accessory.id);
              return (
                <Choice
                  key={accessory.id}
                  selected={selected}
                  label={accessory.label}
                  onClick={() => set({ accessories: selected ? draft.accessories.filter((id) => id !== accessory.id) : [...draft.accessories, accessory.id] })}
                >
                  <AccessoryPreview accessory={accessory.id} label={accessory.label} />
                </Choice>
              );
            })}
          </div>
        </Section>
      )}
    </div>
  );
};

const customCharacter = asset({
  id: "avatar-custom",
  name: "Custom Character",
  defaults: { ...DEFAULT_CHARACTER_CONFIG, size: 64, variant: "full" as "full" | "head" },
  controls: [
    { kind: "size", key: "size", label: "HEIGHT", min: 16, max: 1280, hint: "Full body is 20 × 32 art pixels; the head crop is square." },
    {
      kind: "choice", key: "variant", label: "VARIANT", style: "chips", columns: 2,
      options: [{ value: "full", label: "FULL BODY" }, { value: "head", label: "HEAD ONLY" }],
    },
  ],
  Settings: CustomCharacterSettings,
  render: (p) => (
    <CharacterAvatar
      config={{ skinTone: p.skinTone, hairStyle: p.hairStyle, hairColor: p.hairColor, outfit: p.outfit, accessories: p.accessories }}
      size={p.size}
      variant={p.variant}
      palettes={{ skin: skinPalette(p.skinTone), hair: isHex(p.hairColor) ? hairPalette(p.hairColor) : undefined }}
      title="Customised character"
    />
  ),
  filename: (p) => slug("character", p.skinTone, p.hairStyle, p.hairStyle !== "none" && p.hairColor, p.outfit, ...p.accessories, p.variant === "head" && "head", p.size),
});

// ── Parts ──────────────────────────────────────────────────────────────────

const hairStyleOptions: ChoiceOption[] = HAIR_STYLES.filter((s) => s.id !== "none").map((s) => ({
  value: s.id,
  label: s.label,
  thumb: (p) => <HairThumb style={s.id as Exclude<HairStyleId, "none">} color={p.color} label={`${s.label} hairstyle`} />,
}));
const hairColorOptions: ChoiceOption[] = HAIR_COLORS.map((c) => ({ value: c.id, label: c.label, swatch: c.swatch }));

const hair = asset({
  id: "avatar-hair",
  name: "Hair",
  defaults: { style: "short" as Exclude<HairStyleId, "none">, color: "midnight" as string, size: 64 },
  controls: [
    sizeControl,
    { kind: "choice", key: "color", label: "HAIR COLOUR", options: hairColorOptions, style: "swatches", columns: 5, custom: true },
    { kind: "choice", key: "style", label: "HAIRSTYLE", options: hairStyleOptions, style: "grid", columns: 3 },
  ],
  render: (p) => (
    <PartFrame size={p.size} title={`${labelOf(HAIR_STYLES, p.style)} hair, ${labelOf(HAIR_COLORS, p.color as HairColorId)}`}>
      <PixelLayer map={hairRegistry[p.style]} palette={hairPalette(p.color)} name={`hair-${p.style}`} />
    </PartFrame>
  ),
  filename: (p) => slug("hair", p.style, p.color, p.size),
  note: partNote,
});

const outfitOptions: ChoiceOption[] = OUTFITS.map((o) => ({
  value: o.id,
  label: o.label,
  thumb: () => <OutfitPreview outfit={o.id} label={`${o.label} outfit`} />,
}));

const outfit = asset({
  id: "avatar-outfit",
  name: "Outfit",
  defaults: { outfit: "blue-tank" as OutfitId, size: 64 },
  controls: [sizeControl, { kind: "choice", key: "outfit", label: "OUTFIT", options: outfitOptions, style: "grid", columns: 3 }],
  render: (p) => {
    const def = outfitRegistry[p.outfit];
    return (
      <PartFrame size={p.size} title={`${labelOf(OUTFITS, p.outfit)} outfit`}>
        <PixelLayer map={def.map} palette={def.palette} name={`outfit-${p.outfit}`} />
      </PartFrame>
    );
  },
  filename: (p) => slug("outfit", p.outfit, p.size),
  note: partNote,
});

const accessoryOptions: ChoiceOption[] = ACCESSORIES.map((a) => ({
  value: a.id,
  label: a.label,
  thumb: () => <AccessoryPreview accessory={a.id} label={a.label} />,
}));

const accessory = asset({
  id: "avatar-accessory",
  name: "Accessory",
  defaults: { accessory: "round-glasses" as AccessoryId, size: 64 },
  controls: [sizeControl, { kind: "choice", key: "accessory", label: "ACCESSORY", options: accessoryOptions, style: "grid", columns: 3 }],
  render: (p) => {
    const Layer = accessoryRegistry[p.accessory].Layer;
    return (
      <PartFrame size={p.size} title={labelOf(ACCESSORIES, p.accessory)}>
        <Layer />
      </PartFrame>
    );
  },
  filename: (p) => slug("accessory", p.accessory, p.size),
  note: partNote,
});

export const AVATAR_SUBTABS: SubTab[] = [
  { id: "custom", label: "CUSTOM CHARACTER", assets: [customCharacter] },
  { id: "hair", label: "HAIR", assets: [hair] },
  { id: "outfits", label: "OUTFITS", assets: [outfit] },
  { id: "accessories", label: "ACCESSORIES", assets: [accessory] },
];

export const AVATAR_ASSETS: AssetDef[] = AVATAR_SUBTABS.flatMap((t) => t.assets);
