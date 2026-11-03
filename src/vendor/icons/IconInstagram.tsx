export function IconInstagram({ size = 20, color = "#ff71c5" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" style={{ imageRendering: "pixelated", display: "block" }}>
      <rect x={1} y={0} width={10} height={1} fill={color} />
      <rect x={1} y={11} width={10} height={1} fill={color} />
      <rect x={0} y={1} width={1} height={10} fill={color} />
      <rect x={11} y={1} width={1} height={10} fill={color} />
      <rect x={4} y={3} width={4} height={1} fill={color} />
      <rect x={4} y={8} width={4} height={1} fill={color} />
      <rect x={3} y={4} width={1} height={4} fill={color} />
      <rect x={8} y={4} width={1} height={4} fill={color} />
      <rect x={9} y={2} width={1} height={1} fill={color} />
    </svg>
  );
}
