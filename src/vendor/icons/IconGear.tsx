/** One of the app's neons: the colours that get the light outline. */
const HUE = /^#(00ff88|ffe66d|4ecdc4|ff2d55|ff6b35|c77dff|00d4ff|ff71c5)$/i;

/** Inner lines (light-theme review): thin in a colour, outline only when grey, as in the app. */
export function IconGear({ size = 16, color = "#6b8ba4" }: { size?: number; color?: string }) {
  return (
    <svg data-inner={HUE.test(color.trim()) ? "thin" : undefined} width={size} height={size} viewBox="0 0 12 12" style={{ imageRendering: "pixelated", display: "block" }}>
      <path className="px-hole" fill="none" d="M4 4h4v1h-4zM4 5h1v2h-1zM7 5h1v2h-1zM4 7h4v1h-4z" />
      <path className="px-hole-line" fill="none" d="M4 4H8V8H4ZM6 5H5V7H7V5Z" />
      <rect x={4} y={0} width={4} height={2} fill={color} />
      <rect x={2} y={2} width={8} height={2} fill={color} />
      <rect x={0} y={4} width={4} height={4} fill={color} />
      <rect x={8} y={4} width={4} height={4} fill={color} />
      <rect x={5} y={5} width={2} height={2} fill={color} />
      <rect x={2} y={8} width={8} height={2} fill={color} />
      <rect x={4} y={10} width={4} height={2} fill={color} />
    </svg>
  );
}
