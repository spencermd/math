// Realm V: Number Theory — divisibility, primes, and counting factors.
import type { Lesson, Rng, Step } from './types.ts';
import { factorLadder, factored, factorize, fmt, int, orList, pick, pow, shuffle, valueOf, type Factorization } from './util.ts';

const digitSum = (n: number) => [...String(n)].reduce((sum, d) => sum + Number(d), 0);
const digitSumText = (n: number) => `${[...String(n)].join(' + ')} = ${digitSum(n)}`;

/** One line explaining whether `n` passes the test for `k` (3, 4, 6 or 9). */
function testLine(n: number, k: number): string {
  const verdict = n % k === 0 ? `so ${fmt(n)} is divisible by ${k}` : `so ${fmt(n)} is not divisible by ${k}`;
  if (k === 4) {
    const tail = n % 100;
    return `${fmt(n)} ends in ${String(tail).padStart(2, '0')}, which is ${tail % 4 === 0 ? '' : 'not '}a multiple of 4, ${verdict}.`;
  }
  if (k === 6) {
    const even = n % 2 === 0;
    if (!even) return `${fmt(n)} is odd, ${verdict}.`;
    return `${fmt(n)} is even and its digits add to ${digitSumText(n)}, which is ${n % 3 === 0 ? '' : 'not '}a multiple of 3, ${verdict}.`;
  }
  return `${fmt(n)}: ${digitSumText(n)}, which is ${n % k === 0 ? '' : 'not '}a multiple of ${k}, ${verdict}.`;
}

const RULE: Record<number, string> = {
  3: 'A number is divisible by 3 exactly when its digits add to a multiple of 3.',
  4: 'A number is divisible by 4 exactly when its last two digits form a multiple of 4.',
  6: 'A number is divisible by 6 exactly when it is even and its digits add to a multiple of 3.',
  9: 'A number is divisible by 9 exactly when its digits add to a multiple of 9.',
};

/** Digits that can replace the A in `pattern` to make a multiple of `k`. */
function fits(pattern: string, k: number): number[] {
  return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter(a => Number(pattern.replace('A', String(a))) % k === 0);
}

/** A digit string with an A at `pos`. The first digit is never 0. */
function withBlank(rng: Rng, length: number, pos: number): string {
  return Array.from({ length }, (_, i) => (i === pos ? 'A' : String(int(rng, i === 0 ? 1 : 0, 9)))).join('');
}

const knownSum = (pattern: string) => digitSum(Number(pattern.replace('A', '0')));
const knownSumText = (pattern: string) => `${[...pattern].filter(c => c !== 'A').join(' + ')} = ${knownSum(pattern)}`;

const divisibility: Lesson = {
  topic: 'divisibility',
  intro: [
    {
      text: 'Some divisors only care about the end of a number. Divisible by 2: the last digit is even. By 5: it ends in 0 or 5. By 10: it ends in 0. By 4: the last two digits form a multiple of 4, because 100 is a multiple of 4 and so everything above the last two digits already is.',
      visual: {
        kind: 'rows',
        rows: [
          { text: '7,316 = 73 × 100 + 16' },
          { label: 'Multiple of 4', text: '73 × 100' },
          { label: 'Also one', text: '16 = 4 × 4' },
          { label: 'So', text: '7,316 is divisible by 4' },
        ],
      },
    },
    {
      text: 'For 3 and 9, add the digits. Here is why it works: 10, 100 and 1,000 are each 1 more than a multiple of 9. So every 10 or 100 in a number leaves 1 behind, and what is left over is the sum of the digits.',
      visual: {
        kind: 'rows',
        rows: [
          { text: '372 = 3 × 100 + 7 × 10 + 2' },
          { label: 'Split off 9s', text: '= 3 × 99 + 7 × 9 + (3 + 7 + 2)' },
          { text: '= (a multiple of 9) + 12' },
        ],
      },
    },
    {
      text: 'So 372 and its digit sum, 12, leave the same remainder when divided by 9, and also by 3. Since 12 is a multiple of 3 but not of 9, 372 is divisible by 3 but not by 9. That is the whole rule: divisible by 3 (or 9) exactly when the digit sum is.',
    },
    {
      text: 'Build other tests by combining these. A number is divisible by 6 when it passes the tests for both 2 and 3. Divisible by 15: pass 3 and 5. This works when the two smaller divisors share no factor, like 2 and 3.',
    },
  ],
  rungs: [
    {
      id: 'divisibility/test',
      idea: 'Test a number at a glance',
      generate: rng => {
        const k = pick(rng, [3, 4, 6, 9]);
        // Wrong options are near misses: they pass part of the test.
        const tempting = (n: number) =>
          k === 4 ? n % 2 === 0 : k === 6 ? n % 2 === 0 || n % 3 === 0 : k === 9 ? n % 3 === 0 : true;
        const options = new Set<number>([k * int(rng, Math.ceil(1000 / k), Math.floor(9999 / k))]);
        const right = [...options][0];
        while (options.size < 4) {
          const n = int(rng, 1000, 9999);
          if (n % k !== 0 && tempting(n)) options.add(n);
        }
        const order = shuffle(rng, [...options]);
        return {
          prompt: `Which of these numbers is divisible by ${k}?`,
          answer: { kind: 'choice', options: order.map(fmt), correct: order.indexOf(right) },
          hints: [RULE[k], 'Check the options one at a time. You never need to divide.'],
          solution: [{ text: RULE[k] }, ...order.map((n): Step => ({ text: testLine(n, k) }))],
        };
      },
    },
    {
      id: 'divisibility/missing-digit',
      idea: 'Find a missing digit',
      buildsOn: 'divisibility/test',
      generate: rng => {
        const variant = int(rng, 0, 3);
        const k = variant === 0 ? 9 : 3;
        let pattern: string;
        do pattern = withBlank(rng, 4, int(rng, 1, 3));
        while (k === 9 && knownSum(pattern) % 9 === 0);
        const good = fits(pattern, k);
        const sumStep: Step = {
          text: `The digits you know add to ${knownSumText(pattern)}. The whole digit sum, ${knownSum(pattern)} + A, must be a multiple of ${k}.`,
        };

        if (variant === 0) {
          return {
            prompt: `The four-digit number ${pattern} is divisible by 9. What digit is A?`,
            answer: { kind: 'number', value: good[0] },
            hints: [RULE[9], `The known digits add to ${knownSum(pattern)}. What must A add to reach a multiple of 9?`],
            solution: [
              sumStep,
              { text: `The next multiple of 9 is ${knownSum(pattern) + good[0]}, so A = ${good[0]}. No other digit works: the multiple of 9 after that would need A to be ${good[0] + 9}.` },
            ],
          };
        }

        if (variant === 3) {
          return {
            prompt: `A is a digit. How many different values of A make the four-digit number ${pattern} divisible by 3?`,
            answer: { kind: 'number', value: good.length },
            hints: [RULE[3], 'Once you find one digit that works, adding 3 to it gives another. Don\'t forget that 0 is a digit.'],
            solution: [
              sumStep,
              { text: `That happens when A is ${orList(good)}. The working digits are 3 apart.` },
              { text: `So ${good.length} digits work.` },
            ],
          };
        }

        const want = variant === 1 ? 'smallest' : 'largest';
        const answer = variant === 1 ? good[0] : good[good.length - 1];
        return {
          prompt: `What is the ${want} digit A that makes the four-digit number ${pattern} divisible by 3?`,
          answer: { kind: 'number', value: answer },
          hints: [RULE[3], `The known digits add to ${knownSum(pattern)}. Which digits A bring the total to a multiple of 3?`],
          solution: [
            sumStep,
            { text: `That happens when A is ${orList(good)}.` },
            { text: `The ${want} of these is ${answer}.` },
          ],
        };
      },
    },
    {
      id: 'divisibility/combine',
      idea: 'Combine two tests',
      buildsOn: 'divisibility/missing-digit',
      generate: rng => {
        const variant = int(rng, 0, 2);

        if (variant === 2) {
          // Divisible by 15: the last digit is 0 or 5, and exactly one of them fixes the digit sum.
          let pattern: string;
          do pattern = withBlank(rng, 3, 2);
          while (fits(pattern, 15).length !== 1);
          const answer = fits(pattern, 15)[0];
          const other = answer === 0 ? 5 : 0;
          return {
            prompt: `The three-digit number ${pattern} is divisible by 15. What digit is A?`,
            answer: { kind: 'number', value: answer },
            hints: [
              '15 = 3 × 5, so the number must pass the test for 3 and the test for 5.',
              'The test for 5 leaves only two possible last digits. Try each in the test for 3.',
            ],
            solution: [
              { text: 'A multiple of 15 is a multiple of both 3 and 5. The test for 5 says the last digit, A, is 0 or 5.' },
              { text: `The other digits add to ${knownSumText(pattern)}. With A = ${other} the digit sum is ${knownSum(pattern) + other}, not a multiple of 3. With A = ${answer} it is ${knownSum(pattern) + answer}, which is.` },
              { text: `So A = ${answer}.` },
            ],
          };
        }

        // Divisible by 6, with the blank either last (it must be even) or in the middle (the last digit already is).
        let pattern: string;
        do pattern = withBlank(rng, 3, variant === 0 ? 2 : 1);
        while (variant === 1 && Number(pattern[2]) % 2 === 1);
        const good = fits(pattern, 6);
        const want = variant === 0 ? 'largest' : 'smallest';
        const answer = variant === 0 ? good[good.length - 1] : good[0];
        const byThree = fits(pattern, 3);
        return {
          prompt: `What is the ${want} digit A that makes the three-digit number ${pattern} divisible by 6?`,
          answer: { kind: 'number', value: answer },
          hints: [
            '6 = 2 × 3, so the number must pass the test for 2 and the test for 3.',
            variant === 0
              ? 'A is the last digit, so the test for 2 says A must be even. Which even digits also fix the digit sum?'
              : `The number already ends in ${pattern[2]}, so it is even whatever A is. Only the test for 3 is left.`,
          ],
          solution: [
            {
              text:
                variant === 0
                  ? 'A multiple of 6 is a multiple of both 2 and 3. A is the last digit, so it must be even.'
                  : `A multiple of 6 is a multiple of both 2 and 3. The number ends in ${pattern[2]}, so it is even whatever A is.`,
            },
            { text: `For 3: the other digits add to ${knownSumText(pattern)}, so the digit sum is a multiple of 3 when A is ${orList(byThree)}.` },
            {
              text:
                variant === 0
                  ? good.length === 1
                    ? `Of those, only ${answer} is even.`
                    : `Of those, the even ones are ${good.join(' and ')}. The largest is ${answer}.`
                  : `The smallest of those is ${answer}.`,
            },
          ],
        };
      },
    },
  ],
};

const PRIMES = [53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149];
/** Composites that look prime: no factor of 2 or 5 to give them away. */
const IMPOSTORS = [51, 57, 87, 91, 93, 111, 117, 119, 121, 123, 129, 133, 141, 143, 147, 153, 159, 161, 169, 171, 177, 183, 187];

/** A random number built from small primes, between `min` and `max`, with at least two different primes. */
function smallPrimeNumber(rng: Rng, maxExps: Factorization, min: number, max: number): Factorization {
  for (;;) {
    const f: Factorization = maxExps.map(([p, top]) => [p, int(rng, 0, top)]);
    const n = valueOf(f);
    if (n >= min && n <= max && f.filter(([, e]) => e > 0).length >= 2) return f.filter(([, e]) => e > 0);
  }
}

const primeFactorization: Lesson = {
  topic: 'prime_factorization',
  intro: [
    {
      text: 'A prime number has exactly two factors: 1 and itself. The first few are 2, 3, 5, 7, 11, 13. Every other whole number greater than 1 is composite, meaning it splits into smaller factors. (1 is neither.) Primes are the atoms of arithmetic: every whole number above 1 is a product of primes.',
    },
    {
      text: 'To find a number\'s prime factorization, keep dividing out the smallest prime you can. Repeated primes are written with exponents.',
      visual: factorLadder(360),
    },
    {
      text: 'You could split 360 differently, say as 36 × 10, and keep going. You would still finish with three 2s, two 3s and a 5. Each number has exactly one prime factorization. This is called the Fundamental Theorem of Arithmetic, and it is why the factorization tells you so much.',
    },
    {
      text: 'Is 91 prime? It is odd, its digits add to 10, and it doesn\'t end in 0 or 5, so 2, 3 and 5 are out. But 91 = 7 × 13. To test a number, you only need to try primes up to its square root: if it had a bigger factor, the matching smaller factor would already have turned up.',
    },
    {
      text: 'One pattern to remember: a perfect square has an even exponent on every prime, because squaring doubles every exponent. For example 144 = 12² = 2⁴ × 3².',
    },
  ],
  rungs: [
    {
      id: 'prime_factorization/spot-the-prime',
      idea: 'Tell primes from impostors',
      generate: rng => {
        const prime = pick(rng, PRIMES);
        const order = shuffle(rng, [prime, ...shuffle(rng, IMPOSTORS).slice(0, 3)]);
        const root = Math.floor(Math.sqrt(prime));
        const toTry = [2, 3, 5, 7, 11].filter(p => p <= root);
        return {
          prompt: 'Exactly one of these numbers is prime. Which one?',
          answer: { kind: 'choice', options: order.map(String), correct: order.indexOf(prime) },
          hints: [
            'None of them is even or ends in 5, so try 3 next: add the digits.',
            'After 3, try dividing by 7, 11 and 13.',
          ],
          solution: [
            ...order
              .filter(n => n !== prime)
              .map((n): Step => {
                const p = factorize(n)[0][0];
                return { text: p === 3 ? `${n} = 3 × ${n / 3}. Its digits add to ${digitSum(n)}, a multiple of 3.` : `${n} = ${p} × ${n / p}.` };
              }),
            { text: `${prime} is prime. Its square root is less than ${root + 1}, so you only need to try ${orList(toTry)}, and none of them divides it.` },
          ],
        };
      },
    },
    {
      id: 'prime_factorization/factor',
      idea: 'Break a number into primes',
      buildsOn: 'prime_factorization/spot-the-prime',
      generate: rng => {
        const big = pick(rng, [7, 11, 13, 17, 19, 23]);
        const small = smallPrimeNumber(rng, [[2, 3], [3, 2], [5, 1]], 12, Math.floor(3000 / big));
        const n = valueOf(small) * big;
        const primes = [...small.map(([p]) => p), big];
        const sum = primes.reduce((a, b) => a + b, 0);
        const askSum = rng() < 0.5;
        return {
          prompt: askSum
            ? `What is the sum of the different prime factors of ${fmt(n)}?`
            : `What is the largest prime factor of ${fmt(n)}?`,
          answer: { kind: 'number', value: askSum ? sum : big },
          hints: [
            'Divide out small primes first. The divisibility rules for 2, 3 and 5 tell you which ones go in.',
            'Keep dividing until what is left is prime.',
          ],
          solution: [
            { text: 'Divide out the smallest prime you can, again and again, until what is left is prime.', visual: factorLadder(n) },
            askSum
              ? { text: `The different primes are ${primes.join(', ')}. Count each once, however many times it appears: ${primes.join(' + ')} = ${sum}.` }
              : { text: `The primes are ${primes.join(', ')}, so the largest prime factor is ${big}.` },
          ],
        };
      },
    },
    {
      id: 'prime_factorization/make-a-square',
      idea: 'Complete a perfect square',
      buildsOn: 'prime_factorization/factor',
      generate: rng => {
        let f: Factorization;
        do f = smallPrimeNumber(rng, [[2, 5], [3, 3], [5, 2], [7, 1]], 20, 2000);
        while (f.every(([, e]) => e % 2 === 0));
        const n = valueOf(f);
        const odd = f.filter(([, e]) => e % 2 === 1).map(([p]) => p);
        const k = odd.reduce((a, b) => a * b, 1);
        const squared: Factorization = f.map(([p, e]) => [p, e + (e % 2)]);
        const root = valueOf(squared.map(([p, e]) => [p, e / 2]));
        return {
          prompt: `What is the smallest positive whole number k for which ${fmt(n)} × k is a perfect square?`,
          answer: { kind: 'number', value: k },
          hints: [
            `Find the prime factorization of ${fmt(n)}. What is special about the exponents of a perfect square?`,
            'Every exponent of a perfect square is even. Which primes have an odd exponent here?',
          ],
          solution: [
            { text: `Start with the prime factorization of ${fmt(n)}.`, visual: factorLadder(n) },
            { text: `A perfect square has an even exponent on every prime. In ${factored(f)}, the ${odd.length === 1 ? 'prime' : 'primes'} with an odd exponent ${odd.length === 1 ? 'is' : 'are'} ${odd.join(' and ')}.` },
            { text: `One more of each makes every exponent even, and anything less leaves an odd one. So k = ${odd.join(' × ')}${odd.length > 1 ? ` = ${k}` : ''}.` },
            { text: `Check: ${fmt(n)} × ${k} = ${factored(squared)} = ${fmt(root)}².` },
          ],
        };
      },
    },
  ],
};

/** One slot per prime: how many of that prime a divisor may use. */
const exponentSlots = (f: Factorization) =>
  f.map(([p, e]) => ({
    label: `How many ${p}s`,
    count: e + 1,
    why: e === 1 ? 'none or one' : `0 up to ${e}: from ${p}⁰ = 1 to ${pow(p, e)}`,
  }));

const divisorCount = (f: Factorization) => f.reduce((n, [, e]) => n * (e + 1), 1);

const factorCounting: Lesson = {
  topic: 'factor_counting',
  intro: [
    {
      text: 'How many positive divisors does 72 have? You could list them: 1, 2, 3, 4, 6, 8, 9, 12, 18, 24, 36, 72. That is 12, but lists are slow and easy to get wrong. The prime factorization gives a better way: 72 = 2³ × 3².',
    },
    {
      text: 'A divisor of 72 can only be built from 2s and 3s, with at most three 2s and at most two 3s. So choosing a divisor is two choices: how many 2s (0, 1, 2 or 3) and how many 3s (0, 1 or 2). Every pair of choices gives a different divisor. Tap any of them.',
      visual: { kind: 'divisor-grid', p: 2, a: 3, q: 3, b: 2 },
    },
    {
      text: 'That is the multiplication principle: 4 choices × 3 choices = 12 divisors. The rule for any number: add 1 to each exponent in the prime factorization, then multiply. The "+ 1" is the choice of using none of that prime.',
      visual: { kind: 'slots', slots: exponentSlots([[2, 3], [3, 2]]) },
    },
    {
      text: 'Three primes work the same way. 360 = 2³ × 3² × 5 has (3 + 1) × (2 + 1) × (1 + 1) = 24 divisors.',
      visual: { kind: 'slots', slots: exponentSlots([[2, 3], [3, 2], [5, 1]]) },
    },
    {
      text: 'To count only some of the divisors, limit the choices. An odd divisor of 72 uses no 2s at all, so there is 1 choice for the 2s and still 3 for the 3s: 1 × 3 = 3 odd divisors (1, 3 and 9).',
    },
  ],
  rungs: [
    {
      id: 'factor_counting/from-factorization',
      idea: 'Count divisors from the factorization',
      generate: rng => {
        let f: Factorization;
        do {
          f = shuffle(rng, [2, 3, 5, 7, 11])
            .slice(0, int(rng, 2, 3))
            .sort((x, y) => x - y)
            .map((p): [number, number] => [p, int(rng, 1, 4)]);
        } while (f.every(([, e]) => e === 1));
        const answer = divisorCount(f);
        return {
          prompt: `A number has prime factorization ${factored(f)}. How many positive divisors does it have?`,
          answer: { kind: 'number', value: answer },
          hints: [
            'To build a divisor, choose how many of each prime to use. Using none is allowed.',
            'Add 1 to each exponent, then multiply.',
          ],
          solution: [
            { text: 'A divisor is made by choosing how many of each prime to use, from none up to the exponent.', visual: { kind: 'slots', slots: exponentSlots(f) } },
            { text: `Multiply the choices: ${f.map(([, e]) => e + 1).join(' × ')} = ${answer}.` },
          ],
        };
      },
    },
    {
      id: 'factor_counting/from-number',
      idea: 'Factor first, then count',
      buildsOn: 'factor_counting/from-factorization',
      generate: rng => {
        const f = smallPrimeNumber(rng, [[2, 5], [3, 3], [5, 2], [7, 1]], 60, 1500);
        const n = valueOf(f);
        const answer = divisorCount(f);
        return {
          prompt: `How many positive divisors does ${fmt(n)} have?`,
          answer: { kind: 'number', value: answer },
          hints: [
            `Don't list them. Find the prime factorization of ${fmt(n)} first.`,
            `${fmt(n)} = ${factored(f)}. Add 1 to each exponent, then multiply.`,
          ],
          solution: [
            { text: `Find the prime factorization of ${fmt(n)}.`, visual: factorLadder(n) },
            { text: 'A divisor is made by choosing how many of each prime to use.', visual: { kind: 'slots', slots: exponentSlots(f) } },
            { text: `Multiply the choices: ${f.map(([, e]) => e + 1).join(' × ')} = ${answer}.` },
          ],
        };
      },
    },
    {
      id: 'factor_counting/restricted',
      idea: 'Count only some of the divisors',
      buildsOn: 'factor_counting/from-number',
      generate: rng => {
        const f: Factorization = [[2, int(rng, 2, 5)], [3, int(rng, 1, 4)], ...(rng() < 0.6 ? [[5, int(rng, 1, 2)] as [number, number]] : [])];
        const [, twos] = f[0];
        const others = f.slice(1);
        const kind = pick(rng, ['odd', 'even', 'perfect squares'] as const);

        let slots: { label: string; count: number; why: string }[];
        let lead: string;
        if (kind === 'odd') {
          lead = 'An odd divisor can\'t contain a 2. The other primes are still free.';
          slots = [{ label: 'How many 2s', count: 1, why: 'none, or the divisor would be even' }, ...exponentSlots(others)];
        } else if (kind === 'even') {
          lead = 'An even divisor must contain at least one 2. The other primes are still free.';
          slots = [{ label: 'How many 2s', count: twos, why: `at least one: 1 up to ${twos}` }, ...exponentSlots(others)];
        } else {
          lead = 'A perfect square has an even exponent on every prime, so each prime must be used an even number of times.';
          slots = f.map(([p, e]) => {
            const evens = Array.from({ length: Math.floor(e / 2) + 1 }, (_, i) => 2 * i);
            const why = evens.length === 1 ? 'none: a single one can\'t be part of a square' : `an even number: ${orList(evens)}`;
            return { label: `How many ${p}s`, count: evens.length, why };
          });
        }
        const answer = slots.reduce((n, slot) => n * slot.count, 1);

        return {
          prompt: `Let N = ${factored(f)}. How many positive divisors of N are ${kind}?`,
          answer: { kind: 'number', value: answer },
          hints: [
            'Build a divisor by choosing how many of each prime to use, as before. Which choices are now ruled out?',
            kind === 'odd'
              ? 'An odd number has no factor of 2.'
              : kind === 'even'
                ? 'An even number has at least one factor of 2.'
                : 'In a perfect square, every prime appears an even number of times. Zero counts as even.',
          ],
          solution: [
            { text: lead, visual: { kind: 'slots', slots } },
            { text: `Multiply the choices: ${slots.map(slot => slot.count).join(' × ')} = ${answer}.` },
          ],
        };
      },
    },
  ],
};

export const NUMBER_THEORY_LESSONS: Lesson[] = [divisibility, primeFactorization, factorCounting];
