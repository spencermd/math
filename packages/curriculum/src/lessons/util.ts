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

/** sup(12) → "¹²", sup(-3) → "⁻³" */
export const sup = (n: number) => [...String(n)].map(d => (d === '-' ? '⁻' : SUPERSCRIPT[Number(d)])).join('');

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

export type Row = { label?: string; text: string };

/** Lines of working, revealed one at a time. */
export const working = (rows: Row[]): Visual => ({ kind: 'rows', rows });

export const LOWEST = 'Give your answer as a fraction in lowest terms.';

/** neg(-5) → "−5", with a real minus sign. */
export const neg = (n: number) => (n < 0 ? `−${fmt(-n)}` : fmt(n));

/** plus(5) → "+ 5"; plus(-5) → "− 5". For joining terms. */
export const plus = (n: number) => (n < 0 ? `− ${fmt(-n)}` : `+ ${fmt(n)}`);

/** term(3, 'x') → "3x"; term(1, 'x') → "x"; term(-1, 'x') → "−x" */
export const term = (c: number, v: string) => (c === 1 ? v : c === -1 ? `−${v}` : `${neg(c)}${v}`);

/** linear(2, -3) → "2x − 3"; linear(1, 0) → "x"; linear(0, 4) → "4" */
export function linear(m: number, b: number, v = 'x'): string {
  if (m === 0) return neg(b);
  return b === 0 ? term(m, v) : `${term(m, v)} ${plus(b)}`;
}

/** Lowest terms with the sign on top: reduceSigned(6, -4) → [-3, 2] */
export function reduceSigned(num: number, den: number): [number, number] {
  const g = gcd(Math.abs(num), Math.abs(den)) * (den < 0 ? -1 : 1);
  return [num / g, den / g];
}

/** sfrac(-6, 4) → "−3/2"; sfrac(6, 3) → "2" */
export function sfrac(num: number, den: number): string {
  const [n, d] = reduceSigned(num, den);
  return d === 1 ? neg(n) : `${n < 0 ? '−' : ''}${Math.abs(n)}/${d}`;
}

/** Simplest radical form: root(72) → "6√2", root(49) → "7", root(7) → "√7" */
export function root(n: number): string {
  let out = 1;
  for (let k = 2; k * k <= n; k++) while (n % (k * k) === 0) { out *= k; n /= k * k; }
  return n === 1 ? `${out}` : out === 1 ? `√${n}` : `${out}√${n}`;
}

/** n choose k */
export function choose(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let out = 1;
  for (let i = 1; i <= Math.min(k, n - k); i++) out = (out * (n - i + 1)) / i;
  return Math.round(out);
}

/** Wrong answers for a multiple-choice question: shuffles `right` in among the distinct `wrong` ones. */
export function choices(rng: Rng, right: string, wrong: string[]): { kind: 'choice'; options: string[]; correct: number } {
  const options = shuffle(rng, [right, ...[...new Set(wrong)].filter(w => w !== right)]);
  return { kind: 'choice', options, correct: options.indexOf(right) };
}

export const gcd =(a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
export const lcm = (a: number, b: number) => (a / gcd(a, b)) * b;

/** [6, 8] → [3, 4] */
export function reduce(num: number, den: number): [number, number] {
  const g = gcd(num, den);
  return [num / g, den / g];
}

/** frac(3, 4) → "3/4"; a whole number is written without the "/1". */
export const frac = (num: number, den: number) => (den === 1 ? `${num}` : `${num}/${den}`);
