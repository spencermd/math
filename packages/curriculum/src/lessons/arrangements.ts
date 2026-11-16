// Realm III: Counting — handshakes, casework and permutations.
import type { Lesson, Visual } from './types.ts';
import { fmt, int, pick, shuffle } from './util.ts';

type Row = { label?: string; text: string };
const working = (rows: Row[]): Visual => ({ kind: 'rows', rows });

type Slot = { label: string; count: number; why: string };
const slots = (s: Slot[]): Visual => ({ kind: 'slots', slots: s });

const fact = (n: number): number => (n <= 1 ? 1 : n * fact(n - 1));
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
/** nth(22) → "22nd" */
const nth = (n: number) => `${n}${n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`;

// ── Handshakes ───────────────────────────────────────────────────────────────

/** Things that happen once for every pair. */
const PAIRINGS = [
  { setup: (n: number) => `${n} people meet at a party, and every pair of them shakes hands exactly once.`, ask: 'How many handshakes take place?', who: 'person', whom: 'people', does: 'shakes hands with', each: 'handshake', total: 'handshakes' },
  { setup: (n: number) => `A chess league has ${n} players, and every pair of players plays exactly one game.`, ask: 'How many games are played?', who: 'player', whom: 'players', does: 'plays', each: 'game', total: 'games' },
  { setup: (n: number) => `${n} points are marked on a circle, and a straight line segment is drawn between every pair of points.`, ask: 'How many segments are drawn?', who: 'point', whom: 'points', does: 'is joined to', each: 'segment', total: 'segments' },
];

const handshakes: Lesson = {
  topic: 'handshakes',
  intro: [
    {
      text: 'Six people meet, and everyone shakes hands with everyone else once. How many handshakes? Each of the 6 people shakes 5 hands, which suggests 6 × 5 = 30. But a handshake between Ana and Ben was counted once for Ana and once for Ben. Every handshake was counted twice, so the real answer is 30 ÷ 2 = 15.',
      visual: slots([
        { label: 'Person', count: 6, why: 'any of the 6 people' },
        { label: 'Shakes with', count: 5, why: 'any of the other 5' },
      ]),
    },
    {
      text: 'Count it another way. The first person shakes 5 hands. The second has already shaken with the first, so adds 4 new handshakes. Then 3, 2 and 1. That is 5 + 4 + 3 + 2 + 1 = 15 again. So the handshake count for n people is also the sum 1 + 2 + ⋯ + (n − 1). Sums like this are called triangular numbers, because they count dots stacked in a triangle.',
    },
    {
      text: 'Both views give formulas worth knowing. n people make n(n − 1)/2 handshakes, and 1 + 2 + ⋯ + n = n(n + 1)/2. The second is the first with one more person. The real skill is spotting a handshake problem in disguise: games in a round-robin league, segments joining points, pairs of students who could be partners. Whenever every pair does something once, it is n(n − 1)/2.',
    },
    {
      text: 'A close cousin: how many diagonals does an octagon have? Each of the 8 corners connects to 5 others by a diagonal: not to itself, and not to its 2 neighbors, since those are sides. That is 8 × 5 = 40, and again each diagonal was counted from both ends, so there are 20. In general, n(n − 3)/2.',
      visual: slots([
        { label: 'Corner', count: 8, why: 'any of the 8 corners' },
        { label: 'Far corner', count: 5, why: 'not itself, and not its 2 neighbors' },
      ]),
    },
  ],
  rungs: [
    {
      id: 'handshakes/count',
      idea: 'Count every pair once',
      generate: rng => {
        const s = pick(rng, PAIRINGS);
        const n = int(rng, 7, 20);
        const answer = (n * (n - 1)) / 2;
        return {
          prompt: `${s.setup(n)} ${s.ask}`,
          answer: { kind: 'number', value: answer },
          hints: [
            `Each ${s.who} ${s.does} ${n - 1} others. Why is ${n} × ${n - 1} too many?`,
            `${n} × ${n - 1} counts each ${s.each} twice, once from each end.`,
          ],
          solution: [
            {
              text: `Each of the ${n} ${s.whom} ${s.does} the other ${n - 1}.`,
              visual: slots([
                { label: 'One', count: n, why: `any of the ${n} ${s.whom}` },
                { label: 'The other', count: n - 1, why: `any of the other ${n - 1}` },
              ]),
            },
            { text: `That makes ${n} × ${n - 1} = ${n * (n - 1)}, but each ${s.each} has been counted twice, once from each end.` },
            { text: `${n * (n - 1)} ÷ 2 = ${answer} ${s.total}.` },
          ],
        };
      },
    },
    {
      id: 'handshakes/triangular',
      idea: 'Triangular numbers',
      buildsOn: 'handshakes/count',
      generate: rng => {
        const n = int(rng, 9, 40);
        const answer = (n * (n + 1)) / 2;
        const story = pick(rng, [
          `Cans are stacked in a triangle with 1 can in the top row, 2 in the next row, 3 in the row below that, and so on. The bottom row has ${n} cans. How many cans are in the stack?`,
          `What is the ${nth(n)} triangular number, 1 + 2 + 3 + ⋯ + ${n}?`,
          `A staircase is built from blocks. The first step is 1 block tall, the second is 2 blocks tall, and so on up to the last step, which is ${n} blocks tall. How many blocks are in the staircase?`,
        ]);
        const half = n % 2 === 0 ? `${n / 2} × ${n + 1}` : `${n} × ${(n + 1) / 2}`;
        return {
          prompt: story,
          answer: { kind: 'number', value: answer },
          hints: [
            `This is 1 + 2 + 3 + ⋯ + ${n}. Don't add it up one by one.`,
            `1 + 2 + ⋯ + n = n(n + 1)/2. Halve whichever of ${n} and ${n + 1} is even before you multiply.`,
          ],
          solution: [
            { text: `The total is 1 + 2 + 3 + ⋯ + ${n}, the ${nth(n)} triangular number.` },
            { text: `Write the sum twice, once forwards and once backwards, and add the two copies term by term: 1 + ${n}, 2 + ${n - 1}, and so on. Each of the ${n} columns makes ${n + 1}, so two copies total ${n} × ${n + 1} and one copy is ${n} × ${n + 1} ÷ 2.` },
            { text: `Halve the even factor first: ${half} = ${fmt(answer)}.` },
            { text: `It is also the number of handshakes among ${n + 1} people: ${n + 1} × ${n} ÷ 2.` },
          ],
        };
      },
    },
    {
      id: 'handshakes/variations',
      idea: 'Adjust for who is left out',
      buildsOn: 'handshakes/triangular',
      generate: rng => {
        const variant = int(rng, 0, 2);
        if (variant === 0) {
          const n = int(rng, 6, 20);
          const answer = (n * (n - 3)) / 2;
          return {
            prompt: `How many diagonals does a polygon with ${n} sides have? (A diagonal joins two corners that are not next to each other.)`,
            answer: { kind: 'number', value: answer },
            hints: [
              `From one corner, how many of the ${n} corners can a diagonal go to?`,
              `Not to itself and not to its 2 neighbors, so ${n - 3}. Then remember each diagonal has two ends.`,
            ],
            solution: [
              {
                text: `A polygon with ${n} sides has ${n} corners. From each one, a diagonal can go to any corner except itself and its 2 neighbors.`,
                visual: slots([
                  { label: 'Corner', count: n, why: `any of the ${n} corners` },
                  { label: 'Far corner', count: n - 3, why: 'not itself, and not its 2 neighbors' },
                ]),
              },
              { text: `${n} × ${n - 3} = ${n * (n - 3)} counts every diagonal from both ends, so there are ${n * (n - 3)} ÷ 2 = ${answer} diagonals.` },
            ],
          };
        }
        if (variant === 1) {
          const c = int(rng, 3, 12);
          const n = 2 * c;
          const answer = (n * (n - 2)) / 2;
          return {
            prompt: `${c} married couples are at a dinner. Each person shakes hands once with everyone except their own spouse. How many handshakes take place?`,
            answer: { kind: 'number', value: answer },
            hints: [
              `There are ${n} people. How many hands does each one shake?`,
              `Each person skips themselves and their spouse, so shakes ${n - 2} hands.`,
            ],
            solution: [
              { text: `There are ${n} people. Each shakes hands with everyone except themselves and their spouse: ${n} − 2 = ${n - 2} people.` },
              { text: `${n} × ${n - 2} = ${n * (n - 2)} counts each handshake twice, so there are ${n * (n - 2)} ÷ 2 = ${answer}.` },
              { text: `Another way: all ${n} people would make ${n} × ${n - 1} ÷ 2 = ${(n * (n - 1)) / 2} handshakes, and the ${c} couples skip one each: ${(n * (n - 1)) / 2} − ${c} = ${answer}.` },
            ],
          };
        }
        const n = int(rng, 6, 16);
        return {
          prompt: `In a league of ${n} teams, every team plays every other team twice: once at home and once away. How many games are played in all?`,
          answer: { kind: 'number', value: n * (n - 1) },
          hints: [
            `If each pair of teams played once, there would be ${n} × ${n - 1} ÷ 2 games.`,
            'Each pair plays twice, which undoes the dividing by 2.',
          ],
          solution: [
            { text: `If every pair played once there would be ${n} × ${n - 1} ÷ 2 = ${(n * (n - 1)) / 2} games.` },
            { text: `Each pair plays twice, so double it: ${n * (n - 1)} games.` },
            { text: `Or count home games directly: each of the ${n} teams hosts each of the other ${n - 1} once, and no game is counted twice because only one team is at home. ${n} × ${n - 1} = ${n * (n - 1)}.` },
          ],
        };
      },
    },
    {
      id: 'handshakes/reverse',
      idea: 'Work back from the count',
      buildsOn: 'handshakes/variations',
      generate: rng => {
        const s = pick(rng, [
          { setup: (h: number) => `At a meeting, every pair of people shook hands exactly once, and there were ${h} handshakes in all. How many people were at the meeting?`, whom: 'people' },
          { setup: (h: number) => `In a tournament, every pair of teams played exactly one game, and ${h} games were played in all. How many teams were in the tournament?`, whom: 'teams' },
          { setup: (h: number) => `Some points are marked on a circle. Joining every pair of them takes ${h} line segments. How many points are there?`, whom: 'points' },
        ]);
        const n = int(rng, 7, 25);
        const h = (n * (n - 1)) / 2;
        return {
          prompt: s.setup(h),
          answer: { kind: 'number', value: n },
          hints: [
            `With n ${s.whom} the count is n(n − 1)/2. Set that equal to ${h}.`,
            `n(n − 1) = ${2 * h}. You need two whole numbers next to each other whose product is ${2 * h}.`,
          ],
          solution: [
            { text: `With n ${s.whom} the count is n(n − 1)/2, so n(n − 1)/2 = ${h} and n(n − 1) = ${2 * h}.` },
            { text: `n and n − 1 are neighbors, so each is close to the square root of ${2 * h}. Since ${n - 1} × ${n - 1} = ${(n - 1) ** 2} is too small and ${n} × ${n} = ${n * n} is too big, try ${n} × ${n - 1} = ${2 * h}. It works.` },
            { text: `There are ${n} ${s.whom}.` },
          ],
        };
      },
    },
  ],
};

// ── Casework ─────────────────────────────────────────────────────────────────

/** Whole-number triangles with the given perimeter, grouped by longest side. */
function trianglesByLongest(p: number): { c: number; list: [number, number, number][] }[] {
  const out: { c: number; list: [number, number, number][] }[] = [];
  for (let c = Math.ceil(p / 3); 2 * c < p; c++) {
    const list: [number, number, number][] = [];
    for (let b = c; b >= 1; b--) {
      const a = p - c - b;
      if (a >= 1 && a <= b) list.push([a, b, c]);
    }
    if (list.length) out.push({ c, list });
  }
  return out;
}

const COIN_SETS = [
  { big: 25, bigName: 'quarter', mid: 10, midName: 'dime', small: 'nickels', coins: 'nickels, dimes and quarters', amounts: [30, 35, 40, 45, 50, 55, 60, 65, 70] },
  { big: 10, bigName: 'dime', mid: 5, midName: 'nickel', small: 'pennies', coins: 'pennies, nickels and dimes', amounts: [16, 18, 21, 23, 25, 27, 30, 32, 36, 40] },
];

const casework: Lesson = {
  topic: 'casework',
  intro: [
    {
      text: 'Some counts will not fit into one neat multiplication. Then split the problem into cases, count each case, and add. Two rules make it work: the cases must not overlap, and together they must cover everything. How many 2-digit numbers have a units digit bigger than their tens digit? Take the tens digit as the case.',
      visual: working([
        { label: 'Tens digit 1', text: '12, 13, …, 19: 8 numbers' },
        { label: 'Tens digit 2', text: '23, 24, …, 29: 7 numbers' },
        { label: '…', text: 'one fewer each time' },
        { label: 'Tens digit 8', text: '89: 1 number' },
        { label: 'Total', text: '8 + 7 + ⋯ + 1 = 36' },
      ]),
    },
    {
      text: 'Choosing what to split on is the art. Pick the thing with the fewest possibilities, or the thing that makes each case easy. How many ways can you make 30 cents from nickels, dimes and quarters? Split on the biggest coin, because there are only two possibilities for it.',
      visual: working([
        { label: '1 quarter', text: '5¢ left: 0 dimes only → 1 way' },
        { label: '0 quarters', text: '30¢ left: 0, 1, 2 or 3 dimes → 4 ways' },
        { label: 'Total', text: '1 + 4 = 5 ways' },
      ]),
    },
    {
      text: 'In that last one, once the quarters and dimes are chosen the nickels are forced: they fill whatever is left. So each case is counted by the dimes alone. Look for this in every casework problem. Once a few choices are made, is the rest decided?',
    },
    {
      text: 'Cases and multiplication work together. How many 3-digit numbers contain exactly one 7? Split on where the 7 goes, then fill the other slots. The first digit cannot be 0, and the non-7 slots cannot be 7.',
      visual: working([
        { label: '7 _ _', text: '9 × 9 = 81' },
        { label: '_ 7 _', text: '8 × 9 = 72' },
        { label: '_ _ 7', text: '8 × 9 = 72' },
        { label: 'Total', text: '81 + 72 + 72 = 225' },
      ]),
    },
  ],
  rungs: [
    {
      id: 'casework/digits',
      idea: 'Go through the cases in order',
      generate: rng => {
        const variant = int(rng, 0, 2);
        if (variant === 0) {
          const s = int(rng, 5, 15);
          const list: number[] = [];
          for (let t = 1; t <= 9; t++) if (s - t >= 0 && s - t <= 9) list.push(10 * t + (s - t));
          return {
            prompt: `How many 2-digit numbers have digits that add up to ${s}?`,
            answer: { kind: 'number', value: list.length },
            hints: [
              'Go through the tens digits in order: 1, 2, 3, … For each one, what must the units digit be?',
              `The units digit is ${s} minus the tens digit, and it has to be a single digit from 0 to 9.`,
            ],
            solution: [
              { text: `Take the tens digit as the case. Once it is chosen, the units digit is forced: it must be ${s} minus the tens digit.` },
              { text: `That only works when the units digit comes out between 0 and 9. Going up through the tens digits: ${list.join(', ')}.` },
              { text: `That is ${list.length} numbers.${s > 9 ? ` Tens digits below ${s - 9} would need a units digit bigger than 9.` : s === 9 ? '' : ` Tens digits above ${s} would need a negative units digit.`}` },
            ],
          };
        }
        if (variant === 1) {
          const d = int(rng, 2, 7);
          const tensBig = Array.from({ length: 10 - d }, (_, i) => 10 * (d + i) + i);
          const unitsBig = Array.from({ length: 9 - d }, (_, i) => 10 * (i + 1) + i + 1 + d);
          const brief = (xs: number[]) => (xs.length <= 4 ? xs.join(', ') : `${xs[0]}, ${xs[1]}, …, ${xs[xs.length - 1]}`);
          const [down, up] = [tensBig.length, unitsBig.length];
          return {
            prompt: `How many 2-digit numbers have two digits that differ by exactly ${d}?`,
            answer: { kind: 'number', value: down + up },
            hints: [
              'Two cases: the tens digit is the bigger one, or the units digit is the bigger one.',
              `If the tens digit is bigger, the units digit runs from 0 up to ${9 - d}. If the units digit is bigger, remember the tens digit cannot be 0.`,
            ],
            solution: [
              {
                text: 'Split on which digit is bigger. The cases cannot overlap, and since the digits differ, one of them has to be bigger.',
                visual: working([
                  { label: 'Tens bigger', text: `${brief(tensBig)}: ${down} numbers` },
                  { label: 'Units bigger', text: `${brief(unitsBig)}: ${up} numbers` },
                  { label: 'Total', text: `${down} + ${up} = ${down + up}` },
                ]),
              },
              { text: `The two cases are not the same size: the tens digit cannot be 0, so there is no partner for ${d}0.` },
            ],
          };
        }
        const tensBigger = rng() < 0.5;
        const counts = tensBigger ? [1, 2, 3, 4, 5, 6, 7, 8, 9] : [8, 7, 6, 5, 4, 3, 2, 1];
        return {
          prompt: `How many 2-digit numbers have a ${tensBigger ? 'tens' : 'units'} digit that is greater than the ${tensBigger ? 'units' : 'tens'} digit?`,
          answer: { kind: 'number', value: sum(counts) },
          hints: [
            'Take the tens digit as the case: 1, then 2, then 3, …',
            tensBigger ? 'With tens digit 1 only 10 works. With tens digit 2 there are 20 and 21. Keep going.' : 'With tens digit 1 the units digit can be 2 through 9. With tens digit 2 it can be 3 through 9. Keep going.',
          ],
          solution: [
            {
              text: 'Take the tens digit as the case and count the units digits that work for each.',
              visual: working(
                tensBigger
                  ? [
                      { label: 'Tens digit 1', text: '10: 1 number' },
                      { label: 'Tens digit 2', text: '20, 21: 2 numbers' },
                      { label: '…', text: 'one more each time' },
                      { label: 'Tens digit 9', text: '90, 91, …, 98: 9 numbers' },
                    ]
                  : [
                      { label: 'Tens digit 1', text: '12, 13, …, 19: 8 numbers' },
                      { label: 'Tens digit 2', text: '23, 24, …, 29: 7 numbers' },
                      { label: '…', text: 'one fewer each time' },
                      { label: 'Tens digit 8', text: '89: 1 number' },
                    ],
              ),
            },
            { text: `Add the cases: ${tensBigger ? '1 + 2 + ⋯ + 9' : '8 + 7 + ⋯ + 1'} = ${sum(counts)}, a triangular number.` },
          ],
        };
      },
    },
    {
      id: 'casework/coins',
      idea: 'Split on the biggest piece',
      buildsOn: 'casework/digits',
      generate: rng => {
        const set = pick(rng, COIN_SETS);
        const amount = pick(rng, set.amounts);
        const cases: { big: number; left: number; ways: number }[] = [];
        for (let q = Math.floor(amount / set.big); q >= 0; q--) {
          const left = amount - q * set.big;
          cases.push({ big: q, left, ways: Math.floor(left / set.mid) + 1 });
        }
        const total = sum(cases.map(c => c.ways));
        const range = (m: number) => (m === 0 ? '0' : m === 1 ? '0 or 1' : `0 to ${m}`);
        return {
          prompt: `In how many ways can you make ${amount} cents using only ${set.coins}? (You do not have to use every kind of coin.)`,
          answer: { kind: 'number', value: total },
          hints: [
            `Split on the number of ${set.bigName}s. How many can there be?`,
            `Once the ${set.bigName}s and ${set.midName}s are chosen, the ${set.small} are forced. So for each case just count the possible numbers of ${set.midName}s.`,
          ],
          solution: [
            { text: `Split on the number of ${set.bigName}s, the biggest coin. In each case, choosing the number of ${set.midName}s settles everything, because the ${set.small} just fill what is left.` },
            {
              text: `So each case has one way for every possible number of ${set.midName}s.`,
              visual: working([
                ...cases.map(c => ({
                  label: plural(c.big, set.bigName),
                  text: `${c.left}¢ left: ${range(c.ways - 1)} ${set.midName}s → ${plural(c.ways, 'way')}`,
                })),
                { label: 'Total', text: `${cases.map(c => c.ways).join(' + ')} = ${total}` },
              ]),
            },
          ],
        };
      },
    },
    {
      id: 'casework/exactly',
      idea: 'Cases, then multiply inside each',
      buildsOn: 'casework/coins',
      generate: rng => {
        const d = rng() < 0.3 ? 0 : int(rng, 1, 9);
        const [n, k] = pick(rng, [[3, 1], [3, 1], [3, 2], [4, 1]] as const);
        // Every way to choose which k of the n positions hold the digit d.
        const placements: number[][] = [];
        for (let mask = 0; mask < 1 << n; mask++) {
          const pos = Array.from({ length: n }, (_, i) => i).filter(i => mask & (1 << i));
          if (pos.length === k && !(d === 0 && pos.includes(0))) placements.push(pos);
        }
        placements.sort((a, b) => a.join('').localeCompare(b.join('')));
        const cases = placements.map(pos => {
          const factors = Array.from({ length: n }, (_, i) => i).filter(i => !pos.includes(i)).map(i => (i === 0 && d !== 0 ? 8 : 9));
          return {
            pattern: Array.from({ length: n }, (_, i) => (pos.includes(i) ? `${d}` : '_')).join(' '),
            factors,
            ways: factors.reduce((a, b) => a * b, 1),
          };
        });
        const total = sum(cases.map(c => c.ways));
        const many = k === 1 ? `exactly one ${d}` : `exactly two ${d}s`;
        const fillers = [1, 2, 3, 4, 5].filter(x => x !== d);
        const last = placements[placements.length - 1];
        const example = fmt(Number(Array.from({ length: n }, (_, i) => (last.includes(i) ? d : fillers[i])).join('')));
        return {
          prompt: `How many ${n}-digit numbers contain ${many}? (For example, ${example} is one of them.)`,
          answer: { kind: 'number', value: total },
          hints: [
            `Split on where the ${k === 1 ? `${d} goes` : `two ${d}s go`}. ${d === 0 ? 'Remember a number cannot start with 0.' : ''}`.trim(),
            `In each case, fill the other slots with digits that are not ${d}. ${d === 0 ? 'That leaves 9 choices for each.' : 'That is 9 choices, or 8 for the first digit, which cannot be 0 either.'}`,
          ],
          solution: [
            { text: `Split on where the ${k === 1 ? `${d} goes` : `two ${d}s go`}.${d === 0 ? ' It cannot go first, because a number does not start with 0.' : ''} Then fill each remaining slot with a digit that is not ${d}.` },
            {
              text: d === 0 ? 'Every remaining slot has 9 choices: the digits 1 to 9.' : `A remaining slot has 9 choices (anything but ${d}), except a leading slot, which has 8 because it cannot be 0 either.`,
              visual: working([
                ...cases.map(c => ({ label: c.pattern, text: c.factors.length > 1 ? `${c.factors.join(' × ')} = ${c.ways}` : `${c.ways}` })),
                ...(cases.length > 1 ? [{ label: 'Total', text: `${cases.map(c => c.ways).join(' + ')} = ${fmt(total)}` }] : []),
              ]),
            },
          ],
        };
      },
    },
    {
      id: 'casework/triangles',
      idea: 'List without missing or repeating',
      buildsOn: 'casework/exactly',
      generate: rng => {
        const p = int(rng, 9, 24);
        const groups = trianglesByLongest(p);
        const total = sum(groups.map(g => g.list.length));
        const [lo, hi] = [groups[0].c, groups[groups.length - 1].c];
        return {
          prompt: `How many different triangles have whole-number side lengths and a perimeter of ${p}? (Two triangles with the same three side lengths count as one. In any triangle, the two shorter sides together are longer than the longest side.)`,
          answer: { kind: 'number', value: total },
          hints: [
            'Split on the length of the longest side. What is the largest it can be? The smallest?',
            `The longest side must be less than half of ${p}, and at least a third of ${p}. For each value, list the other two sides from most unequal to most equal.`,
          ],
          solution: [
            { text: `Split on the longest side. The other two sides together must beat it, so it is less than half the perimeter: at most ${hi}. And it cannot be smaller than a third of the perimeter, so it is at least ${lo}.` },
            {
              text: `For each longest side, the other two add up to what is left. Write the sides in increasing order so that no triangle is listed twice.`,
              visual: working([
                ...groups.map(g => ({ label: `Longest ${g.c}`, text: g.list.map(t => `(${t.join(', ')})`).join(' ') })),
                { label: 'Total', text: groups.length > 1 ? `${groups.map(g => g.list.length).join(' + ')} = ${total}` : `${total}` },
              ]),
            },
          ],
        };
      },
    },
  ],
};

// ── Permutations ─────────────────────────────────────────────────────────────

const WORDS = [
  'LEVEL', 'RADAR', 'KAYAK', 'TOOTH', 'GEESE', 'POPPY', 'EERIE', 'SASSY', 'PEPPER', 'BANANA', 'MAMMAL', 'LETTER',
  'COOKIE', 'CIRCLE', 'PUZZLE', 'BUBBLE', 'BALLOON', 'ALGEBRA', 'STREETS', 'PARALLEL',
];

const ORDINAL = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th'];

const PEOPLE = ['Amy', 'Ben', 'Cara', 'Dev', 'Eli', 'Fay', 'Gus', 'Hana', 'Ivan', 'Jo', 'Kai', 'Lena'];

const permutations: Lesson = {
  topic: 'permutations',
  intro: [
    {
      text: 'In how many orders can 4 different books stand on a shelf? Fill the shelf one spot at a time. Each book you place leaves one fewer for the next spot. A product that counts down to 1 like this is called a factorial, written 4! and read "four factorial".',
      visual: slots([
        { label: '1st spot', count: 4, why: 'any of the 4 books' },
        { label: '2nd spot', count: 3, why: 'any of the 3 left' },
        { label: '3rd spot', count: 2, why: 'either of the 2 left' },
        { label: '4th spot', count: 1, why: 'the last book' },
      ]),
    },
    {
      text: 'You do not have to fill every spot. Seven runners race for gold, silver and bronze: 7 × 6 × 5 = 210 possible podiums. That product is 7! with its tail 4 × 3 × 2 × 1 chopped off, which is 7!/4!. Factorials get huge, so never multiply them out when dividing. Cancel instead.',
      visual: working([
        { text: '10!/8!' },
        { label: 'Unroll the top', text: '= (10 × 9 × 8!)/8!' },
        { label: 'Cancel 8!', text: '= 10 × 9 = 90' },
      ]),
    },
    {
      text: 'Repeated letters need care. How many ways can the letters of LEVEL be arranged? If all five letters were different there would be 5! = 120 orders. But swapping the two Ls changes nothing you can see, so every arrangement has been counted 2 times over. The two Es double it again.',
      visual: working([
        { label: 'If all different', text: '5! = 120' },
        { label: 'Two Ls', text: '120 ÷ 2! = 60' },
        { label: 'Two Es', text: '60 ÷ 2! = 30' },
      ]),
    },
    {
      text: 'Finally, the glue trick. Five friends line up for a photo, and Amy and Ben insist on standing together. Glue them into one block. Now there are 4 things to arrange, 4! = 24 ways, and inside the block Amy and Ben can stand in 2 orders: 24 × 2 = 48. And if they refuse to stand together? Take all 5! = 120 line-ups and remove those 48, leaving 72.',
    },
  ],
  rungs: [
    {
      id: 'permutations/arrange',
      idea: 'Fill the spots in order',
      buildsOn: 'mult_principle/codes',
      generate: rng => {
        if (rng() < 0.4) {
          const n = int(rng, 4, 7);
          const story = pick(rng, [
            `In how many different orders can ${n} different books be arranged in a row on a shelf?`,
            `${n} friends line up for a photo. In how many different orders can they stand?`,
            `A playlist has ${n} different songs. In how many different orders can they be played, each exactly once?`,
          ]);
          const s = Array.from({ length: n }, (_, i) => ({ label: `${ORDINAL[i]} spot`, count: n - i, why: i === 0 ? `any of the ${n}` : i === n - 1 ? 'the only one left' : `any of the ${n - i} left` }));
          return {
            prompt: story,
            answer: { kind: 'number', value: fact(n) },
            hints: [`How many choices are there for the first spot? Then for the second?`, `It is ${n}!, which is ${s.map(x => x.count).join(' × ')}.`],
            solution: [
              { text: 'Fill the spots one at a time. Each choice uses one up, leaving one fewer for the next spot.', visual: slots(s) },
              { text: `${n}! = ${s.map(x => x.count).join(' × ')} = ${fmt(fact(n))}.` },
            ],
          };
        }
        const k = pick(rng, [2, 3, 3]);
        const n = int(rng, 6, 12);
        const roles = k === 3 ? ['President', 'Vice president', 'Treasurer'] : ['President', 'Vice president'];
        const medals = ['Gold', 'Silver', 'Bronze'];
        const race = k === 3 && rng() < 0.5;
        const labels = race ? medals : roles;
        const s = labels.map((label, i) => ({ label, count: n - i, why: i === 0 ? `any of the ${n}` : `any of the ${n - i} left` }));
        const answer = s.reduce((a, x) => a * x.count, 1);
        return {
          prompt: race
            ? `${n} runners enter a race. In how many different ways can the gold, silver and bronze medals be awarded? (There are no ties.)`
            : `A club has ${n} members. In how many ways can it choose ${k === 3 ? 'a president, a vice president and a treasurer' : 'a president and a vice president'}, if no one may hold two jobs?`,
          answer: { kind: 'number', value: answer },
          hints: [
            `There are only ${k} spots to fill, not ${n}. How many choices for the first?`,
            `Stop after ${k} factors: ${s.map(x => x.count).join(' × ')}.`,
          ],
          solution: [
            { text: `There are ${k} different ${race ? 'medals' : 'jobs'} to fill, and each person can take only one.`, visual: slots(s) },
            { text: `${s.map(x => x.count).join(' × ')} = ${fmt(answer)}. This is ${n}! with everything from ${n - k} down chopped off: ${n}!/${n - k}!.` },
          ],
        };
      },
    },
    {
      id: 'permutations/factorials',
      idea: 'Cancel factorials, never multiply them out',
      buildsOn: 'permutations/arrange',
      generate: rng => {
        const variant = int(rng, 0, 3);
        if (variant === 3) {
          const n = int(rng, 5, 30);
          return {
            prompt: `Compute (${n}! + ${n + 1}!) ÷ ${n}!.`,
            answer: { kind: 'number', value: n + 2 },
            hints: [`Write ${n + 1}! in terms of ${n}!.`, `${n + 1}! = ${n + 1} × ${n}!, so the top is ${n}! × (1 + ${n + 1}).`],
            solution: [
              {
                text: `${n + 1}! is just ${n + 1} × ${n}!, so both terms on top contain ${n}!.`,
                visual: working([
                  { text: `(${n}! + ${n + 1}!) ÷ ${n}!` },
                  { label: `Unroll ${n + 1}!`, text: `= (${n}! + ${n + 1} × ${n}!) ÷ ${n}!` },
                  { label: `Divide by ${n}!`, text: `= 1 + ${n + 1}` },
                  { text: `= ${n + 2}` },
                ]),
              },
            ],
          };
        }
        if (variant === 2) {
          let n: number;
          const m = pick(rng, [2, 3]);
          do n = int(rng, 6, 15);
          while ((n * (n - 1)) % fact(m) !== 0);
          const answer = (n * (n - 1)) / fact(m);
          return {
            prompt: `Compute ${n}! ÷ (${n - 2}! × ${m}!).`,
            answer: { kind: 'number', value: answer },
            hints: [`Write ${n}! as ${n} × ${n - 1} × ${n - 2}! and cancel.`, `What is left is ${n} × ${n - 1} ÷ ${m}!, and ${m}! = ${fact(m)}.`],
            solution: [
              {
                text: `Unroll ${n}! only as far as ${n - 2}!, then cancel.`,
                visual: working([
                  { text: `${n}! ÷ (${n - 2}! × ${m}!)` },
                  { label: `Unroll ${n}!`, text: `= (${n} × ${n - 1} × ${n - 2}!) ÷ (${n - 2}! × ${m}!)` },
                  { label: `Cancel ${n - 2}!`, text: `= ${n} × ${n - 1} ÷ ${fact(m)}` },
                  { text: `= ${answer}` },
                ]),
              },
            ],
          };
        }
        const k = variant === 0 ? 2 : 3;
        const n = int(rng, 6, variant === 0 ? 25 : 12);
        const factors = Array.from({ length: k }, (_, i) => n - i);
        const answer = factors.reduce((a, b) => a * b, 1);
        return {
          prompt: `Compute ${n}! ÷ ${n - k}!.`,
          answer: { kind: 'number', value: answer },
          hints: [`Don't work out ${n}!. Most of it cancels.`, `${n}! = ${factors.join(' × ')} × ${n - k}!.`],
          solution: [
            {
              text: `Unroll ${n}! only as far as ${n - k}!, then cancel.`,
              visual: working([
                { text: `${n}! ÷ ${n - k}!` },
                { label: `Unroll ${n}!`, text: `= (${factors.join(' × ')} × ${n - k}!) ÷ ${n - k}!` },
                { label: `Cancel ${n - k}!`, text: `= ${factors.join(' × ')}` },
                { text: `= ${fmt(answer)}` },
              ]),
            },
          ],
        };
      },
    },
    {
      id: 'permutations/repeats',
      idea: 'Divide out the repeats',
      buildsOn: 'permutations/factorials',
      generate: rng => {
        const word = pick(rng, WORDS);
        const n = word.length;
        const counts: [string, number][] = [];
        for (const ch of word) {
          const hit = counts.find(c => c[0] === ch);
          if (hit) hit[1]++;
          else counts.push([ch, 1]);
        }
        const repeats = counts.filter(c => c[1] > 1);
        const count = ['', '', 'Two', 'Three', 'Four'];
        let running = fact(n);
        const rows: Row[] = [{ label: 'If all different', text: `${n}! = ${fmt(running)}` }];
        for (const [ch, c] of repeats) {
          rows.push({ label: `${count[c]} ${ch}s`, text: `${fmt(running)} ÷ ${c}! = ${fmt(running / fact(c))}` });
          running /= fact(c);
        }
        const described = repeats.map(([ch, c]) => `${count[c].toLowerCase()} ${ch}s`);
        return {
          prompt: `In how many different ways can the letters of ${word} be arranged in a row?`,
          answer: { kind: 'number', value: running },
          hints: [
            `${word} has ${n} letters, but they are not all different. Which ones repeat?`,
            `Start from ${n}! and divide by ${repeats.map(([, c]) => `${c}!`).join(' and by ')} for the ${described.join(' and the ')}.`,
          ],
          solution: [
            { text: `${word} has ${n} letters, including ${described.join(' and ')}.` },
            {
              text: `If the letters were all different there would be ${n}! orders. Identical letters can be swapped among themselves without changing the word, so divide by the number of ways to do that.`,
              visual: working(rows),
            },
            { text: `There are ${fmt(running)} arrangements.` },
          ],
        };
      },
    },
    {
      id: 'permutations/together',
      idea: 'Glue together what must stay together',
      buildsOn: 'permutations/repeats',
      generate: rng => {
        const n = int(rng, 5, 7);
        const names = shuffle(rng, PEOPLE).slice(0, n);
        const list = `${names.slice(0, -1).join(', ')} and ${names[n - 1]}`;
        const variant = int(rng, 0, 2);
        const [a, b, c] = names;
        const glued = 2 * fact(n - 1);
        if (variant === 2) {
          const answer = 6 * fact(n - 2);
          return {
            prompt: `${list} sit in a row of ${n} seats. ${a}, ${b} and ${c} want to sit together, in three seats side by side. In how many ways can everyone be seated?`,
            answer: { kind: 'number', value: answer },
            hints: [
              `Glue ${a}, ${b} and ${c} into one block. How many things are there to arrange now?`,
              `${n - 2} things can be arranged in ${n - 2}! ways. Then the three inside the block can be ordered in 3! ways.`,
            ],
            solution: [
              { text: `Glue ${a}, ${b} and ${c} into a single block. With the other ${n - 3} people that makes ${n - 2} things to arrange: ${n - 2}! = ${fact(n - 2)} ways.` },
              { text: `Inside the block the three of them can sit in 3! = 6 orders.` },
              { text: `${fact(n - 2)} × 6 = ${fmt(answer)}.` },
            ],
          };
        }
        const apart = variant === 1;
        const answer = apart ? fact(n) - glued : glued;
        return {
          prompt: `${list} line up for a photo. ${apart ? `${a} and ${b} refuse to stand next to each other.` : `${a} and ${b} insist on standing next to each other.`} In how many ways can the ${n} of them line up?`,
          answer: { kind: 'number', value: answer },
          hints: apart
            ? [
                'It is easier to count the line-ups where they do stand together, and take those away from all the line-ups.',
                `Glue ${a} and ${b} into one block: ${n - 1}! arrangements, times 2 for their order inside the block.`,
              ]
            : [
                `Glue ${a} and ${b} into one block. How many things are there to arrange now?`,
                `${n - 1} things can be arranged in ${n - 1}! ways. Don't forget ${a} and ${b} can swap places inside the block.`,
              ],
          solution: [
            ...(apart ? [{ text: `"Not together" is awkward to count directly. Count the line-ups where they are together, and subtract from all ${n}! = ${fmt(fact(n))} line-ups.` }] : []),
            { text: `Glue ${a} and ${b} into a single block. With the other ${n - 2} people that makes ${n - 1} things to arrange: ${n - 1}! = ${fact(n - 1)} ways.` },
            { text: `Inside the block they can stand in 2 orders, ${a} then ${b} or ${b} then ${a}: ${fact(n - 1)} × 2 = ${fmt(glued)}${apart ? ' line-ups with them together' : ''}.` },
            ...(apart ? [{ text: `Take those away: ${fmt(fact(n))} − ${fmt(glued)} = ${fmt(answer)}.` }] : []),
          ],
        };
      },
    },
  ],
};

export const ARRANGEMENT_LESSONS: Lesson[] = [handshakes, casework, permutations];
