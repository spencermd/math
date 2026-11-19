import { useId } from 'react';

/** The phoenix companion: an original flame-feathered bird drawn in SVG. */
export function PhoenixArt({ size = 72, className }: { size?: number; className?: string }) {
  const id = useId().replace(/:/g, '');
  const fire = `phx-fire-${id}`;
  const glow = `phx-glow-${id}`;
  return (
    <svg className={`phoenix-art ${className ?? ''}`} width={size} height={size} viewBox="0 0 120 120" aria-hidden>
      <defs>
        <linearGradient id={fire} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe08a" />
          <stop offset="0.45" stopColor="#f39a45" />
          <stop offset="1" stopColor="#b8344c" />
        </linearGradient>
        <filter id={glow} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter={`url(#${glow})`} fill={`url(#${fire})`}>
        <g className="phoenix-tail">
          <path d="M56 78 C50 92 38 100 30 112 C44 106 52 98 58 86 Z" />
          <path d="M60 80 C60 94 58 104 60 116 C66 104 66 92 63 80 Z" />
          <path d="M64 78 C72 92 82 100 92 110 C82 98 74 90 67 77 Z" />
        </g>
        <path className="phoenix-wing phoenix-wing-left" d="M54 58 C36 50 22 36 14 18 C28 26 34 24 40 30 C38 22 40 16 44 10 C48 24 54 36 58 50 Z" />
        <path className="phoenix-wing phoenix-wing-right" d="M64 56 C80 46 94 34 106 16 C96 28 90 28 84 32 C88 24 88 16 86 10 C80 26 72 38 64 50 Z" />
        <path d="M60 44 C72 46 74 66 66 80 C60 86 54 82 52 74 C50 62 52 48 60 44 Z" />
        <path d="M60 30 C56 22 58 16 62 12 C62 20 64 24 66 29 Z" />
        <path d="M64 29 C64 22 68 18 72 16 C70 22 70 26 68 30 Z" />
        <circle cx="64" cy="38" r="9" />
      </g>
      <path d="M72 36 L80 39 L72 41 Z" fill="#ffd36b" />
      <circle cx="67" cy="36" r="1.7" fill="#2a1030" />
    </svg>
  );
}
