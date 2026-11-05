export function IconGitHub({ size = 20, color = "#e8f4f8" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" style={{ imageRendering: "pixelated", display: "block" }}>
      <rect x={1} y={1} width={2} height={1} fill={color} />
      <rect x={9} y={1} width={2} height={1} fill={color} />
      <rect x={1} y={2} width={10} height={3} fill={color} />
      <rect x={1} y={5} width={2} height={2} fill={color} />
      <rect x={5} y={5} width={2} height={2} fill={color} />
      <rect x={9} y={5} width={2} height={2} fill={color} />
      <rect x={1} y={7} width={10} height={1} fill={color} />
      <rect x={2} y={8} width={8} height={1} fill={color} />
      <rect x={1} y={9} width={2} height={1} fill={color} />
      <rect x={4} y={9} width={4} height={1} fill={color} />
      <rect x={2} y={10} width={6} height={1} fill={color} />
      <rect x={4} y={11} width={4} height={1} fill={color} />
    </svg>
  );
}
