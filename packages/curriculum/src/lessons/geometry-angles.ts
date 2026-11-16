// Realm VI: Geometry — angles and parallel lines, triangle basics, polygons.
import type { Lesson, Pt, Shape, Visual } from './types.ts';
import { angleLabel, centroid, cornerLabel, fig, polar, poly, seg, text, triangleFromAngles } from './figures.ts';
import { fmt, int, linear, pick, working } from './util.ts';

const deg = (n: number) => `${n}°`;

// ── Angles & Parallel Lines ──────────────────────────────────────────────────

/** Two lines crossing at the origin, the second tilted `t` degrees from the first. Labels go in the four regions, counterclockwise from the east. */
function crossing(t: number, labels: [string, string, string, string]): Visual {
  const o: Pt = [0, 0];
  const mids = [t / 2, (t + 180) / 2, 180 + t / 2, 270 + t / 2];
  return fig([
    seg(polar(o, 5, 180), polar(o, 5, 0)),
    seg(polar(o, 5, t + 180), polar(o, 5, t)),
    ...labels.flatMap((l, i) => (l ? [text(polar(o, i % 2 === 0 ? (t < 50 ? 3.2 : 1.9) : t > 130 ? 3.2 : 1.9, mids[i]), l)] : [])),
  ]);
}

type Region = 0 | 1 | 2 | 3;
/** Two horizontal parallel lines cut by a transversal tilted `t` degrees. Labels sit in a chosen region (0–3, counterclockwise from east) at the top or bottom crossing. */
function transversal(t: number, marks: { where: 'top' | 'bottom'; region: Region; label: string }[]): Visual {
  const rad = (t * Math.PI) / 180;
  const bottom: Pt = [0, 0];
  const top: Pt = [3 / Math.tan(rad), 3];
  const xs = [bottom[0], top[0]];
  const [left, right] = [Math.min(...xs) - 3.5, Math.max(...xs) + 3.5];
  const mids = [t / 2, (t + 180) / 2, 180 + t / 2, 270 + t / 2];
  const reach = (region: Region) => (region % 2 === 0 ? (t < 55 ? 2.2 : 1.3) : t > 125 ? 2.2 : 1.3);
  return fig([
    seg([left, 0], [right, 0]),
    seg([left, 3], [right, 3]),
    seg(polar(bottom, 1.8, t + 180), polar(top, 1.8, t)),
    ...marks.map(m => text(polar(m.where === 'top' ? top : bottom, reach(m.region), mids[m.region]), m.label)),
  ]);
}

/** A bent path between two parallel lines: angle a at the top line, b at the bottom line, and the bend between them. */
function zigzag(a: number, b: number, labels: { top: string; bottom: string; bend: string }): Visual {
  const rad = (d: number) => (d * Math.PI) / 180;
  const A: Pt = [0, 3];
  const P: Pt = [1.5 / Math.tan(rad(a)), 1.5];
  const B: Pt = [P[0] - 1.5 / Math.tan(rad(b)), 0];
  const left = Math.min(0, B[0]) - 1.5;
  const right = P[0] + 2.5;
  return fig([
    seg([left, 3], [right, 3]),
    seg([left, 0], [right, 0]),
    seg(A, P),
    seg(P, B),
    text(polar(A, a < 40 ? 2 : 1.25, -a / 2), labels.top),
    text(polar(B, b < 40 ? 2 : 1.25, b / 2), labels.bottom),
    text([P[0] - 1, P[1]], labels.bend),
  ]);
}

const angles: Lesson = {
  topic: 'angles',
  intro: [
    {
      text: 'Almost every angle problem rests on a few facts. A straight line is 180°, so two angles that sit side by side on a line add to 180°. All the way around a point is 360°. And when two lines cross, the angles opposite each other, called vertical angles, are equal.',
      visual: crossing(60, ['60°', '120°', '60°', '120°']),
    },
    {
      text: 'Why are vertical angles equal? Each of them sits next to the same 120° angle on a straight line, so each must be 180° − 120°. Knowing ONE angle where two lines cross gives you all four.',
    },
    {
      text: 'Now add a second line parallel to the first. A line cutting across both, a transversal, makes the same four angles at each crossing, because the parallel lines tilt the same way. So of the eight angles there are really only two different sizes, and they add to 180°.',
      visual: transversal(60, [
        { where: 'top', region: 0, label: '60°' },
        { where: 'top', region: 1, label: '120°' },
        { where: 'bottom', region: 0, label: '60°' },
        { where: 'bottom', region: 1, label: '120°' },
        { where: 'bottom', region: 2, label: '60°' },
        { where: 'top', region: 3, label: '120°' },
      ]),
    },
    {
      text: 'The pairs have names. Angles in matching positions at the two crossings are corresponding angles (equal). Angles between the parallel lines on opposite sides of the transversal are alternate interior angles (equal, they make a Z shape). Angles between the lines on the same side are co-interior (they add to 180°, a C shape). You do not need the names to solve problems. You need: every angle is either the small one or the big one.',
    },
    {
      text: 'A favorite contest figure is a bent path between two parallel lines. The trick is to draw a third parallel line through the bend. It splits the bend into two pieces, and each piece is an alternate interior angle with one of the marked angles. So the angle at the bend is the SUM of the other two.',
      visual: zigzag(40, 35, { top: '40°', bottom: '35°', bend: '75°' }),
    },
  ],
  rungs: [
    {
      id: 'angles/line',
      idea: 'Straight lines, full turns, and right angles',
      generate: rng => {
        const variant = int(rng, 0, 2);
        if (variant === 0) {
          const [k, x] = pick(rng, [[3, 45], [4, 60], [6, 72], [7, 75], [10, 80], [11, 81], [16, 84]] as const);
          const word = k === 3 ? 'three' : k === 4 ? 'four' : `${k}`;
          return {
            prompt: `The supplement of an angle is ${word} times its complement. How many degrees is the angle?`,
            answer: { kind: 'number', value: x },
            hints: [
              'If the angle is x, its supplement is 180 − x and its complement is 90 − x.',
              `180 − x = ${k}(90 − x).`,
            ],
            solution: [
              {
                text: 'Supplements add to 180° and complements add to 90°. Name the angle x and translate.',
                visual: working([
                  { label: 'Translate', text: `180 − x = ${k}(90 − x)` },
                  { label: 'Expand', text: `180 − x = ${90 * k} − ${k}x` },
                  { label: 'Collect', text: `${k - 1}x = ${90 * k - 180}` },
                  { label: 'So', text: `x = ${x}` },
                ]),
              },
              { text: `Check: the supplement is ${180 - x}° and the complement is ${90 - x}°, and ${k} × ${90 - x} = ${180 - x}.` },
            ],
          };
        }
        if (variant === 1) {
          const parts = pick(rng, [[1, 2, 3], [2, 3, 4], [1, 3, 5], [2, 3, 5], [1, 4, 5], [3, 4, 5], [1, 2, 6], [2, 5, 8], [3, 5, 7], [4, 5, 9], [1, 1, 2], [2, 7, 9]] as const);
          const total = parts[0] + parts[1] + parts[2];
          const one = 180 / total;
          const want = pick(rng, ['largest', 'smallest'] as const);
          return {
            prompt: `Three angles fit together along a straight line. Their measures are in the ratio ${parts.join(' : ')}. How many degrees is the ${want} angle?`,
            answer: { kind: 'number', value: one * (want === 'largest' ? parts[2] : parts[0]) },
            hints: ['Angles along a straight line add to 180°.', `There are ${parts.join(' + ')} = ${total} equal parts, so one part is 180° ÷ ${total}.`],
            solution: [
              {
                text: 'The three angles make a straight line, so they total 180°. Think in parts.',
                visual: working([
                  { label: 'Parts', text: `${parts.join(' + ')} = ${total}` },
                  { label: 'One part', text: `180° ÷ ${total} = ${deg(one)}` },
                  { label: `${want[0].toUpperCase()}${want.slice(1)}`, text: `${want === 'largest' ? parts[2] : parts[0]} × ${deg(one)} = ${deg(one * (want === 'largest' ? parts[2] : parts[0]))}` },
                ]),
              },
            ],
          };
        }
        const known = [int(rng, 40, 110), int(rng, 50, 120), int(rng, 30, 80)];
        const x = 360 - known[0] - known[1] - known[2];
        return {
          prompt: `Four angles surround a point, with no gaps or overlaps. Three of them measure ${known.map(deg).join(', ')}. How many degrees is the fourth?`,
          answer: { kind: 'number', value: x },
          hints: ['A full turn around a point is 360°.', `Subtract the three known angles from 360°.`],
          solution: [
            {
              text: 'Angles around a point add to 360°.',
              visual: working([
                { label: 'Known', text: `${known.join(' + ')} = ${known[0] + known[1] + known[2]}` },
                { label: 'Fourth', text: `360 − ${known[0] + known[1] + known[2]} = ${deg(x)}` },
              ]),
            },
          ],
        };
      },
    },
    {
      id: 'angles/crossing',
      idea: 'Crossing lines, with algebra',
      buildsOn: 'equations/translate',
      generate: rng => {
        const x = int(rng, 6, 20);
        const vertical = rng() < 0.5;
        const theta = int(rng, 35, 145);
        const a = int(rng, 2, 6);
        let c = int(rng, 1, 5);
        if (c === a) c += 1;
        const other = vertical ? theta : 180 - theta;
        const [b, d] = [theta - a * x, other - c * x];
        const [e1, e2] = [`(${linear(a, b)})°`, `(${linear(c, d)})°`];
        return {
          prompt: vertical
            ? `Two lines cross. A pair of vertical (opposite) angles measure ${e1} and ${e2}. How many degrees is each of these angles?`
            : `Two lines cross. Two angles that sit next to each other along one of the lines measure ${e1} and ${e2}. How many degrees is the angle marked ${e1}?`,
          visual: vertical ? crossing(theta, [e1, '', e2, '']) : crossing(theta, [e1, e2, '', '']),
          answer: { kind: 'number', value: theta },
          hints: [
            vertical ? 'Vertical angles are equal. Set the two expressions equal.' : 'Angles side by side on a straight line add to 180°.',
            vertical ? `${linear(a, b)} = ${linear(c, d)}` : `(${linear(a, b)}) + (${linear(c, d)}) = 180`,
          ],
          solution: [
            {
              text: vertical ? 'Vertical angles are equal, which gives an equation for x.' : 'The two angles form a straight line, so they add to 180°.',
              visual: working(
                vertical
                  ? [
                      { label: 'Equal', text: `${linear(a, b)} = ${linear(c, d)}` },
                      { label: 'Solve', text: `x = ${x}` },
                      { label: 'Angle', text: `${a} × ${x} ${b < 0 ? '−' : '+'} ${Math.abs(b)} = ${deg(theta)}` },
                    ]
                  : [
                      { label: 'Sum', text: `(${linear(a, b)}) + (${linear(c, d)}) = 180` },
                      { label: 'Collect', text: `${linear(a + c, b + d)} = 180` },
                      { label: 'Solve', text: `x = ${x}` },
                      { label: 'Angle', text: `${a} × ${x} ${b < 0 ? '−' : '+'} ${Math.abs(b)} = ${deg(theta)}` },
                    ],
              ),
            },
            { text: 'The question asks for the angle, not for x. Always substitute back.' },
          ],
        };
      },
    },
    {
      id: 'angles/parallel',
      idea: 'Parallel lines: only two sizes of angle',
      buildsOn: 'angles/crossing',
      generate: rng => {
        let t = int(rng, 35, 145);
        if (Math.abs(t - 90) < 8) t = 62;
        const size = (region: Region) => (region % 2 === 0 ? t : 180 - t);
        const givenRegion = pick(rng, [0, 1, 2, 3] as const);
        const askRegion = pick(rng, [0, 1, 2, 3] as const);
        const givenTop = rng() < 0.5;
        const [g, x] = [size(givenRegion), size(askRegion)];
        const same = g === x;
        return {
          prompt: `The two horizontal lines are parallel. One angle measures ${deg(g)}. How many degrees is the angle marked x?`,
          visual: transversal(t, [
            { where: givenTop ? 'top' : 'bottom', region: givenRegion, label: deg(g) },
            { where: givenTop ? 'bottom' : 'top', region: askRegion, label: 'x' },
          ]),
          answer: { kind: 'number', value: x },
          hints: [
            `Because the lines are parallel, both crossings show the same four angles. Each of the eight angles is either ${deg(g)} or ${deg(180 - g)}.`,
            `Slide the ${deg(g)} angle along the transversal to the other crossing. Is x in the matching position, opposite it, or next to it?`,
          ],
          solution: [
            { text: `Slide the ${deg(g)} angle along the transversal to the other crossing: its corresponding angle there is also ${deg(g)}. Angles opposite it are ${deg(g)} too, and angles next to it are 180° − ${deg(g)} = ${deg(180 - g)}.` },
            { text: same ? `The angle x is ${givenRegion === askRegion ? 'in the matching position' : 'opposite the matching position'}, so x = ${deg(x)}.` : `The angle x sits next to the matching position, on a straight line with it, so x = 180° − ${deg(g)} = ${deg(x)}.` },
            { text: `Quick sanity check from the picture: x looks ${x < 90 ? 'acute' : 'obtuse'}, and ${deg(x)} is.` },
          ],
        };
      },
    },
    {
      id: 'angles/zigzag',
      idea: 'Draw another parallel line through the bend',
      buildsOn: 'angles/parallel',
      generate: rng => {
        const a = int(rng, 25, 70);
        const b = int(rng, 25, 70);
        const forward = rng() < 0.6;
        return {
          prompt: forward
            ? `The two horizontal lines are parallel. A path leaves the top line at a ${deg(a)} angle, bends, and meets the bottom line at a ${deg(b)} angle. How many degrees is the angle x at the bend?`
            : `The two horizontal lines are parallel. A path leaves the top line at a ${deg(a)} angle, bends through an angle of ${deg(a + b)}, and meets the bottom line. How many degrees is the angle x it makes with the bottom line?`,
          visual: forward ? zigzag(a, b, { top: deg(a), bottom: deg(b), bend: 'x' }) : zigzag(a, b, { top: deg(a), bottom: 'x', bend: deg(a + b) }),
          answer: { kind: 'number', value: forward ? a + b : b },
          hints: [
            'Draw a third line through the bend, parallel to the other two. It cuts the bend angle into two pieces.',
            `The upper piece is an alternate interior angle with the ${deg(a)} angle, so it is ${deg(a)} too.`,
          ],
          solution: [
            { text: 'Add a line through the bend, parallel to the two given lines. It splits the angle at the bend into an upper piece and a lower piece.' },
            { text: `The upper piece and the ${deg(a)} angle are alternate interior angles (a Z shape), so the upper piece is ${deg(a)}. In the same way the lower piece equals the angle at the bottom line.` },
            {
              text: 'So the bend is the sum of the two angles at the lines.',
              visual: working(
                forward
                  ? [{ label: 'Bend', text: `${a} + ${b} = ${deg(a + b)}` }]
                  : [
                      { label: 'Bend', text: `${a} + x = ${a + b}` },
                      { label: 'So', text: `x = ${deg(b)}` },
                    ],
              ),
            },
          ],
        };
      },
    },
  ],
};

// ── Triangle Basics ──────────────────────────────────────────────────────────

/** Triangle with angle labels at A, B, C (empty string to skip), optionally extending side AB past B with a label on the exterior angle. */
function triangleFig(alpha: number, beta: number, labels: [string, string, string], exterior?: string): Visual {
  const [A, B, C] = triangleFromAngles(alpha, beta);
  const reach = (angle: number) => (angle < 35 ? 3.4 : angle < 55 ? 2.3 : 1.5);
  const shapes: Shape[] = [poly([A, B, C])];
  if (labels[0]) shapes.push(angleLabel(A, B, C, labels[0], reach(alpha)));
  if (labels[1]) shapes.push(angleLabel(B, A, C, labels[1], reach(beta)));
  if (labels[2]) shapes.push(angleLabel(C, A, B, labels[2], reach(180 - alpha - beta)));
  if (exterior) {
    const D: Pt = [B[0] + 4, 0];
    shapes.push(seg(B, D), angleLabel(B, D, C, exterior, reach(180 - beta)));
  }
  return fig(shapes);
}

const triangles: Lesson = {
  topic: 'triangles',
  intro: [
    {
      text: 'The angles of any triangle add up to 180°. Here is why: draw a line through the top corner parallel to the base. The two base angles reappear up there as alternate interior angles, and together with the top angle they make a straight line.',
      visual: (() => {
        const [A, B, C] = triangleFromAngles(50, 60);
        return fig([
          poly([A, B, C]),
          seg([C[0] - 5, C[1]], [C[0] + 5, C[1]], true),
          angleLabel(A, B, C, '50°', 2.3),
          angleLabel(B, A, C, '60°', 1.8),
          angleLabel(C, A, B, '70°', 1.6),
          text([C[0] - 2.6, C[1] - 0.6], '50°'),
          text([C[0] + 2.6, C[1] - 0.6], '60°'),
        ]);
      })(),
    },
    {
      text: 'Extend one side of a triangle and you create an exterior angle. It equals the sum of the two interior angles that do NOT touch it. No need to find the third interior angle first: both the exterior angle and "the other two" are what is left of 180° once the neighboring interior angle is removed.',
      visual: triangleFig(50, 60, ['50°', '60°', '70°'], '120°'),
    },
    {
      text: 'An isosceles triangle has two equal sides, and the angles opposite those sides are equal too. So one angle tells you everything. If the angle between the equal sides is 40°, the other two share the remaining 140° equally: 70° each. If a base angle is 40°, the other base angle is also 40° and the top is 100°.',
    },
    {
      text: 'Sides have rules as well. The triangle inequality says any two sides together must be longer than the third. Otherwise the two short sides cannot reach each other. With sides 5 and 9, the third side must be more than 9 − 5 = 4 and less than 9 + 5 = 14.',
      visual: working([
        { label: 'Too short', text: '5, 9, 4: the 5 and 4 only just reach, lying flat' },
        { label: 'Too long', text: '5, 9, 14: the 5 and 9 lie flat along the 14' },
        { label: 'Allowed', text: 'third side between 4 and 14, not including either' },
      ]),
    },
  ],
  rungs: [
    {
      id: 'triangles/angle-sum',
      idea: 'Three angles, 180 degrees',
      buildsOn: 'angles/line',
      generate: rng => {
        const variant = int(rng, 0, 2);
        if (variant === 0) {
          const parts = pick(rng, [[1, 2, 3], [2, 3, 4], [1, 1, 2], [2, 3, 5], [3, 4, 5], [1, 3, 5], [2, 2, 5], [1, 4, 5], [3, 5, 7], [4, 5, 6], [2, 7, 9], [5, 6, 7], [1, 5, 6]] as const);
          const total = parts[0] + parts[1] + parts[2];
          const one = 180 / total;
          const want = pick(rng, ['largest', 'smallest'] as const);
          const value = one * (want === 'largest' ? parts[2] : parts[0]);
          return {
            prompt: `The angles of a triangle are in the ratio ${parts.join(' : ')}. How many degrees is the ${want} angle?`,
            answer: { kind: 'number', value },
            hints: ['The three angles add to 180°.', `${total} parts make 180°, so one part is ${deg(one)}.`],
            solution: [
              {
                text: 'Split 180° into equal parts.',
                visual: working([
                  { label: 'Parts', text: `${parts.join(' + ')} = ${total}` },
                  { label: 'One part', text: `180° ÷ ${total} = ${deg(one)}` },
                  { label: 'Angles', text: parts.map(p => deg(p * one)).join(', ') },
                ]),
              },
              { text: `The ${want} is ${deg(value)}.${parts[2] * one === 90 ? ' (This one is a right triangle.)' : ''}` },
            ],
          };
        }
        if (variant === 1) {
          const base = int(rng, 20, 85);
          const vertex = 180 - 2 * base;
          const givenVertex = rng() < 0.5;
          return {
            prompt: givenVertex
              ? `In an isosceles triangle, the angle between the two equal sides is ${deg(vertex)}. How many degrees is each of the other two angles?`
              : `An isosceles triangle has two equal angles of ${deg(base)} each. How many degrees is the third angle?`,
            answer: { kind: 'number', value: givenVertex ? base : vertex },
            hints: givenVertex
              ? ['The other two angles are opposite the equal sides, so they are equal.', `They share 180° − ${deg(vertex)} = ${deg(180 - vertex)} equally.`]
              : ['All three angles add to 180°.', `180 − ${base} − ${base}.`],
            solution: [
              {
                text: givenVertex ? 'Angles opposite equal sides are equal, so the two unknown angles split what is left.' : 'Subtract the two known angles from 180°.',
                visual: working(
                  givenVertex
                    ? [
                        { label: 'Left over', text: `180 − ${vertex} = ${180 - vertex}` },
                        { label: 'Each', text: `${180 - vertex} ÷ 2 = ${deg(base)}` },
                      ]
                    : [{ label: 'Third angle', text: `180 − 2 × ${base} = ${deg(vertex)}` }],
                ),
              },
            ],
          };
        }
        const x = int(rng, 15, 25);
        const a = int(rng, -5, 20);
        const b = int(rng, -10, 20);
        const c = 180 - 6 * x - a - b;
        const values = [x + a, 2 * x + b, 3 * x + c];
        const largest = Math.max(...values);
        return {
          prompt: `The angles of a triangle measure (${linear(1, a)})°, (${linear(2, b)})° and (${linear(3, c)})°. How many degrees is the largest angle?`,
          answer: { kind: 'number', value: largest },
          hints: ['Add the three expressions and set the total equal to 180.', `${linear(6, a + b + c)} = 180, so x = ${x}. Now evaluate all three angles.`],
          solution: [
            {
              text: 'The three expressions add to 180.',
              visual: working([
                { label: 'Sum', text: `${linear(6, a + b + c)} = 180` },
                { label: 'Solve', text: `x = ${x}` },
                { label: 'Angles', text: values.map(deg).join(', ') },
              ]),
            },
            { text: `The largest is ${deg(largest)}. Evaluate all three: the expression with the biggest multiple of x is not always the biggest angle.` },
          ],
        };
      },
    },
    {
      id: 'triangles/exterior',
      idea: 'An exterior angle is the sum of the two far angles',
      buildsOn: 'triangles/angle-sum',
      generate: rng => {
        const alpha = int(rng, 30, 75);
        const gamma = int(rng, 35, 80);
        const beta = 180 - alpha - gamma;
        const ext = alpha + gamma;
        const forward = rng() < 0.5;
        return {
          prompt: forward
            ? `Two angles of the triangle measure ${deg(alpha)} and ${deg(gamma)}. One side is extended as shown. How many degrees is the exterior angle x?`
            : `One side of the triangle is extended, making an exterior angle of ${deg(ext)}. One of the far interior angles is ${deg(alpha)}. How many degrees is the other far interior angle, x?`,
          visual: forward ? triangleFig(alpha, beta, [deg(alpha), '', deg(gamma)], 'x') : triangleFig(alpha, beta, [deg(alpha), '', 'x'], deg(ext)),
          answer: { kind: 'number', value: forward ? ext : gamma },
          hints: [
            'The exterior angle equals the sum of the two interior angles that do not touch it.',
            forward ? `x = ${alpha} + ${gamma}.` : `${alpha} + x = ${ext}.`,
          ],
          solution: [
            {
              text: 'Use the exterior angle theorem directly.',
              visual: working(
                forward
                  ? [{ label: 'Exterior', text: `${alpha} + ${gamma} = ${deg(ext)}` }]
                  : [
                      { label: 'Exterior', text: `${alpha} + x = ${ext}` },
                      { label: 'So', text: `x = ${deg(gamma)}` },
                    ],
              ),
            },
            { text: `The slow way agrees: the unmarked interior angle is 180 − ${alpha} − ${gamma} = ${deg(beta)}, and it sits on a straight line with the exterior angle: 180 − ${beta} = ${deg(ext)}.` },
          ],
        };
      },
    },
    {
      id: 'triangles/inequality',
      idea: 'The triangle inequality',
      buildsOn: 'counting_lists/consecutive',
      generate: rng => {
        const a = int(rng, 3, 14);
        const b = a + int(rng, 1, 12);
        const [lo, hi] = [b - a + 1, a + b - 1];
        const want = pick(rng, ['count', 'count', 'largest', 'smallest'] as const);
        return {
          prompt:
            want === 'count'
              ? `Two sides of a triangle have lengths ${a} and ${b}. The third side has a whole-number length. How many different lengths are possible for it?`
              : `Two sides of a triangle have lengths ${a} and ${b}. The third side has a whole-number length. What is the ${want} it could be?`,
          answer: { kind: 'number', value: want === 'count' ? hi - lo + 1 : want === 'largest' ? hi : lo },
          hints: [
            `The third side must be less than ${a} + ${b} and more than ${b} − ${a}.`,
            `It is strictly between ${b - a} and ${a + b}, so the whole-number choices run from ${lo} to ${hi}.`,
          ],
          solution: [
            {
              text: 'Any two sides must together be longer than the third.',
              visual: working([
                { label: 'Upper limit', text: `less than ${a} + ${b} = ${a + b}` },
                { label: 'Lower limit', text: `more than ${b} − ${a} = ${b - a}` },
                { label: 'Whole numbers', text: `${lo}, ${lo + 1}, …, ${hi}` },
                ...(want === 'count' ? [{ label: 'Count', text: `${hi} − ${lo} + 1 = ${hi - lo + 1}` }] : []),
              ]),
            },
            { text: `The limits themselves are not allowed: a third side of ${b - a} or ${a + b} would flatten the triangle into a line segment.` },
          ],
        };
      },
    },
    {
      id: 'triangles/chase',
      idea: 'Chase angles through isosceles triangles',
      buildsOn: 'triangles/exterior',
      generate: rng => {
        if (rng() < 0.6) {
          const a = pick(rng, [20, 24, 28, 32, 36, 40, 44, 48, 52]);
          const base = (180 - a) / 2;
          const [A, B, C] = (() => {
            const [p, q, r] = triangleFromAngles(base, base, 6);
            return [r, p, q] as [Pt, Pt, Pt];
          })();
          // D on AC with BD = BC: triangle BCD is isosceles with base angles equal to angle C.
          const rad = (d: number) => (d * Math.PI) / 180;
          const cd = 2 * 6 * Math.cos(rad(base));
          const ac = Math.hypot(A[0] - C[0], A[1] - C[1]);
          const D: Pt = [C[0] + ((A[0] - C[0]) * cd) / ac, C[1] + ((A[1] - C[1]) * cd) / ac];
          const g = centroid([A, B, C]);
          return {
            prompt: `In triangle ABC, AB = AC and angle A is ${deg(a)}. Point D is on side AC with BD = BC. How many degrees is angle ABD?`,
            visual: fig([poly([A, B, C]), seg(B, D), cornerLabel(A, 'A', g, 0.5), cornerLabel(B, 'B', g, 0.5), cornerLabel(C, 'C', g, 0.5), cornerLabel(D, 'D', g, 0.5)]),
            answer: { kind: 'number', value: base - a },
            hints: [
              `Triangle ABC is isosceles, so angles B and C are each (180 − ${a}) ÷ 2 = ${deg(base)}.`,
              `Triangle BCD is isosceles too (BD = BC), so angle BDC equals angle C. Find angle DBC, then subtract it from angle ABC.`,
            ],
            solution: [
              {
                text: 'There are two isosceles triangles. Work through them one at a time.',
                visual: working([
                  { label: 'Triangle ABC', text: `angle B = angle C = (180 − ${a}) ÷ 2 = ${deg(base)}` },
                  { label: 'Triangle BCD', text: `BD = BC, so angle BDC = angle C = ${deg(base)}` },
                  { label: 'Angle DBC', text: `180 − ${base} − ${base} = ${deg(180 - 2 * base)}` },
                  { label: 'Angle ABD', text: `${base} − ${180 - 2 * base} = ${deg(base - a)}` },
                ]),
              },
              { text: `Notice angle DBC came out equal to angle A. Triangles ABC and BCD have the same angles, so they are similar.${a === 36 ? ' With 36° this is the famous golden triangle: ABD is isosceles as well.' : ''}` },
            ],
          };
        }
        const inside = rng() < 0.5;
        const s = 4;
        const [A, B, Cc, Dd]: Pt[] = [[0, 0], [s, 0], [s, s], [0, s]];
        const h = (s * Math.sqrt(3)) / 2;
        const E: Pt = inside ? [s / 2, h] : [s / 2, -h];
        return {
          prompt: `ABCD is a square. Triangle ABE is equilateral, with E ${inside ? 'inside' : 'outside'} the square. How many degrees is angle AED?`,
          visual: fig([
            poly([A, B, Cc, Dd]),
            seg(A, E),
            seg(B, E),
            seg(Dd, E, true),
            text([-0.35, -0.3], 'A'),
            text([s + 0.35, -0.3], 'B'),
            text([s + 0.35, s + 0.3], 'C'),
            text([-0.35, s + 0.3], 'D'),
            text([E[0] + 0.45, E[1] + (inside ? 0.25 : -0.3)], 'E'),
          ]),
          answer: { kind: 'number', value: inside ? 75 : 15 },
          hints: [
            'AE = AB because the triangle is equilateral, and AB = AD because of the square. So triangle AED is isosceles.',
            `Angle DAE is ${inside ? '90° − 60° = 30°' : '90° + 60° = 150°'}. The other two angles of triangle AED are equal.`,
          ],
          solution: [
            { text: 'Every side of the square and of the equilateral triangle has the same length. In particular AD = AE, so triangle AED is isosceles with its equal sides meeting at A.' },
            {
              text: 'Find the angle at A, then split what remains.',
              visual: working([
                { label: 'Angle DAE', text: inside ? '90 − 60 = 30°' : '90 + 60 = 150°' },
                { label: 'Left over', text: inside ? '180 − 30 = 150°' : '180 − 150 = 30°' },
                { label: 'Angle AED', text: inside ? '150 ÷ 2 = 75°' : '30 ÷ 2 = 15°' },
              ]),
            },
          ],
        };
      },
    },
  ],
};

// ── Polygons ─────────────────────────────────────────────────────────────────

const POLYGON_NAME: Record<number, string> = { 5: 'pentagon', 6: 'hexagon', 7: 'heptagon', 8: 'octagon', 9: 'nonagon', 10: 'decagon', 12: 'dodecagon' };
const gon = (n: number) => POLYGON_NAME[n] ?? `${n}-gon`;
const regularPoints = (n: number, r = 3, start = 90): Pt[] => Array.from({ length: n }, (_, i) => polar([0, 0], r, start + (360 * i) / n));

const polygons: Lesson = {
  topic: 'polygons',
  intro: [
    {
      text: 'Pick one corner of a polygon and draw every diagonal from it. The polygon falls apart into triangles, and their angles together are exactly the polygon\'s interior angles. A hexagon splits into 4 triangles, so its angles add to 4 × 180° = 720°. In general an n-sided polygon makes n − 2 triangles: the sum is (n − 2) × 180°.',
      visual: (() => {
        const pts = regularPoints(6);
        return fig([poly(pts), seg(pts[0], pts[2], true), seg(pts[0], pts[3], true), seg(pts[0], pts[4], true)], { caption: 'A hexagon cut into 4 triangles from one corner.' });
      })(),
    },
    {
      text: 'A regular polygon has all sides and all angles equal, so each interior angle is the sum divided by n. For a regular hexagon: 720° ÷ 6 = 120°.',
    },
    {
      text: 'Exterior angles are even friendlier. Walk around any convex polygon. At each corner you turn through the exterior angle, and by the time you are back at the start you have turned once all the way around: 360°, no matter how many sides. So each exterior angle of a regular n-gon is 360° ÷ n, and the interior angle is 180° minus that. This is the fast way to go from an angle back to the number of sides.',
      visual: working([
        { label: 'Regular 12-gon', text: 'exterior = 360° ÷ 12 = 30°' },
        { label: '', text: 'interior = 180° − 30° = 150°' },
        { label: 'Backwards', text: 'interior 150° → exterior 30° → 360 ÷ 30 = 12 sides' },
      ]),
    },
    {
      text: 'How many diagonals does an n-gon have? From each corner you can draw a diagonal to every corner except itself and its two neighbors: n − 3 of them. That counts n(n − 3) diagonal ends, and every diagonal has two ends, so there are n(n − 3)/2. It is handshake counting again, where nobody shakes hands with a neighbor.',
    },
  ],
  rungs: [
    {
      id: 'polygons/angle-sum',
      idea: 'Cut the polygon into triangles',
      buildsOn: 'triangles/angle-sum',
      generate: rng => {
        const variant = int(rng, 0, 2);
        if (variant === 0) {
          const n = int(rng, 5, 20);
          return {
            prompt: `What is the sum, in degrees, of the interior angles of a polygon with ${n} sides?`,
            answer: { kind: 'number', value: (n - 2) * 180 },
            hints: ['Diagonals from one corner cut the polygon into triangles. How many?', `${n} − 2 = ${n - 2} triangles, each contributing 180°.`],
            solution: [
              {
                text: 'Diagonals from a single corner split an n-gon into n − 2 triangles.',
                visual: working([
                  { label: 'Triangles', text: `${n} − 2 = ${n - 2}` },
                  { label: 'Sum', text: `${n - 2} × 180° = ${fmt((n - 2) * 180)}°` },
                ]),
              },
            ],
          };
        }
        if (variant === 1) {
          const n = pick(rng, [5, 6]);
          const total = (n - 2) * 180;
          const avg = total / n;
          const known = Array.from({ length: n - 1 }, () => avg + int(rng, -11, 11));
          const x = total - known.reduce((p, q) => p + q, 0);
          return {
            prompt: `${n === 5 ? 'Four' : 'Five'} of the angles of a ${gon(n)} measure ${known.map(deg).join(', ')}. How many degrees is the remaining angle?`,
            answer: { kind: 'number', value: x },
            hints: [`First find the sum of all ${n} interior angles: (${n} − 2) × 180°.`, `The angles total ${total}°. Subtract the ${n - 1} you know.`],
            solution: [
              {
                text: `Find the total for a ${gon(n)}, then subtract.`,
                visual: working([
                  { label: 'Total', text: `${n - 2} × 180 = ${total}` },
                  { label: 'Known', text: `${known.join(' + ')} = ${total - x}` },
                  { label: 'Remaining', text: `${total} − ${total - x} = ${deg(x)}` },
                ]),
              },
            ],
          };
        }
        const n = int(rng, 7, 22);
        return {
          prompt: `The interior angles of a polygon add up to ${fmt((n - 2) * 180)}°. How many sides does it have?`,
          answer: { kind: 'number', value: n },
          hints: ['Each triangle contributes 180°. How many triangles is that?', `${fmt((n - 2) * 180)} ÷ 180 = ${n - 2} triangles, and the number of sides is 2 more.`],
          solution: [
            {
              text: 'Run the formula backwards.',
              visual: working([
                { label: 'Triangles', text: `${fmt((n - 2) * 180)} ÷ 180 = ${n - 2}` },
                { label: 'Sides', text: `${n - 2} + 2 = ${n}` },
              ]),
            },
          ],
        };
      },
    },
    {
      id: 'polygons/regular',
      idea: 'Exterior angles always total 360 degrees',
      buildsOn: 'polygons/angle-sum',
      generate: rng => {
        const n = pick(rng, [5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 30, 36, 40, 45]);
        const ext = 360 / n;
        const variant = int(rng, 0, 2);
        if (variant === 0) {
          return {
            prompt: `How many degrees is each interior angle of a regular polygon with ${n} sides?`,
            answer: { kind: 'number', value: 180 - ext },
            hints: ['Start with the exterior angle: the exterior angles of any convex polygon total 360°.', `Each exterior angle is 360° ÷ ${n} = ${deg(ext)}.`],
            solution: [
              {
                text: 'Exterior angle first, then subtract from 180°.',
                visual: working([
                  { label: 'Exterior', text: `360 ÷ ${n} = ${deg(ext)}` },
                  { label: 'Interior', text: `180 − ${ext} = ${deg(180 - ext)}` },
                ]),
              },
              { text: `The other route gives the same thing: (${n} − 2) × 180 ÷ ${n} = ${fmt((n - 2) * 180)} ÷ ${n} = ${deg(180 - ext)}.` },
            ],
          };
        }
        if (variant === 1) {
          return {
            prompt: `Each interior angle of a regular polygon measures ${deg(180 - ext)}. How many sides does it have?`,
            answer: { kind: 'number', value: n },
            hints: ['Convert to the exterior angle. Those are easier to work with.', `Each exterior angle is 180° − ${deg(180 - ext)} = ${deg(ext)}, and they total 360°.`],
            solution: [
              {
                text: 'Switch to exterior angles, which always total 360°.',
                visual: working([
                  { label: 'Exterior', text: `180 − ${180 - ext} = ${deg(ext)}` },
                  { label: 'Sides', text: `360 ÷ ${ext} = ${n}` },
                ]),
              },
            ],
          };
        }
        return {
          prompt: `A robot walks ${pick(rng, [2, 3, 5])} meters, turns left ${deg(ext)}, and repeats this over and over. How many straight segments has it walked when it first returns to its starting point?`,
          answer: { kind: 'number', value: n },
          hints: ['The robot is tracing a regular polygon. Its turn at each corner is the exterior angle.', `It is back at the start, facing the original direction, once it has turned a full 360°.`],
          solution: [
            { text: 'Equal sides and equal turns trace a regular polygon, and the turning angle is its exterior angle.' },
            { text: 'The turns must total one full rotation.', visual: working([{ label: 'Sides', text: `360 ÷ ${ext} = ${n}` }]) },
          ],
        };
      },
    },
    {
      id: 'polygons/diagonals',
      idea: 'Counting diagonals',
      buildsOn: 'handshakes/variations',
      generate: rng => {
        const n = int(rng, 6, 20);
        const d = (n * (n - 3)) / 2;
        if (rng() < 0.6) {
          return {
            prompt: `How many diagonals does a convex polygon with ${n} sides have?`,
            answer: { kind: 'number', value: d },
            hints: [`From one corner, diagonals go to every corner except itself and its 2 neighbors: ${n - 3} of them.`, `${n} corners × ${n - 3} diagonals each counts every diagonal twice.`],
            solution: [
              {
                text: 'Count diagonal ends, then halve.',
                visual: working([
                  { label: 'From each corner', text: `${n} − 3 = ${n - 3}` },
                  { label: 'All corners', text: `${n} × ${n - 3} = ${n * (n - 3)}` },
                  { label: 'Each counted twice', text: `${n * (n - 3)} ÷ 2 = ${d}` },
                ]),
              },
              { text: `Or: all C(${n}, 2) = ${(n * (n - 1)) / 2} segments between corners, minus the ${n} that are sides: ${(n * (n - 1)) / 2} − ${n} = ${d}.` },
            ],
          };
        }
        return {
          prompt: `A convex polygon has ${d} diagonals. How many sides does it have?`,
          answer: { kind: 'number', value: n },
          hints: [`n(n − 3)/2 = ${d}, so n(n − 3) = ${2 * d}.`, `Look for two numbers that differ by 3 and multiply to ${2 * d}.`],
          solution: [
            {
              text: 'Use the diagonal formula backwards.',
              visual: working([
                { label: 'Formula', text: `n(n − 3) ÷ 2 = ${d}` },
                { label: 'Double', text: `n(n − 3) = ${2 * d}` },
                { label: 'Factor pair 3 apart', text: `${n} × ${n - 3} = ${2 * d}` },
                { label: 'So', text: `n = ${n}` },
              ]),
            },
          ],
        };
      },
    },
    {
      id: 'polygons/combine',
      idea: 'Regular polygons side by side',
      buildsOn: 'triangles/chase',
      generate: rng => {
        if (rng() < 0.5) {
          const n = pick(rng, [5, 6, 9, 10, 12, 15, 18, 20]);
          const interior = 180 - 360 / n;
          const pts = regularPoints(n, 3, 90 + 360 / n);
          const g: Pt = [0, 0];
          return {
            prompt: `A, B and C are three consecutive vertices of a regular ${gon(n)}. How many degrees is angle BAC?`,
            visual: fig([poly(pts), seg(pts[n - 1], pts[1], true), cornerLabel(pts[n - 1], 'A', g, 0.45), cornerLabel(pts[0], 'B', g, 0.45), cornerLabel(pts[1], 'C', g, 0.45)]),
            answer: { kind: 'number', value: 180 / n },
            hints: [
              `Angle ABC is an interior angle of the ${gon(n)}: ${deg(interior)}.`,
              'AB = BC, so triangle ABC is isosceles and angles BAC and BCA are equal.',
            ],
            solution: [
              {
                text: 'Triangle ABC has two sides of the polygon as its equal sides, with an interior angle between them.',
                visual: working([
                  { label: 'Angle ABC', text: `180 − 360 ÷ ${n} = ${deg(interior)}` },
                  { label: 'Left over', text: `180 − ${interior} = ${deg(180 - interior)}` },
                  { label: 'Angle BAC', text: `${180 - interior} ÷ 2 = ${deg(180 / n)}` },
                ]),
              },
              { text: `In any regular n-gon this angle is 180° ÷ n.` },
            ],
          };
        }
        const [n, m] = pick(rng, [[5, 4], [6, 4], [8, 4], [6, 5], [12, 4], [8, 3], [10, 5], [12, 3], [8, 6], [9, 4], [10, 4]] as const);
        const interior = (k: number) => 180 - 360 / k;
        const name = (k: number) => (k === 3 ? 'equilateral triangle' : k === 4 ? 'square' : `regular ${gon(k)}`);
        const gap = 360 - interior(n) - interior(m);
        return {
          prompt: `A ${name(n)} and a ${name(m)} share a side and lie on opposite sides of it. At one end of the shared side, their other two sides form an angle that goes around the outside of both shapes. How many degrees is it?`,
          answer: { kind: 'number', value: gap },
          hints: [
            'Three angles meet at that vertex and fill the full 360°: one interior angle from each shape, and the angle you want.',
            `The interior angles are ${deg(interior(n))} and ${deg(interior(m))}.`,
          ],
          solution: [
            {
              text: 'At an end of the shared side, the two interior angles and the outside angle go all the way around the point.',
              visual: working([
                { label: `${name(n)[0].toUpperCase()}${name(n).slice(1)}`, text: `180 − 360 ÷ ${n} = ${deg(interior(n))}` },
                { label: `${name(m)[0].toUpperCase()}${name(m).slice(1)}`, text: `180 − 360 ÷ ${m} = ${deg(interior(m))}` },
                { label: 'Outside angle', text: `360 − ${interior(n)} − ${interior(m)} = ${deg(gap)}` },
              ]),
            },
          ],
        };
      },
    },
  ],
};

export const GEOMETRY_ANGLE_LESSONS: Lesson[] = [angles, triangles, polygons];
