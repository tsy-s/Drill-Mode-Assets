import { PixelMascot } from "../vendor/avatars/PixelMascot";

/**
 * PixelMascot (Pixi) cropped to its head: grid columns 3–13 and rows 0–8 of its 16×16
 * grid, keeping room for hats but stopping above the body's first row.
 * Used for the header logo and as an exportable asset.
 */
export function MascotHead({ size = 32, color = "#4ecdc4", hat = "None", eyes = "Default" }: {
  size?: number; color?: string; hat?: string; eyes?: string;
}) {
  // Draw the mascot on a 16-unit grid and crop with the viewBox. The cap's brim
  // sticks out to the left, so that crop starts two columns earlier.
  const [x, w] = hat === "Cap" ? [1, 12] : [3, 10];
  return (
    <svg width={size} height={(size * 8) / w} viewBox={`${x} 0 ${w} 8`} shapeRendering="crispEdges" style={{ imageRendering: "pixelated", display: "block" }}>
      <PixelMascot size={16} color={color} hat={hat} eyes={eyes} />
    </svg>
  );
}
