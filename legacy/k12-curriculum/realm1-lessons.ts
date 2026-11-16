// Realm I: The Primordial Garden — counting, comparing, adding, subtracting.
import type { Lesson, Rng, Visual } from './types.ts';

const int = (rng: Rng, lo: number, hi: number) => lo + Math.floor(rng() * (hi - lo + 1));
const things = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** A number line showing `hops` steps from `start`, with a little room either side. */
function line(start: number, hops: number): Visual {
  const lo = Math.min(start, start + hops);
  const hi = Math.max(start, start + hops);
  return { kind: 'number-line', min: Math.max(0, lo - 2), max: hi + 2, start, hops };
}

const counting: Lesson = {
  topic: 'counting',
  intro: [
    {
      text: 'Counting means giving each thing exactly one number, in order: 1, 2, 3… Tap each dot once to count it.',
      visual: { kind: 'dots', groups: [5] },
    },
    {
      text: 'The last number you say is how many there are. Count these, and the last number is the answer.',
      visual: { kind: 'dots', groups: [7] },
    },
    {
      text: 'You don\'t have to start at 1. Start at 6 and count on: each hop is the next number.',
      visual: line(6, 3),
    },
  ],
  rungs: [
    {
      id: 'counting/how-many',
      idea: 'Count a group',
      generate: rng => {
        const n = int(rng, 3, 10);
        const visual: Visual = { kind: 'dots', groups: [n] };
        return {
          prompt: 'How many dots are there?',
          visual,
          answer: { kind: 'number', value: n },
          hints: ['Tap each dot once. Don\'t skip any, and don\'t count any twice.'],
          solution: [
            { text: 'Touch each dot once, saying the next number each time.', visual },
            { text: `The last number you say is ${n}, so there are ${things(n, 'dot')}.` },
          ],
        };
      },
    },
    {
      id: 'counting/what-comes-next',
      idea: 'Say the next number',
      buildsOn: 'counting/how-many',
      generate: rng => {
        const n = int(rng, 4, 18);
        return {
          prompt: `What number comes right after ${n}?`,
          answer: { kind: 'number', value: n + 1 },
          hints: [`Count up to ${n} in your head, then say one more number.`],
          solution: [
            { text: `Find ${n} on the number line and take one hop to the right.`, visual: line(n, 1) },
            { text: `One hop past ${n} lands on ${n + 1}.` },
          ],
        };
      },
    },
    {
      id: 'counting/count-on',
      idea: 'Count on from any number',
      buildsOn: 'counting/what-comes-next',
      generate: rng => {
        const start = int(rng, 5, 12);
        const more = int(rng, 2, 4);
        const visual = line(start, more);
        return {
          prompt: `Start at ${start} and count on ${more} more. Where do you land?`,
          visual,
          answer: { kind: 'number', value: start + more },
          hints: [
            `Don't start again from 1. Start at ${start}.`,
            `Say the next ${more} numbers after ${start}. The last one is your answer.`,
          ],
          solution: [
            { text: `Put your finger on ${start} and take ${things(more, 'hop')} to the right.`, visual },
            { text: `After ${things(more, 'hop')} you land on ${start + more}.` },
          ],
        };
      },
    },
  ],
};

const numberSense: Lesson = {
  topic: 'number_sense',
  intro: [
    {
      text: 'Comparing means asking which is more. Count each group: the one with the bigger count has more.',
      visual: { kind: 'dots', groups: [6, 4] },
    },
    {
      text: 'On a number line, every hop to the right is a bigger number. 9 is to the right of 5, so 9 is bigger.',
      visual: line(5, 4),
    },
    {
      text: 'We write it with symbols: 5 < 9 means "5 is less than 9", and 9 > 5 means "9 is greater than 5". The small pointy end always points at the smaller number. If both are the same, we write =.',
    },
  ],
  rungs: [
    {
      id: 'number_sense/which-group',
      idea: 'Find the bigger group',
      buildsOn: 'counting/how-many',
      generate: rng => {
        const a = int(rng, 2, 9);
        let b = int(rng, 2, 8);
        if (b >= a) b += 1;
        const visual: Visual = { kind: 'dots', groups: [a, b] };
        return {
          prompt: 'Which group has more dots?',
          visual,
          answer: { kind: 'choice', options: ['The first group', 'The second group'], correct: a > b ? 0 : 1 },
          hints: ['Count each group by tapping its dots, then compare the two numbers.'],
          solution: [
            { text: `Count each group. The first has ${a} and the second has ${b}.`, visual },
            { text: `${Math.max(a, b)} is more than ${Math.min(a, b)}, so the ${a > b ? 'first' : 'second'} group has more.` },
          ],
        };
      },
    },
    {
      id: 'number_sense/bigger-number',
      idea: 'Compare two numbers',
      buildsOn: 'number_sense/which-group',
      generate: rng => {
        const a = int(rng, 1, 19);
        let b = int(rng, 1, 18);
        if (b >= a) b += 1;
        const lo = Math.min(a, b);
        const hi = Math.max(a, b);
        return {
          prompt: `Which number is bigger: ${a} or ${b}?`,
          answer: { kind: 'choice', options: [String(a), String(b)], correct: a > b ? 0 : 1 },
          hints: ['Which one would you say later if you counted up from 1?'],
          solution: [
            { text: `Start at ${lo} on the number line and hop right until you reach ${hi}.`, visual: line(lo, hi - lo) },
            { text: `You had to move right to get from ${lo} to ${hi}, so ${hi} is bigger.` },
          ],
        };
      },
    },
    {
      id: 'number_sense/compare-symbol',
      idea: 'Use <, = and >',
      buildsOn: 'number_sense/bigger-number',
      generate: rng => {
        const a = int(rng, 1, 20);
        const b = rng() < 0.25 ? a : int(rng, 1, 20);
        const symbol = a < b ? '<' : a === b ? '=' : '>';
        const steps =
          a === b
            ? [{ text: `Both numbers are ${a}. They are the same amount, so we use the equals sign: ${a} = ${b}.` }]
            : [
                {
                  text: `${Math.min(a, b)} comes before ${Math.max(a, b)} on the number line, so ${Math.min(a, b)} is the smaller one.`,
                  visual: line(Math.min(a, b), Math.abs(a - b)),
                },
                { text: `The pointy end points at the smaller number: ${a} ${symbol} ${b}.` },
              ];
        return {
          prompt: `Which symbol makes this true?   ${a}  ▢  ${b}`,
          answer: { kind: 'choice', options: ['<', '=', '>'], correct: ['<', '=', '>'].indexOf(symbol) },
          hints: [
            'First decide which number is smaller, or whether they are the same.',
            'The small pointy end of < or > points at the smaller number.',
          ],
          solution: steps,
        };
      },
    },
  ],
};

const addition: Lesson = {
  topic: 'add_basic',
  intro: [
    {
      text: 'Adding puts two groups together. 3 + 2 means "3 and 2 more". Count all the dots to find the total.',
      visual: { kind: 'dots', groups: [3, 2] },
    },
    {
      text: 'A faster way: start at the first number and count on. For 5 + 3, start at 5 and take 3 hops.',
      visual: line(5, 3),
    },
    {
      text: 'The order doesn\'t change the total: 2 + 5 lands in the same place as 5 + 2. So you can always start from the bigger number and take fewer hops.',
      visual: line(2, 5),
    },
  ],
  rungs: [
    {
      id: 'add_basic/combine',
      idea: 'Put two groups together',
      buildsOn: 'counting/how-many',
      generate: rng => {
        const a = int(rng, 1, 5);
        const b = int(rng, 1, 5);
        const visual: Visual = { kind: 'dots', groups: [a, b] };
        return {
          prompt: `${a} + ${b} = ?`,
          visual,
          answer: { kind: 'number', value: a + b },
          hints: ['Count every dot in both groups, without starting over at the second group.'],
          solution: [
            { text: `Count the first group: ${a}. Keep going through the second group without starting over.`, visual },
            { text: `Altogether there are ${a + b} dots, so ${a} + ${b} = ${a + b}.` },
          ],
        };
      },
    },
    {
      id: 'add_basic/count-on',
      idea: 'Add by counting on',
      buildsOn: 'counting/count-on',
      generate: rng => {
        const a = int(rng, 5, 12);
        const b = int(rng, 2, 5);
        const visual = line(a, b);
        return {
          prompt: `${a} + ${b} = ?`,
          visual,
          answer: { kind: 'number', value: a + b },
          hints: [`You already have ${a}. Start there instead of counting from 1.`, `Take ${things(b, 'hop')} from ${a}.`],
          solution: [
            { text: `Start at ${a}. Adding ${b} means taking ${things(b, 'hop')} to the right.`, visual },
            { text: `You land on ${a + b}, so ${a} + ${b} = ${a + b}.` },
          ],
        };
      },
    },
    {
      id: 'add_basic/missing-part',
      idea: 'Find the missing part',
      buildsOn: 'add_basic/count-on',
      generate: rng => {
        const a = int(rng, 3, 10);
        const b = int(rng, 2, 6);
        const c = a + b;
        return {
          prompt: `What number goes in the box?   ${a} + ▢ = ${c}`,
          answer: { kind: 'number', value: b },
          hints: [`How many hops does it take to get from ${a} to ${c}?`, `Count on from ${a} until you say ${c}, keeping track on your fingers.`],
          solution: [
            { text: `Start at ${a} and hop right until you reach ${c}. Count the hops as you go.`, visual: line(a, b) },
            { text: `It takes ${things(b, 'hop')}, so ${a} + ${b} = ${c}. The missing number is ${b}.` },
          ],
        };
      },
    },
  ],
};

const subtraction: Lesson = {
  topic: 'sub_basic',
  intro: [
    {
      text: 'Subtracting takes some away. 7 − 3 means "start with 7 and take 3 away". Count the dots that are left.',
      visual: { kind: 'dots', groups: [7], crossed: 3 },
    },
    {
      text: 'On the number line, taking away means hopping left. For 9 − 4, start at 9 and take 4 hops back.',
      visual: line(9, -4),
    },
    {
      text: 'Subtraction undoes addition. Because 5 + 3 = 8, you also know 8 − 3 = 5 and 8 − 5 = 3. One addition fact gives you two subtraction facts for free.',
    },
  ],
  rungs: [
    {
      id: 'sub_basic/take-away',
      idea: 'Take some away',
      buildsOn: 'add_basic/combine',
      generate: rng => {
        const a = int(rng, 3, 10);
        const b = int(rng, 1, a - 1);
        const visual: Visual = { kind: 'dots', groups: [a], crossed: b };
        return {
          prompt: `${a} − ${b} = ?`,
          visual,
          answer: { kind: 'number', value: a - b },
          hints: [`${things(b, 'dot')} ${b === 1 ? 'is' : 'are'} crossed out. Count only the dots that are left.`],
          solution: [
            { text: `There were ${a} dots and ${b} ${b === 1 ? 'was' : 'were'} taken away. Count the ones still there.`, visual },
            { text: `${things(a - b, 'dot')} ${a - b === 1 ? 'is' : 'are'} left, so ${a} − ${b} = ${a - b}.` },
          ],
        };
      },
    },
    {
      id: 'sub_basic/count-back',
      idea: 'Subtract by counting back',
      buildsOn: 'sub_basic/take-away',
      generate: rng => {
        const a = int(rng, 8, 20);
        const b = int(rng, 2, 5);
        const visual = line(a, -b);
        return {
          prompt: `${a} − ${b} = ?`,
          visual,
          answer: { kind: 'number', value: a - b },
          hints: [`Start at ${a} and move left, toward the smaller numbers.`, `Take ${things(b, 'hop')} back from ${a}.`],
          solution: [
            { text: `Start at ${a}. Subtracting ${b} means taking ${things(b, 'hop')} to the left.`, visual },
            { text: `You land on ${a - b}, so ${a} − ${b} = ${a - b}.` },
          ],
        };
      },
    },
    {
      id: 'sub_basic/fact-family',
      idea: 'Use an addition fact',
      buildsOn: 'add_basic/missing-part',
      generate: rng => {
        const a = int(rng, 2, 9);
        const b = int(rng, 2, 9);
        const c = a + b;
        return {
          prompt: `You know that ${a} + ${b} = ${c}. What is ${c} − ${a}?`,
          answer: { kind: 'number', value: b },
          hints: [`${c} is made of two parts: ${a} and ${b}.`, `If you take the ${a} away from ${c}, which part is left?`],
          solution: [
            { text: `${c} is made of ${a} and ${b}. Take the ${a} away and count what is left.`, visual: { kind: 'dots', groups: [c], crossed: a } },
            { text: `The other part, ${b}, is left. So ${c} − ${a} = ${b}, with no counting needed.` },
          ],
        };
      },
    },
  ],
};

export const REALM_1_LESSONS: Lesson[] = [counting, numberSense, addition, subtraction];
