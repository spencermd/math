/** The night behind the tree: purple ombré, stars, aurora lights and drifting fireflies. Pure decoration. */
export function Sky() {
  return (
    <div className="sky" aria-hidden>
      <div className="sky-stars sky-stars-far" />
      <div className="sky-stars sky-stars-near" />
      <div className="aurora aurora-a" />
      <div className="aurora aurora-b" />
      <div className="aurora aurora-c" />
      {Array.from({ length: 14 }, (_, i) => (
        <span key={i} className="firefly" style={{ ['--i' as string]: i }} />
      ))}
    </div>
  );
}

/** One corner's worth of vine, leaves and flowers; mirrored with CSS for the other corners. */
function VineCorner({ className }: { className: string }) {
  const flower = (x: number, y: number, r: number, color: string) => (
    <g transform={`translate(${x} ${y})`}>
      {[0, 72, 144, 216, 288].map(a => (
        <ellipse key={a} cx={0} cy={-r} rx={r * 0.55} ry={r} fill={color} transform={`rotate(${a})`} opacity={0.85} />
      ))}
      <circle r={r * 0.45} fill="#f5d060" />
    </g>
  );
  const leaf = (x: number, y: number, a: number) => (
    <path d="M0 0 C6 -8 18 -8 24 0 C18 8 6 8 0 0 Z" fill="#4f6b45" transform={`translate(${x} ${y}) rotate(${a})`} />
  );
  return (
    <svg className={`vine ${className}`} width="260" height="200" viewBox="0 0 260 200" aria-hidden>
      <path d="M0 6 C40 30 70 10 110 26 C150 42 170 20 210 34 C230 40 245 52 258 46" stroke="#3d5338" strokeWidth="4" fill="none" />
      <path d="M6 0 C26 40 4 70 22 110 C38 146 16 170 30 198" stroke="#3d5338" strokeWidth="4" fill="none" />
      {/* Thorns along the vine. */}
      <path d="M60 22 l4 -10 l3 9 M150 40 l5 -9 l2 10 M16 60 l-10 3 l9 4 M26 140 l-10 2 l9 5" stroke="#6b5a4a" strokeWidth="2" fill="none" />
      {leaf(30, 18, -20)}
      {leaf(95, 22, 15)}
      {leaf(180, 30, -10)}
      {leaf(12, 80, 100)}
      {leaf(24, 160, 70)}
      {flower(70, 18, 7, '#b58ad8')}
      {flower(130, 36, 6, '#d896b4')}
      {flower(220, 38, 5, '#b58ad8')}
      {flower(18, 118, 6, '#d896b4')}
    </svg>
  );
}

export function Vines() {
  return (
    <>
      <VineCorner className="vine-tl" />
      <VineCorner className="vine-tr" />
    </>
  );
}
