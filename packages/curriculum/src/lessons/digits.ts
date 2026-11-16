// Realm V: Number Theory — the units digit.
import type { Lesson, Visual } from './types.ts';
import { fmt, int, pick, pow } from './util.ts';

type Row = { label?: string; text: string };
const working = (rows: Row[]): Visual => ({ kind: 'rows', rows });

const units = (n: number) => n % 10;

/** The repeating units digits of d, d², d³, …  cycle(7) → [7, 9, 3, 1] */
function cycle(d: number): number[] {
  const out = [units(d)];
  for (let x = units(d * d); x !== out[0]; x = units(x * d)) out.push(x);
  return out;
}

/** Units digit of base^exp. */
function powerDigit(base: number, exp: number): number {
  const c = cycle(units(base));
  return c[(exp - 1) % c.length];
}

/** Sentences that find the units digit of base^exp, without the final answer line. */
function powerSteps(base: number, exp: number): string {
  const d = units(base);
  const c = cycle(d);
  const result = powerDigit(base, exp);
  const lead = base > 9 ? `Only the units digit of ${base} matters, so this ends like ${pow(d, exp)}. ` : '';
  if (c.length === 1) return `${lead}Every power of a number ending in ${d} ends in ${d}, so ${pow(base, exp)} ends in ${d}.`;
  if (c.length === 2) {
    return `${lead}Powers of ${d} end in ${c[0]}, ${c[1]}, ${c[0]}, ${c[1]}, …: ${c[0]} for odd exponents and ${c[1]} for even ones. ${exp} is ${exp % 2 ? 'odd' : 'even'}, so ${pow(base, exp)} ends in ${result}.`;
  }
  const r = exp % 4;
  const place = r === 0 ? 'a remainder of 0 means the 4th and last place' : `the remainder points to place ${r}`;
  return `${lead}Powers of ${d} end in ${c.join(', ')}, and then repeat, a cycle of length 4. ${exp} ÷ 4 = ${Math.floor(exp / 4)} remainder ${r}, and ${place} in the cycle. So ${pow(base, exp)} ends in ${result}.`;
}

/** A number of the given length ending in a chosen digit. */
const ending = (rng: () => number, d: number, lo: number, hi: number) => int(rng, lo, hi) * 10 + d;

const unitsDigit: Lesson = {
  topic: 'units_digit',
  intro: [
    {
      text: 'What is the units digit of 37 × 84? You do not need the whole product. Split 84 into 80 + 4 and tap the two pieces. The 37 × 80 piece is a multiple of 10, so it ends in 0 and cannot touch the units place. Only 37 × 4 matters, and by the same argument only the 7 of the 37 matters there. So the units digit comes from the units digits alone: 7 × 4 = 28, and the product ends in 8.',
      visual: { kind: 'area', height: 37, widths: [80, 4] },
    },
    {
      text: 'The same is true for adding and subtracting. So in any calculation built from +, − and ×, you may throw away everything but the units digits as you go. The units digit of 123 × 456 + 789 is the units digit of 3 × 6 + 9 = 27, which is 7.',
    },
    {
      text: 'Now the big idea. Look at the units digits of the powers of 7. Each one is the previous units digit times 7, so once a digit comes back, everything after it repeats.',
      visual: working([
        { label: '7¹', text: '7' },
        { label: '7²', text: '49 → ends in 9' },
        { label: '7³', text: '9 × 7 = 63 → ends in 3' },
        { label: '7⁴', text: '3 × 7 = 21 → ends in 1' },
        { label: '7⁵', text: '1 × 7 = 7 → back to 7' },
      ]),
    },
    {
      text: 'So the units digits of the powers of 7 run 7, 9, 3, 1, 7, 9, 3, 1, … in a cycle of length 4. What does 7¹⁰⁰ end in? Divide the exponent by 4 to see where it lands in the cycle. 100 ÷ 4 = 25 remainder 0, which means it lands exactly on the end of a cycle, the 4th place. So 7¹⁰⁰ ends in 1.',
    },
    {
      text: 'Every digit has a cycle, and none is longer than 4. Powers of 0, 1, 5 and 6 never change their units digit. Powers of 4 alternate 4, 6 and powers of 9 alternate 9, 1. Powers of 2 run 2, 4, 8, 6; powers of 3 run 3, 9, 7, 1; powers of 8 run 8, 4, 2, 6. You never need to memorize these. Multiply by the digit a few times and the cycle shows itself.',
    },
  ],
  rungs: [
    {
      id: 'units_digit/arithmetic',
      idea: 'Only the units digits matter',
      buildsOn: 'clever_calc/distribute',
      generate: rng => {
        const nonzero = () => pick(rng, [2, 3, 4, 6, 7, 8, 9]);
        const variant = int(rng, 0, 2);
        if (variant === 0) {
          const ds = [nonzero(), nonzero(), nonzero()];
          const ns = ds.map(d => ending(rng, d, 10, 999));
          const step = units(ds[0] * ds[1]);
          const answer = units(step * ds[2]);
          return {
            prompt: `What is the units digit of ${ns.map(fmt).join(' × ')}?`,
            answer: { kind: 'number', value: answer },
            hints: ['Do not multiply the whole numbers. Which digits decide the units digit of a product?', `Only the units digits: ${ds.join(' × ')}. And you can drop the tens digit after each step.`],
            solution: [
              { text: `The units digit of a product depends only on the units digits of its factors, so work with ${ds.join(' × ')}.` },
              { text: `${ds[0]} × ${ds[1]} = ${ds[0] * ds[1]}, which ends in ${step}. Then ${step} × ${ds[2]} = ${step * ds[2]}, which ends in ${answer}.` },
            ],
          };
        }
        if (variant === 1) {
          const ds = [nonzero(), nonzero(), nonzero(), nonzero()];
          const ns = ds.map(d => ending(rng, d, 10, 99));
          const [p1, p2] = [units(ds[0] * ds[1]), units(ds[2] * ds[3])];
          const answer = units(p1 + p2);
          return {
            prompt: `What is the units digit of ${ns[0]} × ${ns[1]} + ${ns[2]} × ${ns[3]}?`,
            answer: { kind: 'number', value: answer },
            hints: ['Find the units digit of each product separately, using only units digits.', `The products end like ${ds[0]} × ${ds[1]} and ${ds[2]} × ${ds[3]}. Then add those two units digits.`],
            solution: [
              { text: `${ns[0]} × ${ns[1]} ends like ${ds[0]} × ${ds[1]} = ${ds[0] * ds[1]}, so in ${p1}. ${ns[2]} × ${ns[3]} ends like ${ds[2]} × ${ds[3]} = ${ds[2] * ds[3]}, so in ${p2}.` },
              { text: `The sum ends like ${p1} + ${p2} = ${p1 + p2}, so its units digit is ${answer}.` },
            ],
          };
        }
        const d = nonzero();
        const n = ending(rng, d, 10, 999);
        const sq = units(d * d);
        const answer = units(sq * d);
        return {
          prompt: `What is the units digit of ${fmt(n)}³?`,
          answer: { kind: 'number', value: answer },
          hints: [`${fmt(n)}³ is ${fmt(n)} × ${fmt(n)} × ${fmt(n)}. Which digit decides how it ends?`, `Work out ${d} × ${d} × ${d}, keeping only the units digit at each step.`],
          solution: [
            { text: `Only the units digit, ${d}, matters: ${fmt(n)}³ ends like ${d}³.` },
            { text: `${d} × ${d} = ${d * d}, which ends in ${sq}. Then ${sq} × ${d} = ${sq * d}, which ends in ${answer}.` },
          ],
        };
      },
    },
    {
      id: 'units_digit/cycle',
      idea: 'Powers run in a cycle of 4',
      buildsOn: 'units_digit/arithmetic',
      generate: rng => {
        const d = pick(rng, [2, 3, 7, 8]);
        const base = rng() < 0.5 ? d : ending(rng, d, 1, 9);
        const exp = int(rng, 11, 120);
        const c = cycle(d);
        const answer = powerDigit(base, exp);
        const r = exp % 4;
        return {
          prompt: `What is the units digit of ${pow(base, exp)}?`,
          answer: { kind: 'number', value: answer },
          hints: [
            `Write down the units digits of ${pow(d, 1)}, ${pow(d, 2)}, ${pow(d, 3)}, ${pow(d, 4)}, ${pow(d, 5)}. What happens?`,
            `They cycle: ${c.join(', ')}. Divide ${exp} by 4 and use the remainder to find the place in the cycle.`,
          ],
          solution: [
            {
              text: `${base > 9 ? `Only the units digit of ${base} matters, so look at powers of ${d}. ` : ''}Each units digit is the one before it times ${d}.`,
              visual: working([
                ...c.map((x, i) => ({ label: pow(d, i + 1), text: `ends in ${x}` })),
                { label: pow(d, 5), text: `ends in ${c[0]} again` },
              ]),
            },
            { text: `The units digits repeat every 4 powers: ${c.join(', ')}. To find where the exponent ${exp} lands, divide by 4: ${exp} ÷ 4 = ${Math.floor(exp / 4)} remainder ${r}.` },
            { text: r === 0 ? `A remainder of 0 means it lands on the last place in the cycle, so ${pow(base, exp)} ends in ${answer}.` : `A remainder of ${r} means place ${r} in the cycle, so ${pow(base, exp)} ends in ${answer}.` },
          ],
        };
      },
    },
    {
      id: 'units_digit/short-cycles',
      idea: 'Find each digit\'s own cycle',
      buildsOn: 'units_digit/cycle',
      generate: rng => {
        const d = pick(rng, [4, 9, 4, 9, 5, 6, 1, 2, 3, 7, 8]);
        const base = ending(rng, d, 1, 99);
        const exp = int(rng, 15, 300);
        const c = cycle(d);
        return {
          prompt: `What is the units digit of ${pow(base, exp)}?`,
          answer: { kind: 'number', value: powerDigit(base, exp) },
          hints: [
            `Only the units digit of ${base} matters. Find the first few powers of ${d} and watch their units digits.`,
            c.length === 1 ? `Every power of ${d} ends in ${d}.` : c.length === 2 ? `They alternate ${c[0]}, ${c[1]}. Is ${exp} odd or even?` : `They cycle ${c.join(', ')}. What is the remainder when ${exp} is divided by 4?`,
          ],
          solution: [
            { text: powerSteps(base, exp) },
            ...(c.length === 4 ? [{ text: `Quick remainder: only the last two digits of ${exp} matter when dividing by 4, since 100 is a multiple of 4.` }] : []),
          ],
        };
      },
    },
    {
      id: 'units_digit/combined',
      idea: 'Put the pieces together',
      buildsOn: 'units_digit/short-cycles',
      generate: rng => {
        const variant = rng() < 0.12 ? 2 : int(rng, 0, 1);
        if (variant === 2) {
          const n = int(rng, 6, 99);
          return {
            prompt: `What is the units digit of 1! + 2! + 3! + ⋯ + ${n}!?`,
            answer: { kind: 'number', value: 3 },
            hints: ['Work out the first several factorials. What happens to their units digits?', '5! = 120 ends in 0, and so does every factorial after it, because each contains 2 × 5.'],
            solution: [
              { text: 'Look at the first few: 1! = 1, 2! = 2, 3! = 6, 4! = 24, 5! = 120.' },
              { text: 'From 5! onward, every factorial contains the factors 2 and 5, so it is a multiple of 10 and ends in 0. Those terms cannot affect the units digit.' },
              { text: `Only the first four matter: 1 + 2 + 6 + 24 = 33. The units digit is 3, no matter how far the sum goes.` },
            ],
          };
        }
        let b1: number, b2: number;
        do [b1, b2] = [pick(rng, [2, 3, 4, 7, 8, 9]), pick(rng, [2, 3, 4, 7, 8, 9])];
        while (b1 === b2);
        const [e1, e2] = [int(rng, 10, 99), int(rng, 10, 99)];
        const [d1, d2] = [powerDigit(b1, e1), powerDigit(b2, e2)];
        const sum = variant === 0;
        const answer = sum ? units(d1 + d2) : units(d1 * d2);
        return {
          prompt: `What is the units digit of ${pow(b1, e1)} ${sum ? '+' : '×'} ${pow(b2, e2)}?`,
          answer: { kind: 'number', value: answer },
          hints: [
            'Find the units digit of each power separately, then combine just those two digits.',
            `${pow(b1, e1)} ends in ${d1}. Now find how ${pow(b2, e2)} ends.`,
          ],
          solution: [
            { text: powerSteps(b1, e1) },
            { text: powerSteps(b2, e2) },
            { text: `The ${sum ? 'sum' : 'product'} ends like ${d1} ${sum ? '+' : '×'} ${d2} = ${sum ? d1 + d2 : d1 * d2}, so its units digit is ${answer}.` },
          ],
        };
      },
    },
  ],
};

export const DIGIT_LESSONS: Lesson[] = [unitsDigit];
