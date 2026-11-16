// Small toolkit for drawing geometry diagrams as `figure` visuals.
import type { Pt, Shape, Visual } from './types.ts';

type Fill = 'shade' | 'erase';

export const poly = (points: Pt[], fill?: Fill, dashed?: boolean): Shape => ({ type: 'polygon', points, fill, dashed });
export const seg = (from: Pt, to: Pt, dashed?: boolean): Shape => ({ type: 'segment', from, to, dashed });
export const circ = (center: Pt, r: number, fill?: Fill, dashed?: boolean): Shape => ({ type: 'circle', center, r, fill, dashed });
export const sector = (center: Pt, r: number, from: number, to: number, fill?: Fill): Shape => ({ type: 'sector', center, r, from, to, fill });
export const arc = (center: Pt, r: number, from: number, to: number): Shape => ({ type: 'sector', center, r, from, to, arcOnly: true });
export const dot = (at: Pt): Shape => ({ type: 'point', at });
export const text = (at: Pt, t: string): Shape => ({ type: 'label', at, text: t });

const sub = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]];
const add = (a: Pt, b: Pt): Pt => [a[0] + b[0], a[1] + b[1]];
const scale = (a: Pt, k: number): Pt => [a[0] * k, a[1] * k];
const unit = (a: Pt): Pt => {
  const len = Math.hypot(a[0], a[1]) || 1;
  return [a[0] / len, a[1] / len];
};

export const midpoint = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
export const centroid = (pts: Pt[]): Pt => scale(pts.reduce(add, [0, 0]), 1 / pts.length);
/** The point at `deg` degrees (counterclockwise from east) and distance r from c. */
export const polar = (c: Pt, r: number, deg: number): Pt => [c[0] + r * Math.cos((deg * Math.PI) / 180), c[1] + r * Math.sin((deg * Math.PI) / 180)];

/** A label for side ab, pushed `off` units away from the point `inside`. */
export function sideLabel(a: Pt, b: Pt, t: string, inside: Pt, off: number): Shape {
  const m = midpoint(a, b);
  let n = unit([-(b[1] - a[1]), b[0] - a[0]]);
  const toInside = sub(inside, m);
  if (n[0] * toInside[0] + n[1] * toInside[1] > 0) n = scale(n, -1);
  return text(add(m, scale(n, off)), t);
}

/** A label next to vertex v, pushed `off` units away from the point `inside`. */
export const cornerLabel = (v: Pt, t: string, inside: Pt, off: number): Shape => text(add(v, scale(unit(sub(v, inside)), off)), t);

/** A label inside the angle at v between the rays toward p and q, `off` units from v. */
export function angleLabel(v: Pt, p: Pt, q: Pt, t: string, off: number): Shape {
  const [u1, u2] = [unit(sub(p, v)), unit(sub(q, v))];
  let bis = add(u1, u2);
  if (Math.hypot(bis[0], bis[1]) < 1e-6) bis = [-u1[1], u1[0]];
  return text(add(v, scale(unit(bis), off)), t);
}

/** The little square that marks a right angle at v, between the rays toward p and q. */
export function rightAngle(v: Pt, p: Pt, q: Pt, size: number): Shape[] {
  const a = add(v, scale(unit(sub(p, v)), size));
  const b = add(v, scale(unit(sub(q, v)), size));
  const c = sub(add(a, b), v);
  return [seg(a, c), seg(c, b)];
}

/** Wraps shapes in a figure whose box fits them, with a margin. */
export function fig(shapes: Shape[], opts: { caption?: string; grid?: boolean; pad?: number } = {}): Visual {
  const xs: number[] = [];
  const ys: number[] = [];
  const see = (p: Pt, r = 0) => {
    xs.push(p[0] - r, p[0] + r);
    ys.push(p[1] - r, p[1] + r);
  };
  for (const s of shapes) {
    if (s.type === 'polygon') s.points.forEach(p => see(p));
    else if (s.type === 'segment') [s.from, s.to].forEach(p => see(p));
    else if (s.type === 'circle' || s.type === 'sector') see(s.center, s.r);
    else see(s.at);
  }
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const pad = opts.pad ?? 0.05 * Math.max(x1 - x0, y1 - y0);
  return { kind: 'figure', box: [x0 - pad, y0 - pad, x1 + pad, y1 + pad], shapes, grid: opts.grid, caption: opts.caption };
}

/**
 * Triangle ABC with A at the origin, AB along the x-axis with length `base`,
 * and the given angles (in degrees) at A and B.
 */
export function triangleFromAngles(alpha: number, beta: number, base = 10): [Pt, Pt, Pt] {
  const rad = (d: number) => (d * Math.PI) / 180;
  const b = (base * Math.sin(rad(beta))) / Math.sin(rad(180 - alpha - beta));
  return [[0, 0], [base, 0], [b * Math.cos(rad(alpha)), b * Math.sin(rad(alpha))]];
}
