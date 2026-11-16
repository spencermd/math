// Realm I: Number Sense — fractions and decimals without the grind.
import type { Lesson, Rng, Step } from './types.ts';
import { frac, fmt, gcd, int, pick, reduce, shuffle } from './util.ts';

const LOWEST = 'Give your answer as a fraction in lowest terms.';

type Frac = [number, number];
const show = ([n, d]: Frac) => frac(n, d);

/** Four different fractions in lowest terms that are too close together to compare by eye. */
function closeFractions(rng: Rng): Frac[] {
  for (;;) {
    const centre = 0.35 + rng() * 0.45;
    const near: Frac[] = [];
    for (let d = 5; d <= 13; d++) {
      for (let n = 1; n < d; n++) {
        if (gcd(n, d) === 1 && Math.abs(n / d - centre) < 0.08) near.push([n, d]);
      }
    }
    if (near.length >= 4) return shuffle(rng, near).slice(0, 4);
  }
}

/** Decimals worth knowing by heart, with the fractions they stand for. */
const FRIENDS: { dec: string; n: number; d: number }[] = [
  { dec: '0.25', n: 1, d: 4 },
  { dec: '0.75', n: 3, d: 4 },
  { dec: '0.125', n: 1, d: 8 },
  { dec: '0.375', n: 3, d: 8 },
  { dec: '0.625', n: 5, d: 8 },
  { dec: '0.875', n: 7, d: 8 },
  { dec: '0.2', n: 1, d: 5 },
  { dec: '0.4', n: 2, d: 5 },
  { dec: '0.6', n: 3, d: 5 },
  { dec: '0.8', n: 4, d: 5 },
];

const fractionsDecimals: Lesson = {
  topic: 'fractions_decimals',
  intro: [
    {
      text: 'A fraction keeps its value when you multiply the top and bottom by the same number: you are only cutting the same amount into smaller pieces. So 2/3, 4/6 and 8/12 are one number with three names. Recut the bars to see it. Running it backwards, dividing top and bottom by a common factor, gives lowest terms.',
      visual: { kind: 'fraction-bars', bars: [{ num: 2, den: 3 }, { num: 4, den: 6 }, { num: 8, den: 12 }] },
    },
    {
      text: 'When multiplying fractions, cancel before you multiply. Any factor on a top can cancel with the same factor on any bottom. In 14/15 × 25/21, the 14 and 21 share a 7, and the 25 and 15 share a 5.',
      visual: {
        kind: 'rows',
        rows: [
          { text: '14/15 × 25/21' },
          { label: 'Cancel 7', text: '= 2/15 × 25/3' },
          { label: 'Cancel 5', text: '= 2/3 × 5/3' },
          { text: '= 10/9' },
        ],
      },
    },
    {
      text: 'Which is larger, 5/8 or 7/11? Cross-multiply: 5 × 11 = 55 and 7 × 8 = 56. The larger product belongs to the larger fraction, so 7/11 wins. Why it works: those products are the two numerators once both fractions are cut into 88ths. Recut the bars.',
      visual: { kind: 'fraction-bars', bars: [{ num: 5, den: 8 }, { num: 7, den: 11 }] },
    },
    {
      text: 'A handful of decimals are fractions in disguise, and knowing them turns decimal arithmetic into division: 0.5 = 1/2, 0.25 = 1/4, 0.2 = 1/5, 0.125 = 1/8. So 0.125 × 72 is just 72 ÷ 8 = 9, and 0.375 × 72 is three of those, 27. Dividing flips it: 6 ÷ 0.25 = 6 × 4 = 24.',
    },
    {
      text: 'Sometimes a long product collapses. Each denominator here cancels with the next numerator, and only the two ends survive. A product like this is called telescoping.',
      visual: {
        kind: 'rows',
        rows: [
          { text: '1/2 × 2/3 × 3/4 × 4/5' },
          { label: 'Cancel the 2s', text: '= 1/3 × 3/4 × 4/5' },
          { label: 'Cancel the 3s', text: '= 1/4 × 4/5' },
          { label: 'Cancel the 4s', text: '= 1/5' },
        ],
      },
    },
  ],
  rungs: [
    {
      id: 'fractions_decimals/cancel',
      idea: 'Cancel before you multiply',
      generate: rng => {
        if (rng() < 0.4) {
          // A fraction of a fraction of a whole number.
          const [a, b] = pick(rng, [[2, 3], [3, 4], [3, 5], [5, 6], [2, 5], [4, 7], [3, 8], [5, 8]] as const);
          let c: number, d: number;
          do [c, d] = pick(rng, [[2, 3], [3, 4], [4, 5], [5, 6], [3, 7], [7, 8], [4, 9], [3, 10]] as const);
          while (d === b);
          const whole = b * d * pick(rng, [1, 2, 3, 4, 5]);
          const answer = (whole / (b * d)) * a * c;
          const [pn, pd] = reduce(a * c, b * d);
          return {
            prompt: `What is ${frac(a, b)} of ${frac(c, d)} of ${whole}?`,
            answer: { kind: 'number', value: answer },
            hints: [
              '"Of" means multiply. Do you have to work from right to left?',
              `Multiply the two fractions first, cancelling as you go: ${frac(a, b)} × ${frac(c, d)} = ${frac(pn, pd)}.`,
            ],
            solution: [
              { text: `"Of" means multiply, so this is ${frac(a, b)} × ${frac(c, d)} × ${whole}. Combine the fractions first, cancelling common factors: ${frac(a, b)} × ${frac(c, d)} = ${frac(pn, pd)}.` },
              { text: `${frac(pn, pd)} of ${whole}: ${whole} ÷ ${pd} = ${whole / pd}, and ${whole / pd} × ${pn} = ${answer}.` },
            ],
          };
        }

        let a: number, b: number, c: number, d: number;
        do {
          const [x, y] = shuffle(rng, [2, 3, 4, 5, 6, 7, 8, 9]);
          [a, b] = reduce(int(rng, 1, 5) * x, int(rng, 1, 5) * y);
          [c, d] = reduce(int(rng, 1, 5) * y, int(rng, 1, 5) * x);
        } while (
          b === 1 || d === 1 || a === d || c === b || // nothing trivial: no whole numbers, no identical top and bottom
          gcd(a, d) === 1 || gcd(c, b) === 1 || // something to cancel both ways
          a * c < 60 || // multiplying first should hurt
          (b / gcd(c, b)) * (d / gcd(a, d)) === 1
        );
        const [g1, g2] = [gcd(a, d), gcd(c, b)];
        const [num, den] = [(a / g1) * (c / g2), (b / g2) * (d / g1)];
        const cancels = [
          ...(g1 > 1 ? [`${a} and ${d} share a factor of ${g1}`] : []),
          ...(g2 > 1 ? [`${c} and ${b} share a factor of ${g2}`] : []),
        ];
        return {
          prompt: `Compute ${frac(a, b)} × ${frac(c, d)}. ${LOWEST}`,
          answer: { kind: 'fraction', num, den },
          hints: [
            `Don't multiply ${a} × ${c} yet. Look for a factor shared by a top and a bottom.`,
            `${cancels.join(', and ')}.`,
          ],
          solution: [
            {
              text: `Cancel before multiplying: ${cancels.join(', and ')}.`,
              visual: {
                kind: 'rows',
                rows: [
                  { text: `${frac(a, b)} × ${frac(c, d)}` },
                  { label: 'Cancel', text: `= ${frac(a / g1, b / g2)} × ${frac(c / g2, d / g1)}` },
                  { text: `= ${frac(num, den)}` },
                ],
              },
            },
            { text: `Nothing else cancels, so the answer is ${frac(num, den)}, already in lowest terms.` },
          ],
        };
      },
    },
    {
      id: 'fractions_decimals/compare',
      idea: 'Compare by cross-multiplying',
      buildsOn: 'fractions_decimals/cancel',
      generate: rng => {
        const options = closeFractions(rng);
        const want = pick(rng, ['largest', 'smallest'] as const);
        const beats = (p: Frac, q: Frac) => (want === 'largest' ? p[0] * q[1] > q[0] * p[1] : p[0] * q[1] < q[0] * p[1]);
        let best = options[0];
        const steps: Step[] = [];
        for (const next of options.slice(1)) {
          const winner = beats(next, best) ? next : best;
          const [big, small] = best[0] * next[1] > next[0] * best[1] ? [best, next] : [next, best];
          steps.push({
            text: `${show(best)} against ${show(next)}: ${best[0]} × ${next[1]} = ${best[0] * next[1]} and ${next[0]} × ${best[1]} = ${next[0] * best[1]}, so ${show(big)} is larger than ${show(small)}. Keep ${show(winner)}.`,
          });
          best = winner;
        }
        return {
          prompt: `Which of these fractions is the ${want}?`,
          answer: { kind: 'choice', options: options.map(show), correct: options.indexOf(best) },
          hints: [
            'Compare two at a time and keep the winner.',
            'To compare a/b with c/d, compare a × d with c × b. The larger product goes with the larger fraction.',
          ],
          solution: [
            { text: `Compare two at a time by cross-multiplying, keeping the ${want === 'largest' ? 'larger' : 'smaller'} each time.` },
            ...steps,
            { text: `The ${want} is ${show(best)}.` },
          ],
        };
      },
    },
    {
      id: 'fractions_decimals/decimal-friends',
      idea: 'Treat decimals as fractions',
      buildsOn: 'fractions_decimals/compare',
      generate: rng => {
        const f = pick(rng, FRIENDS);
        if (rng() < 0.6) {
          let k = int(rng, 3, 25);
          if (k % 5 === 0) k += 1;
          const whole = f.d * k;
          const answer = f.n * k;
          return {
            prompt: `Compute ${f.dec} × ${whole}.`,
            answer: { kind: 'number', value: answer },
            hints: [`What fraction is ${f.dec}?`, `${f.dec} = ${frac(f.n, f.d)}, so divide ${whole} by ${f.d}${f.n > 1 ? ` and multiply by ${f.n}` : ''}.`],
            solution: [
              { text: `${f.dec} is the fraction ${frac(f.n, f.d)}.` },
              { text: `${frac(f.n, f.d)} of ${whole}: ${whole} ÷ ${f.d} = ${k}${f.n > 1 ? `, and ${k} × ${f.n} = ${answer}` : ''}.` },
            ],
          };
        }
        const k = int(rng, 3, 15);
        const whole = f.n * k;
        const answer = f.d * k;
        return {
          prompt: `Compute ${whole} ÷ ${f.dec}.`,
          answer: { kind: 'number', value: answer },
          hints: [`What fraction is ${f.dec}?`, `Dividing by ${frac(f.n, f.d)} is the same as multiplying by ${frac(f.d, f.n)}.`],
          solution: [
            { text: `${f.dec} is the fraction ${frac(f.n, f.d)}. Dividing by a fraction is multiplying by its flip, ${frac(f.d, f.n)}.` },
            { text: f.n > 1 ? `${whole} × ${frac(f.d, f.n)}: ${whole} ÷ ${f.n} = ${k}, and ${k} × ${f.d} = ${answer}.` : `${whole} × ${f.d} = ${answer}.` },
          ],
        };
      },
    },
    {
      id: 'fractions_decimals/telescope',
      idea: 'Collapse a telescoping product',
      buildsOn: 'fractions_decimals/decimal-friends',
      generate: rng => {
        const variant = int(rng, 0, 2);

        if (variant === 2) {
          const a = int(rng, 2, 9);
          const b = a + int(rng, 6, 50);
          const [num, den] = reduce(a, b);
          return {
            prompt: `Find the product ${a}/${a + 1} × ${a + 1}/${a + 2} × ${a + 2}/${a + 3} × ⋯ × ${b - 1}/${b}. ${LOWEST}`,
            answer: { kind: 'fraction', num, den },
            hints: [
              'Don\'t multiply anything out. Compare each denominator with the numerator that follows it.',
              'Everything cancels except the first numerator and the last denominator.',
            ],
            solution: [
              { text: `Each denominator is the same as the next numerator, so they cancel in pairs: the ${a + 1}s, the ${a + 2}s, and so on up to the ${b - 1}s.` },
              { text: `Only the first numerator, ${a}, and the last denominator, ${b}, are left: ${a}/${b}${den === b ? '' : ` = ${frac(num, den)} in lowest terms`}.` },
            ],
          };
        }

        const n = int(rng, 8, 60);
        const minus = variant === 0;
        const [num, den] = minus ? [1, n] : reduce(n + 1, 2);
        const sign = minus ? '−' : '+';
        const terms = minus ? `1/2 × 2/3 × 3/4 × ⋯ × ${n - 1}/${n}` : `3/2 × 4/3 × 5/4 × ⋯ × ${n + 1}/${n}`;
        return {
          prompt: `Find the product (1 ${sign} 1/2) × (1 ${sign} 1/3) × (1 ${sign} 1/4) × ⋯ × (1 ${sign} 1/${n}). ${LOWEST}`,
          answer: { kind: 'fraction', num, den },
          hints: [
            `Work out the first few brackets as single fractions. What is 1 ${sign} 1/2? 1 ${sign} 1/3?`,
            `The product is ${terms}. Look at what cancels.`,
          ],
          solution: [
            { text: `Write each bracket as one fraction: the product is ${terms}.` },
            {
              text: minus
                ? 'Each denominator cancels with the numerator that follows it. Only the first numerator and the last denominator survive.'
                : 'Each numerator cancels with the denominator that follows it. Only the first denominator and the last numerator survive.',
            },
            { text: minus ? `That leaves 1/${n}.` : `That leaves ${n + 1}/2${den === 2 ? '' : ` = ${fmt(num)}`}.` },
          ],
        };
      },
    },
  ],
};

export const FRACTION_LESSONS: Lesson[] = [fractionsDecimals];
