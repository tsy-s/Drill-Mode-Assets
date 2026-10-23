import { useEffect, useState } from "react";
import { ToggleSwitchB } from "../vendor/ui/ToggleSwitch";
import { Chip, Choice, Field, NumberInput, Slider, Swatch } from "./kit";
import { normalizeColor } from "../lib/svg";
import type { Control, Props } from "../lib/types";

/** The app's neon palette, offered as one-click colours. */
export const APP_COLORS = [
  "#00ff88", "#4ecdc4", "#00d4ff", "#c77dff", "#ff71c5", "#ff2d55",
  "#ff6b35", "#ffe66d", "#e8f4f8", "#6b8ba4", "#2a3a5c", "#0a0e1a",
];

export function ColorInput({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);
  return (
    <div className="color-input">
      <label className="color-well" style={{ background: value }} title="Pick any colour">
        <input type="color" aria-label={`${label} picker`} value={normalizeColor(value) ?? "#000000"} onChange={(e) => onChange(e.target.value)} />
      </label>
      <input
        className="text-input hex-input"
        aria-label={`${label} hex`}
        value={text}
        spellCheck={false}
        placeholder="#rrggbb"
        onChange={(e) => {
          const raw = e.target.value.trim();
          setText(e.target.value);
          // Apply full 6-digit codes as they are typed; 3-digit ones expand on blur.
          if (/^#?[0-9a-f]{6}$/i.test(raw)) onChange(`#${raw.replace("#", "").toLowerCase()}`);
        }}
        onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
        onBlur={() => {
          const raw = text.trim().replace("#", "");
          if (/^[0-9a-f]{3}$/i.test(raw)) {
            const hex = `#${raw.split("").map((c) => c + c).join("")}`.toLowerCase();
            onChange(hex);
            setText(hex);
          } else {
            setText(value);
          }
        }}
      />
    </div>
  );
}

function ColorControl({ label, value, defaultValue, presets, onChange, accent }: {
  label: string; value: string; defaultValue?: string; presets?: ReadonlyArray<{ color: string; label?: string }>;
  onChange: (v: string) => void; accent: string;
}) {
  const current = normalizeColor(value);
  const list = presets ?? APP_COLORS.map((color) => ({ color, label: undefined as string | undefined }));
  // The component's own default colour is always one click away.
  const def = normalizeColor(defaultValue);
  const shown = def && !list.some((p) => normalizeColor(p.color) === def) ? [{ color: def, label: "DEFAULT" }, ...list] : list;
  const labelled = shown.some((p) => p.label && p.label !== "DEFAULT");
  return (
    <Field label={label} hint={current && !shown.some((p) => normalizeColor(p.color) === current) ? "Custom colour" : undefined}>
      <ColorInput value={value} onChange={onChange} label={label} />
      {labelled ? (
        <div className="chip-row">
          {shown.map((p) => (
            <Chip key={p.color} selected={current === normalizeColor(p.color)} accent={accent} swatch={p.color} onClick={() => onChange(p.color)} title={p.color}>
              {p.label ?? p.color}
            </Chip>
          ))}
        </div>
      ) : (
        <div className="preset-row">
          {shown.map((p) => (
            <Swatch key={p.color} color={p.color} label={p.label ? `${p.label} ${p.color}` : p.color} selected={current === normalizeColor(p.color)} onClick={() => onChange(p.color)} accent={accent} style={{ borderWidth: 3 }} />
          ))}
        </div>
      )}
    </Field>
  );
}

function SizeControl({ control, value, defaultValue, onChange, accent }: {
  control: Extract<Control, { kind: "size" }>; value: number; defaultValue: number; onChange: (v: number) => void; accent: string;
}) {
  const multipliers = [1, 2, 4, 8].filter((m) => defaultValue * m <= control.max);
  return (
    <Field
      label={control.label ?? "SIZE"}
      hint={control.hint}
      right={<NumberInput label={control.label ?? "Size"} value={value} min={control.min} max={control.max} step={control.step ?? 1} suffix="px" onChange={onChange} />}
    >
      <Slider label={control.label ?? "Size"} value={value} min={control.min} max={control.max} step={control.step ?? 1} onChange={onChange} accent={accent} />
      <div className="chip-row">
        {multipliers.map((m) => (
          <Chip key={m} accent={accent} selected={value === defaultValue * m} onClick={() => onChange(defaultValue * m)} title={`${defaultValue * m}px`}>
            {m === 1 ? `DEFAULT ${defaultValue}` : `×${m}`}
          </Chip>
        ))}
      </div>
    </Field>
  );
}

export function ControlView({ control, values, defaults, set, accent }: {
  control: Control; values: Props; defaults: Props; set: (patch: Props) => void; accent: string;
}) {
  const value = values[control.key];
  switch (control.kind) {
    case "size":
      return <SizeControl control={control} value={value} defaultValue={defaults[control.key]} onChange={(v) => set({ [control.key]: v })} accent={accent} />;

    case "number":
      return (
        <Field label={control.label} right={<NumberInput label={control.label} value={value} min={control.min} max={control.max} step={control.step} onChange={(v) => set({ [control.key]: v })} />}>
          {null}
        </Field>
      );

    case "color":
      return <ColorControl label={control.label} value={value} defaultValue={defaults[control.key]} presets={control.presets} onChange={(v) => set({ [control.key]: v })} accent={accent} />;

    case "toggle":
      return (
        <div className="field toggle-field">
          <span className="field-label">{control.label}</span>
          <ToggleSwitchB on={!!value} onToggle={() => set({ [control.key]: !value })} color={accent} />
        </div>
      );

    case "text":
      return (
        <Field label={control.label}>
          {control.multiline ? (
            <textarea className="text-input" rows={3} value={value} maxLength={control.maxLength} onChange={(e) => set({ [control.key]: e.target.value })} />
          ) : (
            <input className="text-input" value={value} maxLength={control.maxLength} onChange={(e) => set({ [control.key]: e.target.value })} />
          )}
        </Field>
      );

    case "choice": {
      const disabled = control.disabled?.(values) ?? false;
      const isOn = (v: string | number) => (control.multi ? (value as Array<string | number>).includes(v) : value === v);
      const pick = (v: string | number) => {
        if (!control.multi) return set({ [control.key]: v });
        const list = value as Array<string | number>;
        set({ [control.key]: list.includes(v) ? list.filter((x) => x !== v) : [...list, v] });
      };
      const style = control.style ?? "chips";
      const cols = control.columns ?? 3;
      return (
        <Field label={control.label}>
          <div className={`choice-grid choice-${style}`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, opacity: disabled ? 0.35 : 1 }}>
            {control.options.map((opt) => {
              if (style === "swatches") {
                return <Swatch key={opt.value} color={opt.swatch ?? "#000"} label={opt.label} selected={isOn(opt.value)} disabled={disabled} accent={accent} onClick={() => pick(opt.value)} style={{ height: 34, width: "100%" }} />;
              }
              if (style === "grid") {
                return (
                  <Choice key={opt.value} selected={isOn(opt.value)} label={opt.label} accent={accent} disabled={disabled} onClick={() => pick(opt.value)}>
                    {opt.thumb?.(values)}
                  </Choice>
                );
              }
              return (
                <Chip key={opt.value} selected={isOn(opt.value)} accent={accent} swatch={opt.swatch} disabled={disabled} onClick={() => pick(opt.value)}>
                  {opt.label}
                </Chip>
              );
            })}
          </div>
          {control.custom && (() => {
            // A typed hex code is stored as the value itself.
            const custom = typeof value === "string" && !control.options.some((o) => o.value === value) && !!normalizeColor(value);
            const fallback = control.options.find((o) => o.value === value)?.swatch ?? "#000000";
            return (
              <div className="custom-color" style={{ borderColor: custom ? accent : "#2a3a5c", opacity: disabled ? 0.35 : 1, pointerEvents: disabled ? "none" : undefined }}>
                <span className="field-label" style={{ color: custom ? "#ffffff" : undefined }}>CUSTOM</span>
                <ColorInput value={custom ? value : fallback} onChange={(hex) => set({ [control.key]: hex })} label={`${control.label} custom`} />
              </div>
            );
          })()}
        </Field>
      );
    }
  }
}
