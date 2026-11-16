// Realm III: Counting — paths on a grid, sticks and stones, Pascal's triangle.
import type { Lesson, Pt, Shape, Visual } from './types.ts';
import { choose, fmt, int, pick, pow, sup, working } from './util.ts';

/** "C(7, 3) = (7 × 6 × 5) ÷ (3 × 2 × 1) = 35", using the smaller of k and n − k. */
function cWork(n: number, k: number): string {
  const j = Math.min(k, n - k);
  if (j === 0) return `C(${n}, ${k}) = 1`;
  if (j === 1) return `C(${n}, ${k}) = ${n}`;
  const top = Array.from({ length: j }, (_, i) => n - i).join(' × ');
  const bottom = Array.from({ length: j }, (_, i) => j - i).join(' × ');
  return `C(${n}, ${k})${j === k ? '' : ` = C(${n}, ${j})`} = (${top}) ÷ (${bottom}) = ${fmt(choose(n, k))}`;
}

// ── Paths on a Grid ──────────────────────────────────────────────────────────

/** A w × h street grid from A (bottom-left) to B (top-right), with optional labelled corners and a highlighted route. */
function streets(w: number, h: number, opts: { marks?: { at: Pt; name: string }[]; route?: string } = {}): Visual {
  const shapes: Shape[] = [];
  for (let x = 0; x <= w; x++) shapes.push({ type: 'segment', from: [x, 0], to: [x, h], dashed: true });
  for (let y = 0; y <= h; y++) shapes.push({ type: 'segment', from: [0, y], to: [w, y], dashed: true });
  if (opts.route) {
    let [x, y] = [0, 0];
    for (const step of opts.route) {
      const next: Pt = step === 'R' ? [x + 1, y] : [x, y + 1];
      shapes.push({ type: 'segment', from: [x, y], to: next });
      [x, y] = next;
    }
  }
  shapes.push({ type: 'point', at: [0, 0] }, { type: 'label', at: [-0.3, -0.3], text: 'A' });
  shapes.push({ type: 'point', at: [w, h] }, { type: 'label', at: [w + 0.3, h + 0.3], text: 'B' });
  for (const m of opts.marks ?? []) {
    shapes.push({ type: 'point', at: m.at }, { type: 'label', at: [m.at[0] + 0.28, m.at[1] + 0.3], text: m.name });
  }
  return { kind: 'figure', box: [-0.5, -0.5, w + 0.5, h + 0.5], shapes };
}

const blocks = (n: number) => `${n} block${n === 1 ? '' : 's'}`;

const gridPaths: Lesson = {
  topic: 'grid_paths',
  intro: [
    {
      text: 'You want to walk from A to B along the streets, always heading right or up so the route is as short as possible. Here B is 4 blocks right and 3 blocks up. One such route is drawn. How many are there in all?',
      visual: streets(4, 3, { route: 'RRURUUR' }),
    },
    {
      text: 'Describe a route by writing R for each block right and U for each block up. The route shown is RRURUUR. Every shortest route uses exactly four Rs and three Us, in some order, and every such word is a route. So counting routes means counting 7-letter words with four Rs and three Us.',
    },
    {
      text: 'To build such a word, choose which 3 of the 7 positions hold the Us. The rest are forced to be Rs. That is a combination.',
      visual: working([
        { label: 'Letters', text: '4 + 3 = 7' },
        { label: 'Choose spots for U', text: 'C(7, 3) = (7 × 6 × 5) ÷ (3 × 2 × 1)' },
        { label: 'Routes', text: '35' },
      ]),
    },
    {
      text: 'If the route must pass through a corner P, break the trip in two: A to P, then P to B. Each leg is its own small grid, and since any first leg can be paired with any second leg, you multiply.',
      visual: streets(4, 3, { marks: [{ at: [2, 1], name: 'P' }], route: 'RURRUUR' }),
    },
    {
      text: 'Here P is 2 right and 1 up from A, giving C(3, 1) = 3 ways. From P, B is 2 right and 2 up: C(4, 2) = 6 ways. So 3 × 6 = 18 routes pass through P. And if you must AVOID P? Count them all and subtract: 35 − 18 = 17.',
    },
  ],
  rungs: [
    {
      id: 'grid_paths/count',
      idea: 'A route is a word of Rs and Us',
      buildsOn: 'combinations/choose',
      generate: rng => {
        const w = int(rng, 3, 6);
        const h = int(rng, 2, Math.min(5, w));
        const total = choose(w + h, h);
        return {
          prompt: `B is ${blocks(w)} east and ${blocks(h)} north of A. Walking only east or north along the streets, how many different routes lead from A to B?`,
          visual: streets(w, h),
          answer: { kind: 'number', value: total },
          hints: [
            `Every route is a word with ${w} Rs and ${h} Us. How long is the word?`,
            `Choose which ${h} of the ${w + h} positions are Us: C(${w + h}, ${h}).`,
          ],
          solution: [
            { text: `Each route is ${w + h} blocks long: ${w} to the right and ${h} up, in some order. Choosing where the ${h} "up" blocks fall determines the route.` },
            { text: 'Count the choices.', visual: working([{ label: 'Positions', text: `${w} + ${h} = ${w + h}` }, { label: 'Routes', text: cWork(w + h, h) }]) },
          ],
        };
      },
    },
    {
      id: 'grid_paths/through',
      idea: 'Through a point: multiply the two legs',
      buildsOn: 'grid_paths/count',
      generate: rng => {
        const w = int(rng, 4, 6);
        const h = int(rng, 3, 5);
        const px = int(rng, 1, w - 1);
        const py = int(rng, 1, h - 1);
        const [leg1, leg2] = [choose(px + py, py), choose(w - px + h - py, h - py)];
        return {
          prompt: `B is ${blocks(w)} east and ${blocks(h)} north of A. Corner P is ${blocks(px)} east and ${blocks(py)} north of A. Walking only east or north, how many routes from A to B pass through P?`,
          visual: streets(w, h, { marks: [{ at: [px, py], name: 'P' }] }),
          answer: { kind: 'number', value: leg1 * leg2 },
          hints: [
            'Split the trip: A to P, then P to B. Count each leg separately.',
            `From P, B is ${blocks(w - px)} east and ${blocks(h - py)} north.`,
          ],
          solution: [
            {
              text: 'Count each leg as its own grid problem, then multiply, since any first leg can be followed by any second leg.',
              visual: working([
                { label: 'A to P', text: `${px} right, ${py} up: ${cWork(px + py, py)}` },
                { label: 'P to B', text: `${w - px} right, ${h - py} up: ${cWork(w - px + h - py, h - py)}` },
                { label: 'Multiply', text: `${leg1} × ${leg2} = ${fmt(leg1 * leg2)}` },
              ]),
            },
          ],
        };
      },
    },
    {
      id: 'grid_paths/avoid',
      idea: 'Avoiding a point: subtract',
      buildsOn: 'complementary/not',
      generate: rng => {
        const w = int(rng, 4, 6);
        const h = int(rng, 3, 4);
        const px = int(rng, 1, w - 1);
        const py = int(rng, 1, h - 1);
        const total = choose(w + h, h);
        const [leg1, leg2] = [choose(px + py, py), choose(w - px + h - py, h - py)];
        return {
          prompt: `B is ${blocks(w)} east and ${blocks(h)} north of A. The corner P, which is ${blocks(px)} east and ${blocks(py)} north of A, is closed for construction. Walking only east or north, how many routes from A to B avoid P?`,
          visual: streets(w, h, { marks: [{ at: [px, py], name: 'P' }] }),
          answer: { kind: 'number', value: total - leg1 * leg2 },
          hints: [
            'Routes that avoid P are hard to count directly. Count all routes, then remove the ones through P.',
            `All routes: C(${w + h}, ${h}) = ${total}. Routes through P: (A to P) × (P to B).`,
          ],
          solution: [
            {
              text: 'Complementary counting: every route minus the routes that hit P.',
              visual: working([
                { label: 'All routes', text: cWork(w + h, h) },
                { label: 'A to P', text: cWork(px + py, py) },
                { label: 'P to B', text: cWork(w - px + h - py, h - py) },
                { label: 'Through P', text: `${leg1} × ${leg2} = ${leg1 * leg2}` },
                { label: 'Avoiding P', text: `${total} − ${leg1 * leg2} = ${total - leg1 * leg2}` },
              ]),
            },
          ],
        };
      },
    },
    {
      id: 'grid_paths/closed-block',
      idea: 'A closed street is a forced pair of corners',
      buildsOn: 'grid_paths/avoid',
      generate: rng => {
        const w = int(rng, 4, 6);
        const h = int(rng, 3, 4);
        const x = int(rng, 1, w - 2);
        const y = int(rng, 1, h - 1);
        const total = choose(w + h, h);
        const [leg1, leg2] = [choose(x + y, y), choose(w - x - 1 + h - y, h - y)];
        return {
          prompt: `B is ${blocks(w)} east and ${blocks(h)} north of A. The single block of street running east from corner X to corner Y is closed, though both corners are open. X is ${blocks(x)} east and ${blocks(y)} north of A. Walking only east or north, how many routes from A to B are still possible?`,
          visual: streets(w, h, { marks: [{ at: [x, y], name: 'X' }, { at: [x + 1, y], name: 'Y' }] }),
          answer: { kind: 'number', value: total - leg1 * leg2 },
          hints: [
            'Count the routes that USE the closed block, and subtract them from all routes.',
            'A route uses the block exactly when it goes A to X, steps east to Y, then goes Y to B.',
          ],
          solution: [
            { text: 'A route is ruined only if it walks along the closed block. Such a route reaches X, takes the one forced step to Y, and continues to B.' },
            {
              text: 'Count those and subtract.',
              visual: working([
                { label: 'All routes', text: cWork(w + h, h) },
                { label: 'A to X', text: cWork(x + y, y) },
                { label: 'X to Y', text: '1 way' },
                { label: 'Y to B', text: `${w - x - 1} right, ${h - y} up: ${cWork(w - x - 1 + h - y, h - y)}` },
                { label: 'Using the block', text: `${leg1} × 1 × ${leg2} = ${leg1 * leg2}` },
                { label: 'Still possible', text: `${total} − ${leg1 * leg2} = ${total - leg1 * leg2}` },
              ]),
            },
            { text: 'Routes that pass through X and then turn north are fine, which is why this is not the same as closing the corner X.' },
          ],
        };
      },
    },
  ],
};

// ── Sticks & Stones ──────────────────────────────────────────────────────────

/** A row of stones (●) split by sticks (|): groupsRow([2, 0, 3]) → "● ● | | ● ● ●" */
const groupsRow = (groups: number[]) => groups.map(g => Array(g).fill('●').join(' ')).join(' | ').replace(/\s+/g, ' ').trim();

const KIDS = ['Ava', 'Ben', 'Cal', 'Dee', 'Eli'];

const starsBars: Lesson = {
  topic: 'stars_bars',
  intro: [
    {
      text: 'Seven identical cookies are to be shared among Ava, Ben and Cal. Someone might get none. How many ways? The cookies are identical, so all that matters is HOW MANY each child gets, such as 2, 4, 1 or 0, 0, 7. Listing these by hand is slow and error-prone.',
    },
    {
      text: 'Here is the trick. Lay the 7 cookies (stones) in a row and drop in 2 dividers (sticks) to cut the row into 3 sections: Ava\'s, Ben\'s, Cal\'s. Every way of sharing is a picture like these, and every picture is a way of sharing.',
      visual: working([
        { label: '2, 4, 1', text: groupsRow([2, 4, 1]) },
        { label: '3, 0, 4', text: groupsRow([3, 0, 4]) },
        { label: '0, 0, 7', text: groupsRow([0, 0, 7]) },
      ]),
    },
    {
      text: 'So count the pictures. Each is a row of 9 symbols, 7 stones and 2 sticks, and it is determined by which 2 of the 9 positions hold sticks. That is C(9, 2) = 36 ways. In general, n identical things to k people takes k − 1 sticks: C(n + k − 1, k − 1).',
    },
    {
      text: 'What if every child must get at least one cookie? Hand each child one cookie first. That uses 3, with no choice involved. Then share the remaining 4 freely: 4 stones and 2 sticks, C(6, 2) = 15 ways. "Pay the minimums first" handles any requirement of this kind.',
      visual: working([
        { label: 'Pay minimums', text: '7 − 3 = 4 cookies left' },
        { label: 'Share freely', text: '4 stones, 2 sticks' },
        { label: 'Ways', text: 'C(6, 2) = 15' },
      ]),
    },
    {
      text: 'The same count shows up in disguise all the time: solutions to a + b + c = 7 in whole numbers, ways to buy 7 donuts from 3 flavors, digits that add up to 7. Whenever identical units are being split among labelled boxes, think sticks and stones.',
    },
  ],
  rungs: [
    {
      id: 'stars_bars/distribute',
      idea: 'Stones and sticks in a row',
      buildsOn: 'combinations/choose',
      generate: rng => {
        const k = int(rng, 3, 4);
        const n = int(rng, 4, k === 3 ? 12 : 9);
        const thing = pick(rng, ['cookies', 'stickers', 'marbles', 'pencils', 'coins']);
        const total = choose(n + k - 1, k - 1);
        const example = k === 3 ? [n - 1, 0, 1] : [n - 2, 0, 1, 1];
        return {
          prompt: `In how many ways can ${n} identical ${thing} be shared among ${k} children, if some children may get none?`,
          answer: { kind: 'number', value: total },
          hints: [
            `Line up the ${n} ${thing} and use sticks to split the row into ${k} sections. How many sticks?`,
            `${n} stones and ${k - 1} sticks make a row of ${n + k - 1}. Choose where the sticks go.`,
          ],
          solution: [
            {
              text: `Put the ${n} ${thing} in a row and cut it into ${k} sections with ${k - 1} sticks. For example, giving ${example.join(', ')}:`,
              visual: working([{ label: example.join(', '), text: groupsRow(example) }]),
            },
            {
              text: 'Each sharing is one arrangement of stones and sticks, so count the arrangements.',
              visual: working([
                { label: 'Symbols', text: `${n} stones + ${k - 1} sticks = ${n + k - 1}` },
                { label: 'Place the sticks', text: cWork(n + k - 1, k - 1) },
              ]),
            },
          ],
        };
      },
    },
    {
      id: 'stars_bars/at-least-one',
      idea: 'Pay the minimums first',
      buildsOn: 'stars_bars/distribute',
      generate: rng => {
        const k = int(rng, 3, 4);
        const thing = pick(rng, ['cookies', 'stickers', 'marbles', 'pencils', 'coins']);
        if (rng() < 0.55) {
          const n = int(rng, k + 3, k === 3 ? 14 : 11);
          const total = choose(n - 1, k - 1);
          return {
            prompt: `In how many ways can ${n} identical ${thing} be shared among ${k} children, if every child must get at least one?`,
            answer: { kind: 'number', value: total },
            hints: [
              `Give each child one of the ${thing} first. That step involves no choice. How many are left?`,
              `Share the remaining ${n - k} freely: ${n - k} stones and ${k - 1} sticks.`,
            ],
            solution: [
              {
                text: 'Hand out the required ones first, then share what is left with no restrictions.',
                visual: working([
                  { label: 'Pay minimums', text: `${n} − ${k} = ${n - k} left` },
                  { label: 'Symbols', text: `${n - k} stones + ${k - 1} sticks = ${n - 1}` },
                  { label: 'Ways', text: cWork(n - 1, k - 1) },
                ]),
              },
              { text: `Another way to see C(${n - 1}, ${k - 1}): the ${n} ${thing} in a row have ${n - 1} gaps between them, and you choose ${k - 1} different gaps for the sticks, so no section is empty.` },
            ],
          };
        }
        const mins = Array.from({ length: k }, () => int(rng, 0, 3));
        if (mins.every(m => m <= 1)) mins[0] = 2;
        const used = mins.reduce((a, b) => a + b, 0);
        const left = int(rng, 3, k === 3 ? 8 : 6);
        const n = used + left;
        const total = choose(left + k - 1, k - 1);
        const needs = mins.map((m, i) => (m === 0 ? null : `${KIDS[i]} must get at least ${m}`)).filter(Boolean);
        return {
          prompt: `${n} identical ${thing} are shared among ${KIDS.slice(0, k - 1).join(', ')} and ${KIDS[k - 1]}. ${needs.join(', ').replace(/, ([^,]*)$/, ' and $1')}${mins.includes(0) ? '; anyone else may get none' : ''}. In how many ways can this be done?`,
          answer: { kind: 'number', value: total },
          hints: [
            `Hand out the required ${thing} first: ${mins.filter(m => m > 0).join(' + ')} = ${used}.`,
            `Then share the remaining ${left} among all ${k} with no restrictions.`,
          ],
          solution: [
            {
              text: 'The required amounts involve no choice, so set them aside. What is left is an unrestricted sharing problem.',
              visual: working([
                { label: 'Pay minimums', text: `${n} − ${used} = ${left} left` },
                { label: 'Symbols', text: `${left} stones + ${k - 1} sticks = ${left + k - 1}` },
                { label: 'Ways', text: cWork(left + k - 1, k - 1) },
              ]),
            },
          ],
        };
      },
    },
    {
      id: 'stars_bars/equations',
      idea: 'Whole-number solutions to an equation',
      buildsOn: 'stars_bars/at-least-one',
      generate: rng => {
        const k = int(rng, 3, 4);
        const vars = ['a', 'b', 'c', 'd'].slice(0, k);
        const positive = rng() < 0.5;
        const n = positive ? int(rng, k + 3, k === 3 ? 15 : 12) : int(rng, 5, k === 3 ? 12 : 9);
        const total = positive ? choose(n - 1, k - 1) : choose(n + k - 1, k - 1);
        return {
          prompt: `How many ordered ${k === 3 ? 'triples' : 'quadruples'} (${vars.join(', ')}) of ${positive ? 'positive' : 'non-negative'} integers satisfy ${vars.join(' + ')} = ${n}?`,
          answer: { kind: 'number', value: total },
          hints: [
            `Think of ${n} as ${n} identical stones being split among ${k} labelled boxes named ${vars.join(', ')}.`,
            positive
              ? `Positive means each box gets at least one. Put one stone in each, leaving ${n - k} to share freely.`
              : 'Non-negative means a box may be empty, so this is the unrestricted count.',
          ],
          solution: [
            { text: `A solution is a way of splitting ${n} units among ${k} variables, which is a sticks-and-stones count with ${k - 1} sticks.${positive ? ' Since each variable is at least 1, give each one unit first.' : ''}` },
            {
              text: 'Count the arrangements.',
              visual: working([
                ...(positive ? [{ label: 'Pay minimums', text: `${n} − ${k} = ${n - k} left` }] : []),
                { label: 'Symbols', text: `${positive ? n - k : n} stones + ${k - 1} sticks = ${positive ? n - 1 : n + k - 1}` },
                { label: 'Solutions', text: positive ? cWork(n - 1, k - 1) : cWork(n + k - 1, k - 1) },
              ]),
            },
            { text: '"Ordered" matters: (1, 2, 4) and (4, 2, 1) are different solutions, just as giving Ava 1 cookie differs from giving her 4.' },
          ],
        };
      },
    },
    {
      id: 'stars_bars/disguise',
      idea: 'Sticks and stones in disguise',
      buildsOn: 'stars_bars/equations',
      generate: rng => {
        if (rng() < 0.5) {
          const k = int(rng, 3, 5);
          const n = pick(rng, k === 5 ? [4, 5, 6] : k === 4 ? [5, 6, 8] : [6, 8, 10, 12]);
          const what = pick(rng, [
            { item: 'donuts', kind: 'flavors' },
            { item: 'balloons', kind: 'colors' },
            { item: 'scoops of ice cream', kind: 'flavors' },
          ]);
          const total = choose(n + k - 1, k - 1);
          return {
            prompt: `A shop sells ${what.item} in ${k} ${what.kind}, with plenty of each. In how many ways can you choose ${n} ${what.item}, if only the number of each ${what.kind.slice(0, -1)} matters?`,
            answer: { kind: 'number', value: total },
            hints: [
              `The ${what.kind} are the labelled boxes, and your ${n} picks are the identical stones.`,
              `${n} stones, ${k - 1} sticks. You may skip a ${what.kind.slice(0, -1)} entirely.`,
            ],
            solution: [
              { text: `A selection is described by how many of each ${what.kind.slice(0, -1)} you take: ${k} numbers that add to ${n}. That is ${n} stones split into ${k} sections.` },
              {
                text: 'Count the arrangements.',
                visual: working([
                  { label: 'Symbols', text: `${n} stones + ${k - 1} sticks = ${n + k - 1}` },
                  { label: 'Selections', text: cWork(n + k - 1, k - 1) },
                ]),
              },
              { text: `It is easy to get this backwards. The things you are CHOOSING are the stones; the ${what.kind} only decide how many sticks.` },
            ],
          };
        }
        const d = int(rng, 3, 4);
        const s = int(rng, 4, 9);
        const total = choose(s - 1 + d - 1, d - 1);
        return {
          prompt: `How many ${d}-digit positive integers have digits that add up to ${s}?`,
          answer: { kind: 'number', value: total },
          hints: [
            `The ${d} digits are boxes and the sum ${s} is ${s} stones. Which digit has a restriction?`,
            `The first digit cannot be 0, so give it one stone up front. Then share the other ${s - 1} freely among ${d} digits.`,
          ],
          solution: [
            { text: `Splitting ${s} units among ${d} digit positions is sticks and stones. The leading digit must be at least 1, so pay that minimum first. (No digit can exceed 9, since the total is only ${s}.)` },
            {
              text: 'Share what is left with no restrictions.',
              visual: working([
                { label: 'Pay minimum', text: `${s} − 1 = ${s - 1} left` },
                { label: 'Symbols', text: `${s - 1} stones + ${d - 1} sticks = ${s + d - 2}` },
                { label: 'Numbers', text: cWork(s + d - 2, d - 1) },
              ]),
            },
          ],
        };
      },
    },
  ],
};

// ── Pascal's Triangle ────────────────────────────────────────────────────────

/** Rows 0…n of Pascal's triangle, with optional shaded entries given as [row, position]. */
function triangle(n: number, shaded: [number, number][] = [], caption?: string): Visual {
  const shapes: Shape[] = [];
  for (const [r, k] of shaded) shapes.push({ type: 'circle', center: [k - r / 2, -r * 0.8], r: 0.36, fill: 'shade' });
  for (let r = 0; r <= n; r++) {
    for (let k = 0; k <= r; k++) shapes.push({ type: 'label', at: [k - r / 2, -r * 0.8], text: `${choose(r, k)}` });
  }
  return { kind: 'figure', box: [-n / 2 - 0.3, -n * 0.8 - 0.3, n / 2 + 0.3, 0.3], shapes, caption };
}

const pascal: Lesson = {
  topic: 'pascal',
  intro: [
    {
      text: 'Start with a 1. Each new row begins and ends with 1, and every number in between is the sum of the two numbers just above it. This is Pascal\'s triangle. Count the rows starting from 0, and count positions in a row starting from 0 too.',
      visual: triangle(6, [[3, 1], [3, 2], [4, 2]], 'The 6 in row 4 is the 3 + 3 above it.'),
    },
    {
      text: 'The surprise: the number at position k of row n is exactly C(n, k). Row 4 reads 1, 4, 6, 4, 1, and those are C(4, 0), C(4, 1), C(4, 2), C(4, 3), C(4, 4). So the triangle is a table of every combination you will ever need.',
    },
    {
      text: 'Why does adding the two numbers above give a combination? Choose a 2-person team from 4 people, one of whom is Alice. Either Alice is on the team, and you pick 1 more from the other 3: C(3, 1). Or she is not, and you pick both from the other 3: C(3, 2). So C(4, 2) = C(3, 1) + C(3, 2). The same argument works everywhere in the triangle.',
    },
    {
      text: 'Add up a row and you get a power of 2: row 4 sums to 1 + 4 + 6 + 4 + 1 = 16 = 2⁴. Reason: the row counts teams of every possible size from 4 people, which is all subsets, and a subset is built by 4 yes-or-no decisions, one per person.',
      visual: working([
        { label: 'Row 0', text: '1 = 2⁰' },
        { label: 'Row 1', text: '1 + 1 = 2¹' },
        { label: 'Row 2', text: '1 + 2 + 1 = 2²' },
        { label: 'Row 3', text: '1 + 3 + 3 + 1 = 2³' },
        { label: 'Row n', text: '2ⁿ' },
      ]),
    },
    {
      text: 'The rows are also the coefficients when you expand a power of a binomial: (x + y)³ = x³ + 3x²y + 3xy² + y³ uses row 3. And there is the hockey stick: run down a diagonal from the edge, then turn. The numbers along the shaft add up to the number at the turn. Here 1 + 3 + 6 + 10 = 20.',
      visual: triangle(6, [[2, 2], [3, 2], [4, 2], [5, 2], [6, 3]], '1 + 3 + 6 + 10 = 20'),
    },
  ],
  rungs: [
    {
      id: 'pascal/entries',
      idea: 'Entries are combinations',
      buildsOn: 'combinations/choose',
      generate: rng => {
        if (rng() < 0.5) {
          const n = int(rng, 7, 16);
          const k = pick(rng, [2, 2, 3]);
          const fromEnd = rng() < 0.3;
          const place = ['first', 'second', 'third', 'fourth'][k];
          return {
            prompt: `A row of Pascal's triangle begins 1, ${n}, … What is the ${place} number${fromEnd ? ' from the end' : ''} in that row?`,
            answer: { kind: 'number', value: choose(n, k) },
            hints: [
              `The second number in a row is the row number, so this is row ${n}.`,
              `The ${place} number is at position ${k} (counting from 0), so it is C(${n}, ${k}).${fromEnd ? ' Rows read the same backwards.' : ''}`,
            ],
            solution: [
              { text: `A row that starts 1, ${n} is row ${n}, whose entries are C(${n}, 0), C(${n}, 1), C(${n}, 2), …${fromEnd ? ' Each row is symmetric, so counting from the end gives the same numbers.' : ''}` },
              { text: `The ${place} entry is at position ${k}.`, visual: working([{ label: 'Entry', text: cWork(n, k) }]) },
            ],
          };
        }
        const n = int(rng, 6, 12);
        const k = int(rng, 1, Math.floor(n / 2));
        const [x, y] = [choose(n, k), choose(n, k + 1)];
        return {
          prompt: `Two neighbors in one row of Pascal's triangle are ${fmt(x)} and ${fmt(y)}. What number sits directly below and between them in the next row?`,
          answer: { kind: 'number', value: x + y },
          hints: ['How is each entry of the triangle built from the row above?', 'Add the two numbers above it.'],
          solution: [
            { text: `Every entry is the sum of the two entries above it, so the number is ${fmt(x)} + ${fmt(y)} = ${fmt(x + y)}.` },
            { text: `In combination language: C(${n}, ${k}) + C(${n}, ${k + 1}) = C(${n + 1}, ${k + 1}). You can check that C(${n + 1}, ${k + 1}) = ${fmt(choose(n + 1, k + 1))}.` },
          ],
        };
      },
    },
    {
      id: 'pascal/row-sum',
      idea: 'Rows add up to powers of 2',
      buildsOn: 'pascal/entries',
      generate: rng => {
        const variant = int(rng, 0, 2);
        const n = int(rng, 5, 11);
        if (variant === 0) {
          return {
            prompt: `What is C(${n}, 0) + C(${n}, 1) + C(${n}, 2) + … + C(${n}, ${n})?`,
            answer: { kind: 'number', value: 2 ** n },
            hints: [`These are all the entries of row ${n} of Pascal's triangle.`, `Row n adds up to 2ⁿ.`],
            solution: [
              { text: `The sum counts subsets of every size from a set of ${n} things: all of its subsets. Building a subset means making ${n} yes-or-no decisions.` },
              { text: 'Multiply the decisions.', visual: working([{ label: 'Subsets', text: `${pow(2, n)} = ${fmt(2 ** n)}` }]) },
            ],
          };
        }
        if (variant === 1) {
          const least = pick(rng, [1, 2]);
          const value = 2 ** n - 1 - (least === 2 ? n : 0);
          return {
            prompt: `A pizza shop offers ${n} toppings. How many different pizzas can be ordered with at least ${least === 1 ? 'one topping' : 'two toppings'}?`,
            answer: { kind: 'number', value },
            hints: [
              `Each topping is on or off, so there are ${pow(2, n)} possible sets of toppings, including the plain pizza.`,
              least === 1 ? 'Remove the one pizza with no toppings.' : `Remove the plain pizza and the ${n} pizzas with exactly one topping.`,
            ],
            solution: [
              {
                text: 'Count every set of toppings, then remove the ones that are too small.',
                visual: working([
                  { label: 'All sets', text: `${pow(2, n)} = ${fmt(2 ** n)}` },
                  { label: 'No toppings', text: 'C(' + n + ', 0) = 1' },
                  ...(least === 2 ? [{ label: 'One topping', text: `C(${n}, 1) = ${n}` }] : []),
                  { label: 'Left', text: least === 1 ? `${fmt(2 ** n)} − 1 = ${fmt(value)}` : `${fmt(2 ** n)} − 1 − ${n} = ${fmt(value)}` },
                ]),
              },
            ],
          };
        }
        return {
          prompt: `What is the sum of ALL the numbers in rows 0 through ${n} of Pascal's triangle?`,
          answer: { kind: 'number', value: 2 ** (n + 1) - 1 },
          hints: [`Row k sums to 2ᵏ, so you need 1 + 2 + 4 + … + ${pow(2, n)}.`, 'Powers of 2 add up to one less than the next power of 2.'],
          solution: [
            {
              text: 'Add the row sums. They form a geometric series.',
              visual: working([
                { label: 'Row sums', text: `1 + 2 + 4 + … + ${pow(2, n)}` },
                { label: 'Geometric series', text: `${pow(2, n + 1)} − 1` },
                { label: 'So', text: `${fmt(2 ** (n + 1))} − 1 = ${fmt(2 ** (n + 1) - 1)}` },
              ]),
            },
          ],
        };
      },
    },
    {
      id: 'pascal/binomial',
      idea: 'Rows are binomial coefficients',
      buildsOn: 'pascal/row-sum',
      generate: rng => {
        const n = int(rng, 4, 9);
        if (rng() < 0.5) {
          const k = int(rng, 2, n - 2);
          return {
            prompt: `When (x + y)${sup(n)} is expanded, what is the coefficient of x${n - k === 1 ? '' : sup(n - k)}y${k === 1 ? '' : sup(k)}?`,
            answer: { kind: 'number', value: choose(n, k) },
            hints: [
              `The expansion multiplies ${n} copies of (x + y). Each copy contributes an x or a y.`,
              `To get y${sup(k)}, choose which ${k} of the ${n} copies contribute the y: C(${n}, ${k}).`,
            ],
            solution: [
              { text: `Expanding (x + y)${sup(n)} means picking x or y from each of the ${n} factors and multiplying. A term with ${k} ys arises once for each way to choose which ${k} factors give a y.` },
              { text: `That count is row ${n}, position ${k} of Pascal's triangle.`, visual: working([{ label: 'Coefficient', text: cWork(n, k) }]) },
            ],
          };
        }
        const c = pick(rng, [2, 3]);
        const k = pick(rng, [1, 2]);
        const value = choose(n, k) * c ** k;
        const xp = n - k;
        return {
          prompt: `When (x + ${c})${sup(n)} is expanded, what is the coefficient of x${xp === 1 ? '' : sup(xp)}?`,
          answer: { kind: 'number', value },
          hints: [
            `To get x${sup(xp)}, ${xp} of the ${n} factors give an x and the other ${k} give${k === 1 ? 's' : ''} a ${c}.`,
            `There are C(${n}, ${k}) ways to choose which factor${k === 1 ? ' gives' : 's give'} the ${c}, and each such term carries ${k === 1 ? `a factor of ${c}` : `${c}² = ${c * c}`}.`,
          ],
          solution: [
            { text: `Each term of the expansion picks x or ${c} from each of the ${n} factors. For x${sup(xp)}, exactly ${k} factor${k === 1 ? '' : 's'} must supply the ${c}.` },
            {
              text: 'Count the ways, and do not forget the constant each one carries.',
              visual: working([
                { label: 'Ways to choose', text: cWork(n, k) },
                { label: 'Constant per term', text: `${c}${k === 1 ? '' : '²'} = ${c ** k}` },
                { label: 'Coefficient', text: `${choose(n, k)} × ${c ** k} = ${value}` },
              ]),
            },
          ],
        };
      },
    },
    {
      id: 'pascal/hockey-stick',
      idea: 'The hockey stick',
      buildsOn: 'handshakes/triangular',
      generate: rng => {
        const m = int(rng, 5, 12);
        const tri = (i: number) => (i * (i + 1)) / 2;
        const value = choose(m + 2, 3);
        if (rng() < 0.5) {
          return {
            prompt: `What is the sum of the first ${m} triangular numbers, 1 + 3 + 6 + 10 + … + ${tri(m)}?`,
            answer: { kind: 'number', value },
            hints: [
              'The triangular numbers are C(2, 2), C(3, 2), C(4, 2), … They run down one diagonal of Pascal\'s triangle.',
              `The last one, ${tri(m)}, is C(${m + 1}, 2). The hockey stick turns to the entry one row down and one place over: C(${m + 2}, 3).`,
            ],
            solution: [
              { text: `Triangular numbers form a diagonal of Pascal's triangle: 1 = C(2, 2), 3 = C(3, 2), 6 = C(4, 2), up to ${tri(m)} = C(${m + 1}, 2).` },
              {
                text: 'A sum down a diagonal equals the entry at the turn of the hockey stick.',
                visual: working([
                  { label: 'Hockey stick', text: `C(2, 2) + C(3, 2) + … + C(${m + 1}, 2) = C(${m + 2}, 3)` },
                  { label: 'Evaluate', text: cWork(m + 2, 3) },
                ]),
              },
            ],
          };
        }
        return {
          prompt: `Oranges are stacked in a triangular pyramid with ${m} layers. The top layer has 1 orange, the next has 3, the next has 6, and so on, each layer a triangle with one more orange along its side. How many oranges are in the stack?`,
          answer: { kind: 'number', value },
          hints: [
            `The layers are the triangular numbers 1, 3, 6, …, ${tri(m)}.`,
            `Triangular numbers are C(2, 2), C(3, 2), …, C(${m + 1}, 2). Their sum is a hockey stick ending at C(${m + 2}, 3).`,
          ],
          solution: [
            { text: `Layer k holds the kth triangular number, C(k + 1, 2). The bottom layer holds C(${m + 1}, 2) = ${tri(m)}.` },
            {
              text: 'Add the layers with the hockey stick identity.',
              visual: working([
                { label: 'Layers', text: `C(2, 2) + C(3, 2) + … + C(${m + 1}, 2)` },
                { label: 'Hockey stick', text: `C(${m + 2}, 3)` },
                { label: 'Evaluate', text: cWork(m + 2, 3) },
              ]),
            },
          ],
        };
      },
    },
  ],
};

export const COUNTING_ADVANCED_LESSONS: Lesson[] = [gridPaths, starsBars, pascal];
