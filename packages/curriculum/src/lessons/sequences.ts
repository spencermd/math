// Realm II: Algebra — arithmetic sequences and series, geometric sequences.
import type { Lesson } from './types.ts';
import { fmt, frac, int, linear, neg, pick, plus, pow, reduce, sup, working } from './util.ts';

const ordinal = (n: number) => {
  const tail = n % 100;
  const suffix = tail >= 11 && tail <= 13 ? 'th' : ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th'][n % 10];
  return `${fmt(n)}${suffix}`;
};

/** "7, 11, 15, …" */
const startOf = (a: number, d: number, shown = 3) => `${Array.from({ length: shown }, (_, i) => neg(a + i * d)).join(', ')}, …`;

/** Parenthesize a negative number for use after an operator. */
const par = (n: number) => (n < 0 ? `(${neg(n)})` : fmt(n));

// ── Arithmetic Sequences ─────────────────────────────────────────────────────

const arithSequences: Lesson = {
  topic: 'arith_sequences',
  intro: [
    {
      text: 'An arithmetic sequence goes up (or down) by the same amount every time. That amount is the common difference. In 5, 8, 11, 14, … the common difference is 3. To reach the 100th term you do not need the 99 terms before it. You need to know how many STEPS it takes to get there.',
      visual: working([
        { label: '1st term', text: '5' },
        { label: '2nd term', text: '5 + 1 step = 8' },
        { label: '3rd term', text: '5 + 2 steps = 11' },
        { label: '100th term', text: '5 + 99 steps = 5 + 99 × 3 = 302' },
      ]),
    },
    {
      text: 'Notice it is 99 steps, not 100. Getting to the nth term takes n − 1 steps, because the first term costs no steps at all. This off-by-one is the single most common mistake in sequence problems, so say "steps" to yourself every time.',
    },
    {
      text: 'The same thinking runs backwards. Which term of 5, 8, 11, … is 152? Count the steps from the first term: (152 − 5) ÷ 3 = 49 steps. Forty-nine steps after the 1st term is the 50th term.',
      visual: working([
        { label: 'Distance to cover', text: '152 − 5 = 147' },
        { label: 'Steps', text: '147 ÷ 3 = 49' },
        { label: 'Term number', text: '49 + 1 = 50th' },
      ]),
    },
    {
      text: 'Two terms pin down the whole sequence. If the 4th term is 19 and the 10th term is 43, then 6 steps cover 24, so each step is 4. From there you can walk to any term you like: the 1st is 19 − 3 × 4 = 7.',
    },
    {
      text: 'One more gift: terms of an arithmetic sequence balance around the middle. The term halfway between two others is their average. So if the 3rd and 9th terms add to 50, the 6th term is 25, and you never need the common difference.',
    },
  ],
  rungs: [
    {
      id: 'arith_sequences/nth-term',
      idea: 'Count steps, not terms',
      buildsOn: 'equations/translate',
      generate: rng => {
        const a = int(rng, -15, 40);
        const d = pick(rng, [-9, -7, -6, -5, -4, -3, -2, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12]);
        const n = int(rng, 15, 100);
        const value = a + (n - 1) * d;
        return {
          prompt: `What is the ${ordinal(n)} term of the arithmetic sequence ${startOf(a, d)}?`,
          answer: { kind: 'number', value },
          hints: [
            `The common difference is ${neg(a + d)} − ${par(a)} = ${neg(d)}.`,
            `The ${ordinal(n)} term is ${n - 1} steps after the first, not ${n}.`,
          ],
          solution: [
            {
              text: `Each term ${d > 0 ? 'adds' : 'subtracts'} ${Math.abs(d)}. Reaching the ${ordinal(n)} term takes ${n - 1} steps from the first.`,
              visual: working([
                { label: 'Common difference', text: neg(d) },
                { label: 'Steps', text: `${n} − 1 = ${n - 1}` },
                { label: `${ordinal(n)} term`, text: `${neg(a)} + ${n - 1} × ${par(d)} = ${neg(a)} ${plus((n - 1) * d)} = ${neg(value)}` },
              ]),
            },
          ],
        };
      },
    },
    {
      id: 'arith_sequences/which-term',
      idea: 'Which term is it?',
      buildsOn: 'counting_lists/arithmetic',
      generate: rng => {
        if (rng() < 0.6) {
          const a = int(rng, 2, 30);
          const d = int(rng, 3, 12);
          const n = int(rng, 20, 90);
          const target = a + (n - 1) * d;
          return {
            prompt: `The number ${fmt(target)} is in the arithmetic sequence ${startOf(a, d)} Which term is it? (Answer 10 if it is the 10th term.)`,
            answer: { kind: 'number', value: n },
            hints: [
              `How many steps of ${d} does it take to get from ${a} to ${fmt(target)}?`,
              `(${fmt(target)} − ${a}) ÷ ${d} = ${n - 1} steps. The term number is one more than the number of steps.`,
            ],
            solution: [
              {
                text: 'Count the steps from the first term, then add 1 for the first term itself.',
                visual: working([
                  { label: 'Distance', text: `${fmt(target)} − ${a} = ${fmt(target - a)}` },
                  { label: 'Steps', text: `${fmt(target - a)} ÷ ${d} = ${n - 1}` },
                  { label: 'Term number', text: `${n - 1} + 1 = ${n}` },
                ]),
              },
            ],
          };
        }
        const a = int(rng, 60, 250);
        const d = int(rng, 3, 9);
        const steps = Math.floor(a / d) + 1;
        const n = steps + 1;
        return {
          prompt: `The arithmetic sequence ${startOf(a, -d)} keeps decreasing. Which term is the first one that is negative? (Answer 10 if it is the 10th term.)`,
          answer: { kind: 'number', value: n },
          hints: [
            `Each step subtracts ${d}. How many steps until more than ${a} has been subtracted?`,
            `${a} ÷ ${d} = ${a % d === 0 ? a / d : `${Math.floor(a / d)} remainder ${a % d}`}, so ${steps - 1} steps ${a % d === 0 ? 'lands exactly on 0' : 'is not quite enough'}. Take one more, and remember steps + 1 = term number.`,
          ],
          solution: [
            {
              text: `After k steps the term is ${a} − ${d}k. It turns negative once ${d}k is more than ${a}.`,
              visual: working([
                { label: `${steps - 1} steps`, text: `${a} − ${d} × ${steps - 1} = ${a - d * (steps - 1)}${a % d === 0 ? ' (zero is not negative)' : ' (still positive)'}` },
                { label: `${steps} steps`, text: `${a} − ${d} × ${steps} = ${neg(a - d * steps)}` },
                { label: 'Term number', text: `${steps} + 1 = ${n}` },
              ]),
            },
          ],
        };
      },
    },
    {
      id: 'arith_sequences/two-terms',
      idea: 'Two terms determine the sequence',
      buildsOn: 'arith_sequences/which-term',
      generate: rng => {
        const d = pick(rng, [-6, -5, -4, -3, -2, 2, 3, 4, 5, 6, 7, 8]);
        const i = int(rng, 3, 8);
        const j = i + int(rng, 3, 9);
        const a = int(rng, -10, 30) - (d < 0 ? d * 20 : 0);
        const at = (k: number) => a + (k - 1) * d;
        const first = rng() < 0.4;
        const k = first ? 1 : j + int(rng, 5, 30);
        return {
          prompt: `In an arithmetic sequence, the ${ordinal(i)} term is ${neg(at(i))} and the ${ordinal(j)} term is ${neg(at(j))}. What is the ${first ? 'first' : ordinal(k)} term?`,
          answer: { kind: 'number', value: at(k) },
          hints: [
            `From the ${ordinal(i)} term to the ${ordinal(j)} term is ${j - i} steps, and the value changes by ${neg(at(j) - at(i))}.`,
            `Each step is ${neg(at(j) - at(i))} ÷ ${j - i} = ${neg(d)}. Now walk from a term you know to the one you want.`,
          ],
          solution: [
            {
              text: 'Find the size of one step, then walk to the term you want.',
              visual: working([
                { label: 'Steps between', text: `${j} − ${i} = ${j - i}` },
                { label: 'Change', text: `${neg(at(j))} − ${par(at(i))} = ${neg(at(j) - at(i))}` },
                { label: 'One step', text: `${neg(at(j) - at(i))} ÷ ${j - i} = ${neg(d)}` },
                first
                  ? { label: 'Walk back', text: `${i - 1} steps before the ${ordinal(i)} term: ${neg(at(i))} − ${i - 1} × ${par(d)} = ${neg(at(1))}` }
                  : { label: 'Walk forward', text: `${k - j} steps after the ${ordinal(j)} term: ${neg(at(j))} + ${k - j} × ${par(d)} = ${neg(at(k))}` },
              ]),
            },
          ],
        };
      },
    },
    {
      id: 'arith_sequences/middle',
      idea: 'The middle term is the average',
      buildsOn: 'arith_sequences/two-terms',
      generate: rng => {
        if (rng() < 0.5) {
          const d = pick(rng, [-5, -4, -3, 2, 3, 4, 5, 6, 7]);
          const a = int(rng, 5, 60);
          const mid = int(rng, 5, 14);
          const off = int(rng, 2, mid - 2);
          const at = (k: number) => a + (k - 1) * d;
          const total = at(mid - off) + at(mid + off);
          return {
            prompt: `In an arithmetic sequence, the ${ordinal(mid - off)} term and the ${ordinal(mid + off)} term add up to ${neg(total)}. What is the ${ordinal(mid)} term?`,
            answer: { kind: 'number', value: at(mid) },
            hints: [
              `The ${ordinal(mid)} term is exactly halfway between the ${ordinal(mid - off)} and the ${ordinal(mid + off)}.`,
              'A term halfway between two others is their average.',
            ],
            solution: [
              { text: `The ${ordinal(mid)} term is ${off} steps after the ${ordinal(mid - off)} and ${off} steps before the ${ordinal(mid + off)}. One is the middle term minus ${off} steps, the other is the middle term plus ${off} steps, so the steps cancel when you add them.` },
              {
                text: 'So the two given terms add up to twice the middle term.',
                visual: working([
                  { label: 'Twice the middle', text: neg(total) },
                  { label: `${ordinal(mid)} term`, text: `${neg(total)} ÷ 2 = ${neg(at(mid))}` },
                ]),
              },
              { text: 'The common difference was never needed, which is lucky, because there is not enough information to find it.' },
            ],
          };
        }
        const x = int(rng, 2, 9);
        const p2 = int(rng, 2, 5);
        const p1 = int(rng, 1, 2);
        const D = rng() < 0.5 ? 1 : -1;
        const p3 = 2 * p2 - p1 - D;
        const q1 = int(rng, -5, 9);
        const q2 = int(rng, -5, 9);
        const q3 = D * x + 2 * q2 - q1;
        const t = [p1 * x + q1, p2 * x + q2, p3 * x + q3];
        return {
          prompt: `The expressions ${linear(p1, q1)}, ${linear(p2, q2)} and ${linear(p3, q3)} are, in that order, three consecutive terms of an arithmetic sequence. What is x?`,
          answer: { kind: 'number', value: x },
          hints: [
            'The middle term is the average of its neighbors, so twice the middle equals the sum of the outer two.',
            `2(${linear(p2, q2)}) = (${linear(p1, q1)}) + (${linear(p3, q3)}).`,
          ],
          solution: [
            {
              text: 'Twice the middle term equals the sum of the other two.',
              visual: working([
                { label: 'Set up', text: `2(${linear(p2, q2)}) = (${linear(p1, q1)}) + (${linear(p3, q3)})` },
                { label: 'Expand', text: `${linear(2 * p2, 2 * q2)} = ${linear(p1 + p3, q1 + q3)}` },
                { label: 'Solve', text: `x = ${x}` },
              ]),
            },
            { text: `Check: the terms are ${t.map(neg).join(', ')}, with common difference ${neg(t[1] - t[0])}.` },
          ],
        };
      },
    },
  ],
};

// ── Arithmetic Series ────────────────────────────────────────────────────────

const arithSeries: Lesson = {
  topic: 'arith_series',
  intro: [
    {
      text: 'A series is a sequence added up. The famous story: young Gauss was told to add 1 + 2 + 3 + … + 100 and had the answer in seconds. He paired the first number with the last, the second with the second-to-last, and so on. Every pair makes the same total.',
      visual: { kind: 'pairs', from: 1, to: 10 },
    },
    {
      text: 'For 1 to 100 there are 50 pairs that each make 101, so the sum is 50 × 101 = 5,050. In general 1 + 2 + … + n = n(n + 1)/2. These are the triangular numbers you met with handshakes.',
    },
    {
      text: 'Pairing works for ANY arithmetic series, because moving one step in from each end adds the common difference on one side and removes it on the other. That gives the one formula worth knowing: sum = (average of first and last) × (number of terms).',
      visual: working([
        { label: 'Series', text: '7 + 11 + 15 + … + 83' },
        { label: 'Average of ends', text: '(7 + 83) ÷ 2 = 45' },
        { label: 'Number of terms', text: '(83 − 7) ÷ 4 + 1 = 20' },
        { label: 'Sum', text: '45 × 20 = 900' },
      ]),
    },
    {
      text: 'The hard part is almost always the number of terms. Count steps and add one, exactly as in the last lesson. If the count is wrong, everything is wrong.',
    },
    {
      text: 'One special case is worth memorizing. The sum of the first n odd numbers is n². You can see why: each odd number wraps an L-shaped border around a square to make the next bigger square. So 1 + 3 + 5 + … + 19, which has 10 terms, is 10² = 100.',
      visual: {
        kind: 'figure',
        box: [0, 0, 4, 4],
        shapes: [
          { type: 'polygon', points: [[0, 0], [4, 0], [4, 4], [0, 4]] },
          { type: 'polygon', points: [[0, 3], [1, 3], [1, 4], [0, 4]], fill: 'shade' },
          { type: 'polygon', points: [[0, 1], [3, 1], [3, 4], [2, 4], [2, 2], [0, 2]], fill: 'shade' },
          ...[1, 2, 3].flatMap(k => [
            { type: 'segment' as const, from: [k, 0] as [number, number], to: [k, 4] as [number, number] },
            { type: 'segment' as const, from: [0, k] as [number, number], to: [4, k] as [number, number] },
          ]),
          { type: 'label', at: [0.5, 3.5], text: '1' },
          { type: 'label', at: [1.5, 2.5], text: '3' },
          { type: 'label', at: [2.5, 1.5], text: '5' },
          { type: 'label', at: [3.5, 0.5], text: '7' },
        ],
        caption: '1 + 3 + 5 + 7 = 4². Each L-shaped layer is the next odd number.',
      },
    },
  ],
  rungs: [
    {
      id: 'arith_series/gauss',
      idea: 'Sums that start at 1',
      buildsOn: 'clever_calc/pairing',
      generate: rng => {
        const variant = int(rng, 0, 2);
        if (variant === 0) {
          const n = pick(rng, [20, 30, 40, 50, 60, 80, 99, 100, 120, 150, 199, 200, int(rng, 21, 99)]);
          const sum = (n * (n + 1)) / 2;
          return {
            prompt: `What is 1 + 2 + 3 + … + ${n}?`,
            answer: { kind: 'number', value: sum },
            hints: ['Average of the first and last, times how many there are.', `The average is (1 + ${n}) ÷ 2, and there are ${n} numbers.`],
            solution: [
              {
                text: 'Average of the ends, times the count.',
                visual: working([
                  { label: 'Average of ends', text: `(1 + ${n}) ÷ 2 = ${(n + 1) / 2}` },
                  { label: 'Count', text: `${n}` },
                  { label: 'Sum', text: `${(n + 1) / 2} × ${n} = ${fmt(sum)}` },
                ]),
              },
              { text: `As a formula: n(n + 1)/2 = ${n} × ${n + 1} ÷ 2. Halve whichever of the two is even before multiplying.` },
            ],
          };
        }
        const n = int(rng, 12, 60);
        const last = variant === 1 ? 2 * n - 1 : 2 * n;
        const sum = variant === 1 ? n * n : n * (n + 1);
        return {
          prompt: variant === 1 ? `What is 1 + 3 + 5 + … + ${last}?` : `What is 2 + 4 + 6 + … + ${last}?`,
          answer: { kind: 'number', value: sum },
          hints: [
            'First work out how many terms there are.',
            variant === 1
              ? `${last} is the ${ordinal(n)} odd number, since (${last} + 1) ÷ 2 = ${n}. The first n odd numbers add up to n².`
              : `Factor out a 2: this is 2 × (1 + 2 + … + ${n}).`,
          ],
          solution:
            variant === 1
              ? [
                  {
                    text: 'Count the terms, then use the fact that the first n odd numbers sum to n².',
                    visual: working([
                      { label: 'Count', text: `(${last} − 1) ÷ 2 + 1 = ${n} terms` },
                      { label: 'Sum', text: `${n}² = ${fmt(sum)}` },
                    ]),
                  },
                  { text: `The general method agrees: the average of the ends is (1 + ${last}) ÷ 2 = ${n}, and there are ${n} terms, so the sum is ${n} × ${n} = ${fmt(sum)}.` },
                ]
              : [
                  {
                    text: 'Every term is even, so pull out the 2.',
                    visual: working([
                      { label: 'Factor', text: `2 × (1 + 2 + … + ${n})` },
                      { label: 'Gauss', text: `2 × ${n} × ${n + 1} ÷ 2` },
                      { label: 'Sum', text: `${n} × ${n + 1} = ${fmt(sum)}` },
                    ]),
                  },
                ],
        };
      },
    },
    {
      id: 'arith_series/any',
      idea: 'Average of the ends times the count',
      buildsOn: 'arith_sequences/which-term',
      generate: rng => {
        const a = int(rng, 2, 25);
        const d = int(rng, 2, 9);
        const n = int(rng, 10, 40);
        const last = a + (n - 1) * d;
        const sum = (n * (a + last)) / 2;
        return {
          prompt: `What is ${a} + ${a + d} + ${a + 2 * d} + … + ${last}?`,
          answer: { kind: 'number', value: sum },
          hints: [
            `How many terms? Count the steps of ${d} from ${a} to ${last}, then add 1.`,
            `There are ${n} terms. Multiply by the average of ${a} and ${last}.`,
          ],
          solution: [
            {
              text: 'Count the terms first. Then it is average times count.',
              visual: working([
                { label: 'Steps', text: `(${last} − ${a}) ÷ ${d} = ${n - 1}` },
                { label: 'Terms', text: `${n - 1} + 1 = ${n}` },
                { label: 'Average of ends', text: `(${a} + ${last}) ÷ 2 = ${(a + last) / 2}` },
                { label: 'Sum', text: `${(a + last) / 2} × ${n} = ${fmt(sum)}` },
              ]),
            },
          ],
        };
      },
    },
    {
      id: 'arith_series/story',
      idea: 'Find the last term, then add',
      buildsOn: 'arith_series/any',
      generate: rng => {
        const story = pick(rng, [
          { text: (a: number, d: number, n: number) => `A theater has ${n} rows. The front row has ${a} seats, and each row has ${d} more seats than the row in front of it. How many seats are there in all?`, unit: 'seats', a: [10, 24], d: [1, 4], n: [12, 30] },
          { text: (a: number, d: number, n: number) => `Nia saves $${a} in the first week of the year, and each week she saves $${d} more than the week before. How many dollars has she saved after ${n} weeks?`, unit: 'dollars', a: [2, 10], d: [1, 5], n: [10, 26] },
          { text: (a: number, d: number, n: number) => `Cans are stacked in ${n} layers. The top layer has ${a} cans, and each layer has ${d} more cans than the layer above it. How many cans are in the stack?`, unit: 'cans', a: [1, 6], d: [1, 4], n: [8, 20] },
          { text: (a: number, d: number, n: number) => `A runner trains for ${n} days, running ${a} laps on the first day and ${d} more laps each day than the day before. How many laps does she run altogether?`, unit: 'laps', a: [3, 10], d: [1, 3], n: [10, 21] },
        ]);
        const a = int(rng, story.a[0], story.a[1]);
        const d = int(rng, story.d[0], story.d[1]);
        const n = int(rng, story.n[0], story.n[1]);
        const last = a + (n - 1) * d;
        const sum = (n * (a + last)) / 2;
        return {
          prompt: story.text(a, d, n),
          answer: { kind: 'number', value: sum },
          hints: [
            `This is an arithmetic series with ${n} terms. You know the first term; find the last.`,
            `The last term is ${a} + ${n - 1} × ${d} = ${last}.`,
          ],
          solution: [
            {
              text: `This time the count is given and the last term is missing. It is ${n - 1} steps after the first.`,
              visual: working([
                { label: 'Last term', text: `${a} + ${n - 1} × ${d} = ${last}` },
                { label: 'Average of ends', text: `(${a} + ${last}) ÷ 2 = ${(a + last) / 2}` },
                { label: 'Sum', text: `${(a + last) / 2} × ${n} = ${fmt(sum)} ${story.unit}` },
              ]),
            },
          ],
        };
      },
    },
    {
      id: 'arith_series/hidden',
      idea: 'Series you have to build yourself',
      buildsOn: 'counting_lists/multiples',
      generate: rng => {
        if (rng() < 0.55) {
          const k = pick(rng, [3, 4, 6, 7, 8, 9, 11, 12, 13]);
          const [lo, hi] = pick(rng, [[1, 100], [1, 200], [50, 150], [100, 200], [100, 300], [10, 99]] as const);
          const first = Math.ceil(lo / k) * k;
          const last = Math.floor(hi / k) * k;
          const n = (last - first) / k + 1;
          const sum = (n * (first + last)) / 2;
          return {
            prompt: `What is the sum of all the multiples of ${k} from ${lo} to ${hi}, inclusive?`,
            answer: { kind: 'number', value: sum },
            hints: [
              `Find the smallest and largest multiples of ${k} in the range.`,
              `They run from ${first} = ${k} × ${first / k} to ${last} = ${k} × ${last / k}, so there are ${last / k} − ${first / k} + 1 = ${n} of them.`,
            ],
            solution: [
              {
                text: `The multiples of ${k} form an arithmetic sequence. Find its two ends and count it.`,
                visual: working([
                  { label: 'First', text: `${first} = ${k} × ${first / k}` },
                  { label: 'Last', text: `${last} = ${k} × ${last / k}` },
                  { label: 'Count', text: `${last / k} − ${first / k} + 1 = ${n}` },
                  { label: 'Sum', text: `(${first} + ${last}) ÷ 2 × ${n} = ${(first + last) / 2} × ${n} = ${fmt(sum)}` },
                ]),
              },
            ],
          };
        }
        const n = int(rng, 11, 62);
        const total = (n * (n + 1)) / 2;
        return {
          prompt: `If 1 + 2 + 3 + … + n = ${fmt(total)}, what is n?`,
          answer: { kind: 'number', value: n },
          hints: [
            `n(n + 1)/2 = ${fmt(total)}, so n(n + 1) = ${fmt(2 * total)}.`,
            `n and n + 1 are nearly equal, so both are close to √${fmt(2 * total)} ≈ ${Math.sqrt(2 * total).toFixed(1)}.`,
          ],
          solution: [
            {
              text: 'Use the formula backwards. You need two consecutive numbers with a known product.',
              visual: working([
                { label: 'Formula', text: `n(n + 1) ÷ 2 = ${fmt(total)}` },
                { label: 'Double', text: `n(n + 1) = ${fmt(2 * total)}` },
                { label: 'Estimate', text: `√${fmt(2 * total)} is between ${n} and ${n + 1}` },
                { label: 'Check', text: `${n} × ${n + 1} = ${fmt(2 * total)}, so n = ${n}` },
              ]),
            },
          ],
        };
      },
    },
  ],
};

// ── Geometric Sequences ──────────────────────────────────────────────────────

const geoSequences: Lesson = {
  topic: 'geo_sequences',
  intro: [
    {
      text: 'A geometric sequence multiplies by the same number every time. That multiplier is the common ratio. In 3, 6, 12, 24, … the ratio is 2. The step-counting from arithmetic sequences carries over exactly, with multiplying in place of adding: the nth term is the first term times the ratio n − 1 times.',
      visual: working([
        { label: '1st term', text: '3' },
        { label: '2nd term', text: '3 × 2' },
        { label: '3rd term', text: '3 × 2²' },
        { label: '10th term', text: '3 × 2⁹ = 3 × 512 = 1,536' },
      ]),
    },
    {
      text: 'In an arithmetic sequence the middle term is the average of its neighbors. In a geometric sequence the middle term SQUARED is the product of its neighbors. If 4, x, 36 is geometric with x positive, then x² = 4 × 36 = 144 and x = 12. This x is called the geometric mean of 4 and 36.',
    },
    {
      text: 'Adding up a geometric sequence uses a wonderful trick. Call the sum S, multiply it by the ratio, and line the two up. Almost every term appears in both, so subtracting leaves just two terms.',
      visual: working([
        { label: 'S', text: '1 + 2 + 4 + 8 + … + 512' },
        { label: '2S', text: '2 + 4 + 8 + … + 512 + 1,024' },
        { label: '2S − S', text: '1,024 − 1' },
        { label: 'So', text: 'S = 1,023' },
      ]),
    },
    {
      text: 'If the ratio is between −1 and 1, the terms shrink toward zero, and you can add up infinitely many of them. Take S = 1/2 + 1/4 + 1/8 + … Factor a 1/2 out of everything after the first term and the sum reappears inside itself: S = 1/2 + (1/2)S, so S = 1. Picture walking halfway to a wall, then half the remaining way, forever.',
      visual: { kind: 'fraction-bars', bars: [{ num: 1, den: 2 }, { num: 3, den: 4 }, { num: 7, den: 8 }, { num: 15, den: 16 }] },
    },
    {
      text: 'The same argument works for any first term a and ratio r: S = a + rS, so S = a/(1 − r). For 12 + 4 + 4/3 + …, the ratio is 1/3 and the sum is 12 ÷ (2/3) = 18.',
    },
  ],
  rungs: [
    {
      id: 'geo_sequences/nth-term',
      idea: 'Multiply by the ratio, n − 1 times',
      buildsOn: 'arith_sequences/nth-term',
      generate: rng => {
        if (rng() < 0.7) {
          const r = pick(rng, [2, 2, 3, -2]);
          const a = int(rng, 1, 7);
          const n = Math.abs(r) === 2 ? int(rng, 7, 11) : int(rng, 5, 7);
          const value = a * r ** (n - 1);
          return {
            prompt: `What is the ${ordinal(n)} term of the geometric sequence ${Array.from({ length: 3 }, (_, i) => neg(a * r ** i)).join(', ')}, …?`,
            answer: { kind: 'number', value },
            hints: [
              `The common ratio is ${neg(a * r)} ÷ ${a} = ${neg(r)}.`,
              `The ${ordinal(n)} term is ${n - 1} multiplications after the first: ${a} × ${par(r)}${sup(n - 1)}.`,
            ],
            solution: [
              {
                text: `Each term is ${neg(r)} times the one before. Reaching the ${ordinal(n)} term takes ${n - 1} multiplications.`,
                visual: working([
                  { label: 'Ratio', text: neg(r) },
                  { label: 'Steps', text: `${n} − 1 = ${n - 1}` },
                  { label: `${ordinal(n)} term`, text: `${a} × ${par(r)}${sup(n - 1)} = ${a} × ${neg(r ** (n - 1))} = ${neg(value)}` },
                ]),
              },
              ...(r < 0 ? [{ text: `With a negative ratio the signs alternate. An ${(n - 1) % 2 === 0 ? 'even' : 'odd'} number of multiplications by −2 leaves the term ${(n - 1) % 2 === 0 ? 'positive' : 'negative'}.` }] : []),
            ],
          };
        }
        const m = int(rng, 6, 10);
        const n = m + int(rng, 2, 4);
        return {
          prompt: `What is the ${ordinal(n)} term of the geometric sequence ${fmt(2 ** m)}, ${fmt(2 ** (m - 1))}, ${fmt(2 ** (m - 2))}, …? Give your answer as a fraction in lowest terms.`,
          answer: { kind: 'fraction', num: 1, den: 2 ** (n - 1 - m) },
          hints: [
            `The ratio is 1/2, and ${fmt(2 ** m)} = ${pow(2, m)}.`,
            `Halving ${m} times brings ${pow(2, m)} down to 1. You need to halve ${n - 1} times in all.`,
          ],
          solution: [
            {
              text: `Each term is half the one before, and the first term is ${pow(2, m)}.`,
              visual: working([
                { label: 'Steps', text: `${n} − 1 = ${n - 1} halvings` },
                { label: `After ${m}`, text: `${pow(2, m)} has become 1 (that is the ${ordinal(m + 1)} term)` },
                { label: `${n - 1 - m} more`, text: `1 ÷ ${pow(2, n - 1 - m)} = 1/${2 ** (n - 1 - m)}` },
              ]),
            },
          ],
        };
      },
    },
    {
      id: 'geo_sequences/mean',
      idea: 'The middle term squared is the product of its neighbors',
      buildsOn: 'geo_sequences/nth-term',
      generate: rng => {
        if (rng() < 0.5) {
          const k = pick(rng, [1, 2, 3, 5, 6, 7]);
          const u = int(rng, 1, 4);
          const v = u + int(rng, 1, 4);
          const [a, b] = [k * u * u, k * v * v];
          return {
            prompt: `The numbers ${a}, x, ${b} form a geometric sequence, and x is positive. What is x?`,
            answer: { kind: 'number', value: k * u * v },
            hints: [
              'The ratio from the first to the second equals the ratio from the second to the third: x/a = b/x.',
              `x² = ${a} × ${b} = ${fmt(a * b)}.`,
            ],
            solution: [
              {
                text: `The ratios must match: x ÷ ${a} = ${b} ÷ x. Cross-multiply.`,
                visual: working([
                  { label: 'Cross-multiply', text: `x² = ${a} × ${b} = ${fmt(a * b)}` },
                  { label: 'Positive root', text: `x = ${k * u * v}` },
                ]),
              },
              { text: `Check the ratio: ${k * u * v} ÷ ${a} = ${frac(...reduce(v, u))} and ${b} ÷ ${k * u * v} = ${frac(...reduce(v, u))}.` },
            ],
          };
        }
        const r = pick(rng, [2, 3, 4, 5]);
        const a = int(rng, 1, 6);
        const i = int(rng, 2, 3);
        const at = (n: number) => a * r ** (n - 1);
        const want = i + pick(rng, [1, 3, r <= 3 ? 4 : 3]);
        return {
          prompt: `In a geometric sequence of positive numbers, the ${ordinal(i)} term is ${fmt(at(i))} and the ${ordinal(i + 2)} term is ${fmt(at(i + 2))}. What is the ${ordinal(want)} term?`,
          answer: { kind: 'number', value: at(want) },
          hints: [
            `Two steps multiply the term by ${fmt(at(i + 2))} ÷ ${fmt(at(i))} = ${r * r}. What does one step multiply by?`,
            `r² = ${r * r} and the terms are positive, so r = ${r}.`,
          ],
          solution: [
            {
              text: 'Going from one given term to the other takes two multiplications by the ratio.',
              visual: working([
                { label: 'Two steps', text: `r² = ${fmt(at(i + 2))} ÷ ${fmt(at(i))} = ${r * r}` },
                { label: 'One step', text: `r = ${r} (terms are positive)` },
                want === i + 1
                  ? { label: `${ordinal(want)} term`, text: `${fmt(at(i))} × ${r} = ${fmt(at(want))}` }
                  : { label: `${ordinal(want)} term`, text: `${fmt(at(i + 2))} × ${pow(r, want - i - 2)} = ${fmt(at(want))}` },
              ]),
            },
            ...(want === i + 1 ? [{ text: `That middle term is the geometric mean of its neighbors: ${fmt(at(want))}² = ${fmt(at(i))} × ${fmt(at(i + 2))}.` }] : []),
          ],
        };
      },
    },
    {
      id: 'geo_sequences/sum',
      idea: 'Multiply the sum by the ratio and subtract',
      buildsOn: 'geo_sequences/mean',
      generate: rng => {
        const r = pick(rng, [2, 2, 3, 4, 5]);
        const a = pick(rng, [1, 1, 2, 3, 5]);
        const n = r === 2 ? int(rng, 7, 12) : r === 3 ? int(rng, 5, 8) : int(rng, 4, 6);
        const last = a * r ** (n - 1);
        const sum = (last * r - a) / (r - 1);
        const shown = `${a} + ${fmt(a * r)} + ${fmt(a * r * r)} + … + ${fmt(last)}`;
        return {
          prompt: `What is ${shown}? Each term is ${r} times the one before.`,
          answer: { kind: 'number', value: sum },
          hints: [
            `Call the sum S and write out ${r}S underneath it. Which terms appear in both?`,
            `${r}S − S = ${fmt(last * r)} − ${a}. Everything in between cancels.`,
          ],
          solution: [
            {
              text: `Multiply the sum by the ratio ${r}. The result is the same list shifted one place, so subtracting kills all the middle terms.`,
              visual: working([
                { label: 'S', text: shown },
                { label: `${r}S`, text: `${fmt(a * r)} + ${fmt(a * r * r)} + … + ${fmt(last)} + ${fmt(last * r)}` },
                { label: `${r}S − S`, text: `${fmt(last * r)} − ${a} = ${fmt(last * r - a)}` },
                { label: 'So', text: r === 2 ? `S = ${fmt(sum)}` : `${r - 1}S = ${fmt(last * r - a)}, and S = ${fmt(sum)}` },
              ]),
            },
            ...(r === 2 && a === 1 ? [{ text: 'Worth remembering: the powers of 2 up to some point always add to one less than the next power of 2.' }] : []),
          ],
        };
      },
    },
    {
      id: 'geo_sequences/infinite',
      idea: 'Infinitely many terms, finite sum',
      buildsOn: 'substitution/nested-radical',
      generate: rng => {
        const [p, q] = pick(rng, [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5]] as const);
        if (rng() < 0.6) {
          const a = q * q * int(rng, 1, 4);
          const [num, den] = reduce(a * q, q - p);
          return {
            prompt: `What is the sum of the infinite geometric series ${a} + ${(a * p) / q} + ${(a * p * p) / (q * q)} + …? Give a whole number or a fraction in lowest terms.`,
            answer: { kind: 'fraction', num, den },
            hints: [
              `The common ratio is ${(a * p) / q} ÷ ${a} = ${p}/${q}.`,
              `Call the sum S. Everything after the first term is ${p}/${q} of S, so S = ${a} + (${p}/${q})S.`,
            ],
            solution: [
              {
                text: `The ratio is ${p}/${q}. After the first term, the rest of the series is the whole series multiplied by ${p}/${q}.`,
                visual: working([
                  { label: 'Self-similar', text: `S = ${a} + (${p}/${q})S` },
                  { label: 'Collect S', text: `(${q - p}/${q})S = ${a}` },
                  { label: 'Solve', text: `S = ${a} × ${q}/${q - p} = ${frac(num, den)}` },
                ]),
              },
              { text: `As a formula: S = a/(1 − r) = ${a} ÷ (1 − ${p}/${q}).` },
            ],
          };
        }
        const h = (q - p) * int(rng, 2, 9);
        const total = (h * (q + p)) / (q - p);
        return {
          prompt: `A ball is dropped from a height of ${h} feet. Each time it hits the ground it bounces back up to ${p}/${q} of the height it just fell from. If it bounces forever, how many feet does it travel in total?`,
          answer: { kind: 'number', value: total },
          hints: [
            `The first drop is ${h} feet. After that, every bounce height is traveled twice: once up and once down.`,
            `The bounce heights are ${frac(...reduce(h * p, q))}, ${frac(...reduce(h * p * p, q * q))}, … They form an infinite geometric series with ratio ${p}/${q}.`,
          ],
          solution: [
            {
              text: 'Separate the first drop from the bounces. Each bounce is an up and a down of the same height.',
              visual: working([
                { label: 'First bounce height', text: `${h} × ${p}/${q} = ${frac(...reduce(h * p, q))}` },
                { label: 'Sum of bounce heights', text: `${frac(...reduce(h * p, q))} ÷ (1 − ${p}/${q}) = ${frac(...reduce(h * p, q - p))}` },
                { label: 'Up and down', text: `2 × ${frac(...reduce(h * p, q - p))} = ${(2 * h * p) / (q - p)}` },
                { label: 'Plus the first drop', text: `${h} + ${(2 * h * p) / (q - p)} = ${total} feet` },
              ]),
            },
            { text: 'The classic mistake is to forget that every bounce counts twice, or to double the first drop as well.' },
          ],
        };
      },
    },
  ],
};

export const SEQUENCE_LESSONS: Lesson[] = [arithSequences, arithSeries, geoSequences];
