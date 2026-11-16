// Realm I: Number Sense — mean, median and mode.
import type { Lesson, Visual } from './types.ts';
import { fmt, gcd, int, pick, shuffle } from './util.ts';

type Row = { label?: string; text: string };
const working = (rows: Row[]): Visual => ({ kind: 'rows', rows });

const NAMES = ['Priya', 'Marcus', 'Elena', 'Tomas', 'Aisha', 'Devon'];

const statistics: Lesson = {
  topic: 'statistics',
  intro: [
    {
      text: 'The mean (the average) is a total in disguise. If four tests average 85, you do not know any single score, but you do know they add up to 4 × 85 = 340. Nearly every contest problem about a mean is solved by turning it back into a total. What score on a fifth test would lift that average to 87?',
      visual: working([
        { label: 'Total so far', text: '4 × 85 = 340' },
        { label: 'Total needed', text: '5 × 87 = 435' },
        { label: 'Fifth test', text: '435 − 340 = 95' },
      ]),
    },
    {
      text: 'There is a quicker way to see that 95. The mean is a balance point: the amounts above it and below it cancel out. Each of the four old tests sits 2 points below the target of 87, a shortfall of 8 in all. The fifth test has to make up for it, so it must be 8 above the target: 87 + 8 = 95.',
    },
    {
      text: 'The same idea handles a number leaving. Five numbers have a mean of 12. One is removed and the mean of the other four is 10. The totals went from 5 × 12 = 60 to 4 × 10 = 40, so the number removed was 20. And beware of averaging two averages: if 10 students average 70 and 30 students average 90, the combined mean is not 80. Add the totals, 700 + 2,700 = 3,400, and divide by all 40 students to get 85.',
    },
    {
      text: 'The median is the middle number once the list is in order. With an even count there are two middle numbers, and the median is halfway between them. The mode is the value that appears most often. In 3, 5, 5, 8, 9, 12 the median is halfway between 5 and 8, which is 6.5, and the mode is 5.',
    },
    {
      text: 'A favorite contest question: five positive integers have a mean of 10 and a median of 12. How large can the largest be? They total 50. To leave as much as possible for the largest, make the others as small as the rules allow. In order, the list is 1, 1, 12, 12, and then 50 − 26 = 24. The fourth number cannot drop below the median, so 12 is the least it can be.',
    },
  ],
  rungs: [
    {
      id: 'statistics/total',
      idea: 'A mean is a total in disguise',
      generate: rng => {
        if (rng() < 0.6) {
          const name = pick(rng, NAMES);
          const n = int(rng, 3, 5);
          const d = int(rng, 1, 3);
          const avg = int(rng, 76, 100 - d * (n + 1) - d);
          const target = avg + d;
          const need = target + n * d;
          return {
            prompt: `${name} has averaged ${avg} on the first ${n} tests of the term. What score on the next test would raise the average to ${target}?`,
            answer: { kind: 'number', value: need },
            hints: [
              `What do the first ${n} scores add up to? What must all ${n + 1} add up to?`,
              `The total so far is ${n} × ${avg} = ${n * avg}. An average of ${target} over ${n + 1} tests needs a total of ${(n + 1) * target}.`,
            ],
            solution: [
              {
                text: 'Turn each average back into a total.',
                visual: working([
                  { label: 'Total so far', text: `${n} × ${avg} = ${n * avg}` },
                  { label: 'Total needed', text: `${n + 1} × ${target} = ${(n + 1) * target}` },
                  { label: 'Next test', text: `${(n + 1) * target} − ${n * avg} = ${need}` },
                ]),
              },
              { text: `Or balance it: each of the ${n} old tests is ${d} below the target, a shortfall of ${n * d}. The next test must sit ${n * d} above the target: ${target} + ${n * d} = ${need}.` },
            ],
          };
        }
        let n: number, avg: number, target: number, extra: number;
        do {
          n = int(rng, 4, 9);
          avg = int(rng, 12, 40);
          target = avg + pick(rng, [-3, -2, -1, 1, 2, 3]);
          extra = target + n * (target - avg);
        } while (extra <= 0);
        const up = target > avg;
        return {
          prompt: `The mean of ${n} numbers is ${avg}. When one more number is included, the mean of all ${n + 1} numbers is ${target}. What is the number that was included?`,
          answer: { kind: 'number', value: extra },
          hints: [
            `What do the ${n} numbers add up to? What do all ${n + 1} add up to?`,
            `The totals are ${n} × ${avg} = ${n * avg} and ${n + 1} × ${target} = ${(n + 1) * target}.`,
          ],
          solution: [
            {
              text: 'Turn each mean back into a total. The new number is the difference.',
              visual: working([
                { label: 'Before', text: `${n} × ${avg} = ${n * avg}` },
                { label: 'After', text: `${n + 1} × ${target} = ${(n + 1) * target}` },
                { label: 'New number', text: `${(n + 1) * target} − ${n * avg} = ${extra}` },
              ]),
            },
            { text: `Or balance it: the ${n} old numbers average ${Math.abs(target - avg)} ${up ? 'below' : 'above'} the new mean, ${n * Math.abs(target - avg)} in all. The new number must sit that far ${up ? 'above' : 'below'} it: ${target} ${up ? '+' : '−'} ${n * Math.abs(target - avg)} = ${extra}.` },
          ],
        };
      },
    },
    {
      id: 'statistics/combine',
      idea: 'Add totals, never averages',
      buildsOn: 'statistics/total',
      generate: rng => {
        if (rng() < 0.5) {
          let n: number, avg: number, rest: number, gone: number;
          do {
            n = int(rng, 5, 10);
            avg = int(rng, 12, 40);
            rest = avg + pick(rng, [-3, -2, -1, 1, 2, 3]);
            gone = n * avg - (n - 1) * rest;
          } while (gone <= 0);
          return {
            prompt: `The mean of ${n} numbers is ${avg}. One of the numbers is removed, and the mean of the remaining ${n - 1} numbers is ${rest}. What number was removed?`,
            answer: { kind: 'number', value: gone },
            hints: [
              `What did the ${n} numbers add up to? What do the remaining ${n - 1} add up to?`,
              `The total fell from ${n} × ${avg} = ${n * avg} to ${n - 1} × ${rest} = ${(n - 1) * rest}.`,
            ],
            solution: [
              {
                text: 'Turn each mean into a total. The number removed is what the total lost.',
                visual: working([
                  { label: 'Before', text: `${n} × ${avg} = ${n * avg}` },
                  { label: 'After', text: `${n - 1} × ${rest} = ${(n - 1) * rest}` },
                  { label: 'Removed', text: `${n * avg} − ${(n - 1) * rest} = ${gone}` },
                ]),
              },
              { text: `That makes sense: the mean went ${rest > avg ? 'up' : 'down'}, so the number removed was ${rest > avg ? 'below' : 'above'} the old mean of ${avg}.` },
            ],
          };
        }
        let n1: number, n2: number, a1: number, a2: number;
        do {
          [n1, n2] = [int(rng, 2, 8) * 2, int(rng, 2, 8) * 3];
          if (rng() < 0.5) [n1, n2] = [n2, n1];
          const unit = (n1 + n2) / gcd(n2, n1 + n2);
          a1 = int(rng, 60, 80);
          a2 = a1 + unit * pick(rng, [-2, -1, 1, 2]);
        } while (n1 === n2 || a2 < 50 || a2 > 98 || Math.abs(a2 - a1) < 4);
        const [t1, t2] = [n1 * a1, n2 * a2];
        const mean = (t1 + t2) / (n1 + n2);
        return {
          prompt: `Two classes took the same test. The ${n1} students in one class averaged ${a1}, and the ${n2} students in the other averaged ${a2}. What was the average score of all ${n1 + n2} students?`,
          answer: { kind: 'number', value: mean },
          hints: [
            `It is not ${(a1 + a2) / 2}. The classes are different sizes, so the bigger class pulls the average toward its score.`,
            `Find each class's total: ${n1} × ${a1} and ${n2} × ${a2}.`,
          ],
          solution: [
            {
              text: 'Averages cannot be averaged unless the groups are the same size. Go back to totals.',
              visual: working([
                { label: 'First class', text: `${n1} × ${a1} = ${fmt(t1)}` },
                { label: 'Second class', text: `${n2} × ${a2} = ${fmt(t2)}` },
                { label: 'Everyone', text: `${fmt(t1)} + ${fmt(t2)} = ${fmt(t1 + t2)}` },
                { label: 'Mean', text: `${fmt(t1 + t2)} ÷ ${n1 + n2} = ${mean}` },
              ]),
            },
            { text: `The answer lands closer to ${n1 > n2 ? a1 : a2} than to ${n1 > n2 ? a2 : a1}, because that class has more students.` },
          ],
        };
      },
    },
    {
      id: 'statistics/median-mode',
      idea: 'Median and mode',
      buildsOn: 'statistics/combine',
      generate: rng => {
        if (rng() < 0.5) {
          const count = pick(rng, [6, 8]);
          let sorted: number[];
          do sorted = Array.from({ length: count }, () => int(rng, 2, 40)).sort((x, y) => x - y);
          while (sorted[count / 2 - 1] === sorted[count / 2] || (sorted[count / 2 - 1] + sorted[count / 2]) % 2 === 1);
          const [lo, hi] = [sorted[count / 2 - 1], sorted[count / 2]];
          return {
            prompt: `What is the median of ${shuffle(rng, sorted).join(', ')}?`,
            answer: { kind: 'number', value: (lo + hi) / 2 },
            hints: [
              'Put the numbers in order first.',
              `There are ${count} numbers, so no single one is in the middle. Look at the two in the middle.`,
            ],
            solution: [
              { text: `In order: ${sorted.join(', ')}.` },
              { text: `With ${count} numbers there are two in the middle, the ${count / 2 === 3 ? '3rd and 4th' : '4th and 5th'}: ${lo} and ${hi}.` },
              { text: `The median is halfway between them: (${lo} + ${hi}) ÷ 2 = ${(lo + hi) / 2}.` },
            ],
          };
        }
        let a: number, b: number, m: number, x: number;
        do {
          [a, b, m] = [int(rng, 2, 20), int(rng, 2, 20), int(rng, 5, 16)];
          x = 3 * m - a - b;
        } while (new Set([a, b, m, x]).size < 4 || x <= 0);
        return {
          prompt: `The five numbers ${a}, ${m}, ${b}, ${m} and x have exactly one mode, and their mean is equal to that mode. What is x?`,
          answer: { kind: 'number', value: x },
          hints: [
            `${m} already appears twice. Could anything else be the only mode?`,
            `The mode is ${m}, so the mean is ${m} and the five numbers add up to 5 × ${m} = ${5 * m}.`,
          ],
          solution: [
            { text: `${m} appears twice. If x matched ${a} or ${b} there would be two modes, so the only mode has to be ${m}.` },
            { text: `The mean is therefore ${m}, which makes the total 5 × ${m} = ${5 * m}.` },
            { text: `The four known numbers add up to ${a} + ${m} + ${b} + ${m} = ${a + b + 2 * m}, so x = ${5 * m} − ${a + b + 2 * m} = ${x}.` },
          ],
        };
      },
    },
    {
      id: 'statistics/extreme',
      idea: 'Push the other numbers to their limits',
      buildsOn: 'statistics/median-mode',
      generate: rng => {
        const distinct = rng() < 0.5;
        const median = int(rng, 5, 15);
        const mean = median + int(rng, 0, 6);
        const others = distinct ? [1, 2, median, median + 1] : [1, 1, median, median];
        const used = others.reduce((s, v) => s + v, 0);
        const largest = 5 * mean - used;
        return {
          prompt: `Five ${distinct ? 'different ' : ''}positive integers have a mean of ${mean} and a median of ${median}. What is the largest possible value of the largest of the five?`,
          answer: { kind: 'number', value: largest },
          hints: [
            `The five numbers add up to 5 × ${mean} = ${5 * mean}. To make one of them as big as possible, what should the other four be?`,
            `Write them in order. The middle one must be ${median}. The two below it can be tiny, but the fourth cannot be less than the median${distinct ? ', and no two may be equal' : ''}.`,
          ],
          solution: [
            { text: `The mean fixes the total: 5 × ${mean} = ${5 * mean}. The largest number is whatever the other four leave behind, so make those four as small as the rules allow.` },
            {
              text: distinct
                ? `In order, the two smallest can be 1 and 2. The middle number is the median, ${median}. The fourth must be bigger than the median, so at least ${median + 1}.`
                : `In order, the two smallest can both be 1. The middle number is the median, ${median}. The fourth cannot be below the median, so at least ${median}.`,
            },
            { text: `Those four add up to ${others.join(' + ')} = ${used}, leaving ${5 * mean} − ${used} = ${largest} for the largest.` },
            { text: `The list ${[...others, largest].join(', ')} really does have mean ${mean} and median ${median}.` },
          ],
        };
      },
    },
  ],
};

export const STATISTICS_LESSONS: Lesson[] = [statistics];
