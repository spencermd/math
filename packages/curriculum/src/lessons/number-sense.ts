// Realm I: Number Sense — arithmetic by insight rather than by grinding.
import type { Lesson } from './types.ts';
import { fmt, int, pick } from './util.ts';

/** Pairs whose product is a round number. */
const FRIENDLY: [number, number][] = [[4, 25], [2, 50], [8, 125], [5, 20], [8, 25], [5, 40], [4, 75], [5, 60]];

const cleverCalc: Lesson = {
  topic: 'clever_calc',
  intro: [
    {
      text: 'Contest problems almost never want long arithmetic. They want you to spot the shortcut. Take 25 × 37 × 4. Multiplying left to right is painful, but you may multiply in any order, and 25 × 4 is 100.',
      visual: {
        kind: 'rows',
        rows: [
          { text: '25 × 37 × 4' },
          { label: 'Reorder', text: '= (25 × 4) × 37' },
          { text: '= 100 × 37' },
          { text: '= 3,700' },
        ],
      },
    },
    {
      text: 'A second shortcut: break a number into friendlier parts. 7 × 103 is a 7-by-103 rectangle. Cut it into a 7-by-100 piece and a 7-by-3 piece, and add the two areas. Tap each piece.',
      visual: { kind: 'area', height: 7, widths: [100, 3] },
    },
    {
      text: 'The same idea works with subtraction. 99 is 100 − 1, so 99 × 47 is one 47 less than 100 × 47.',
      visual: {
        kind: 'rows',
        rows: [
          { text: '99 × 47' },
          { label: 'Break apart', text: '= (100 − 1) × 47' },
          { text: '= 4,700 − 47' },
          { text: '= 4,653' },
        ],
      },
    },
    {
      text: 'Run it backwards to glue pieces together. 37 × 13 + 37 × 87 is two rectangles of height 37 standing side by side. Together they are 37 wide by 13 + 87 = 100.',
      visual: { kind: 'area', height: 37, widths: [13, 87] },
    },
    {
      text: 'Third shortcut: pair up a long sum. In 1 + 2 + 3 + ⋯ + 10, the first and last numbers add to 11. So do the second and the second-to-last. Pair the ends and see.',
      visual: { kind: 'pairs', from: 1, to: 10 },
    },
  ],
  rungs: [
    {
      id: 'clever_calc/regroup',
      idea: 'Multiply in a friendlier order',
      generate: rng => {
        const [a, b] = pick(rng, FRIENDLY);
        let k = int(rng, 13, 49);
        if (k % 5 === 0) k += 2;
        const [first, last] = rng() < 0.5 ? [a, b] : [b, a];
        const answer = a * b * k;
        return {
          prompt: `Compute ${first} × ${k} × ${last} in your head.`,
          answer: { kind: 'number', value: answer },
          hints: [
            'You may multiply in any order. Which two of these numbers make a round product?',
            `${a} × ${b} = ${fmt(a * b)}.`,
          ],
          solution: [
            {
              text: 'Multiplication can be done in any order, so start with the two numbers that make a round product.',
              visual: {
                kind: 'rows',
                rows: [
                  { text: `${first} × ${k} × ${last}` },
                  { label: 'Reorder', text: `= (${a} × ${b}) × ${k}` },
                  { text: `= ${fmt(a * b)} × ${k}` },
                  { text: `= ${fmt(answer)}` },
                ],
              },
            },
            { text: `${a} × ${b} = ${fmt(a * b)}, and ${fmt(a * b)} × ${k} = ${fmt(answer)}.` },
          ],
        };
      },
    },
    {
      id: 'clever_calc/distribute',
      idea: 'Break a number apart',
      buildsOn: 'clever_calc/regroup',
      generate: rng => {
        const variant = int(rng, 0, 2);

        if (variant === 0) {
          // A number just above or below a round one.
          const base = pick(rng, [100, 100, 200, 1000]);
          const off = pick(rng, [-2, -1, 1, 2]);
          const near = base + off;
          let m = int(rng, 12, 89);
          if (m % 10 === 0) m += 3;
          const answer = near * m;
          const sign = off < 0 ? '−' : '+';
          const small = Math.abs(off) * m;
          return {
            prompt: rng() < 0.5 ? `Compute ${fmt(near)} × ${m}.` : `Compute ${m} × ${fmt(near)}.`,
            answer: { kind: 'number', value: answer },
            hints: [
              `${fmt(near)} is very close to ${fmt(base)}.`,
              `${fmt(near)} × ${m} = ${fmt(base)} × ${m} ${sign} ${Math.abs(off)} × ${m}.`,
            ],
            solution: [
              {
                text: `Write ${fmt(near)} as ${fmt(base)} ${sign} ${Math.abs(off)} and multiply each part by ${m}.`,
                visual: {
                  kind: 'rows',
                  rows: [
                    { text: `${fmt(near)} × ${m}` },
                    { label: 'Break apart', text: `= (${fmt(base)} ${sign} ${Math.abs(off)}) × ${m}` },
                    { text: `= ${fmt(base * m)} ${sign} ${small}` },
                    { text: `= ${fmt(answer)}` },
                  ],
                },
              },
              { text: `${fmt(base)} × ${m} = ${fmt(base * m)}. ${off < 0 ? 'Take away' : 'Add'} ${Math.abs(off)} × ${m} = ${small} to get ${fmt(answer)}.` },
            ],
          };
        }

        let a = int(rng, 13, 89);
        if (a % 10 === 0) a += 7;

        if (variant === 1) {
          // Two products sharing a factor, whose other factors add to a round number.
          const total = pick(rng, [100, 100, 50, 200]);
          let b = int(rng, total / 5, (total * 4) / 5);
          if (b * 2 === total) b += 3;
          const c = total - b;
          const answer = a * total;
          return {
            prompt: `Compute ${a} × ${b} + ${a} × ${c}.`,
            answer: { kind: 'number', value: answer },
            hints: [
              `Both products contain ${a}. Don't work them out separately.`,
              `${a} lots of ${b}, plus ${a} lots of ${c}, is ${a} lots of how many?`,
            ],
            solution: [
              {
                text: `Picture two rectangles of height ${a} side by side. Together they make one rectangle that is ${b} + ${c} = ${total} wide.`,
                visual: { kind: 'area', height: a, widths: [b, c] },
              },
              { text: `${a} × ${b} + ${a} × ${c} = ${a} × (${b} + ${c}) = ${a} × ${total} = ${fmt(answer)}.` },
            ],
          };
        }

        // Two products sharing a factor, whose other factors differ by a round number.
        const gap = pick(rng, [10, 100]);
        const c = int(rng, 13, 88);
        const b = c + gap;
        const answer = a * gap;
        return {
          prompt: `Compute ${a} × ${b} − ${a} × ${c}.`,
          answer: { kind: 'number', value: answer },
          hints: [
            `Both products contain ${a}. Don't work them out separately.`,
            `${a} lots of ${b}, take away ${a} lots of ${c}, leaves ${a} lots of how many?`,
          ],
          solution: [
            {
              text: `Both products are a number of ${a}s. Start with ${b} of them and take away ${c} of them: ${b} − ${c} = ${gap} are left.`,
              visual: {
                kind: 'rows',
                rows: [
                  { text: `${a} × ${b} − ${a} × ${c}` },
                  { label: 'Pull out the ' + a, text: `= ${a} × (${b} − ${c})` },
                  { text: `= ${a} × ${gap}` },
                  { text: `= ${fmt(answer)}` },
                ],
              },
            },
            { text: `${a} × ${gap} = ${fmt(answer)}.` },
          ],
        };
      },
    },
    {
      id: 'clever_calc/pairing',
      idea: 'Pair up a long sum',
      buildsOn: 'clever_calc/distribute',
      generate: rng => {
        if (rng() < 0.5) {
          const n = int(rng, 20, 100);
          const answer = (n * (n + 1)) / 2;
          return {
            prompt: `Find the sum 1 + 2 + 3 + ⋯ + ${n}.`,
            answer: { kind: 'number', value: answer },
            hints: [
              `What do the first and last numbers add to? The second and second-to-last?`,
              `Write the sum twice, once forwards and once backwards. Each of the ${n} columns adds to ${n + 1}.`,
            ],
            solution: [
              {
                text: 'Write the sum twice, once forwards and once backwards, and add straight down the columns.',
                visual: {
                  kind: 'rows',
                  rows: [
                    { label: 'Forwards', text: `1 + 2 + 3 + ⋯ + ${n}` },
                    { label: 'Backwards', text: `${n} + ${n - 1} + ${n - 2} + ⋯ + 1` },
                    { label: 'Each column', text: `${n + 1} + ${n + 1} + ${n + 1} + ⋯ + ${n + 1}` },
                  ],
                },
              },
              { text: `There are ${n} columns and each adds to ${n + 1}, so twice the sum is ${n} × ${n + 1} = ${fmt(n * (n + 1))}.` },
              { text: `The sum itself is half of that: ${fmt(answer)}.` },
            ],
          };
        }

        // k + 2k + … + nk: pull out the k first.
        const k = pick(rng, [2, 3, 4, 5, 10]);
        const n = int(rng, 10, 40);
        const inner = (n * (n + 1)) / 2;
        const answer = k * inner;
        return {
          prompt: `Find the sum ${k} + ${2 * k} + ${3 * k} + ⋯ + ${n * k}.`,
          answer: { kind: 'number', value: answer },
          hints: [
            `Every number in the sum is a multiple of ${k}.`,
            `The sum is ${k} × (1 + 2 + 3 + ⋯ + ${n}). Pair up what's in the brackets.`,
          ],
          solution: [
            {
              text: `Every term is a multiple of ${k}, and the last one is ${n * k} = ${k} × ${n}. Pull the ${k} out.`,
              visual: {
                kind: 'rows',
                rows: [
                  { text: `${k} + ${2 * k} + ${3 * k} + ⋯ + ${n * k}` },
                  { label: `Pull out the ${k}`, text: `= ${k} × (1 + 2 + 3 + ⋯ + ${n})` },
                ],
              },
            },
            { text: `Inside the brackets, write the sum forwards and backwards: ${n} columns that each add to ${n + 1}. So 1 + 2 + ⋯ + ${n} = ${n} × ${n + 1} ÷ 2 = ${fmt(inner)}.` },
            { text: `${k} × ${fmt(inner)} = ${fmt(answer)}.` },
          ],
        };
      },
    },
  ],
};

export const NUMBER_SENSE_LESSONS: Lesson[] = [cleverCalc];
