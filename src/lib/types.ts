import type { ComponentType, ReactElement, ReactNode } from "react";

export type Props = Record<string, any>;

export type ChoiceOption = {
  value: string | number;
  label: string;
  /** Solid colour chip, used by skin tone / hair colour pickers. */
  swatch?: string;
  /** Small rendered thumbnail, used by hairstyle / outfit pickers. */
  thumb?: (props: Props) => ReactNode;
};

type ControlBase = {
  key: string;
  /** Hide the control unless this returns true (e.g. custom colours for a "Custom" outfit). */
  visible?: (props: Props) => boolean;
};

export type Control = ControlBase & (
  | { kind: "size"; label?: string; min: number; max: number; step?: number; hint?: string }
  | { kind: "number"; label: string; min: number; max: number; step?: number }
  | {
      kind: "color";
      label: string;
      /** One-click colours shown under the hex field. Defaults to the app's neon palette. */
      presets?: ReadonlyArray<{ color: string; label?: string }>;
    }
  | {
      kind: "choice";
      label: string;
      options: ReadonlyArray<ChoiceOption>;
      /** "chips" = compact text buttons, "grid" = thumbnail tiles, "swatches" = colour chips. */
      style?: "chips" | "grid" | "swatches";
      columns?: number;
      multi?: boolean;
      /** Swatch pickers: also accept any typed hex colour as the value. */
      custom?: boolean;
      disabled?: (props: Props) => boolean;
    }
  | { kind: "toggle"; label: string }
  | { kind: "text"; label: string; maxLength?: number; multiline?: boolean }
);

/** How the exported canvas relates to the artwork. */
export type CanvasMode = "trim" | "original" | "custom";
export type CanvasOptions = {
  mode: CanvasMode;
  /** Custom canvas size in px (mode "custom"). */
  width?: number;
  height?: number;
  /** Where the artwork sits in a custom canvas: 0 = left/top, 0.5 = centre, 1 = right/bottom. */
  anchor?: [number, number];
};

export type SettingsPanel = ComponentType<{
  values: Props;
  set: (patch: Props) => void;
  accent: string;
}>;

export interface AssetDef {
  id: string;
  name: string;
  /** Heading the asset is listed under in the asset list. */
  group?: string;
  defaults: Props;
  controls: Control[];
  /** Must render a single root <svg>. */
  render: (props: Props) => ReactElement;
  /** Replaces the generic control list (used by the custom character flow). */
  Settings?: SettingsPanel;
  /**
   * Default canvas. Everything trims to the artwork unless it has effects that
   * extend past its shapes (strokes, glows), which keep their own canvas.
   */
  canvas?: "trim" | "original";
  filename?: (props: Props) => string;
  note?: string;
}

export interface SubTab {
  id: string;
  label: string;
  assets: AssetDef[];
}

export interface TabDef {
  id: string;
  label: string;
  accent: string;
  Icon: ComponentType<{ size?: number; color?: string }>;
  /** Tabs with sub-tabs show a second tab row (avatar). */
  subTabs?: SubTab[];
  assets?: AssetDef[];
}

/** Keeps each asset file's props typed while the registry stays a flat list. */
export function asset<P extends Props>(def: Omit<AssetDef, "defaults" | "render" | "filename"> & {
  defaults: P;
  render: (props: P) => ReactElement;
  filename?: (props: P) => string;
}): AssetDef {
  return def as unknown as AssetDef;
}
