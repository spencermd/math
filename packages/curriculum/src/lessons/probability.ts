// Realm IV: Probability — measuring chance by counting what can happen.
import type { Lesson, Visual } from './types.ts';
import { frac, int, pick, reduce } from './util.ts';

const LOWEST = 'Give your answer as a fraction in lowest terms.';

type Slot = { label: string; count: number; why: string };
const slots = (s: Slot[]): Visual => ({ kind: 'slots', slots: s });
const product = (s: Slot[]) => s.reduce((n, slot) => n * slot.count, 1);
const times = (s: Slot[]) => s.map(slot => slot.count).join(' × ');

/** "6/36 = 1/6", or just "5/36" when nothing cancels. */
function simplified(fav: number, total: number): string {
  const [n, d] = reduce(fav, total);
  return d === total ? frac(n, d) : `${fav}/${total} = ${frac(n, d)}`;
}

/** Whole numbers with digit rules: slots for the numbers that qualify. Totals are 90 and 900. */
const DIGIT_EVENTS: { digits: 2 | 3; event: string; fav: Slot[] }[] = [
  {
    digits: 2,
    event: 'its two digits are different',
    fav: [
      { label: 'Tens', count: 9, why: '1 to 9' },
      { label: 'Units', count: 9, why: 'any of the 10 digits except the tens digit' },
    ],
  },
  {
    digits: 3,
    event: 'its three digits are all different',
    fav: [
      { label: 'Hundreds', count: 9, why: '1 to 9' },
      { label: 'Tens', count: 9, why: 'any digit except the hundreds digit' },
      { label: 'Units', count: 8, why: 'any digit except the two already used' },
    ],
  },
  {
    digits: 2,
    event: 'both of its digits are even',
    fav: [
      { label: 'Tens', count: 4, why: '2, 4, 6 or 8 (not 0)' },
      { label: 'Units', count: 5, why: '0, 2, 4, 6 or 8' },
    ],
  },
  {
    digits: 3,
    event: 'all three of its digits are even',
    fav: [
      { label: 'Hundreds', count: 4, why: '2, 4, 6 or 8 (not 0)' },
      { label: 'Tens', count: 5, why: '0, 2, 4, 6 or 8' },
      { label: 'Units', count: 5, why: '0, 2, 4, 6 or 8' },
    ],
  },
  {
    digits: 2,
    event: 'both of its digits are odd',
    fav: [
      { label: 'Tens', count: 5, why: '1, 3, 5, 7 or 9' },
      { label: 'Units', count: 5, why: '1, 3, 5, 7 or 9' },
    ],
  },
  {
    digits: 3,
    event: 'all three of its digits are odd',
    fav: [
      { label: 'Hundreds', count: 5, why: '1, 3, 5, 7 or 9' },
      { label: 'Tens', count: 5, why: '1, 3, 5, 7 or 9' },
      { label: 'Units', count: 5, why: '1, 3, 5, 7 or 9' },
    ],
  },
  {
    digits: 3,
    event: 'none of its digits is 0',
    fav: [
      { label: 'Hundreds', count: 9, why: '1 to 9' },
      { label: 'Tens', count: 9, why: '1 to 9' },
      { label: 'Units', count: 9, why: '1 to 9' },
    ],
  },
];

const ORDINAL = ['1st', '2nd', '3rd', '4th'];

const probBasics: Lesson = {
  topic: 'prob_basics',
  intro: [
    {
      text: 'Probability is counting, twice. Count the outcomes you want, count all the outcomes that could happen, and divide. Roll a die: 6 things can happen, and 3 of them (2, 3 and 5) are prime, so the probability of rolling a prime is 3/6 = 1/2. A probability is always between 0 (impossible) and 1 (certain).',
    },
    {
      text: 'The catch is that the outcomes you count must be equally likely. Roll two dice and add them. The sums run from 2 to 12, but those 11 sums are not equally likely, so the chance of a 7 is not 1/11. The equally likely outcomes are the 6 × 6 = 36 ordered pairs, and six of them add up to 7.',
      visual: {
        kind: 'rows',
        rows: [
          { label: 'All outcomes', text: '6 × 6 = 36 pairs' },
          { label: 'Sum of 7', text: '(1,6) (2,5) (3,4) (4,3) (5,2) (6,1)' },
          { label: 'Probability', text: '6/36 = 1/6' },
        ],
      },
    },
    {
      text: 'Notice (3,4) and (4,3) are different outcomes: imagine one red die and one blue die. The same goes for coins. Flip three coins and there are 2 × 2 × 2 = 8 equally likely outcomes. Exactly three of them, HHT, HTH and THH, have two heads, so that probability is 3/8.',
      visual: slots([
        { label: '1st coin', count: 2, why: 'heads or tails' },
        { label: '2nd coin', count: 2, why: 'heads or tails' },
        { label: '3rd coin', count: 2, why: 'heads or tails' },
      ]),
    },
    {
      text: 'So the multiplication principle does the heavy lifting: use it for the total, and often for the outcomes you want as well. A 2-digit number is picked at random. What is the chance its digits are different? There are 9 × 10 = 90 two-digit numbers, and 9 × 9 = 81 of them have different digits, so the probability is 81/90 = 9/10.',
    },
  ],
  rungs: [
    {
      id: 'prob_basics/single',
      idea: 'Wanted outcomes over all outcomes',
      buildsOn: 'counting_lists/multiples',
      generate: rng => {
        if (rng() < 0.5) {
          const [r, b, g] = [int(rng, 2, 9), int(rng, 2, 9), int(rng, 2, 9)];
          const total = r + b + g;
          const ev = pick(rng, [
            { event: 'is red', fav: r, how: `${r} of them are red` },
            { event: 'is not blue', fav: r + g, how: `${r} + ${g} = ${r + g} of them are not blue` },
            { event: 'is red or green', fav: r + g, how: `${r} + ${g} = ${r + g} of them are red or green` },
            { event: 'is not green', fav: r + b, how: `${r} + ${b} = ${r + b} of them are not green` },
          ]);
          const [num, den] = reduce(ev.fav, total);
          return {
            prompt: `A bag holds ${r} red, ${b} blue and ${g} green marbles. One marble is drawn at random. What is the probability that it ${ev.event}? ${LOWEST}`,
            answer: { kind: 'fraction', num, den },
            hints: ['How many marbles are in the bag altogether?', `There are ${total} marbles, and ${ev.how}.`],
            solution: [
              { text: `Every marble is equally likely to be drawn, and there are ${r} + ${b} + ${g} = ${total} of them.` },
              { text: `Of those, ${ev.how}.` },
              { text: `Probability = ${simplified(ev.fav, total)}.` },
            ],
          };
        }
        const k = pick(rng, [3, 4, 6, 7, 8, 9]);
        let top: number;
        do top = int(rng, 20, 100);
        while (top % k === 0 && rng() < 0.7);
        const count = Math.floor(top / k);
        const [num, den] = reduce(count, top);
        return {
          prompt: `A whole number from 1 to ${top} is chosen at random. What is the probability that it is a multiple of ${k}? ${LOWEST}`,
          answer: { kind: 'fraction', num, den },
          hints: [
            `How many multiples of ${k} are there from 1 to ${top}?`,
            `The multiples are ${k}, ${2 * k}, ${3 * k}, …, ${count * k}. That is ${k} × 1 up to ${k} × ${count}.`,
          ],
          solution: [
            { text: `There are ${top} equally likely numbers.` },
            { text: `The multiples of ${k} are ${k} × 1, ${k} × 2, …, ${k} × ${count} = ${count * k}. The next one, ${(count + 1) * k}, is too big, so there are ${count}.` },
            { text: `Probability = ${simplified(count, top)}.` },
          ],
        };
      },
    },
    {
      id: 'prob_basics/two-dice',
      idea: 'Two dice make 36 outcomes',
      buildsOn: 'prob_basics/single',
      generate: rng => {
        const variant = int(rng, 0, 3);
        if (variant === 3) {
          const odd = rng() < 0.5;
          const fav = odd ? 9 : 27;
          const [num, den] = reduce(fav, 36);
          return {
            prompt: `Two fair dice are rolled. What is the probability that the product of the two numbers is ${odd ? 'odd' : 'even'}? ${LOWEST}`,
            answer: { kind: 'fraction', num, den },
            hints: [
              'There are 6 × 6 = 36 equally likely rolls. When is a product odd?',
              'A product is odd only when both numbers are odd. Each die has 3 odd faces.',
            ],
            solution: [
              { text: 'There are 6 × 6 = 36 equally likely rolls.' },
              { text: 'A product is odd only when both numbers are odd. Each die has 3 odd faces, so 3 × 3 = 9 rolls give an odd product.' },
              { text: odd ? 'Probability = 9/36 = 1/4.' : 'The other 36 − 9 = 27 rolls give an even product. Probability = 27/36 = 3/4.' },
            ],
          };
        }
        const [phrase, wanted] =
          variant === 0
            ? (() => {
                const s = int(rng, 4, 10);
                return [`is ${s}`, [s]] as const;
              })()
            : variant === 1
              ? (() => {
                  const s = int(rng, 9, 11);
                  return [`is at least ${s}`, Array.from({ length: 13 - s }, (_, i) => s + i)] as const;
                })()
              : (() => {
                  const s = int(rng, 3, 5);
                  return [`is at most ${s}`, Array.from({ length: s - 1 }, (_, i) => 2 + i)] as const;
                })();
        const pairsFor = (s: number) => {
          const out: string[] = [];
          for (let a = 1; a <= 6; a++) if (s - a >= 1 && s - a <= 6) out.push(`(${a},${s - a})`);
          return out;
        };
        const fav = wanted.reduce((n, s) => n + pairsFor(s).length, 0);
        const [num, den] = reduce(fav, 36);
        return {
          prompt: `Two fair dice are rolled. What is the probability that the sum of the two numbers ${phrase}? ${LOWEST}`,
          answer: { kind: 'fraction', num, den },
          hints: [
            'The sums are not equally likely, but the 6 × 6 = 36 ordered rolls are. Count rolls, not sums.',
            wanted.length === 1
              ? `List the rolls in order of the first die: ${pairsFor(wanted[0])[0]}, ${pairsFor(wanted[0])[1]}, …`
              : `Take one sum at a time: ${wanted.join(', ')}. How many rolls give each?`,
          ],
          solution: [
            { text: 'Think of the dice as red and blue. There are 6 × 6 = 36 equally likely rolls, written (red, blue).' },
            {
              text: wanted.length === 1 ? `List the rolls with a sum of ${wanted[0]}, going up through the red die.` : 'Take one sum at a time and list its rolls.',
              visual: {
                kind: 'rows',
                rows: [
                  ...wanted.map(s => ({ label: `Sum ${s}`, text: pairsFor(s).join(' ') })),
                  ...(wanted.length > 1 ? [{ label: 'In all', text: `${wanted.map(s => pairsFor(s).length).join(' + ')} = ${fav} rolls` }] : []),
                ],
              },
            },
            { text: `That is ${fav} roll${fav === 1 ? '' : 's'} out of 36. Probability = ${simplified(fav, 36)}.` },
          ],
        };
      },
    },
    {
      id: 'prob_basics/coins',
      idea: 'List the outcomes you want',
      buildsOn: 'prob_basics/two-dice',
      generate: rng => {
        const n = pick(rng, [3, 4, 4]);
        const exact = rng() < 0.6;
        const k = exact ? int(rng, 1, n - 1) : int(rng, 2, n - 1);
        const face = pick(rng, ['heads', 'tails'] as const);
        const letter = face === 'heads' ? 'H' : 'T';
        const all = Array.from({ length: 2 ** n }, (_, i) => [...i.toString(2).padStart(n, '0')].map(c => (c === '0' ? 'H' : 'T')).join(''));
        const hits = (o: string) => [...o].filter(c => c === letter).length;
        const total = 2 ** n;
        const groups = (exact ? [k] : Array.from({ length: n - k + 1 }, (_, i) => k + i)).map(c => ({ c, list: all.filter(o => hits(o) === c) }));
        const fav = groups.reduce((s, g) => s + g.list.length, 0);
        const [num, den] = reduce(fav, total);
        const word = ['zero', 'one', 'two', 'three', 'four'];
        return {
          prompt: `${n === 3 ? 'Three' : 'Four'} fair coins are flipped. What is the probability of getting ${exact ? 'exactly' : 'at least'} ${word[k]} ${k === 1 ? face.slice(0, -1) : face}? ${LOWEST}`,
          answer: { kind: 'fraction', num, den },
          hints: [
            `Each coin has 2 outcomes, so there are ${Array(n).fill(2).join(' × ')} = ${total} equally likely results, like ${all[1]} or ${all[all.length - 2]}.`,
            exact
              ? `List the results with exactly ${word[k]} ${letter}${k === 1 ? '' : 's'}. Work in an organized order so that none are missed.`
              : `"At least ${word[k]}" means ${groups.map(g => g.c).join(' or ')}. Count each case.`,
          ],
          solution: [
            { text: `Each coin lands heads (H) or tails (T), so there are ${Array(n).fill(2).join(' × ')} = ${total} equally likely results.` },
            {
              text: exact ? `List the ones with exactly ${word[k]} ${letter}${k === 1 ? '' : 's'}.` : `"At least ${word[k]}" means ${groups.map(g => g.c).join(' or ')}. List each case.`,
              visual: {
                kind: 'rows',
                rows: groups.map(g => ({ label: `${g.c} ${g.c === 1 ? face.slice(0, -1) : face}`, text: g.list.join(' ') })),
              },
            },
            { text: `That is ${groups.length > 1 ? `${groups.map(g => g.list.length).join(' + ')} = ` : ''}${fav} of the ${total} results. Probability = ${simplified(fav, total)}.` },
          ],
        };
      },
    },
    {
      id: 'prob_basics/slots',
      idea: 'Count both with the multiplication principle',
      buildsOn: 'prob_basics/coins',
      generate: rng => {
        const variant = int(rng, 0, 2);
        let prompt: string, fav: Slot[], all: Slot[], thing: string, hint: string;
        if (variant === 0) {
          const e = pick(rng, DIGIT_EVENTS);
          const [lo, hi] = e.digits === 2 ? [10, 99] : [100, 999];
          prompt = `A whole number from ${lo} to ${hi} is chosen at random. What is the probability that ${e.event}?`;
          fav = e.fav;
          all = [
            ...(e.digits === 3 ? [{ label: 'Hundreds', count: 9, why: '1 to 9' }] : []),
            { label: 'Tens', count: e.digits === 2 ? 9 : 10, why: e.digits === 2 ? '1 to 9' : 'any digit' },
            { label: 'Units', count: 10, why: 'any digit' },
          ];
          thing = `${e.digits}-digit numbers`;
          hint = `Build a number that qualifies one digit at a time. Remember the first digit cannot be 0.`;
        } else if (variant === 1) {
          const n = int(rng, 2, 4);
          prompt = `A ${n}-digit PIN is made by choosing each digit at random from 0 to 9. What is the probability that no digit appears twice?`;
          fav = Array.from({ length: n }, (_, i) => ({ label: `${ORDINAL[i]} digit`, count: 10 - i, why: i === 0 ? 'any of the 10 digits' : `any digit except the ${i} already used` }));
          all = Array.from({ length: n }, (_, i) => ({ label: `${ORDINAL[i]} digit`, count: 10, why: 'any of the 10 digits' }));
          thing = 'PINs';
          hint = 'For a PIN with no repeats, each digit you choose leaves one fewer for the next slot.';
        } else {
          const s = int(rng, 4, 8);
          const n = pick(rng, [2, 3]);
          const letters = 'ABCDEFGH'.slice(0, s).split('').join(', ');
          prompt = `A ${n}-letter code is made by choosing each letter at random from ${letters}. What is the probability that the letters are all different?`;
          fav = Array.from({ length: n }, (_, i) => ({ label: `${ORDINAL[i]} letter`, count: s - i, why: i === 0 ? `any of the ${s} letters` : `any letter except the ${i} already used` }));
          all = Array.from({ length: n }, (_, i) => ({ label: `${ORDINAL[i]} letter`, count: s, why: `any of the ${s} letters` }));
          thing = 'codes';
          hint = 'For a code with no repeats, each letter you choose leaves one fewer for the next slot.';
        }
        const [f, t] = [product(fav), product(all)];
        const [num, den] = reduce(f, t);
        return {
          prompt: `${prompt} ${LOWEST}`,
          answer: { kind: 'fraction', num, den },
          hints: [`Count two things with slots: all the ${thing}, and the ones that qualify.`, hint],
          solution: [
            { text: `First count all the ${thing}: ${times(all)} = ${t}.`, visual: slots(all) },
            { text: `Now count the ones that qualify: ${times(fav)} = ${f}.`, visual: slots(fav) },
            { text: `Probability = ${simplified(f, t)}.` },
          ],
        };
      },
    },
  ],
};

// ── Compound events ──────────────────────────────────────────────────────────

type Row = { label?: string; text: string };
const working = (rows: Row[]): Visual => ({ kind: 'rows', rows });
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

/** Things a single die roll can do, with how many of the 6 faces do it. */
const DIE_EVENTS = [
  { event: 'a 6', faces: 1, which: 'only the 6' },
  { event: 'a number greater than 4', faces: 2, which: '5 and 6' },
  { event: 'a multiple of 3', faces: 2, which: '3 and 6' },
  { event: 'an even number', faces: 3, which: '2, 4 and 6' },
  { event: 'a prime number', faces: 3, which: '2, 3 and 5' },
  { event: 'a number less than 5', faces: 4, which: '1, 2, 3 and 4' },
  { event: 'a number greater than 1', faces: 5, which: 'everything but 1' },
];

/** "3/5 × 2/4 = 6/20 = 3/10": multiply raw fractions, then reduce. */
function multiplied(fracs: [number, number][]): string {
  const [n, d] = [fracs.reduce((a, f) => a * f[0], 1), fracs.reduce((a, f) => a * f[1], 1)];
  const [rn, rd] = reduce(n, d);
  return `${fracs.map(f => `${f[0]}/${f[1]}`).join(' × ')} = ${n}/${d}${rd === d ? '' : ` = ${frac(rn, rd)}`}`;
}

const BAGS = [
  { thing: 'marbles', holder: 'A bag holds', x: 'red', y: 'blue', z: 'green' },
  { thing: 'socks', holder: 'A drawer holds', x: 'black', y: 'white', z: 'gray' },
  { thing: 'jelly beans', holder: 'A jar holds', x: 'cherry', y: 'lemon', z: 'lime' },
];

const probCompound: Lesson = {
  topic: 'prob_compound',
  intro: [
    {
      text: 'Flip a coin and roll a die. What is the chance of heads and a 6? There are 2 × 6 = 12 equally likely outcomes and only one of them is (heads, 6), so 1/12. Notice that 1/12 is 1/2 × 1/6. When two events do not affect each other, the probability that both happen is the product of their probabilities. "And" means multiply.',
      visual: working([
        { label: 'Heads', text: '1/2' },
        { label: 'A 6', text: '1/6' },
        { label: 'Both', text: '1/2 × 1/6 = 1/12' },
      ]),
    },
    {
      text: 'Multiplying still works when the first event changes the odds for the second. You just use the updated odds. A bag holds 3 red and 2 blue marbles, and you draw two without putting the first one back. For both to be red, the first must be red (3 of 5), and then the second must be red too, from a bag that now holds 2 red among 4.',
      visual: working([
        { label: '1st is red', text: '3/5' },
        { label: 'Then 2nd is red', text: '2/4' },
        { label: 'Both red', text: '3/5 × 2/4 = 6/20 = 3/10' },
      ]),
    },
    {
      text: 'Always check whether the first thing goes back. With replacement the second draw faces the same bag and the chance of two reds is 3/5 × 3/5 = 9/25. Without replacement it is 3/10. Those two little words change the answer.',
    },
    {
      text: '"Or" means add, as long as the two ways cannot both happen. What is the chance the two marbles are the same color? That is both red or both blue, and those cannot happen together, so add them.',
      visual: working([
        { label: 'Both red', text: '3/5 × 2/4 = 6/20' },
        { label: 'Both blue', text: '2/5 × 1/4 = 2/20' },
        { label: 'Same color', text: '6/20 + 2/20 = 8/20 = 2/5' },
      ]),
    },
    {
      text: 'One trap remains. What is the chance of getting one marble of each color? Red-then-blue is 3/5 × 2/4 = 6/20, but that is only half the story: blue-then-red is another 2/5 × 3/4 = 6/20. Together 12/20 = 3/5. Whenever the question does not fix the order, count every order. (Check: same color 2/5, different colors 3/5, and they add up to 1.)',
    },
  ],
  rungs: [
    {
      id: 'prob_compound/independent',
      idea: '"And" means multiply',
      buildsOn: 'prob_basics/slots',
      generate: rng => {
        const variant = int(rng, 0, 2);
        if (variant === 0) {
          const e = pick(rng, DIE_EVENTS);
          const side = pick(rng, ['heads', 'tails']);
          const [num, den] = reduce(e.faces, 12);
          return {
            prompt: `A fair coin is flipped and a fair die is rolled. What is the probability of getting ${side} on the coin and ${e.event} on the die? ${LOWEST}`,
            answer: { kind: 'fraction', num, den },
            hints: [
              'The coin and the die do not affect each other. Find each probability on its own.',
              `The coin: 1/2. The die: ${e.faces} of the 6 faces work (${e.which}). Multiply.`,
            ],
            solution: [
              { text: `The coin shows ${side} with probability 1/2. The die shows ${e.event} with probability ${e.faces}/6 (${e.which}).` },
              { text: `Neither affects the other, so multiply: ${multiplied([[1, 2], [e.faces, 6]])}.` },
            ],
          };
        }
        if (variant === 1) {
          const e1 = pick(rng, DIE_EVENTS);
          let e2;
          do e2 = pick(rng, DIE_EVENTS);
          while (e2 === e1);
          const [num, den] = reduce(e1.faces * e2.faces, 36);
          return {
            prompt: `A red die and a blue die are rolled. What is the probability that the red die shows ${e1.event} and the blue die shows ${e2.event}? ${LOWEST}`,
            answer: { kind: 'fraction', num, den },
            hints: [
              'The two dice do not affect each other. Find each probability on its own.',
              `Red: ${e1.faces} of 6 faces work. Blue: ${e2.faces} of 6 faces work. Multiply.`,
            ],
            solution: [
              { text: `Red die: ${e1.faces} of the 6 faces work (${e1.which}), so ${e1.faces}/6. Blue die: ${e2.faces} of the 6 faces work (${e2.which}), so ${e2.faces}/6.` },
              { text: `The dice do not affect each other, so multiply: ${multiplied([[e1.faces, 6], [e2.faces, 6]])}.` },
              { text: `As a count: ${e1.faces} × ${e2.faces} = ${e1.faces * e2.faces} of the 36 equally likely rolls work.` },
            ],
          };
        }
        const bag = pick(rng, BAGS);
        let x: number, y: number;
        do [x, y] = [int(rng, 2, 7), int(rng, 2, 7)];
        while (x === y);
        const t = x + y;
        const mixed = rng() < 0.5;
        const second = mixed ? y : x;
        const [num, den] = reduce(x * second, t * t);
        return {
          prompt: `${bag.holder} ${x} ${bag.x} and ${y} ${bag.y} ${bag.thing}. One is drawn at random, its color is noted, and it is put back. Then a second one is drawn. What is the probability that ${mixed ? `the first is ${bag.x} and the second is ${bag.y}` : `both are ${bag.x}`}? ${LOWEST}`,
          answer: { kind: 'fraction', num, den },
          hints: [
            'The first one is put back, so the second draw faces exactly the same collection.',
            `First draw ${bag.x}: ${x}/${t}. Second draw ${mixed ? bag.y : bag.x}: ${second}/${t}. Multiply.`,
          ],
          solution: [
            { text: `There are ${t} ${bag.thing}. Because the first one goes back, nothing changes between the draws.` },
            {
              text: 'Find each probability and multiply.',
              visual: working([
                { label: `1st is ${bag.x}`, text: `${x}/${t}` },
                { label: `2nd is ${mixed ? bag.y : bag.x}`, text: `${second}/${t}` },
                { label: 'Both', text: multiplied([[x, t], [second, t]]) },
              ]),
            },
          ],
        };
      },
    },
    {
      id: 'prob_compound/without',
      idea: 'Update the odds after each draw',
      buildsOn: 'prob_compound/independent',
      generate: rng => {
        const bag = pick(rng, BAGS);
        const three = rng() < 0.3;
        let x: number, y: number;
        do [x, y] = [int(rng, three ? 3 : 2, 7), int(rng, 2, 7)];
        while (x === y);
        const t = x + y;
        const draws = three ? 3 : 2;
        const fracs: [number, number][] = Array.from({ length: draws }, (_, i) => [x - i, t - i]);
        const [num, den] = reduce(fracs.reduce((a, f) => a * f[0], 1), fracs.reduce((a, f) => a * f[1], 1));
        const nth = ['1st', '2nd', '3rd'];
        return {
          prompt: `${bag.holder} ${x} ${bag.x} and ${y} ${bag.y} ${bag.thing}. ${three ? 'Three' : 'Two'} are drawn at random, one after another, without replacement. What is the probability that ${three ? 'all three' : 'both'} are ${bag.x}? ${LOWEST}`,
          answer: { kind: 'fraction', num, den },
          hints: [
            `The first draw is ${bag.x} with probability ${x}/${t}. If it is, what is left for the second draw?`,
            `After one ${bag.x} is gone there are ${x - 1} ${bag.x} among ${t - 1} ${bag.thing}.`,
          ],
          solution: [
            { text: `Nothing is put back, so each draw changes what is left. Take the draws in order, each time assuming the earlier ones came out ${bag.x}.` },
            {
              text: `Each ${bag.x} one drawn leaves one fewer ${bag.x} and one fewer in total.`,
              visual: working([
                ...fracs.map((f, i) => ({ label: `${nth[i]} is ${bag.x}`, text: `${f[0]}/${f[1]}` })),
                { label: three ? 'All three' : 'Both', text: multiplied(fracs) },
              ]),
            },
          ],
        };
      },
    },
    {
      id: 'prob_compound/same',
      idea: '"Or" means add the separate ways',
      buildsOn: 'prob_compound/without',
      generate: rng => {
        const bag = pick(rng, BAGS);
        const useThree = rng() < 0.4;
        const [x, y, z] = [int(rng, 2, 6), int(rng, 2, 6), useThree ? int(rng, 2, 5) : 0];
        const t = x + y + z;
        const colors = [
          { name: bag.x, n: x },
          { name: bag.y, n: y },
          ...(useThree ? [{ name: bag.z, n: z }] : []),
        ];
        const d = t * (t - 1);
        const tops = colors.map(c => c.n * (c.n - 1));
        const top = tops.reduce((a, b) => a + b, 0);
        const [num, den] = reduce(top, d);
        const listed = useThree ? `${x} ${bag.x}, ${y} ${bag.y} and ${z} ${bag.z}` : `${x} ${bag.x} and ${y} ${bag.y}`;
        return {
          prompt: `${bag.holder} ${listed} ${bag.thing}. Two are drawn at random without replacement. What is the probability that they are the same color? ${LOWEST}`,
          answer: { kind: 'fraction', num, den },
          hints: [
            `"The same color" can happen in ${colors.length} separate ways: ${colors.map(c => `both ${c.name}`).join(', or ')}. Find each.`,
            `Both ${bag.x}: ${x}/${t} × ${x - 1}/${t - 1}. Do the same for ${useThree ? 'the other colors' : bag.y}, and add. Leave the fractions over ${d} until the end.`,
          ],
          solution: [
            { text: `The two can match in ${colors.length} ways that cannot happen together: ${colors.map(c => `both ${c.name}`).join(', or ')}. Find each probability, then add.` },
            {
              text: `Do not simplify yet. Keeping every fraction over ${t} × ${t - 1} = ${d} makes the adding easy.`,
              visual: working([
                ...colors.map((c, i) => ({ label: `Both ${c.name}`, text: `${c.n}/${t} × ${c.n - 1}/${t - 1} = ${tops[i]}/${d}` })),
                { label: 'Same color', text: `${tops.map(v => `${v}/${d}`).join(' + ')} = ${top}/${d}${den === d ? '' : ` = ${frac(num, den)}`}` },
              ]),
            },
          ],
        };
      },
    },
    {
      id: 'prob_compound/orders',
      idea: 'Count every order',
      buildsOn: 'prob_compound/same',
      generate: rng => {
        const bag = pick(rng, BAGS);
        let x: number, y: number;
        do [x, y] = [int(rng, 2, 7), int(rng, 2, 7)];
        while (x === y);
        const t = x + y;
        const d = t * (t - 1);
        if (rng() < 0.3) {
          const [num, den] = reduce(x * y, d);
          return {
            prompt: `${bag.holder} ${x} ${bag.x} and ${y} ${bag.y} ${bag.thing}. Two are drawn at random, one after another, without replacement. What is the probability that the first is ${bag.x} and the second is ${bag.y}? ${LOWEST}`,
            answer: { kind: 'fraction', num, den },
            hints: [
              'Here the order is fixed by the question, so there is only one way for it to happen.',
              `First ${bag.x}: ${x}/${t}. Then ${bag.y}, with all ${y} ${bag.y} still there among ${t - 1}: ${y}/${t - 1}.`,
            ],
            solution: [
              { text: `The question fixes the order: ${bag.x} first, then ${bag.y}. So there is just one path to follow.` },
              {
                text: `After a ${bag.x} one is drawn, all ${y} ${bag.y} ones are still there, among ${t - 1} ${bag.thing}.`,
                visual: working([
                  { label: `1st is ${bag.x}`, text: `${x}/${t}` },
                  { label: `Then ${bag.y}`, text: `${y}/${t - 1}` },
                  { label: 'Both', text: multiplied([[x, t], [y, t - 1]]) },
                ]),
              },
            ],
          };
        }
        const [num, den] = reduce(2 * x * y, d);
        const same = x * (x - 1) + y * (y - 1);
        return {
          prompt: `${bag.holder} ${x} ${bag.x} and ${y} ${bag.y} ${bag.thing}. Two are drawn at random without replacement. What is the probability that one is ${bag.x} and the other is ${bag.y}? ${LOWEST}`,
          answer: { kind: 'fraction', num, den },
          hints: [
            `The question does not say which color comes first. In how many orders can "one of each" happen?`,
            `${cap(bag.x)} then ${bag.y}: ${x}/${t} × ${y}/${t - 1}. Now add ${bag.y} then ${bag.x}.`,
          ],
          solution: [
            { text: `"One of each" can happen in two orders, ${bag.x} then ${bag.y} or ${bag.y} then ${bag.x}. They cannot both happen, so find each and add.` },
            {
              text: 'The two orders turn out to be equally likely. That is no accident: the same numbers get multiplied either way.',
              visual: working([
                { label: `${cap(bag.x)}, ${bag.y}`, text: `${x}/${t} × ${y}/${t - 1} = ${x * y}/${d}` },
                { label: `${cap(bag.y)}, ${bag.x}`, text: `${y}/${t} × ${x}/${t - 1} = ${x * y}/${d}` },
                { label: 'One of each', text: `${x * y}/${d} + ${x * y}/${d} = ${2 * x * y}/${d}${den === d ? '' : ` = ${frac(num, den)}`}` },
              ]),
            },
            { text: `Check with the opposite: the chance of two of the same color is (${x} × ${x - 1} + ${y} × ${y - 1})/${d} = ${same}/${d}, and ${same}/${d} + ${2 * x * y}/${d} = 1.` },
          ],
        };
      },
    },
  ],
};

export const PROBABILITY_LESSONS: Lesson[] = [probBasics, probCompound];
