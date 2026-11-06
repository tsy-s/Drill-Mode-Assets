import type { CSSProperties, ReactNode } from "react";
import { MONO } from "../lib/text";
import { lineColor, textColor, useTheme } from "../lib/theme";

// Small building blocks in the Drill Mode style (AvatarCustomisationScreen, PixelPanel).

export function Section({ title, note, accent = "#c77dff", right, children }: {
  title: string; note?: ReactNode; accent?: string; right?: ReactNode; children: ReactNode;
}) {
  const theme = useTheme();
  return (
    <section className="section">
      <div className="section-head">
        <div className="section-title" style={{ color: textColor(theme, accent) }}>{title}</div>
        {right}
      </div>
      {note && <div className="section-note">{note}</div>}
      <div style={{ marginTop: 10 }}>{children}</div>
    </section>
  );
}

export function Choice({ selected, label, onClick, accent = "#c77dff", disabled, children, title }: {
  selected: boolean; label: string; onClick: () => void; accent?: string; disabled?: boolean; children?: ReactNode; title?: string;
}) {
  const line = lineColor(useTheme(), accent);
  return (
    <button
      type="button"
      className="choice"
      aria-pressed={selected}
      aria-label={title ?? label}
      title={title ?? label}
      disabled={disabled}
      onClick={onClick}
      style={{
        background: selected ? `${accent}22` : "var(--background)",
        borderColor: selected ? line : "var(--border)",
        boxShadow: selected ? `2px 2px 0 ${line}` : "none",
        color: selected ? "var(--strong)" : "var(--soft)",
      }}
    >
      {children}
      <span className="choice-label">{label}</span>
    </button>
  );
}

export function Chip({ selected, onClick, accent = "#00ff88", children, swatch, disabled, title }: {
  selected: boolean; onClick: () => void; accent?: string; children: ReactNode; swatch?: string; disabled?: boolean; title?: string;
}) {
  return (
    <button
      type="button"
      className="chip"
      aria-pressed={selected}
      disabled={disabled}
      title={title}
      onClick={onClick}
      style={{
        background: selected ? accent : "var(--background)",
        color: selected ? "#0a0e1a" : "var(--soft)",
        borderColor: selected ? "var(--outline)" : "var(--border)",
        boxShadow: selected ? "3px 3px 0 var(--outline)" : "none",
      }}
    >
      {swatch && <span className="chip-swatch" style={{ background: swatch }} />}
      {children}
    </button>
  );
}

export function Swatch({ color, selected, onClick, label, accent = "#c77dff", style, disabled }: {
  color: string; selected: boolean; onClick: () => void; label: string; accent?: string; style?: CSSProperties; disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className="swatch"
      aria-label={label}
      aria-pressed={selected}
      title={label}
      disabled={disabled}
      onClick={onClick}
      style={{
        background: color,
        borderColor: selected ? "var(--strong)" : "var(--outline)",
        outline: selected ? `2px solid ${accent}` : "none",
        ...style,
      }}
    />
  );
}

export function Field({ label, hint, children, right }: { label: string; hint?: ReactNode; children: ReactNode; right?: ReactNode }) {
  return (
    <div className="field">
      <div className="field-head">
        <label className="field-label">{label}</label>
        {right}
      </div>
      {children}
      {hint && <div className="field-hint">{hint}</div>}
    </div>
  );
}

/** Pixel-style range slider: a chunky track with a square thumb (styled in styles.css). */
export function Slider({ value, min, max, step = 1, onChange, accent = "#00ff88", label }: {
  value: number; min: number; max: number; step?: number; onChange: (v: number) => void; accent?: string; label: string;
}) {
  const pct = ((Math.min(Math.max(value, min), max) - min) / (max - min)) * 100;
  return (
    <input
      type="range"
      className="pixel-range"
      aria-label={label}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{ "--pct": `${pct}%`, "--accent": accent } as CSSProperties}
    />
  );
}

export function NumberInput({ value, onChange, min, max, step = 1, suffix, label, width = 76 }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; suffix?: string; label: string; width?: number;
}) {
  return (
    <span className="num-input" style={{ width }}>
      <input
        type="number"
        aria-label={label}
        value={Number.isFinite(value) ? value : ""}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (e.target.value !== "" && Number.isFinite(n)) onChange(n);
        }}
        onBlur={(e) => {
          const n = Number(e.target.value);
          if (!Number.isFinite(n)) return;
          const clamped = Math.min(max ?? n, Math.max(min ?? n, n));
          if (clamped !== n) onChange(clamped);
        }}
      />
      {suffix && <span className="num-suffix">{suffix}</span>}
    </span>
  );
}

export const monoStyle: CSSProperties = { fontFamily: MONO };
