// Realm VI: Geometry — circles, circle angles, shaded regions. Realm IV: geometric probability.
import type { Lesson, Pt, Visual } from './types.ts';
import { arc, circ, cornerLabel, dot, fig, polar, poly, rightAngle, sector, seg, text } from './figures.ts';
import { triple } from './geometry-area.ts';
import { LOWEST, choices, frac, int, linear, pick, reduce, working } from './util.ts';

/** kπ with tidy coefficients: pi(1) → "π", pi(12) → "12π" */
const pi = (k: number) => (k === 1 ? 'π' : `${k}π`);
const K_OF_PI = 'Your answer is a multiple of π: if it is kπ, enter k.';

// ── Circles ──────────────────────────────────────────────────────────────────

const circles: Lesson = {
  topic: 'circles',
  intro: [
    {
      text: 'Every circle is a scaled copy of every other circle, so the distance around divided by the distance across is the same for all of them. That number is π, a bit more than 3.14. So the circumference is π times the diameter: C = πd = 2πr.',
      visual: fig([circ([0, 0], 3), seg([-3, 0], [3, 0], true), seg([0, 0], polar([0, 0], 3, 55)), dot([0, 0]), text([-1.2, -0.4], 'diameter'), text([1.5, 1.2], 'r')]),
    },
    {
      text: 'For the area, slice the circle into thin wedges and stack them alternately, point up and point down. They form something very close to a rectangle whose height is the radius and whose width is half the circumference, πr. So the area is πr × r = πr².',
      visual: working([
        { label: 'Circumference', text: 'C = 2πr' },
        { label: 'Area', text: 'A = πr²' },
        { label: 'Radius 5', text: 'C = 10π and A = 25π' },
      ]),
    },
    {
      text: 'In contests, leave π as a symbol. An answer of 25π is exact, and it is easier to work with than 78.54. The most common slip is mixing up radius and diameter, so the first thing to do with any circle is write down its radius.',
    },
    {
      text: 'A sector is a pizza slice, and an arc is its crust. Both are simply a fraction of the whole circle, and the fraction is the central angle out of 360°. A 90° sector of a circle with radius 6 is one quarter of the circle.',
      visual: fig([circ([0, 0], 3, undefined, true), sector([0, 0], 3, 0, 90, 'shade'), text([1.2, 1.1], '90°'), text([1.5, -0.4], '6')]),
    },
    {
      text: 'So its arc is a quarter of the circumference, ¼ × 12π = 3π, and its area is a quarter of the area, ¼ × 36π = 9π. Find the fraction first. Everything else follows.',
    },
  ],
  rungs: [
    {
      id: 'circles/basics',
      idea: 'Circumference and area',
      buildsOn: 'area/formulas',
      generate: rng => {
        const r = int(rng, 2, 15);
        const variant = int(rng, 0, 3);
        if (variant === 0) {
          const useD = rng() < 0.5;
          return {
            prompt: `A circle has a ${useD ? `diameter of ${2 * r}` : `radius of ${r}`}. What is its area? ${K_OF_PI}`,
            answer: { kind: 'number', value: r * r },
            hints: [useD ? `Start with the radius: half of ${2 * r}.` : 'Area = πr².', `π × ${r}².`],
            solution: [{ text: `${useD ? `The radius is half the diameter: ${r}. ` : ''}Square the radius and attach π.`, visual: working([{ label: 'Area', text: `π × ${r}² = ${pi(r * r)}` }, { label: 'So', text: `k = ${r * r}` }]) }],
          };
        }
        if (variant === 1) {
          return {
            prompt: `A circle has a radius of ${r}. What is its circumference? ${K_OF_PI}`,
            answer: { kind: 'number', value: 2 * r },
            hints: ['Circumference = 2πr, or π times the diameter.', `The diameter is ${2 * r}.`],
            solution: [{ text: 'The circumference is π times the diameter.', visual: working([{ label: 'Diameter', text: `2 × ${r} = ${2 * r}` }, { label: 'Circumference', text: pi(2 * r) }]) }],
          };
        }
        if (variant === 2) {
          return {
            prompt: `A circle has an area of ${pi(r * r)}. What is its circumference? ${K_OF_PI}`,
            answer: { kind: 'number', value: 2 * r },
            hints: [`πr² = ${pi(r * r)}, so r² = ${r * r}.`, `The radius is ${r}. Now use C = 2πr.`],
            solution: [
              {
                text: 'Go through the radius: area gives r, and r gives the circumference.',
                visual: working([
                  { label: 'Area', text: `πr² = ${pi(r * r)}, so r² = ${r * r}` },
                  { label: 'Radius', text: `r = ${r}` },
                  { label: 'Circumference', text: `2π × ${r} = ${pi(2 * r)}` },
                ]),
              },
            ],
          };
        }
        return {
          prompt: `A circle has a circumference of ${pi(2 * r)}. What is its area? ${K_OF_PI}`,
          answer: { kind: 'number', value: r * r },
          hints: [`2πr = ${pi(2 * r)}, so r = ${r}.`, `Area = π × ${r}².`],
          solution: [
            {
              text: 'Go through the radius: circumference gives r, and r gives the area.',
              visual: working([
                { label: 'Circumference', text: `2πr = ${pi(2 * r)}, so r = ${r}` },
                { label: 'Area', text: `π × ${r}² = ${pi(r * r)}` },
              ]),
            },
          ],
        };
      },
    },
    {
      id: 'circles/sectors',
      idea: 'A sector is a fraction of the circle',
      buildsOn: 'circles/basics',
      generate: rng => {
        const angle = pick(rng, [30, 40, 45, 60, 72, 90, 120, 135, 150, 240, 270]);
        const r = pick(rng, [3, 4, 6, 8, 9, 10, 12]);
        const [fn, fd] = reduce(angle, 360);
        const wantArc = rng() < 0.5;
        const [num, den] = wantArc ? reduce(angle * 2 * r, 360) : reduce(angle * r * r, 360);
        return {
          prompt: `A sector of a circle with radius ${r} has a central angle of ${angle}°. What is ${wantArc ? 'the length of its arc' : 'its area'}? Your answer is a multiple of π: if it is kπ, enter k as a whole number or a fraction in lowest terms.`,
          visual: fig([circ([0, 0], 3, undefined, true), sector([0, 0], 3, 0, angle, 'shade'), text(polar([0, 0], angle < 50 ? 1.9 : 1.2, angle / 2), `${angle}°`)]),
          answer: { kind: 'fraction', num, den },
          hints: [
            `What fraction of the full circle is this sector? ${angle}/360 = ${fn}/${fd}.`,
            wantArc ? `The full circumference is ${pi(2 * r)}. Take ${fn}/${fd} of it.` : `The full area is ${pi(r * r)}. Take ${fn}/${fd} of it.`,
          ],
          solution: [
            {
              text: 'Find the fraction of the circle, then take that fraction of the whole.',
              visual: working([
                { label: 'Fraction', text: `${angle}/360 = ${fn}/${fd}` },
                wantArc ? { label: 'Whole circumference', text: `2π × ${r} = ${pi(2 * r)}` } : { label: 'Whole area', text: `π × ${r}² = ${pi(r * r)}` },
                { label: wantArc ? 'Arc' : 'Sector', text: `${fn}/${fd} × ${pi(wantArc ? 2 * r : r * r)} = ${den === 1 ? pi(num) : `${num}π/${den}`}` },
                { label: 'So', text: `k = ${frac(num, den)}` },
              ]),
            },
          ],
        };
      },
    },
    {
      id: 'circles/rings',
      idea: 'Rings, wheels and tracks',
      buildsOn: 'circles/sectors',
      generate: rng => {
        const variant = int(rng, 0, 2);
        if (variant === 0) {
          const r = int(rng, 2, 9);
          const R = r + int(rng, 1, 6);
          return {
            prompt: `Two circles share the same center. Their radii are ${r} and ${R}. What is the area of the ring between them? ${K_OF_PI}`,
            visual: fig([circ([0, 0], R, 'shade'), circ([0, 0], r, 'erase')]),
            answer: { kind: 'number', value: R * R - r * r },
            hints: ['Ring = big circle − small circle.', `${pi(R * R)} − ${pi(r * r)}.`],
            solution: [
              {
                text: 'Subtract the inner disc from the outer one.',
                visual: working([
                  { label: 'Outer', text: `π × ${R}² = ${pi(R * R)}` },
                  { label: 'Inner', text: `π × ${r}² = ${pi(r * r)}` },
                  { label: 'Ring', text: `${pi(R * R)} − ${pi(r * r)} = ${pi(R * R - r * r)}` },
                ]),
              },
              { text: `Do not subtract the radii first: π × (${R} − ${r})² = ${pi((R - r) ** 2)} is a different, wrong number.` },
            ],
          };
        }
        if (variant === 1) {
          const r = int(rng, 5, 20);
          const n = int(rng, 4, 30);
          return {
            prompt: `A wheel with a radius of ${r} cm rolls along the ground without slipping for ${n} full turns. How far does it travel, in centimeters? ${K_OF_PI}`,
            answer: { kind: 'number', value: 2 * r * n },
            hints: ['In one full turn, a wheel rolls forward exactly one circumference.', `One circumference is ${pi(2 * r)} cm.`],
            solution: [
              {
                text: 'One turn lays the whole rim along the ground once.',
                visual: working([
                  { label: 'One turn', text: `2π × ${r} = ${pi(2 * r)} cm` },
                  { label: `${n} turns`, text: `${n} × ${pi(2 * r)} = ${pi(2 * r * n)} cm` },
                ]),
              },
            ],
          };
        }
        const r = int(rng, 20, 60);
        const w = int(rng, 1, 8);
        return {
          prompt: `A circular running track has two lanes. The inner lane is a circle of radius ${r} m, and the outer lane is a circle of radius ${r + w} m. How many meters longer is one lap of the outer lane than one lap of the inner lane? ${K_OF_PI}`,
          answer: { kind: 'number', value: 2 * w },
          hints: ['Write both circumferences and subtract.', `2π × ${r + w} − 2π × ${r} = 2π × ${w}.`],
          solution: [
            {
              text: 'Subtract the two circumferences.',
              visual: working([
                { label: 'Outer lap', text: `2π × ${r + w} = ${pi(2 * (r + w))}` },
                { label: 'Inner lap', text: `2π × ${r} = ${pi(2 * r)}` },
                { label: 'Difference', text: pi(2 * w) },
              ]),
            },
            { text: `The size of the track cancelled out. Widening any circle by ${w} adds exactly 2π × ${w} to its circumference, whether it is a coin or the equator.` },
          ],
        };
      },
    },
    {
      id: 'circles/inscribed',
      idea: 'Circles in squares, squares in circles',
      buildsOn: 'special_right/45',
      generate: rng => {
        const variant = int(rng, 0, 3);
        const r = int(rng, 2, 12);
        if (variant === 0) {
          return {
            prompt: `A circle is inscribed in a square with side ${2 * r}, touching all four sides. What is the area of the circle? ${K_OF_PI}`,
            visual: fig([poly([[-r, -r], [r, -r], [r, r], [-r, r]]), circ([0, 0], r, 'shade')]),
            answer: { kind: 'number', value: r * r },
            hints: ['The circle reaches from one side of the square to the opposite side. What does that tell you about its diameter?', `The diameter equals the side, ${2 * r}, so the radius is ${r}.`],
            solution: [{ text: `The diameter of the circle equals the side of the square, so r = ${r}.`, visual: working([{ label: 'Area', text: `π × ${r}² = ${pi(r * r)}` }]) }],
          };
        }
        if (variant === 1) {
          return {
            prompt: `A square is inscribed in a circle of radius ${r}, with all four corners on the circle. What is the area of the square?`,
            visual: fig([circ([0, 0], r), poly([[r, 0], [0, r], [-r, 0], [0, -r]], 'shade'), seg([-r, 0], [r, 0], true)]),
            answer: { kind: 'number', value: 2 * r * r },
            hints: ['A diagonal of the square is a diameter of the circle.', `The diagonals are both ${2 * r} and cross at right angles: area = ½ × d₁ × d₂.`],
            solution: [
              { text: `The diagonal of the square passes through the center, so it is a diameter: ${2 * r}.` },
              { text: 'A square is a rhombus, so its area is half the product of its diagonals.', visual: working([{ label: 'Area', text: `½ × ${2 * r} × ${2 * r} = ${2 * r * r}` }]) },
            ],
          };
        }
        if (variant === 2) {
          const A = 2 * r * r;
          return {
            prompt: `A circle of area ${pi(A)} has a square inscribed in it, and that square has a circle inscribed in it. What is the area of the small circle? ${K_OF_PI}`,
            visual: (() => {
              const R = 3;
              const h = R / Math.SQRT2;
              return fig([circ([0, 0], R), poly([[h, h], [-h, h], [-h, -h], [h, -h]]), circ([0, 0], h, 'shade')]);
            })(),
            answer: { kind: 'number', value: A / 2 },
            hints: [
              'Call the big radius R. The square\'s diagonal is 2R. The small circle\'s diameter is the square\'s SIDE.',
              'Side = diagonal ÷ √2, so the small radius is R/√2, and squaring that halves R².',
            ],
            solution: [
              {
                text: 'Track the radius through the square.',
                visual: working([
                  { label: 'Big circle', text: `R² = ${A}` },
                  { label: 'Square', text: 'diagonal 2R, so side 2R/√2 = R√2' },
                  { label: 'Small circle', text: 'radius = half the side = R√2/2' },
                  { label: 'Small area', text: `π × R²/2 = ${pi(A / 2)}` },
                ]),
              },
              { text: 'Each time you nest a square and a circle this way, the area halves.' },
            ],
          };
        }
        const [a, b, c] = triple(rng, 39);
        return {
          prompt: `A ${a} by ${b} rectangle is inscribed in a circle, with all four corners on the circle. What is the circumference of the circle? ${K_OF_PI}`,
          answer: { kind: 'number', value: c },
          hints: ['The diagonal of the rectangle passes through the center of the circle.', `The diagonal is √(${a}² + ${b}²) = ${c}, and it is a diameter.`],
          solution: [
            {
              text: 'The diagonal of an inscribed rectangle is a diameter.',
              visual: working([
                { label: 'Diagonal', text: `√(${a}² + ${b}²) = √${c * c} = ${c}` },
                { label: 'Circumference', text: `π × diameter = ${pi(c)}` },
              ]),
            },
          ],
        };
      },
    },
  ],
};

// ── Chords, Tangents & Inscribed Angles ──────────────────────────────────────

const O: Pt = [0, 0];

/** Circle with an inscribed angle at C standing on arc AB, plus the central angle AOB. Angles in degrees give the positions on the circle. */
function inscribedFig(a: number, b: number, c: number, labels: { central?: string; inscribed?: string }): Visual {
  const R = 3;
  const [A, B, C] = [polar(O, R, a), polar(O, R, b), polar(O, R, c)];
  return fig([
    circ(O, R),
    seg(O, A), seg(O, B), seg(C, A), seg(C, B),
    dot(O),
    cornerLabel(A, 'A', O, 0.4), cornerLabel(B, 'B', O, 0.4), cornerLabel(C, 'C', O, 0.4),
    ...(labels.central ? [text(polar(O, 0.75, (a + b) / 2), labels.central)] : []),
    ...(labels.inscribed ? [text(polar(C, 1.15, c + 180), labels.inscribed)] : []),
  ]);
}

const circleAngles: Lesson = {
  topic: 'circle_angles',
  intro: [
    {
      text: 'An angle with its vertex at the center of a circle is a central angle, and it measures the same as the arc it cuts off. An angle with its vertex ON the circle is an inscribed angle. The key theorem: an inscribed angle is half of the central angle standing on the same arc.',
      visual: inscribedFig(-50, 30, 170, { central: '80°', inscribed: '40°' }),
    },
    {
      text: 'Two consequences fall out at once. First, every inscribed angle standing on the same arc is the same size, wherever its vertex sits. Second, an inscribed angle standing on a diameter is half of 180°: a right angle. So if one side of an inscribed triangle is a diameter, it is a right triangle, and the Pythagorean theorem applies.',
      visual: (() => {
        const [A, B, C] = [polar(O, 3, 180), polar(O, 3, 0), polar(O, 3, 65)];
        return fig([circ(O, 3), poly([A, B, C]), ...rightAngle(C, A, B, 0.35), dot(O), text([0, -0.4], 'diameter')]);
      })(),
    },
    {
      text: 'A tangent line touches a circle at exactly one point, and at that point it is perpendicular to the radius. That right angle is the whole trick for tangent problems: join the center to the point of tangency and to the outside point, and you have a right triangle. It also shows that the two tangents from an outside point are equal in length.',
      visual: (() => {
        const P: Pt = [5, 0];
        const t = (Math.acos(3 / 5) * 180) / Math.PI;
        const [T1, T2] = [polar(O, 3, t), polar(O, 3, -t)];
        return fig([circ(O, 3), seg(P, T1), seg(P, T2), seg(O, T1), seg(O, T2, true), seg(O, P, true), ...rightAngle(T1, O, P, 0.35), dot(O), text([5.4, 0], 'P'), text([0.9, 1.6], '3'), text([3.4, 1.8], '4'), text([2.6, -0.35], '5')]);
      })(),
    },
    {
      text: 'Chords hide a right triangle too. The line from the center perpendicular to a chord cuts the chord exactly in half. So the radius to an end of the chord is the hypotenuse of a right triangle whose legs are half the chord and the distance from the center to the chord.',
      visual: (() => {
        const [A, B, M]: Pt[] = [[-4, 3], [4, 3], [0, 3]];
        return fig([circ(O, 5), seg(A, B), seg(O, M, true), seg(O, B), ...rightAngle(M, O, B, 0.4), dot(O), text([2, 3.5], '4'), text([-0.5, 1.5], '3'), text([2.6, 1.2], '5')]);
      })(),
    },
    {
      text: 'Last, a quadrilateral with all four corners on a circle is called cyclic. Its opposite angles stand on arcs that together make the whole circle, so they add to half of 360°: opposite angles of a cyclic quadrilateral sum to 180°.',
    },
  ],
  rungs: [
    {
      id: 'circle_angles/inscribed',
      idea: 'An inscribed angle is half the central angle',
      buildsOn: 'circles/sectors',
      generate: rng => {
        const variant = int(rng, 0, 2);
        if (variant === 2) {
          const [a, b, c] = triple(rng, 52);
          const want = pick(rng, ['chord', 'radius'] as const);
          const wantRadius = want === 'radius' && c % 2 === 0;
          return {
            prompt: wantRadius
              ? `AB is a diameter of a circle and C is another point on the circle, with AC = ${a} and BC = ${b}. What is the radius of the circle?`
              : `AB is a diameter of a circle and C is another point on the circle. If AB = ${c} and AC = ${a}, how long is BC?`,
            answer: { kind: 'number', value: wantRadius ? c / 2 : b },
            hints: ['Angle ACB is an inscribed angle standing on a diameter. How big is it?', 'It is 90°, so ABC is a right triangle with hypotenuse AB.'],
            solution: [
              { text: 'An inscribed angle standing on a diameter is a right angle, so triangle ABC has its right angle at C and hypotenuse AB.' },
              {
                text: 'Now it is a Pythagorean problem.',
                visual: working(
                  wantRadius
                    ? [
                        { label: 'Diameter', text: `√(${a}² + ${b}²) = √${c * c} = ${c}` },
                        { label: 'Radius', text: `${c} ÷ 2 = ${c / 2}` },
                      ]
                    : [{ label: 'BC', text: `√(${c}² − ${a}²) = √${b * b} = ${b}` }],
                ),
              },
            ],
          };
        }
        const ins = int(rng, 20, 75);
        const central = 2 * ins;
        const forward = variant === 0;
        const start = -central / 2;
        return {
          prompt: forward
            ? `O is the center of the circle. Central angle AOB is ${central}°. How many degrees is the inscribed angle ACB?`
            : `O is the center of the circle. The inscribed angle ACB is ${ins}°. How many degrees is the central angle AOB?`,
          visual: inscribedFig(start, start + central, 180 + int(rng, -25, 25), forward ? { central: `${central}°`, inscribed: 'x' } : { central: 'x', inscribed: `${ins}°` }),
          answer: { kind: 'number', value: forward ? ins : central },
          hints: ['Both angles stand on the same arc AB.', 'The inscribed angle is half the central angle.'],
          solution: [
            { text: `Angles ACB and AOB both open onto arc AB. The one at the center is twice the one on the circle, so ${forward ? `x = ${central}° ÷ 2 = ${ins}°` : `x = 2 × ${ins}° = ${central}°`}.` },
            { text: 'Moving C anywhere else along the far side of the circle would not change the inscribed angle at all.' },
          ],
        };
      },
    },
    {
      id: 'circle_angles/tangent',
      idea: 'A tangent meets the radius at a right angle',
      buildsOn: 'pythagorean/hidden',
      generate: rng => {
        const variant = int(rng, 0, 2);
        if (variant === 1) {
          const theta = int(rng, 30, 110);
          return {
            prompt: `From a point P outside a circle with center O, two tangents are drawn, touching the circle at A and B. Angle APB is ${theta}°. How many degrees is angle AOB?`,
            answer: { kind: 'number', value: 180 - theta },
            hints: ['Look at quadrilateral OAPB. What are its angles at A and at B?', 'Both are 90°, and the four angles of a quadrilateral total 360°.'],
            solution: [
              { text: 'Each tangent is perpendicular to the radius at the point where it touches, so angles OAP and OBP are both 90°.' },
              {
                text: 'The angles of quadrilateral OAPB add to 360°.',
                visual: working([
                  { label: 'Sum', text: `90 + 90 + ${theta} + angle AOB = 360` },
                  { label: 'So', text: `angle AOB = 180 − ${theta} = ${180 - theta}°` },
                ]),
              },
            ],
          };
        }
        const [a, b, c] = triple(rng, 52);
        return {
          prompt:
            variant === 0
              ? `Point P is ${c} units from the center of a circle of radius ${a}. A tangent from P touches the circle at T. How long is PT?`
              : `A tangent segment from point P to a circle of radius ${a} has length ${b}. How far is P from the nearest point of the circle?`,
          answer: { kind: 'number', value: variant === 0 ? b : c - a },
          hints: [
            'Draw the radius to the point of tangency. It meets the tangent at a right angle.',
            variant === 0 ? `Right triangle: hypotenuse OP = ${c}, leg OT = ${a}.` : `Right triangle with legs ${a} and ${b}: the hypotenuse is the distance from P to the CENTER. Then subtract the radius.`,
          ],
          solution: [
            { text: 'The radius OT is perpendicular to the tangent PT, so OTP is a right triangle with its right angle at T and hypotenuse OP.' },
            {
              text: 'Apply the Pythagorean theorem.',
              visual: working(
                variant === 0
                  ? [{ label: 'PT', text: `√(${c}² − ${a}²) = √${b * b} = ${b}` }]
                  : [
                      { label: 'OP', text: `√(${a}² + ${b}²) = √${c * c} = ${c}` },
                      { label: 'To the circle', text: `${c} − ${a} = ${c - a}` },
                    ],
              ),
            },
            ...(variant === 0 ? [] : [{ text: 'The nearest point of the circle lies on the segment from P to the center, one radius short of the center.' }]),
          ],
        };
      },
    },
    {
      id: 'circle_angles/chords',
      idea: 'The center, a chord, and a right triangle',
      buildsOn: 'circle_angles/tangent',
      generate: rng => {
        const [a, b, c] = triple(rng, 52);
        const variant = int(rng, 0, 2);
        const lead = { text: 'The perpendicular from the center to a chord bisects the chord. The radius to an endpoint is the hypotenuse of the right triangle formed with half the chord.' };
        const picture = fig([circ(O, c), seg([-a, b], [a, b]), seg(O, [0, b], true), seg(O, [a, b]), ...rightAngle([0, b], O, [a, b], c * 0.08), dot(O)]);
        if (variant === 0) {
          return {
            prompt: `A chord of length ${2 * a} is drawn in a circle of radius ${c}. How far is the chord from the center of the circle?`,
            visual: picture,
            answer: { kind: 'number', value: b },
            hints: ['Draw the perpendicular from the center to the chord, and a radius to one end of the chord.', `Half the chord is ${a}, and the radius ${c} is the hypotenuse.`],
            solution: [lead, { text: 'Solve the right triangle.', visual: working([{ label: 'Half-chord', text: `${a}` }, { label: 'Distance', text: `√(${c}² − ${a}²) = √${b * b} = ${b}` }]) }],
          };
        }
        if (variant === 1) {
          return {
            prompt: `A chord of a circle is ${2 * a} units long and lies ${b} units from the center. What is the radius of the circle?`,
            visual: picture,
            answer: { kind: 'number', value: c },
            hints: ['The distance to the chord and half the chord are the legs of a right triangle.', `Legs ${b} and ${a}. The radius is the hypotenuse.`],
            solution: [lead, { text: 'Solve the right triangle.', visual: working([{ label: 'Half-chord', text: `${a}` }, { label: 'Radius', text: `√(${a}² + ${b}²) = √${c * c} = ${c}` }]) }],
          };
        }
        return {
          prompt: `In a circle of radius ${c}, a chord lies ${b} units from the center. How long is the chord?`,
          visual: picture,
          answer: { kind: 'number', value: 2 * a },
          hints: ['Find HALF the chord from a right triangle first.', `Half-chord = √(${c}² − ${b}²) = ${a}. Do not forget to double it.`],
          solution: [lead, { text: 'Solve the right triangle, then double.', visual: working([{ label: 'Half-chord', text: `√(${c}² − ${b}²) = √${a * a} = ${a}` }, { label: 'Chord', text: `2 × ${a} = ${2 * a}` }]) }],
        };
      },
    },
    {
      id: 'circle_angles/cyclic',
      idea: 'Arcs, inscribed triangles and cyclic quadrilaterals',
      buildsOn: 'circle_angles/inscribed',
      generate: rng => {
        if (rng() < 0.5) {
          const parts = pick(rng, [[1, 2, 3], [2, 3, 4], [3, 4, 5], [2, 3, 5], [1, 3, 5], [4, 5, 6], [3, 5, 7], [2, 5, 8], [5, 6, 7], [1, 4, 4], [2, 7, 9], [3, 7, 8]] as const);
          const total = parts[0] + parts[1] + parts[2];
          const one = 360 / total;
          const want = pick(rng, ['largest', 'smallest'] as const);
          const arcPart = want === 'largest' ? parts[2] : parts[0];
          return {
            prompt: `The vertices of a triangle lie on a circle and divide it into three arcs whose lengths are in the ratio ${parts.join(' : ')}. How many degrees is the ${want} angle of the triangle?`,
            answer: { kind: 'number', value: (one * arcPart) / 2 },
            hints: [
              `The three arcs make up the full 360°. One part is 360° ÷ ${total} = ${one}°.`,
              'Each angle of the triangle is an inscribed angle, so it is half of the arc across from it.',
            ],
            solution: [
              {
                text: 'Find the arcs, then halve them: each angle of the triangle is inscribed and stands on the opposite arc.',
                visual: working([
                  { label: 'One part', text: `360 ÷ ${total} = ${one}°` },
                  { label: 'Arcs', text: parts.map(q => `${q * one}°`).join(', ') },
                  { label: 'Angles', text: parts.map(q => `${(q * one) / 2}°`).join(', ') },
                ]),
              },
              { text: `The ${want} angle is ${(one * arcPart) / 2}°. (The angles add to 180°, as they must.)` },
            ],
          };
        }
        const x = int(rng, 6, 20);
        const theta = int(rng, 55, 125);
        const a = int(rng, 2, 5);
        const c = int(rng, 1, 4);
        const [b, d] = [theta - a * x, 180 - theta - c * x];
        return {
          prompt: `Quadrilateral ABCD is inscribed in a circle. Angle A measures (${linear(a, b)})° and angle C measures (${linear(c, d)})°. How many degrees is angle A?`,
          answer: { kind: 'number', value: theta },
          hints: ['A and C are opposite angles of a cyclic quadrilateral.', `They add to 180°: (${linear(a, b)}) + (${linear(c, d)}) = 180.`],
          solution: [
            { text: 'Angles A and C are inscribed angles standing on the two arcs BD, which together make the whole circle. So A + C is half of 360°.' },
            {
              text: 'Solve for x and substitute back.',
              visual: working([
                { label: 'Sum', text: `${linear(a + c, b + d)} = 180` },
                { label: 'Solve', text: `x = ${x}` },
                { label: 'Angle A', text: `${theta}°` },
              ]),
            },
          ],
        };
      },
    },
  ],
};

// ── Funky Figures ────────────────────────────────────────────────────────────

/** "36 − 9π", "9π − 18", "24 + 8π" */
const mix = (first: string, op: '+' | '−', second: string) => `${first} ${op} ${second}`;

const shaded: Lesson = {
  topic: 'shaded',
  intro: [
    {
      text: 'Shaded-region problems look intimidating because the shaded shape has no formula of its own. It does not need one. Nearly every one of these is "a shape you know, minus another shape you know". Here the shaded corners are a square minus a circle.',
      visual: fig([poly([[-3, -3], [3, -3], [3, 3], [-3, 3]], 'shade'), circ(O, 3, 'erase'), text([0, 0], 'r = 3')]),
    },
    {
      text: 'The square has side 6, so its area is 36. The circle has radius 3, so its area is 9π. The shaded region is 36 − 9π. Leave it exactly like that: a number and a multiple of π cannot be combined any further.',
      visual: working([
        { label: 'Square', text: '6² = 36' },
        { label: 'Circle', text: 'π × 3² = 9π' },
        { label: 'Shaded', text: '36 − 9π' },
      ]),
    },
    {
      text: 'Quarter circles and semicircles are just fractions of circles. Four quarter circles make one whole circle, and two semicircles make one whole circle. Before computing anything, see whether the curved pieces can be gathered into whole circles.',
      visual: fig([poly([[0, 0], [6, 0], [6, 6], [0, 6]], 'shade'), sector([0, 0], 3, 0, 90, 'erase'), sector([6, 0], 3, 90, 180, 'erase'), sector([6, 6], 3, 180, 270, 'erase'), sector([0, 6], 3, 270, 360, 'erase')], { caption: 'Four quarter circles of radius 3 remove one full circle: 36 − 9π again.' }),
    },
    {
      text: 'A segment is the region between a chord and its arc. It is a sector minus a triangle. For a 90° sector of radius 6: the sector is a quarter of 36π, which is 9π, and the triangle is a right triangle with legs 6 and 6, area 18. The segment is 9π − 18.',
      visual: fig([circ(O, 3, undefined, true), sector(O, 3, 0, 90, 'shade'), poly([[0, 0], [3, 0], [0, 3]], 'erase'), seg([3, 0], [0, 3])]),
    },
    {
      text: 'The plan for every funky figure: name the simple shapes, decide which are added and which are subtracted, compute each one, and keep the π terms and the plain numbers separate.',
    },
  ],
  rungs: [
    {
      id: 'shaded/square-circle',
      idea: 'One shape minus another',
      buildsOn: 'circles/inscribed',
      generate: rng => {
        const r = int(rng, 2, 9);
        if (rng() < 0.5) {
          return {
            prompt: `A circle is inscribed in a square of side ${2 * r}. What is the area of the region inside the square but outside the circle?`,
            visual: fig([poly([[-r, -r], [r, -r], [r, r], [-r, r]], 'shade'), circ(O, r, 'erase')]),
            answer: choices(rng, mix(`${4 * r * r}`, '−', pi(r * r)), [mix(`${4 * r * r}`, '−', pi(4 * r * r)), mix(`${4 * r * r}`, '−', pi(2 * r)), mix(`${2 * r * r}`, '−', pi(r * r))]),
            hints: ['Shaded = square − circle.', `The circle's diameter is the side of the square, so its radius is ${r}, not ${2 * r}.`],
            solution: [
              {
                text: 'Subtract the circle from the square. Be careful to use the radius.',
                visual: working([
                  { label: 'Square', text: `${2 * r}² = ${4 * r * r}` },
                  { label: 'Circle', text: `π × ${r}² = ${pi(r * r)}` },
                  { label: 'Shaded', text: mix(`${4 * r * r}`, '−', pi(r * r)) },
                ]),
              },
            ],
          };
        }
        return {
          prompt: `A square is inscribed in a circle of radius ${r}. What is the area of the region inside the circle but outside the square?`,
          visual: fig([circ(O, r, 'shade'), poly([[r, 0], [0, r], [-r, 0], [0, -r]], 'erase')]),
          answer: choices(rng, mix(pi(r * r), '−', `${2 * r * r}`), [mix(pi(r * r), '−', `${r * r}`), mix(pi(r * r), '−', `${4 * r * r}`), mix(pi(2 * r * r), '−', `${2 * r * r}`)]),
          hints: ['Shaded = circle − square.', `The square's diagonals are diameters of length ${2 * r}. Its area is half the product of its diagonals.`],
          solution: [
            {
              text: 'Subtract the square from the circle. The square is easiest to measure by its diagonals.',
              visual: working([
                { label: 'Circle', text: `π × ${r}² = ${pi(r * r)}` },
                { label: 'Square', text: `½ × ${2 * r} × ${2 * r} = ${2 * r * r}` },
                { label: 'Shaded', text: mix(pi(r * r), '−', `${2 * r * r}`) },
              ]),
            },
          ],
        };
      },
    },
    {
      id: 'shaded/quarters',
      idea: 'Quarter circles in a square',
      buildsOn: 'shaded/square-circle',
      generate: rng => {
        const h = int(rng, 1, 6);
        const s = 2 * h;
        const variant = int(rng, 0, 2);
        const square: Pt[] = [[0, 0], [s, 0], [s, s], [0, s]];
        if (variant === 0) {
          return {
            prompt: `A quarter circle of radius ${s} is drawn inside a square of side ${s}, centered at one corner. What is the area of the part of the square outside the quarter circle?`,
            visual: fig([poly(square, 'shade'), sector([0, 0], s, 0, 90, 'erase'), poly(square)]),
            answer: choices(rng, mix(`${s * s}`, '−', pi(h * h)), [mix(`${s * s}`, '−', pi(s * s)), mix(`${s * s}`, '−', pi(2 * h * h)), mix(`${s * s}`, '−', pi(h))]),
            hints: [`The quarter circle has radius ${s}, the full side of the square.`, `A full circle of radius ${s} has area ${pi(s * s)}. Take a quarter of that.`],
            solution: [
              {
                text: 'Square minus a quarter of a circle.',
                visual: working([
                  { label: 'Square', text: `${s}² = ${s * s}` },
                  { label: 'Quarter circle', text: `¼ × π × ${s}² = ${pi(h * h)}` },
                  { label: 'Shaded', text: mix(`${s * s}`, '−', pi(h * h)) },
                ]),
              },
            ],
          };
        }
        if (variant === 1) {
          return {
            prompt: `Four quarter circles of radius ${h} are drawn inside a square of side ${s}, one centered at each corner. What is the area of the region inside the square but outside all four quarter circles?`,
            visual: fig([poly(square, 'shade'), sector([0, 0], h, 0, 90, 'erase'), sector([s, 0], h, 90, 180, 'erase'), sector([s, s], h, 180, 270, 'erase'), sector([0, s], h, 270, 360, 'erase'), poly(square)]),
            answer: choices(rng, mix(`${s * s}`, '−', pi(h * h)), [mix(`${s * s}`, '−', pi(4 * h * h)), mix(`${s * s}`, '−', `${h * h}π/4`), mix(`${s * s}`, '−', pi(2 * h * h))]),
            hints: ['Four quarter circles of the same radius make how much of a circle?', `Together they are one full circle of radius ${h}.`],
            solution: [
              {
                text: 'Gather the four quarters into a single circle before computing.',
                visual: working([
                  { label: 'Square', text: `${s}² = ${s * s}` },
                  { label: 'Four quarters', text: `one circle: π × ${h}² = ${pi(h * h)}` },
                  { label: 'Shaded', text: mix(`${s * s}`, '−', pi(h * h)) },
                ]),
              },
            ],
          };
        }
        return {
          prompt: `In a square of side ${s}, two quarter circles of radius ${s} are drawn, centered at opposite corners. They overlap in a leaf-shaped region. What is the area of the leaf?`,
          visual: fig([poly(square), arc([0, 0], s, 0, 90), arc([s, s], s, 180, 270), text([s / 2, s / 2], '?')]),
          answer: choices(rng, mix(pi(2 * h * h), '−', `${s * s}`), [mix(pi(h * h), '−', `${s * s / 2}`), mix(pi(s * s), '−', `${s * s}`), mix(`${s * s}`, '−', pi(h * h))]),
          hints: [
            'Add the areas of the two quarter circles. Together they cover the whole square, but they cover the leaf twice.',
            'So (quarter + quarter) − square = leaf.',
          ],
          solution: [
            { text: 'The two quarter circles together cover the entire square, and the leaf is the part covered twice. So adding the two quarter circles gives the square plus one extra copy of the leaf.' },
            {
              text: 'Subtract the square to leave the leaf.',
              visual: working([
                { label: 'Each quarter circle', text: `¼ × π × ${s}² = ${pi(h * h)}` },
                { label: 'Both', text: pi(2 * h * h) },
                { label: 'Square', text: `${s * s}` },
                { label: 'Leaf', text: mix(pi(2 * h * h), '−', `${s * s}`) },
              ]),
            },
          ],
        };
      },
    },
    {
      id: 'shaded/semicircles',
      idea: 'Semicircles on the sides',
      buildsOn: 'shaded/quarters',
      generate: rng => {
        const variant = int(rng, 0, 2);
        if (variant === 0) {
          const h = int(rng, 1, 6);
          const W = 2 * h;
          const L = W + int(rng, 2, 10);
          const wantArea = rng() < 0.5;
          return {
            prompt: `A running track is shaped like a ${L} by ${W} rectangle with a semicircle attached to each of the two sides of length ${W}. What is the ${wantArea ? 'area enclosed by' : 'distance around'} the track?`,
            visual: fig([poly([[0, 0], [L, 0], [L, W], [0, W]], 'shade'), sector([L, h], h, -90, 90, 'shade'), sector([0, h], h, 90, 270, 'shade')]),
            answer: wantArea
              ? choices(rng, mix(`${L * W}`, '+', pi(h * h)), [mix(`${L * W}`, '+', pi(W * W)), mix(`${L * W}`, '+', pi(2 * h * h)), mix(`${L * W}`, '+', pi(W))])
              : choices(rng, mix(`${2 * L}`, '+', pi(W)), [mix(`${2 * L + 2 * W}`, '+', pi(W)), mix(`${2 * L}`, '+', pi(2 * W)), mix(`${2 * L}`, '+', pi(h))]),
            hints: [
              `The two semicircles have diameter ${W}, so radius ${h}. Together they make one full circle.`,
              wantArea ? 'Area = rectangle + one full circle.' : `Distance around = the two straight sides of length ${L} + one full circumference. The sides of length ${W} are inside the shape.`,
            ],
            solution: [
              {
                text: `The two semicircular ends combine into one circle of radius ${h}.`,
                visual: working(
                  wantArea
                    ? [
                        { label: 'Rectangle', text: `${L} × ${W} = ${L * W}` },
                        { label: 'Circle', text: `π × ${h}² = ${pi(h * h)}` },
                        { label: 'Total', text: mix(`${L * W}`, '+', pi(h * h)) },
                      ]
                    : [
                        { label: 'Straight parts', text: `2 × ${L} = ${2 * L}` },
                        { label: 'Curved parts', text: `one circumference: π × ${W} = ${pi(W)}` },
                        { label: 'Total', text: mix(`${2 * L}`, '+', pi(W)) },
                      ],
                ),
              },
            ],
          };
        }
        if (variant === 1) {
          const h = int(rng, 1, 6);
          const s = 2 * h;
          return {
            prompt: `A semicircle is drawn outward on each of the four sides of a square of side ${s}, using the side as its diameter. What is the total area of the resulting flower shape, including the square?`,
            visual: fig([poly([[0, 0], [s, 0], [s, s], [0, s]], 'shade'), sector([h, 0], h, 180, 360, 'shade'), sector([s, h], h, -90, 90, 'shade'), sector([h, s], h, 0, 180, 'shade'), sector([0, h], h, 90, 270, 'shade')]),
            answer: choices(rng, mix(`${s * s}`, '+', pi(2 * h * h)), [mix(`${s * s}`, '+', pi(h * h)), mix(`${s * s}`, '+', pi(4 * h * h)), mix(`${s * s}`, '+', pi(2 * s * s))]),
            hints: [`Each semicircle has diameter ${s}, so radius ${h}.`, 'Four semicircles make two full circles.'],
            solution: [
              {
                text: 'Square plus four semicircles, which is square plus two circles.',
                visual: working([
                  { label: 'Square', text: `${s}² = ${s * s}` },
                  { label: 'Two circles', text: `2 × π × ${h}² = ${pi(2 * h * h)}` },
                  { label: 'Total', text: mix(`${s * s}`, '+', pi(2 * h * h)) },
                ]),
              },
            ],
          };
        }
        const [a, b, c] = triple(rng, 30);
        const tB = (Math.atan2(b, -a) * 180) / Math.PI;
        const picture = fig([
          sector([a / 2, 0], a / 2, 180, 360, 'shade'),
          sector([0, b / 2], b / 2, 90, 270, 'shade'),
          sector([a / 2, b / 2], c / 2, tB, tB + 180, 'erase'),
          poly([[0, 0], [a, 0], [0, b]]),
        ]);
        return {
          prompt: `A right triangle has legs ${a} and ${b}. A semicircle is drawn outward on each leg, and a semicircle on the hypotenuse is drawn back over the triangle, passing through the right-angle corner. This leaves two crescent-shaped regions (shaded). What is their total area?`,
          visual: picture,
          answer: { kind: 'number', value: (a * b) / 2 },
          hints: [
            'Crescents = (two small semicircles + triangle) − (big semicircle).',
            `Semicircle areas depend on the squares of the diameters, and ${a}² + ${b}² = ${c}². What does that do to the π terms?`,
          ],
          solution: [
            { text: 'Start with the triangle plus the two semicircles on the legs. Remove the semicircle on the hypotenuse (which passes through the right angle, by the inscribed-angle theorem). What remains is the two crescents.' },
            {
              text: 'A semicircle with diameter d has area πd²/8.',
              visual: working([
                { label: 'On the legs', text: `π × ${a}²/8 + π × ${b}²/8 = ${a * a + b * b}π/8` },
                { label: 'On the hypotenuse', text: `π × ${c}²/8 = ${c * c}π/8` },
                { label: 'Those cancel', text: `since ${a}² + ${b}² = ${c}²` },
                { label: 'Crescents', text: `the triangle alone: ½ × ${a} × ${b} = ${(a * b) / 2}` },
              ]),
            },
            { text: 'Every π disappears. These crescents are the lunes of Hippocrates, found about 2,400 years ago, and they were the first curved regions whose area was shown to be a plain number.' },
          ],
        };
      },
    },
    {
      id: 'shaded/segments',
      idea: 'Sector minus triangle',
      buildsOn: 'special_right/equilateral',
      generate: rng => {
        if (rng() < 0.55) {
          const h = int(rng, 1, 6);
          const r = 2 * h;
          return {
            prompt: `In a circle of radius ${r}, two radii meet at a right angle. What is the area of the region between the chord joining their endpoints and the arc it cuts off?`,
            visual: fig([circ(O, r, undefined, true), sector(O, r, 0, 90, 'shade'), poly([[0, 0], [r, 0], [0, r]], 'erase'), seg([r, 0], [0, r]), seg(O, [r, 0]), seg(O, [0, r])]),
            answer: choices(rng, mix(pi(h * h), '−', `${2 * h * h}`), [mix(pi(h * h), '−', `${4 * h * h}`), mix(pi(4 * h * h), '−', `${2 * h * h}`), mix(pi(2 * h * h), '−', `${2 * h * h}`)]),
            hints: ['Segment = sector − triangle.', `The sector is a quarter of the circle. The triangle is a right triangle with both legs ${r}.`],
            solution: [
              {
                text: 'The two radii and the arc bound a quarter-circle sector. Remove the right triangle formed by the radii and the chord.',
                visual: working([
                  { label: 'Sector', text: `¼ × π × ${r}² = ${pi(h * h)}` },
                  { label: 'Triangle', text: `½ × ${r} × ${r} = ${2 * h * h}` },
                  { label: 'Segment', text: mix(pi(h * h), '−', `${2 * h * h}`) },
                ]),
              },
            ],
          };
        }
        const k = pick(rng, [1, 2]);
        const r = 6 * k;
        const [sec, tri] = [6 * k * k, 9 * k * k];
        return {
          prompt: `In a circle of radius ${r}, two radii meet at a 60° angle. What is the area of the region between the chord joining their endpoints and the arc it cuts off?`,
          visual: fig([circ(O, r, undefined, true), sector(O, r, 0, 60, 'shade'), poly([O, [r, 0], polar(O, r, 60)], 'erase'), poly([O, [r, 0], polar(O, r, 60)])]),
          answer: choices(rng, mix(pi(sec), '−', `${tri}√3`), [mix(pi(sec), '−', `${2 * tri}√3`), mix(pi(sec), '−', `${2 * tri}`), mix(pi(2 * sec), '−', `${tri}√3`)]),
          hints: [
            'Segment = sector − triangle. The sector is 60/360 = 1/6 of the circle.',
            `Two radii with a 60° angle between them: the triangle is equilateral with side ${r}.`,
          ],
          solution: [
            { text: `The triangle formed by the two radii and the chord is isosceles with a 60° top angle, so all its angles are 60°: it is equilateral with side ${r}.` },
            {
              text: 'Sector minus equilateral triangle.',
              visual: working([
                { label: 'Sector', text: `⅙ × π × ${r}² = ${pi(sec)}` },
                { label: 'Triangle', text: `${r}² × √3 ÷ 4 = ${tri}√3` },
                { label: 'Segment', text: mix(pi(sec), '−', `${tri}√3`) },
              ]),
            },
          ],
        };
      },
    },
  ],
};

// ── Geometric Probability ────────────────────────────────────────────────────

const geoProb: Lesson = {
  topic: 'geo_prob',
  intro: [
    {
      text: 'So far probability has meant counting: favorable outcomes over total outcomes. But if a point is chosen at random on a line segment, there are infinitely many outcomes, and counting breaks down. Measure instead. The probability of landing in a part of the segment is the length of that part divided by the whole length.',
      visual: fig([seg([0, 0], [10, 0]), seg([0, -0.3], [0, 0.3]), seg([10, -0.3], [10, 0.3]), poly([[6, -0.25], [10, -0.25], [10, 0.25], [6, 0.25]], 'shade'), text([0, -0.9], '0'), text([6, -0.9], '6'), text([10, -0.9], '10')], { caption: 'A random point from 0 to 10 lands past 6 with probability 4/10 = 2/5.' }),
    },
    {
      text: 'A bus comes every 15 minutes and you show up at a random moment. What is the chance you wait 5 minutes or less? Your arrival is a random point in a 15-minute window, and you are happy only if it falls in the last 5 minutes before a bus. Probability: 5/15 = 1/3.',
    },
    {
      text: 'In two dimensions, use area. A dart that lands at a random point of a board hits a region with probability (area of region) ÷ (area of board). For a circular target, remember that area grows with the SQUARE of the radius: a bullseye with half the radius of the board is only a quarter of the board.',
      visual: fig([circ(O, 3), circ(O, 1.5, 'shade')], { caption: 'Half the radius, one quarter of the area.' }),
    },
    {
      text: 'The most powerful version: when TWO numbers are chosen at random, plot them as a single point (x, y) in a rectangle. A condition like x + y < 4 becomes a region of that rectangle, and the probability is its area over the area of the rectangle.',
      visual: fig([poly([[0, 0], [6, 0], [6, 6], [0, 6]]), poly([[0, 0], [4, 0], [0, 4]], 'shade'), text([1.2, 1.2], 'x + y < 4')], { grid: true, pad: 0.6, caption: 'x and y from 0 to 6: the triangle has area 8 out of 36, so the probability is 2/9.' }),
    },
  ],
  rungs: [
    {
      id: 'geo_prob/length',
      idea: 'Probability as a ratio of lengths',
      buildsOn: 'prob_basics/single',
      generate: rng => {
        const variant = int(rng, 0, 2);
        if (variant === 0) {
          const T = pick(rng, [10, 12, 15, 20, 30]);
          const w = int(rng, 2, T - 2);
          const [num, den] = reduce(w, T);
          return {
            prompt: `A shuttle leaves a stop exactly every ${T} minutes. Kim arrives at the stop at a random time. What is the probability that she waits ${w} minutes or less for the next shuttle? ${LOWEST}`,
            answer: { kind: 'fraction', num, den },
            hints: [`Kim's arrival is a random point in a ${T}-minute gap between shuttles.`, `She waits ${w} minutes or less only if she arrives in the last ${w} minutes of the gap.`],
            solution: [
              { text: `Picture the ${T} minutes between two shuttles as a segment. Kim lands at a random point on it, and the good part is the final ${w} minutes.` },
              { text: 'Good length over total length.', visual: working([{ label: 'Probability', text: `${w}/${T}${den === T ? '' : ` = ${num}/${den}`}` }]) },
            ],
          };
        }
        if (variant === 1) {
          const L = pick(rng, [10, 12, 16, 20, 24, 30]);
          const a = 2 * int(rng, 2, L / 2 - 1);
          const [num, den] = reduce(a / 2, L);
          return {
            prompt: `A point is chosen at random on the number line between 0 and ${L}. What is the probability that it is closer to 0 than to ${a}? ${LOWEST}`,
            answer: { kind: 'fraction', num, den },
            hints: [`Which points are equally far from 0 and from ${a}?`, `The midpoint ${a / 2} is the boundary. Points to its left are closer to 0.`],
            solution: [
              { text: `The point exactly halfway between 0 and ${a} is ${a / 2}. Everything to the left of it is closer to 0, and everything to the right (all the way to ${L}) is closer to ${a}.` },
              { text: 'Good length over total length.', visual: working([{ label: 'Good part', text: `from 0 to ${a / 2}: length ${a / 2}` }, { label: 'Probability', text: `${a / 2}/${L}${den === L ? '' : ` = ${num}/${den}`}` }]) },
            ],
          };
        }
        const L = pick(rng, [12, 15, 18, 20, 24, 30, 36]);
        const d = int(rng, 1, Math.floor(L / 2) - 1);
        const [num, den] = reduce(L - 2 * d, L);
        return {
          prompt: `A ${L}-inch string is cut at a random point. What is the probability that BOTH pieces are longer than ${d} inch${d === 1 ? '' : 'es'}? ${LOWEST}`,
          answer: { kind: 'fraction', num, den },
          hints: [`The cut must be more than ${d} from the left end AND more than ${d} from the right end.`, `So the cut lies between ${d} and ${L - d}: a stretch of length ${L - 2 * d}.`],
          solution: [
            { text: `A cut within ${d} inch${d === 1 ? '' : 'es'} of either end leaves a piece that is too short. So the bad zones are ${d} at each end, and the good zone is the middle.` },
            { text: 'Good length over total length.', visual: working([{ label: 'Good part', text: `${L} − 2 × ${d} = ${L - 2 * d}` }, { label: 'Probability', text: `${L - 2 * d}/${L}${den === L ? '' : ` = ${num}/${den}`}` }]) },
          ],
        };
      },
    },
    {
      id: 'geo_prob/area',
      idea: 'Probability as a ratio of areas',
      buildsOn: 'circles/rings',
      generate: rng => {
        const variant = int(rng, 0, 2);
        if (variant === 0) {
          const r = int(rng, 1, 5);
          const R = r + int(rng, 1, 5);
          const ring = rng() < 0.5;
          const [num, den] = ring ? reduce(R * R - r * r, R * R) : reduce(r * r, R * R);
          return {
            prompt: `A circular dartboard has radius ${R}, and its bullseye is a circle of radius ${r} at the center. A dart lands at a random point on the board. What is the probability that it ${ring ? 'misses' : 'hits'} the bullseye? ${LOWEST}`,
            visual: fig(ring ? [circ(O, R, 'shade'), circ(O, r, 'erase')] : [circ(O, R), circ(O, r, 'shade')]),
            answer: { kind: 'fraction', num, den },
            hints: ['Compare AREAS, not radii.', `Bullseye: ${pi(r * r)}. Board: ${pi(R * R)}. The π cancels.`],
            solution: [
              {
                text: 'The probability is the ratio of areas. The πs cancel, leaving the ratio of the squared radii.',
                visual: working([
                  { label: 'Bullseye', text: pi(r * r) },
                  { label: 'Board', text: pi(R * R) },
                  { label: 'Hit', text: `${r * r}/${R * R}${ring ? '' : den === R * R ? '' : ` = ${num}/${den}`}` },
                  ...(ring ? [{ label: 'Miss', text: `1 − ${r * r}/${R * R} = ${num}/${den}` }] : []),
                ]),
              },
            ],
          };
        }
        if (variant === 1) {
          const s = int(rng, 1, 6);
          const S = s + int(rng, 1, 6);
          const [num, den] = reduce(s * s, S * S);
          return {
            prompt: `A square tile of side ${S} has a smaller square of side ${s} painted on it. A drop of rain lands at a random point on the tile. What is the probability that it lands on the painted square? ${LOWEST}`,
            answer: { kind: 'fraction', num, den },
            hints: ['Ratio of areas.', `${s}² out of ${S}².`],
            solution: [{ text: 'Painted area over total area.', visual: working([{ label: 'Painted', text: `${s}² = ${s * s}` }, { label: 'Tile', text: `${S}² = ${S * S}` }, { label: 'Probability', text: `${s * s}/${S * S}${den === S * S ? '' : ` = ${num}/${den}`}` }]) }],
          };
        }
        const r1 = int(rng, 1, 3);
        const r2 = r1 + int(rng, 1, 3);
        const r3 = r2 + int(rng, 1, 3);
        const [num, den] = reduce(r2 * r2 - r1 * r1, r3 * r3);
        return {
          prompt: `A target is made of three circles with the same center and radii ${r1}, ${r2} and ${r3}. An arrow hits a random point of the target. What is the probability that it lands in the middle ring, between the circles of radius ${r1} and ${r2}? ${LOWEST}`,
          visual: fig([circ(O, r3), circ(O, r2, 'shade'), circ(O, r1, 'erase')]),
          answer: { kind: 'fraction', num, den },
          hints: [`The middle ring's area is ${pi(r2 * r2)} − ${pi(r1 * r1)}.`, `Divide by the whole target, ${pi(r3 * r3)}.`],
          solution: [
            {
              text: 'Ring area over whole area. Every term has a π, so it cancels.',
              visual: working([
                { label: 'Middle ring', text: `${pi(r2 * r2)} − ${pi(r1 * r1)} = ${pi(r2 * r2 - r1 * r1)}` },
                { label: 'Target', text: pi(r3 * r3) },
                { label: 'Probability', text: `${r2 * r2 - r1 * r1}/${r3 * r3}${den === r3 * r3 ? '' : ` = ${num}/${den}`}` },
              ]),
            },
          ],
        };
      },
    },
    {
      id: 'geo_prob/regions',
      idea: 'Turn a condition into a region',
      buildsOn: 'lines/intercepts',
      generate: rng => {
        const b = int(rng, 3, 8);
        const a = b + int(rng, 0, 5);
        const rect: Pt[] = [[0, 0], [a, 0], [a, b], [0, b]];
        const variant = int(rng, 0, 2);
        if (variant === 0) {
          const k = int(rng, 2, b);
          const [num, den] = reduce(k * k, 2 * a * b);
          return {
            prompt: `A point (x, y) is chosen at random with x between 0 and ${a} and y between 0 and ${b}. What is the probability that x + y < ${k}? ${LOWEST}`,
            visual: fig([poly(rect), poly([[0, 0], [k, 0], [0, k]], 'shade')], { grid: true, pad: 0.6 }),
            answer: { kind: 'fraction', num, den },
            hints: [`The boundary x + y = ${k} is a line through (${k}, 0) and (0, ${k}).`, `The good region is the triangle below that line, with legs ${k} and ${k}.`],
            solution: [
              { text: `All possible points fill a ${a} by ${b} rectangle. The points with x + y < ${k} lie below the line through (${k}, 0) and (0, ${k}): a right triangle in the corner.` },
              {
                text: 'Triangle area over rectangle area.',
                visual: working([
                  { label: 'Triangle', text: `½ × ${k} × ${k} = ${(k * k) / 2}` },
                  { label: 'Rectangle', text: `${a} × ${b} = ${a * b}` },
                  { label: 'Probability', text: `${k * k}/${2 * a * b}${den === 2 * a * b ? '' : ` = ${num}/${den}`}` },
                ]),
              },
            ],
          };
        }
        const less = variant === 1;
        const [num, den] = less ? reduce(b, 2 * a) : reduce(2 * a - b, 2 * a);
        return {
          prompt: `A point (x, y) is chosen at random with x between 0 and ${a} and y between 0 and ${b}. What is the probability that ${less ? 'x < y' : 'x > y'}? ${LOWEST}`,
          visual: fig([poly(rect), less ? poly([[0, 0], [b, b], [0, b]], 'shade') : poly([[0, 0], [a, 0], [a, b], [b, b]], 'shade'), seg([0, 0], [b, b])], { grid: true, pad: 0.6 }),
          answer: { kind: 'fraction', num, den },
          hints: [
            `The boundary is the line y = x, which runs from (0, 0) to (${b}, ${b}).`,
            `Points with x < y are above that line: a right triangle with legs ${b} and ${b}.${less ? '' : ' You want everything else.'}`,
          ],
          solution: [
            { text: `Draw the line y = x across the ${a} by ${b} rectangle. Above it, y is bigger; below it, x is bigger. The region above is a right triangle with legs ${b}.` },
            {
              text: 'Compare areas.',
              visual: working([
                { label: 'Above the line (x < y)', text: `½ × ${b} × ${b} = ${(b * b) / 2}` },
                { label: 'Rectangle', text: `${a} × ${b} = ${a * b}` },
                ...(less ? [] : [{ label: 'Below the line (x > y)', text: `${a * b} − ${(b * b) / 2} = ${a * b - (b * b) / 2}` }]),
                { label: 'Probability', text: `${less ? (b * b) / 2 : a * b - (b * b) / 2}/${a * b} = ${num}/${den}` },
              ]),
            },
            ...(a === b ? [{ text: 'In a square the answer is 1/2 by symmetry: x and y play identical roles.' }] : []),
          ],
        };
      },
    },
    {
      id: 'geo_prob/two-numbers',
      idea: 'Two random numbers are one random point',
      buildsOn: 'geo_prob/regions',
      generate: rng => {
        if (rng() < 0.6) {
          const [m, n, d] = pick(rng, [[10, 1, 6], [12, 1, 5], [15, 1, 4], [20, 1, 3], [30, 1, 2], [24, 2, 5], [36, 3, 5], [40, 2, 3], [45, 3, 4], [48, 4, 5]] as const);
          // Waiting m minutes of 60 is the fraction n/d; they miss with probability ((d − n)/d)².
          const [num, den] = reduce(d * d - (d - n) * (d - n), d * d);
          const sq: Pt[] = [[0, 0], [60, 0], [60, 60], [0, 60]];
          const band: Pt[] = [[0, 0], [m, 0], [60, 60 - m], [60, 60], [60 - m, 60], [0, m]];
          return {
            prompt: `Two friends each arrive at a café at a random time between 12:00 and 1:00. Each waits ${m} minutes for the other and then leaves. What is the probability that they meet? ${LOWEST}`,
            visual: fig([poly(sq), poly(band, 'shade')], { caption: 'Each point is a pair of arrival times. They meet in the shaded band.' }),
            answer: { kind: 'fraction', num, den },
            hints: [
              `Let x and y be their arrival times in minutes after noon. They meet when x and y differ by less than ${m}.`,
              `In the 60 by 60 square, the points where they do NOT meet form two corner triangles with legs ${60 - m}.`,
            ],
            solution: [
              { text: `Plot the two arrival times as a point (x, y) in a 60 by 60 square. They meet when the times are within ${m} minutes of each other, which is a band around the diagonal x = y.` },
              {
                text: 'The band is awkward, so subtract the two corner triangles where they miss each other.',
                visual: working([
                  { label: 'Each triangle', text: `legs ${60 - m}: ½ × ${60 - m} × ${60 - m}` },
                  { label: 'Both triangles', text: `${60 - m}² = ${(60 - m) ** 2}` },
                  { label: 'Square', text: '60² = 3,600' },
                  { label: 'Miss', text: `${(60 - m) ** 2}/3,600 = (${d - n}/${d})² = ${(d - n) ** 2}/${d * d}` },
                  { label: 'Meet', text: `1 − ${(d - n) ** 2}/${d * d} = ${num}/${den}` },
                ]),
              },
            ],
          };
        }
        const k = int(rng, 2, 6);
        return {
          prompt: `Two numbers x and y are each chosen at random between 0 and 1. What is the probability that y is more than ${k} times x? ${LOWEST}`,
          visual: fig([poly([[0, 0], [1, 0], [1, 1], [0, 1]]), poly([[0, 0], [1 / k, 1], [0, 1]], 'shade')], { pad: 0.12 }),
          answer: { kind: 'fraction', num: 1, den: 2 * k },
          hints: [
            `The boundary is the line y = ${k}x. It leaves the unit square through the top edge. Where?`,
            `At y = 1, x = 1/${k}. The good region is the triangle with corners (0, 0), (0, 1) and (1/${k}, 1).`,
          ],
          solution: [
            { text: `The pair is a random point in the unit square, which has area 1. The line y = ${k}x climbs steeply from the origin and hits the top edge at (1/${k}, 1). Points above the line have y > ${k}x.` },
            {
              text: 'That region is a right triangle along the left edge.',
              visual: working([
                { label: 'Legs', text: `1 (up the side) and 1/${k} (along the top)` },
                { label: 'Area', text: `½ × 1 × 1/${k} = 1/${2 * k}` },
                { label: 'Probability', text: `1/${2 * k}` },
              ]),
            },
          ],
        };
      },
    },
  ],
};

export const GEOMETRY_CIRCLE_LESSONS: Lesson[] = [circles, circleAngles, shaded];
export const GEO_PROB_LESSONS: Lesson[] = [geoProb];
