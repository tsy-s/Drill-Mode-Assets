import { IconShield } from "../vendor/icons";
import { asset, type AssetDef, type ChoiceOption } from "../lib/types";
import { slug } from "../lib/svg";
import { FONT_IMPORT, MONO, PIXEL, textWidth } from "../lib/text";

// The app's UI widgets are HTML + CSS. These redraw them as native SVG using the same
// measurements and colours (components/ui, components/layout) so exports stay editable.

export function FontDefs() {
  return <defs><style dangerouslySetInnerHTML={{ __html: FONT_IMPORT }} /></defs>;
}

/** Baseline for vertically centred caps-height text. */
const mid = (y: number, fontSize: number) => y + fontSize * 0.35;
const csv = (s: string) => s.split(",").map((t) => t.trim()).filter(Boolean);

// ── PixelButton ────────────────────────────────────────────────────────────

const BUTTON_SIZES = {
  sm: { padX: 12, padY: 8, font: 14 },
  md: { padX: 16, padY: 12, font: 16 },
  lg: { padX: 24, padY: 16, font: 18 },
} as const;

export function SvgPixelButton({ label, color, textColor, size, state, width = 0 }: {
  label: string; color: string; textColor: string; size: keyof typeof BUTTON_SIZES; state: "normal" | "pressed" | "disabled"; width?: number;
}) {
  const s = BUTTON_SIZES[size];
  const w = width > 0 ? width : Math.ceil(textWidth(label, MONO, s.font) + s.padX * 2 + 8);
  const h = Math.max(44, Math.round(s.font * 1.5 + s.padY * 2 + 8));
  const disabled = state === "disabled";
  const pressed = state === "pressed";
  return (
    <svg width={w + 4} height={h + 4} viewBox={`0 0 ${w + 4} ${h + 4}`} shapeRendering="crispEdges">
      <FontDefs />
      {!pressed && !disabled && <rect x={4} y={4} width={w} height={h} fill="#0a0e1a" />}
      <g transform={pressed ? "translate(4 4)" : undefined}>
        <rect width={w} height={h} fill={disabled ? "#1a2340" : "#0a0e1a"} />
        <rect x={4} y={4} width={w - 8} height={h - 8} fill={disabled ? "#2a3a5c" : color} />
        <text x={w / 2} y={mid(h / 2, s.font)} textAnchor="middle" fontFamily={MONO} fontSize={s.font} fill={disabled ? "#6b8ba4" : textColor}>{label}</text>
      </g>
    </svg>
  );
}

// ── PixelPanel / Section ───────────────────────────────────────────────────

function SvgPanel({ width, height, accent, title, titleColor, body }: {
  width: number; height: number; accent: string; title: string; titleColor: string; body: string;
}) {
  const lines = body.split("\n").filter((l) => l.trim());
  return (
    <svg width={width + 4} height={height + 4} viewBox={`0 0 ${width + 4} ${height + 4}`} shapeRendering="crispEdges">
      <FontDefs />
      <rect x={4} y={4} width={width} height={height} fill={accent} />
      <rect width={width} height={height} fill={accent} />
      <rect x={4} y={4} width={width - 8} height={height - 8} fill="#111827" />
      {title && <text x={20} y={20 + 18 * 0.8} fontFamily={MONO} fontSize={18} fill={titleColor}>{title}</text>}
      {lines.map((line, i) => (
        <text key={i} x={20} y={(title ? 52 : 20) + 14 * 0.8 + i * 21} fontFamily={MONO} fontSize={14} fill="#9bb0c8">{line}</text>
      ))}
    </svg>
  );
}

function SvgSection({ width, height, title, note, accent }: { width: number; height: number; title: string; note: string; accent: string }) {
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} shapeRendering="crispEdges">
      <FontDefs />
      <rect width={width} height={height} fill="#2a3a5c" />
      <rect x={3} y={3} width={width - 6} height={height - 6} fill="#111827" />
      <text x={15} y={15 + 18 * 0.8} fontFamily={MONO} fontSize={18} fill={accent} letterSpacing={1}>{title}</text>
      {note && <text x={15} y={45 + 9} fontFamily={MONO} fontSize={9} fill="#6b8ba4">{note}</text>}
    </svg>
  );
}

// ── Toggles ────────────────────────────────────────────────────────────────

function SvgPixelToggle({ on, color }: { on: boolean; color: string }) {
  const shadow = on ? 3 : 2;
  return (
    <svg width={88 + 3} height={44 + 3} viewBox="0 0 91 47" shapeRendering="crispEdges">
      <FontDefs />
      <rect x={shadow} y={shadow} width={88} height={44} fill={on ? "#0a0e1a" : "#111111"} />
      <rect width={88} height={44} fill={on ? "#0a0e1a" : "#1a2340"} />
      <rect x={3} y={3} width={82} height={38} fill={on ? color : "#2a3a5c"} />
      <rect x={3 + (on ? 55 : 4)} y={3 + 8} width={22} height={22} fill={on ? "#0a0e1a" : "#6b8ba4"} />
      <text x={on ? 11 : 77} y={mid(22, 14)} textAnchor={on ? "start" : "end"} fontFamily={MONO} fontSize={14} fill={on ? "#0a0e1a" : "#e8f4f8"}>{on ? "ON" : "OFF"}</text>
    </svg>
  );
}

function SvgToggleSwitch({ on, color }: { on: boolean; color: string }) {
  return (
    <svg width={47} height={27} viewBox="0 0 47 27" shapeRendering="crispEdges">
      <rect x={3} y={3} width={44} height={24} fill="#0a0e1a" />
      <rect width={44} height={24} fill="#0a0e1a" />
      <rect x={3} y={3} width={38} height={18} fill={on ? color : "#2a3a5c"} />
      <rect x={3 + (on ? 18 : 2)} y={3 + 2} width={16} height={14} fill={on ? "#0a0e1a" : "#6b8ba4"} />
    </svg>
  );
}

// ── XP bar / radio / tabs / header ─────────────────────────────────────────

function SvgXPBar({ width, current, max, color }: { width: number; current: number; max: number; color: string }) {
  const inner = width - 6;
  const pct = Math.min(Math.max(current / Math.max(max, 1), 0), 1);
  return (
    <svg width={width} height={16} viewBox={`0 0 ${width} 16`} shapeRendering="crispEdges">
      <rect width={width} height={16} fill="#2a3a5c" />
      <rect x={3} y={3} width={inner} height={10} fill="#0a0e1a" />
      {pct > 0 && <rect x={3} y={3} width={Math.round(inner * pct * 100) / 100} height={10} fill={color} />}
    </svg>
  );
}

function SvgPixelRadio({ options, selected, color }: { options: string; selected: number; color: string }) {
  const items = csv(options);
  const rowH = 21;
  const width = Math.ceil(14 + 8 + Math.max(0, ...items.map((o) => textWidth(o, MONO, 14))));
  const height = items.length * rowH + Math.max(0, items.length - 1) * 12;
  return (
    <svg width={width} height={Math.max(height, 1)} viewBox={`0 0 ${width} ${Math.max(height, 1)}`} shapeRendering="crispEdges">
      <FontDefs />
      {items.map((opt, i) => {
        const y = i * (rowH + 12);
        const on = i === selected;
        const by = y + (rowH - 14) / 2;
        return (
          <g key={i}>
            <rect x={0} y={by} width={14} height={14} fill={on ? color : "#2a3a5c"} />
            <rect x={3} y={by + 3} width={8} height={8} fill={on ? color : "#0a0e1a"} />
            {on && <rect x={4} y={by + 4} width={6} height={6} fill="#0a0e1a" />}
            <text x={22} y={mid(y + rowH / 2, 14)} fontFamily={MONO} fontSize={14} fill={on ? color : "#6b8ba4"}>{opt}</text>
          </g>
        );
      })}
    </svg>
  );
}

function SvgTabBar({ labels, active, accent, width }: { labels: string; active: number; accent: string; width: number }) {
  const items = csv(labels);
  const n = Math.max(items.length, 1);
  const h = 3 + 10 + 17 + 10 + 4 + 3;
  const innerW = width - 6;
  const cell = innerW / n;
  return (
    <svg width={width} height={h} viewBox={`0 0 ${width} ${h}`} shapeRendering="crispEdges">
      <FontDefs />
      <rect width={width} height={h} fill="#2a3a5c" />
      <rect x={3} y={3} width={innerW} height={h - 6} fill="#0a0e1a" />
      {items.map((label, i) => {
        const x = 3 + i * cell;
        const on = i === active;
        return (
          <g key={i}>
            {on && <rect x={x} y={3} width={cell} height={h - 6} fill="#1a2340" />}
            {on && <rect x={x} y={h - 3 - 4} width={cell} height={4} fill={accent} />}
            {i < items.length - 1 && <rect x={x + cell - 2} y={3} width={2} height={h - 6} fill="#2a3a5c" />}
            <text x={x + cell / 2} y={mid(3 + 10 + 8.5, 14)} textAnchor="middle" fontFamily={MONO} fontSize={14} fill={on ? "#ffffff" : "#7f93a8"}>{label}</text>
          </g>
        );
      })}
    </svg>
  );
}

function SvgSubPageHeader({ width, title, titleColor, showBack }: { width: number; title: string; titleColor: string; showBack: boolean }) {
  const h = 56;
  const titleX = showBack ? 16 + 4 + textWidth("< BACK", MONO, 14) + 4 + 12 : 16;
  return (
    <svg width={width} height={h} viewBox={`0 0 ${width} ${h}`} shapeRendering="crispEdges">
      <FontDefs />
      <rect width={width} height={h} fill="#0a0e1a" />
      <rect y={h - 4} width={width} height={4} fill="#2a3a5c" />
      {showBack && <text x={20} y={mid(26, 14)} fontFamily={MONO} fontSize={14} fill="#9bb0c8">{"< BACK"}</text>}
      <text x={titleX} y={mid(26, 14)} fontFamily={PIXEL} fontSize={14} fill={titleColor}>{title}</text>
    </svg>
  );
}

const TITLE_DOTS = ["#ff6b35", "#ffe66d", "#00ff88", "#4ecdc4", "#ff2d55"];

function SvgColorDots({ size, gap }: { size: number; gap: number }) {
  const w = TITLE_DOTS.length * size + (TITLE_DOTS.length - 1) * gap;
  return (
    <svg width={w} height={size} viewBox={`0 0 ${w} ${size}`} shapeRendering="crispEdges">
      {TITLE_DOTS.map((c, i) => <rect key={c} x={i * (size + gap)} width={size} height={size} fill={c} />)}
    </svg>
  );
}

function SvgSafetyBadge({ safe, size }: { safe: boolean; size: number }) {
  const color = safe ? "#00ff88" : "#ff2d55";
  const label = safe ? "SAFE" : "SCAMMED";
  const font = Math.max(8, Math.round(size * 0.5));
  const labelW = textWidth(label, MONO, font, 0.5);
  const iconH = (size * 14) / 12;
  const w = Math.ceil(Math.max(size, labelW) + 16);
  const h = Math.ceil(8 + iconH + 3 + font * 1.2 + 4);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <FontDefs />
      <defs>
        <filter id="badge-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx={0} dy={0} stdDeviation={4} floodColor={color} floodOpacity={0.8} />
        </filter>
      </defs>
      <g transform={`translate(${(w - size) / 2} 8)`} filter="url(#badge-glow)">
        <IconShield size={size} color={color} />
      </g>
      <text x={w / 2} y={8 + iconH + 3 + font * 0.85} textAnchor="middle" fontFamily={MONO} fontSize={font} letterSpacing={0.5} fill={color}>{label}</text>
    </svg>
  );
}

// ── Registry ───────────────────────────────────────────────────────────────

const chips = (pairs: Array<[string, string]>): ChoiceOption[] => pairs.map(([value, label]) => ({ value, label }));

export const UI_ASSETS: AssetDef[] = [
  asset({
    id: "ui-pixel-button",
    name: "Pixel Button",
    group: "BUTTONS",
    defaults: { label: "[ PRESS START ]", color: "#00ff88", textColor: "#0a0e1a", size: "lg", state: "normal", width: 0 },
    controls: [
      { kind: "text", key: "label", label: "LABEL", maxLength: 60 },
      { kind: "choice", key: "size", label: "SIZE", options: chips([["sm", "SMALL"], ["md", "MEDIUM"], ["lg", "LARGE"]]), style: "chips", columns: 3 },
      { kind: "number", key: "width", label: "FIXED WIDTH (0 = FIT LABEL)", min: 0, max: 1200 },
      { kind: "color", key: "color", label: "BUTTON COLOUR" },
      { kind: "color", key: "textColor", label: "TEXT COLOUR" },
      { kind: "choice", key: "state", label: "STATE", options: chips([["normal", "NORMAL"], ["pressed", "PRESSED"], ["disabled", "DISABLED"]]), style: "chips", columns: 3 },
    ],
    render: (p) => <SvgPixelButton {...(p as Parameters<typeof SvgPixelButton>[0])} />,
    filename: (p) => slug("button", p.label, p.size, p.state !== "normal" && p.state),
    note: "Text is kept as live SVG text in Share Tech Mono, linked from Google Fonts.",
  }),
  asset({
    id: "ui-pixel-panel",
    name: "Pixel Panel",
    group: "PANELS",
    defaults: { width: 320, height: 160, accent: "#2a3a5c", title: "PIXEL PANEL", titleColor: "#4ecdc4", body: "Panels hold grouped content.\nBorder and shadow use the accent." },
    controls: [
      { kind: "number", key: "width", label: "WIDTH", min: 40, max: 2000 },
      { kind: "number", key: "height", label: "HEIGHT", min: 40, max: 2000 },
      { kind: "color", key: "accent", label: "ACCENT" },
      { kind: "text", key: "title", label: "TITLE", maxLength: 40 },
      { kind: "color", key: "titleColor", label: "TITLE COLOUR" },
      { kind: "text", key: "body", label: "BODY TEXT", multiline: true },
    ],
    render: (p) => <SvgPanel {...(p as Parameters<typeof SvgPanel>[0])} />,
    filename: (p) => slug("panel", p.title || "blank", `${p.width}x${p.height}`),
  }),
  asset({
    id: "ui-section",
    name: "Section Card",
    group: "PANELS",
    defaults: { width: 358, height: 120, title: "HAIR COLOUR", note: "", accent: "#c77dff" },
    controls: [
      { kind: "number", key: "width", label: "WIDTH", min: 40, max: 2000 },
      { kind: "number", key: "height", label: "HEIGHT", min: 40, max: 2000 },
      { kind: "text", key: "title", label: "TITLE", maxLength: 40 },
      { kind: "text", key: "note", label: "NOTE", maxLength: 80 },
      { kind: "color", key: "accent", label: "TITLE COLOUR" },
    ],
    render: (p) => <SvgSection {...(p as Parameters<typeof SvgSection>[0])} />,
    filename: (p) => slug("section", p.title || "blank"),
    note: "The card used on the avatar customisation screen.",
  }),
  asset({
    id: "ui-tab-bar",
    name: "Tab Bar",
    group: "NAVIGATION",
    defaults: { labels: "SKIN, HAIR, OUTFIT, EXTRAS, GLOW", active: 0, accent: "#c77dff", width: 358 },
    controls: [
      { kind: "text", key: "labels", label: "TABS (COMMA SEPARATED)" },
      { kind: "number", key: "active", label: "ACTIVE TAB (0 = FIRST)", min: 0, max: 20 },
      { kind: "number", key: "width", label: "WIDTH", min: 80, max: 2000 },
      { kind: "color", key: "accent", label: "ACCENT" },
    ],
    render: (p) => <SvgTabBar {...(p as Parameters<typeof SvgTabBar>[0])} />,
    filename: (p) => slug("tab-bar", csv(p.labels)[p.active] ?? "tabs"),
  }),
  asset({
    id: "ui-subpage-header",
    name: "Sub-page Header",
    group: "NAVIGATION",
    defaults: { width: 390, title: "AVATAR", titleColor: "#c77dff", showBack: true },
    controls: [
      { kind: "text", key: "title", label: "TITLE", maxLength: 40 },
      { kind: "color", key: "titleColor", label: "TITLE COLOUR" },
      { kind: "number", key: "width", label: "WIDTH", min: 120, max: 2000 },
      { kind: "toggle", key: "showBack", label: "SHOW < BACK" },
    ],
    render: (p) => <SvgSubPageHeader {...(p as Parameters<typeof SvgSubPageHeader>[0])} />,
    filename: (p) => slug("header", p.title),
  }),
  asset({
    id: "ui-pixel-toggle",
    name: "Pixel Toggle",
    group: "CONTROLS",
    defaults: { on: true, color: "#00ff88" },
    controls: [{ kind: "toggle", key: "on", label: "ON" }, { kind: "color", key: "color", label: "ON COLOUR" }],
    render: (p) => <SvgPixelToggle on={p.on} color={p.color} />,
    filename: (p) => slug("toggle", p.on ? "on" : "off"),
  }),
  asset({
    id: "ui-toggle-switch",
    name: "Toggle Switch",
    group: "CONTROLS",
    defaults: { on: true, color: "#00ff88" },
    controls: [{ kind: "toggle", key: "on", label: "ON" }, { kind: "color", key: "color", label: "ON COLOUR" }],
    render: (p) => <SvgToggleSwitch on={p.on} color={p.color} />,
    filename: (p) => slug("switch", p.on ? "on" : "off"),
  }),
  asset({
    id: "ui-pixel-radio",
    name: "Pixel Radio",
    group: "CONTROLS",
    defaults: { options: "DAILY, WEEKLY, MONTHLY", selected: 0, color: "#00ff88" },
    controls: [
      { kind: "text", key: "options", label: "OPTIONS (COMMA SEPARATED)" },
      { kind: "number", key: "selected", label: "SELECTED (0 = FIRST)", min: -1, max: 20 },
      { kind: "color", key: "color", label: "SELECTED COLOUR" },
    ],
    render: (p) => <SvgPixelRadio options={p.options} selected={p.selected} color={p.color} />,
    filename: (p) => slug("radio", csv(p.options)[p.selected] ?? "none"),
  }),
  asset({
    id: "ui-xp-bar",
    name: "XP Bar",
    group: "PROGRESS",
    defaults: { width: 240, current: 65, max: 100, color: "#00ff88" },
    controls: [
      { kind: "number", key: "width", label: "WIDTH", min: 20, max: 2000 },
      { kind: "number", key: "current", label: "CURRENT", min: 0, max: 100000 },
      { kind: "number", key: "max", label: "MAX", min: 1, max: 100000 },
      { kind: "color", key: "color", label: "FILL COLOUR" },
    ],
    render: (p) => <SvgXPBar {...(p as Parameters<typeof SvgXPBar>[0])} />,
    filename: (p) => slug("xp-bar", `${Math.round((p.current / p.max) * 100)}pct`),
  }),
  asset({
    id: "ui-safety-badge",
    name: "Safety Badge",
    group: "PROGRESS",
    defaults: { safe: true, size: 20 },
    controls: [{ kind: "size", key: "size", label: "SHIELD SIZE", min: 8, max: 256 }, { kind: "toggle", key: "safe", label: "SAFE" }],
    render: (p) => <SvgSafetyBadge safe={p.safe} size={p.size} />,
    filename: (p) => slug("safety-badge", p.safe ? "safe" : "scammed"),
    // Keeps the shield's glow, which reaches past the shape.
    canvas: "original",
  }),
  asset({
    id: "ui-color-dots",
    name: "Colour Dots",
    group: "DECOR",
    defaults: { size: 8, gap: 8 },
    controls: [{ kind: "size", key: "size", label: "DOT SIZE", min: 2, max: 128 }, { kind: "number", key: "gap", label: "GAP", min: 0, max: 128 }],
    render: (p) => <SvgColorDots size={p.size} gap={p.gap} />,
    filename: (p) => slug("color-dots", p.size),
    note: "The five-colour strip under the title screen logo.",
  }),
];
