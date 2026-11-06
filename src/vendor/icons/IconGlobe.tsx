export function IconGlobe({ size = 20, color = "#4ecdc4" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" style={{ imageRendering: "pixelated", display: "block" }}>
      <path className="px-hole" fill="none" d="M4 1h1v1h-1zM7 1h1v1h-1zM2 2h2v2h-2zM5 2h2v3h-2zM8 2h2v2h-2zM1 4h3v1h-3zM8 4h3v1h-3zM1 6h3v2h-3zM5 6h2v4h-2zM8 6h3v2h-3zM2 8h2v2h-2zM8 8h2v2h-2zM4 10h1v1h-1zM7 10h1v1h-1z" />
      <rect x={4} y={0} width={4} height={1} fill={color} />
      <rect x={2} y={1} width={2} height={1} fill={color} />
      <rect x={8} y={1} width={2} height={1} fill={color} />
      <rect x={1} y={2} width={1} height={2} fill={color} />
      <rect x={10} y={2} width={1} height={2} fill={color} />
      <rect x={0} y={4} width={1} height={4} fill={color} />
      <rect x={11} y={4} width={1} height={4} fill={color} />
      <rect x={1} y={8} width={1} height={2} fill={color} />
      <rect x={10} y={8} width={1} height={2} fill={color} />
      <rect x={2} y={10} width={2} height={1} fill={color} />
      <rect x={8} y={10} width={2} height={1} fill={color} />
      <rect x={4} y={11} width={4} height={1} fill={color} />
      <rect x={1} y={5} width={10} height={1} fill={color} />
      <rect x={5} y={1} width={2} height={1} fill={color} />
      <rect x={4} y={2} width={1} height={8} fill={color} />
      <rect x={7} y={2} width={1} height={8} fill={color} />
      <rect x={5} y={10} width={2} height={1} fill={color} />
    </svg>
  );
}
