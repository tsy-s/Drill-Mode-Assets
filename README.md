# Drill Mode · SVG Asset Studio

An interactive web app to preview Drill Mode assets, change their settings, and export them as SVG.

## Run

Requires Node.js. From this folder:

```bash
npm install
npm run dev
```

Then open http://localhost:5180.

## Using it

- **Tabs** along the top: Avatar, Characters, Furniture, Icons, UI, Screens.
- **Avatar** has its own row of sub-tabs:
  - **Custom Character** follows the app's avatar customisation flow (skin, hair, outfit, extras).
  - **Hair**, **Outfits** and **Accessories** export that part alone, without the body.
- **Asset list** (left): searchable, grouped, with live thumbnails.
- **Preview** (centre) shows the exact file that will be exported.
  - The zoom slider, `FIT`, `1:1` and Ctrl/⌘ + scroll change the view only. They never change the export size.
  - `DARK` / `CLEAR` / `LIGHT` change the preview background. `CLEAR` shows transparency.
- **Settings** (right):
  - **Properties** come from each component's props (size, colour, and others). Sizes default to the component's size in the code.
  - **Colour fields** take any typed hex code (`#rrggbb`, or `#rgb`, which expands when you leave the field). They also show one-click presets, including the component's own default colour. Swatch pickers such as skin tone and hair colour have a **CUSTOM** field too.
  - **Colour palette** lists every colour in the artwork. Pick one to recolour it everywhere it is used, by typing a hex code or choosing a preset.
  - **Export** downloads the SVG (`EXPORT TO SVG`) or copies its code. **Canvas** sets the file's dimensions:
    - `TRIM` (default) crops to the drawn artwork.
    - `ORIGINAL` keeps the component's own canvas.
    - `CUSTOM` sets any width × height, with the artwork placed by a 3 × 3 anchor.

    The dashed outline in the preview marks the canvas edge.

Settings are remembered in the browser (localStorage). `RESET` restores an asset's defaults.

### Sizes for avatar parts

Hair, outfits and accessories use the same scale as a full character: 1 art pixel = height ÷ 32. Set **Canvas** to `ORIGINAL` to keep the full 20 × 32 avatar frame. A part exported that way at height N lines up exactly over a character exported at height N.

## Where the assets come from

`src/vendor/` holds copies of the source components, changed as little as possible:

| Folder | Source |
|---|---|
| `vendor/avatars/character/` | `huawei-2026/src/app/components/avatars/character/` (identical to `assets-svg-export/character/`) |
| `vendor/avatars/*.tsx`, `characters/` | `huawei-2026/src/app/components/avatars/` |
| `vendor/avatars/PixiLegacy.tsx` | `9-22/assets/avatars/PixiAvatar.tsx`, listed as **Fake Pixi**. The real Pixi is `PixelMascot`. |
| `vendor/icons/` | `huawei-2026/src/app/components/icons/` |
| `vendor/furniture/` | `FurnitureIcon.tsx`, `archive/`, and `public/furniture/*.svg` (shop art) |
| `vendor/ui/` | `PixelButton.tsx`, `ToggleSwitch.tsx`, used by this app's own interface |

### Changes to the vendored components

These are small, optional props. Without them, each component renders exactly as in the app:

- `PixelMascot` (Pixi): `separated` leaves a one-pixel gap between head and body and makes the canvas one row taller. It is on by default here. `outfitColors` sets custom body/accent colours for the "Custom" outfit.
- `PixelAvatar` and `IconMedal`: `color` overrides the rank colour.
- `CharacterAvatar`: `palettes` accepts custom skin/hair colours outside the presets.

In the app, the **UI** widgets and **Screens** are HTML/CSS, so this tool redraws them as native SVG in `src/assets/ui.tsx` and `src/assets/screens.tsx`. They use the same sizes and colours as the app, and exports stay editable in Figma or Illustrator. Text stays as live SVG text in the app's fonts (Press Start 2P, VT323, Share Tech Mono), with a Google Fonts link inside the file.

Some assets default to the `ORIGINAL` canvas because their effects reach past their shapes, and trimming would cut them: the safety badge's glow, the logo lockup's glow, and the family tree node's outline. With `ORIGINAL`, any component drawn with `overflow: visible` (like the family NPCs, whose idle frames shift their art) has its canvas grown to fit, so nothing is cut off.

## Adding an asset

Add an entry with `asset({...})` to the matching file in `src/assets/`:

- `defaults`: the starting props.
- `controls`: the settings to show (`size`, `number`, `color`, `choice`, `toggle`, `text`).
- `render`: returns a single root `<svg>`.

It appears in its tab automatically. Tabs are listed in `src/registry.ts`.
