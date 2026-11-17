// Realm II: Algebra — motion and work, lines, and systems of equations.
import type { Lesson, Visual } from './types.ts';
import { fmt, int, lcm, linear, neg, pick, plus, reduceSigned, sfrac, term, working } from './util.ts';

/** two(3, -2) → "3x − 2y" */
const two = (a: number, b: number, x = 'x', y = 'y') => `${term(a, x)} ${b < 0 ? '−' : '+'} ${term(Math.abs(b), y)}`;

/** "1/4 − 1/12" worked over a common denominator: "3/12 − 1/12 = 2/12 = 1/6" */
function unitFractions(a: number, b: number, sign: 1 | -1): string {
  const L = lcm(a, b);
  const top = L / a + sign * (L / b);
  return `${L / a}/${L} ${sign === 1 ? '+' : '−'} ${L / b}/${L} = ${top}/${L}${top === 1 ? '' : ` = ${sfrac(top, L)}`}`;
}

// ── Distance, Rate & Work ────────────────────────────────────────────────────

/** [a, b, t]: jobs done alone in a and b hours take t hours together, since 1/a + 1/b = 1/t. */
const WORK_TRIPLES: [number, number, number][] = [
  [3, 6, 2], [4, 12, 3], [6, 12, 4], [10, 15, 6], [12, 24, 8], [20, 30, 12],
  [6, 30, 5], [12, 36, 9], [10, 40, 8], [15, 60, 12], [8, 24, 6], [9, 18, 6], [14, 35, 10],
];

/** [out, back, average]: the average speed of a round trip is 2ab / (a + b). */
const ROUND_TRIPS: [number, number, number][] = [
  [30, 60, 40], [40, 60, 48], [20, 30, 24], [12, 24, 16], [10, 15, 12], [30, 45, 36],
  [20, 60, 30], [24, 40, 30], [15, 30, 20], [36, 45, 40], [6, 12, 8], [4, 12, 6],
];

const motionWork: Lesson = {
  topic: 'motion_work',
  intro: [
    {
      text: 'Distance = rate × time. Every motion problem is that one equation, used once for each traveler or each leg of a trip. Keep the units matched: if the speed is in miles per hour, the time has to be in hours. A cyclist rides 18 mph for 40 minutes. How far?',
      visual: working([
        { label: 'Match units', text: '40 minutes = 40/60 = 2/3 hour' },
        { label: 'd = rt', text: '18 × 2/3 = 12 miles' },
      ]),
    },
    {
      text: 'When two travelers move toward each other, the gap between them shrinks at the SUM of their speeds. When one chases the other, the gap shrinks at the DIFFERENCE. Forget the individual trips and watch the gap. Two trains 300 miles apart head toward each other at 70 mph and 80 mph.',
      visual: working([
        { label: 'Gap', text: '300 miles' },
        { label: 'Closing speed', text: '70 + 80 = 150 mph' },
        { label: 'Time to meet', text: '300 ÷ 150 = 2 hours' },
      ]),
    },
    {
      text: 'A trap worth knowing by heart: you drive to a town at 30 mph and back at 60 mph. Your average speed is NOT 45. You spend twice as long at the slow speed, so it drags the average down. Average speed always means total distance ÷ total time. Pick any convenient distance, say 60 miles each way.',
      visual: working([
        { label: 'Out', text: '60 miles at 30 mph = 2 hours' },
        { label: 'Back', text: '60 miles at 60 mph = 1 hour' },
        { label: 'Total', text: '120 miles in 3 hours' },
        { label: 'Average', text: '120 ÷ 3 = 40 mph' },
      ]),
    },
    {
      text: 'Work problems are rate problems in disguise. If Ana paints a fence in 3 hours, her rate is 1/3 of a fence per hour. Times do not add, but rates do. Ben takes 6 hours alone. Working together:',
      visual: working([
        { label: 'Ana', text: '1/3 fence per hour' },
        { label: 'Ben', text: '1/6 fence per hour' },
        { label: 'Together', text: '1/3 + 1/6 = 1/2 fence per hour' },
        { label: 'Time', text: '1 fence ÷ 1/2 = 2 hours' },
      ]),
    },
    {
      text: 'Sanity check every work answer: two people together must be faster than the faster one alone (2 hours beats Ana\'s 3), but they cannot be more than twice as fast as her. If your answer falls outside that window, a rate went in upside down.',
    },
  ],
  rungs: [
    {
      id: 'motion_work/drt',
      idea: 'd = rt with mismatched units',
      buildsOn: 'rates/unit-rate',
      generate: rng => {
        const speed = pick(rng, [12, 18, 24, 30, 36, 42, 48, 54, 60, 66, 72]);
        const minutes = pick(rng, [10, 20, 40, 50, 70, 80, 100, 110, 140]);
        const dist = (speed * minutes) / 60;
        const who = pick(rng, ['A cyclist rides', 'A bus travels', 'A boat cruises', 'A delivery van drives']);
        if (rng() < 0.5) {
          return {
            prompt: `${who} at a steady ${speed} miles per hour for ${minutes} minutes. How many miles does it cover?`,
            answer: { kind: 'number', value: dist },
            hints: [
              'The speed is per HOUR, so turn the minutes into a fraction of an hour first.',
              `${minutes} minutes is ${sfrac(minutes, 60)} of an hour.`,
            ],
            solution: [
              {
                text: 'Match the units before multiplying.',
                visual: working([
                  { label: 'Time', text: `${minutes} min = ${minutes}/60 = ${sfrac(minutes, 60)} hour` },
                  { label: 'd = rt', text: `${speed} × ${sfrac(minutes, 60)} = ${dist} miles` },
                ]),
              },
              { text: `Another way to see it: ${speed} miles per hour is ${sfrac(speed, 6)} miles every 10 minutes, and there are ${minutes / 10} ten-minute blocks.` },
            ],
          };
        }
        return {
          prompt: `${who} at a steady ${speed} miles per hour. How many minutes does it take to cover ${dist} miles?`,
          answer: { kind: 'number', value: minutes },
          hints: [
            `Time = distance ÷ rate. That gives hours: ${dist} ÷ ${speed}.`,
            'Multiply the hours by 60 to get minutes.',
          ],
          solution: [
            {
              text: 'Time is distance divided by rate. The answer comes out in hours, because the speed is per hour.',
              visual: working([
                { label: 't = d ÷ r', text: `${dist} ÷ ${speed} = ${sfrac(dist, speed)} hour` },
                { label: 'To minutes', text: `${sfrac(dist, speed)} × 60 = ${minutes} minutes` },
              ]),
            },
          ],
        };
      },
    },
    {
      id: 'motion_work/closing',
      idea: 'Watch the gap, not the travelers',
      buildsOn: 'motion_work/drt',
      generate: rng => {
        if (rng() < 0.5) {
          const a = 5 * int(rng, 6, 14);
          const b = 5 * int(rng, 6, 14);
          const t = int(rng, 2, 5);
          const gap = (a + b) * t;
          const ask = pick(rng, ['time', 'where'] as const);
          return {
            prompt:
              ask === 'time'
                ? `Two trains start ${fmt(gap)} miles apart and travel toward each other on parallel tracks, one at ${a} mph and the other at ${b} mph. After how many hours do they pass each other?`
                : `Two trains start ${fmt(gap)} miles apart and travel toward each other on parallel tracks, one at ${a} mph and the other at ${b} mph. How many miles has the ${a} mph train traveled when they pass each other?`,
            answer: { kind: 'number', value: ask === 'time' ? t : a * t },
            hints: [
              'Each hour, one train eats up some of the gap and the other eats up more. How fast does the gap shrink?',
              `The gap closes at ${a} + ${b} = ${a + b} miles per hour.`,
            ],
            solution: [
              {
                text: 'Moving toward each other, the trains close the gap at the sum of their speeds.',
                visual: working([
                  { label: 'Closing speed', text: `${a} + ${b} = ${a + b} mph` },
                  { label: 'Time to meet', text: `${fmt(gap)} ÷ ${a + b} = ${t} hours` },
                  ...(ask === 'where' ? [{ label: 'Distance', text: `${a} × ${t} = ${fmt(a * t)} miles` }] : []),
                ]),
              },
            ],
          };
        }
        const t = int(rng, 2, 5);
        const h = int(rng, 1, 3);
        const m = pick(rng, [4, 5, 6, 8, 10]);
        const a = t * m;
        const b = a + h * m;
        const story = pick(rng, [
          { first: 'Maya', second: 'her brother', verb: 'bikes', unit: 'mph' },
          { first: 'A cargo ship', second: 'a patrol boat', verb: 'sails', unit: 'mph' },
          { first: 'A truck', second: 'a car', verb: 'drives', unit: 'mph' },
        ]);
        return {
          prompt: `${story.first} leaves town and ${story.verb} at ${a} ${story.unit}. ${h === 1 ? 'One hour' : `${h} hours`} later, ${story.second} sets out from the same place along the same route at ${b} ${story.unit}. How many hours after setting out does ${story.second} catch up?`,
          answer: { kind: 'number', value: t },
          hints: [
            `How big is the head start? ${a} ${story.unit} for ${h} hour${h === 1 ? '' : 's'}.`,
            `The chaser gains ${b} − ${a} = ${b - a} miles every hour.`,
          ],
          solution: [
            {
              text: 'Find the head start, then watch it shrink at the difference of the speeds.',
              visual: working([
                { label: 'Head start', text: `${a} × ${h} = ${a * h} miles` },
                { label: 'Gain per hour', text: `${b} − ${a} = ${b - a} miles` },
                { label: 'Time to catch up', text: `${a * h} ÷ ${b - a} = ${t} hours` },
              ]),
            },
            { text: `Check: the chaser goes ${b} × ${t} = ${b * t} miles. The leader has been moving for ${t + h} hours: ${a} × ${t + h} = ${a * (t + h)} miles. Same spot.` },
          ],
        };
      },
    },
    {
      id: 'motion_work/round-trip',
      idea: 'Average speed is total distance over total time',
      buildsOn: 'motion_work/closing',
      generate: rng => {
        const [lo, hi, avg] = pick(rng, ROUND_TRIPS);
        const [out, back] = rng() < 0.5 ? [lo, hi] : [hi, lo];
        const d = lcm(lo, hi);
        const story = pick(rng, [
          `Priya travels from home to the lake at ${out} mph and returns along the same road at ${back} mph.`,
          `A ferry crosses a bay at ${out} mph and returns along the same route at ${back} mph.`,
          `A courier rides to a drop-off at ${out} mph and rides back the same way at ${back} mph.`,
        ]);
        return {
          prompt: `${story} What is the average speed for the whole round trip, in mph?`,
          answer: { kind: 'number', value: avg },
          mistakes: [
            { value: (out + back) / 2, why: 'That is halfway between the two speeds. More time is spent on the slower leg, so it counts for more.' },
          ],
          hints: [
            `It is not ${(out + back) / 2}. More TIME is spent at the slower speed.`,
            `The distance was not given, so choose one. ${d} miles each way divides nicely by both speeds.`,
          ],
          solution: [
            { text: `The distance does not matter, so pick one that both speeds divide: ${d} miles each way.` },
            {
              text: 'Average speed is total distance divided by total time.',
              visual: working([
                { label: 'Out', text: `${d} ÷ ${out} = ${d / out} hours` },
                { label: 'Back', text: `${d} ÷ ${back} = ${d / back} hours` },
                { label: 'Total', text: `${2 * d} miles in ${d / out + d / back} hours` },
                { label: 'Average', text: `${2 * d} ÷ ${d / out + d / back} = ${avg} mph` },
              ]),
            },
            { text: `Notice ${avg} is below the midpoint ${(out + back) / 2}. The slow leg takes longer, so it counts for more. (The shortcut formula is 2ab ÷ (a + b): 2 × ${out} × ${back} ÷ ${out + back} = ${avg}.)` },
          ],
        };
      },
    },
    {
      id: 'motion_work/together',
      idea: 'Rates add, times do not',
      buildsOn: 'motion_work/round-trip',
      generate: rng => {
        const [a, b, t] = pick(rng, WORK_TRIPLES);
        const variant = int(rng, 0, 2);
        const job = pick(rng, [
          { A: 'Ana', B: 'Ben', does: 'paint a fence', thing: 'fence' },
          { A: 'Kai', B: 'Lena', does: 'mow a field', thing: 'field' },
          { A: 'Rosa', B: 'Sam', does: 'stock the shelves', thing: 'job' },
          { A: 'Dev', B: 'Erin', does: 'tile a floor', thing: 'floor' },
        ]);
        if (variant === 0) {
          return {
            prompt: `${job.A} can ${job.does} in ${a} hours. ${job.B} can do the same job in ${b} hours. Working together, how many hours do they take?`,
            answer: { kind: 'number', value: t },
            hints: [
              `Turn each time into a rate: 1/${a} of the ${job.thing} per hour and 1/${b} per hour.`,
              `Add the rates: 1/${a} + 1/${b} = 1/${t}.`,
            ],
            solution: [
              {
                text: 'Times do not add. Rates do.',
                visual: working([
                  { label: 'Rates', text: `1/${a} and 1/${b} of the ${job.thing} per hour` },
                  { label: 'Together', text: `1/${a} + 1/${b} = ${unitFractions(a, b, 1)}` },
                  { label: 'Time', text: `1 ÷ 1/${t} = ${t} hours` },
                ]),
              },
              { text: `Sanity check: ${t} hours is less than the faster worker's ${a} hours, and more than half of it. Good.` },
            ],
          };
        }
        if (variant === 1) {
          return {
            prompt: `Working together, ${job.A} and ${job.B} can ${job.does} in ${t} hours. Working alone, ${job.A} takes ${a} hours. How many hours would ${job.B} take alone?`,
            answer: { kind: 'number', value: b },
            hints: [
              `Together they do 1/${t} of the ${job.thing} each hour. One of them accounts for 1/${a} of that.`,
              `Subtract: 1/${t} − 1/${a}. Use the common denominator ${lcm(t, a)}.`,
            ],
            solution: [
              {
                text: 'The combined rate is the sum of the two rates, so subtract to find the missing one.',
                visual: working([
                  { label: 'Together', text: `1/${t} of the ${job.thing} per hour` },
                  { label: job.A, text: `1/${a} per hour` },
                  { label: job.B, text: `1/${t} − 1/${a} = ${unitFractions(t, a, -1)}` },
                  { label: 'Time alone', text: `${b} hours` },
                ]),
              },
            ],
          };
        }
        // 1/t − 1/a = 1/b: a tap that fills in t hours against a drain that empties in a hours.
        return {
          prompt: `A hose can fill a pool in ${t} hours. An open drain can empty the full pool in ${a} hours. If the pool starts empty and the drain is accidentally left open, how many hours does the hose take to fill it?`,
          answer: { kind: 'number', value: b },
          hints: [
            'The drain works AGAINST the hose, so its rate is subtracted.',
            `Net rate: 1/${t} − 1/${a} of the pool per hour.`,
          ],
          solution: [
            {
              text: 'Rates that work against each other subtract.',
              visual: working([
                { label: 'Hose', text: `+1/${t} pool per hour` },
                { label: 'Drain', text: `−1/${a} pool per hour` },
                { label: 'Net', text: `1/${t} − 1/${a} = ${unitFractions(t, a, -1)}` },
                { label: 'Time', text: `${b} hours` },
              ]),
            },
            { text: `A leak that small turns a ${t}-hour job into a ${b}-hour one. Net rates can be surprisingly slow.` },
          ],
        };
      },
    },
  ],
};

// ── Lines & Slope ────────────────────────────────────────────────────────────

const lineFigure = (m: number, b: number, pts: [number, number][], box: [number, number, number, number]): Visual => {
  const [x0, y0, x1, y1] = box;
  // Clip the line to the box.
  const xs = [x0, x1, ...(m !== 0 ? [(y0 - b) / m, (y1 - b) / m] : [])]
    .filter(x => x >= x0 - 1e-9 && x <= x1 + 1e-9 && m * x + b >= y0 - 1e-9 && m * x + b <= y1 + 1e-9)
    .sort((p, q) => p - q);
  const [xa, xb] = [xs[0], xs[xs.length - 1]];
  return {
    kind: 'figure',
    box,
    grid: true,
    shapes: [
      { type: 'segment', from: [xa, m * xa + b], to: [xb, m * xb + b] },
      ...pts.flatMap(([x, y]) => [
        { type: 'point' as const, at: [x, y] as [number, number] },
        { type: 'label' as const, at: [x + 0.2, y - 0.55] as [number, number], text: `(${neg(x)}, ${neg(y)})` },
      ]),
    ],
  };
};

const lines: Lesson = {
  topic: 'lines',
  intro: [
    {
      text: 'Slope measures steepness: how far a line rises for each step to the right. Pick any two points on the line and divide the change in y by the change in x. From (0, 1) to (4, 3) the line rises 2 while running 4, so its slope is 2/4 = 1/2.',
      visual: lineFigure(0.5, 1, [[0, 1], [4, 3]], [-1, -1, 6, 5]),
    },
    {
      text: 'Subtract in the same order top and bottom, and the signs take care of themselves. A line that falls as you move right has a negative slope. Through (1, 5) and (4, −1):',
      visual: working([
        { label: 'Rise', text: '−1 − 5 = −6' },
        { label: 'Run', text: '4 − 1 = 3' },
        { label: 'Slope', text: '−6 ÷ 3 = −2' },
      ]),
    },
    {
      text: 'In y = mx + b, the slope is m and the line crosses the y-axis at b. Once you know the slope and one point, you can walk to the y-axis. Slope 2 through (3, 10): walking 3 steps left drops y by 2 each step, so b = 10 − 6 = 4, and the line is y = 2x + 4.',
    },
    {
      text: 'When a line is written as 3x + 4y = 24, the intercepts are the fastest things to find. Set y = 0 for the x-intercept (x = 8), and x = 0 for the y-intercept (y = 6). The line and the two axes fence off a right triangle with legs 8 and 6, a favorite contest question.',
      visual: {
        kind: 'figure',
        box: [-1, -1, 9, 7],
        grid: true,
        shapes: [
          { type: 'polygon', points: [[0, 0], [8, 0], [0, 6]], fill: 'shade' },
          { type: 'point', at: [8, 0] },
          { type: 'point', at: [0, 6] },
          { type: 'label', at: [8, -0.6], text: '(8, 0)' },
          { type: 'label', at: [1.1, 6.4], text: '(0, 6)' },
          { type: 'label', at: [2.4, 2], text: 'area 24' },
        ],
      },
    },
    {
      text: 'Parallel lines never meet, so they have the same slope. Perpendicular lines have slopes that are negative reciprocals: flip the fraction and change the sign. A line perpendicular to one with slope 2/3 has slope −3/2, and (2/3) × (−3/2) = −1 every time.',
    },
  ],
  rungs: [
    {
      id: 'lines/slope',
      idea: 'Slope from two points',
      buildsOn: 'equations/translate',
      generate: rng => {
        const x1 = int(rng, -6, 4);
        const y1 = int(rng, -6, 6);
        const dx = int(rng, 1, 8);
        const dy = int(rng, 1, 9) * (rng() < 0.5 ? -1 : 1);
        const [x2, y2] = [x1 + dx, y1 + dy];
        const [num, den] = reduceSigned(dy, dx);
        // Sometimes list the right-hand point first, so the subtraction order matters.
        const flip = rng() < 0.4;
        const [P, Q] = flip ? [[x2, y2], [x1, y1]] : [[x1, y1], [x2, y2]];
        return {
          prompt: `What is the slope of the line through (${neg(P[0])}, ${neg(P[1])}) and (${neg(Q[0])}, ${neg(Q[1])})? Give a whole number or a fraction in lowest terms; type a minus sign if it is negative.`,
          answer: { kind: 'fraction', num, den },
          hints: [
            'Slope = change in y ÷ change in x. Subtract in the same order for both.',
            `Change in y: ${neg(Q[1])} − ${Q[1] === P[1] ? '' : P[1] < 0 ? `(${neg(P[1])})` : P[1]} = ${neg(Q[1] - P[1])}. Now do the same for x.`,
          ],
          solution: [
            {
              text: 'Subtract the coordinates in the same order, top and bottom.',
              visual: working([
                { label: 'Rise', text: `${neg(Q[1])} − ${P[1] < 0 ? `(${neg(P[1])})` : P[1]} = ${neg(Q[1] - P[1])}` },
                { label: 'Run', text: `${neg(Q[0])} − ${P[0] < 0 ? `(${neg(P[0])})` : P[0]} = ${neg(Q[0] - P[0])}` },
                { label: 'Slope', text: `${neg(Q[1] - P[1])} ÷ ${Q[0] - P[0] < 0 ? `(${neg(Q[0] - P[0])})` : Q[0] - P[0]} = ${sfrac(dy, dx)}` },
              ]),
            },
            { text: `The line ${dy > 0 ? 'rises' : 'falls'} as you move right, so a ${dy > 0 ? 'positive' : 'negative'} slope makes sense.` },
          ],
        };
      },
    },
    {
      id: 'lines/intercepts',
      idea: 'Intercepts from ax + by = c',
      buildsOn: 'lines/slope',
      generate: rng => {
        const a = int(rng, 2, 7);
        let b = int(rng, 2, 7);
        if (b === a) b += 1;
        const k = int(rng, 1, 3) * 2;
        const c = a * b * k;
        const [xi, yi] = [c / a, c / b];
        const ask = pick(rng, ['x', 'y', 'area', 'area'] as const);
        const eq = `${a}x + ${b}y = ${c}`;
        const rows = [
          { label: 'Set y = 0', text: `${a}x = ${c}, so x = ${xi}` },
          { label: 'Set x = 0', text: `${b}y = ${c}, so y = ${yi}` },
        ];
        if (ask !== 'area') {
          return {
            prompt: `The line ${eq} crosses the ${ask}-axis at the point ${ask === 'x' ? '(k, 0)' : '(0, k)'}. What is k?`,
            answer: { kind: 'number', value: ask === 'x' ? xi : yi },
            hints: [
              `Every point on the ${ask}-axis has ${ask === 'x' ? 'y' : 'x'} = 0.`,
              `Put ${ask === 'x' ? 'y' : 'x'} = 0 into the equation and solve what is left.`,
            ],
            solution: [
              { text: `On the ${ask}-axis the other coordinate is 0.`, visual: working([ask === 'x' ? rows[0] : rows[1]]) },
            ],
          };
        }
        return {
          prompt: `The line ${eq} and the two coordinate axes form a triangle. What is its area?`,
          answer: { kind: 'number', value: (xi * yi) / 2 },
          hints: [
            'Find where the line crosses each axis. Those two points and the origin are the corners.',
            `The triangle has a right angle at the origin, with legs ${xi} and ${yi}.`,
          ],
          solution: [
            { text: 'Find both intercepts.', visual: working(rows) },
            {
              text: `The corners are (0, 0), (${xi}, 0) and (0, ${yi}): a right triangle with legs ${xi} and ${yi}. Area = ½ × ${xi} × ${yi} = ${(xi * yi) / 2}.`,
              visual: {
                kind: 'figure',
                box: [-1, -1, xi + 1, yi + 1],
                shapes: [
                  { type: 'segment', from: [-1, 0], to: [xi + 1, 0], dashed: true },
                  { type: 'segment', from: [0, -1], to: [0, yi + 1], dashed: true },
                  { type: 'polygon', points: [[0, 0], [xi, 0], [0, yi]], fill: 'shade' },
                  { type: 'label', at: [xi / 2, -0.06 * (yi + 2) - 0.2], text: `${xi}` },
                  { type: 'label', at: [-0.05 * (xi + 2) - 0.2, yi / 2], text: `${yi}` },
                ],
              },
            },
          ],
        };
      },
    },
    {
      id: 'lines/equation',
      idea: 'Slope and a point give the whole line',
      buildsOn: 'lines/intercepts',
      generate: rng => {
        const m = pick(rng, [-4, -3, -2, -1, 2, 3, 4, 5]);
        const b = int(rng, -9, 12);
        const x1 = int(rng, 1, 4);
        const x2 = x1 + int(rng, 1, 4);
        const [y1, y2] = [m * x1 + b, m * x2 + b];
        const far = x2 + int(rng, 3, 12);
        const askFar = rng() < 0.5;
        const rows = [
          { label: 'Slope', text: `(${neg(y2)} − ${y1 < 0 ? `(${neg(y1)})` : y1}) ÷ (${x2} − ${x1}) = ${neg(y2 - y1)} ÷ ${x2 - x1} = ${neg(m)}` },
          { label: 'Walk to x = 0', text: `from (${x1}, ${neg(y1)}), go left ${x1}: y changes by ${neg(-m * x1)}` },
          { label: 'y-intercept', text: `${neg(y1)} ${plus(-m * x1)} = ${neg(b)}` },
          { label: 'Line', text: `y = ${linear(m, b)}` },
        ];
        return {
          prompt: askFar
            ? `A line passes through (${x1}, ${neg(y1)}) and (${x2}, ${neg(y2)}). It also passes through (${far}, k). What is k?`
            : `A line passes through (${x1}, ${neg(y1)}) and (${x2}, ${neg(y2)}). At what value of y does it cross the y-axis?`,
          answer: { kind: 'number', value: askFar ? m * far + b : b },
          hints: [
            'Find the slope first: change in y over change in x.',
            askFar
              ? `The slope is ${neg(m)}. From x = ${x2} to x = ${far} is ${far - x2} steps to the right.`
              : `The slope is ${neg(m)}. Walk from (${x1}, ${neg(y1)}) back to x = 0, one step at a time.`,
          ],
          solution: askFar
            ? [
                { text: 'Find the slope, then walk along the line.', visual: working([rows[0], { label: `Walk to x = ${far}`, text: `${far - x2} steps right from (${x2}, ${neg(y2)}): y changes by ${neg(m)} × ${far - x2} = ${neg(m * (far - x2))}` }, { label: 'So', text: `k = ${neg(y2)} ${plus(m * (far - x2))} = ${neg(m * far + b)}` }]) },
                { text: `You never needed the full equation. For the record it is y = ${linear(m, b)}, and ${neg(m)} × ${far} ${plus(b)} = ${neg(m * far + b)}.` },
              ]
            : [{ text: 'Find the slope, then walk back to the y-axis.', visual: working(rows) }],
        };
      },
    },
    {
      id: 'lines/perpendicular',
      idea: 'Parallel and perpendicular lines',
      buildsOn: 'lines/equation',
      generate: rng => {
        const [a, b] = pick(rng, [[2, 3], [3, 2], [1, 2], [2, 1], [3, 4], [4, 3], [1, 3], [3, 1], [2, 5], [5, 2]] as const);
        const c = a * b * int(rng, 1, 4);
        const perp = rng() < 0.6;
        const k = int(rng, 1, 3) * (rng() < 0.3 ? -1 : 1);
        const y0 = int(rng, -4, 9);
        // Given line has slope −a/b. Perpendicular slope is b/a; parallel slope is −a/b.
        const x0 = perp ? a * k : b * k;
        const [sn, sd] = perp ? [b, a] : [-a, b];
        const icpt = y0 - (sn * x0) / sd;
        return {
          prompt: `Line ℓ is ${perp ? 'perpendicular' : 'parallel'} to the line ${a === 1 ? '' : a}x + ${b === 1 ? '' : b}y = ${c} and passes through (${neg(x0)}, ${neg(y0)}). At what value of y does ℓ cross the y-axis?`,
          answer: { kind: 'number', value: icpt },
          hints: [
            `Solve ${a === 1 ? '' : a}x + ${b === 1 ? '' : b}y = ${c} for y to read off its slope.`,
            perp
              ? `The given slope is ${sfrac(-a, b)}. Flip it and change the sign: ℓ has slope ${sfrac(b, a)}.`
              : `The given slope is ${sfrac(-a, b)}, and parallel lines share a slope.`,
          ],
          solution: [
            {
              text: 'Put the given line in y = mx + b form to see its slope.',
              visual: working([
                { label: 'Solve for y', text: b === 1 ? `y = ${term(-a, 'x')} + ${c}` : `${b}y = ${term(-a, 'x')} + ${c}, so y = (${sfrac(-a, b)})x + ${c / b}` },
                { label: 'Given slope', text: sfrac(-a, b) },
                { label: `Slope of ℓ`, text: perp ? `negative reciprocal: ${sfrac(b, a)}` : `the same: ${sfrac(-a, b)}` },
              ]),
            },
            {
              text: `Now walk from (${neg(x0)}, ${neg(y0)}) to the y-axis. That is ${Math.abs(x0)} step${Math.abs(x0) === 1 ? '' : 's'} ${x0 > 0 ? 'left' : 'right'}, and y changes by ${sfrac(sn, sd)} per step to the right.`,
              visual: working([
                { label: 'Change in y', text: `${sfrac(sn, sd)} × ${x0 > 0 ? `(${neg(-x0)})` : -x0} = ${neg((-sn * x0) / sd)}` },
                { label: 'y-intercept', text: `${neg(y0)} ${plus((-sn * x0) / sd)} = ${neg(icpt)}` },
              ]),
            },
          ],
        };
      },
    },
  ],
};

// ── Systems of Equations ─────────────────────────────────────────────────────

const systems: Lesson = {
  topic: 'systems',
  intro: [
    {
      text: 'Two unknowns need two equations. The cleanest method is elimination: line the equations up and add or subtract them so that one variable disappears. Here the y terms are opposites, so adding wipes them out.',
      visual: working([
        { label: 'Equation 1', text: '3x + 2y = 22' },
        { label: 'Equation 2', text: '5x − 2y = 18' },
        { label: 'Add them', text: '8x = 40, so x = 5' },
        { label: 'Back-substitute', text: '15 + 2y = 22, so y = 7/2' },
      ]),
    },
    {
      text: 'If nothing cancels right away, scale an equation first. To eliminate y from x + 3y = 11 and 2x + y = 7, multiply the second equation by 3 so both have 3y, then subtract.',
      visual: working([
        { label: 'Equation 1', text: 'x + 3y = 11' },
        { label: '3 × Equation 2', text: '6x + 3y = 21' },
        { label: 'Subtract', text: '5x = 10, so x = 2' },
        { label: 'Then', text: '2 + 3y = 11, so y = 3' },
      ]),
    },
    {
      text: 'Now the contest move, sometimes called cheating the system. Before solving for x and y, look at what the question actually asks. If 3x + 5y = 41 and 5x + 3y = 47, what is x + y? Just add the equations: 8x + 8y = 88, so x + y = 11. You never find x or y.',
    },
    {
      text: 'The same idea cracks three unknowns given in pairs. If a + b = 10, b + c = 14 and a + c = 12, add all three: every letter appears twice, so 2(a + b + c) = 36 and a + b + c = 18. Then each letter is the total minus the pair that leaves it out: a = 18 − 14 = 4.',
      visual: working([
        { label: 'Add all three', text: '2a + 2b + 2c = 36' },
        { label: 'Halve', text: 'a + b + c = 18' },
        { label: 'Subtract b + c', text: 'a = 18 − 14 = 4' },
      ]),
    },
  ],
  rungs: [
    {
      id: 'systems/eliminate',
      idea: 'Add or subtract to eliminate a variable',
      buildsOn: 'equations/two-kinds',
      generate: rng => {
        const x = int(rng, 1, 9);
        const y = int(rng, 1, 9);
        const a1 = int(rng, 1, 5);
        const b1 = int(rng, 1, 5);
        let a2 = int(rng, 1, 5);
        const b2 = -int(rng, 1, 5);
        if (a1 * b2 === a2 * b1) a2 += 1;
        const [c1, c2] = [a1 * x + b1 * y, a2 * x + b2 * y];
        const want = pick(rng, ['x', 'y'] as const);
        // Scale so the y terms cancel when added.
        const [s1, s2] = [-b2, b1];
        const eq1 = `${two(a1, b1)} = ${neg(c1)}`;
        const eq2 = `${two(a2, b2)} = ${neg(c2)}`;
        return {
          prompt: `If ${eq1} and ${eq2}, what is ${want}?`,
          answer: { kind: 'number', value: want === 'x' ? x : y },
          hints: [
            'One equation has +y terms and the other has −y terms. Scale them so the y terms are exact opposites.',
            s1 === 1 && s2 === 1
              ? 'They already are opposites. Add the equations.'
              : `Multiply the first equation by ${s1} and the second by ${s2}, then add.`,
          ],
          solution: [
            {
              text: 'Make the y terms cancel, then add.',
              visual: working([
                { label: s1 === 1 ? 'Equation 1' : `${s1} × Equation 1`, text: `${two(a1 * s1, b1 * s1)} = ${neg(c1 * s1)}` },
                { label: s2 === 1 ? 'Equation 2' : `${s2} × Equation 2`, text: `${two(a2 * s2, b2 * s2)} = ${neg(c2 * s2)}` },
                { label: 'Add', text: `${term(a1 * s1 + a2 * s2, 'x')} = ${neg(c1 * s1 + c2 * s2)}, so x = ${x}` },
                { label: 'Back-substitute', text: `${a1 === 1 ? '' : `${a1} × `}${x} + ${term(b1, 'y')} = ${c1}, so y = ${y}` },
              ]),
            },
            { text: `Check in the second equation: ${a2 === 1 ? '' : `${a2} × `}${x} − ${b2 === -1 ? '' : `${-b2} × `}${y} = ${neg(c2)}.` },
          ],
        };
      },
    },
    {
      id: 'systems/story',
      idea: 'Two purchases, two prices',
      buildsOn: 'systems/eliminate',
      generate: rng => {
        const shop = pick(rng, [
          { a: 'burger', b: 'drink', place: 'At a snack bar' },
          { a: 'notebook', b: 'pen', place: 'At the school store' },
          { a: 'adult ticket', b: 'child ticket', place: 'At the fair' },
          { a: 'sandwich', b: 'cookie', place: 'At a bakery' },
        ]);
        const p = int(rng, 5, 12);
        const q = int(rng, 1, p - 2);
        const n1 = int(rng, 1, 4);
        const m1 = int(rng, 1, 4);
        let n2 = int(rng, 1, 5);
        const m2 = int(rng, 1, 5);
        if (n1 * m2 === n2 * m1) n2 += 1;
        const [t1, t2] = [n1 * p + m1 * q, n2 * p + m2 * q];
        const want = pick(rng, ['a', 'b'] as const);
        const pl = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`;
        // Eliminate the item NOT asked for.
        const [k1, k2] = want === 'a' ? [m2, m1] : [n2, n1];
        const lhs = (n: number, m: number) => two(n, m, 'a', 'b');
        const left = want === 'a' ? n1 * k1 - n2 * k2 : m1 * k1 - m2 * k2;
        const right = t1 * k1 - t2 * k2;
        const v = want === 'a' ? 'a' : 'b';
        return {
          prompt: `${shop.place}, ${pl(n1, shop.a)} and ${pl(m1, shop.b)} cost $${t1}, while ${pl(n2, shop.a)} and ${pl(m2, shop.b)} cost $${t2}. How many dollars does one ${want === 'a' ? shop.a : shop.b} cost?`,
          answer: { kind: 'number', value: want === 'a' ? p : q },
          hints: [
            `Let a be the price of a ${shop.a} and b the price of a ${shop.b}. Write one equation per purchase.`,
            `${lhs(n1, m1)} = ${t1} and ${lhs(n2, m2)} = ${t2}. Scale them so the ${want === 'a' ? 'b' : 'a'} terms match, then subtract.`,
          ],
          solution: [
            {
              text: `Let a = price of a ${shop.a}, b = price of a ${shop.b}. You want ${v}, so eliminate the other letter.`,
              visual: working([
                { label: 'Purchase 1', text: `${lhs(n1, m1)} = ${t1}` },
                { label: 'Purchase 2', text: `${lhs(n2, m2)} = ${t2}` },
                { label: k1 === 1 ? 'Purchase 1' : `${k1} × Purchase 1`, text: `${lhs(n1 * k1, m1 * k1)} = ${t1 * k1}` },
                { label: k2 === 1 ? 'Purchase 2' : `${k2} × Purchase 2`, text: `${lhs(n2 * k2, m2 * k2)} = ${t2 * k2}` },
                { label: 'Subtract', text: `${term(left, v)} = ${neg(right)}, so ${v} = ${want === 'a' ? p : q}` },
              ]),
            },
            { text: `A ${shop.a} costs $${p} and a ${shop.b} costs $${q}. Check the first purchase: ${n1} × ${p} + ${m1} × ${q} = ${t1}.` },
          ],
        };
      },
    },
    {
      id: 'systems/cheat',
      idea: 'Solve for what was asked, not for x and y',
      buildsOn: 'systems/story',
      generate: rng => {
        const x = int(rng, 2, 12);
        const y = int(rng, 1, x - 1);
        const a = int(rng, 2, 7);
        let b = int(rng, 1, 6);
        if (b >= a) b = a - 1;
        const [c1, c2] = [a * x + b * y, b * x + a * y];
        const want = pick(rng, ['sum', 'sum', 'diff'] as const);
        const eqs = `${two(a, b)} = ${c1} and ${two(b, a)} = ${c2}`;
        return {
          prompt: `If ${eqs}, what is ${want === 'sum' ? 'x + y' : 'x − y'}?`,
          answer: { kind: 'number', value: want === 'sum' ? x + y : x - y },
          hints: [
            'The coefficients are swapped between the two equations. You do not need x and y separately.',
            want === 'sum'
              ? `Add the equations. The left side becomes ${a + b}x + ${a + b}y.`
              : `Subtract the second equation from the first. The left side becomes ${term(a - b, 'x')} − ${term(a - b, 'y')}.`,
          ],
          solution: [
            want === 'sum'
              ? {
                  text: 'Add the two equations. The swapped coefficients make both letters come out with the same multiplier.',
                  visual: working([
                    { label: 'Add', text: `${a + b}x + ${a + b}y = ${c1 + c2}` },
                    { label: `Divide by ${a + b}`, text: `x + y = ${x + y}` },
                  ]),
                }
              : {
                  text: 'Subtract the second equation from the first.',
                  visual: working([
                    { label: 'Subtract', text: `${term(a - b, 'x')} − ${term(a - b, 'y')} = ${c1 - c2}` },
                    ...(a - b === 1 ? [] : [{ label: `Divide by ${a - b}`, text: `x − y = ${x - y}` }]),
                  ]),
                },
            { text: `No need to find them, but x = ${x} and y = ${y} if you want to check.` },
          ],
        };
      },
    },
    {
      id: 'systems/pair-sums',
      idea: 'Three unknowns given in pairs',
      buildsOn: 'systems/cheat',
      generate: rng => {
        const [a, b, c] = [int(rng, 12, 60), int(rng, 12, 60), int(rng, 12, 60)];
        const names = pick(rng, [
          ['Ava', 'Ben', 'Cal'],
          ['the apple', 'the banana', 'the cantaloupe'],
          ['the red box', 'the green box', 'the blue box'],
        ]);
        const unit = names[0] === 'Ava' ? 'pounds' : names[0] === 'the apple' ? 'grams' : 'ounces';
        const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
        const total = a + b + c;
        const which = int(rng, 0, 3);
        const vals = [a, b, c];
        const others = [b + c, a + c, a + b];
        return {
          prompt: `${cap(names[0])} and ${names[1]} together weigh ${a + b} ${unit}. ${cap(names[1])} and ${names[2]} together weigh ${b + c} ${unit}. ${cap(names[0])} and ${names[2]} together weigh ${a + c} ${unit}. ${which === 3 ? `How many ${unit} do all three weigh together?` : `How many ${unit} does ${names[which]} weigh?`}`,
          answer: { kind: 'number', value: which === 3 ? total : vals[which] },
          hints: [
            'Add all three weighings. How many times was each one weighed?',
            `Each was weighed twice, so the three together weigh (${a + b} + ${b + c} + ${a + c}) ÷ 2.`,
          ],
          solution: [
            {
              text: 'Add the three weighings. Each of the three appears in exactly two of them.',
              visual: working([
                { label: 'Sum of weighings', text: `${a + b} + ${b + c} + ${a + c} = ${2 * total}` },
                { label: 'Everyone, once', text: `${2 * total} ÷ 2 = ${total}` },
                ...(which === 3 ? [] : [{ label: 'Remove the other two', text: `${total} − ${others[which]} = ${vals[which]}` }]),
              ]),
            },
            ...(which === 3 ? [] : [{ text: `The pair that leaves out ${names[which]} weighs ${others[which]}, so ${names[which]} is whatever remains of the ${total}.` }]),
          ],
        };
      },
    },
  ],
};

export const MOTION_LINE_LESSONS: Lesson[] = [motionWork, lines, systems];
