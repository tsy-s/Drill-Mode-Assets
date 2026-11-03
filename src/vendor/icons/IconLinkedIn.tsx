export function IconLinkedIn({ size = 20, color = "#4ecdc4" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" style={{ imageRendering: "pixelated", display: "block" }}>
      <rect x={1} y={0} width={10} height={12} fill={color} />
      <rect x={0} y={1} width={12} height={10} fill={color} />
      <rect x={2} y={2} width={2} height={2} fill="#0a0e1a" />
      <rect x={2} y={5} width={2} height={5} fill="#0a0e1a" />
      <rect x={5} y={5} width={2} height={5} fill="#0a0e1a" />
      <rect x={7} y={5} width={2} height={2} fill="#0a0e1a" />
      <rect x={8} y={6} width={2} height={4} fill="#0a0e1a" />
    </svg>
  );
}
