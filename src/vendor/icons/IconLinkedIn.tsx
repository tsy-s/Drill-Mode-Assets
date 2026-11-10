export function IconLinkedIn({ size = 20, color = "#4ecdc4" }: { size?: number; color?: string }) {
  return (
    <svg data-inner="thin" width={size} height={size} viewBox="0 0 12 12" style={{ imageRendering: "pixelated", display: "block" }}>
      <path className="px-hole" fill="none" d="M2 2h2v2h-2zM2 5h2v5h-2zM5 5h4v1h-4zM5 6h5v1h-5zM5 7h2v3h-2zM8 7h2v3h-2z" />
      <path className="px-hole-line" fill="none" d="M2 2H4V4H2ZM2 5H4V10H2ZM5 5H9V6H10V10H8V7H7V10H5Z" />
      <rect x={1} y={0} width={10} height={1} fill={color} />
      <rect x={0} y={1} width={12} height={1} fill={color} />
      <rect x={0} y={2} width={2} height={2} fill={color} />
      <rect x={4} y={2} width={8} height={2} fill={color} />
      <rect x={0} y={4} width={12} height={1} fill={color} />
      <rect x={0} y={5} width={2} height={5} fill={color} />
      <rect x={4} y={5} width={1} height={5} fill={color} />
      <rect x={9} y={5} width={3} height={1} fill={color} />
      <rect x={10} y={6} width={2} height={4} fill={color} />
      <rect x={7} y={7} width={1} height={3} fill={color} />
      <rect x={0} y={10} width={12} height={1} fill={color} />
      <rect x={1} y={11} width={10} height={1} fill={color} />
    </svg>
  );
}
