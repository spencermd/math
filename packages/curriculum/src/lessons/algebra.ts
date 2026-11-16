// Realm II: Algebra — turning stories into equations.
import type { Lesson, Visual } from './types.ts';
import { fmt, int, pick } from './util.ts';

type Row = { label?: string; text: string };
const working = (rows: Row[]): Visual => ({ kind: 'rows', rows });

const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;

const equations: Lesson = {
  topic: 'equations',
  intro: [
    {
      text: 'Most word problems are an equation wearing a costume. The method never changes: give the unknown a name, translate the sentence piece by piece, then undo the operations in reverse order. Try "five more than three times a number is 26".',
      visual: working([
        { label: 'Name it', text: 'n = the number' },
        { label: 'Translate', text: '3n + 5 = 26' },
        { label: 'Subtract 5', text: '3n = 21' },
        { label: 'Divide by 3', text: 'n = 7' },
      ]),
    },
    {
      text: 'Consecutive integers go up by one, so if the smallest is n, the next are n + 1 and n + 2. Three consecutive integers add to 72. What are they?',
      visual: working([
        { label: 'Translate', text: 'n + (n + 1) + (n + 2) = 72' },
        { label: 'Collect', text: '3n + 3 = 72' },
        { label: 'Subtract 3', text: '3n = 69' },
        { label: 'Divide by 3', text: 'n = 23, so they are 23, 24, 25' },
      ]),
    },
    {
      text: 'There is a faster way to see that one. Three evenly spaced numbers balance around the middle one, so the middle number is the average: 72 ÷ 3 = 24. Whenever the count is odd, find the middle first. And read the question again before answering: it may want the largest number, not n.',
    },
    {
      text: 'A farm has chickens and cows: 20 heads and 56 legs. How many cows? Name one unknown and write the other in terms of it. With c cows there are 20 − c chickens.',
      visual: working([
        { label: 'Legs', text: '4c + 2(20 − c) = 56' },
        { label: 'Expand', text: '4c + 40 − 2c = 56' },
        { label: 'Collect', text: '2c + 40 = 56' },
        { label: 'Solve', text: 'c = 8 cows' },
      ]),
    },
    {
      text: 'Here is the same problem with no algebra at all. Pretend all 20 animals are chickens: that is 40 legs. The farm really has 56, so 16 legs are missing. Swapping a chicken for a cow adds 2 legs, so 16 ÷ 2 = 8 of the animals must be cows. Contest solvers use this "pretend they are all the same" trick constantly.',
    },
  ],
  rungs: [
    {
      id: 'equations/translate',
      idea: 'Translate a sentence and solve',
      generate: rng => {
        const n = int(rng, 6, 30);
        const variant = int(rng, 0, 2);

        if (variant === 2) {
          // Unknown on both sides.
          const lo = int(rng, 2, 4);
          const hi = lo + int(rng, 1, 3);
          const add = int(rng, 3, 20);
          const sub = (hi - lo) * n - add;
          if (sub > 0) {
            return {
              prompt: `If you multiply a number by ${lo} and add ${add}, you get the same result as multiplying it by ${hi} and subtracting ${sub}. What is the number?`,
              answer: { kind: 'number', value: n },
              hints: [
                `Call the number n. One side is ${lo}n + ${add}. What is the other?`,
                `${lo}n + ${add} = ${hi}n − ${sub}. Get the n terms together on the side that has more of them.`,
              ],
              solution: [
                {
                  text: 'Call the number n and translate each half of the sentence.',
                  visual: working([
                    { label: 'Translate', text: `${lo}n + ${add} = ${hi}n − ${sub}` },
                    { label: `Add ${sub}`, text: `${lo}n + ${add + sub} = ${hi}n` },
                    { label: `Subtract ${lo}n`, text: `${add + sub} = ${hi - lo === 1 ? '' : hi - lo}n` },
                    { label: 'So', text: `n = ${n}` },
                  ]),
                },
                { text: `Check: ${lo} × ${n} + ${add} = ${lo * n + add}, and ${hi} × ${n} − ${sub} = ${hi * n - sub}.` },
              ],
            };
          }
        }

        const m = int(rng, 2, 9);
        const k = int(rng, 3, 25);
        const more = variant === 0 || m * n <= k;
        const total = more ? m * n + k : m * n - k;
        return {
          prompt: more
            ? `${k} more than ${m} times a number is ${total}. What is the number?`
            : `When a number is multiplied by ${m} and the result is decreased by ${k}, the answer is ${total}. What is the number?`,
          answer: { kind: 'number', value: n },
          hints: [
            `Call the number n. "${m} times a number" is ${m}n.`,
            `${m}n ${more ? '+' : '−'} ${k} = ${total}. Undo the ${more ? 'adding' : 'subtracting'} first, then the multiplying.`,
          ],
          solution: [
            {
              text: 'Call the number n, translate, and undo the operations in reverse order.',
              visual: working([
                { label: 'Translate', text: `${m}n ${more ? '+' : '−'} ${k} = ${total}` },
                { label: `${more ? 'Subtract' : 'Add'} ${k}`, text: `${m}n = ${m * n}` },
                { label: `Divide by ${m}`, text: `n = ${n}` },
              ]),
            },
            { text: `Check: ${m} × ${n} ${more ? '+' : '−'} ${k} = ${total}.` },
          ],
        };
      },
    },
    {
      id: 'equations/consecutive',
      idea: 'Consecutive integers',
      buildsOn: 'equations/translate',
      generate: rng => {
        const kind = pick(rng, ['', 'even ', 'odd '] as const);
        const step = kind === '' ? 1 : 2;
        const count = pick(rng, [3, 4, 5]);
        let first = int(rng, 8, 60);
        if (kind === 'even ' && first % 2 === 1) first += 1;
        if (kind === 'odd ' && first % 2 === 0) first += 1;
        const terms = Array.from({ length: count }, (_, i) => first + i * step);
        const sum = terms.reduce((a, b) => a + b, 0);
        const last = terms[count - 1];
        const want = pick(rng, ['smallest', 'largest'] as const);
        const offsets = (count * (count - 1) * step) / 2;
        const expr = terms.map((_, i) => (i === 0 ? 'n' : `(n + ${i * step})`)).join(' + ');
        const steps = [
          {
            text: `Call the smallest one n. Consecutive ${kind}integers go up by ${step}, so the ${count} numbers are ${terms.map((_, i) => (i === 0 ? 'n' : `n + ${i * step}`)).join(', ')}.`,
            visual: working([
              { label: 'Translate', text: `${expr} = ${sum}` },
              { label: 'Collect', text: `${count}n + ${offsets} = ${sum}` },
              { label: `Subtract ${offsets}`, text: `${count}n = ${sum - offsets}` },
              { label: `Divide by ${count}`, text: `n = ${first}` },
            ]),
          },
          { text: `The numbers are ${terms.join(', ')}. The question asks for the ${want}, which is ${want === 'smallest' ? first : last}.` },
        ];
        if (count % 2 === 1) {
          steps.push({ text: `Shortcut: with an odd count, the middle number is the average, ${sum} ÷ ${count} = ${sum / count}. Step ${step === 1 ? 'by ones' : 'by twos'} out from there.` });
        }
        return {
          prompt: `The sum of ${count} consecutive ${kind}integers is ${sum}. What is the ${want} of them?`,
          answer: { kind: 'number', value: want === 'smallest' ? first : last },
          hints: [
            `Call the smallest n. The next one is n + ${step}, then n + ${2 * step}.`,
            count % 2 === 1
              ? `Or find the middle number first: it is the average, ${sum} ÷ ${count}.`
              : `Adding all ${count} gives ${count}n + ${offsets} = ${sum}.`,
          ],
          solution: steps,
        };
      },
    },
    {
      id: 'equations/two-kinds',
      idea: 'Two kinds of things',
      buildsOn: 'equations/consecutive',
      generate: rng => {
        const story = pick(rng, [
          { cheap: 'chicken', dear: 'cow', lo: 2, hi: 4, unit: 'legs' },
          { cheap: 'bicycle', dear: 'tricycle', lo: 2, hi: 3, unit: 'wheels' },
          { cheap: 'nickel', dear: 'dime', lo: 5, hi: 10, unit: 'cents' },
          { cheap: 'child ticket', dear: 'adult ticket', lo: 500, hi: 800, unit: 'money' },
        ]);
        const dear = int(rng, 4, 18);
        const cheap = int(rng, 4, 18);
        const n = dear + cheap;
        const total = dear * story.hi + cheap * story.lo;
        const gap = story.hi - story.lo;
        const isMoney = story.unit === 'money';
        // Amounts with their unit: "$40", "35¢", "16 legs", "1 wheel".
        const show = (v: number) =>
          isMoney
            ? `$${fmt(v / 100)}`
            : story.unit === 'cents'
              ? `${v}¢`
              : `${fmt(v)} ${v === 1 ? story.unit.slice(0, -1) : story.unit}`;
        const coef = (v: number) => (v === 1 ? '' : `${v}`);
        const plain = (v: number) => (isMoney ? v / 100 : v);

        const prompt =
          story.unit === 'legs'
            ? `A farm has only chickens and cows. Together the animals have ${n} heads and ${total} legs. How many cows are there?`
            : story.unit === 'wheels'
              ? `A shop has ${n} bicycles and tricycles in all, with ${total} wheels between them. How many tricycles are there?`
              : story.unit === 'cents'
                ? `Dana has ${n} coins, all nickels and dimes, worth ${money(total)} in total. How many dimes does she have?`
                : `A school play sold ${n} tickets. Child tickets cost $5 and adult tickets cost $8, and the tickets brought in ${show(total)}. How many adult tickets were sold?`;
        const each = show(gap);

        return {
          prompt,
          answer: { kind: 'number', value: dear },
          hints: [
            `Pretend all ${n} are ${story.cheap}s. What would the total be, and how far off is it?`,
            `Each ${story.cheap} swapped for a ${story.dear} adds ${each}.`,
          ],
          solution: [
            { text: `Pretend all ${n} are ${story.cheap}s. The total would be ${n} × ${show(story.lo)} = ${show(n * story.lo)}.` },
            { text: `The real total is ${show(total)}, which is ${show(total - n * story.lo)} more. Each ${story.cheap} swapped for a ${story.dear} adds ${each}.` },
            { text: `So the number of ${story.dear}s is ${show(total - n * story.lo)} ÷ ${show(gap)} = ${dear}.` },
            {
              text: `With algebra: let d be the number of ${story.dear}s, so there are ${n} − d ${story.cheap}s.`,
              visual: working([
                { label: 'Translate', text: `${plain(story.hi)}d + ${plain(story.lo)}(${n} − d) = ${plain(total)}` },
                { label: 'Collect', text: `${coef(plain(gap))}d + ${plain(n * story.lo)} = ${plain(total)}` },
                { label: 'Solve', text: `d = ${dear}` },
              ]),
            },
          ],
        };
      },
    },
  ],
};

export const ALGEBRA_LESSONS: Lesson[] = [equations];
