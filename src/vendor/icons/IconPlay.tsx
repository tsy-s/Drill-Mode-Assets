export function IconPlay({ size = 16, color = "#00ff88" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" style={{ imageRendering: "pixelated", display: "block" }}>
      <rect x={1} y={0} width={2} height={10} fill={color} />
      <rect x={3} y={1} width={2} height={8} fill={color} />
      <rect x={5} y={2} width={2} height={6} fill={color} />
      <rect x={7} y={3} width={2} height={4} fill={color} />
      <rect x={9} y={4} width={1} height={2} fill={color} />
    </svg>
  );
}
