import { memo } from 'react';
import { REALMS, REALM_ORDER, type RealmId } from '@mathtree/curriculum';
import { LAYOUT, TREE_SHAPE, type Box } from '@/lib/tree-layout';
import { REALM_LOOK } from '@/lib/realm-look';

type Pt = { x: number; y: number };

/** Moss, leaf and pine greens for the oak's leaves, so the crown reads as forest whatever realm it holds. */
const MOSS = ['#4f6b3a', '#2f5233', '#6b8a55', '#3d5a44'];

/** Points along a cubic Bézier. */
function cubic(p0: Pt, p1: Pt, p2: Pt, p3: Pt, steps = 28): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    out.push({
      x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
      y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
    });
  }
  return out;
}

/** A limb that narrows from `w0` wide at its start to `w1` at its tip, as a filled outline. */
function taper(points: Pt[], w0: number, w1: number): string {
  const left: Pt[] = [];
  const right: Pt[] = [];
  points.forEach((p, i) => {
    const a = points[Math.max(0, i - 1)];
    const b = points[Math.min(points.length - 1, i + 1)];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const w = (w0 + (w1 - w0) * (i / (points.length - 1))) / 2;
    left.push({ x: p.x - (dy / len) * w, y: p.y + (dx / len) * w });
    right.push({ x: p.x + (dy / len) * w, y: p.y - (dx / len) * w });
  });
  const pts = [...left, ...right.reverse()];
  return `M${pts.map(p => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L')} Z`;
}

/** Deterministic scatter, so the scenery is the same on every visit. */
function rand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

const overlaps = (p: Pt, b: Box, margin: number) =>
  p.x > b.x - margin && p.x < b.x + b.width + margin && p.y > b.y - margin && p.y < b.y + b.height + margin;

/** Little things scattered through a realm, kept clear of its topics. */
function motifsFor(id: RealmId) {
  const box = TREE_SHAPE.realms[id];
  const topics = Object.values(LAYOUT).filter(b => overlaps({ x: b.x + b.width / 2, y: b.y + b.height / 2 }, box, 0));
  const next = rand(id * 7919);
  const out: { x: number; y: number; icon: string; size: number; delay: number }[] = [];
  for (let tries = 0; tries < 200 && out.length < 9; tries++) {
    const p = { x: box.x + 30 + next() * (box.width - 60), y: box.y + 70 + next() * (box.height - 100) };
    if (topics.some(b => overlaps(p, b, 34))) continue;
    if (out.some(q => Math.hypot(q.x - p.x, q.y - p.y) < 110)) continue;
    const look = REALM_LOOK[id];
    out.push({ ...p, icon: look.motifs[out.length % look.motifs.length], size: 20 + next() * 14, delay: next() * 6 });
  }
  return out;
}

/** The glowing oak behind the topics: roots, trunk with its portal, one branch to each realm, and each realm's glade. */
function TreeBackdropView({ onPortal }: { onPortal: () => void }) {
  const { bounds, trunkTop, trunkBase, realms } = TREE_SHAPE;
  const branches = REALM_ORDER.map(id => {
    const r = realms[id];
    const tip = { x: r.x + r.width / 2, y: r.y + r.height - 40 };
    const lean = tip.x - trunkTop.x;
    const pts = cubic(
      { x: trunkTop.x + Math.sign(lean) * Math.min(40, Math.abs(lean)), y: trunkTop.y + 30 },
      { x: trunkTop.x + lean * 0.15, y: trunkTop.y - 180 },
      { x: tip.x - lean * 0.25, y: tip.y + 240 },
      tip,
    );
    // A couple of twigs curl off each limb, so it reads as a branch rather than a pole.
    const twigs = [0.55, 0.78].map((at, k) => {
      const from = pts[Math.round(at * (pts.length - 1))];
      const side = k % 2 ? 1 : -1;
      return taper(
        cubic(
          from,
          { x: from.x + side * 60, y: from.y - 30 },
          { x: from.x + side * 110, y: from.y - 90 },
          { x: from.x + side * 120, y: from.y - 150 },
          12,
        ),
        14,
        2,
      );
    });
    return { id, d: taper(pts, 56, 10), twigs };
  });
  // Clouds of foliage round each realm's glade: the crown of the oak.
  const foliage = REALM_ORDER.flatMap(id => {
    const r = realms[id];
    const next = rand(id * 104729);
    const cx = r.x + r.width / 2;
    const cy = r.y + r.height / 2;
    return Array.from({ length: 30 }, (_, i) => {
      const a = (i / 30) * Math.PI * 2 + next() * 0.2;
      const k = 0.5 + next() * 0.12;
      return {
        id,
        x: cx + Math.cos(a) * r.width * k,
        y: cy + Math.sin(a) * r.height * k,
        r: 50 + next() * 70,
      };
    });
  });
  const trunk = taper(
    cubic(
      { x: trunkBase.x, y: trunkBase.y + 20 },
      { x: trunkBase.x - 40, y: trunkBase.y - 180 },
      { x: trunkTop.x + 40, y: trunkTop.y + 160 },
      { x: trunkTop.x, y: trunkTop.y - 20 },
    ),
    230,
    96,
  );
  const roots = [-1, 1].flatMap(side =>
    [0, 1, 2].map(k => {
      const spread = 180 + k * 190;
      return taper(
        cubic(
          { x: trunkBase.x + side * (40 + k * 30), y: trunkBase.y - 10 },
          { x: trunkBase.x + side * (80 + k * 60), y: trunkBase.y + 40 },
          { x: trunkBase.x + side * spread * 0.7, y: trunkBase.y + 60 + k * 10 },
          { x: trunkBase.x + side * spread, y: trunkBase.y + 110 + k * 18 },
        ),
        46 - k * 8,
        4,
      );
    }),
  );
  const view = `${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`;
  const portal = { x: trunkBase.x, y: trunkBase.y - 210 };

  return (
    <div
      className="tree-backdrop"
      style={{ left: bounds.x, top: bounds.y, width: bounds.width, height: bounds.height }}
    >
      <svg width={bounds.width} height={bounds.height} viewBox={view} aria-hidden>
        <defs>
          <linearGradient id="bark" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#1c151d" />
            <stop offset="0.45" stopColor="#3b2c37" />
            <stop offset="0.6" stopColor="#56434f" />
            <stop offset="1" stopColor="#19121a" />
          </linearGradient>
          <filter id="oak-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="14" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {REALM_ORDER.map(id => (
            <radialGradient key={id} id={`glade-${id}`}>
              <stop offset="0" stopColor={REALMS[id].border} stopOpacity="0.26" />
              <stop offset="0.6" stopColor={REALMS[id].color} stopOpacity="0.16" />
              <stop offset="1" stopColor={REALMS[id].color} stopOpacity="0" />
            </radialGradient>
          ))}
          <radialGradient id="ground">
            <stop offset="0" stopColor="#f5d060" stopOpacity="0.22" />
            <stop offset="1" stopColor="#2f5233" stopOpacity="0" />
          </radialGradient>
        </defs>

        <ellipse cx={trunkBase.x} cy={trunkBase.y + 90} rx={900} ry={160} fill="url(#ground)" />

        {/* Each realm's glade of light in the canopy. */}
        {REALM_ORDER.map(id => {
          const r = realms[id];
          return (
            <ellipse
              key={id}
              className="glade"
              cx={r.x + r.width / 2}
              cy={r.y + r.height / 2}
              rx={r.width * 0.62}
              ry={r.height * 0.62}
              fill={`url(#glade-${id})`}
            />
          );
        })}

        <g className="foliage">
          {foliage.map((f, i) => (
            <circle
              key={i}
              cx={f.x}
              cy={f.y}
              r={f.r}
              fill={MOSS[i % MOSS.length]}
              fillOpacity={0.13}
              stroke={REALMS[f.id].border}
              strokeOpacity={0.1}
              strokeWidth={2}
            />
          ))}
        </g>

        <g className="oak" filter="url(#oak-glow)" stroke="#ecc96a66" strokeWidth={2.5} fill="url(#bark)">
          {roots.map((d, i) => <path key={`r${i}`} d={d} />)}
          {branches.flatMap(b => [<path key={b.id} d={b.d} />, ...b.twigs.map((t, k) => <path key={`${b.id}t${k}`} d={t} />)])}
          <path d={trunk} />
        </g>

        {REALM_ORDER.map(id => {
          const r = realms[id];
          return (
            <g key={`m${id}`} className="motifs">
              {motifsFor(id).map((m, i) => (
                <text
                  key={i}
                  x={m.x}
                  y={m.y}
                  fontSize={m.size}
                  textAnchor="middle"
                  style={{ animationDelay: `${m.delay.toFixed(2)}s` }}
                >
                  {m.icon}
                </text>
              ))}
              <text className="realm-banner" x={r.x + r.width / 2} y={r.y + 38} textAnchor="middle" fill={REALMS[id].border}>
                {REALM_LOOK[id].emblem} {REALM_LOOK[id].land}
              </text>
              <text className="realm-banner-sub" x={r.x + r.width / 2} y={r.y + 62} textAnchor="middle">
                {REALMS[id].name} · kept by the {REALM_LOOK[id].creature}
              </text>
            </g>
          );
        })}

        <text className="realm-banner-sub" x={trunkBase.x} y={trunkBase.y + 150} textAnchor="middle">
          🧝 The Old Oak · kept by the dryads
        </text>
      </svg>

      <button
        className="tree-portal"
        style={{ left: portal.x - bounds.x - 70, top: portal.y - bounds.y - 95 }}
        onClick={onPortal}
        aria-label="Step through the portal to the Problem Factory"
        title="Step through the portal: contest problems from the whole tree"
      >
        <span className="tree-portal-swirl" aria-hidden />
        <span className="tree-portal-label">Portal</span>
      </button>
    </div>
  );
}

export const TreeBackdrop = memo(TreeBackdropView);
