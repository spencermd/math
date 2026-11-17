// Realm III: Counting — how many, without listing them all.
import type { Lesson, Visual } from './types.ts';
import { fmt, int, lcm, orList, pick, shuffle } from './util.ts';

type Row = { label?: string; text: string };

/** Working that turns `first, first + step, …` (`count` terms) into 1, 2, …, count. */
function listToCounting(first: number, step: number, count: number): Visual {
  const term = (i: number) => first + i * step;
  const rows: Row[] = [{ label: 'The list', text: `${term(0)}, ${term(1)}, ${term(2)}, …, ${term(count - 1)}` }];
  const shift = first - step;
  if (shift !== 0 && step > 1) {
    rows.push({
      label: shift > 0 ? `Subtract ${shift}` : `Add ${-shift}`,
      text: `${step}, ${2 * step}, ${3 * step}, …, ${count * step}`,
    });
  }
  if (step > 1) {
    rows.push({ label: `Divide by ${step}`, text: `1, 2, 3, …, ${count}` });
  } else {
    rows.push({ label: shift > 0 ? `Subtract ${shift}` : `Add ${-shift}`, text: `1, 2, 3, …, ${count}` });
  }
  return { kind: 'rows', rows };
}

const countingLists: Lesson = {
  topic: 'counting_lists',
  intro: [
    {
      text: 'How many numbers are in the list 1, 2, 3, …, 50? That one is free: 50. A list that starts at 1 and goes up by ones counts itself. So the plan for every other list is to turn it into one of those.',
    },
    {
      text: 'How many numbers are in 23, 24, 25, …, 71? Subtract 22 from every number. Changing the numbers doesn\'t change how many there are, and now the list counts itself: 49. Notice it is not 71 − 23 = 48. Plain subtraction forgets the first number.',
      visual: listToCounting(23, 1, 49),
    },
    {
      text: 'A list that goes up in bigger steps needs one more move. For 12, 15, 18, …, 96, divide every number by the step, 3. Then shift it down to start at 1.',
      visual: {
        kind: 'rows',
        rows: [
          { label: 'The list', text: '12, 15, 18, …, 96' },
          { label: 'Divide by 3', text: '4, 5, 6, …, 32' },
          { label: 'Subtract 3', text: '1, 2, 3, …, 29' },
        ],
      },
    },
    {
      text: 'If the numbers are not multiples of the step, shift first so that they are. For 7, 11, 15, …, 99 the step is 4, so slide the list to start at 4. Then divide. There are 24 numbers.',
      visual: listToCounting(7, 4, 24),
    },
  ],
  rungs: [
    {
      id: 'counting_lists/consecutive',
      idea: 'Count a run of whole numbers',
      generate: rng => {
        const a = int(rng, 12, 80);
        const b = a + int(rng, 25, 120);
        const variant = int(rng, 0, 2);

        if (variant === 2) {
          const count = b - a - 1;
          return {
            prompt: `How many whole numbers are strictly between ${a} and ${b}?`,
            answer: { kind: 'number', value: count },
            mistakes: [
              { value: b - a, why: `${b} − ${a} counts one of the two ends. "Strictly between" leaves both out.` },
              { value: b - a + 1, why: `That counts ${a} and ${b} as well. "Strictly between" leaves both out.` },
            ],
            hints: [
              `"Strictly between" leaves out ${a} and ${b} themselves. What are the first and last numbers you do count?`,
              `The list is ${a + 1}, ${a + 2}, …, ${b - 1}. Subtract ${a} from each number.`,
            ],
            solution: [
              { text: `${a} and ${b} themselves don't count, so the list is ${a + 1}, ${a + 2}, …, ${b - 1}.` },
              { text: `Subtract ${a} from every number so the list starts at 1.`, visual: listToCounting(a + 1, 1, count) },
              { text: `The list now counts itself: there are ${count} numbers.` },
            ],
          };
        }

        const count = b - a + 1;
        return {
          prompt:
            variant === 0
              ? `How many whole numbers are in the list ${a}, ${a + 1}, ${a + 2}, …, ${b}?`
              : `Maya read from the top of page ${a} to the bottom of page ${b}. How many pages did she read?`,
          answer: { kind: 'number', value: count },
          mistakes: [
            { value: b - a, why: `${b} − ${a} counts the steps between the numbers, which leaves out the first one.` },
          ],
          hints: [
            `It isn't ${b} − ${a}. Try a tiny case: how many numbers are in 5, 6, 7?`,
            `Subtract ${a - 1} from every number so the list starts at 1.`,
          ],
          solution: [
            {
              text: `${variant === 1 ? `The pages are ${a}, ${a + 1}, …, ${b}. ` : ''}Subtract ${a - 1} from every number so the list starts at 1.`,
              visual: listToCounting(a, 1, count),
            },
            { text: `The list now counts itself: there are ${count}. That is ${b} − ${a} + 1; the "+ 1" is the first number, which plain subtraction leaves out.` },
          ],
        };
      },
    },
    {
      id: 'counting_lists/arithmetic',
      idea: 'Count an evenly spaced list',
      buildsOn: 'counting_lists/consecutive',
      generate: rng => {
        const step = pick(rng, [3, 4, 5, 6, 7, 8, 9, 11, 12]);
        const first = int(rng, 2, 30);
        const count = int(rng, 12, 45);
        const last = first + (count - 1) * step;
        const shift = first - step;
        const shiftText = shift > 0 ? `subtract ${shift} from` : `add ${-shift} to`;
        return {
          prompt: `How many numbers are in the list ${first}, ${first + step}, ${first + 2 * step}, …, ${last}?`,
          answer: { kind: 'number', value: count },
          hints: [
            `The numbers go up by ${step} each time.`,
            shift === 0
              ? `Every number is a multiple of ${step}. Divide the whole list by ${step}.`
              : `Slide the list so it starts at ${step}: ${shiftText} every number. Then divide by ${step}.`,
          ],
          solution: [
            {
              text:
                shift === 0
                  ? `The list goes up by ${step} and starts at ${step}, so every number is a multiple of ${step}. Divide them all by ${step}.`
                  : `The list goes up by ${step}. First ${shiftText} every number so the list starts at ${step}. Then every number is a multiple of ${step}, and you can divide them all by ${step}.`,
              visual: listToCounting(first, step, count),
            },
            { text: `The last number becomes ${count}, so there are ${count} numbers in the list.` },
          ],
        };
      },
    },
    {
      id: 'counting_lists/multiples',
      idea: 'Count the multiples in a range',
      buildsOn: 'counting_lists/arithmetic',
      generate: rng => {
        let k: number;
        let lo: number;
        let hi: number;
        let prompt: string;

        if (rng() < 0.5) {
          k = pick(rng, [6, 7, 8, 9, 11, 12, 13]);
          lo = int(rng, 50, 150);
          hi = lo + int(rng, 150, 500);
          // Keep the ends off multiples so "between" isn't ambiguous.
          if (lo % k === 0) lo += 1;
          if (hi % k === 0) hi += 1;
          prompt = `How many multiples of ${k} are between ${lo} and ${hi}?`;
        } else {
          const digits = pick(rng, [2, 3]);
          k = digits === 2 ? pick(rng, [3, 4, 6, 7, 8]) : pick(rng, [6, 7, 8, 9, 11, 12, 13, 15]);
          lo = digits === 2 ? 10 : 100;
          hi = digits === 2 ? 99 : 999;
          prompt = `How many ${digits}-digit whole numbers are multiples of ${k}?`;
        }

        const first = Math.ceil(lo / k);
        const last = Math.floor(hi / k);
        const count = last - first + 1;
        return {
          prompt,
          answer: { kind: 'number', value: count },
          hints: [
            `Find the smallest and the largest multiple of ${k} in the range.`,
            `The multiples are ${k} × ${first}, ${k} × ${first + 1}, …, ${k} × ${last}. Now it's a list to count.`,
          ],
          solution: [
            { text: `The smallest multiple of ${k} in the range is ${k} × ${first} = ${fmt(k * first)}. The largest is ${k} × ${last} = ${fmt(k * last)}.` },
            {
              text: `Divide the list of multiples by ${k}, then subtract ${first - 1} so it starts at 1.`,
              visual: {
                kind: 'rows',
                rows: [
                  { label: 'The multiples', text: `${k * first}, ${k * (first + 1)}, ${k * (first + 2)}, …, ${k * last}` },
                  { label: `Divide by ${k}`, text: `${first}, ${first + 1}, ${first + 2}, …, ${last}` },
                  { label: `Subtract ${first - 1}`, text: `1, 2, 3, …, ${count}` },
                ],
              },
            },
            { text: `There are ${count} multiples of ${k}.` },
          ],
        };
      },
    },
  ],
};

const LETTERS = 'ABCDEF';

const multPrinciple: Lesson = {
  topic: 'mult_principle',
  intro: [
    {
      text: 'An outfit is a shirt and a pair of shorts. With 3 shirts and 2 pairs of shorts, each shirt can go with either pair, so there are 3 × 2 = 6 outfits. Tap each slot to see its choices.',
      visual: {
        kind: 'slots',
        slots: [
          { label: 'Shirt', count: 3, why: '3 shirts to pick from' },
          { label: 'Shorts', count: 2, why: '2 pairs, whichever shirt you picked' },
        ],
      },
    },
    {
      text: 'This is the multiplication principle. When something is chosen in stages, and the number of options at each stage is the same no matter what came before, multiply the options. A lunch of one of 4 sandwiches, one of 3 drinks and one of 5 desserts can be chosen in 60 ways.',
      visual: {
        kind: 'slots',
        slots: [
          { label: 'Sandwich', count: 4, why: '4 sandwiches' },
          { label: 'Drink', count: 3, why: '3 drinks with each sandwich' },
          { label: 'Dessert', count: 5, why: '5 desserts with each of those' },
        ],
      },
    },
    {
      text: 'Numbers are built in stages too: one digit at a time. How many 3-digit numbers are odd? The hundreds digit can\'t be 0, the tens digit can be anything, and the units digit must be odd.',
      visual: {
        kind: 'slots',
        slots: [
          { label: 'Hundreds', count: 9, why: '1 to 9: a number can\'t start with 0' },
          { label: 'Tens', count: 10, why: 'any digit, 0 to 9' },
          { label: 'Units', count: 5, why: '1, 3, 5, 7 or 9' },
        ],
      },
    },
    {
      text: 'When nothing may repeat, each choice uses up an option for the later slots. Fill the fussiest slot first. How many odd 3-digit numbers use three different digits from 1, 2, 3, 4, 5? Start with the units digit, which must be odd.',
      visual: {
        kind: 'slots',
        slots: [
          { label: 'Units', count: 3, why: 'must be odd: 1, 3 or 5' },
          { label: 'Hundreds', count: 4, why: 'any of the 4 digits left' },
          { label: 'Tens', count: 3, why: 'any of the 3 digits still left' },
        ],
      },
    },
  ],
  rungs: [
    {
      id: 'mult_principle/stages',
      idea: 'Multiply the choices',
      generate: rng => {
        const a = int(rng, 3, 8);
        const b = int(rng, 2, 6);
        const c = int(rng, 2, 5);
        const story = pick(rng, [
          {
            prompt: `A sandwich shop offers ${a} kinds of bread, ${b} fillings and ${c} sauces. A sandwich has one of each. How many different sandwiches can be made?`,
            labels: ['Bread', 'Filling', 'Sauce'],
          },
          {
            prompt: `Ravi has ${a} shirts, ${b} pairs of pants and ${c} hats. How many different outfits of one shirt, one pair of pants and one hat can he wear?`,
            labels: ['Shirt', 'Pants', 'Hat'],
          },
          {
            prompt: `There are ${a} roads from Ashby to Brook, ${b} roads from Brook to Calder, and ${c} roads from Calder to Dunmore. How many routes go from Ashby to Dunmore by way of Brook and then Calder?`,
            labels: ['Ashby → Brook', 'Brook → Calder', 'Calder → Dunmore'],
          },
        ]);
        return {
          prompt: story.prompt,
          answer: { kind: 'number', value: a * b * c },
          hints: [
            'It is not a sum. For each first choice, how many ways are there to make the second?',
            `There are ${a} × ${b} ways to make the first two choices. Each of those goes with ${c} third choices.`,
          ],
          solution: [
            {
              text: 'Three choices are made one after another, and none of them limits the others. Multiply the options.',
              visual: {
                kind: 'slots',
                slots: [
                  { label: story.labels[0], count: a, why: `${a} options` },
                  { label: story.labels[1], count: b, why: `${b} options for each of those` },
                  { label: story.labels[2], count: c, why: `${c} options for each of those` },
                ],
              },
            },
            { text: `${a} × ${b} × ${c} = ${a * b * c}.` },
          ],
        };
      },
    },
    {
      id: 'mult_principle/codes',
      idea: 'Count codes, with and without repeats',
      buildsOn: 'mult_principle/stages',
      generate: rng => {
        const s = int(rng, 3, 6);
        const letters = LETTERS.slice(0, s).split('');
        const digits = pick(rng, [1, 2]);
        const repeat = rng() < 0.5;

        const slots = [
          { label: '1st letter', count: s, why: `any of the ${s} letters` },
          repeat
            ? { label: '2nd letter', count: s, why: `any of the ${s} letters again` }
            : { label: '2nd letter', count: s - 1, why: 'one letter is already used' },
          { label: digits === 2 ? '1st digit' : 'Digit', count: 10, why: 'any digit, 0 to 9' },
        ];
        if (digits === 2) {
          slots.push(
            repeat
              ? { label: '2nd digit', count: 10, why: 'any digit again' }
              : { label: '2nd digit', count: 9, why: 'one digit is already used' },
          );
        }
        const answer = slots.reduce((n, slot) => n * slot.count, 1);

        return {
          prompt: `A locker code is 2 letters chosen from ${letters.join(', ')}, followed by ${digits === 2 ? '2 digits' : '1 digit'} from 0 to 9. ${repeat ? 'Letters and digits may repeat.' : digits === 2 ? 'No letter or digit may be used twice.' : 'The two letters must be different.'} How many codes are possible?`,
          answer: { kind: 'number', value: answer },
          hints: [
            `Draw a blank for each of the ${slots.length} symbols and write the number of options in each.`,
            repeat
              ? 'Repeats are allowed, so every letter slot has the same number of options.'
              : 'After the first letter is chosen, how many letters are left for the second?',
          ],
          solution: [
            {
              text: `The code has ${slots.length} slots. Count the options for each, in order.`,
              visual: { kind: 'slots', slots },
            },
            { text: `${slots.map(slot => slot.count).join(' × ')} = ${fmt(answer)}.` },
          ],
        };
      },
    },
    {
      id: 'mult_principle/restricted',
      idea: 'Fill the fussiest slot first',
      buildsOn: 'mult_principle/codes',
      generate: rng => {
        if (rng() < 0.5) {
          const n = pick(rng, [3, 4]);
          const kind = pick(rng, [
            { name: 'odd', units: 5, why: '1, 3, 5, 7 or 9' },
            { name: 'even', units: 5, why: '0, 2, 4, 6 or 8' },
            { name: 'multiples of 5', units: 2, why: '0 or 5' },
          ]);
          const middle = n - 2;
          const answer = 9 * 10 ** middle * kind.units;
          const slots = [
            { label: n === 3 ? 'Hundreds' : 'Thousands', count: 9, why: '1 to 9: a number can\'t start with 0' },
            ...(n === 4 ? [{ label: 'Hundreds', count: 10, why: 'any digit' }] : []),
            { label: 'Tens', count: 10, why: 'any digit' },
            { label: 'Units', count: kind.units, why: kind.why },
          ];
          return {
            prompt: `How many ${n}-digit whole numbers are ${kind.name}?`,
            answer: { kind: 'number', value: answer },
            hints: [
              'Build the number one digit at a time. Which digits have a restriction?',
              'The first digit can\'t be 0, and only the last digit decides whether the number qualifies.',
            ],
            solution: [
              {
                text: `Choose the digits one at a time. Only two of them are restricted: the first can't be 0, and the last must make the number ${kind.name === 'multiples of 5' ? 'a multiple of 5' : kind.name}.`,
                visual: { kind: 'slots', slots },
              },
              { text: `${slots.map(slot => slot.count).join(' × ')} = ${fmt(answer)}.` },
            ],
          };
        }

        // A given set of nonzero digits, no repeats, with a parity condition on the last digit.
        const parity = pick(rng, ['odd', 'even'] as const);
        const isGood = (d: number) => (d % 2 === 1) === (parity === 'odd');
        let digits: number[];
        do {
          digits = shuffle(rng, [1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, int(rng, 5, 6)).sort((x, y) => x - y);
        } while (digits.filter(isGood).length < 2 || digits.filter(isGood).length === digits.length);
        const good = digits.filter(isGood);
        const s = digits.length;
        const answer = good.length * (s - 1) * (s - 2);
        return {
          prompt: `How many ${parity} 3-digit numbers can be formed from the digits ${digits.join(', ')} if no digit may be used more than once?`,
          answer: { kind: 'number', value: answer },
          hints: [
            'Which place decides whether the number is ' + parity + '? Fill that one first.',
            `The units digit must be ${orList(good)}. After it is chosen, ${s - 1} digits are left for the next place.`,
          ],
          solution: [
            {
              text: `Only the units digit decides whether the number is ${parity}, so fill it first. Then fill the other two places from the digits that are left.`,
              visual: {
                kind: 'slots',
                slots: [
                  { label: 'Units', count: good.length, why: `must be ${parity}: ${orList(good)}` },
                  { label: 'Hundreds', count: s - 1, why: `any of the ${s - 1} digits left` },
                  { label: 'Tens', count: s - 2, why: `any of the ${s - 2} digits still left` },
                ],
              },
            },
            { text: `${good.length} × ${s - 1} × ${s - 2} = ${answer}.` },
          ],
        };
      },
    },
  ],
};

const GROUPS = [
  { who: 'students in a class', a: 'play soccer', b: 'play basketball', notB: 'do not play basketball', left: 'Soccer', right: 'Basketball' },
  { who: 'members of a club', a: 'speak Spanish', b: 'speak French', notB: 'do not speak French', left: 'Spanish', right: 'French' },
  { who: 'campers', a: 'signed up for swimming', b: 'signed up for archery', notB: 'did not sign up for archery', left: 'Swimming', right: 'Archery' },
  { who: 'families on a street', a: 'own a dog', b: 'own a cat', notB: 'do not own a cat', left: 'Dog', right: 'Cat' },
];

const venn: Lesson = {
  topic: 'venn',
  intro: [
    {
      text: 'In a class of 30 students, 18 play soccer, 15 play basketball, and 7 play both. How many play neither? The trap is adding 18 + 15 = 33. That is more than the whole class, because the 7 who play both were counted twice.',
    },
    {
      text: 'Draw two overlapping circles and fill in the overlap first: 7. Soccer has 18 in all, so 18 − 7 = 11 play only soccer. Likewise 15 − 7 = 8 play only basketball. Now every student sits in exactly one region. Tap each region.',
      visual: { kind: 'venn', left: 'Soccer', right: 'Basketball', onlyLeft: 11, both: 7, onlyRight: 8, outside: 4 },
    },
    {
      text: 'The shortcut: the number in at least one group is (first group) + (second group) − (both). Subtracting the overlap once undoes the double count. Here that is 18 + 15 − 7 = 26, which leaves 30 − 26 = 4 in neither.',
    },
    {
      text: 'The same rule runs backwards. If all 40 members of a club play chess or checkers, 25 play chess and 22 play checkers, then 25 + 22 = 47 is 7 too many. Those 7 extra are exactly the people counted twice, so 7 play both.',
      visual: { kind: 'venn', left: 'Chess', right: 'Checkers', onlyLeft: 18, both: 7, onlyRight: 15 },
    },
    {
      text: 'Numbers overlap too. How many of 1, 2, …, 100 are multiples of 2 or 3? There are 50 multiples of 2 and 33 multiples of 3. The overlap is the multiples of both, which are the multiples of 6: there are 16. So 50 + 33 − 16 = 67.',
      visual: { kind: 'venn', left: 'Multiples of 2', right: 'Multiples of 3', onlyLeft: 34, both: 16, onlyRight: 17, outside: 33 },
    },
  ],
  rungs: [
    {
      id: 'venn/either',
      idea: 'Fill in the overlap first',
      generate: rng => {
        const g = pick(rng, GROUPS);
        const both = int(rng, 3, 12);
        const onlyA = int(rng, 4, 15);
        const onlyB = int(rng, 4, 15);
        const [a, b] = [onlyA + both, onlyB + both];
        const picture: Visual = { kind: 'venn', left: g.left, right: g.right, onlyLeft: onlyA, both, onlyRight: onlyB };

        if (rng() < 0.5) {
          return {
            prompt: `Among some ${g.who}, ${a} ${g.a}, ${b} ${g.b}, and ${both} do both. How many do at least one of the two?`,
            answer: { kind: 'number', value: onlyA + both + onlyB },
            hints: [
              `${a} + ${b} counts some of them twice. Which ones?`,
              `Subtract the ${both} who do both, so they are only counted once.`,
            ],
            solution: [
              { text: `Adding ${a} + ${b} = ${a + b} counts the ${both} who do both twice. Fill in the overlap first, then the rest of each circle.`, visual: picture },
              { text: `${onlyA} + ${both} + ${onlyB} = ${onlyA + both + onlyB}. The shortcut gives the same: ${a} + ${b} − ${both} = ${onlyA + both + onlyB}.` },
            ],
          };
        }
        return {
          prompt: `Among some ${g.who}, ${a} ${g.a}, ${b} ${g.b}, and ${both} do both. How many ${g.a} but ${g.notB}?`,
          answer: { kind: 'number', value: onlyA },
          hints: [
            `The ${a} who ${g.a} include the ${both} who do both.`,
            `Take the ${both} in the overlap away from the ${a}.`,
          ],
          solution: [
            { text: `The ${a} who ${g.a} are the whole left circle, and that includes the ${both} in the overlap.`, visual: picture },
            { text: `So ${a} − ${both} = ${onlyA} are in the left circle only.` },
          ],
        };
      },
    },
    {
      id: 'venn/neither-or-both',
      idea: 'Find who is in neither, or in both',
      buildsOn: 'venn/either',
      generate: rng => {
        const g = pick(rng, GROUPS);
        const both = int(rng, 3, 12);
        const onlyA = int(rng, 4, 15);
        const onlyB = int(rng, 4, 15);
        const [a, b] = [onlyA + both, onlyB + both];
        const either = onlyA + both + onlyB;

        if (rng() < 0.5) {
          const neither = int(rng, 2, 9);
          const total = either + neither;
          return {
            prompt: `There are ${total} ${g.who}. Of them, ${a} ${g.a}, ${b} ${g.b}, and ${both} do both. How many do neither?`,
            answer: { kind: 'number', value: neither },
            hints: [
              'First find how many do at least one of the two. Everyone else does neither.',
              `At least one: ${a} + ${b} − ${both}.`,
            ],
            solution: [
              {
                text: `Count the people inside the circles: ${a} + ${b} − ${both} = ${either}. The ${both} who do both are subtracted so they are counted once.`,
                visual: { kind: 'venn', left: g.left, right: g.right, onlyLeft: onlyA, both, onlyRight: onlyB, outside: neither },
              },
              { text: `Everyone else is outside both circles: ${total} − ${either} = ${neither}.` },
            ],
          };
        }

        // Half the time some are in neither, so the total has to be adjusted first.
        const neither = rng() < 0.5 ? 0 : int(rng, 2, 9);
        const total = either + neither;
        return {
          prompt:
            neither === 0
              ? `Each of ${total} ${g.who} does at least one of two things: ${a} ${g.a} and ${b} ${g.b}. How many do both?`
              : `There are ${total} ${g.who}. Of them, ${a} ${g.a}, ${b} ${g.b}, and ${neither} do neither. How many do both?`,
          answer: { kind: 'number', value: both },
          hints: [
            neither === 0
              ? `${a} + ${b} is more than ${total}. Why?`
              : `Only ${total} − ${neither} = ${either} of them do at least one. Compare that with ${a} + ${b}.`,
            'The extra is exactly the people who were counted twice.',
          ],
          solution: [
            ...(neither === 0 ? [] : [{ text: `Set aside the ${neither} who do neither. That leaves ${total} − ${neither} = ${either} inside the circles.` }]),
            {
              text: `Adding the two groups gives ${a} + ${b} = ${a + b}, but there are only ${either} people inside the circles. The extra ${a + b} − ${either} = ${both} are the people counted twice.`,
              visual: { kind: 'venn', left: g.left, right: g.right, onlyLeft: onlyA, both, onlyRight: onlyB, ...(neither ? { outside: neither } : {}) },
            },
            { text: `So ${both} do both.` },
          ],
        };
      },
    },
    {
      id: 'venn/multiples',
      idea: 'Overlapping lists of multiples',
      buildsOn: 'venn/neither-or-both',
      generate: rng => {
        const [a, b] = pick(rng, [[2, 3], [2, 5], [3, 5], [3, 4], [2, 7], [3, 7], [4, 5], [4, 6], [6, 9], [6, 8], [4, 10]] as const);
        const n = pick(rng, [60, 80, 100, 120, 150, 200, 250, 300]);
        const m = lcm(a, b);
        const [ca, cb, cm] = [Math.floor(n / a), Math.floor(n / b), Math.floor(n / m)];
        const either = ca + cb - cm;
        const wantNeither = rng() < 0.4;
        const picture: Visual = {
          kind: 'venn',
          left: `Multiples of ${a}`,
          right: `Multiples of ${b}`,
          onlyLeft: ca - cm,
          both: cm,
          onlyRight: cb - cm,
          outside: n - either,
        };
        const count = (k: number, c: number) =>
          c <= 3
            ? `${Array.from({ length: c }, (_, i) => k * (i + 1)).join(', ')} is ${c} number${c === 1 ? '' : 's'}`
            : `${k}, ${2 * k}, …, ${k * c} is ${c} numbers`;
        return {
          prompt: wantNeither
            ? `How many of the whole numbers from 1 to ${n} are multiples of neither ${a} nor ${b}?`
            : `How many of the whole numbers from 1 to ${n} are multiples of ${a} or ${b} (or both)?`,
          answer: { kind: 'number', value: wantNeither ? n - either : either },
          hints: [
            `Count the multiples of ${a}, the multiples of ${b}, and the numbers that are both.`,
            m === a * b
              ? `A number is a multiple of both ${a} and ${b} exactly when it is a multiple of ${m}.`
              : `Careful: the numbers that are multiples of both are the multiples of ${m}, not of ${a * b}.`,
          ],
          solution: [
            { text: `Multiples of ${a}: ${count(a, ca)}. Multiples of ${b}: ${count(b, cb)}.` },
            {
              text:
                m === a * b
                  ? `The overlap is the multiples of both, which are the multiples of ${m}: ${count(m, cm)}.`
                  : `The overlap is the multiples of both. The smallest number that is a multiple of ${a} and of ${b} is ${m} (not ${a * b}), so the overlap is the multiples of ${m}: ${count(m, cm)}.`,
              visual: picture,
            },
            { text: `Multiples of ${a} or ${b}: ${ca} + ${cb} − ${cm} = ${either}.${wantNeither ? ` Everything else is neither: ${n} − ${either} = ${n - either}.` : ''}` },
          ],
        };
      },
    },
  ],
};

export const COUNTING_LESSONS: Lesson[] = [countingLists, venn, multPrinciple];
