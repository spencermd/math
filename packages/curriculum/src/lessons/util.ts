// Helpers shared by the lesson generators.
import type { Rng, Visual } from './types.ts';

export const int = (rng: Rng, lo: number, hi: number) => lo + Math.floor(rng() * (hi - lo + 1));

export const pick = <T>(rng: Rng, xs: readonly T[]): T => xs[Math.floor(rng() * xs.length)];

export function shuffle<T>(rng: Rng, xs: readonly T[]): T[] {
  const out = [...xs];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** 12345 → "12,345" */
export const fmt = (n: number) => n.toLocaleString('en-US');

const SUPERSCRIPT = '⁰¹²³⁴⁵⁶⁷⁸⁹';

/** pow(2, 3) → "2³"; an exponent of 1 is left off. */
export const pow = (base: number, exp: number) =>
  exp === 1 ? `${base}` : `${base}${[...String(exp)].map(d => SUPERSCRIPT[Number(d)]).join('')}`;

/** [prime, exponent] pairs, smallest prime first. */
export type Factorization = [number, number][];

export function factorize(n: number): Factorization {
  const out: Factorization = [];
  for (let p = 2; p * p <= n; p++) {
    let e = 0;
    while (n % p === 0) {
      n /= p;
      e++;
    }
    if (e) out.push([p, e]);
  }
  if (n > 1) out.push([n, 1]);
  return out;
}

/** [[2, 3], [3, 2], [5, 1]] → "2³ × 3² × 5" */
export const factored = (f: Factorization) =>
  f.filter(([, e]) => e > 0).map(([p, e]) => pow(p, e)).join(' × ');

export const valueOf = (f: Factorization) => f.reduce((n, [p, e]) => n * p ** e, 1);

/** Working that divides out the smallest prime again and again, ending with the factorization. */
export function factorLadder(n: number): Visual {
  const rows: { label?: string; text: string }[] = [];
  let rest = n;
  for (const [p, e] of factorize(n)) {
    for (let i = 0; i < e && rest !== p; i++) {
      rows.push({ text: `${fmt(rest)} = ${p} × ${fmt(rest / p)}` });
      rest /= p;
    }
  }
  rows.push({ label: 'So', text: `${fmt(n)} = ${factored(factorize(n))}` });
  return { kind: 'rows', rows };
}

/** "1, 2 or 3" */
export function orList(xs: (string | number)[]): string {
  if (xs.length <= 1) return xs.join('');
  return `${xs.slice(0, -1).join(', ')} or ${xs[xs.length - 1]}`;
}

export const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
export const lcm = (a: number, b: number) => (a / gcd(a, b)) * b;

/** [6, 8] → [3, 4] */
export function reduce(num: number, den: number): [number, number] {
  const g = gcd(num, den);
  return [num / g, den / g];
}

/** frac(3, 4) → "3/4"; a whole number is written without the "/1". */
export const frac = (num: number, den: number) => (den === 1 ? `${num}` : `${num}/${den}`);
