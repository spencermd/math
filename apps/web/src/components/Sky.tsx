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

/** A vine trailing down one side of the screen, with leaves, thorns and flowers; mirrored for the other side. */
function VineSide({ className }: { className: string }) {
  const flower = (x: number, y: number, r: number, color: string) => (
    <g transform={`translate(${x} ${y})`}>
      {[0, 72, 144, 216, 288].map(a => (
        <ellipse key={a} cx={0} cy={-r} rx={r * 0.55} ry={r} fill={color} transform={`rotate(${a})`} opacity={0.85} />
      ))}
      <circle r={r * 0.45} fill="#ecc96a" />
    </g>
  );
  const leaf = (x: number, y: number, a: number) => (
    <path d="M0 0 C6 -8 18 -8 24 0 C18 8 6 8 0 0 Z" fill="#4f6b45" transform={`translate(${x} ${y}) rotate(${a})`} />
  );
  return (
    <svg className={`vine ${className}`} width="70" height="560" viewBox="0 0 70 560" aria-hidden>
      <path
        d="M4 0 C30 40 2 80 18 130 C34 180 4 220 16 270 C28 320 6 360 14 410 C22 460 4 500 10 560"
        stroke="#3d5338"
        strokeWidth="4"
        fill="none"
      />
      <path d="M22 100 l10 -3 l-8 -6 M12 240 l11 0 l-8 -7 M20 380 l10 -2 l-8 -6 M8 500 l11 1 l-8 -7" stroke="#6b5a4a" strokeWidth="2" fill="none" />
      {leaf(14, 40, 20)}
      {leaf(24, 150, -30)}
      {leaf(10, 205, 40)}
      {leaf(20, 330, -20)}
      {leaf(12, 440, 30)}
      {flower(26, 70, 7, '#b58ad8')}
      {flower(10, 180, 6, '#d896b4')}
      {flower(24, 300, 7, '#b58ad8')}
      {flower(14, 470, 6, '#d896b4')}
    </svg>
  );
}

export function Vines() {
  return (
    <>
      <VineSide className="vine-tl" />
      <VineSide className="vine-tr" />
    </>
  );
}
