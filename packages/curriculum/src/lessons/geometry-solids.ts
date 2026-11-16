// Realm VI: Geometry — similarity, 3D geometry, and area and volume scaling.
import type { Lesson, Pt } from './types.ts';
import { centroid, cornerLabel, fig, poly, rightAngle, seg, sideLabel, text } from './figures.ts';
import { triple } from './geometry-area.ts';
import { fmt, int, pick, sup, working } from './util.ts';

const pi = (k: number) => (k === 1 ? 'π' : `${fmt(k)}π`);
const K_OF_PI = 'Your answer is a multiple of π: if it is kπ, enter k.';

/** Coprime pairs p < q for scale factors. */
const RATIOS: [number, number][] = [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [3, 5], [4, 5]];

// ── Similarity ───────────────────────────────────────────────────────────────

/** Triangle ABC with D on AB and E on AC, DE parallel to BC, cutting at fraction t from A. */
function nested(t: number, labels: { ad?: string; db?: string; de?: string; bc?: string }) {
  const [A, B, C]: Pt[] = [[3.5, 6], [0, 0], [9, 0]];
  const D: Pt = [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t];
  const E: Pt = [A[0] + (C[0] - A[0]) * t, A[1] + (C[1] - A[1]) * t];
  const g = centroid([A, B, C]);
  return fig([
    poly([A, B, C]),
    seg(D, E),
    cornerLabel(A, 'A', g, 0.5), cornerLabel(B, 'B', g, 0.5), cornerLabel(C, 'C', g, 0.5),
    text([D[0] - 0.5, D[1] + 0.1], 'D'), text([E[0] + 0.5, E[1] + 0.1], 'E'),
    ...(labels.ad ? [sideLabel(A, D, labels.ad, g, 1.1)] : []),
    ...(labels.db ? [sideLabel(D, B, labels.db, g, 1.1)] : []),
    ...(labels.de ? [text([(D[0] + E[0]) / 2, D[1] + 0.45], labels.de)] : []),
    ...(labels.bc ? [text([4.5, -0.55], labels.bc)] : []),
  ]);
}

const similarity: Lesson = {
  topic: 'similarity',
  intro: [
    {
      text: 'Two figures are similar when one is a scaled copy of the other: same shape, different size. Their angles match exactly, and every length in one is the same multiple of the matching length in the other. That multiple is the scale factor.',
      visual: fig([
        poly([[0, 0], [4, 0], [0, 3]]),
        poly([[6, 0], [14, 0], [6, 6]]),
        text([2, -0.5], '4'), text([-0.4, 1.5], '3'), text([2.4, 1.9], '5'),
        text([10, -0.5], '8'), text([5.6, 3], '6'), text([10.6, 3.5], '10'),
      ], { caption: 'Every side of the larger triangle is 2 times the matching side.' }),
    },
    {
      text: 'For triangles there is a shortcut: if two angles of one triangle equal two angles of another, the triangles are similar. (The third angles must match too, since each triangle totals 180°.) So to spot similar triangles, hunt for equal angles: shared angles, vertical angles, and angles made by parallel lines.',
    },
    {
      text: 'The most common setup is a line drawn across a triangle parallel to its base. It slices off a small triangle at the top that is similar to the whole triangle, because the parallel lines create equal corresponding angles.',
      visual: nested(0.4, { ad: '4', db: '6', de: '?', bc: '15' }),
    },
    {
      text: 'In that figure the small triangle ADE matches the WHOLE triangle ABC. Its side AD = 4 corresponds to AB = 4 + 6 = 10, not to DB = 6. So the scale factor is 4/10, and DE = 15 × 4/10 = 6. Using 4/6 instead is the classic mistake.',
      visual: working([
        { label: 'Matching sides', text: 'AD ↔ AB, and DE ↔ BC' },
        { label: 'Scale factor', text: 'AD/AB = 4/10 = 2/5' },
        { label: 'DE', text: '15 × 2/5 = 6' },
      ]),
    },
    {
      text: 'Shadows work the same way. At any one moment the sun\'s rays hit everything at the same angle, so a person and their shadow form a triangle similar to a tree and its shadow. If a 5-foot person casts a 3-foot shadow and a tree casts a 12-foot shadow, the tree is 4 times as big in every way: 20 feet tall.',
    },
  ],
  rungs: [
    {
      id: 'similarity/scale-factor',
      idea: 'Matching sides share one scale factor',
      buildsOn: 'ratios/one-part',
      generate: rng => {
        const [p, q] = pick(rng, RATIOS);
        const a = int(rng, 2, 7);
        let b = int(rng, 3, 9);
        if (b === a) b += 1;
        const [sa, sb, la, lb] = [a * p, b * p, a * q, b * q];
        const findLarge = rng() < 0.6;
        return {
          prompt: findLarge
            ? `Two triangles are similar. Two sides of the smaller triangle measure ${sa} and ${sb}. The side of the larger triangle that matches the ${sa} measures ${la}. How long is the side that matches the ${sb}?`
            : `Two triangles are similar. Two sides of the larger triangle measure ${la} and ${lb}. The side of the smaller triangle that matches the ${la} measures ${sa}. How long is the side that matches the ${lb}?`,
          answer: { kind: 'number', value: findLarge ? lb : sb },
          hints: [
            `Find the scale factor from the pair of matching sides you know: ${sa} and ${la}.`,
            findLarge ? `${la}/${sa} = ${q}/${p}. Multiply ${sb} by that.` : `${sa}/${la} = ${p}/${q}. Multiply ${lb} by that.`,
          ],
          solution: [
            {
              text: 'One pair of matching sides gives the scale factor. Apply it to the other side.',
              visual: working(
                findLarge
                  ? [
                      { label: 'Scale factor', text: `${la}/${sa} = ${p === 1 ? q : `${q}/${p}`}` },
                      { label: 'Missing side', text: `${sb} × ${p === 1 ? q : `${q}/${p}`} = ${lb}` },
                    ]
                  : [
                      { label: 'Scale factor', text: `${sa}/${la} = ${p}/${q}` },
                      { label: 'Missing side', text: `${lb} × ${p}/${q} = ${sb}` },
                    ],
              ),
            },
            { text: `Check with the other ratio: within each triangle the two sides are in the ratio ${a} : ${b}.` },
          ],
        };
      },
    },
    {
      id: 'similarity/shadows',
      idea: 'Shadows make similar triangles',
      buildsOn: 'similarity/scale-factor',
      generate: rng => {
        const [h, s] = pick(rng, [[5, 3], [6, 4], [4, 6], [5, 2], [6, 9], [4, 3], [6, 8], [5, 4], [3, 2], [6, 5]] as const);
        const k = int(rng, 3, 9);
        const thing = pick(rng, ['flagpole', 'tree', 'lamp post', 'tower']);
        const post = pick(rng, [`A ${h}-foot-tall fence post`, `A child who is ${h} feet tall`, `A ${h}-foot sign`]);
        if (rng() < 0.65) {
          return {
            prompt: `${post} casts a shadow ${s} feet long. At the same time, a nearby ${thing} casts a shadow ${s * k} feet long. How many feet tall is the ${thing}?`,
            answer: { kind: 'number', value: h * k },
            hints: ['The sun hits both at the same angle, so height and shadow form similar triangles.', `The ${thing}'s shadow is ${s * k} ÷ ${s} = ${k} times as long. So is its height.`],
            solution: [
              {
                text: 'Same sun angle means similar triangles. Compare the shadows to get the scale factor.',
                visual: working([
                  { label: 'Scale factor', text: `${s * k} ÷ ${s} = ${k}` },
                  { label: 'Height', text: `${h} × ${k} = ${h * k} feet` },
                ]),
              },
              { text: `Or compare within one triangle: height is ${h}/${s} of the shadow, and ${s * k} × ${h}/${s} = ${h * k}.` },
            ],
          };
        }
        // Lamp post and walking person: shadow tip triangle contains the person triangle.
        const [person, lamp, d] = pick(rng, [[6, 18, 10], [5, 15, 8], [6, 12, 9], [5, 20, 12], [6, 15, 12], [4, 12, 6], [5, 10, 7], [6, 24, 15]] as const);
        const shadow = (person * d) / (lamp - person);
        return {
          prompt: `A lamp is at the top of a ${lamp}-foot post. A person ${person} feet tall stands ${d} feet from the base of the post. How many feet long is the person's shadow?`,
          answer: { kind: 'number', value: shadow },
          hints: [
            'The tip of the shadow, the top of the person\'s head and the lamp are in a straight line. That makes a small triangle (person and shadow) inside a big one (post and ground).',
            `If the shadow is x, the big triangle's base is ${d} + x. So ${person}/x = ${lamp}/(${d} + x).`,
          ],
          solution: [
            { text: `The light ray from the lamp over the person's head to the ground makes two similar right triangles that share the angle at the shadow's tip. The small one has height ${person} and base x (the shadow). The big one has height ${lamp} and base ${d} + x.` },
            {
              text: 'Set the ratios equal.',
              visual: working([
                { label: 'Proportion', text: `${person}/x = ${lamp}/(${d} + x)` },
                { label: 'Cross-multiply', text: `${person}(${d} + x) = ${lamp}x` },
                { label: 'Collect', text: `${person * d} = ${lamp - person}x` },
                { label: 'So', text: `x = ${shadow} feet` },
              ]),
            },
            { text: `The base of the big triangle is the WHOLE distance from the post to the shadow's tip, ${d + shadow} feet, not just ${d}.` },
          ],
        };
      },
    },
    {
      id: 'similarity/parallel',
      idea: 'A parallel line cuts off a similar triangle',
      buildsOn: 'similarity/shadows',
      generate: rng => {
        const m = int(rng, 1, 5);
        let n = int(rng, 1, 5);
        if (n === m) n += 1;
        const u = int(rng, 1, 4);
        const v = int(rng, 2, 6);
        const [ad, db, de, bc] = [m * u, n * u, m * v, (m + n) * v];
        const findDE = rng() < 0.6;
        return {
          prompt: findDE
            ? `In triangle ABC, D is on AB and E is on AC, with DE parallel to BC. If AD = ${ad}, DB = ${db} and BC = ${bc}, how long is DE?`
            : `In triangle ABC, D is on AB and E is on AC, with DE parallel to BC. If AD = ${ad}, DB = ${db} and DE = ${de}, how long is BC?`,
          visual: nested(m / (m + n) < 0.3 ? 0.3 : m / (m + n) > 0.75 ? 0.75 : m / (m + n), findDE ? { ad: `${ad}`, db: `${db}`, de: '?', bc: `${bc}` } : { ad: `${ad}`, db: `${db}`, de: `${de}`, bc: '?' }),
          answer: { kind: 'number', value: findDE ? de : bc },
          hints: [
            'Triangle ADE is similar to the whole triangle ABC. Which side of ABC matches AD?',
            `AD matches AB = ${ad} + ${db} = ${ad + db}, not DB. The scale factor is ${ad}/${ad + db}.`,
          ],
          solution: [
            { text: 'Because DE is parallel to BC, triangles ADE and ABC have the same angles and are similar. AD corresponds to the full side AB.' },
            {
              text: 'Use the full side for the scale factor.',
              visual: working([
                { label: 'AB', text: `${ad} + ${db} = ${ad + db}` },
                { label: 'Scale factor', text: `AD/AB = ${ad}/${ad + db}${u === 1 && m + n === ad + db && m === ad ? '' : ` = ${m}/${m + n}`}` },
                findDE ? { label: 'DE', text: `${bc} × ${m}/${m + n} = ${de}` } : { label: 'BC', text: `${de} × ${m + n}/${m} = ${bc}` },
              ]),
            },
            { text: `The tempting wrong ratio is AD/DB = ${ad}/${db}. That compares a side of the small triangle with a piece that is not a side of any triangle here.` },
          ],
        };
      },
    },
    {
      id: 'similarity/hidden',
      idea: 'Similar triangles in disguise',
      buildsOn: 'similarity/parallel',
      generate: rng => {
        if (rng() < 0.55) {
          const [p, q] = pick(rng, RATIOS.filter(r => r[0] > 0));
          const u = int(rng, 2, 6);
          const v = int(rng, 1, 5);
          const [ab, cd, ac] = [p * u, q * u, (p + q) * v];
          const wantAE = rng() < 0.5;
          const [A, B, C, D]: Pt[] = [[3, 5], [3 + (8 * p) / q, 5], [8, 0], [0, 0]];
          const E: Pt = [A[0] + ((C[0] - A[0]) * p) / (p + q), A[1] + ((C[1] - A[1]) * p) / (p + q)];
          return {
            prompt: `In trapezoid ABCD, side AB is parallel to side CD, with AB = ${ab} and CD = ${cd}. The diagonals AC and BD cross at E. If AC = ${ac}, how long is ${wantAE ? 'AE' : 'EC'}?`,
            visual: fig([poly([A, B, C, D]), seg(A, C), seg(B, D), text([A[0] - 0.4, A[1] + 0.35], 'A'), text([B[0] + 0.4, B[1] + 0.35], 'B'), text([C[0] + 0.4, C[1] - 0.35], 'C'), text([D[0] - 0.4, D[1] - 0.35], 'D'), text([E[0], E[1] + 0.6], 'E')]),
            answer: { kind: 'number', value: wantAE ? p * v : q * v },
            hints: [
              'Triangles ABE and CDE have vertical angles at E, and alternate interior angles from the parallel sides. They are similar.',
              `Their scale factor is AB : CD = ${p} : ${q}, so E divides AC in that same ratio, AE : EC = ${p} : ${q}.`,
            ],
            solution: [
              { text: 'The crossing diagonals make a bowtie. Triangles ABE and CDE share vertical angles at E, and the parallel sides give equal alternate interior angles, so the triangles are similar with AB matching CD.' },
              {
                text: 'Matching sides AE and CE are in the same ratio as AB and CD.',
                visual: working([
                  { label: 'Ratio', text: `AE : EC = ${ab} : ${cd} = ${p} : ${q}` },
                  { label: 'Parts', text: `${p} + ${q} = ${p + q}, and ${ac} ÷ ${p + q} = ${v}` },
                  { label: wantAE ? 'AE' : 'EC', text: `${wantAE ? p : q} × ${v} = ${wantAE ? p * v : q * v}` },
                ]),
              },
            ],
          };
        }
        const k = pick(rng, [1, 2, 3, 5]);
        const a = int(rng, 1, 3);
        const b = a + int(rng, 1, 3);
        const [m, n, h] = [k * a * a, k * b * b, k * a * b];
        const [A, B, C, F]: Pt[] = [[0, 0], [m + n, 0], [m, h], [m, 0]];
        const scale = 10 / (m + n);
        const S = (pt: Pt): Pt => [pt[0] * scale, pt[1] * scale];
        return {
          prompt: `In a right triangle, the altitude drawn to the hypotenuse splits the hypotenuse into pieces of length ${m} and ${n}. How long is the altitude?`,
          visual: fig([poly([S(A), S(B), S(C)]), seg(S(C), S(F), true), ...rightAngle(S(F), S(B), S(C), 0.35), ...rightAngle(S(C), S(A), S(B), 0.35), text([S(F)[0] / 2, -0.5], `${m}`), text([(S(F)[0] + 10) / 2, -0.5], `${n}`), text([S(F)[0] + 0.45, S(C)[1] / 2], 'h')]),
          answer: { kind: 'number', value: h },
          hints: [
            'The altitude cuts the right triangle into two smaller right triangles. Compare their angles: they are similar to each other.',
            `Matching sides give ${m}/h = h/${n}, so h² = ${m} × ${n}.`,
          ],
          solution: [
            { text: 'Each small triangle shares an acute angle with the big triangle and has a right angle, so all three triangles are similar. In particular the two small ones are similar to each other.' },
            {
              text: 'In the two small triangles, the short leg over the long leg must match.',
              visual: working([
                { label: 'Proportion', text: `${m}/h = h/${n}` },
                { label: 'Cross-multiply', text: `h² = ${m} × ${n} = ${m * n}` },
                { label: 'So', text: `h = ${h}` },
              ]),
            },
            { text: 'The altitude to the hypotenuse is the geometric mean of the two pieces it creates.' },
          ],
        };
      },
    },
  ],
};

// ── 3D Geometry ──────────────────────────────────────────────────────────────

const POLY_NAMES: Record<number, string> = { 3: 'triangular', 4: 'square', 5: 'pentagonal', 6: 'hexagonal', 7: 'heptagonal', 8: 'octagonal', 10: 'decagonal', 12: '12-sided' };

const solids: Lesson = {
  topic: 'solids',
  intro: [
    {
      text: 'A prism is a solid with two identical, parallel ends and straight sides: a box, a triangular tent, a hexagonal pencil. Think of it as its base shape stacked up through its height. So its volume is (area of the base) × (height). A cylinder is the same idea with a circular base: V = πr²h.',
      visual: working([
        { label: 'Box', text: 'V = length × width × height' },
        { label: 'Any prism', text: 'V = base area × height' },
        { label: 'Cylinder', text: 'V = πr² × h' },
      ]),
    },
    {
      text: 'A pyramid or cone comes to a point, and it holds exactly one third of the prism or cylinder with the same base and height. You can check this by pouring: three cones of water fill the matching cylinder.',
      visual: working([
        { label: 'Pyramid', text: 'V = ⅓ × base area × height' },
        { label: 'Cone', text: 'V = ⅓ × πr² × h' },
        { label: 'Sphere', text: 'V = 4/3 × πr³, surface = 4πr²' },
      ]),
    },
    {
      text: 'Surface area is the total area of the outside, the amount of wrapping paper. For a box, add the six faces, which come in three matching pairs: 2(lw + lh + wh). For anything else, imagine unfolding it flat and add up the pieces.',
    },
    {
      text: 'Solids with flat faces also have a counting rule. A cube has 6 faces, 8 vertices and 12 edges, and 8 − 12 + 6 = 2. Euler discovered that for every such solid without holes, V − E + F = 2. Know any two of the counts and you have the third.',
      visual: working([
        { label: 'Cube', text: 'V − E + F = 8 − 12 + 6 = 2' },
        { label: 'Square pyramid', text: '5 − 8 + 5 = 2' },
        { label: 'Triangular prism', text: '6 − 9 + 5 = 2' },
      ]),
    },
  ],
  rungs: [
    {
      id: 'solids/boxes',
      idea: 'Volume and surface area of prisms',
      buildsOn: 'area/formulas',
      generate: rng => {
        const variant = int(rng, 0, 2);
        if (variant === 0) {
          const [l, w, h] = [int(rng, 3, 12), int(rng, 2, 9), int(rng, 2, 8)];
          const sa = 2 * (l * w + l * h + w * h);
          const wantSA = rng() < 0.6;
          return {
            prompt: `A rectangular box measures ${l} by ${w} by ${h}. What is its ${wantSA ? 'surface area' : 'volume'}?`,
            answer: { kind: 'number', value: wantSA ? sa : l * w * h },
            hints: wantSA ? ['The six faces come in three matching pairs.', `The three different faces are ${l} × ${w}, ${l} × ${h} and ${w} × ${h}.`] : ['Multiply the three dimensions.', `${l} × ${w} × ${h}.`],
            solution: [
              wantSA
                ? {
                    text: 'Find the three different faces, add them, and double.',
                    visual: working([
                      { label: 'Top and bottom', text: `${l} × ${w} = ${l * w}` },
                      { label: 'Front and back', text: `${l} × ${h} = ${l * h}` },
                      { label: 'Two sides', text: `${w} × ${h} = ${w * h}` },
                      { label: 'Surface area', text: `2 × (${l * w} + ${l * h} + ${w * h}) = ${sa}` },
                    ]),
                  }
                : { text: 'Volume of a box is length × width × height.', visual: working([{ label: 'Volume', text: `${l} × ${w} × ${h} = ${fmt(l * w * h)}` }]) },
            ],
          };
        }
        if (variant === 1) {
          const s = int(rng, 2, 10);
          const forward = rng() < 0.5;
          return {
            prompt: forward ? `A cube has a surface area of ${6 * s * s}. What is its volume?` : `A cube has a volume of ${fmt(s ** 3)}. What is its surface area?`,
            answer: { kind: 'number', value: forward ? s ** 3 : 6 * s * s },
            hints: forward
              ? ['A cube has 6 identical square faces. Find the area of one.', `One face is ${6 * s * s} ÷ 6 = ${s * s}, so the edge is ${s}.`]
              : [`What number cubed is ${fmt(s ** 3)}?`, `The edge is ${s}. Each of the 6 faces has area ${s * s}.`],
            solution: [
              {
                text: 'Everything about a cube comes from its edge length, so find that first.',
                visual: working(
                  forward
                    ? [
                        { label: 'One face', text: `${6 * s * s} ÷ 6 = ${s * s}` },
                        { label: 'Edge', text: `√${s * s} = ${s}` },
                        { label: 'Volume', text: `${s}³ = ${fmt(s ** 3)}` },
                      ]
                    : [
                        { label: 'Edge', text: `${s}³ = ${fmt(s ** 3)}, so the edge is ${s}` },
                        { label: 'One face', text: `${s}² = ${s * s}` },
                        { label: 'Surface area', text: `6 × ${s * s} = ${6 * s * s}` },
                      ],
                ),
              },
            ],
          };
        }
        const [a, b, c] = triple(rng, 26);
        const L = int(rng, 4, 15);
        const wantSA = rng() < 0.4;
        const sa = a * b + (a + b + c) * L;
        return {
          prompt: `A tent is a prism ${L} feet long. Its two ends are right triangles with legs ${a} and ${b} feet. What is the ${wantSA ? 'total surface area of the prism, including both ends and the floor, in square feet' : 'volume of the tent, in cubic feet'}?`,
          answer: { kind: 'number', value: wantSA ? sa : (a * b * L) / 2 },
          hints: wantSA
            ? [`The surface has two triangular ends and three rectangles, each ${L} long. One rectangle sits on the hypotenuse.`, `The hypotenuse is ${c}, so the rectangles are ${a} × ${L}, ${b} × ${L} and ${c} × ${L}.`]
            : ['Volume of a prism = area of the end × length.', `The triangular end has area ½ × ${a} × ${b} = ${(a * b) / 2}.`],
          solution: [
            wantSA
              ? {
                  text: 'Unfold the prism: two triangles and three rectangles, one for each side of the triangle.',
                  visual: working([
                    { label: 'Hypotenuse', text: `√(${a}² + ${b}²) = ${c}` },
                    { label: 'Two ends', text: `2 × ½ × ${a} × ${b} = ${a * b}` },
                    { label: 'Three rectangles', text: `(${a} + ${b} + ${c}) × ${L} = ${(a + b + c) * L}` },
                    { label: 'Total', text: `${a * b} + ${(a + b + c) * L} = ${sa}` },
                  ]),
                }
              : {
                  text: 'Base area times the length of the prism.',
                  visual: working([
                    { label: 'Triangular end', text: `½ × ${a} × ${b} = ${(a * b) / 2}` },
                    { label: 'Volume', text: `${(a * b) / 2} × ${L} = ${(a * b * L) / 2}` },
                  ]),
                },
          ],
        };
      },
    },
    {
      id: 'solids/round',
      idea: 'Cylinders, cones and spheres',
      buildsOn: 'circles/basics',
      generate: rng => {
        const variant = int(rng, 0, 3);
        if (variant === 0) {
          const r = int(rng, 2, 9);
          const h = int(rng, 2, 12);
          return {
            prompt: `A cylinder has radius ${r} and height ${h}. What is its volume? ${K_OF_PI}`,
            answer: { kind: 'number', value: r * r * h },
            hints: ['Volume = base area × height, and the base is a circle.', `Base area is ${pi(r * r)}.`],
            solution: [{ text: 'Circle area times height.', visual: working([{ label: 'Base', text: `π × ${r}² = ${pi(r * r)}` }, { label: 'Volume', text: `${pi(r * r)} × ${h} = ${pi(r * r * h)}` }]) }],
          };
        }
        if (variant === 1) {
          const [r, h, l] = triple(rng, 26);
          const wantV = (r * r * h) % 3 === 0 && rng() < 0.5;
          return {
            prompt: wantV
              ? `A cone has radius ${r} and height ${h}. What is its volume? ${K_OF_PI}`
              : `A cone has radius ${r} and height ${h}. The area of its curved surface is π × radius × slant height. What is that area? ${K_OF_PI}`,
            answer: { kind: 'number', value: wantV ? (r * r * h) / 3 : r * l },
            hints: wantV
              ? ['A cone is one third of the cylinder with the same base and height.', `⅓ × π × ${r}² × ${h}.`]
              : ['The slant height runs from the tip down the side to the rim. With the radius and the height it forms a right triangle.', `Slant height = √(${r}² + ${h}²) = ${l}.`],
            solution: [
              wantV
                ? { text: 'One third of the matching cylinder.', visual: working([{ label: 'Cylinder', text: `π × ${r}² × ${h} = ${pi(r * r * h)}` }, { label: 'Cone', text: `${pi(r * r * h)} ÷ 3 = ${pi((r * r * h) / 3)}` }]) }
                : {
                    text: 'The height, the radius and the slant height form a right triangle inside the cone.',
                    visual: working([
                      { label: 'Slant height', text: `√(${r}² + ${h}²) = √${l * l} = ${l}` },
                      { label: 'Curved surface', text: `π × ${r} × ${l} = ${pi(r * l)}` },
                    ]),
                  },
            ],
          };
        }
        if (variant === 2) {
          const r = 3 * int(rng, 1, 4);
          const wantV = rng() < 0.6;
          return {
            prompt: `A sphere has radius ${r}. What is its ${wantV ? 'volume' : 'surface area'}? ${K_OF_PI}`,
            answer: { kind: 'number', value: wantV ? (4 * r ** 3) / 3 : 4 * r * r },
            hints: wantV ? ['V = 4/3 × π × r³.', `r³ = ${fmt(r ** 3)}.`] : ['Surface area = 4πr².', `r² = ${r * r}.`],
            solution: [
              wantV
                ? { text: 'Cube the radius, multiply by 4/3.', visual: working([{ label: 'r³', text: `${r}³ = ${fmt(r ** 3)}` }, { label: 'Volume', text: `4/3 × ${fmt(r ** 3)} × π = ${pi((4 * r ** 3) / 3)}` }]) }
                : { text: 'A sphere\'s surface is exactly four times the area of a circle through its middle.', visual: working([{ label: 'Great circle', text: `π × ${r}² = ${pi(r * r)}` }, { label: 'Surface', text: `4 × ${pi(r * r)} = ${pi(4 * r * r)}` }]) },
            ],
          };
        }
        const r = 3 * int(rng, 1, 3);
        return {
          prompt: `A sphere of radius ${r} fits snugly inside a cylinder, touching the side, the top and the bottom. What is the volume of the space inside the cylinder but outside the sphere? ${K_OF_PI}`,
          answer: { kind: 'number', value: 2 * r ** 3 - (4 * r ** 3) / 3 },
          hints: [`The cylinder has the same radius as the sphere, ${r}. What is its height?`, `Its height is the sphere's diameter, ${2 * r}.`],
          solution: [
            {
              text: `The cylinder has radius ${r} and height ${2 * r}.`,
              visual: working([
                { label: 'Cylinder', text: `π × ${r}² × ${2 * r} = ${pi(2 * r ** 3)}` },
                { label: 'Sphere', text: `4/3 × π × ${r}³ = ${pi((4 * r ** 3) / 3)}` },
                { label: 'Space left', text: `${pi(2 * r ** 3)} − ${pi((4 * r ** 3) / 3)} = ${pi(2 * r ** 3 - (4 * r ** 3) / 3)}` },
              ]),
            },
            { text: 'The sphere always fills exactly two thirds of its snug cylinder. Archimedes was so proud of this that he asked for it to be carved on his tomb.' },
          ],
        };
      },
    },
    {
      id: 'solids/euler',
      idea: 'Faces, vertices and edges',
      buildsOn: 'counting_lists/consecutive',
      generate: rng => {
        if (rng() < 0.65) {
          const n = pick(rng, [3, 5, 6, 7, 8, 10, 12]);
          const prism = rng() < 0.5;
          const counts = prism ? { faces: n + 2, vertices: 2 * n, edges: 3 * n } : { faces: n + 1, vertices: n + 1, edges: 2 * n };
          const want = pick(rng, ['faces', 'vertices', 'edges', 'edges'] as const);
          const name = `${POLY_NAMES[n]} ${prism ? 'prism' : 'pyramid'}`;
          return {
            prompt: `How many ${want} does a ${name} have? (Its base is a polygon with ${n} sides.)`,
            answer: { kind: 'number', value: counts[want] },
            hints: [
              prism ? `A prism has two ${n}-sided ends joined by rectangles.` : `A pyramid has one ${n}-sided base, and triangles that meet at a single top point.`,
              prism
                ? `Vertices: ${n} on each end. Edges: ${n} around each end plus ${n} connecting them. Faces: 2 ends plus ${n} rectangles.`
                : `Vertices: ${n} on the base plus the tip. Edges: ${n} around the base plus ${n} going up to the tip. Faces: the base plus ${n} triangles.`,
            ],
            solution: [
              {
                text: `Build the ${name} piece by piece.`,
                visual: working(
                  prism
                    ? [
                        { label: 'Vertices', text: `${n} + ${n} = ${2 * n}` },
                        { label: 'Edges', text: `${n} + ${n} + ${n} = ${3 * n}` },
                        { label: 'Faces', text: `2 + ${n} = ${n + 2}` },
                      ]
                    : [
                        { label: 'Vertices', text: `${n} + 1 = ${n + 1}` },
                        { label: 'Edges', text: `${n} + ${n} = ${2 * n}` },
                        { label: 'Faces', text: `1 + ${n} = ${n + 1}` },
                      ],
                ),
              },
              { text: `Euler check: V − E + F = ${counts.vertices} − ${counts.edges} + ${counts.faces} = 2.` },
            ],
          };
        }
        const [name, F, V, E] = pick(rng, [['octahedron', 8, 6, 12], ['dodecahedron', 12, 20, 30], ['icosahedron', 20, 12, 30], ['soccer-ball shape', 32, 60, 90], ['cuboctahedron', 14, 12, 24]] as const);
        const want = pick(rng, ['E', 'V'] as const);
        return {
          prompt: want === 'E' ? `A solid called the ${name} has ${F} faces and ${V} vertices. How many edges does it have?` : `A solid called the ${name} has ${F} faces and ${E} edges. How many vertices does it have?`,
          answer: { kind: 'number', value: want === 'E' ? E : V },
          hints: ['Euler\'s formula: V − E + F = 2.', want === 'E' ? `${V} − E + ${F} = 2.` : `V − ${E} + ${F} = 2.`],
          solution: [
            {
              text: 'Put the known counts into V − E + F = 2.',
              visual: working(
                want === 'E'
                  ? [
                      { label: 'Euler', text: `${V} − E + ${F} = 2` },
                      { label: 'So', text: `E = ${V} + ${F} − 2 = ${E}` },
                    ]
                  : [
                      { label: 'Euler', text: `V − ${E} + ${F} = 2` },
                      { label: 'So', text: `V = 2 + ${E} − ${F} = ${V}` },
                    ],
              ),
            },
          ],
        };
      },
    },
    {
      id: 'solids/painted-cube',
      idea: 'The painted cube',
      buildsOn: 'solids/boxes',
      generate: rng => {
        const n = int(rng, 3, 10);
        const m = n - 2;
        const kinds = [
          { faces: 'exactly three painted faces', value: 8, where: 'the corners', work: 'a cube has 8 corners' },
          { faces: 'exactly two painted faces', value: 12 * m, where: 'the edges, but not the corners', work: `12 edges × ${m} per edge = ${12 * m}` },
          { faces: 'exactly one painted face', value: 6 * m * m, where: 'the middle of a face', work: `6 faces × ${m} × ${m} = ${6 * m * m}` },
          { faces: 'no painted faces', value: m ** 3, where: 'the hidden interior', work: `${m} × ${m} × ${m} = ${m ** 3}` },
        ];
        const k = pick(rng, [1, 1, 2, 2, 3, 3, 0]);
        const kind = kinds[k];
        return {
          prompt: `A wooden cube ${n} units on each edge is painted on all six faces and then cut into ${fmt(n ** 3)} unit cubes. How many of the unit cubes have ${kind.faces}?`,
          answer: { kind: 'number', value: kind.value },
          hints: [
            `Where in the big cube would such a small cube have to be? Think: corner, edge, face, or inside.`,
            `It must be ${k === 0 ? 'at' : k === 3 ? 'in' : k === 1 ? 'along' : 'in'} ${kind.where}. Strip away the outer layer: each edge has ${n} − 2 = ${m} non-corner cubes.`,
          ],
          solution: [
            { text: `A small cube's painted faces depend on where it sat. Corners show 3 faces, the rest of each edge shows 2, the inner part of each face shows 1, and the interior shows none. Removing the two end cubes from any row of ${n} leaves ${m}.` },
            {
              text: 'Count all four kinds. They should account for every cube.',
              visual: working([
                { label: 'Three faces', text: '8 corners' },
                { label: 'Two faces', text: `12 × ${m} = ${12 * m}` },
                { label: 'One face', text: `6 × ${m}² = ${6 * m * m}` },
                { label: 'No faces', text: `${m}³ = ${m ** 3}` },
                { label: 'Check', text: `8 + ${12 * m} + ${6 * m * m} + ${m ** 3} = ${fmt(n ** 3)}` },
              ]),
            },
            { text: `The answer here is ${fmt(kind.value)}: ${kind.work}.` },
          ],
        };
      },
    },
  ],
};

// ── Area & Volume Scaling ────────────────────────────────────────────────────

const scaling: Lesson = {
  topic: 'scaling',
  intro: [
    {
      text: 'Double the side of a square and its area does not double. It becomes four times as big, because the square grew in two directions at once. Triple the side and you can fit nine of the original inside.',
      visual: fig([
        poly([[0, 0], [1.5, 0], [1.5, 1.5], [0, 1.5]], 'shade'),
        poly([[3, 0], [6, 0], [6, 3], [3, 3]]),
        poly([[3, 0], [4.5, 0], [4.5, 1.5], [3, 1.5]], 'shade'),
        seg([4.5, 0], [4.5, 3], true), seg([3, 1.5], [6, 1.5], true),
      ], { caption: 'Twice the side, four times the area.' }),
    },
    {
      text: 'This is true of every shape, not just squares. When all lengths are multiplied by k, every area is multiplied by k². A circle with 3 times the radius has 9 times the area. A triangle similar to another with sides 5 times as long has 25 times the area.',
    },
    {
      text: 'Solids grow in three directions, so volume is multiplied by k³. A cube with double the edge holds 8 of the original. A statue made 3 times as tall, in the same material, weighs 27 times as much. This is why you cannot scale things up carelessly.',
      visual: working([
        { label: 'Lengths', text: '× k' },
        { label: 'Areas', text: '× k²' },
        { label: 'Volumes', text: '× k³' },
      ]),
    },
    {
      text: 'The rule runs backwards too. If two similar solids have surface areas in the ratio 4 : 9, their lengths are in the ratio 2 : 3 (take square roots), so their volumes are in the ratio 8 : 27 (cube). Always pass through the LENGTH ratio to get from area to volume or back.',
      visual: working([
        { label: 'Areas', text: '4 : 9' },
        { label: 'Lengths (square root)', text: '2 : 3' },
        { label: 'Volumes (cube)', text: '8 : 27' },
      ]),
    },
    {
      text: 'The same idea slices cones. A cone-shaped cup filled to half its height is not half full. The water forms a smaller cone similar to the cup with scale factor 1/2, so it holds (1/2)³ = 1/8 of the cup.',
    },
  ],
  rungs: [
    {
      id: 'scaling/area',
      idea: 'Areas scale by the square',
      buildsOn: 'similarity/scale-factor',
      generate: rng => {
        const [p, q] = pick(rng, RATIOS);
        const u = int(rng, 1, 8);
        const variant = int(rng, 0, 2);
        if (variant === 0) {
          const up = rng() < 0.6;
          return {
            prompt: `Two similar triangles have matching sides in the ratio ${p} : ${q}. The ${up ? 'smaller' : 'larger'} triangle has area ${up ? p * p * u : q * q * u}. What is the area of the ${up ? 'larger' : 'smaller'} triangle?`,
            answer: { kind: 'number', value: up ? q * q * u : p * p * u },
            hints: ['Areas are in the ratio of the SQUARES of the sides.', `The areas are in the ratio ${p * p} : ${q * q}.`],
            solution: [
              {
                text: 'Square the length ratio to get the area ratio.',
                visual: working([
                  { label: 'Lengths', text: `${p} : ${q}` },
                  { label: 'Areas', text: `${p * p} : ${q * q}` },
                  { label: 'One part', text: up ? `${p * p * u} ÷ ${p * p} = ${u}` : `${q * q * u} ÷ ${q * q} = ${u}` },
                  { label: up ? 'Larger' : 'Smaller', text: up ? `${q * q} × ${u} = ${q * q * u}` : `${p * p} × ${u} = ${p * p * u}` },
                ]),
              },
            ],
          };
        }
        if (variant === 1) {
          const d = 2 * int(rng, 3, 5);
          const cost = p * p * pick(rng, [1, 2, 3]);
          const D = (d * q) / p;
          if (Number.isInteger(D)) {
            return {
              prompt: `A ${d}-inch pizza costs $${cost}. If price is proportional to the area of the pizza, how many dollars should a ${D}-inch pizza of the same kind cost?`,
              answer: { kind: 'number', value: (cost * q * q) / (p * p) },
              hints: [`The diameter is multiplied by ${D}/${d} = ${p === 1 ? q : `${q}/${p}`}.`, `The area, and so the price, is multiplied by the square of that: ${p === 1 ? q * q : `${q * q}/${p * p}`}.`],
              solution: [
                {
                  text: 'All circles are similar, so area scales with the square of the diameter.',
                  visual: working([
                    { label: 'Scale factor', text: `${D} ÷ ${d} = ${p === 1 ? q : `${q}/${p}`}` },
                    { label: 'Area factor', text: p === 1 ? `${q}² = ${q * q}` : `(${q}/${p})² = ${q * q}/${p * p}` },
                    { label: 'Price', text: `$${cost} × ${p === 1 ? q * q : `${q * q}/${p * p}`} = $${(cost * q * q) / (p * p)}` },
                  ]),
                },
                { text: 'Bigger pizzas are a much better deal than the diameters suggest.' },
              ],
            };
          }
        }
        const k = int(rng, 2, 6);
        const A = int(rng, 3, 20);
        return {
          prompt: `A photograph has area ${A} square inches. It is enlarged so that its length and its width are both multiplied by ${k}. What is the area of the enlargement, in square inches?`,
          answer: { kind: 'number', value: A * k * k },
          hints: ['Both dimensions grow, so the area grows twice over.', `The area is multiplied by ${k}² = ${k * k}.`],
          solution: [{ text: `Length × ${k} and width × ${k} means area × ${k * k}.`, visual: working([{ label: 'Area factor', text: `${k}² = ${k * k}` }, { label: 'New area', text: `${A} × ${k * k} = ${A * k * k}` }]) }],
        };
      },
    },
    {
      id: 'scaling/volume',
      idea: 'Volumes scale by the cube',
      buildsOn: 'scaling/area',
      generate: rng => {
        const variant = int(rng, 0, 2);
        if (variant === 0) {
          const k = int(rng, 2, 5);
          const w = int(rng, 2, 9);
          const h = pick(rng, [4, 5, 6, 8, 10]);
          return {
            prompt: `A solid metal statue ${h} inches tall weighs ${w} pounds. A statue of the same shape and the same metal is ${h * k} inches tall. How many pounds does it weigh?`,
            answer: { kind: 'number', value: w * k ** 3 },
            hints: ['Weight depends on volume, and volume scales with the CUBE of the height.', `The scale factor is ${k}, so the weight is multiplied by ${k}³ = ${k ** 3}.`],
            solution: [
              {
                text: 'The big statue is taller, wider and deeper by the same factor.',
                visual: working([
                  { label: 'Scale factor', text: `${h * k} ÷ ${h} = ${k}` },
                  { label: 'Volume factor', text: `${k}³ = ${k ** 3}` },
                  { label: 'Weight', text: `${w} × ${k ** 3} = ${fmt(w * k ** 3)} pounds` },
                ]),
              },
            ],
          };
        }
        const [p, q] = pick(rng, RATIOS);
        const u = int(rng, 1, 6);
        if (variant === 1) {
          const shape = pick(rng, ['cones', 'pyramids', 'cylinders', 'jars']);
          return {
            prompt: `Two similar ${shape} have heights in the ratio ${p} : ${q}. The smaller one has volume ${p ** 3 * u}. What is the volume of the larger one?`,
            answer: { kind: 'number', value: q ** 3 * u },
            hints: ['Volumes are in the ratio of the CUBES of the heights.', `The volumes are in the ratio ${p ** 3} : ${q ** 3}.`],
            solution: [
              {
                text: 'Cube the length ratio to get the volume ratio.',
                visual: working([
                  { label: 'Lengths', text: `${p} : ${q}` },
                  { label: 'Volumes', text: `${p ** 3} : ${q ** 3}` },
                  { label: 'One part', text: `${p ** 3 * u} ÷ ${p ** 3} = ${u}` },
                  { label: 'Larger', text: `${q ** 3} × ${u} = ${fmt(q ** 3 * u)}` },
                ]),
              },
            ],
          };
        }
        const k = int(rng, 2, 5);
        return {
          prompt: `Every edge of a box is made ${k} times as long. How many of the original boxes would it take to fill the new box?`,
          answer: { kind: 'number', value: k ** 3 },
          hints: [`The new box is ${k} times as long, ${k} times as wide, and ${k} times as tall.`, `${k} × ${k} × ${k}.`],
          solution: [{ text: `You can line up ${k} original boxes along each of the three directions.`, visual: working([{ label: 'Boxes', text: `${k} × ${k} × ${k} = ${k ** 3}` }]) }],
        };
      },
    },
    {
      id: 'scaling/through-length',
      idea: 'From area to volume through length',
      buildsOn: 'scaling/volume',
      generate: rng => {
        const [p, q] = pick(rng, RATIOS);
        const u = pick(rng, [1, 2, 3, 4, 5]);
        const w = int(rng, 1, 5);
        const toVolume = rng() < 0.6;
        const shape = pick(rng, ['spheres', 'cones', 'cubes', 'vases']);
        return {
          prompt: toVolume
            ? `Two similar ${shape} have surface areas ${p * p * u} and ${q * q * u}. The smaller one has volume ${p ** 3 * w}. What is the volume of the larger one?`
            : `Two similar ${shape} have volumes ${p ** 3 * w} and ${q ** 3 * w}. The smaller one has surface area ${p * p * u}. What is the surface area of the larger one?`,
          answer: { kind: 'number', value: toVolume ? q ** 3 * w : q * q * u },
          hints: [
            toVolume ? `Simplify the area ratio ${p * p * u} : ${q * q * u} to ${p * p} : ${q * q}, then take square roots to get the length ratio.` : `Simplify the volume ratio ${p ** 3 * w} : ${q ** 3 * w} to ${p ** 3} : ${q ** 3}, then take cube roots to get the length ratio.`,
            `Lengths are in the ratio ${p} : ${q}. Now ${toVolume ? 'cube' : 'square'} it.`,
          ],
          solution: [
            {
              text: 'Go through the length ratio.',
              visual: working(
                toVolume
                  ? [
                      { label: 'Areas', text: `${p * p * u} : ${q * q * u} = ${p * p} : ${q * q}` },
                      { label: 'Lengths', text: `${p} : ${q}` },
                      { label: 'Volumes', text: `${p ** 3} : ${q ** 3}` },
                      { label: 'Larger volume', text: `${p ** 3 * w} × ${q ** 3}/${p ** 3} = ${fmt(q ** 3 * w)}` },
                    ]
                  : [
                      { label: 'Volumes', text: `${p ** 3 * w} : ${q ** 3 * w} = ${p ** 3} : ${q ** 3}` },
                      { label: 'Lengths', text: `${p} : ${q}` },
                      { label: 'Areas', text: `${p * p} : ${q * q}` },
                      { label: 'Larger area', text: `${p * p * u} × ${q * q}/${p * p} = ${q * q * u}` },
                    ],
              ),
            },
            { text: `You cannot scale an area straight to a volume. The length ratio ${p} : ${q} is the bridge between them.` },
          ],
        };
      },
    },
    {
      id: 'scaling/slices',
      idea: 'Slicing off a similar piece',
      buildsOn: 'similarity/parallel',
      generate: rng => {
        const [m, n] = pick(rng, RATIOS);
        const w = int(rng, 1, 6);
        const variant = int(rng, 0, 2);
        const frac = `${m}/${n}`;
        if (variant === 0) {
          return {
            prompt: `A cone-shaped paper cup holds ${n ** 3 * w} mL when full. It is held point-down and filled with water to ${frac} of its height. How many mL of water are in it?`,
            answer: { kind: 'number', value: m ** 3 * w },
            hints: ['The water is itself a cone, similar to the whole cup.', `Its scale factor is ${frac}, so its volume is (${frac})³ = ${m ** 3}/${n ** 3} of the cup.`],
            solution: [
              { text: `The water forms a small cone with the same shape as the cup, ${frac} as tall. Its radius is ${frac} as big too.` },
              {
                text: 'Cube the scale factor.',
                visual: working([
                  { label: 'Volume factor', text: `(${frac})³ = ${m ** 3}/${n ** 3}` },
                  { label: 'Water', text: `${n ** 3 * w} × ${m ** 3}/${n ** 3} = ${m ** 3 * w} mL` },
                ]),
              },
            ],
          };
        }
        if (variant === 1) {
          const [A, B, C]: Pt[] = [[3.5, 6], [0, 0], [9, 0]];
          const t = Math.min(0.75, Math.max(0.3, m / n));
          const D: Pt = [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t];
          const E: Pt = [A[0] + (C[0] - A[0]) * t, A[1] + (C[1] - A[1]) * t];
          return {
            prompt: `A triangle has area ${n * n * w}. A line parallel to its base crosses it ${frac} of the way down from the top vertex to the base. What is the area of the trapezoid below the line?`,
            visual: fig([poly([D, B, C, E], 'shade'), poly([A, B, C]), seg(D, E)]),
            answer: { kind: 'number', value: (n * n - m * m) * w },
            hints: [`The small triangle above the line is similar to the whole triangle, with scale factor ${frac}.`, `Its area is (${frac})² = ${m * m}/${n * n} of the whole. The trapezoid is the rest.`],
            solution: [
              {
                text: 'Find the small triangle on top, then subtract.',
                visual: working([
                  { label: 'Area factor', text: `(${frac})² = ${m * m}/${n * n}` },
                  { label: 'Top triangle', text: `${n * n * w} × ${m * m}/${n * n} = ${m * m * w}` },
                  { label: 'Trapezoid', text: `${n * n * w} − ${m * m * w} = ${(n * n - m * m) * w}` },
                ]),
              },
              ...(m === 1 && n === 2 ? [{ text: 'A line halfway down cuts off only a quarter of the area. The bottom half of the height holds three quarters of the triangle.' }] : []),
            ],
          };
        }
        return {
          prompt: `A solid cone has volume ${n ** 3 * w}. A cut parallel to its base, ${frac} of the way down from the tip to the base, removes the top. What is the volume of the piece that remains?`,
          answer: { kind: 'number', value: (n ** 3 - m ** 3) * w },
          hints: [`The removed top is a small cone similar to the whole, with scale factor ${frac}.`, `It has (${frac})³ = ${m ** 3}/${n ** 3} of the volume. Subtract it.`],
          solution: [
            {
              text: 'The removed tip is a scaled-down copy of the whole cone.',
              visual: working([
                { label: 'Volume factor', text: `(${frac})${sup(3)} = ${m ** 3}/${n ** 3}` },
                { label: 'Tip', text: `${n ** 3 * w} × ${m ** 3}/${n ** 3} = ${m ** 3 * w}` },
                { label: 'Remaining', text: `${n ** 3 * w} − ${m ** 3 * w} = ${(n ** 3 - m ** 3) * w}` },
              ]),
            },
          ],
        };
      },
    },
  ],
};

export const GEOMETRY_SOLID_LESSONS: Lesson[] = [similarity, solids, scaling];
