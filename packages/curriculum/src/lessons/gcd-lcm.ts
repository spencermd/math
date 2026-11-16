// Realm V: Number Theory — greatest common divisors and least common multiples.
import type { Lesson, Rng, Visual } from './types.ts';
import { factored, factorize, fmt, gcd, int, pick, type Factorization } from './util.ts';

type Row = { label?: string; text: string };
const working = (rows: Row[]): Visual => ({ kind: 'rows', rows });

/** For each prime in either number, keep the smaller exponent (GCD) or the larger (LCM). */
function combine(a: number, b: number, choose: (x: number, y: number) => number): Factorization {
  const [fa, fb] = [new Map(factorize(a)), new Map(factorize(b))];
  const primes = [...new Set([...fa.keys(), ...fb.keys()])].sort((x, y) => x - y);
  return primes.map(p => [p, choose(fa.get(p) ?? 0, fb.get(p) ?? 0)] as [number, number]).filter(([, e]) => e > 0);
}

/** Working that finds the GCD or LCM of two numbers from their factorizations. */
function factorRows(a: number, b: number, want: 'GCD' | 'LCM'): Row[] {
  const f = combine(a, b, want === 'GCD' ? Math.min : Math.max);
  const value = f.reduce((n, [p, e]) => n * p ** e, 1);
  return [
    { label: `${a}`, text: `= ${factored(factorize(a))}` },
    { label: `${b}`, text: `= ${factored(factorize(b))}` },
    { label: want, text: `${factored(f)} = ${fmt(value)}` },
  ];
}

/** Two numbers that share a factor, neither a multiple of the other. Returns [a, b, gcd]. */
function pair(rng: Rng, max: number): [number, number, number] {
  for (;;) {
    const g = pick(rng, [2, 3, 4, 5, 6, 6, 8, 9, 10, 12, 12, 14, 15, 18, 20]);
    const [m, n] = [int(rng, 2, 9), int(rng, 2, 9)];
    if (m === n || gcd(m, n) !== 1) continue;
    const [a, b] = [g * m, g * n];
    if (Math.max(a, b) <= max && Math.min(a, b) >= 12) return [a, b, g];
  }
}

const gcdLcm: Lesson = {
  topic: 'gcd_lcm',
  intro: [
    {
      text: 'The greatest common divisor (GCD) of two numbers is the largest number that divides both. Listing factors works for small numbers, but prime factorizations work for everything. A common divisor can only use primes that both numbers have, and only as many of each as both have. So for each prime, take the smaller exponent.',
      visual: working([
        { label: '72', text: '= 2³ × 3²' },
        { label: '120', text: '= 2³ × 3 × 5' },
        { label: 'GCD', text: '2³ × 3 = 24' },
      ]),
    },
    {
      text: 'The least common multiple (LCM) is the smallest number that both divide into. A common multiple must contain every prime that either number has, as many times as the greedier of the two demands. So for each prime, take the larger exponent.',
      visual: working([
        { label: '72', text: '= 2³ × 3²' },
        { label: '120', text: '= 2³ × 3 × 5' },
        { label: 'LCM', text: '2³ × 3² × 5 = 360' },
      ]),
    },
    {
      text: 'Now a small miracle: 24 × 360 = 8,640, and 72 × 120 = 8,640 too. For any two numbers, GCD × LCM equals their product. The reason is in the exponents. For each prime, the GCD took the smaller exponent and the LCM took the larger, so between them they used both, which is exactly what the product of the two numbers uses.',
    },
    {
      text: 'That gives a fast route to an LCM when you can see the GCD. For 18 and 24 the GCD is clearly 6, so the LCM is 18 × 24 ÷ 6. Divide first: 18 ÷ 6 = 3, and 3 × 24 = 72.',
    },
    {
      text: 'In word problems, neither will be named. "When do they next happen together?" is an LCM: buses leaving every 12 and every 18 minutes next leave together after 36 minutes. "What is the largest size that fits both exactly?" is a GCD: the biggest square tile for a 12-by-18 floor is 6 by 6.',
    },
  ],
  rungs: [
    {
      id: 'gcd_lcm/gcd',
      idea: 'GCD: the smaller exponent of each prime',
      buildsOn: 'prime_factorization/factor',
      generate: rng => {
        const [a, b, g] = pair(rng, 200);
        return {
          prompt: `What is the greatest common divisor of ${a} and ${b}?`,
          answer: { kind: 'number', value: g },
          hints: [
            'Write the prime factorization of each number.',
            `${a} = ${factored(factorize(a))} and ${b} = ${factored(factorize(b))}. Keep only the primes they share, with the smaller exponent.`,
          ],
          solution: [
            {
              text: 'Factor both numbers. A common divisor can only use the primes that appear in both, so for each prime take the smaller exponent. A prime missing from one number is left out.',
              visual: working(factorRows(a, b, 'GCD')),
            },
            { text: `Check: ${a} = ${g} × ${a / g} and ${b} = ${g} × ${b / g}, and ${a / g} and ${b / g} have no common factor left.` },
          ],
        };
      },
    },
    {
      id: 'gcd_lcm/lcm',
      idea: 'LCM: the larger exponent of each prime',
      buildsOn: 'gcd_lcm/gcd',
      generate: rng => {
        const [a, b, g] = pair(rng, 90);
        const l = (a / g) * b;
        return {
          prompt: `What is the least common multiple of ${a} and ${b}?`,
          answer: { kind: 'number', value: l },
          hints: [
            'Write the prime factorization of each number.',
            `${a} = ${factored(factorize(a))} and ${b} = ${factored(factorize(b))}. Take every prime that appears, with the larger exponent.`,
          ],
          solution: [
            {
              text: 'Factor both numbers. A common multiple needs every prime that appears in either one, as many times as the larger exponent says.',
              visual: working(factorRows(a, b, 'LCM')),
            },
            { text: `Or use the GCD, which is ${g}: the LCM is ${a} × ${b} ÷ ${g}. Divide first, ${a} ÷ ${g} = ${a / g}, then ${a / g} × ${b} = ${fmt(l)}.` },
          ],
        };
      },
    },
    {
      id: 'gcd_lcm/product',
      idea: 'GCD × LCM = the product',
      buildsOn: 'gcd_lcm/lcm',
      generate: rng => {
        const [a, b, g] = pair(rng, 120);
        const l = (a / g) * b;
        if (rng() < 0.5) {
          return {
            prompt: `Two whole numbers have a greatest common divisor of ${g} and a least common multiple of ${fmt(l)}. One of the numbers is ${a}. What is the other?`,
            answer: { kind: 'number', value: b },
            hints: [
              'For any two numbers, GCD × LCM equals the product of the two numbers.',
              `${a} × (the other number) = ${g} × ${fmt(l)}. Divide ${fmt(l)} by ${a} before you multiply.`,
            ],
            solution: [
              {
                text: 'The GCD times the LCM equals the product of the two numbers.',
                visual: working([
                  { label: 'The rule', text: `${a} × n = ${g} × ${fmt(l)}` },
                  { label: `Divide by ${a}`, text: `n = ${g} × ${fmt(l)} ÷ ${a}` },
                  { label: 'Divide first', text: `n = ${g} × ${l / a}` },
                  { text: `n = ${b}` },
                ]),
              },
              { text: `Never multiply ${g} × ${fmt(l)} out. ${fmt(l)} ÷ ${a} = ${l / a} keeps the numbers small.` },
            ],
          };
        }
        return {
          prompt: `The product of two whole numbers is ${fmt(a * b)}, and their greatest common divisor is ${g}. What is their least common multiple?`,
          answer: { kind: 'number', value: l },
          hints: [
            'For any two numbers, GCD × LCM equals the product of the two numbers.',
            `${g} × LCM = ${fmt(a * b)}.`,
          ],
          solution: [
            { text: 'You are not told the two numbers, and you do not need them. The GCD times the LCM equals their product.' },
            { text: `${g} × LCM = ${fmt(a * b)}, so the LCM is ${fmt(a * b)} ÷ ${g} = ${fmt(l)}.` },
            { text: `(The numbers could have been ${a} and ${b}.)` },
          ],
        };
      },
    },
    {
      id: 'gcd_lcm/stories',
      idea: 'Spot which one the story wants',
      buildsOn: 'gcd_lcm/product',
      generate: rng => {
        const [a, b, g] = pair(rng, 72);
        const l = (a / g) * b;
        const variant = int(rng, 0, 3);
        if (variant === 0) {
          return {
            prompt: `One bus leaves the station every ${a} minutes and another leaves every ${b} minutes. Both leave at noon. How many minutes after noon will they next leave at the same time?`,
            answer: { kind: 'number', value: l },
            hints: [
              `The first bus leaves at multiples of ${a} minutes, the second at multiples of ${b}. When do the two lists first agree?`,
              `You need the least common multiple of ${a} and ${b}.`,
            ],
            solution: [
              { text: `The first bus leaves ${a}, ${2 * a}, ${3 * a}, … minutes after noon, and the second leaves ${b}, ${2 * b}, ${3 * b}, … minutes after. They leave together at a common multiple, and the next time is the least one.`, visual: working(factorRows(a, b, 'LCM')) },
              { text: `They next leave together ${fmt(l)} minutes after noon.` },
            ],
          };
        }
        if (variant === 1) {
          return {
            prompt: `A rectangular floor measures ${a} feet by ${b} feet. It is to be covered completely with identical square tiles, with no cutting. What is the side length, in feet, of the largest tile that can be used?`,
            answer: { kind: 'number', value: g },
            hints: [
              'The tiles must fit exactly along both sides. What does that say about the tile size?',
              `The side length must divide both ${a} and ${b}, and you want the largest such number.`,
            ],
            solution: [
              { text: `A whole number of tiles must fit along each side, so the tile's side length divides both ${a} and ${b}. The largest such length is the greatest common divisor.`, visual: working(factorRows(a, b, 'GCD')) },
              { text: `The tiles are ${g} feet on a side, laid ${a / g} by ${b / g}.` },
            ],
          };
        }
        if (variant === 2) {
          return {
            prompt: `A teacher has ${a} pencils and ${b} erasers. She wants to make identical gift bags using all of them, so every bag gets the same number of pencils and the same number of erasers. What is the greatest number of bags she can make?`,
            answer: { kind: 'number', value: g },
            hints: [
              'The pencils must split evenly among the bags, and so must the erasers.',
              `The number of bags must divide both ${a} and ${b}, and you want the largest such number.`,
            ],
            solution: [
              { text: `The number of bags has to divide ${a} (so the pencils share out evenly) and ${b} (so the erasers do). The greatest number that divides both is the GCD.`, visual: working(factorRows(a, b, 'GCD')) },
              { text: `She can make ${g} bags, each with ${a / g} pencils and ${b / g} erasers.` },
            ],
          };
        }
        return {
          prompt: `Hot dogs come in packs of ${a} and buns come in packs of ${b}. What is the smallest number of hot dogs you can buy so that you can also buy exactly the same number of buns?`,
          answer: { kind: 'number', value: l },
          hints: [
            `The number of hot dogs is a multiple of ${a}. The number of buns is a multiple of ${b}. They must be equal.`,
            `You need the least common multiple of ${a} and ${b}.`,
          ],
          solution: [
            { text: `The number bought must be a multiple of ${a} and also a multiple of ${b}. The smallest such number is the least common multiple.`, visual: working(factorRows(a, b, 'LCM')) },
            { text: `That is ${fmt(l)} of each: ${l / a} packs of hot dogs and ${l / b} packs of buns.` },
          ],
        };
      },
    },
  ],
};

export const GCD_LCM_LESSONS: Lesson[] = [gcdLcm];
