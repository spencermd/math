// Realm VI: Geometry — area, the Pythagorean theorem, special right triangles, quadrilaterals.
import type { Lesson, Pt, Visual } from './types.ts';
import { angleLabel, centroid, cornerLabel, dot, fig, poly, rightAngle, seg, sideLabel, text } from './figures.ts';
import { choices, fmt, int, linear, pick, root, working } from './util.ts';

const TRIPLES: [number, number, number][] = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41]];

/** A Pythagorean triple, usually a small multiple of a primitive one. */
function triple(rng: () => number, maxHyp = 60): [number, number, number] {
  const [a, b, c] = pick(rng, TRIPLES.filter(t => t[2] <= maxHyp));
  const k = int(rng, 1, Math.max(1, Math.min(6, Math.floor(maxHyp / c))));
  return rng() < 0.5 ? [a * k, b * k, c * k] : [b * k, a * k, c * k];
}

/** Right triangle with legs a (horizontal) and b (vertical), right angle at the origin, and labels for the three sides. */
function rightTriangle(a: number, b: number, labels: [string, string, string]): Visual {
  const [O, A, B]: Pt[] = [[0, 0], [a, 0], [0, b]];
  const u = Math.max(a, b) * 0.09;
  const g = centroid([O, A, B]);
  return fig([poly([O, A, B]), ...rightAngle(O, A, B, u), sideLabel(O, A, labels[0], g, u * 1.3), sideLabel(O, B, labels[1], g, u * 1.5), sideLabel(A, B, labels[2], g, u * 1.5)]);
}

// ── Area ─────────────────────────────────────────────────────────────────────

const area: Lesson = {
  topic: 'area',
  intro: [
    {
      text: 'Every area formula grows out of the rectangle. Take a parallelogram, slice a right triangle off one end, and slide it to the other end: you get a rectangle with the same base and the same HEIGHT. So a parallelogram\'s area is base × height, where the height is measured straight up, not along the slanted side.',
      visual: fig([
        poly([[0, 0], [2, 0], [2, 3]], 'shade'),
        poly([[0, 0], [6, 0], [8, 3], [2, 3]]),
        seg([2, 0], [2, 3], true),
        poly([[6, 0], [8, 0], [8, 3]], undefined, true),
        text([3, -0.45], 'base 6'),
        text([2.9, 1.5], 'height 3'),
      ], { caption: 'Slide the shaded triangle to the right end: a 6 × 3 rectangle.' }),
    },
    {
      text: 'Cut any parallelogram along a diagonal and you get two identical triangles. So a triangle is half a parallelogram: area = ½ × base × height. Any side can be the base, as long as the height is measured perpendicular to that side.',
    },
    {
      text: 'A trapezoid has two parallel sides, its bases. Put two copies together, one flipped, and they form a parallelogram whose base is the sum of the two bases. So a trapezoid\'s area is ½ × (base₁ + base₂) × height: the average of the bases, times the height.',
      visual: working([
        { label: 'Parallelogram', text: 'base × height' },
        { label: 'Triangle', text: '½ × base × height' },
        { label: 'Trapezoid', text: '½ × (base₁ + base₂) × height' },
      ]),
    },
    {
      text: 'Most contest areas are not found with a formula, though. They are found by subtraction: put the awkward shape inside a friendly one and remove what does not belong. A tilted triangle on a grid sits inside a rectangle, and what is left over is three right triangles.',
      visual: fig([
        poly([[0, 0], [5, 0], [5, 4], [0, 4]], undefined, true),
        poly([[0, 0], [5, 1], [2, 4]], 'shade'),
        text([3.2, 0.25], '2.5'),
        text([4.3, 3.1], '4.5'),
        text([0.55, 2.6], '4'),
      ], { grid: true, caption: 'Rectangle 20, minus 2.5, 4.5 and 4, leaves 9.' }),
    },
    {
      text: 'One more idea that solves a surprising number of problems: triangles with the same height have areas in the same ratio as their bases. If a point D divides side BC in the ratio 2 : 3, then triangles ABD and ADC, which share the height from A, have areas in the ratio 2 : 3.',
    },
  ],
  rungs: [
    {
      id: 'area/formulas',
      idea: 'Base times perpendicular height',
      buildsOn: 'triangles/angle-sum',
      generate: rng => {
        const variant = int(rng, 0, 2);
        if (variant === 0) {
          const [s, h, side] = triple(rng, 26);
          const b = int(rng, Math.max(4, Math.ceil(s / 2)), 16);
          const pts: Pt[] = [[0, 0], [b, 0], [b + s, h], [s, h]];
          const u = Math.max(b + s, h) * 0.07;
          return {
            prompt: `A parallelogram has sides of length ${b} and ${side}. The height drawn to the side of length ${b} is ${h}. What is its area?`,
            visual: fig([poly(pts), seg([s, 0], [s, h], true), text([b / 2, -u], `${b}`), sideLabel(pts[1], pts[2], `${side}`, [0, h], u), text([s + u * 1.1, h / 2], `${h}`)]),
            answer: { kind: 'number', value: b * h },
            hints: ['Area of a parallelogram is base × height. Which given number is NOT needed?', `The slanted side ${side} is a distraction. Use base ${b} and height ${h}.`],
            solution: [
              { text: `The height is the perpendicular distance between the two bases, not the length of the slanted side. The ${side} is extra information.` },
              { text: 'Multiply base by height.', visual: working([{ label: 'Area', text: `${b} × ${h} = ${b * h}` }]) },
            ],
          };
        }
        if (variant === 1) {
          const a = int(rng, 3, 12);
          const b = a + int(rng, 2, 10);
          let h = int(rng, 3, 12);
          if (((a + b) * h) % 2 === 1) h += 1;
          const off = Math.round((b - a) / 3);
          const pts: Pt[] = [[0, 0], [b, 0], [off + a, h], [off, h]];
          const u = Math.max(b, h) * 0.07;
          return {
            prompt: `A trapezoid has parallel sides of length ${a} and ${b}, and the distance between them is ${h}. What is its area?`,
            visual: fig([poly(pts), seg([off, 0], [off, h], true), text([b / 2, -u], `${b}`), text([off + a / 2, h + u], `${a}`), text([off + u * 0.9, h / 2], `${h}`)]),
            answer: { kind: 'number', value: ((a + b) * h) / 2 },
            hints: ['Average the two bases, then multiply by the height.', `The average of ${a} and ${b} is ${(a + b) / 2}.`],
            solution: [
              {
                text: 'A trapezoid behaves like a rectangle whose width is the average of the two bases.',
                visual: working([
                  { label: 'Average base', text: `(${a} + ${b}) ÷ 2 = ${(a + b) / 2}` },
                  { label: 'Area', text: `${(a + b) / 2} × ${h} = ${((a + b) * h) / 2}` },
                ]),
              },
            ],
          };
        }
        const b = int(rng, 4, 16);
        let h = int(rng, 3, 14);
        if ((b * h) % 2 === 1) h += 1;
        const over = int(rng, 1, 5);
        const pts: Pt[] = [[0, 0], [b, 0], [b + over, h]];
        const u = Math.max(b + over, h) * 0.07;
        return {
          prompt: `The triangle shown has a base of ${b}. Its height, measured to the line containing that base, is ${h}. What is its area?`,
          visual: fig([poly(pts), seg([b, 0], [b + over, 0], true), seg([b + over, 0], [b + over, h], true), text([b / 2, -u], `${b}`), text([b + over + u, h / 2], `${h}`)]),
          answer: { kind: 'number', value: (b * h) / 2 },
          hints: ['The height may fall outside the triangle. That changes nothing.', `Area = ½ × ${b} × ${h}.`],
          solution: [
            { text: 'This triangle leans so far that its height lands outside it. The formula does not care: the height is still the perpendicular distance from the top vertex to the line through the base.' },
            { text: 'Half of base times height.', visual: working([{ label: 'Area', text: `½ × ${b} × ${h} = ${(b * h) / 2}` }]) },
          ],
        };
      },
    },
    {
      id: 'area/grid',
      idea: 'Box it in and subtract',
      buildsOn: 'area/formulas',
      generate: rng => {
        const w = int(rng, 4, 8);
        const h = int(rng, 4, 7);
        let p = int(rng, 1, h - 1);
        const q = int(rng, 1, w - 1);
        if ((w * h - p * q) % 2 === 1) p = p > 1 ? p - 1 : p + 1;
        // If parity is still off (both p and q must change it), nudge again.
        const fix = (w * h - p * q) % 2 === 1;
        const qq = fix ? (q > 1 ? q - 1 : q + 1) : q;
        const [x0, y0] = [int(rng, 0, 2), int(rng, 0, 2)];
        const A: Pt = [x0, y0];
        const B: Pt = [x0 + w, y0 + p];
        const C: Pt = [x0 + qq, y0 + h];
        const t1 = (w * p) / 2;
        const t2 = ((w - qq) * (h - p)) / 2;
        const t3 = (qq * h) / 2;
        const value = w * h - t1 - t2 - t3;
        const ok = Number.isInteger(value);
        return {
          prompt: `What is the area of the triangle with vertices (${A.join(', ')}), (${B.join(', ')}) and (${C.join(', ')})?${ok ? '' : ' Give your answer as a fraction.'}`,
          visual: fig([poly([[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h]], undefined, true), poly([A, B, C], 'shade'), dot(A), dot(B), dot(C)], { grid: true, pad: 0.6 }),
          answer: ok ? { kind: 'number', value } : { kind: 'fraction', num: value * 2, den: 2 },
          hints: [
            `No side is horizontal or vertical, so box the triangle in: the rectangle around it is ${w} by ${h}.`,
            'Outside the triangle but inside the rectangle are three right triangles. Subtract them.',
          ],
          solution: [
            {
              text: 'Surround the triangle with a rectangle whose sides follow the grid, then remove the three right triangles in the corners.',
              visual: working([
                { label: 'Rectangle', text: `${w} × ${h} = ${w * h}` },
                { label: 'Bottom triangle', text: `½ × ${w} × ${p} = ${t1}` },
                { label: 'Right triangle', text: `½ × ${w - qq} × ${h - p} = ${t2}` },
                { label: 'Left triangle', text: `½ × ${qq} × ${h} = ${t3}` },
                { label: 'What is left', text: `${w * h} − ${t1} − ${t2} − ${t3} = ${value}` },
              ]),
            },
          ],
        };
      },
    },
    {
      id: 'area/subtract',
      idea: 'Area by subtraction',
      buildsOn: 'area/grid',
      generate: rng => {
        const variant = int(rng, 0, 2);
        if (variant === 0) {
          const w = int(rng, 6, 20);
          const h = int(rng, 4, 15);
          const t = int(rng, 1, 3);
          const value = (w + 2 * t) * (h + 2 * t) - w * h;
          return {
            prompt: `A rectangular garden measures ${w} m by ${h} m. A path ${t} m wide runs all the way around the outside of it. What is the area of the path, in square meters?`,
            visual: fig([poly([[-t, -t], [w + t, -t], [w + t, h + t], [-t, h + t]], 'shade'), poly([[0, 0], [w, 0], [w, h], [0, h]], 'erase'), text([w / 2, h / 2], `${w} × ${h}`)]),
            answer: { kind: 'number', value },
            hints: [`The garden plus the path is a bigger rectangle. The path adds ${t} m on BOTH sides in each direction.`, `The big rectangle is ${w + 2 * t} by ${h + 2 * t}.`],
            solution: [
              {
                text: 'Path = big rectangle − garden. The path widens each dimension twice, once on each side.',
                visual: working([
                  { label: 'Big rectangle', text: `${w + 2 * t} × ${h + 2 * t} = ${(w + 2 * t) * (h + 2 * t)}` },
                  { label: 'Garden', text: `${w} × ${h} = ${w * h}` },
                  { label: 'Path', text: `${(w + 2 * t) * (h + 2 * t)} − ${w * h} = ${value}` },
                ]),
              },
            ],
          };
        }
        if (variant === 1) {
          const a = int(rng, 1, 4);
          const s = 2 * a + int(rng, 2, 8);
          const pts: Pt[] = [[a, 0], [s - a, 0], [s, a], [s, s - a], [s - a, s], [a, s], [0, s - a], [0, a]];
          return {
            prompt: `From each corner of a square of side ${s}, an isosceles right triangle with legs of length ${a} is cut off, leaving an octagon. What is the area of the octagon?`,
            visual: fig([poly([[0, 0], [s, 0], [s, s], [0, s]], undefined, true), poly(pts, 'shade')]),
            answer: { kind: 'number', value: s * s - 2 * a * a },
            hints: [`Each cut-off triangle has area ½ × ${a} × ${a}.`, 'Four of them fit together into two squares.'],
            solution: [
              {
                text: 'Octagon = square − four corner triangles.',
                visual: working([
                  { label: 'Square', text: `${s}² = ${s * s}` },
                  { label: 'One corner', text: `½ × ${a} × ${a} = ${(a * a) / 2}` },
                  { label: 'Four corners', text: `4 × ${(a * a) / 2} = ${2 * a * a}` },
                  { label: 'Octagon', text: `${s * s} − ${2 * a * a} = ${s * s - 2 * a * a}` },
                ]),
              },
            ],
          };
        }
        const W = int(rng, 8, 16);
        const H = int(rng, 7, 14);
        const cw = int(rng, 2, W - 3);
        const ch = int(rng, 2, H - 3);
        const pts: Pt[] = [[0, 0], [W, 0], [W, H - ch], [W - cw, H - ch], [W - cw, H], [0, H]];
        const u = Math.max(W, H) * 0.07;
        return {
          prompt: `All the corners of this L-shaped room are right angles. What is its area?`,
          visual: fig([poly(pts, 'shade'), text([W / 2, -u], `${W}`), text([-u, H / 2], `${H}`), text([W + u, (H - ch) / 2], `${H - ch}`), text([(W - cw) / 2, H + u], `${W - cw}`)]),
          answer: { kind: 'number', value: W * H - cw * ch },
          hints: [
            `Complete the L to a ${W} by ${H} rectangle. What are the dimensions of the missing corner?`,
            `The missing corner is ${W} − ${W - cw} = ${cw} wide and ${H} − ${H - ch} = ${ch} tall.`,
          ],
          solution: [
            {
              text: 'Fill in the missing corner to make a full rectangle, then take the corner away again.',
              visual: working([
                { label: 'Full rectangle', text: `${W} × ${H} = ${W * H}` },
                { label: 'Missing corner', text: `${cw} × ${ch} = ${cw * ch}` },
                { label: 'L-shape', text: `${W * H} − ${cw * ch} = ${W * H - cw * ch}` },
              ]),
            },
            { text: `Cutting the L into two rectangles works too: ${W} × ${H - ch} + ${W - cw} × ${ch} = ${W * (H - ch)} + ${(W - cw) * ch} = ${W * H - cw * ch}.` },
          ],
        };
      },
    },
    {
      id: 'area/shared-height',
      idea: 'Same height: areas follow the bases',
      buildsOn: 'ratios/one-part',
      generate: rng => {
        if (rng() < 0.55) {
          const m = int(rng, 1, 5);
          let n = int(rng, 1, 6);
          if (n === m) n += 1;
          const unit = int(rng, 2, 9);
          const total = unit * (m + n);
          const wantLeft = rng() < 0.5;
          const [B, C, A]: Pt[] = [[0, 0], [10, 0], [3.5, 6]];
          const D: Pt = [(10 * m) / (m + n), 0];
          const g = centroid([A, B, C]);
          return {
            prompt: `Triangle ABC has area ${total}. Point D is on side BC with BD : DC = ${m} : ${n}. What is the area of triangle ${wantLeft ? 'ABD' : 'ADC'}?`,
            visual: fig([poly([A, B, C]), seg(A, D), cornerLabel(A, 'A', g, 0.6), cornerLabel(B, 'B', g, 0.6), cornerLabel(C, 'C', g, 0.6), text([D[0], -0.6], 'D')]),
            answer: { kind: 'number', value: unit * (wantLeft ? m : n) },
            hints: [
              'Triangles ABD and ADC have the same height, measured from A down to line BC.',
              `With equal heights, their areas are in the ratio of their bases, ${m} : ${n}. Split ${total} into ${m + n} parts.`,
            ],
            solution: [
              { text: 'Both small triangles have their bases on BC and share the vertex A, so they have the same height. Their areas are in the same ratio as their bases.' },
              {
                text: `Split the whole area in the ratio ${m} : ${n}.`,
                visual: working([
                  { label: 'Parts', text: `${m} + ${n} = ${m + n}` },
                  { label: 'One part', text: `${total} ÷ ${m + n} = ${unit}` },
                  { label: wantLeft ? 'Triangle ABD' : 'Triangle ADC', text: `${wantLeft ? m : n} × ${unit} = ${unit * (wantLeft ? m : n)}` },
                ]),
              },
            ],
          };
        }
        const [a, ha, b] = pick(rng, [[12, 5, 10], [15, 8, 12], [10, 6, 4], [9, 8, 6], [20, 9, 15], [14, 6, 21], [16, 9, 12], [18, 10, 15], [8, 15, 10], [24, 5, 8], [21, 8, 14]] as const);
        const hb = (a * ha) / b;
        return {
          prompt: `A triangle has a side of length ${a} whose altitude is ${ha}. Another side of the same triangle has length ${b}. What is the length of the altitude to that side?`,
          answer: { kind: 'number', value: hb },
          hints: ['The area of the triangle is the same whichever side you call the base.', `½ × ${a} × ${ha} = ½ × ${b} × h.`],
          solution: [
            {
              text: 'Compute the area with the first base, then use it with the second.',
              visual: working([
                { label: 'Area', text: `½ × ${a} × ${ha} = ${(a * ha) / 2}` },
                { label: 'Same area', text: `½ × ${b} × h = ${(a * ha) / 2}` },
                { label: 'So', text: `h = ${a * ha} ÷ ${b} = ${hb}` },
              ]),
            },
            { text: 'Longer side, shorter altitude. Their product is always twice the area.' },
          ],
        };
      },
    },
  ],
};

// ── Pythagorean Theorem ──────────────────────────────────────────────────────

const pythagorean: Lesson = {
  topic: 'pythagorean',
  intro: [
    {
      text: 'In a right triangle, the two sides that form the right angle are the legs, and the side across from it is the hypotenuse, always the longest side. The Pythagorean theorem says the squares of the legs add up to the square of the hypotenuse: a² + b² = c².',
      visual: rightTriangle(4, 3, ['4', '3', '5']),
    },
    {
      text: 'Check it on the triangle shown: 3² + 4² = 9 + 16 = 25 = 5². Whole-number solutions like 3-4-5 are called Pythagorean triples, and contest writers love them. Memorize these four and you will rarely need to compute a square root.',
      visual: working([
        { text: '3, 4, 5' },
        { text: '5, 12, 13' },
        { text: '8, 15, 17' },
        { text: '7, 24, 25' },
      ]),
    },
    {
      text: 'Any multiple of a triple is a triple too: doubling 3-4-5 gives 6-8-10, and ten times it is 30-40-50. So when you see a right triangle with legs 18 and 24, divide out the 6 to see 3 and 4, and the hypotenuse must be 6 × 5 = 30.',
    },
    {
      text: 'The distance between two points on a grid is the same theorem. Draw the horizontal and vertical legs between the points and the distance is the hypotenuse. From (1, 2) to (7, 10) is 6 across and 8 up, so the distance is 10.',
      visual: fig([seg([1, 2], [7, 2], true), seg([7, 2], [7, 10], true), seg([1, 2], [7, 10]), dot([1, 2]), dot([7, 10]), text([4, 1.4], '6'), text([7.6, 6], '8'), text([3.3, 6.4], '10')], { grid: true, pad: 1 }),
    },
    {
      text: 'The real skill is finding right triangles that are not drawn for you. The altitude of an isosceles triangle splits it into two matching right triangles. The diagonals of a rhombus cut it into four. A ladder against a wall, a diagonal of a rectangle, the long diagonal of a box: each hides a right triangle. Draw it, and the theorem does the rest.',
    },
  ],
  rungs: [
    {
      id: 'pythagorean/triples',
      idea: 'Find the missing side',
      buildsOn: 'exponents/radicals',
      generate: rng => {
        const [a, b, c] = triple(rng);
        const findHyp = rng() < 0.5;
        return {
          prompt: findHyp
            ? `A right triangle has legs of length ${a} and ${b}. How long is its hypotenuse?`
            : `A right triangle has a hypotenuse of length ${c} and one leg of length ${a}. How long is the other leg?`,
          visual: rightTriangle(a, b, findHyp ? [`${a}`, `${b}`, '?'] : [`${a}`, '?', `${c}`]),
          answer: { kind: 'number', value: findHyp ? c : b },
          hints: [
            findHyp ? `c² = ${a}² + ${b}².` : `${a}² + b² = ${c}², so b² = ${c}² − ${a}².`,
            findHyp ? `${a * a} + ${b * b} = ${fmt(c * c)}. What number squared is that?` : `${fmt(c * c)} − ${a * a} = ${b * b}. What number squared is that?`,
          ],
          solution: [
            {
              text: findHyp ? 'The squares of the legs add up to the square of the hypotenuse.' : 'The hypotenuse is the longest side, so subtract.',
              visual: working(
                findHyp
                  ? [
                      { label: 'Theorem', text: `c² = ${a}² + ${b}² = ${a * a} + ${b * b} = ${fmt(c * c)}` },
                      { label: 'Root', text: `c = ${c}` },
                    ]
                  : [
                      { label: 'Theorem', text: `b² = ${c}² − ${a}² = ${fmt(c * c)} − ${a * a} = ${b * b}` },
                      { label: 'Root', text: `b = ${b}` },
                    ],
              ),
            },
            (() => {
              const g = [a, b, c].reduce((x, y) => { while (y) [x, y] = [y, x % y]; return x; });
              const base = [a, b, c].map(v => v / g).sort((x, y) => x - y);
              return { text: g === 1 ? `This is the ${base.join('-')} triple. Worth knowing on sight.` : `Faster: divide everything by ${g} and it is the ${base.join('-')} triple, scaled up by ${g}.` };
            })(),
          ],
        };
      },
    },
    {
      id: 'pythagorean/distance',
      idea: 'Distance is a hypotenuse',
      buildsOn: 'pythagorean/triples',
      generate: rng => {
        const [dx, dy, d] = triple(rng, 30);
        if (rng() < 0.6) {
          const x1 = int(rng, -6, 6);
          const y1 = int(rng, -6, 6);
          const sx = rng() < 0.5 ? 1 : -1;
          const sy = rng() < 0.5 ? 1 : -1;
          const [x2, y2] = [x1 + sx * dx, y1 + sy * dy];
          const n = (v: number) => (v < 0 ? `−${-v}` : `${v}`);
          return {
            prompt: `What is the distance between the points (${n(x1)}, ${n(y1)}) and (${n(x2)}, ${n(y2)})?`,
            answer: { kind: 'number', value: d },
            hints: [
              'How far apart are the points horizontally? Vertically? Those are the legs of a right triangle.',
              `The legs are ${dx} and ${dy}.`,
            ],
            solution: [
              {
                text: 'The horizontal and vertical gaps are the legs, and the distance is the hypotenuse.',
                visual: working([
                  { label: 'Horizontal gap', text: `${dx}` },
                  { label: 'Vertical gap', text: `${dy}` },
                  { label: 'Distance²', text: `${dx}² + ${dy}² = ${dx * dx} + ${dy * dy} = ${fmt(d * d)}` },
                  { label: 'Distance', text: `${d}` },
                ]),
              },
              { text: 'Signs do not matter for the gaps: a distance is never negative, and squaring erases the sign anyway.' },
            ],
          };
        }
        const diag = rng() < 0.5;
        return {
          prompt: diag
            ? `A rectangle is ${dx} cm by ${dy} cm. How many centimeters long is its diagonal?`
            : `A rectangular field has a diagonal path ${d} m long. One side of the field is ${dx} m. What is the area of the field, in square meters?`,
          answer: { kind: 'number', value: diag ? d : dx * dy },
          hints: diag
            ? ['The diagonal cuts the rectangle into two right triangles.', `Its length is the hypotenuse of a triangle with legs ${dx} and ${dy}.`]
            : ['The diagonal and two sides make a right triangle. Find the other side first.', `Other side² = ${d}² − ${dx}² = ${dy * dy}.`],
          solution: [
            {
              text: 'A diagonal of a rectangle is the hypotenuse of a right triangle formed with two of its sides.',
              visual: working(
                diag
                  ? [
                      { label: 'Diagonal²', text: `${dx}² + ${dy}² = ${fmt(d * d)}` },
                      { label: 'Diagonal', text: `${d} cm` },
                    ]
                  : [
                      { label: 'Other side²', text: `${d}² − ${dx}² = ${fmt(d * d)} − ${dx * dx} = ${dy * dy}` },
                      { label: 'Other side', text: `${dy} m` },
                      { label: 'Area', text: `${dx} × ${dy} = ${fmt(dx * dy)}` },
                    ],
              ),
            },
          ],
        };
      },
    },
    {
      id: 'pythagorean/hidden',
      idea: 'Find the right triangle that is not drawn',
      buildsOn: 'pythagorean/distance',
      generate: rng => {
        const [a, b, c] = triple(rng, 39);
        const variant = int(rng, 0, 2);
        if (variant === 0) {
          const [A, B, C]: Pt[] = [[0, 0], [2 * a, 0], [a, b]];
          const u = Math.max(2 * a, b) * 0.08;
          return {
            prompt: `An isosceles triangle has sides of length ${c}, ${c} and ${2 * a}. What is its area?`,
            visual: fig([poly([A, B, C]), seg([a, 0], C, true), sideLabel(A, C, `${c}`, [a, 0], u), sideLabel(B, C, `${c}`, [a, 0], u), text([a, -u], `${2 * a}`)]),
            answer: { kind: 'number', value: a * b },
            hints: [
              `Draw the altitude to the base of length ${2 * a}. In an isosceles triangle it lands at the midpoint.`,
              `That makes a right triangle with hypotenuse ${c} and one leg ${a}. The other leg is the height.`,
            ],
            solution: [
              { text: `You need a height. The altitude from the top vertex cuts the base in half, creating two right triangles with hypotenuse ${c} and leg ${a}.` },
              {
                text: 'Find the height, then the area.',
                visual: working([
                  { label: 'Height²', text: `${c}² − ${a}² = ${c * c} − ${a * a} = ${b * b}` },
                  { label: 'Height', text: `${b}` },
                  { label: 'Area', text: `½ × ${2 * a} × ${b} = ${a * b}` },
                ]),
              },
            ],
          };
        }
        if (variant === 1) {
          const askPerimeter = rng() < 0.5;
          return {
            prompt: askPerimeter
              ? `The diagonals of a rhombus have lengths ${2 * a} and ${2 * b}. What is the perimeter of the rhombus?`
              : `A rhombus has sides of length ${c}, and one of its diagonals has length ${2 * a}. How long is the other diagonal?`,
            visual: fig([poly([[-a, 0], [0, -b], [a, 0], [0, b]]), seg([-a, 0], [a, 0], true), seg([0, -b], [0, b], true)]),
            answer: { kind: 'number', value: askPerimeter ? 4 * c : 2 * b },
            hints: [
              'The diagonals of a rhombus cross at right angles and cut each other in half.',
              askPerimeter ? `So each side is the hypotenuse of a right triangle with legs ${a} and ${b}.` : `Each side is the hypotenuse of a right triangle with one leg ${a}. The other leg is half the missing diagonal.`,
            ],
            solution: [
              { text: 'The diagonals of a rhombus are perpendicular bisectors of each other, so they cut the rhombus into four identical right triangles whose hypotenuse is a side.' },
              {
                text: 'Work with the half-diagonals.',
                visual: working(
                  askPerimeter
                    ? [
                        { label: 'Half-diagonals', text: `${a} and ${b}` },
                        { label: 'Side', text: `√(${a}² + ${b}²) = √${c * c} = ${c}` },
                        { label: 'Perimeter', text: `4 × ${c} = ${4 * c}` },
                      ]
                    : [
                        { label: 'Half of known diagonal', text: `${a}` },
                        { label: 'Other half-diagonal', text: `√(${c}² − ${a}²) = √${b * b} = ${b}` },
                        { label: 'Other diagonal', text: `2 × ${b} = ${2 * b}` },
                      ],
                ),
              },
            ],
          };
        }
        return {
          prompt: `A ladder ${c} feet long leans against a vertical wall, with its foot ${a} feet from the base of the wall. How many feet up the wall does the ladder reach?`,
          answer: { kind: 'number', value: b },
          hints: ['The wall, the ground and the ladder form a right triangle. Which side is the ladder?', `The ladder is the hypotenuse: height² = ${c}² − ${a}².`],
          solution: [
            {
              text: 'The wall meets the ground at a right angle, so the ladder is the hypotenuse.',
              visual: working([
                { label: 'Height²', text: `${c}² − ${a}² = ${c * c} − ${a * a} = ${b * b}` },
                { label: 'Height', text: `${b} feet` },
              ]),
            },
          ],
        };
      },
    },
    {
      id: 'pythagorean/two-steps',
      idea: 'Build the right triangle first',
      buildsOn: 'pythagorean/hidden',
      generate: rng => {
        const variant = int(rng, 0, 2);
        if (variant === 0) {
          const [l, w, h, d] = pick(rng, [[1, 2, 2, 3], [2, 3, 6, 7], [1, 4, 8, 9], [4, 4, 7, 9], [2, 6, 9, 11], [6, 6, 7, 11], [3, 4, 12, 13], [2, 10, 11, 15], [2, 5, 14, 15], [8, 9, 12, 17], [12, 16, 21, 29], [6, 8, 24, 26], [9, 12, 20, 25]] as const);
          const floor2 = l * l + w * w;
          return {
            prompt: `A rectangular box is ${l} by ${w} by ${h}. What is the length of the diagonal that runs from one corner, through the inside of the box, to the opposite corner?`,
            answer: { kind: 'number', value: d },
            hints: [
              'First find the diagonal of the bottom face. Then that diagonal and a vertical edge are the legs of a second right triangle.',
              `Diagonal² = ${l}² + ${w}² + ${h}².`,
            ],
            solution: [
              {
                text: 'Use the theorem twice: once across the floor, once up through the box.',
                visual: working([
                  { label: 'Floor diagonal²', text: `${l}² + ${w}² = ${floor2}` },
                  { label: 'Space diagonal²', text: `${floor2} + ${h}² = ${floor2 + h * h}` },
                  { label: 'Space diagonal', text: `√${floor2 + h * h} = ${d}` },
                ]),
              },
              { text: `You never need the floor diagonal itself, only its square. In one line: √(${l}² + ${w}² + ${h}²) = ${d}.` },
            ],
          };
        }
        const [a, b, c] = triple(rng, 39);
        if (variant === 1) {
          const short = int(rng, 4, 20);
          return {
            prompt: `Two vertical poles stand ${a} m apart on level ground. One is ${short} m tall and the other is ${short + b} m tall. A wire runs straight from the top of one to the top of the other. How many meters long is the wire?`,
            answer: { kind: 'number', value: c },
            hints: [
              'Draw a horizontal line from the top of the shorter pole across to the taller pole.',
              `That makes a right triangle with legs ${a} (the distance apart) and ${short + b} − ${short} = ${b} (the difference in heights).`,
            ],
            solution: [
              { text: 'Slide the ground up to the top of the shorter pole. The wire is then the hypotenuse of a right triangle whose legs are the gap between the poles and the DIFFERENCE of their heights.' },
              {
                text: 'Compute the legs, then the hypotenuse.',
                visual: working([
                  { label: 'Horizontal leg', text: `${a}` },
                  { label: 'Vertical leg', text: `${short + b} − ${short} = ${b}` },
                  { label: 'Wire', text: `√(${a}² + ${b}²) = √${c * c} = ${c} m` },
                ]),
              },
            ],
          };
        }
        const first = int(rng, 1, a - 1);
        return {
          prompt: `Mia walks ${first} km north, then ${b} km east, then another ${a - first} km north. How many kilometers is she from her starting point, in a straight line?`,
          answer: { kind: 'number', value: c },
          hints: ['Combine the two northward legs. Only the totals in each direction matter.', `She ends up ${a} km north and ${b} km east of the start.`],
          solution: [
            {
              text: 'Where she ends up depends only on the total distance in each direction.',
              visual: working([
                { label: 'North in all', text: `${first} + ${a - first} = ${a}` },
                { label: 'East in all', text: `${b}` },
                { label: 'Straight line', text: `√(${a}² + ${b}²) = √${c * c} = ${c} km` },
              ]),
            },
          ],
        };
      },
    },
  ],
};

// ── Special Right Triangles ──────────────────────────────────────────────────

const specialRight: Lesson = {
  topic: 'special_right',
  intro: [
    {
      text: 'Cut a square along its diagonal and you get a right triangle with two 45° angles. If the square has side 1, the Pythagorean theorem gives a diagonal of √(1² + 1²) = √2. Every 45-45-90 triangle is a scaled copy of this one, so its sides are always in the ratio 1 : 1 : √2. The hypotenuse is a leg times √2.',
      visual: (() => {
        const [O, A, B]: Pt[] = [[0, 0], [4, 0], [0, 4]];
        return fig([poly([O, A, [4, 4], B], undefined, true), poly([O, A, B]), ...rightAngle(O, A, B, 0.4), text([2, -0.45], '1'), text([-0.4, 2], '1'), text([2.5, 2.45], '√2'), angleLabel(A, O, B, '45°', 1.1), angleLabel(B, O, A, '45°', 1.1)]);
      })(),
    },
    {
      text: 'Cut an equilateral triangle down the middle and you get a right triangle with angles 30°, 60° and 90°. If the equilateral triangle has side 2, the short leg is half a side, 1, and the hypotenuse is a full side, 2. The long leg is √(2² − 1²) = √3. So every 30-60-90 triangle has sides in the ratio 1 : √3 : 2.',
      visual: (() => {
        const h = 2 * Math.sqrt(3);
        const [L, M, R, T]: Pt[] = [[-2, 0], [0, 0], [2, 0], [0, h]];
        return fig([poly([L, R, T], undefined, true), poly([M, R, T]), ...rightAngle(M, R, T, 0.3), text([1, -0.4], '1'), text([-0.45, h / 2], '√3'), text([1.5, h / 2 + 0.2], '2'), angleLabel(R, M, T, '60°', 0.8), angleLabel(T, M, R, '30°', 1.4)]);
      })(),
    },
    {
      text: 'To keep the 30-60-90 sides straight, match sides to the angles across from them: the smallest side (1) is across from the smallest angle (30°), the middle side (√3 ≈ 1.73) is across from 60°, and the biggest side (2) is across from the right angle. The hypotenuse is exactly double the short leg.',
      visual: working([
        { label: '45-45-90', text: 'leg : leg : hypotenuse = 1 : 1 : √2' },
        { label: '30-60-90', text: 'short : long : hypotenuse = 1 : √3 : 2' },
      ]),
    },
    {
      text: 'Those two triangles unlock exact answers for squares, equilateral triangles and regular hexagons. An equilateral triangle with side s has height (s/2)√3, so its area is ½ × s × (s/2)√3 = (s²√3)/4. A regular hexagon is six of those triangles.',
    },
    {
      text: 'Going backwards sometimes leaves a root in a denominator. If the hypotenuse of a 45-45-90 triangle is 6, each leg is 6/√2. Multiply top and bottom by √2 to tidy it: 6√2/2 = 3√2.',
    },
  ],
  rungs: [
    {
      id: 'special_right/45',
      idea: 'Half a square: 1 : 1 : √2',
      buildsOn: 'pythagorean/triples',
      generate: rng => {
        const variant = int(rng, 0, 2);
        if (variant === 0) {
          const s = int(rng, 2, 15);
          return {
            prompt: `What is the length of a diagonal of a square with side ${s}?`,
            answer: choices(rng, `${s}√2`, [`${2 * s}`, `${s}√3`, `${s * s}`, `${s}√${s}`].slice(0, 3)),
            hints: ['The diagonal splits the square into two 45-45-90 triangles.', 'In a 45-45-90 triangle the hypotenuse is a leg times √2.'],
            solution: [
              { text: `The diagonal is the hypotenuse of a 45-45-90 triangle whose legs are sides of the square, so it is ${s}√2.` },
              { text: 'The theorem confirms it.', visual: working([{ label: 'Diagonal²', text: `${s}² + ${s}² = ${2 * s * s}` }, { label: 'Diagonal', text: `√${2 * s * s} = ${root(2 * s * s)}` }]) },
            ],
          };
        }
        if (variant === 1) {
          const d = 2 * int(rng, 2, 12);
          return {
            prompt: `A square has a diagonal of length ${d}. What is its area?`,
            answer: { kind: 'number', value: (d * d) / 2 },
            hints: [`If the side is s, the diagonal is s√2, and the theorem says s² + s² = ${d}².`, `2s² = ${d * d}, and s² is exactly the area.`],
            solution: [
              {
                text: 'You do not need the side itself, only its square.',
                visual: working([
                  { label: 'Theorem', text: `s² + s² = ${d}² = ${d * d}` },
                  { label: 'Area', text: `s² = ${d * d} ÷ 2 = ${(d * d) / 2}` },
                ]),
              },
              { text: `(The side is ${root((d * d) / 2)}.) Handy fact: a square's area is half the square of its diagonal.` },
            ],
          };
        }
        const k = int(rng, 2, 11);
        return {
          prompt: `An isosceles right triangle has a hypotenuse of length ${2 * k}. How long is each leg?`,
          answer: choices(rng, `${k}√2`, [`${k}`, `${2 * k}√2`, `${k}√3`]),
          hints: ['Leg × √2 = hypotenuse, so leg = hypotenuse ÷ √2.', `${2 * k}/√2: multiply top and bottom by √2.`],
          solution: [
            {
              text: 'Divide the hypotenuse by √2, then clear the root from the denominator.',
              visual: working([
                { label: 'Leg', text: `${2 * k}/√2` },
                { label: 'Rationalize', text: `${2 * k}√2/2` },
                { label: 'Simplify', text: `${k}√2` },
              ]),
            },
            { text: `Check: (${k}√2)² + (${k}√2)² = ${2 * k * k} + ${2 * k * k} = ${4 * k * k} = ${2 * k}².` },
          ],
        };
      },
    },
    {
      id: 'special_right/30-60',
      idea: 'Half an equilateral triangle: 1 : √3 : 2',
      buildsOn: 'special_right/45',
      generate: rng => {
        const k = int(rng, 2, 14);
        const variant = int(rng, 0, 2);
        const ratio = { text: 'In a 30-60-90 triangle the sides are in the ratio 1 : √3 : 2, opposite the 30°, 60° and 90° angles in that order.' };
        if (variant === 0) {
          return {
            prompt: `In a 30-60-90 triangle the hypotenuse is ${2 * k}. How long is the side opposite the 30° angle?`,
            answer: { kind: 'number', value: k },
            hints: ['The side opposite 30° is the shortest side.', 'The hypotenuse is exactly twice the shortest side.'],
            solution: [ratio, { text: `The shortest side is half the hypotenuse: ${2 * k} ÷ 2 = ${k}.` }],
          };
        }
        if (variant === 1) {
          return {
            prompt: `In a 30-60-90 triangle the shortest side is ${k}. How long is the side opposite the 60° angle?`,
            answer: choices(rng, `${k}√3`, [`${2 * k}`, `${k}√2`, `${3 * k}`]),
            hints: ['The side opposite 60° is the middle-length side.', 'It is the short leg times √3.'],
            solution: [ratio, { text: `Scale the ratio by ${k}: the sides are ${k}, ${k}√3 and ${2 * k}. The side opposite 60° is ${k}√3.` }],
          };
        }
        return {
          prompt: `In a 30-60-90 triangle the longer leg is ${k}√3. How long is the hypotenuse?`,
          answer: { kind: 'number', value: 2 * k },
          hints: ['The longer leg is the short leg times √3. What is the short leg?', `The short leg is ${k}, and the hypotenuse is twice that.`],
          solution: [ratio, { text: `The longer leg ${k}√3 matches the √3 in the ratio, so the scale factor is ${k}. The hypotenuse is 2 × ${k} = ${2 * k}.` }],
        };
      },
    },
    {
      id: 'special_right/equilateral',
      idea: 'Equilateral triangles and hexagons',
      buildsOn: 'special_right/30-60',
      generate: rng => {
        const s = 2 * int(rng, 1, 9);
        const variant = int(rng, 0, 2);
        const heightStep = { text: `The altitude of an equilateral triangle with side ${s} splits it into two 30-60-90 triangles with short leg ${s / 2}, so the height is ${s / 2 === 1 ? '' : s / 2}√3.` };
        if (variant === 0) {
          return {
            prompt: `How tall is an equilateral triangle with side ${s}?`,
            answer: choices(rng, `${s / 2 === 1 ? '' : s / 2}√3`, [`${s}√3`, `${s / 2 === 1 ? '' : s / 2}√2`, `${s}`, `${s / 2}`].slice(0, 3)),
            hints: ['Draw the altitude. It cuts the base in half and makes a 30-60-90 triangle.', `The short leg is ${s / 2} and the hypotenuse is ${s}. The height is the long leg.`],
            solution: [heightStep],
          };
        }
        if (variant === 1) {
          return {
            prompt: `The area of an equilateral triangle with side ${s} can be written as k√3. What is k?`,
            answer: { kind: 'number', value: (s * s) / 4 },
            hints: [`First find the height: the long leg of a 30-60-90 triangle with short leg ${s / 2}.`, `Area = ½ × ${s} × ${s / 2 === 1 ? '' : s / 2}√3.`],
            solution: [
              heightStep,
              {
                text: 'Now half of base times height.',
                visual: working([
                  { label: 'Area', text: `½ × ${s} × ${s / 2 === 1 ? '' : s / 2}√3` },
                  { label: 'Simplify', text: `${(s * s) / 4}√3, so k = ${(s * s) / 4}` },
                ]),
              },
              { text: `The general formula is s²√3/4: ${s * s}√3/4 = ${(s * s) / 4}√3.` },
            ],
          };
        }
        return {
          prompt: `The area of a regular hexagon with side ${s} can be written as k√3. What is k?`,
          visual: (() => {
            const pts: Pt[] = Array.from({ length: 6 }, (_, i) => [3 * Math.cos((i * Math.PI) / 3), 3 * Math.sin((i * Math.PI) / 3)] as Pt);
            return fig([poly(pts), seg(pts[0], pts[3], true), seg(pts[1], pts[4], true), seg(pts[2], pts[5], true)]);
          })(),
          answer: { kind: 'number', value: (6 * s * s) / 4 },
          hints: ['Connect the center to every vertex. What six shapes appear?', `Six equilateral triangles of side ${s}, each with area ${(s * s) / 4}√3.`],
          solution: [
            { text: `Lines from the center to the vertices cut a regular hexagon into six equilateral triangles with side ${s}.` },
            {
              text: 'Find one triangle and multiply by 6.',
              visual: working([
                { label: 'One triangle', text: `${s}² × √3 ÷ 4 = ${(s * s) / 4}√3` },
                { label: 'Hexagon', text: `6 × ${(s * s) / 4}√3 = ${(6 * s * s) / 4}√3` },
              ]),
            },
          ],
        };
      },
    },
    {
      id: 'special_right/combined',
      idea: 'Work backwards and combine',
      buildsOn: 'special_right/equilateral',
      generate: rng => {
        const variant = int(rng, 0, 2);
        if (variant === 0) {
          const m = int(rng, 1, 7);
          const L = 3 * m;
          return {
            prompt: `In a 30-60-90 triangle the longer leg is ${L}. How long is the hypotenuse?`,
            answer: choices(rng, `${2 * m}√3`, [`${2 * L}`, `${L}√3`, `${m}√3`, `${2 * L}√3`].slice(0, 3)),
            hints: [`The longer leg is the short leg times √3, so the short leg is ${L}/√3.`, `${L}/√3 = ${L}√3/3 = ${m === 1 ? '' : m}√3. Double it for the hypotenuse.`],
            solution: [
              {
                text: 'Go from the long leg back to the short leg by dividing by √3, then rationalize.',
                visual: working([
                  { label: 'Short leg', text: `${L}/√3 = ${L}√3/3 = ${m === 1 ? '' : m}√3` },
                  { label: 'Hypotenuse', text: `2 × ${m === 1 ? '' : m}√3 = ${2 * m}√3` },
                ]),
              },
              { text: `Check with the theorem: ${L}² + (${m === 1 ? '' : m}√3)² = ${L * L} + ${3 * m * m} = ${L * L + 3 * m * m}, and (${2 * m}√3)² = ${12 * m * m}.` },
            ],
          };
        }
        if (variant === 1) {
          const h = int(rng, 2, 12);
          const [A, B, C, F]: Pt[] = [[0, 0], [4 + 4 * Math.sqrt(3), 0], [4, 4], [4, 0]];
          return {
            prompt: `In triangle ABC, angle A is 45° and angle B is 30°. The altitude from C to side AB has length ${h}. How long is AB?`,
            visual: fig([poly([A, B, C]), seg(C, F, true), ...rightAngle(F, B, C, 0.35), text([-0.4, -0.3], 'A'), text([B[0] + 0.4, -0.3], 'B'), text([4, 4.5], 'C'), angleLabel(A, B, C, '45°', 1.4), angleLabel(B, A, C, '30°', 2.4), text([4.4, 2], `${h}`)]),
            answer: choices(rng, `${h} + ${h}√3`, [`${2 * h}`, `${h} + ${h}√2`, `${h}√2 + ${h}√3`, `${2 * h}√3`].slice(0, 3)),
            hints: [
              'The altitude splits the triangle into a 45-45-90 triangle on the left and a 30-60-90 triangle on the right.',
              `In the left triangle the two legs are equal. In the right triangle the altitude ${h} is the SHORT leg (it is opposite the 30° angle).`,
            ],
            solution: [
              { text: `The altitude creates two special right triangles that share the leg of length ${h}.` },
              {
                text: 'Find the piece of AB under each one.',
                visual: working([
                  { label: 'Left (45-45-90)', text: `legs are equal: ${h}` },
                  { label: 'Right (30-60-90)', text: `${h} is opposite 30°, so the long leg is ${h}√3` },
                  { label: 'AB', text: `${h} + ${h}√3` },
                ]),
              },
            ],
          };
        }
        const m = int(rng, 1, 6);
        const h = 3 * m;
        return {
          prompt: `An equilateral triangle has a height of ${h}. Its area can be written as k√3. What is k?`,
          answer: { kind: 'number', value: 3 * m * m },
          hints: [`The height is the long leg of a 30-60-90 triangle, so half the side is ${h}/√3 = ${m === 1 ? '' : m}√3.`, `The full side is ${2 * m}√3. Area = ½ × side × height.`],
          solution: [
            {
              text: 'Work back from the height to the side, then compute the area.',
              visual: working([
                { label: 'Half the side', text: `${h}/√3 = ${m === 1 ? '' : m}√3` },
                { label: 'Side', text: `${2 * m}√3` },
                { label: 'Area', text: `½ × ${2 * m}√3 × ${h} = ${3 * m * m}√3` },
              ]),
            },
          ],
        };
      },
    },
  ],
};

// ── Quadrilaterals ───────────────────────────────────────────────────────────

const quadrilaterals: Lesson = {
  topic: 'quadrilaterals',
  intro: [
    {
      text: 'Quadrilaterals form a family. A trapezoid has one pair of parallel sides. A parallelogram has two pairs. A rhombus is a parallelogram with four equal sides, a rectangle is a parallelogram with four right angles, and a square is both at once. Whatever is true of a parallelogram is automatically true of a rhombus, a rectangle and a square.',
    },
    {
      text: 'In every parallelogram: opposite sides are equal, opposite angles are equal, neighboring angles add to 180° (they are co-interior angles between parallel lines), and the diagonals cut each other in half. And the angles of ANY quadrilateral add to 360°, since a diagonal splits it into two triangles.',
      visual: (() => {
        const pts: Pt[] = [[0, 0], [6, 0], [8, 3.5], [2, 3.5]];
        return fig([poly(pts), angleLabel(pts[0], pts[1], pts[3], '60°', 1.2), angleLabel(pts[1], pts[0], pts[2], '120°', 1), angleLabel(pts[2], pts[1], pts[3], '60°', 1.2), angleLabel(pts[3], pts[0], pts[2], '120°', 1)]);
      })(),
    },
    {
      text: 'In a rhombus or a kite, the diagonals cross at right angles. That makes the area easy: the diagonals cut the shape into right triangles that rearrange into half of a d₁ × d₂ rectangle. So the area is ½ × d₁ × d₂. It also means each side of a rhombus is the hypotenuse of a right triangle whose legs are the half-diagonals.',
      visual: fig([poly([[-4, -3], [4, -3], [4, 3], [-4, 3]], undefined, true), poly([[-4, 0], [0, -3], [4, 0], [0, 3]], 'shade'), seg([-4, 0], [4, 0], true), seg([0, -3], [0, 3], true)], { caption: 'A rhombus fills exactly half of the rectangle around it.' }),
    },
    {
      text: 'For an isosceles trapezoid, drop a height from each end of the shorter base. That carves out a rectangle in the middle and two matching right triangles on the ends. The Pythagorean theorem on one of those triangles gives the height, and then the area formula takes over.',
      visual: (() => {
        const pts: Pt[] = [[0, 0], [14, 0], [10, 3], [4, 3]];
        return fig([poly(pts), seg([4, 0], [4, 3], true), seg([10, 0], [10, 3], true), text([7, 3.5], '6'), text([7, -0.6], '14'), text([1.3, 2], '5'), text([2, -0.6], '4'), text([4.5, 1.4], '3')]);
      })(),
    },
  ],
  rungs: [
    {
      id: 'quadrilaterals/angles',
      idea: 'Angles in parallelograms and quadrilaterals',
      buildsOn: 'angles/parallel',
      generate: rng => {
        if (rng() < 0.55) {
          const x = int(rng, 8, 22);
          const theta = int(rng, 40, 80);
          const a = int(rng, 2, 4);
          const c = int(rng, 3, 6);
          const [b, d] = [theta - a * x, 180 - theta - c * x];
          const want = pick(rng, ['larger', 'smaller'] as const);
          return {
            prompt: `Two neighboring angles of a parallelogram measure (${linear(a, b)})° and (${linear(c, d)})°. How many degrees is the ${want} angle of the parallelogram?`,
            answer: { kind: 'number', value: want === 'larger' ? 180 - theta : theta },
            hints: ['Neighboring angles of a parallelogram add to 180°.', `(${linear(a, b)}) + (${linear(c, d)}) = 180.`],
            solution: [
              {
                text: 'Neighboring angles lie between parallel sides, so they are supplementary.',
                visual: working([
                  { label: 'Sum', text: `${linear(a + c, b + d)} = 180` },
                  { label: 'Solve', text: `x = ${x}` },
                  { label: 'Angles', text: `${theta}° and ${180 - theta}°` },
                ]),
              },
              { text: `The ${want} one is ${want === 'larger' ? 180 - theta : theta}°.` },
            ],
          };
        }
        const parts = pick(rng, [[1, 2, 3, 4], [2, 3, 3, 4], [1, 2, 2, 4], [3, 4, 5, 6], [2, 3, 5, 8], [3, 5, 7, 9], [2, 4, 5, 7], [1, 1, 3, 4], [4, 5, 5, 6]] as const);
        const total = parts.reduce((p, q) => p + q, 0);
        const one = 360 / total;
        return {
          prompt: `The angles of a quadrilateral are in the ratio ${parts.join(' : ')}. How many degrees is the largest angle?`,
          answer: { kind: 'number', value: one * parts[3] },
          hints: ['The angles of any quadrilateral add to 360°.', `${total} parts make 360°, so one part is ${one}°.`],
          solution: [
            {
              text: 'A quadrilateral is two triangles, so its angles total 360°.',
              visual: working([
                { label: 'Parts', text: `${parts.join(' + ')} = ${total}` },
                { label: 'One part', text: `360 ÷ ${total} = ${one}°` },
                { label: 'Largest', text: `${parts[3]} × ${one} = ${one * parts[3]}°` },
              ]),
            },
          ],
        };
      },
    },
    {
      id: 'quadrilaterals/diagonals',
      idea: 'Perpendicular diagonals: area is half their product',
      buildsOn: 'pythagorean/hidden',
      generate: rng => {
        const variant = int(rng, 0, 2);
        if (variant === 0) {
          const d1 = int(rng, 4, 20);
          let d2 = int(rng, 4, 20);
          if ((d1 * d2) % 2 === 1) d2 += 1;
          const shape = pick(rng, ['rhombus', 'kite'] as const);
          return {
            prompt: `The diagonals of a ${shape} have lengths ${d1} and ${d2}. What is its area?`,
            answer: { kind: 'number', value: (d1 * d2) / 2 },
            hints: [`The diagonals of a ${shape} are perpendicular.`, 'Area = ½ × d₁ × d₂.'],
            solution: [
              { text: `Because the diagonals cross at right angles, the ${shape} takes up exactly half of the ${d1} by ${d2} rectangle drawn around it.` },
              { text: 'Half the product of the diagonals.', visual: working([{ label: 'Area', text: `½ × ${d1} × ${d2} = ${(d1 * d2) / 2}` }]) },
            ],
          };
        }
        const [a, b, c] = triple(rng, 39);
        if (variant === 1) {
          return {
            prompt: `A rhombus has sides of length ${c}, and one of its diagonals has length ${2 * a}. What is its area?`,
            visual: fig([poly([[-a, 0], [0, -b], [a, 0], [0, b]]), seg([-a, 0], [a, 0], true), seg([0, -b], [0, b], true)]),
            answer: { kind: 'number', value: 2 * a * b },
            hints: [
              'You need the other diagonal. The diagonals bisect each other at right angles.',
              `Half-diagonal ${a} and side ${c} give the other half-diagonal: √(${c}² − ${a}²) = ${b}.`,
            ],
            solution: [
              {
                text: 'Use one of the four right triangles to find the missing diagonal, then take half the product.',
                visual: working([
                  { label: 'Other half-diagonal', text: `√(${c}² − ${a}²) = √${b * b} = ${b}` },
                  { label: 'Diagonals', text: `${2 * a} and ${2 * b}` },
                  { label: 'Area', text: `½ × ${2 * a} × ${2 * b} = ${2 * a * b}` },
                ]),
              },
            ],
          };
        }
        return {
          prompt: `A rhombus has area ${2 * a * b}, and one of its diagonals has length ${2 * a}. What is the perimeter of the rhombus?`,
          answer: { kind: 'number', value: 4 * c },
          hints: [
            `½ × ${2 * a} × d = ${2 * a * b} gives the other diagonal.`,
            `The other diagonal is ${2 * b}. The half-diagonals ${a} and ${b} are the legs of a right triangle whose hypotenuse is a side.`,
          ],
          solution: [
            {
              text: 'Area gives the second diagonal. The half-diagonals then give a side.',
              visual: working([
                { label: 'Other diagonal', text: `${2 * a * b} × 2 ÷ ${2 * a} = ${2 * b}` },
                { label: 'Half-diagonals', text: `${a} and ${b}` },
                { label: 'Side', text: `√(${a}² + ${b}²) = ${c}` },
                { label: 'Perimeter', text: `4 × ${c} = ${4 * c}` },
              ]),
            },
          ],
        };
      },
    },
    {
      id: 'quadrilaterals/trapezoid',
      idea: 'Drop the heights of an isosceles trapezoid',
      buildsOn: 'quadrilaterals/diagonals',
      generate: rng => {
        const [x, h, c] = triple(rng, 30);
        const top = int(rng, 3, 14);
        const bottom = top + 2 * x;
        const pts: Pt[] = [[0, 0], [bottom, 0], [x + top, h], [x, h]];
        const u = Math.max(bottom, h) * 0.07;
        const wantArea = rng() < 0.7;
        return {
          prompt: `An isosceles trapezoid has parallel sides of length ${top} and ${bottom}, and its two slanted sides each have length ${c}. What is its ${wantArea ? 'area' : 'height'}?`,
          visual: fig([poly(pts), seg([x, 0], [x, h], true), seg([x + top, 0], [x + top, h], true), text([bottom / 2, -u], `${bottom}`), text([x + top / 2, h + u], `${top}`), sideLabel(pts[0], pts[3], `${c}`, [bottom / 2, h / 2], u)]),
          answer: { kind: 'number', value: wantArea ? ((top + bottom) * h) / 2 : h },
          hints: [
            `Drop heights from both ends of the short base. The long base splits into three pieces: a middle of ${top} and two equal ends.`,
            `Each end piece is (${bottom} − ${top}) ÷ 2 = ${x}. Now a right triangle has leg ${x} and hypotenuse ${c}.`,
          ],
          solution: [
            { text: `The two heights cut off matching right triangles. The long base is ${top} plus two equal overhangs, so each overhang is (${bottom} − ${top}) ÷ 2 = ${x}.` },
            {
              text: 'The right triangle gives the height.',
              visual: working([
                { label: 'Height', text: `√(${c}² − ${x}²) = √${h * h} = ${h}` },
                ...(wantArea ? [{ label: 'Area', text: `½ × (${top} + ${bottom}) × ${h} = ${top + x} × ${h} = ${((top + bottom) * h) / 2}` }] : []),
              ]),
            },
          ],
        };
      },
    },
    {
      id: 'quadrilaterals/midpoints',
      idea: 'Joining the midpoints',
      buildsOn: 'quadrilaterals/trapezoid',
      generate: rng => {
        const [a, b, c] = triple(rng, 26);
        const [W, H] = [2 * a, 2 * b];
        const variant = int(rng, 0, 2);
        const mids: Pt[] = [[a, 0], [W, b], [a, H], [0, b]];
        const picture = fig([poly([[0, 0], [W, 0], [W, H], [0, H]]), poly(mids, 'shade')]);
        if (variant === 0) {
          return {
            prompt: `The midpoints of the four sides of a ${W} by ${H} rectangle are joined in order to form a quadrilateral. What is its perimeter?`,
            visual: picture,
            answer: { kind: 'number', value: 4 * c },
            hints: [
              'Each side of the new shape cuts off a right triangle at a corner of the rectangle.',
              `Those triangles have legs ${a} and ${b}, half of each side of the rectangle.`,
            ],
            solution: [
              { text: `Each corner triangle has legs ${a} and ${b}, so all four sides of the inner quadrilateral are equal. It is a rhombus.` },
              {
                text: 'Find one side and multiply by 4.',
                visual: working([
                  { label: 'Side', text: `√(${a}² + ${b}²) = √${c * c} = ${c}` },
                  { label: 'Perimeter', text: `4 × ${c} = ${4 * c}` },
                ]),
              },
            ],
          };
        }
        if (variant === 1) {
          return {
            prompt: `The midpoints of the four sides of a ${W} by ${H} rectangle are joined in order to form a quadrilateral. What is its area?`,
            visual: picture,
            answer: { kind: 'number', value: (W * H) / 2 },
            hints: ['Subtract the four corner triangles from the rectangle.', `Each corner triangle has area ½ × ${a} × ${b}. Or notice the inner shape is a rhombus with diagonals ${W} and ${H}.`],
            solution: [
              {
                text: 'Remove the four corners.',
                visual: working([
                  { label: 'Rectangle', text: `${W} × ${H} = ${W * H}` },
                  { label: 'Four corners', text: `4 × ½ × ${a} × ${b} = ${2 * a * b}` },
                  { label: 'Inner shape', text: `${W * H} − ${2 * a * b} = ${(W * H) / 2}` },
                ]),
              },
              { text: `It is exactly half the rectangle. Its diagonals are ${W} and ${H}, and ½ × ${W} × ${H} gives the same answer.` },
            ],
          };
        }
        const K = 2 * int(rng, 12, 90);
        return {
          prompt: `A quadrilateral of no special shape has area ${K}. The midpoints of its four sides are joined in order. What is the area of the quadrilateral they form?`,
          answer: { kind: 'number', value: K / 2 },
          hints: [
            'Draw a diagonal of the big quadrilateral. In each of the two triangles it makes, the segment joining two midpoints is parallel to the diagonal and half as long.',
            'So each corner triangle that gets cut off is a half-scale copy of a bigger triangle, with one quarter of its area. If you are stuck, try the easiest case, a rectangle, to guess the answer.',
          ],
          solution: [
            { text: 'Each corner piece that gets cut off is a half-scale copy of the triangle formed by a diagonal, so it has ¼ of that triangle\'s area. The two corners along one diagonal therefore remove ¼ of the whole quadrilateral, and the other two remove another ¼.' },
            { text: 'Half is removed, half remains.', visual: working([{ label: 'Removed', text: `¼ + ¼ = ½ of ${K}` }, { label: 'Remaining', text: `${K} ÷ 2 = ${K / 2}` }]) },
            { text: 'This works for every quadrilateral, and the midpoint figure is always a parallelogram. The rectangle case you just did is one example.' },
          ],
        };
      },
    },
  ],
};

export const GEOMETRY_AREA_LESSONS: Lesson[] = [area, pythagorean, specialRight, quadrilaterals];

// Shared with the other geometry files.
export { TRIPLES, triple, rightTriangle };
