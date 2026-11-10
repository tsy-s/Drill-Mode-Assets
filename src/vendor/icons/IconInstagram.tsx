export function IconInstagram({ size = 20, color = "#ff71c5" }: { size?: number; color?: string }) {
  return (
    <svg data-inner="thin" width={size} height={size} viewBox="0 0 12 12" style={{ imageRendering: "pixelated", display: "block" }}>
      <path className="px-hole" fill="none" d="M1 1h10v1h-10zM1 2h8v1h-8zM10 2h1v1h-1zM1 3h3v1h-3zM8 3h3v1h-3zM1 4h2v4h-2zM4 4h4v4h-4zM9 4h2v4h-2zM1 8h3v1h-3zM8 8h3v1h-3zM1 9h10v2h-10z" />
      <path className="px-hole-line" fill="none" d="M1 1H11V11H1ZM10 2H9V3H10ZM5 3H4V4H3V8H4V9H8V8H9V4H8V3ZM4 4H8V8H4Z" />
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
