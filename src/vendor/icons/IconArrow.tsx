const ROTATION = { right: 0, down: 90, left: 180, up: 270 } as const;

export function IconArrow({ size = 16, color = "#00ff88", direction = "right" }: {
  size?: number; color?: string; direction?: keyof typeof ROTATION;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" style={{ imageRendering: "pixelated", display: "block" }}>
      <g transform={`rotate(${ROTATION[direction] ?? 0} 5 5)`} fill={color}>
        <rect x={0} y={4} width={9} height={2} />
        <rect x={5} y={1} width={1} height={8} />
        <rect x={6} y={2} width={1} height={6} />
        <rect x={7} y={3} width={1} height={4} />
        <rect x={9} y={4} width={1} height={2} />
      </g>
    </svg>
  );
}
