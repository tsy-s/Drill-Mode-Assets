import type { ReactNode } from "react";
import { PixelMascot } from "../vendor/avatars/PixelMascot";
import { MascotHead } from "./MascotHead";
import { FontDefs, SvgPixelButton } from "./ui";
import { asset, type AssetDef, type ChoiceOption } from "../lib/types";
import { slug } from "../lib/svg";
import { MONO, PIXEL, VT, textWidth } from "../lib/text";

// Art pulled out of the app's screens, redrawn as standalone SVG.

/** "#ffffff09"-style CSS colours → fill + opacity, which every SVG editor understands. */
function rgba(hex8: string): { fill: string; fillOpacity?: number } {
  if (hex8.length === 9) return { fill: hex8.slice(0, 7), fillOpacity: Math.round((parseInt(hex8.slice(7), 16) / 255) * 1000) / 1000 };
  return { fill: hex8 };
}

// ── Stars (components/layout/Stars.tsx) ────────────────────────────────────

function starfield(width: number, height: number, count: number, idPrefix = "") {
  return Array.from({ length: count }, (_, i) => {
    const s = i % 3 === 0 ? 2 : 1;
    return (
      <rect
        key={`${idPrefix}${i}`}
        x={Math.round(((i * 137.5) % 100) / 100 * width * 10) / 10}
        y={Math.round(((i * 73.1) % 100) / 100 * height * 10) / 10}
        width={s}
        height={s}
        fill="#ffffff"
        fillOpacity={Math.round((0.3 + (i % 4) * 0.15) * 100) / 100}
      />
    );
  });
}

function Starfield({ width, height, count, background }: { width: number; height: number; count: number; background: string }) {
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} shapeRendering="crispEdges">
      <rect width={width} height={height} fill={background} />
      {starfield(width, height, count)}
    </svg>
  );
}

// ── DRILL MODE wordmark (screens/title/TitleScreen.tsx) ────────────────────

function Wordmark({ lines, x, y, fontSize, color, glitch, anchor = "middle", id }: {
  lines: string[]; x: number; y: number; fontSize: number; color: string; glitch: boolean; anchor?: "middle" | "start"; id: string;
}) {
  const lineH = fontSize * 1.3;
  const text = (dx: number, dy: number, fill: string, extra: Record<string, unknown> = {}) => (
    <text x={x + dx} y={y + dy} textAnchor={anchor} fontFamily={PIXEL} fontSize={fontSize} letterSpacing={2} fill={fill} {...extra}>
      {lines.map((line, i) => <tspan key={i} x={x + dx} dy={i === 0 ? 0 : lineH}>{line}</tspan>)}
    </text>
  );
  return glitch ? (
    <g>
      {text(4, 0, "#ff2d55")}
      {text(-4, 0, "#4ecdc4")}
      {text(0, 0, color)}
    </g>
  ) : (
    <g>
      <defs>
        <filter id={id} x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation={8} />
        </filter>
      </defs>
      {text(0, 0, color, { filter: `url(#${id})`, fillOpacity: 0.5 })}
      {text(4, 4, "#006633")}
      {text(0, 0, color)}
    </g>
  );
}

function LogoLockup({ size, color, mascotColor, glitch, text }: { size: number; color: string; mascotColor: string; glitch: boolean; text: string }) {
  const font = size;
  const headW = font * 1.6;
  const headH = headW * 0.9;
  const gap = font * 0.6;
  const textW = textWidth(text, PIXEL, font, 2);
  const pad = 6;
  const w = Math.ceil(pad + headW + gap + textW + pad + 4);
  const h = Math.ceil(Math.max(headH, font * 1.3) + pad * 2 + 4);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <FontDefs />
      <g transform={`translate(${pad} ${(h - headH) / 2})`}>
        <MascotHead size={headW} color={mascotColor} />
      </g>
      <Wordmark lines={[text]} x={pad + headW + gap} y={h / 2 + font / 2} fontSize={font} color={color} glitch={glitch} anchor="start" id="logo-glow" />
    </svg>
  );
}

function TitleScreen({ width, height, background, stars, titleColor, subtitle, tagline1, tagline2, mascotColor, mascotHead, button, glitch, footer }: {
  width: number; height: number; background: string; stars: boolean; titleColor: string; subtitle: string;
  tagline1: string; tagline2: string; mascotColor: string; mascotHead: string; button: string; glitch: boolean; footer: string;
}) {
  const cx = width / 2;
  const hero = 28;
  const titleTop = 40 + 32 + hero;
  const subY = titleTop + hero * 1.3 + 8 + 14;
  const dotsY = subY + 14;
  const mascot = 128;
  const midY = height / 2 - 40;
  const btnLabel = button;
  const btnW = Math.ceil(textWidth(btnLabel, MONO, 18) + 48 + 8);
  const btnH = Math.max(44, Math.round(18 * 1.5 + 32 + 8));
  const footerY = height - 40 - 16;
  const btnY = footerY - 14 - 24 - btnH;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} shapeRendering="crispEdges">
      <FontDefs />
      <rect width={width} height={height} fill={background} />
      {stars && starfield(width, height, 40)}
      <Wordmark lines={["DRILL", "MODE"]} x={cx} y={titleTop} fontSize={hero} color={titleColor} glitch={glitch} id="title-glow" />
      <text x={cx} y={subY} textAnchor="middle" fontFamily={PIXEL} fontSize={14} letterSpacing={3} fill="#4ecdc4">{subtitle}</text>
      {["#ff6b35", "#ffe66d", "#00ff88", "#4ecdc4", "#ff2d55"].map((c, i) => (
        <rect key={c} x={cx - (5 * 8 + 4 * 8) / 2 + i * 16} y={dotsY} width={8} height={8} fill={c} />
      ))}
      <g transform={`translate(${cx - mascot / 2} ${midY - mascot / 2})`}>
        <PixelMascot size={mascot} color={mascotColor} separated={mascotHead === "separated"} />
      </g>
      <text x={cx} y={midY + mascot / 2 + 16 + 20} textAnchor="middle" fontFamily={VT} fontSize={20} fill="#ffe66d">
        <tspan x={cx}>{tagline1}</tspan>
        <tspan x={cx} dy={30}>{tagline2}</tspan>
      </text>
      <g transform={`translate(${cx - btnW / 2} ${btnY})`}>
        <SvgPixelButton label={btnLabel} color="#00ff88" textColor="#0a0e1a" size="lg" state="normal" />
      </g>
      <text x={cx} y={footerY + 10} textAnchor="middle" fontFamily={MONO} fontSize={14} fill="#2a3a5c">{footer}</text>
    </svg>
  );
}

// ── Room backdrop (components/room/RoomBackdrop.tsx + styles/room-style.css) ─

const WALL_COLORS = [
  { id: "midnight", name: "MIDNIGHT", color: "#101b32" },
  { id: "violet", name: "VIOLET", color: "#211733" }, { id: "lagoon", name: "LAGOON", color: "#0c292e" },
  { id: "rose", name: "ROSE", color: "#301729" }, { id: "forest", name: "FOREST", color: "#12291f" },
  { id: "auto", name: "CUSTOM", color: "" },
];
const WALL_PATTERNS = [
  { id: "grid", name: "PIXEL GRID" }, { id: "plain", name: "SOLID" }, { id: "stripes", name: "STRIPES" },
  { id: "stars", name: "PIXEL STARS" }, { id: "brick", name: "BRICK" }, { id: "hex", name: "HONEYCOMB" }, { id: "circuit", name: "CIRCUIT" },
];
const FLOORS = [
  { id: "original", name: "ORIGINAL", color: "" }, { id: "oak", name: "DARK OAK", color: "#3c2d32" },
  { id: "tile", name: "SLATE TILES", color: "#273348" }, { id: "checker", name: "ARCADE CHECKS", color: "#302342" },
  { id: "carpet", name: "SOFT CARPET", color: "#253d43" }, { id: "concrete", name: "CONCRETE", color: "#2c2f36" },
  { id: "neon", name: "NEON GRID", color: "#0d1f2e" }, { id: "metal", name: "BRUSHED METAL", color: "#33383f" },
  { id: "custom", name: "CUSTOM", color: "" },
];
const ROOM_LIGHTS = [
  { id: "mint", name: "MINT", color: "#4ecdc4" },
  { id: "green", name: "ELECTRIC GREEN", color: "#00ff88" }, { id: "pink", name: "HOT PINK", color: "#ff71c5" },
  { id: "purple", name: "LILAC", color: "#c77dff" }, { id: "gold", name: "GOLD", color: "#ffe66d" },
  { id: "auto", name: "CUSTOM", color: "" },
];
const opts = (items: Array<{ id: string; name: string; color?: string }>): ChoiceOption[] =>
  items.map((i) => ({ value: i.id, label: i.name, swatch: i.color || undefined }));

function Lines({ size, color, vertical = true, horizontal = true, thickness = 1, w, h }: {
  size?: number; color: string; vertical?: boolean; horizontal?: boolean; thickness?: number; w?: number; h?: number;
}) {
  const tw = w ?? size ?? 16;
  const th = h ?? size ?? 16;
  const c = rgba(color);
  return (
    <>
      {horizontal && <rect width={tw} height={thickness} {...c} />}
      {vertical && <rect width={thickness} height={th} {...c} />}
    </>
  );
}

function wallPattern(id: string, pid: string): { def: ReactNode; extra?: ReactNode } | null {
  const pat = (w: number, h: number, children: ReactNode, x = 0, y = 0) => (
    <pattern id={pid} width={w} height={h} x={x} y={y} patternUnits="userSpaceOnUse">{children}</pattern>
  );
  switch (id) {
    case "grid": return { def: pat(16, 16, <Lines size={16} color="#ffffff09" />) };
    case "stripes": return { def: pat(24, 24, <rect x={20} width={4} height={24} {...rgba("#ffffff08")} />) };
    case "brick": return {
      def: pat(32, 16, <>
        <rect y={14} width={32} height={2} {...rgba("#0a0e1a55")} />
        <rect x={14} width={2} height={14} {...rgba("#0a0e1a44")} />
      </>),
    };
    case "hex": return {
      def: pat(22, 38, <>
        <polygon points="0,0 11,0 0,19" {...rgba("#ffffff0a")} />
        <polygon points="22,0 22,19 11,0" {...rgba("#ffffff0a")} />
        <polygon points="0,38 0,19 11,38" {...rgba("#ffffff0a")} />
        <polygon points="22,38 11,38 22,19" {...rgba("#ffffff0a")} />
      </>),
    };
    case "circuit": return {
      def: pat(24, 24, <>
        <Lines size={24} color="#00ff8816" />
        <circle cx={12} cy={12} r={1.5} {...rgba("#00ff8840")} />
      </>),
    };
    default: return null;
  }
}

function floorPattern(id: string, pid: string): ReactNode | null {
  const pat = (w: number, h: number, children: ReactNode, transform?: string) => (
    <pattern id={pid} width={w} height={h} patternUnits="userSpaceOnUse" patternTransform={transform}>{children}</pattern>
  );
  switch (id) {
    case "oak": return pat(49, 17, <>
      <rect y={15} width={49} height={2} {...rgba("#0a0e1a55")} />
      <rect x={47} width={2} height={17} {...rgba("#0a0e1a33")} />
    </>);
    case "tile": return pat(24, 18, <Lines w={24} h={18} color="#ffffff14" />);
    case "checker": return pat(32, 32, <>
      <rect x={16} width={16} height={16} {...rgba("#ffffff0d")} />
      <rect y={16} width={16} height={16} {...rgba("#ffffff0d")} />
    </>);
    case "carpet": return pat(4, 4, <rect x={3} width={1} height={4} {...rgba("#ffffff06")} />, "rotate(45)");
    case "concrete": return pat(18, 36, <>
      {[0, 6, 12].flatMap((x) => [0, 6, 12, 18, 24, 30].map((y) => <rect key={`a${x}-${y}`} x={x} y={y} width={1} height={1} {...rgba("#ffffff12")} />))}
      {[3, 12].flatMap((x) => [4, 13, 22, 31].map((y) => <rect key={`b${x}-${y}`} x={x} y={y} width={1} height={1} {...rgba("#00000024")} />))}
    </>);
    case "neon": return pat(20, 20, <Lines size={20} color="#4ecdc433" />);
    case "metal": return pat(6, 6, <rect width={2} height={6} {...rgba("#ffffff0d")} />, "rotate(25)");
    default: return null;
  }
}

function RoomBackdrop({ width, height, background, accent, floorColor: customFloor, wall, pattern, floor, light, glow }: {
  width: number; height: number; background: string; accent: string; floorColor: string; wall: string; pattern: string; floor: string; light: string; glow: boolean;
}) {
  const wallColor = WALL_COLORS.find((o) => o.id === wall)?.color || background;
  const lightColor = ROOM_LIGHTS.find((o) => o.id === light)?.color || accent;
  const floorColor = floor === "custom" ? customFloor : FLOORS.find((o) => o.id === floor)?.color || background;
  const wallPat = wallPattern(pattern, "room-wall-pattern");
  const floorPat = floorPattern(floor, "room-floor-pattern");
  const floorY = Math.round(height * 0.64);
  const starsH = height * 0.66;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} shapeRendering="crispEdges">
      <defs>
        {wallPat?.def}
        {floorPat}
        {glow && (
          <filter id="room-glow" x="-10%" y="-800%" width="120%" height="1700%">
            <feGaussianBlur stdDeviation={6} result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        )}
      </defs>
      <rect width={width} height={height} fill={wallColor} />
      {wallPat && <rect width={width} height={height} fill="url(#room-wall-pattern)" />}
      {pattern === "stars" && Array.from({ length: 15 }, (_, i) => {
        const x = Math.round(((5 + (i * 37) % 90) / 100) * width);
        const y = Math.round(((10 + (i * 23) % 75) / 100) * starsH);
        return (
          <g key={i} fill={lightColor} fillOpacity={0.45}>
            <rect x={x} y={y} width={2} height={6} />
            <rect x={x - 2} y={y + 2} width={6} height={2} />
          </g>
        );
      })}
      {floor !== "original" && (
        <g>
          <rect y={floorY} width={width} height={height - floorY} fill={floorColor} />
          {floorPat && <rect y={floorY} width={width} height={height - floorY} fill="url(#room-floor-pattern)" />}
          <rect y={floorY} width={width} height={4} {...rgba("#ffffff12")} />
        </g>
      )}
      {glow && (
        <rect x={Math.round(width * 0.04)} y={Math.round(height * 0.02)} width={Math.round(width * 0.92)} height={3} fill={lightColor} fillOpacity={0.85} filter="url(#room-glow)" />
      )}
    </svg>
  );
}

// ── Small screen art ───────────────────────────────────────────────────────

function PixelPhone({ size, ringing }: { size: number; ringing: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" shapeRendering="crispEdges" style={{ imageRendering: "pixelated" }}>
      <rect x={16} y={8} width={48} height={64} fill="#2a3a5c" />
      <rect x={20} y={12} width={40} height={56} fill="#111827" />
      <rect x={24} y={16} width={32} height={40} fill="#1a2340" />
      <rect x={28} y={60} width={24} height={4} fill="#2a3a5c" />
      <rect x={34} y={62} width={12} height={2} fill="#4ecdc4" />
      {ringing && (
        <>
          <rect x={8} y={24} width={4} height={4} fill="#ffe66d" />
          <rect x={68} y={24} width={4} height={4} fill="#ffe66d" />
          <rect x={8} y={32} width={4} height={4} fill="#ffe66d" />
          <rect x={68} y={32} width={4} height={4} fill="#ffe66d" />
        </>
      )}
    </svg>
  );
}

function HouseRoof({ width, title, showTitle }: { width: number; title: string; showTitle: boolean }) {
  const sx = width / 390;
  return (
    <svg width={width} height={52} viewBox={`0 0 ${width} 52`}>
      <FontDefs />
      <rect width={width} height={52} fill="#0a0e1a" />
      <g transform={`scale(${sx} 1)`} shapeRendering="crispEdges">
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x={i * 16} y={48 - (12 - i) * 4} width={390 - i * 32} height={(12 - i) * 4} fill="#1a2a3a" fillOpacity={0.9} />
        ))}
        <polyline points="0,48 195,4 390,48" fill="none" stroke="#2a3a5c" strokeWidth={3} vectorEffect="non-scaling-stroke" />
        <rect x={280} y={10} width={20} height={24} fill="#2a3a5c" />
        <rect x={278} y={8} width={24} height={6} fill="#3a4a6c" />
        <rect x={283} y={2} width={4} height={4} fill="#4a5a7c" fillOpacity={0.5} />
      </g>
      <rect y={48} width={width} height={4} fill="#2a3a5c" />
      {showTitle && <text x={width / 2} y={48 - 6 - 3} textAnchor="middle" fontFamily={MONO} fontSize={14} letterSpacing={1} fill="#4ecdc4">{title}</text>}
    </svg>
  );
}

function DollhouseWindow({ size, accent }: { size: number; accent: string }) {
  return (
    <svg width={size} height={(size * 8) / 7} viewBox="0 0 7 8" shapeRendering="crispEdges" style={{ imageRendering: "pixelated" }}>
      <rect x={0} y={0} width={7} height={8} fill="#2a3a5c" />
      <rect x={1} y={1} width={2} height={3} fill={accent} fillOpacity={0.12} />
      <rect x={4} y={1} width={2} height={3} fill={accent} fillOpacity={0.08} />
      <rect x={1} y={5} width={2} height={2} fill="#1a2a4a" />
      <rect x={4} y={5} width={2} height={2} fill="#1a2a4a" />
    </svg>
  );
}

function Crown({ size }: { size: number }) {
  return (
    <svg width={size} height={size * 0.75} viewBox="0 0 8 6" shapeRendering="crispEdges" style={{ imageRendering: "pixelated" }}>
      <rect x={0} y={1} width={1} height={4} fill="#ffe66d" />
      <rect x={7} y={1} width={1} height={4} fill="#ffe66d" />
      <rect x={3} y={0} width={2} height={5} fill="#ffe66d" />
      <rect x={1} y={3} width={6} height={3} fill="#ffe66d" />
      <rect x={3} y={4} width={2} height={1} fill="#ff2d55" />
    </svg>
  );
}

/** screens/house/FamilyTreeScreen.tsx: square = male, circle = female, triangle = other, rounded = not set. */
function TreeNode({ size, gender, stroke, fill, strokeWidth, dashed }: {
  size: number; gender: string; stroke: string; fill: string; strokeWidth: number; dashed: boolean;
}) {
  const c = size / 2;
  const w = strokeWidth;
  const common = { fill, stroke, strokeWidth: w, strokeDasharray: dashed ? "4 3" : undefined };
  const square = size * 0.84;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {gender === "female" ? <circle cx={c} cy={c} r={c - w / 2} {...common} />
        : gender === "other" ? <polygon points={`${c},${w} ${size - w / 2},${size - w / 2} ${w / 2},${size - w / 2}`} strokeLinejoin="round" {...common} />
        : <rect x={c - square / 2} y={c - square / 2} width={square} height={square} rx={gender === "unset" ? 6 : 0} {...common} />}
    </svg>
  );
}

// ── Registry ───────────────────────────────────────────────────────────────

export const SCREEN_ASSETS: AssetDef[] = [
  asset({
    id: "screen-title",
    name: "Title Screen",
    group: "SCREENS",
    defaults: {
      width: 390, height: 844, background: "#0a0e1a", stars: true, titleColor: "#00ff88", subtitle: "SCAM FIGHTER",
      tagline1: "DEFEND YOUR MIND.", tagline2: "DEFEAT THE SCAMMERS.", mascotColor: "#4ecdc4", mascotHead: "separated", button: "[ PRESS START ]",
      glitch: false, footer: "v2.0.0 © 2026 DRILL MODE",
    },
    controls: [
      { kind: "number", key: "width", label: "WIDTH", min: 320, max: 1600 },
      { kind: "number", key: "height", label: "HEIGHT", min: 560, max: 2400 },
      { kind: "color", key: "background", label: "BACKGROUND" },
      { kind: "toggle", key: "stars", label: "STARS" },
      { kind: "color", key: "titleColor", label: "TITLE COLOUR" },
      { kind: "toggle", key: "glitch", label: "GLITCH FRAME" },
      { kind: "text", key: "subtitle", label: "SUBTITLE", maxLength: 30 },
      { kind: "color", key: "mascotColor", label: "PIXI COLOUR" },
      {
        kind: "choice", key: "mascotHead", label: "PIXI HEAD", style: "chips", columns: 2,
        options: [{ value: "separated", label: "SEPARATED" }, { value: "attached", label: "ATTACHED" }],
      },
      { kind: "text", key: "tagline1", label: "TAGLINE LINE 1", maxLength: 40 },
      { kind: "text", key: "tagline2", label: "TAGLINE LINE 2", maxLength: 40 },
      { kind: "text", key: "button", label: "BUTTON", maxLength: 30 },
      { kind: "text", key: "footer", label: "FOOTER", maxLength: 50 },
    ],
    render: (p) => <TitleScreen {...(p as Parameters<typeof TitleScreen>[0])} />,
    filename: (p) => slug("title-screen", p.glitch && "glitch", `${p.width}x${p.height}`),
    note: "Rebuilt from TitleScreen.tsx at phone size (390 × 844), without scanlines.",
  }),
  asset({
    id: "screen-logo",
    name: "Logo Lockup",
    group: "SCREENS",
    defaults: { size: 24, color: "#00ff88", mascotColor: "#4ecdc4", glitch: false, text: "DRILL MODE" },
    controls: [
      { kind: "size", key: "size", label: "TEXT SIZE", min: 8, max: 160 },
      { kind: "text", key: "text", label: "TEXT", maxLength: 24 },
      { kind: "color", key: "color", label: "TEXT COLOUR" },
      { kind: "color", key: "mascotColor", label: "PIXI COLOUR" },
      { kind: "toggle", key: "glitch", label: "GLITCH FRAME" },
    ],
    render: (p) => <LogoLockup {...(p as Parameters<typeof LogoLockup>[0])} />,
    filename: (p) => slug("logo", p.text, p.glitch && "glitch"),
    // Keeps the wordmark's glow, which reaches past the letters.
    canvas: "original",
  }),
  asset({
    id: "screen-room",
    name: "Room Backdrop",
    group: "ROOMS",
    defaults: { width: 390, height: 252, wall: "midnight", background: "#101b32", pattern: "grid", floor: "oak", floorColor: "#3c2d32", light: "mint", accent: "#4ecdc4", glow: true },
    controls: [
      { kind: "number", key: "width", label: "WIDTH", min: 100, max: 2000 },
      { kind: "number", key: "height", label: "HEIGHT", min: 80, max: 2000 },
      { kind: "choice", key: "wall", label: "WALL", options: opts(WALL_COLORS), style: "chips", columns: 2 },
      { kind: "color", key: "background", label: "WALL COLOUR", visible: (p) => p.wall === "auto" },
      { kind: "choice", key: "pattern", label: "WALL PATTERN", options: opts(WALL_PATTERNS), style: "chips", columns: 2 },
      { kind: "choice", key: "floor", label: "FLOOR", options: opts(FLOORS), style: "chips", columns: 2 },
      { kind: "color", key: "floorColor", label: "FLOOR COLOUR", visible: (p) => p.floor === "custom" },
      { kind: "choice", key: "light", label: "LIGHT", options: opts(ROOM_LIGHTS), style: "chips", columns: 2 },
      { kind: "color", key: "accent", label: "LIGHT COLOUR", visible: (p) => p.light === "auto" },
      { kind: "toggle", key: "glow", label: "NEON LIGHT STRIP" },
    ],
    render: (p) => <RoomBackdrop {...(p as Parameters<typeof RoomBackdrop>[0])} />,
    filename: (p) => slug("room", p.wall, p.pattern, p.floor, `${p.width}x${p.height}`),
    note: "The room wall, floor and light options from the room style editor.",
  }),
  asset({
    id: "screen-house-roof",
    name: "House Roof",
    group: "ROOMS",
    defaults: { width: 390, title: "THE TAN FAMILY", showTitle: true },
    controls: [
      { kind: "number", key: "width", label: "WIDTH", min: 120, max: 2000 },
      { kind: "toggle", key: "showTitle", label: "SHOW TITLE" },
      { kind: "text", key: "title", label: "TITLE", maxLength: 40 },
    ],
    render: (p) => <HouseRoof width={p.width} title={p.title} showTitle={p.showTitle} />,
    filename: (p) => slug("house-roof", p.width),
  }),
  asset({
    id: "screen-dollhouse-window",
    name: "Room Window",
    group: "ROOMS",
    defaults: { size: 28, accent: "#4ecdc4" },
    controls: [{ kind: "size", key: "size", label: "WIDTH", min: 7, max: 700 }, { kind: "color", key: "accent", label: "GLASS TINT" }],
    render: (p) => <DollhouseWindow size={p.size} accent={p.accent} />,
    filename: (p) => slug("room-window", p.size),
  }),
  asset({
    id: "screen-starfield",
    name: "Starfield",
    group: "BACKGROUNDS",
    defaults: { width: 390, height: 844, count: 40, background: "#0a0e1a" },
    controls: [
      { kind: "number", key: "width", label: "WIDTH", min: 50, max: 4000 },
      { kind: "number", key: "height", label: "HEIGHT", min: 50, max: 4000 },
      { kind: "number", key: "count", label: "STARS", min: 0, max: 400 },
      { kind: "color", key: "background", label: "BACKGROUND" },
    ],
    render: (p) => <Starfield {...(p as Parameters<typeof Starfield>[0])} />,
    filename: (p) => slug("starfield", `${p.width}x${p.height}`),
  }),
  asset({
    id: "screen-pixel-phone",
    name: "Pixel Phone",
    group: "DRILLS",
    defaults: { size: 80, ringing: true },
    controls: [{ kind: "size", key: "size", min: 20, max: 800 }, { kind: "toggle", key: "ringing", label: "RINGING" }],
    render: (p) => <PixelPhone size={p.size} ringing={p.ringing} />,
    filename: (p) => slug("pixel-phone", p.ringing && "ringing", p.size),
    note: "From the incoming call screen.",
  }),
  asset({
    id: "screen-crown",
    name: "Race Crown",
    group: "DRILLS",
    defaults: { size: 16 },
    controls: [{ kind: "size", key: "size", label: "WIDTH", min: 8, max: 512 }],
    render: (p) => <Crown size={p.size} />,
    filename: (p) => slug("crown", p.size),
    note: "Shown next to the winner in house race results.",
  }),
  asset({
    id: "screen-tree-node",
    name: "Family Tree Node",
    group: "FAMILY TREE",
    defaults: { size: 44, gender: "male", stroke: "#4ecdc4", fill: "#111827", strokeWidth: 3, dashed: false },
    controls: [
      { kind: "size", key: "size", min: 12, max: 512 },
      {
        kind: "choice", key: "gender", label: "SHAPE", style: "chips", columns: 2,
        options: [{ value: "male", label: "SQUARE · MALE" }, { value: "female", label: "CIRCLE · FEMALE" }, { value: "other", label: "TRIANGLE · OTHER" }, { value: "unset", label: "ROUNDED · NOT SET" }],
      },
      { kind: "color", key: "stroke", label: "OUTLINE" },
      { kind: "color", key: "fill", label: "FILL" },
      { kind: "number", key: "strokeWidth", label: "OUTLINE WIDTH", min: 1, max: 24 },
      { kind: "toggle", key: "dashed", label: "DASHED" },
    ],
    render: (p) => <TreeNode {...(p as Parameters<typeof TreeNode>[0])} />,
    filename: (p) => slug("tree-node", p.gender, p.size),
    // Outlines are drawn half outside the shape, which trimming would cut.
    canvas: "original",
  }),
];
