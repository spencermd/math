// Realm III: Counting — combinations and complementary counting.
import type { Lesson, Step, Visual } from './types.ts';
import { fmt, int, lcm, pick } from './util.ts';

type Row = { label?: string; text: string };
const working = (rows: Row[]): Visual => ({ kind: 'rows', rows });

type Slot = { label: string; count: number; why: string };
const slots = (s: Slot[]): Visual => ({ kind: 'slots', slots: s });

const fact = (n: number): number => (n <= 1 ? 1 : n * fact(n - 1));
const choose = (n: number, k: number): number => {
  let out = 1;
  for (let i = 0; i < k; i++) out = (out * (n - i)) / (i + 1);
  return out;
};
/** falling(7, 3) → "7 × 6 × 5" */
const falling = (n: number, k: number) => Array.from({ length: k }, (_, i) => n - i).join(' × ');
const fallingValue = (n: number, k: number) => Array.from({ length: k }, (_, i) => n - i).reduce((a, b) => a * b, 1);
/** countdown(3) → "3 × 2 × 1" */
const countdown = (k: number) => Array.from({ length: k }, (_, i) => k - i).join(' × ');

/** Working for "n choose k": count ordered picks, then divide out the orders. */
function chooseRows(n: number, k: number, label = 'Answer'): Row[] {
  return [
    { label: 'In order', text: `${falling(n, k)} = ${fmt(fallingValue(n, k))}` },
    { label: 'Orders of each', text: `${k}! = ${countdown(k)} = ${fact(k)}` },
    { label, text: `${fmt(fallingValue(n, k))} ÷ ${fact(k)} = ${fmt(choose(n, k))}` },
  ];
}

// ── Combinations ─────────────────────────────────────────────────────────────

/** Unordered choices. `ask` takes (n, k). */
const CHOICES = [
  { ask: (n: number, k: number) => `A pizza shop offers ${n} toppings. How many different pizzas with exactly ${k} different toppings can be ordered?`, things: 'toppings', group: 'pizza' },
  { ask: (n: number, k: number) => `A club has ${n} members. In how many ways can it choose a committee of ${k} members?`, things: 'members', group: 'committee' },
  { ask: (n: number, k: number) => `Nadia owns ${n} different books and wants to take ${k} of them on a trip. In how many ways can she choose which books to take?`, things: 'books', group: 'set of books' },
  { ask: (n: number, k: number) => `A coach must pick ${k} of her ${n} players to start a game. How many different groups of starters are possible?`, things: 'players', group: 'group of starters' },
];

const combinations: Lesson = {
  topic: 'combinations',
  intro: [
    {
      text: 'A club of 5 picks a president, a vice president and a treasurer: 5 × 4 × 3 = 60 ways, because the jobs are different. Now suppose it picks a committee of 3 instead, with no jobs. Picking Ana, Ben, Cal is the same committee as picking Cal, Ana, Ben. Each committee shows up 3! = 6 times among the 60 line-ups, once for each order of its members.',
      visual: working([
        { label: 'In order', text: '5 × 4 × 3 = 60' },
        { label: 'Orders of each', text: '3! = 6' },
        { label: 'Committees', text: '60 ÷ 6 = 10' },
      ]),
    },
    {
      text: 'A choice where order does not matter is called a combination. The count is written "5 choose 3", or C(5, 3). To work one out, write as many factors counting down from the top number as you are choosing, and divide by the factorial of how many you chose. Cancel before you multiply.',
      visual: working([
        { text: 'C(8, 3)' },
        { label: 'Three factors', text: '= (8 × 7 × 6) ÷ (3 × 2 × 1)' },
        { label: 'Cancel the 6', text: '= 8 × 7' },
        { text: '= 56' },
      ]),
    },
    {
      text: 'You have met one of these already. A handshake is a choice of 2 people, and order does not matter, so the handshake count n(n − 1)/2 is just C(n, 2).',
    },
    {
      text: 'A shortcut worth its weight in gold: choosing who is on the team is the same as choosing who is left off. Picking 8 players from 10 looks like a lot of work, but it is the same as picking the 2 who sit out. C(10, 8) = C(10, 2) = 45. When you are choosing more than half, flip it.',
    },
    {
      text: 'Combinations plug into the multiplication principle like anything else. A committee needs 2 of the 5 seventh graders and 2 of the 4 eighth graders. Choose each pair separately, then multiply: C(5, 2) × C(4, 2) = 10 × 6 = 60. The question to ask yourself every time is "would swapping two of my picks give something new?" If yes, order matters and it is a permutation. If no, divide the orders out.',
    },
  ],
  rungs: [
    {
      id: 'combinations/choose',
      idea: 'Divide out the orders',
      buildsOn: 'permutations/arrange',
      generate: rng => {
        const c = pick(rng, CHOICES);
        const k = pick(rng, [2, 3, 3, 4]);
        const n = int(rng, k + 3, k === 4 ? 9 : 11);
        return {
          prompt: c.ask(n, k),
          answer: { kind: 'number', value: choose(n, k) },
          mistakes: [
            { value: fallingValue(n, k), why: `That counts every order of the same ${k} ${c.things} as different. Order does not matter here, so divide by ${k}!.` },
          ],
          hints: [
            `If order mattered there would be ${falling(n, k)} ways. But does the order of the ${k} ${c.things} matter here?`,
            `Each ${c.group} has been counted ${k}! = ${fact(k)} times, once for every order of its ${c.things}.`,
          ],
          solution: [
            { text: `Pick the ${k} ${c.things} one at a time, as if order mattered: ${falling(n, k)} = ${fmt(fallingValue(n, k))}.` },
            {
              text: `But the same ${c.group} can be picked in any order, and ${k} ${c.things} have ${k}! = ${fact(k)} orders. So every ${c.group} was counted ${fact(k)} times.`,
              visual: working(chooseRows(n, k)),
            },
            { text: `This is "${n} choose ${k}": C(${n}, ${k}) = ${fmt(choose(n, k))}.` },
          ],
        };
      },
    },
    {
      id: 'combinations/complement',
      idea: 'Choose the ones left out',
      buildsOn: 'combinations/choose',
      generate: rng => {
        const out = pick(rng, [2, 2, 3]);
        const n = int(rng, out === 2 ? 9 : 8, out === 2 ? 30 : 14);
        const k = n - out;
        const story = pick(rng, [
          { ask: `A teacher will choose ${k} of her ${n} students to go on a field trip. In how many ways can the group be chosen?`, left: 'stay behind' },
          { ask: `A test has ${n} questions, and you must answer exactly ${k} of them. In how many ways can you choose which questions to answer?`, left: 'are skipped' },
          { ask: `Compute C(${n}, ${k}), the number of ways to choose ${k} things from ${n}.`, left: 'are left out' },
        ]);
        return {
          prompt: story.ask,
          answer: { kind: 'number', value: choose(n, out) },
          hints: [
            `Choosing ${k} from ${n} directly means ${k} factors on top. Is there an easier choice that settles the same thing?`,
            `Choosing the ${k} is the same as choosing the ${out} that ${story.left}. Work out C(${n}, ${out}).`,
          ],
          solution: [
            { text: `Every way to choose ${k} of the ${n} is also a way to choose the ${out} that ${story.left}, and the other way around. So C(${n}, ${k}) = C(${n}, ${out}).` },
            { text: `C(${n}, ${out}) is much quicker.`, visual: working(chooseRows(n, out)) },
          ],
        };
      },
    },
    {
      id: 'combinations/groups',
      idea: 'Choose from each group, then multiply',
      buildsOn: 'combinations/complement',
      generate: rng => {
        const story = pick(rng, [
          { a: 'boys', b: 'girls', where: 'A class has', make: 'a team of' },
          { a: 'seventh graders', b: 'eighth graders', where: 'A math club has', make: 'a committee of' },
          { a: 'novels', b: 'comics', where: 'A shelf holds', make: 'a gift pack of' },
        ]);
        let na: number, nb: number, ka: number, kb: number;
        do [na, nb, ka, kb] = [int(rng, 4, 8), int(rng, 3, 7), int(rng, 1, 3), int(rng, 1, 3)];
        while (ka + kb < 3 || ka >= na - 1 || kb >= nb - 1 || na === nb);
        const [ca, cb] = [choose(na, ka), choose(nb, kb)];
        const one = (n: number, k: number, c: number) => (k === 1 ? `${n}` : `C(${n}, ${k}) = ${falling(n, k)} ÷ ${fact(k)} = ${c}`);
        return {
          prompt: `${story.where} ${na} ${story.a} and ${nb} ${story.b}. In how many ways can ${story.make} ${ka} of the ${story.a} and ${kb} of the ${story.b} be chosen?`,
          answer: { kind: 'number', value: ca * cb },
          hints: [
            `Make two separate choices: the ${story.a}, then the ${story.b}. How do you combine the two counts?`,
            `There are C(${na}, ${ka}) ways to choose the ${story.a} and C(${nb}, ${kb}) ways to choose the ${story.b}. Multiply.`,
          ],
          solution: [
            { text: `The choice happens in two stages that do not affect each other, so count each and multiply.` },
            {
              text: `Within each stage order does not matter, so each is a combination.`,
              visual: working([
                { label: `The ${story.a}`, text: one(na, ka, ca) },
                { label: `The ${story.b}`, text: one(nb, kb, cb) },
                { label: 'Together', text: `${ca} × ${cb} = ${fmt(ca * cb)}` },
              ]),
            },
          ],
        };
      },
    },
    {
      id: 'combinations/disguise',
      idea: 'Spot the combination in disguise',
      buildsOn: 'combinations/groups',
      generate: rng => {
        const variant = int(rng, 0, 3);
        if (variant === 0) {
          const k = pick(rng, [3, 3, 4]);
          const n = int(rng, 6, k === 3 ? 12 : 9);
          const shape = k === 3 ? 'triangles' : 'quadrilaterals';
          return {
            prompt: `${n} points are marked on a circle. How many different ${shape} can be drawn using ${k} of the points as corners?`,
            answer: { kind: 'number', value: choose(n, k) },
            hints: [
              `What do you have to decide in order to draw one of the ${shape}?`,
              `Just which ${k} points to use. No three points on a circle are in a line, so any ${k} of them work, and their order does not matter.`,
            ],
            solution: [
              { text: `Each choice of ${k} points gives exactly one of the ${shape}: on a circle no three points lie in a line, and joining the points in order around the circle gives the shape. So this is C(${n}, ${k}).` },
              { text: `Count ordered picks, then divide out the orders.`, visual: working(chooseRows(n, k)) },
            ],
          };
        }
        if (variant === 1) {
          const [h, v] = [int(rng, 3, 7), int(rng, 4, 8)];
          const [ch, cv] = [choose(h, 2), choose(v, 2)];
          return {
            prompt: `A grid is drawn with ${h} horizontal lines and ${v} vertical lines. How many rectangles of any size have all four sides on lines of the grid?`,
            answer: { kind: 'number', value: ch * cv },
            hints: [
              'Do not count by size. What must you choose to pin down one rectangle?',
              'A rectangle is fixed by its top and bottom (2 of the horizontal lines) and its left and right (2 of the vertical lines).',
            ],
            solution: [
              { text: 'Counting 1-by-1s, then 1-by-2s, and so on is slow. Instead notice that a rectangle is completely decided by which 2 horizontal lines hold its top and bottom, and which 2 vertical lines hold its sides.' },
              {
                text: 'Those are two separate choices, each a combination.',
                visual: working([
                  { label: 'Top & bottom', text: `C(${h}, 2) = ${h} × ${h - 1} ÷ 2 = ${ch}` },
                  { label: 'Left & right', text: `C(${v}, 2) = ${v} × ${v - 1} ÷ 2 = ${cv}` },
                  { label: 'Rectangles', text: `${ch} × ${cv} = ${fmt(ch * cv)}` },
                ]),
              },
            ],
          };
        }
        if (variant === 2) {
          const k = pick(rng, [3, 4]);
          const n = int(rng, k + 3, 10);
          return {
            prompt: `A club has ${n} members, one of whom is Ravi. How many committees of ${k} members include Ravi?`,
            answer: { kind: 'number', value: choose(n - 1, k - 1) },
            hints: [
              'Ravi is on the committee no matter what. So what is actually left to choose?',
              `The other ${k - 1} committee members, from the other ${n - 1} people in the club.`,
            ],
            solution: [
              { text: `Put Ravi on the committee first. What remains is to choose the other ${k - 1} members from the other ${n - 1} people: C(${n - 1}, ${k - 1}).` },
              { text: 'Count ordered picks, then divide out the orders.', visual: working(chooseRows(n - 1, k - 1)) },
            ],
          };
        }
        const n = int(rng, 5, 9);
        const k = pick(rng, [2, 3]);
        return {
          prompt: `A coin is flipped ${n} times and the results are written down in order, like HTTHT. How many of the possible sequences have exactly ${k} heads?`,
          answer: { kind: 'number', value: choose(n, k) },
          hints: [
            'To write down such a sequence, what do you have to decide?',
            `Only which ${k} of the ${n} flips are the heads. The rest are tails.`,
          ],
          solution: [
            { text: `A sequence with exactly ${k} heads is decided by which ${k} of the ${n} positions hold the heads. Choosing positions 2 and 5 is the same as choosing 5 and 2, so this is C(${n}, ${k}).` },
            { text: 'Count ordered picks, then divide out the orders.', visual: working(chooseRows(n, k)) },
          ],
        };
      },
    },
  ],
};

// ── Complementary counting ───────────────────────────────────────────────────

const PLACE = ['Thousands', 'Hundreds', 'Tens', 'Units'];
const ORDINAL = ['1st', '2nd', '3rd', '4th', '5th'];

/** All n-digit numbers, as slots. */
const allNumbers = (n: number): Slot[] =>
  PLACE.slice(4 - n).map((label, i) => ({ label, count: i === 0 ? 9 : 10, why: i === 0 ? '1 to 9' : 'any digit' }));

const product = (s: Slot[]) => s.reduce((n, slot) => n * slot.count, 1);
const times = (s: Slot[]) => s.map(slot => slot.count).join(' × ');

/** The standard three-step solution: everything, minus the opposite. */
function subtractSolution(opposite: string, all: Slot[], bad: Slot[], allName: string): Step[] {
  const [t, b] = [product(all), product(bad)];
  return [
    { text: `Counting these directly means a pile of cases. The opposite, ${opposite}, is one clean count. First count all the ${allName}: ${times(all)} = ${fmt(t)}.`, visual: slots(all) },
    { text: `Now count the ones you do not want, ${opposite}: ${times(bad)} = ${fmt(b)}.`, visual: slots(bad) },
    { text: `Everything else is what you want: ${fmt(t)} − ${fmt(b)} = ${fmt(t - b)}.` },
  ];
}

const complementary: Lesson = {
  topic: 'complementary',
  intro: [
    {
      text: 'Sometimes the things you want are a mess to count, but the things you do not want are easy. Then count everything, and subtract what you do not want. How many 3-digit numbers contain at least one 7? Directly that needs cases: one 7, two 7s, three 7s, in different positions. The opposite is simple: numbers with no 7 at all.',
      visual: working([
        { label: 'All 3-digit', text: '9 × 10 × 10 = 900' },
        { label: 'No 7 at all', text: '8 × 9 × 9 = 648' },
        { label: 'At least one 7', text: '900 − 648 = 252' },
      ]),
    },
    {
      text: 'The words "at least one" are the signal. The opposite of "at least one" is "none", and "none" is almost always a single multiplication. Be careful to get the opposite exactly right, though. The opposite of "all different" is "at least two the same", not "all the same".',
    },
    {
      text: 'It works with Venn diagrams too. How many whole numbers from 1 to 100 are multiples of neither 2 nor 5? Count the ones that are multiples of 2 or 5 and take them away.',
      visual: { kind: 'venn', left: 'Multiples of 2', right: 'Multiples of 5', onlyLeft: 40, both: 10, onlyRight: 10, outside: 40 },
    },
    {
      text: 'Before starting any counting problem, spend a moment asking which is smaller: what you want, or what you do not want? How many 2-digit numbers are not multiples of 11? There are only 9 multiples of 11 to throw away, so 90 − 9 = 81. Nobody should list the 81.',
    },
  ],
  rungs: [
    {
      id: 'complementary/not',
      idea: 'Count the opposite and subtract',
      generate: rng => {
        if (rng() < 0.5) {
          const top = int(rng, 5, 30) * 10 + pick(rng, [0, 0, 5]);
          const root = Math.floor(Math.sqrt(top));
          const cube = rng() < 0.3;
          const croot = Math.floor(Math.cbrt(top + 0.5));
          const [name, count, biggest, next] = cube
            ? ['perfect cubes', croot, `${croot}³ = ${croot ** 3}`, `${croot + 1}³ = ${(croot + 1) ** 3}`]
            : ['perfect squares', root, `${root}² = ${root * root}`, `${root + 1}² = ${(root + 1) ** 2}`];
          return {
            prompt: `How many of the whole numbers from 1 to ${top} are not ${name}?`,
            answer: { kind: 'number', value: top - (count as number) },
            hints: [`There are far fewer ${name} than numbers that are not. Count those instead.`, `The largest one that fits is ${biggest}.`],
            solution: [
              { text: `It is much easier to count the ${name}. They are 1, ${cube ? '8, 27' : '4, 9'}, and so on up to ${biggest}, since ${next} is too big. That is ${count} of them.` },
              { text: `Take them away from all ${top} numbers: ${top} − ${count} = ${top - (count as number)}.` },
            ],
          };
        }
        const digits = pick(rng, [2, 3]);
        const [lo, hi, total] = digits === 2 ? [10, 99, 90] : [100, 999, 900];
        const k = pick(rng, digits === 2 ? [7, 8, 9, 11, 12, 13] : [7, 9, 11, 12, 15, 25]);
        const [first, last] = [Math.ceil(lo / k), Math.floor(hi / k)];
        const count = last - first + 1;
        return {
          prompt: `How many ${digits}-digit numbers are not multiples of ${k}?`,
          answer: { kind: 'number', value: total - count },
          hints: [
            `How many ${digits}-digit numbers are there altogether? How many of them are multiples of ${k}?`,
            `The multiples of ${k} run from ${k} × ${first} = ${k * first} to ${k} × ${last} = ${k * last}.`,
          ],
          solution: [
            { text: `There are ${hi} − ${lo - 1} = ${total} ${digits}-digit numbers.` },
            { text: `The multiples of ${k} among them run from ${k} × ${first} = ${k * first} to ${k} × ${last} = ${k * last}. That is ${last} − ${first} + 1 = ${count} multiples.` },
            { text: `The rest are not multiples of ${k}: ${total} − ${count} = ${total - count}.` },
          ],
        };
      },
    },
    {
      id: 'complementary/at-least-one',
      idea: '"At least one" is everything minus "none"',
      buildsOn: 'complementary/not',
      generate: rng => {
        const variant = int(rng, 0, 2);
        if (variant === 0) {
          const n = pick(rng, [2, 3, 3, 4]);
          const d = rng() < 0.25 ? 0 : int(rng, 1, 9);
          const all = allNumbers(n);
          const bad = all.map((s, i) => ({ label: s.label, count: i === 0 && d !== 0 ? 8 : 9, why: i === 0 ? (d === 0 ? '1 to 9' : `1 to 9, but not ${d}`) : `any digit but ${d}` }));
          return {
            prompt: `How many ${n}-digit numbers contain the digit ${d} at least once?`,
            answer: { kind: 'number', value: product(all) - product(bad) },
            hints: [
              `"At least once" could mean once, twice, or more. What is the opposite of containing a ${d} at least once?`,
              `Count the ${n}-digit numbers with no ${d} at all, and subtract from all the ${n}-digit numbers.`,
            ],
            solution: subtractSolution(`numbers with no ${d} anywhere`, all, bad, `${n}-digit numbers`),
          };
        }
        if (variant === 1) {
          const n = pick(rng, [2, 3, 4]);
          const face = int(rng, 1, 6);
          const all = Array.from({ length: n }, (_, i) => ({ label: `${ORDINAL[i]} roll`, count: 6, why: 'any of the 6 faces' }));
          const bad = all.map(s => ({ ...s, count: 5, why: `any face but ${face}` }));
          return {
            prompt: `A die is rolled ${n} times and the results are written down in order. How many of the possible sequences contain at least one ${face}?`,
            answer: { kind: 'number', value: 6 ** n - 5 ** n },
            hints: [
              `What is the opposite of "at least one ${face}"?`,
              `Count the sequences with no ${face} at all: each roll then has 5 possibilities.`,
            ],
            solution: subtractSolution(`sequences with no ${face} at all`, all, bad, 'sequences'),
          };
        }
        const s = int(rng, 3, 6);
        const n = pick(rng, [3, 4]);
        const letters = 'ABCDEF'.slice(0, s).split('');
        const all = Array.from({ length: n }, (_, i) => ({ label: `${ORDINAL[i]} letter`, count: s, why: `any of the ${s} letters` }));
        const bad = all.map(x => ({ ...x, count: s - 1, why: 'any letter but A' }));
        return {
          prompt: `A ${n}-letter code is written using the letters ${letters.join(', ')}, and letters may repeat. How many codes use the letter A at least once?`,
          answer: { kind: 'number', value: s ** n - (s - 1) ** n },
          hints: [
            'What is the opposite of using A at least once?',
            `Count the codes with no A: each letter then has ${s - 1} possibilities.`,
          ],
          solution: subtractSolution('codes with no A', all, bad, 'codes'),
        };
      },
    },
    {
      id: 'complementary/neither',
      idea: 'Neither is everything minus either',
      buildsOn: 'venn/multiples',
      generate: rng => {
        let a: number, b: number, top: number;
        do {
          [a, b] = pick(rng, [[2, 3], [2, 5], [3, 5], [2, 7], [3, 4], [4, 6], [3, 7], [4, 5], [6, 9], [4, 10]] as const);
          top = int(rng, 5, 30) * 10;
        } while (top < 3 * lcm(a, b));
        const l = lcm(a, b);
        const [ca, cb, cl] = [Math.floor(top / a), Math.floor(top / b), Math.floor(top / l)];
        const either = ca + cb - cl;
        return {
          prompt: `How many of the whole numbers from 1 to ${top} are multiples of neither ${a} nor ${b}?`,
          answer: { kind: 'number', value: top - either },
          hints: [
            `Count the numbers that are multiples of ${a} or ${b} (or both), then take them away from ${top}.`,
            `Add the multiples of ${a} and the multiples of ${b}, then subtract the ones counted twice: the multiples of ${l}.`,
          ],
          solution: [
            {
              text: `First count the numbers that are multiples of ${a} or ${b}. Numbers that are multiples of both are the multiples of ${l}${l === a * b ? '' : `, the least common multiple of ${a} and ${b}`}, and they get counted twice unless you subtract them once.`,
              visual: working([
                { label: `Multiples of ${a}`, text: `${top} ÷ ${a} → ${ca}` },
                { label: `Multiples of ${b}`, text: `${top} ÷ ${b} → ${cb}` },
                { label: `Of both (${l})`, text: `${top} ÷ ${l} → ${cl}` },
                { label: 'Either', text: `${ca} + ${cb} − ${cl} = ${either}` },
              ]),
            },
            {
              text: `Everything outside the two circles is a multiple of neither: ${top} − ${either} = ${top - either}.`,
              visual: { kind: 'venn', left: `Multiples of ${a}`, right: `Multiples of ${b}`, onlyLeft: ca - cl, both: cl, onlyRight: cb - cl, outside: top - either },
            },
          ],
        };
      },
    },
    {
      id: 'complementary/repeats',
      idea: 'Get the opposite exactly right',
      buildsOn: 'complementary/at-least-one',
      generate: rng => {
        const variant = int(rng, 0, 2);
        if (variant === 0) {
          const n = pick(rng, [2, 3, 4]);
          const all = allNumbers(n);
          const bad = all.map((s, i) => ({ label: s.label, count: i === 0 ? 9 : 10 - i, why: i === 0 ? '1 to 9' : `any digit except the ${i === 1 ? 'one' : i} already used` }));
          return {
            prompt: `How many ${n}-digit numbers have at least one digit that appears more than once?`,
            answer: { kind: 'number', value: product(all) - product(bad) },
            hints: [
              'What is the opposite of "some digit appears more than once"?',
              `The opposite is "all ${n} digits are different". Count those with slots and subtract.`,
            ],
            solution: subtractSolution(`numbers whose ${n} digits are all different`, all, bad, `${n}-digit numbers`),
          };
        }
        if (variant === 1) {
          const s = int(rng, 4, 7);
          const n = pick(rng, [3, 4]);
          const letters = 'ABCDEFG'.slice(0, s).split('');
          const all = Array.from({ length: n }, (_, i) => ({ label: `${ORDINAL[i]} letter`, count: s, why: `any of the ${s} letters` }));
          const bad = all.map((x, i) => ({ ...x, count: s - i, why: i === 0 ? `any of the ${s} letters` : `any letter except the ${i === 1 ? 'one' : i} already used` }));
          return {
            prompt: `A ${n}-letter code is written using the letters ${letters.join(', ')}. How many of the possible codes have at least one repeated letter?`,
            answer: { kind: 'number', value: product(all) - product(bad) },
            hints: [
              'What is the opposite of "at least one repeated letter"?',
              'The opposite is "all the letters are different". Count those with slots and subtract.',
            ],
            solution: subtractSolution('codes with all different letters', all, bad, 'codes'),
          };
        }
        const n = int(rng, 4, 8);
        const total = 2 ** n;
        return {
          prompt: `A coin is flipped ${n} times and the results are written down in order. How many of the possible sequences have at least two heads?`,
          answer: { kind: 'number', value: total - 1 - n },
          hints: [
            'The opposite of "at least two heads" is not just "no heads". What else falls short?',
            `Sequences with no heads, or with exactly one head. There is 1 of the first kind and ${n} of the second.`,
          ],
          solution: [
            { text: `There are ${Array(n).fill(2).join(' × ')} = ${total} sequences in all.` },
            { text: `The ones you do not want have fewer than two heads. That is two cases: no heads (just 1 sequence, all tails) or exactly one head (${n} sequences, one for each place the head could be).` },
            { text: `${total} − 1 − ${n} = ${total - 1 - n}.` },
          ],
        };
      },
    },
  ],
};

export const CHOOSING_LESSONS: Lesson[] = [combinations, complementary];
