// Realm V: Number Theory — factor tricks, factorials, and modular arithmetic.
import type { Lesson } from './types.ts';
import { factored, factorize, fmt, int, pick, pow, sup, working } from './util.ts';

const divisorCount = (n: number) => factorize(n).reduce((d, [, e]) => d * (e + 1), 1);

/** "1 + 2 + 4 + 8" */
const powerSum = (p: number, a: number) => Array.from({ length: a + 1 }, (_, i) => p ** i).join(' + ');
const powerSumValue = (p: number, a: number) => (p ** (a + 1) - 1) / (p - 1);

/** Ways to write d as a product of factors ≥ 2 in non-increasing order: 12 → [12], [6,2], [4,3], [3,2,2]. */
function shapes(d: number, max = d): number[][] {
  if (d === 1) return [[]];
  const out: number[][] = [];
  for (let f = Math.min(d, max); f >= 2; f--) {
    if (d % f === 0) for (const rest of shapes(d / f, f)) out.push([f, ...rest]);
  }
  return out;
}
const SMALL_PRIMES = [2, 3, 5, 7, 11];

// ── Factor Tricks ────────────────────────────────────────────────────────────

const factorTricks: Lesson = {
  topic: 'factor_tricks',
  intro: [
    {
      text: 'Factors come in pairs that multiply to the number. For 36: 1 × 36, 2 × 18, 3 × 12, 4 × 9, and then 6 × 6. That last pair is a factor paired with itself, so it only counts once. That is why 36 has an odd number of factors (nine), and it happens exactly when the number is a perfect square.',
      visual: { kind: 'divisor-grid', p: 2, a: 2, q: 3, b: 2 },
    },
    {
      text: 'The classic use is the locker problem. 100 lockers start closed. Student 1 toggles every locker, student 2 toggles every 2nd locker, student 3 every 3rd, and so on up to student 100. Locker n gets toggled once for each factor of n, so it ends up open only if n has an odd number of factors. The open lockers are the perfect squares: 1, 4, 9, …, 100. Ten lockers.',
    },
    {
      text: 'Pairing also gives the PRODUCT of all the factors. The factors of 12 are 1, 2, 3, 4, 6, 12: three pairs, each multiplying to 12. So the product of all six is 12³. In general a number n with d factors has factor product n^(d/2).',
      visual: working([
        { label: 'Pairs', text: '(1 × 12)(2 × 6)(3 × 4)' },
        { label: 'Each pair', text: '12' },
        { label: 'Product', text: '12³ = 1,728' },
      ]),
    },
    {
      text: 'For the SUM of the factors, use the prime factorization. Every factor of 12 = 2² × 3 is a power of 2 (1, 2 or 4) times a power of 3 (1 or 3). Multiply out (1 + 2 + 4)(1 + 3) and you get every one of those products exactly once.',
      visual: working([
        { label: 'Factor', text: '12 = 2² × 3' },
        { label: 'One bracket per prime', text: '(1 + 2 + 4)(1 + 3)' },
        { label: 'Sum of factors', text: '7 × 4 = 28' },
        { label: 'Check', text: '1 + 2 + 3 + 4 + 6 + 12 = 28' },
      ]),
    },
    {
      text: 'Finally, run factor counting in reverse. Which numbers have exactly 6 factors? The exponents plus one must multiply to 6, so the shape is p⁵ or p² × q. The smallest of each shape is 2⁵ = 32 and 2² × 3 = 12, so the smallest number with exactly 6 factors is 12. Give the big exponents to the small primes.',
    },
  ],
  rungs: [
    {
      id: 'factor_tricks/odd-count',
      idea: 'Only squares have an odd number of factors',
      buildsOn: 'factor_counting/from-number',
      generate: rng => {
        const variant = int(rng, 0, 2);
        if (variant === 2) {
          const N = int(rng, 30, 400);
          const primes = [2, 3, 5, 7, 11, 13, 17, 19].filter(q => q * q <= N);
          return {
            prompt: `How many positive integers less than or equal to ${N} have exactly 3 positive factors?`,
            answer: { kind: 'number', value: primes.length },
            hints: [
              'Three is odd, so the number must be a perfect square. Which squares have exactly 3 factors?',
              'If n = k², the factors are 1, k, k² and nothing else. That forces k to be prime.',
            ],
            solution: [
              { text: 'An odd number of factors means a perfect square. For exactly 3 factors the shape must be p² with p prime, whose factors are 1, p and p².' },
              {
                text: `So count the primes whose squares are at most ${N}.`,
                visual: working([
                  { label: 'Squares of primes', text: primes.map(q => `${q}² = ${q * q}`).join(', ') },
                  { label: 'Next one', text: `${[2, 3, 5, 7, 11, 13, 17, 19, 23][primes.length]}² = ${[2, 3, 5, 7, 11, 13, 17, 19, 23][primes.length] ** 2} is too big` },
                  { label: 'Count', text: `${primes.length}` },
                ]),
              },
            ],
          };
        }
        const N = pick(rng, [50, 75, 100, 120, 150, 200, 250, 300, 500, 750, 1000, int(rng, 40, 900)]);
        const k = Math.floor(Math.sqrt(N));
        return {
          prompt:
            variant === 0
              ? `How many of the integers from 1 to ${fmt(N)} have an odd number of positive factors?`
              : `A hallway has ${fmt(N)} closed lockers, numbered 1 to ${fmt(N)}. Student 1 toggles every locker, student 2 toggles every 2nd locker, student 3 every 3rd, and so on through student ${fmt(N)}. How many lockers are open at the end?`,
          answer: { kind: 'number', value: k },
          hints: [
            variant === 0 ? 'Factors pair up, unless one is paired with itself.' : 'Locker n is toggled once for each factor of n. Which lockers get toggled an odd number of times?',
            `Only perfect squares have an odd number of factors. How many perfect squares are there up to ${fmt(N)}?`,
          ],
          solution: [
            { text: `${variant === 1 ? 'Locker n is toggled by student k exactly when k divides n, so it ends open when n has an odd number of factors. ' : ''}Factors come in pairs that multiply to n, and the count is odd only when some factor pairs with itself: n is a perfect square.` },
            {
              text: `Count the perfect squares up to ${fmt(N)}.`,
              visual: working([
                { label: 'Largest square', text: `${k}² = ${fmt(k * k)}` },
                { label: 'Too big', text: `${k + 1}² = ${fmt((k + 1) ** 2)}` },
                { label: 'Squares', text: `1², 2², …, ${k}²: ${k} of them` },
              ]),
            },
          ],
        };
      },
    },
    {
      id: 'factor_tricks/sum',
      idea: 'Sum of the factors: one bracket per prime',
      buildsOn: 'factor_tricks/odd-count',
      generate: rng => {
        const [p, q] = pick(rng, [[2, 3], [2, 5], [2, 7], [3, 5], [2, 3], [3, 7], [2, 11]] as const);
        const a = int(rng, 1, p === 2 ? 4 : 2);
        const b = int(rng, 1, q === 3 ? 2 : 1);
        const n = p ** a * q ** b;
        const [sp, sq] = [powerSumValue(p, a), powerSumValue(q, b)];
        return {
          prompt: `What is the sum of all the positive factors of ${n}?`,
          answer: { kind: 'number', value: sp * sq },
          hints: [
            `Factor it: ${n} = ${factored(factorize(n))}.`,
            `Make one bracket for each prime, holding all of its powers: (${powerSum(p, a)})(${powerSum(q, b)}).`,
          ],
          solution: [
            { text: `${n} = ${factored(factorize(n))}. Every factor is a power of ${p} times a power of ${q}, so expanding the product of the two brackets below produces each factor once.` },
            {
              text: 'Add inside each bracket, then multiply.',
              visual: working([
                { label: 'Brackets', text: `(${powerSum(p, a)})(${powerSum(q, b)})` },
                { label: 'Add', text: `${sp} × ${sq}` },
                { label: 'Sum of factors', text: `${fmt(sp * sq)}` },
              ]),
            },
          ],
        };
      },
    },
    {
      id: 'factor_tricks/product',
      idea: 'Product of the factors: pair them up',
      buildsOn: 'factor_tricks/sum',
      generate: rng => {
        if (rng() < 0.65) {
          const n = pick(rng, [12, 18, 20, 24, 28, 30, 40, 42, 45, 48, 50, 54, 60, 72, 84, 90, 96]);
          const d = divisorCount(n);
          return {
            prompt: `The product of all the positive factors of ${n} can be written as ${n}ᵏ. What is k?`,
            answer: { kind: 'number', value: d / 2 },
            hints: [
              `Pair each factor with its partner: the two multiply to ${n}. How many pairs are there?`,
              `${n} = ${factored(factorize(n))} has ${d} factors, so there are ${d / 2} pairs.`,
            ],
            solution: [
              {
                text: `Count the factors of ${n}, then pair them off. Each pair multiplies to ${n}.`,
                visual: working([
                  { label: 'Factorization', text: `${n} = ${factored(factorize(n))}` },
                  { label: 'Number of factors', text: `${factorize(n).map(([, e]) => `(${e} + 1)`).join('')} = ${d}` },
                  { label: 'Pairs', text: `${d} ÷ 2 = ${d / 2}` },
                  { label: 'Product', text: `${n}${sup(d / 2)}, so k = ${d / 2}` },
                ]),
              },
            ],
          };
        }
        const m = pick(rng, [4, 6, 9, 10, 12, 8]);
        const n = m * m;
        const d = divisorCount(n);
        return {
          prompt: `The product of all the positive factors of ${n} can be written as ${m}ᵏ. What is k?`,
          answer: { kind: 'number', value: d },
          hints: [
            `${n} is a perfect square, so one factor, ${m}, is paired with itself.`,
            `${n} has ${d} factors: ${(d - 1) / 2} pairs that each multiply to ${n} = ${m}², plus the lone factor ${m}.`,
          ],
          solution: [
            {
              text: `${n} = ${m}² is a perfect square, so its factors form pairs plus one leftover in the middle.`,
              visual: working([
                { label: 'Number of factors', text: `${n} = ${factored(factorize(n))} has ${d}` },
                { label: 'Pairs', text: `${(d - 1) / 2} pairs, each with product ${n} = ${m}²` },
                { label: 'Leftover', text: `${m}` },
                { label: 'Product', text: `(${m}²)${sup((d - 1) / 2)} × ${m} = ${m}${sup(d)}, so k = ${d}` },
              ]),
            },
            { text: `The general rule n^(d/2) still works: ${n}^(${d}/2) = ${m}${sup(d)}.` },
          ],
        };
      },
    },
    {
      id: 'factor_tricks/smallest',
      idea: 'Smallest number with a given number of factors',
      buildsOn: 'factor_counting/from-factorization',
      generate: rng => {
        const d = pick(rng, [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20]);
        const options = shapes(d).map(shape => {
          const f = shape.map((s, i): [number, number] => [SMALL_PRIMES[i], s - 1]);
          return { shape, text: factored(f), value: f.reduce((n, [q, e]) => n * q ** e, 1) };
        });
        const best = options.reduce((x, y) => (y.value < x.value ? y : x));
        return {
          prompt: `What is the smallest positive integer that has exactly ${d} positive factors?`,
          answer: { kind: 'number', value: best.value },
          hints: [
            `The number of factors is the product of (exponent + 1) over the primes. In what ways can ${d} be written as such a product?`,
            `The possibilities are ${options.map(o => o.shape.join(' × ')).join(', ')}. For each, subtract 1 to get exponents and give the biggest exponents to the smallest primes.`,
          ],
          solution: [
            { text: `If n = pᵃ × qᵇ × …, it has (a + 1)(b + 1)… factors. So list every way to write ${d} as a product, turn each into exponents, and use the smallest primes, biggest exponent on 2.` },
            {
              text: 'Compare the smallest number of each shape.',
              visual: working(
                options.map(o => ({
                  label: o.shape.join(' × '),
                  text: `exponents ${o.shape.map(s => s - 1).join(', ')}: ${o.text} = ${fmt(o.value)}`,
                })),
              ),
            },
            { text: `The smallest is ${fmt(best.value)} = ${best.text}.` },
          ],
        };
      },
    },
  ],
};

// ── Factorials & Trailing Zeros ──────────────────────────────────────────────

/** Exponent of the prime p in n!, with the terms of Legendre's sum. */
function legendre(n: number, p: number): { terms: number[]; total: number } {
  const terms: number[] = [];
  for (let q = p; q <= n; q *= p) terms.push(Math.floor(n / q));
  return { terms, total: terms.reduce((a, b) => a + b, 0) };
}

const legendreRows = (n: number, p: number) => {
  const { terms, total } = legendre(n, p);
  return [
    ...terms.map((t, i) => ({ label: `Multiples of ${fmt(p ** (i + 1))}`, text: `${fmt(n)} ÷ ${fmt(p ** (i + 1))} → ${t}${i === 0 ? '' : ' (each hides one more)'}` })),
    { label: 'Total', text: terms.length > 1 ? `${terms.join(' + ')} = ${total}` : `${total}` },
  ];
};

const factorialsNt: Lesson = {
  topic: 'factorials_nt',
  intro: [
    {
      text: 'Factorials get enormous quickly: 10! is already 3,628,800. The first survival skill is never to multiply them out. In a fraction of factorials, the bigger one contains the smaller one, so almost everything cancels.',
      visual: working([
        { label: 'Expand the top a little', text: '12! = 12 × 11 × 10!' },
        { label: 'Cancel', text: '12! ÷ 10! = 12 × 11' },
        { label: 'So', text: '132' },
      ]),
    },
    {
      text: 'Now the famous question: how many zeros are at the end of 100!? A trailing zero is a factor of 10, and 10 = 2 × 5. In a factorial there are far more 2s than 5s, so each 5 finds a partner. The number of trailing zeros is the number of 5s in the prime factorization of 100!.',
    },
    {
      text: 'Count the 5s. Every multiple of 5 up to 100 contributes one: that is 20. But 25, 50, 75 and 100 are multiples of 25 and each hide a SECOND 5, which you have not counted yet: 4 more. The next power, 125, is past 100. So 100! ends in 24 zeros.',
      visual: working([
        { label: 'Multiples of 5', text: '100 ÷ 5 = 20' },
        { label: 'Multiples of 25', text: '100 ÷ 25 = 4 (each hides one more)' },
        { label: 'Total 5s', text: '20 + 4 = 24' },
      ]),
    },
    {
      text: 'The same count works for any prime: divide n by p, by p², by p³, …, drop the remainders, and add. The power of 3 in 20! is 6 + 2 = 8, from 20 ÷ 3 → 6 and 20 ÷ 9 → 2. For a composite number, count each prime it needs. Since 12 = 2² × 3, the number of 12s you can pull out of n! is limited by how many pairs of 2s there are and how many 3s there are, whichever runs out first.',
    },
  ],
  rungs: [
    {
      id: 'factorials_nt/cancel',
      idea: 'Cancel before you multiply',
      buildsOn: 'permutations/factorials',
      generate: rng => {
        const variant = int(rng, 0, 2);
        const n = int(rng, 6, 30);
        if (variant === 0) {
          const k = pick(rng, [2, 2, 3]);
          const value = k === 2 ? n * (n - 1) : n * (n - 1) * (n - 2);
          const prod = Array.from({ length: k }, (_, i) => n - i).join(' × ');
          return {
            prompt: `What is ${n}! ÷ ${n - k}!?`,
            answer: { kind: 'number', value },
            hints: [`${n}! contains all of ${n - k}! inside it.`, `${n}! = ${prod} × ${n - k}!.`],
            solution: [
              {
                text: `Peel factors off ${n}! until you reach ${n - k}!, then cancel.`,
                visual: working([
                  { label: 'Rewrite', text: `${n}! = ${prod} × ${n - k}!` },
                  { label: 'Cancel', text: prod },
                  { label: 'So', text: fmt(value) },
                ]),
              },
            ],
          };
        }
        if (variant === 1) {
          return {
            prompt: `What is (${n}! + ${n + 1}!) ÷ ${n}!?`,
            answer: { kind: 'number', value: n + 2 },
            hints: [`Write ${n + 1}! as ${n + 1} × ${n}!.`, `Factor ${n}! out of the top: ${n}!(1 + ${n + 1}).`],
            solution: [
              {
                text: `Both terms on top contain ${n}!, so factor it out.`,
                visual: working([
                  { label: 'Rewrite', text: `${n}! + ${n + 1} × ${n}!` },
                  { label: 'Factor', text: `${n}! × (1 + ${n + 1})` },
                  { label: 'Divide', text: `1 + ${n + 1} = ${n + 2}` },
                ]),
              },
            ],
          };
        }
        const m = int(rng, 5, 12);
        return {
          prompt: `If (n + 1)! ÷ (n − 1)! = ${m * (m + 1)}, what is n?`,
          answer: { kind: 'number', value: m },
          hints: ['(n + 1)! = (n + 1) × n × (n − 1)!.', `So n(n + 1) = ${m * (m + 1)}: two consecutive numbers with that product.`],
          solution: [
            {
              text: 'Cancel the common (n − 1)! and you are left with two consecutive numbers.',
              visual: working([
                { label: 'Cancel', text: `(n + 1) × n = ${m * (m + 1)}` },
                { label: 'Consecutive numbers', text: `${m} × ${m + 1} = ${m * (m + 1)}` },
                { label: 'So', text: `n = ${m}` },
              ]),
            },
          ],
        };
      },
    },
    {
      id: 'factorials_nt/prime-power',
      idea: 'Count a prime inside a factorial',
      buildsOn: 'prime_factorization/factor',
      generate: rng => {
        const p = pick(rng, [2, 3, 3, 5, 7]);
        const n = p === 2 ? int(rng, 10, 40) : p === 7 ? int(rng, 30, 120) : int(rng, 15, 80);
        const { total } = legendre(n, p);
        return {
          prompt: `What is the largest power of ${p} that divides ${n}!? Give the exponent.`,
          answer: { kind: 'number', value: total },
          hints: [
            `Each multiple of ${p} up to ${n} contributes a factor of ${p}. Some contribute more than one.`,
            `Multiples of ${p * p} contribute a second ${p}${p ** 3 <= n ? `, multiples of ${p ** 3} a third` : ''}. Add the counts.`,
          ],
          solution: [
            { text: `Count the multiples of ${p}, then the multiples of ${p * p} (each of which hides one extra ${p})${p ** 3 <= n ? ', and so on' : ''}. Drop any remainder when dividing.` },
            { text: `So ${p}${sup(total)} is the largest power of ${p} dividing ${n}!.`, visual: working(legendreRows(n, p)) },
          ],
        };
      },
    },
    {
      id: 'factorials_nt/zeros',
      idea: 'Trailing zeros count the fives',
      buildsOn: 'factorials_nt/prime-power',
      generate: rng => {
        const n = pick(rng, [int(rng, 26, 124), int(rng, 125, 400), pick(rng, [50, 75, 100, 125, 150, 200, 250, 500, 625, 1000])]);
        const { total } = legendre(n, 5);
        return {
          prompt: `How many zeros are at the end of ${fmt(n)}!?`,
          answer: { kind: 'number', value: total },
          hints: [
            'Each trailing zero needs one 2 and one 5. Which of those is in short supply?',
            `Count the 5s: multiples of 5, plus multiples of 25 again${n >= 125 ? ', plus multiples of 125 again' : ''}.`,
          ],
          solution: [
            { text: 'A trailing zero is a factor of 10 = 2 × 5. Factorials have plenty of 2s, so the number of 5s decides how many 10s can be made.' },
            { text: `${fmt(n)}! ends in ${total} zeros.`, visual: working(legendreRows(n, 5)) },
          ],
        };
      },
    },
    {
      id: 'factorials_nt/beyond',
      idea: 'Composite bases and working backwards',
      buildsOn: 'factorials_nt/zeros',
      generate: rng => {
        if (rng() < 0.5) {
          const [base, name] = pick(rng, [[12, '12 = 2² × 3'], [6, '6 = 2 × 3'], [4, '4 = 2²'], [18, '18 = 2 × 3²'], [20, '20 = 2² × 5'], [9, '9 = 3²']] as const);
          const n = int(rng, 12, 40);
          const f = factorize(base);
          const per = f.map(([q, e]) => ({ q, e, have: legendre(n, q).total, makes: Math.floor(legendre(n, q).total / e) }));
          const value = Math.min(...per.map(x => x.makes));
          return {
            prompt: `What is the largest integer k such that ${base}ᵏ divides ${n}!?`,
            answer: { kind: 'number', value },
            hints: [
              `${name}. Count how many of each prime ${n}! contains.`,
              per.map(x => `${n}! has ${x.have} factors of ${x.q}, enough for ${x.makes} cop${x.makes === 1 ? 'y' : 'ies'} of ${pow(x.q, x.e)}`).join('; ') + '.',
            ],
            solution: [
              { text: `Since ${name}, each copy of ${base} uses up ${f.map(([q, e]) => `${e === 1 ? 'one' : e === 2 ? 'two' : e} ${q}${e === 1 ? '' : 's'}`).join(' and ')}. Count the supply of each prime in ${n}!.` },
              {
                text: 'The prime that runs out first sets the limit.',
                visual: working([
                  ...per.map(x => {
                    const { terms } = legendre(n, x.q);
                    return { label: `${x.q}s in ${n}!`, text: `${terms.join(' + ')}${terms.length > 1 ? ` = ${x.have}` : ''}${x.e > 1 ? `, enough for ${x.makes} lots of ${pow(x.q, x.e)}` : ''}` };
                  }),
                  { label: 'Limit', text: `k = ${value}` },
                ]),
              },
            ],
          };
        }
        const k = pick(rng, [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 24]);
        let n = 5;
        while (legendre(n, 5).total < k) n += 5;
        const exact = legendre(n, 5).total === k;
        return {
          prompt: `What is the smallest positive integer n for which n! ends in at least ${k} zeros?`,
          answer: { kind: 'number', value: n },
          hints: [
            `Each multiple of 5 adds a zero, so n is around ${5 * k}. But multiples of 25 add two, so the true answer is a bit less.`,
            `Check ${n - 5}! and ${n}!.`,
          ],
          solution: [
            { text: `The zero count only changes when n reaches a multiple of 5. A first guess is 5 × ${k} = ${5 * k}${n === 5 * k ? ', and checking confirms it.' :', but multiples of 25 supply extra 5s, so the true answer is smaller. Step down and check.'}` },
            {
              text: 'Count the zeros on either side of the jump.',
              visual: working([
                { label: `${n - 5}!`, text: `${legendre(n - 5, 5).terms.join(' + ') || '0'} = ${legendre(n - 5, 5).total} zeros: not enough` },
                { label: `${n}!`, text: `${legendre(n, 5).terms.join(' + ')} = ${legendre(n, 5).total} zeros` },
                { label: 'So', text: `n = ${n}` },
              ]),
            },
            ...(exact ? [] : [{ text: `Notice the count jumps straight from ${legendre(n - 5, 5).total} to ${legendre(n, 5).total}, because ${n} is a multiple of 25. No factorial ends in exactly ${k} zeros.` }]),
          ],
        };
      },
    },
  ],
};

// ── Modular Arithmetic ───────────────────────────────────────────────────────

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** The repeating cycle of a¹, a², a³, … mod m (a and m coprime). */
function powerCycle(a: number, m: number): number[] {
  const out = [a % m];
  while (out.length < 40) {
    const next = (out[out.length - 1] * a) % m;
    if (next === out[0]) break;
    out.push(next);
  }
  return out;
}

const modArith: Lesson = {
  topic: 'mod_arith',
  intro: [
    {
      text: 'It is 10 o\'clock. What time will it be in 5 hours? Not 15 o\'clock: the clock wraps around at 12, so it is 3. Modular arithmetic is clock arithmetic with any size of clock. To work "mod 12" means to care only about the remainder after dividing by 12.',
      visual: working([
        { label: 'Add', text: '10 + 5 = 15' },
        { label: 'Wrap', text: '15 = 12 + 3' },
        { label: 'Mod 12', text: '15 leaves remainder 3' },
      ]),
    },
    {
      text: 'Days of the week are a clock of size 7. If today is Tuesday, what day is it 100 days from now? Seven days change nothing, and neither do 98 days. 100 = 98 + 2, so it is 2 days after Tuesday: Thursday.',
    },
    {
      text: 'The big idea: you may replace any number by its remainder BEFORE you add or multiply, and the final remainder comes out the same. What is the remainder when 73 × 58 is divided by 7? Do not multiply. 73 leaves remainder 3, and 58 leaves remainder 2, so the product leaves the same remainder as 3 × 2 = 6.',
      visual: working([
        { label: 'Reduce', text: '73 → 3 and 58 → 2 (mod 7)' },
        { label: 'Multiply', text: '3 × 2 = 6' },
        { label: 'Check', text: '73 × 58 = 4,234 = 7 × 604 + 6' },
      ]),
    },
    {
      text: 'That tames huge powers. What is the remainder when 2¹⁰⁰ is divided by 7? Track remainders only: 2, 4, 8 → 1, and then the pattern 2, 4, 1 repeats every 3 steps, just like a units digit cycle. Since 100 = 3 × 33 + 1, the 100th power lands on the 1st entry of the cycle: 2.',
      visual: working([
        { label: '2¹', text: '2' },
        { label: '2²', text: '4' },
        { label: '2³', text: '8 → 1' },
        { label: '2⁴', text: '1 × 2 = 2 (the cycle restarts)' },
      ]),
    },
    {
      text: 'The units digit lesson was really mod 10 all along. And here is a slick extra: a remainder of 6 mod 7 can be treated as −1, because 6 is one short of 7. So 6¹⁰⁰ leaves the same remainder as (−1)¹⁰⁰ = 1. Negative remainders are often the fastest route.',
    },
  ],
  rungs: [
    {
      id: 'mod_arith/clock',
      idea: 'Throw away full cycles',
      buildsOn: 'units_digit/cycle',
      generate: rng => {
        if (rng() < 0.55) {
          const today = int(rng, 0, 6);
          const n = pick(rng, [int(rng, 30, 99), 100, 200, 365, 500, 1000, int(rng, 100, 999)]);
          const back = rng() < 0.25;
          const shift = n % 7;
          const answerDay = DAYS[(((today + (back ? -shift : shift)) % 7) + 7) % 7];
          const options = [...DAYS];
          return {
            prompt: `Today is ${DAYS[today]}. What day of the week ${back ? `was it ${fmt(n)} days ago` : `will it be ${fmt(n)} days from now`}?`,
            answer: { kind: 'choice', options, correct: options.indexOf(answerDay) },
            hints: [
              'Every 7 days the day of the week repeats, so only the remainder mod 7 matters.',
              `${fmt(n)} = 7 × ${Math.floor(n / 7)} + ${shift}.`,
            ],
            solution: [
              {
                text: 'Whole weeks change nothing. Find what is left over.',
                visual: working([
                  { label: 'Divide by 7', text: `${fmt(n)} = 7 × ${Math.floor(n / 7)} + ${shift}` },
                  { label: 'Leftover', text: shift === 0 ? 'none: the same day of the week' : `${shift} day${shift === 1 ? '' : 's'} ${back ? 'before' : 'after'} ${DAYS[today]}` },
                  { label: 'So', text: answerDay },
                ]),
              },
            ],
          };
        }
        const now = int(rng, 1, 12);
        const n = int(rng, 30, 500);
        const shift = n % 12;
        const then = ((now + shift - 1) % 12) + 1;
        return {
          prompt: `A 12-hour clock shows ${now} o'clock. What hour will it show ${n} hours from now?`,
          answer: { kind: 'number', value: then },
          hints: ['Every 12 hours the clock shows the same hour again.', `${n} = 12 × ${Math.floor(n / 12)} + ${shift}.`],
          solution: [
            {
              text: 'Full trips around the clock do not matter. Find the leftover hours.',
              visual: working([
                { label: 'Divide by 12', text: `${n} = 12 × ${Math.floor(n / 12)} + ${shift}` },
                { label: 'Advance', text: `${now} + ${shift} = ${now + shift}${now + shift > 12 ? `, which wraps to ${then}` : ''}` },
                { label: 'So', text: `${then} o'clock` },
              ]),
            },
          ],
        };
      },
    },
    {
      id: 'mod_arith/reduce-first',
      idea: 'Take remainders before you compute',
      buildsOn: 'mod_arith/clock',
      generate: rng => {
        const m = pick(rng, [5, 6, 7, 8, 9, 11, 12]);
        const mk = () => {
          const r = int(rng, 1, m - 1);
          return { r, n: r + m * int(rng, 6, 80) };
        };
        const [a, b, c] = [mk(), mk(), mk()];
        const plusC = rng() < 0.5;
        const small = a.r * b.r + (plusC ? c.r : 0);
        return {
          prompt: `What is the remainder when ${fmt(a.n)} × ${fmt(b.n)}${plusC ? ` + ${fmt(c.n)}` : ''} is divided by ${m}?`,
          answer: { kind: 'number', value: small % m },
          hints: [
            `Do not compute the big number. Replace each number by its own remainder when divided by ${m}.`,
            `${fmt(a.n)} → ${a.r} and ${fmt(b.n)} → ${b.r}${plusC ? ` and ${fmt(c.n)} → ${c.r}` : ''}.`,
          ],
          solution: [
            {
              text: `Reduce each number mod ${m} first, then do the arithmetic with the small remainders.`,
              visual: working([
                { label: fmt(a.n), text: `${m} × ${(a.n - a.r) / m} + ${a.r} → ${a.r}` },
                { label: fmt(b.n), text: `${m} × ${(b.n - b.r) / m} + ${b.r} → ${b.r}` },
                ...(plusC ? [{ label: fmt(c.n), text: `${m} × ${(c.n - c.r) / m} + ${c.r} → ${c.r}` }] : []),
                { label: 'Compute', text: `${a.r} × ${b.r}${plusC ? ` + ${c.r}` : ''} = ${small}` },
                { label: `Reduce mod ${m}`, text: small < m ? `${small}` : `${small} = ${m} × ${Math.floor(small / m)} + ${small % m} → ${small % m}` },
              ]),
            },
          ],
        };
      },
    },
    {
      id: 'mod_arith/powers',
      idea: 'Remainders of powers run in cycles',
      buildsOn: 'units_digit/cycle',
      generate: rng => {
        const [a, m] = pick(rng, [[2, 7], [3, 7], [2, 5], [3, 5], [4, 7], [5, 7], [2, 9], [3, 11], [4, 9], [3, 8], [5, 6], [2, 11], [5, 9], [3, 13], [4, 11], [7, 10], [5, 13]] as const);
        const cycle = powerCycle(a, m);
        const L = cycle.length;
        const n = int(rng, 25, 300);
        const pos = n % L === 0 ? L : n % L;
        return {
          prompt: `What is the remainder when ${a}${sup(n)} is divided by ${m}?`,
          answer: { kind: 'number', value: cycle[pos - 1] },
          hints: [
            `Compute the remainders of ${a}¹, ${a}², ${a}³, … mod ${m}, each from the one before, until they repeat.`,
            `The remainders cycle with length ${L}: ${cycle.join(', ')}. Where in the cycle does the exponent ${n} land?`,
          ],
          solution: [
            {
              text: `Build the remainders one at a time: multiply the previous remainder by ${a} and reduce mod ${m}.`,
              visual: working([
                ...cycle.map((r, i) => ({ label: `${a}${sup(i + 1)}`, text: i === 0 ? `${r}` : `${cycle[i - 1]} × ${a} = ${cycle[i - 1] * a} → ${r}` })),
                { label: `${a}${sup(L + 1)}`, text: `${cycle[L - 1]} × ${a} = ${cycle[L - 1] * a} → ${cycle[0]} (repeats)` },
              ]),
            },
            {
              text: `The cycle has length ${L}, so only the exponent's remainder mod ${L} matters.`,
              visual: working([
                { label: 'Exponent', text: `${n} = ${L} × ${Math.floor(n / L)} + ${n % L}` },
                { label: 'Position', text: n % L === 0 ? `remainder 0 means the last entry of the cycle` : `entry number ${pos} of the cycle` },
                { label: 'Remainder', text: `${cycle[pos - 1]}` },
              ]),
            },
            ...(cycle[L - 1] === 1 && cycle.includes(m - 1) ? [{ text: `Shortcut: ${a}${sup(cycle.indexOf(m - 1) + 1)} leaves remainder ${m - 1}, which is −1 mod ${m}. Squaring that gives 1, which is why the cycle closes where it does.` }] : []),
          ],
        };
      },
    },
    {
      id: 'mod_arith/two-remainders',
      idea: 'Two remainder conditions at once',
      buildsOn: 'gcd_lcm/lcm',
      generate: rng => {
        const [m1, m2] = pick(rng, [[3, 4], [3, 5], [4, 5], [3, 7], [5, 6], [4, 7], [5, 7], [3, 8], [5, 8], [7, 8], [4, 9], [5, 9], [7, 9], [6, 7]] as const);
        const N = int(rng, m2 + 1, m1 * m2 - 1);
        const [r1, r2] = [N % m1, N % m2];
        const thing = pick(rng, ['eggs', 'marbles', 'trading cards', 'cookies']);
        const candidates: number[] = [];
        for (let c = r2 === 0 ? m2 : r2; c <= N; c += m2) candidates.push(c);
        const short = m1 - r1 === m2 - r2 && r1 !== 0;
        const left = (r: number) => (r === 0 ? 'are none' : r === 1 ? 'is 1' : `are ${r}`);
        return {
          prompt: `A box holds some ${thing}. Sorted into groups of ${m1} there ${left(r1)} left over, and sorted into groups of ${m2} there ${left(r2)} left over. What is the smallest number of ${thing} that could be in the box?`,
          answer: { kind: 'number', value: N },
          hints: [
            `List the numbers that leave remainder ${r2} when divided by ${m2}: ${candidates.slice(0, 3).join(', ')}, …`,
            `Test each one for remainder ${r1} when divided by ${m1}. Stop at the first that works.`,
          ],
          solution: [
            { text: `Start from the stricter condition (the bigger divisor, ${m2}) and list the candidates. Then test them against the other condition.` },
            {
              text: `Looking for remainder ${r1} mod ${m1}:`,
              visual: working(
                candidates.map(c => ({
                  label: `${c}`,
                  text: `${c} = ${m1} × ${Math.floor(c / m1)} + ${c % m1}${c % m1 === r1 ? ' ✓' : ''}`,
                })),
              ),
            },
            { text: `The smallest is ${N}. After that the solutions repeat every ${m1 * m2}, the LCM of ${m1} and ${m2}.` },
            ...(short ? [{ text: `Shortcut for this one: in both cases the box is ${m1 - r1} short of a whole number of groups. So adding ${m1 - r1} gives a multiple of both ${m1} and ${m2}: ${m1 * m2} − ${m1 - r1} = ${N}.` }] : []),
          ],
        };
      },
    },
  ],
};

export const FACTOR_ADVANCED_LESSONS: Lesson[] = [factorTricks, factorialsNt, modArith];
