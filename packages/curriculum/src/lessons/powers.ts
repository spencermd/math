// Realm II: Algebra — special products, exponents and radicals, quadratics, clever substitution.
import type { Lesson } from './types.ts';
import { LOWEST, choices, fmt, frac, gcd, int, neg, pick, plus, reduce, reduceSigned, root, sfrac, term, working } from './util.ts';

const SUP: Record<string, string> = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
/** sup(-12) → "⁻¹²" */
const sup = (n: number) => [...String(n)].map(ch => SUP[ch]).join('');
/** p(2, -3) → "2⁻³" */
const p = (base: number | string, exp: number) => `${base}${sup(exp)}`;

/** x² + bx + c, with tidy signs: quad(-7, 12) → "x² − 7x + 12" */
const quad = (b: number, c: number, a = 1) =>
  `${term(a, 'x²')}${b === 0 ? '' : ` ${b < 0 ? '−' : '+'} ${term(Math.abs(b), 'x')}`}${c === 0 ? '' : ` ${plus(c)}`}`;

// ── Special Products ─────────────────────────────────────────────────────────

const specialProducts: Lesson = {
  topic: 'special_products',
  intro: [
    {
      text: 'Two patterns do an enormous amount of work in contest algebra. The first: (a + b)² is NOT a² + b². Cut a square of side a + b into pieces and you find two extra rectangles. So (a + b)² = a² + 2ab + b².',
      visual: {
        kind: 'figure',
        box: [0, 0, 5, 5],
        shapes: [
          { type: 'polygon', points: [[0, 2], [3, 2], [3, 5], [0, 5]], fill: 'shade' },
          { type: 'polygon', points: [[3, 0], [5, 0], [5, 2], [3, 2]], fill: 'shade' },
          { type: 'polygon', points: [[0, 0], [5, 0], [5, 5], [0, 5]] },
          { type: 'segment', from: [3, 0], to: [3, 5] },
          { type: 'segment', from: [0, 2], to: [5, 2] },
          { type: 'label', at: [1.5, 3.5], text: 'a²' },
          { type: 'label', at: [4, 3.5], text: 'ab' },
          { type: 'label', at: [1.5, 1], text: 'ab' },
          { type: 'label', at: [4, 1], text: 'b²' },
          { type: 'label', at: [1.5, 5.3], text: 'a' },
          { type: 'label', at: [4, 5.3], text: 'b' },
        ],
        caption: 'One a², one b², and two ab rectangles.',
      },
    },
    {
      text: 'That makes squaring numbers near a round number easy. For 52², think (50 + 2)². For 99², think (100 − 1)², where the middle term is subtracted.',
      visual: working([
        { label: '52²', text: '50² + 2 × 50 × 2 + 2² = 2,500 + 200 + 4 = 2,704' },
        { label: '99²', text: '100² − 2 × 100 × 1 + 1² = 10,000 − 200 + 1 = 9,801' },
      ]),
    },
    {
      text: 'The second pattern is the difference of squares: (a − b)(a + b) = a² − b². The middle terms cancel. Read it left to right to multiply numbers that straddle a round number: 47 × 53 = (50 − 3)(50 + 3) = 2,500 − 9 = 2,491.',
    },
    {
      text: 'Read it right to left to factor. 73² − 27² looks painful until you write it as (73 − 27)(73 + 27) = 46 × 100 = 4,600. Whenever you see a square minus a square, factor it.',
    },
    {
      text: 'The patterns also link three quantities: x + y, xy and x² + y². Know any two and you get the third without ever finding x or y. If x + y = 7 and xy = 10, square the sum.',
      visual: working([
        { label: 'Square the sum', text: '(x + y)² = x² + 2xy + y² = 49' },
        { label: 'Remove 2xy', text: 'x² + y² = 49 − 2 × 10' },
        { label: 'So', text: 'x² + y² = 29' },
      ]),
    },
  ],
  rungs: [
    {
      id: 'special_products/mental',
      idea: 'Multiply and square near a round number',
      buildsOn: 'clever_calc/distribute',
      generate: rng => {
        const mid = pick(rng, [20, 30, 40, 50, 60, 70, 80, 100, 200]);
        const k = int(rng, 1, mid >= 100 ? 9 : 4);
        if (rng() < 0.5) {
          return {
            prompt: `Without long multiplication, what is ${mid - k} × ${mid + k}?`,
            answer: { kind: 'number', value: mid * mid - k * k },
            hints: [
              `Both numbers are ${k} away from ${mid}, on opposite sides.`,
              `(${mid} − ${k})(${mid} + ${k}) = ${mid}² − ${k}².`,
            ],
            solution: [
              {
                text: `The two numbers straddle ${mid}, so this is a difference of squares.`,
                visual: working([
                  { label: 'Rewrite', text: `(${mid} − ${k})(${mid} + ${k})` },
                  { label: 'Pattern', text: `${mid}² − ${k}²` },
                  { label: 'Compute', text: `${fmt(mid * mid)} − ${k * k} = ${fmt(mid * mid - k * k)}` },
                ]),
              },
            ],
          };
        }
        const up = rng() < 0.5;
        const n = up ? mid + k : mid - k;
        return {
          prompt: `Without long multiplication, what is ${n}²?`,
          answer: { kind: 'number', value: n * n },
          hints: [
            `${n} = ${mid} ${up ? '+' : '−'} ${k}. Square that as a binomial.`,
            `${mid}² ${up ? '+' : '−'} 2 × ${mid} × ${k} + ${k}². Do not forget the middle term.`,
          ],
          solution: [
            {
              text: `Write ${n} as ${mid} ${up ? '+' : '−'} ${k} and use (a ${up ? '+' : '−'} b)² = a² ${up ? '+' : '−'} 2ab + b².`,
              visual: working([
                { label: 'a²', text: `${mid}² = ${fmt(mid * mid)}` },
                { label: '2ab', text: `2 × ${mid} × ${k} = ${fmt(2 * mid * k)}` },
                { label: 'b²', text: `${k}² = ${k * k}` },
                { label: 'Total', text: `${fmt(mid * mid)} ${up ? '+' : '−'} ${fmt(2 * mid * k)} + ${k * k} = ${fmt(n * n)}` },
              ]),
            },
          ],
        };
      },
    },
    {
      id: 'special_products/factor',
      idea: 'A square minus a square factors',
      buildsOn: 'special_products/mental',
      generate: rng => {
        const total = pick(rng, [100, 100, 200, 50, 1000]);
        const b = int(rng, Math.floor(total * 0.12), Math.floor(total * 0.45));
        const a = total - b;
        if (rng() < 0.65) {
          return {
            prompt: `What is ${fmt(a)}² − ${fmt(b)}²?`,
            answer: { kind: 'number', value: a * a - b * b },
            hints: [
              'Do not square anything. a² − b² = (a − b)(a + b).',
              `${fmt(a)} + ${fmt(b)} = ${fmt(total)}. That is the point of the problem.`,
            ],
            solution: [
              {
                text: 'Factor first. The sum of the two numbers is round, which makes the product easy.',
                visual: working([
                  { label: 'Factor', text: `(${fmt(a)} − ${fmt(b)})(${fmt(a)} + ${fmt(b)})` },
                  { label: 'Simplify', text: `${fmt(a - b)} × ${fmt(total)}` },
                  { label: 'So', text: fmt((a - b) * total) },
                ]),
              },
            ],
          };
        }
        // (n+1)² − n² = 2n + 1, and telescoping runs of them.
        const n = int(rng, 30, 400);
        const d = pick(rng, [1, 1, 2]);
        return {
          prompt: `What is ${fmt(n + d)}² − ${fmt(n)}²?`,
          answer: { kind: 'number', value: (n + d) ** 2 - n * n },
          hints: [
            'Factor it: (a − b)(a + b).',
            `The difference is just ${d}, so the answer is ${d === 1 ? 'simply the sum of the two numbers' : `${d} times the sum of the two numbers`}.`,
          ],
          solution: [
            {
              text: 'Factor the difference of squares.',
              visual: working([
                { label: 'Factor', text: `(${fmt(n + d)} − ${fmt(n)})(${fmt(n + d)} + ${fmt(n)})` },
                { label: 'Simplify', text: `${d} × ${fmt(2 * n + d)} = ${fmt(d * (2 * n + d))}` },
              ]),
            },
            ...(d === 1 ? [{ text: 'Worth remembering: consecutive squares differ by the sum of the two numbers. That is why the gaps between squares are the odd numbers 1, 3, 5, 7, …' }] : []),
          ],
        };
      },
    },
    {
      id: 'special_products/sum-product',
      idea: 'Sum, product, and sum of squares',
      buildsOn: 'special_products/factor',
      generate: rng => {
        const x = int(rng, 2, 12);
        const y = int(rng, 1, x - 1);
        const [s, d, prod, sq] = [x + y, x - y, x * y, x * x + y * y];
        const variant = int(rng, 0, 3);
        if (variant === 0) {
          return {
            prompt: `If x + y = ${s} and xy = ${prod}, what is x² + y²?`,
            answer: { kind: 'number', value: sq },
            hints: ['Square x + y. What do you get besides x² + y²?', `(x + y)² = x² + 2xy + y², so x² + y² = ${s}² − 2 × ${prod}.`],
            solution: [
              {
                text: 'Square the sum and remove the extra 2xy.',
                visual: working([
                  { label: 'Square the sum', text: `x² + 2xy + y² = ${s}² = ${s * s}` },
                  { label: 'Remove 2xy', text: `x² + y² = ${s * s} − 2 × ${prod}` },
                  { label: 'So', text: `x² + y² = ${sq}` },
                ]),
              },
            ],
          };
        }
        if (variant === 1) {
          return {
            prompt: `If x − y = ${d} and xy = ${prod}, what is x² + y²?`,
            answer: { kind: 'number', value: sq },
            hints: ['Square x − y this time. The middle term is −2xy.', `(x − y)² = x² − 2xy + y², so x² + y² = ${d}² + 2 × ${prod}.`],
            solution: [
              {
                text: 'Square the difference and put back the missing 2xy.',
                visual: working([
                  { label: 'Square the difference', text: `x² − 2xy + y² = ${d}² = ${d * d}` },
                  { label: 'Add 2xy', text: `x² + y² = ${d * d} + 2 × ${prod}` },
                  { label: 'So', text: `x² + y² = ${sq}` },
                ]),
              },
            ],
          };
        }
        if (variant === 2) {
          return {
            prompt: `If x + y = ${s} and x² + y² = ${sq}, what is xy?`,
            answer: { kind: 'number', value: prod },
            hints: ['(x + y)² and x² + y² differ by exactly 2xy.', `2xy = ${s}² − ${sq}.`],
            solution: [
              {
                text: 'The square of the sum is the sum of the squares plus 2xy.',
                visual: working([
                  { label: 'Square the sum', text: `x² + 2xy + y² = ${s * s}` },
                  { label: 'Subtract x² + y²', text: `2xy = ${s * s} − ${sq} = ${2 * prod}` },
                  { label: 'So', text: `xy = ${prod}` },
                ]),
              },
            ],
          };
        }
        return {
          prompt: `If x + y = ${s} and xy = ${prod}, what is (x − y)²?`,
          answer: { kind: 'number', value: d * d },
          hints: ['(x + y)² and (x − y)² have the same squares but opposite middle terms.', `(x − y)² = (x + y)² − 4xy.`],
          solution: [
            {
              text: 'Going from +2xy to −2xy is a drop of 4xy.',
              visual: working([
                { label: '(x + y)²', text: `x² + 2xy + y² = ${s * s}` },
                { label: '(x − y)²', text: `x² − 2xy + y² = ${s * s} − 4 × ${prod}` },
                { label: 'So', text: `(x − y)² = ${d * d}` },
              ]),
            },
          ],
        };
      },
    },
    {
      id: 'special_products/hidden',
      idea: 'Spot the pattern in disguise',
      buildsOn: 'special_products/sum-product',
      generate: rng => {
        const variant = int(rng, 0, 2);
        if (variant === 0) {
          const k = int(rng, 3, 12);
          return {
            prompt: `If x + 1/x = ${k}, what is x² + 1/x²?`,
            answer: { kind: 'number', value: k * k - 2 },
            hints: ['Square both sides. What is the middle term 2 · x · (1/x)?', `x² + 2 + 1/x² = ${k * k}.`],
            solution: [
              {
                text: 'Square both sides. The middle term is 2 · x · (1/x) = 2, a plain number.',
                visual: working([
                  { label: 'Square', text: `x² + 2 + 1/x² = ${k * k}` },
                  { label: 'Subtract 2', text: `x² + 1/x² = ${k * k - 2}` },
                ]),
              },
              { text: 'You never found x, and you would not want to: it is not a nice number.' },
            ],
          };
        }
        if (variant === 1) {
          const prime = pick(rng, [17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97]);
          const big = (prime + 1) / 2;
          return {
            prompt: `The squares of two positive integers differ by ${prime}. What is the larger of the two integers?`,
            answer: { kind: 'number', value: big },
            hints: [
              `a² − b² = (a − b)(a + b) = ${prime}. What kind of number is ${prime}?`,
              `${prime} is prime, so the only way to split it is 1 × ${prime}: a − b = 1 and a + b = ${prime}.`,
            ],
            solution: [
              { text: `Call them a and b. Then (a − b)(a + b) = ${prime}. Since ${prime} is prime and a + b is the bigger factor, a − b = 1 and a + b = ${prime}.` },
              {
                text: 'Now it is a sum-and-difference system.',
                visual: working([
                  { label: 'Add', text: `2a = ${prime + 1}, so a = ${big}` },
                  { label: 'Then', text: `b = ${big - 1}` },
                  { label: 'Check', text: `${big}² − ${big - 1}² = ${big * big} − ${(big - 1) ** 2} = ${prime}` },
                ]),
              },
            ],
          };
        }
        const x = int(rng, 6, 20);
        const y = int(rng, 1, x - 2);
        return {
          prompt: `If x² − y² = ${x * x - y * y} and x + y = ${x + y}, what is x?`,
          answer: { kind: 'number', value: x },
          hints: [`Factor the left side: (x − y)(x + y) = ${x * x - y * y}.`, `x − y = ${x * x - y * y} ÷ ${x + y} = ${x - y}. Now you know the sum and the difference.`],
          solution: [
            {
              text: 'Factor the difference of squares and divide by the part you know.',
              visual: working([
                { label: 'Factor', text: `(x − y)(x + y) = ${x * x - y * y}` },
                { label: `Divide by ${x + y}`, text: `x − y = ${x - y}` },
                { label: 'Add to x + y', text: `2x = ${2 * x}, so x = ${x}` },
              ]),
            },
          ],
        };
      },
    },
  ],
};

// ── Exponents & Radicals ─────────────────────────────────────────────────────

const exponents: Lesson = {
  topic: 'exponents',
  intro: [
    {
      text: 'An exponent counts repeated factors, and every exponent rule is just bookkeeping on that count. Multiplying puts the factors together, so the counts add. Dividing cancels factors, so the counts subtract. A power of a power makes copies of the whole group, so the counts multiply.',
      visual: working([
        { label: 'Multiply', text: '2³ × 2⁴ = (2·2·2)(2·2·2·2) = 2⁷' },
        { label: 'Divide', text: '2⁷ ÷ 2³ = 2⁴' },
        { label: 'Power of a power', text: '(2³)⁴ = 2³ · 2³ · 2³ · 2³ = 2¹²' },
      ]),
    },
    {
      text: 'What should 2⁰ or 2⁻¹ mean? Follow the pattern downward. Each step down in the exponent divides by 2, and the pattern does not care when the exponent passes zero. So anything (except 0) to the zero power is 1, and a negative exponent means "one over".',
      visual: working([
        { text: '2³ = 8' },
        { text: '2² = 4' },
        { text: '2¹ = 2' },
        { text: '2⁰ = 1' },
        { text: '2⁻¹ = 1/2' },
        { text: '2⁻² = 1/4' },
      ]),
    },
    {
      text: 'A negative exponent on a fraction flips the fraction: (2/3)⁻² = (3/2)² = 9/4. The minus sign never makes the answer negative. It only says "take the reciprocal".',
    },
    {
      text: 'Fractional exponents are roots. Since 9^(1/2) × 9^(1/2) must be 9¹, the number 9^(1/2) is √9 = 3. In a fraction exponent the bottom is the root and the top is the power. Take the root first to keep the numbers small: 8^(2/3) is the cube root of 8, squared, which is 2² = 4.',
    },
    {
      text: 'To simplify a square root, pull out the largest perfect square. √72 = √(36 × 2) = 6√2. If you miss the largest square you can keep going: √72 = √(4 × 18) = 2√18 = 2 × 3√2 = 6√2.',
      visual: working([
        { label: 'Find a square factor', text: '72 = 36 × 2' },
        { label: 'Split', text: '√72 = √36 × √2' },
        { label: 'So', text: '√72 = 6√2' },
      ]),
    },
  ],
  rungs: [
    {
      id: 'exponents/rules',
      idea: 'Add, subtract, or multiply the exponents',
      buildsOn: 'equations/translate',
      generate: rng => {
        const base = pick(rng, [2, 3, 5, 7, 10]);
        const variant = int(rng, 0, 2);
        const [a, b, c] = [int(rng, 2, 9), int(rng, 2, 9), int(rng, 2, 12)];
        if (variant === 0) {
          const n = a + b - c;
          return {
            prompt: `${p(base, a)} × ${p(base, b)} ÷ ${p(base, c)} = ${base}ⁿ. What is n? (It may be negative.)`,
            answer: { kind: 'number', value: n },
            hints: ['Multiplying adds exponents. Dividing subtracts them.', `n = ${a} + ${b} − ${c}.`],
            solution: [
              {
                text: 'Same base throughout, so work only with the exponents.',
                visual: working([
                  { label: 'Multiply', text: `${p(base, a)} × ${p(base, b)} = ${p(base, a + b)}` },
                  { label: 'Divide', text: `${p(base, a + b)} ÷ ${p(base, c)} = ${p(base, n)}` },
                  { label: 'So', text: `n = ${neg(n)}` },
                ]),
              },
            ],
          };
        }
        if (variant === 1) {
          const [e, f, g] = [int(rng, 2, 5), int(rng, 2, 5), int(rng, 2, 9)];
          const n = e * f + g;
          return {
            prompt: `(${p(base, e)})${sup(f)} × ${p(base, g)} = ${base}ⁿ. What is n?`,
            answer: { kind: 'number', value: n },
            hints: ['A power of a power multiplies the exponents.', `(${p(base, e)})${sup(f)} = ${p(base, e * f)}. Then multiply by ${p(base, g)}.`],
            solution: [
              {
                text: 'Power of a power first, then the product.',
                visual: working([
                  { label: 'Power of a power', text: `(${p(base, e)})${sup(f)} = ${p(base, e * f)}` },
                  { label: 'Multiply', text: `${p(base, e * f)} × ${p(base, g)} = ${p(base, n)}` },
                ]),
              },
              { text: `Careful: (${p(base, e)})${sup(f)} is not ${p(base, e + f)}. It is ${f} copies of ${p(base, e)} multiplied together.` },
            ],
          };
        }
        // Different bases that are powers of the same prime.
        const [q, i, j] = pick(rng, [[2, 2, 3], [2, 1, 2], [2, 1, 3], [3, 1, 2], [3, 2, 3], [2, 2, 4], [5, 1, 2]] as const);
        const [B1, B2] = [q ** i, q ** j];
        const [e, f] = [int(rng, 2, 6), int(rng, 2, 6)];
        const n = i * e + j * f;
        return {
          prompt: `${p(B1, e)} × ${p(B2, f)} = ${q}ⁿ. What is n?`,
          answer: { kind: 'number', value: n },
          hints: [`The bases are different, but both are powers of ${q}.`, `${B1} = ${p(q, i)} and ${B2} = ${p(q, j)}. Rewrite each factor with base ${q}.`],
          solution: [
            {
              text: `Exponent rules need matching bases, so rewrite everything as a power of ${q}.`,
              visual: working([
                { label: 'First factor', text: `${p(B1, e)} = (${p(q, i)})${sup(e)} = ${p(q, i * e)}` },
                { label: 'Second factor', text: `${p(B2, f)} = (${p(q, j)})${sup(f)} = ${p(q, j * f)}` },
                { label: 'Multiply', text: `${p(q, i * e)} × ${p(q, j * f)} = ${p(q, n)}` },
              ]),
            },
          ],
        };
      },
    },
    {
      id: 'exponents/negative',
      idea: 'Zero and negative exponents',
      buildsOn: 'exponents/rules',
      generate: rng => {
        const variant = int(rng, 0, 2);
        if (variant === 0) {
          const [a, b] = pick(rng, [[2, 3], [3, 2], [3, 4], [4, 3], [2, 5], [5, 2], [3, 5], [5, 3], [1, 2], [1, 3], [1, 4], [3, 1], [5, 1]] as const);
          const e = a === 1 || b === 1 ? pick(rng, [2, 3, 4]) : pick(rng, [2, 3]);
          const base = b === 1 ? `${a}` : `(${a}/${b})`;
          return {
            prompt: `What is ${base}${sup(-e)}? ${LOWEST}`,
            answer: { kind: 'fraction', num: b ** e, den: a ** e },
            hints: ['A negative exponent means take the reciprocal first.', `${base}${sup(-e)} = ${a === 1 ? `${b}` : `(${b}/${a})`}${sup(e)}.`],
            solution: [
              {
                text: 'Flip the base to make the exponent positive, then raise top and bottom to the power.',
                visual: working([
                  { label: 'Flip', text: `${base}${sup(-e)} = ${a === 1 ? `${b}` : `(${b}/${a})`}${sup(e)}` },
                  { label: 'Raise', text: `${p(b, e)}/${p(a, e)} = ${frac(b ** e, a ** e)}` },
                ]),
              },
              { text: 'The answer is positive. A negative exponent never changes the sign.' },
            ],
          };
        }
        if (variant === 1) {
          const [a, b] = pick(rng, [[2, 3], [2, 4], [3, 4], [2, 5], [3, 6], [4, 6], [2, 6], [3, 5], [4, 5], [5, 10], [2, 10]] as const);
          const [num, den] = reduce(a + b, a * b);
          return {
            prompt: `What is ${p(a, -1)} + ${p(b, -1)}? ${LOWEST}`,
            answer: { kind: 'fraction', num, den },
            hints: [`${p(a, -1)} is 1/${a}.`, `Add 1/${a} + 1/${b} with a common denominator.`],
            solution: [
              {
                text: 'Each term is a reciprocal. Then it is ordinary fraction addition.',
                visual: working([
                  { label: 'Rewrite', text: `1/${a} + 1/${b}` },
                  { label: 'Common denominator', text: `${b}/${a * b} + ${a}/${a * b} = ${a + b}/${a * b}` },
                  { label: 'Lowest terms', text: frac(num, den) },
                ]),
              },
              { text: `Tempting but wrong: (${a} + ${b})⁻¹ = 1/${a + b}. Exponents do not distribute over addition.` },
            ],
          };
        }
        const base = pick(rng, [2, 3, 5]);
        const [a, b] = [int(rng, 2, 6), int(rng, 2, 6)];
        // base^a × base^−(a+b) ÷ base^e = base^n, with e chosen to land on a small n.
        const n = pick(rng, [-3, -2, -1, 1, 2, 3].filter(v => v !== -b));
        const e = -b - n;
        const value = n >= 0 ? [base ** n, 1] : [1, base ** -n];
        return {
          prompt: `What is ${p(base, a)} × ${p(base, -(a + b))} ÷ ${p(base, e)}? Give a whole number or a fraction in lowest terms.`,
          answer: { kind: 'fraction', num: value[0], den: value[1] },
          hints: ['Combine the exponents first; evaluate only at the end.', `${a} + (${neg(-(a + b))}) − (${neg(e)}) = ${neg(n)}. Subtracting a negative adds.`],
          solution: [
            {
              text: 'Negative exponents obey the same rules. Do the bookkeeping, then evaluate once.',
              visual: working([
                { label: 'Multiply', text: `${p(base, a)} × ${p(base, -(a + b))} = ${p(base, -b)}` },
                { label: 'Divide', text: `${p(base, -b)} ÷ ${p(base, e)} = ${base}^(${neg(-b)} − (${neg(e)})) = ${p(base, n)}` },
                { label: 'Evaluate', text: `${p(base, n)} = ${frac(value[0], value[1])}` },
              ]),
            },
          ],
        };
      },
    },
    {
      id: 'exponents/same-base',
      idea: 'Make the bases match',
      buildsOn: 'exponents/negative',
      generate: rng => {
        const variant = int(rng, 0, 2);
        if (variant === 0) {
          const [q, i, j] = pick(rng, [[2, 2, 3], [2, 3, 2], [3, 2, 3], [3, 3, 2], [2, 2, 4], [2, 4, 2], [2, 3, 4], [2, 4, 3], [5, 2, 3], [2, 2, 5]] as const);
          const [B1, B2] = [q ** i, q ** j];
          // B1^x = B2^k, so i·x = j·k.
          const x = (j / gcd(i, j)) * int(rng, 1, 4);
          const k = (i * x) / j;
          return {
            prompt: `If ${B1}ˣ = ${p(B2, k)}, what is x?`,
            answer: { kind: 'number', value: x },
            hints: [`${B1} and ${B2} are both powers of ${q}.`, `(${p(q, i)})ˣ = ${q}^(${i}x), and ${p(B2, k)} = ${p(q, j * k)}. Set the exponents equal.`],
            solution: [
              {
                text: `Rewrite both sides with base ${q}. Equal powers of the same base have equal exponents.`,
                visual: working([
                  { label: 'Left', text: `${B1}ˣ = (${p(q, i)})ˣ = ${q}^(${i}x)` },
                  { label: 'Right', text: `${p(B2, k)} = (${p(q, j)})${sup(k)} = ${p(q, j * k)}` },
                  { label: 'Match exponents', text: `${i}x = ${j * k}, so x = ${x}` },
                ]),
              },
            ],
          };
        }
        if (variant === 1) {
          const base = pick(rng, [2, 3, 4, 5]);
          const n = int(rng, 5, 40);
          const terms = Array.from({ length: base }, () => p(base, n)).join(' + ');
          return {
            prompt: `${terms} = ${base}ⁿ. What is n?`,
            answer: { kind: 'number', value: n + 1 },
            hints: [`How many copies of ${p(base, n)} are being added?`, `${base} copies of ${p(base, n)} is ${base} × ${p(base, n)}.`],
            solution: [
              {
                text: 'Adding equal terms is multiplying. You cannot add exponents here, because nothing is being multiplied yet.',
                visual: working([
                  { label: 'Collect', text: `${base} × ${p(base, n)}` },
                  { label: 'Same base', text: `${base}¹ × ${p(base, n)} = ${p(base, n + 1)}` },
                  { label: 'So', text: `n = ${n + 1}` },
                ]),
              },
              { text: `The trap is to multiply the exponent by ${base} and answer ${base * n}. There is no exponent rule for adding powers; turn the sum into a product first.` },
            ],
          };
        }
        const base = pick(rng, [2, 3, 5]);
        const n = int(rng, 4, 30);
        const d = int(rng, 1, 3);
        const coef = base ** d - 1;
        return {
          prompt: `${p(base, n + d)} − ${p(base, n)} = k × ${p(base, n)}. What is k?`,
          answer: { kind: 'number', value: coef },
          hints: [`Factor ${p(base, n)} out of both terms.`, `${p(base, n + d)} = ${p(base, d)} × ${p(base, n)}.`],
          solution: [
            {
              text: `Factor out the smaller power, ${p(base, n)}.`,
              visual: working([
                { label: 'Split', text: `${p(base, n + d)} = ${p(base, d)} × ${p(base, n)}` },
                { label: 'Factor', text: `${p(base, n)} × (${p(base, d)} − 1)` },
                { label: 'So', text: `k = ${base ** d} − 1 = ${coef}` },
              ]),
            },
          ],
        };
      },
    },
    {
      id: 'exponents/radicals',
      idea: 'Roots and fractional exponents',
      buildsOn: 'exponents/same-base',
      generate: rng => {
        const variant = int(rng, 0, 2);
        if (variant === 0) {
          const out = int(rng, 2, 9);
          const inside = pick(rng, [2, 3, 5, 6, 7, 10]);
          const n = out * out * inside;
          const wrong = [
            `${out * inside}√${out}`, `${out}√${inside * out}`, `${out * out}√${inside}`, `${inside}√${out * out}`, `${out + 1}√${inside}`,
          ].filter(w => w !== root(n));
          return {
            prompt: `Which of these equals √${n} in simplest form?`,
            answer: choices(rng, `${out}√${inside}`, wrong.slice(0, 3)),
            hints: [`Look for the largest perfect square that divides ${n}.`, `${n} = ${out * out} × ${inside}.`],
            solution: [
              {
                text: 'Pull the largest perfect square out from under the root.',
                visual: working([
                  { label: 'Factor', text: `${n} = ${out * out} × ${inside}` },
                  { label: 'Split', text: `√${n} = √${out * out} × √${inside}` },
                  { label: 'So', text: `√${n} = ${out}√${inside}` },
                ]),
              },
              { text: `Check by squaring: (${out}√${inside})² = ${out * out} × ${inside} = ${n}.` },
            ],
          };
        }
        if (variant === 1) {
          const [b, r] = pick(rng, [[4, 2], [9, 2], [16, 2], [25, 2], [8, 3], [27, 3], [64, 3], [125, 3], [16, 4], [81, 4], [32, 5], [100, 2]] as const);
          const k = pick(rng, r === 2 ? [3] : r === 3 ? [2, 4] : r === 4 ? [3] : [2, 3]);
          const rt = Math.round(b ** (1 / r));
          const value = rt ** k;
          const rootName = r === 2 ? 'square root' : r === 3 ? 'cube root' : r === 4 ? 'fourth root' : 'fifth root';
          return {
            prompt: `What is ${b}^(${k}/${r})?`,
            answer: { kind: 'number', value },
            hints: [`The bottom of the exponent is the root. Start with the ${rootName} of ${b}.`, `The ${rootName} of ${b} is ${rt}. Now raise it to the power ${k}.`],
            solution: [
              {
                text: 'Root first, then power. That keeps the numbers small.',
                visual: working([
                  { label: `${rootName[0].toUpperCase()}${rootName.slice(1)}`, text: `${b}^(1/${r}) = ${rt}, since ${p(rt, r)} = ${b}` },
                  { label: 'Power', text: `${p(rt, k)} = ${value}` },
                ]),
              },
            ],
          };
        }
        const [a, b] = pick(rng, [[2, 8], [3, 12], [2, 18], [3, 27], [5, 20], [2, 32], [6, 24], [8, 18], [12, 27], [5, 45], [3, 48], [2, 50], [8, 50], [6, 54], [7, 28]] as const);
        const value = Math.round(Math.sqrt(a * b));
        return {
          prompt: `What is √${a} × √${b}?`,
          answer: { kind: 'number', value },
          hints: ['A product of square roots is the square root of the product.', `√${a} × √${b} = √${a * b}.`],
          solution: [
            {
              text: 'Neither root is a whole number, but together they are.',
              visual: working([
                { label: 'Combine', text: `√${a} × √${b} = √${a * b}` },
                { label: 'Evaluate', text: `√${a * b} = ${value}` },
              ]),
            },
            { text: `Or simplify each first: √${a} = ${root(a)} and √${b} = ${root(b)}, whose product is also ${value}.` },
          ],
        };
      },
    },
  ],
};

// ── Quadratics ───────────────────────────────────────────────────────────────

const factorPair = (r: number) => (r === 0 ? 'x' : `(x ${plus(-r)})`);

const quadratics: Lesson = {
  topic: 'quadratics',
  intro: [
    {
      text: 'A quadratic has an x² term, and usually two solutions. The key fact is the zero-product property: if two things multiply to 0, one of them is 0. So factor, then set each factor to zero. To factor x² − 7x + 12, hunt for two numbers that multiply to +12 and add to −7.',
      visual: working([
        { label: 'Need', text: 'product 12, sum −7' },
        { label: 'Found', text: '−3 and −4' },
        { label: 'Factor', text: '(x − 3)(x − 4) = 0' },
        { label: 'Solutions', text: 'x = 3 or x = 4' },
      ]),
    },
    {
      text: 'Always move everything to one side first. x² = 5x + 14 becomes x² − 5x − 14 = 0. The product is negative, so the two numbers have opposite signs: −7 and +2. Solutions: x = 7 or x = −2. In a word problem, a negative length or count gets thrown out.',
    },
    {
      text: 'Look again at (x − 3)(x − 4) = x² − 7x + 12. The 7 is the SUM of the solutions and the 12 is their PRODUCT. That is no accident: multiply out (x − r)(x − s) and you get x² − (r + s)x + rs. These are Vieta\'s formulas.',
      visual: working([
        { label: 'Expand', text: '(x − r)(x − s) = x² − (r + s)x + rs' },
        { label: 'For ax² + bx + c = 0', text: 'sum of roots = −b/a' },
        { label: '', text: 'product of roots = c/a' },
      ]),
    },
    {
      text: 'This means you can answer questions about the roots without finding them. The roots of x² − 6x + 4 = 0 are ugly (they involve √5), but their sum is 6 and their product is 4. So the sum of their squares is 6² − 2 × 4 = 28, using the special-products trick, and the sum of their reciprocals is 1/r + 1/s = (r + s)/rs = 6/4 = 3/2.',
    },
    {
      text: 'When nothing factors, the quadratic formula always works: x = (−b ± √(b² − 4ac)) / 2a. The piece under the root, b² − 4ac, is the discriminant. Positive means two real solutions, zero means exactly one, negative means none.',
    },
  ],
  rungs: [
    {
      id: 'quadratics/factor',
      idea: 'Factor and set each factor to zero',
      buildsOn: 'special_products/factor',
      generate: rng => {
        const pool = [-9, -8, -7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        const r = pick(rng, pool);
        const s = pick(rng, pool.filter(v => v !== r));
        const [lo, hi] = [Math.min(r, s), Math.max(r, s)];
        const [b, c] = [-(r + s), r * s];
        const want = pick(rng, ['larger', 'smaller'] as const);
        // Sometimes leave terms on the right-hand side.
        const moved = rng() < 0.4 && b !== 0;
        const eq = moved ? `x² = ${term(-b, 'x')}${c === 0 ? '' : ` ${plus(-c)}`}` : `${quad(b, c)} = 0`;
        return {
          prompt: `The equation ${eq} has two solutions. What is the ${want} one?`,
          answer: { kind: 'number', value: want === 'larger' ? hi : lo },
          hints: [
            `${moved ? `Move everything to the left: ${quad(b, c)} = 0. ` : ''}Find two numbers with product ${neg(c)} and sum ${neg(b)}.`,
            `The numbers are ${neg(-lo)} and ${neg(-hi)}, so it factors as ${factorPair(lo)}${factorPair(hi)}.`,
          ],
          solution: [
            {
              text: `${moved ? 'Get zero on one side first. ' : ''}Then look for two numbers that multiply to ${neg(c)} and add to ${neg(b)}.`,
              visual: working([
                ...(moved ? [{ label: 'Rearrange', text: `${quad(b, c)} = 0` }] : []),
                { label: 'Numbers', text: `${neg(-lo)} and ${neg(-hi)}` },
                { label: 'Factor', text: `${factorPair(lo)}${factorPair(hi)} = 0` },
                { label: 'Solutions', text: `x = ${neg(lo)} or x = ${neg(hi)}` },
              ]),
            },
            { text: `The ${want} solution is ${neg(want === 'larger' ? hi : lo)}. Notice the solutions have the opposite signs from the numbers inside the factors.` },
          ],
        };
      },
    },
    {
      id: 'quadratics/story',
      idea: 'A quadratic hiding in a story',
      buildsOn: 'quadratics/factor',
      generate: rng => {
        const variant = int(rng, 0, 2);
        if (variant === 0) {
          const w = int(rng, 4, 15);
          const k = int(rng, 2, 9);
          const area = w * (w + k);
          return {
            prompt: `A rectangle is ${k} cm longer than it is wide, and its area is ${area} cm². How many centimeters wide is it?`,
            answer: { kind: 'number', value: w },
            hints: [`Call the width w. The length is w + ${k}, so w(w + ${k}) = ${area}.`, `w² + ${k}w − ${area} = 0. Find two numbers ${k} apart whose product is ${area}.`],
            solution: [
              {
                text: 'Name the width, write the area, and get zero on one side.',
                visual: working([
                  { label: 'Area', text: `w(w + ${k}) = ${area}` },
                  { label: 'Rearrange', text: `w² + ${k}w − ${area} = 0` },
                  { label: 'Factor', text: `(w − ${w})(w + ${w + k}) = 0` },
                  { label: 'Solutions', text: `w = ${w} or w = −${w + k}` },
                ]),
              },
              { text: `A width cannot be negative, so w = ${w}. Shortcut: you just need two numbers ${k} apart that multiply to ${area}, and ${w} × ${w + k} does it.` },
            ],
          };
        }
        if (variant === 1) {
          const step = pick(rng, [1, 2]);
          const n = int(rng, 7, 30);
          const kind = step === 1 ? '' : n % 2 === 0 ? 'even ' : 'odd ';
          const prod = n * (n + step);
          return {
            prompt: `The product of two consecutive positive ${kind}integers is ${fmt(prod)}. What is the larger one?`,
            answer: { kind: 'number', value: n + step },
            hints: [
              `The two numbers are nearly equal, so each is near √${fmt(prod)}.`,
              `${Math.floor(Math.sqrt(prod))}² = ${fmt(Math.floor(Math.sqrt(prod)) ** 2)}. Try numbers on either side of that.`,
            ],
            solution: [
              {
                text: `With n as the smaller number, n(n + ${step}) = ${fmt(prod)}.`,
                visual: working([
                  { label: 'Rearrange', text: `n² + ${term(step, 'n')} − ${fmt(prod)} = 0` },
                  { label: 'Factor', text: `(n − ${n})(n + ${n + step}) = 0` },
                  { label: 'Positive solution', text: `n = ${n}, so the larger is ${n + step}` },
                ]),
              },
              { text: `To find the factors quickly, estimate: √${fmt(prod)} is a little more than ${Math.floor(Math.sqrt(prod))}, and the two numbers sit on either side of it.` },
            ],
          };
        }
        const x = int(rng, 3, 12);
        const total = x * x + x;
        return {
          prompt: `A positive number plus its square equals ${total}. What is the number?`,
          answer: { kind: 'number', value: x },
          hints: [`x² + x = ${total}, which is x(x + 1) = ${total}.`, `Find two consecutive numbers that multiply to ${total}.`],
          solution: [
            {
              text: 'Translate, get zero on one side, and factor.',
              visual: working([
                { label: 'Translate', text: `x² + x = ${total}` },
                { label: 'Rearrange', text: `x² + x − ${total} = 0` },
                { label: 'Factor', text: `(x − ${x})(x + ${x + 1}) = 0` },
                { label: 'Positive solution', text: `x = ${x}` },
              ]),
            },
          ],
        };
      },
    },
    {
      id: 'quadratics/vieta',
      idea: 'Sum and product of the roots, without solving',
      buildsOn: 'quadratics/story',
      generate: rng => {
        const a = int(rng, 1, 5);
        let b = int(rng, 3, 14) * (rng() < 0.6 ? -1 : 1);
        const c = int(rng, 1, 9) * (rng() < 0.75 ? -1 : 1);
        // A negative c guarantees real roots; a positive c needs a big enough b.
        if (c > 0 && b * b < 4 * a * c + 1) b = (b < 0 ? -1 : 1) * (Math.ceil(Math.sqrt(4 * a * c)) + 1);
        const want = pick(rng, ['sum', 'product'] as const);
        const [num, den] = want === 'sum' ? reduceSigned(-b, a) : reduceSigned(c, a);
        return {
          prompt: `What is the ${want} of the two solutions of ${quad(b, c, a)} = 0? Give a whole number or a fraction in lowest terms; type a minus sign if it is negative.`,
          answer: { kind: 'fraction', num, den },
          hints: [
            'Do not solve it. For ax² + bx + c = 0, the sum of the roots is −b/a and the product is c/a.',
            `Here a = ${a}, b = ${neg(b)}, c = ${neg(c)}.`,
          ],
          solution: [
            {
              text: 'Read the answer off the coefficients with Vieta\'s formulas.',
              visual: working([
                { label: 'Coefficients', text: `a = ${a}, b = ${neg(b)}, c = ${neg(c)}` },
                want === 'sum'
                  ? { label: 'Sum = −b/a', text: a === 1 ? neg(-b) : `${neg(-b)}/${a}${sfrac(-b, a) === `${neg(-b)}/${a}` ? '' : ` = ${sfrac(-b, a)}`}` }
                  : { label: 'Product = c/a', text: a === 1 ? neg(c) : `${neg(c)}/${a}${sfrac(c, a) === `${neg(c)}/${a}` ? '' : ` = ${sfrac(c, a)}`}` },
              ]),
            },
            { text: `The actual solutions involve √${b * b - 4 * a * c}${Number.isInteger(Math.sqrt(b * b - 4 * a * c)) ? '' : ', which is not a whole number'}. Vieta lets you skip them entirely.` },
          ],
        };
      },
    },
    {
      id: 'quadratics/root-expressions',
      idea: 'Build other expressions from the sum and product',
      buildsOn: 'special_products/sum-product',
      generate: rng => {
        const S = int(rng, 4, 12);
        // Keep the roots real, positive and (usually) irrational.
        const P = int(rng, 1, Math.floor((S * S) / 4) - 1);
        const eq = `${quad(-S, P)} = 0`;
        const variant = int(rng, 0, 2);
        const lead = { text: `By Vieta's formulas on ${eq}: r + s = ${S} and rs = ${P}.` };
        if (variant === 0) {
          return {
            prompt: `Let r and s be the solutions of ${eq}. What is r² + s²?`,
            answer: { kind: 'number', value: S * S - 2 * P },
            hints: [`First read off r + s = ${S} and rs = ${P}.`, 'r² + s² = (r + s)² − 2rs.'],
            solution: [
              lead,
              {
                text: 'Square the sum and remove the cross term.',
                visual: working([
                  { label: 'Identity', text: 'r² + s² = (r + s)² − 2rs' },
                  { label: 'Substitute', text: `${S}² − 2 × ${P} = ${S * S} − ${2 * P}` },
                  { label: 'So', text: `r² + s² = ${S * S - 2 * P}` },
                ]),
              },
            ],
          };
        }
        if (variant === 1) {
          const [num, den] = reduce(S, P);
          return {
            prompt: `Let r and s be the solutions of ${eq}. What is 1/r + 1/s? Give a whole number or a fraction in lowest terms.`,
            answer: { kind: 'fraction', num, den },
            hints: [`First read off r + s = ${S} and rs = ${P}.`, 'Add the fractions: 1/r + 1/s = (s + r)/(rs).'],
            solution: [
              lead,
              {
                text: 'Put the two fractions over a common denominator.',
                visual: working([
                  { label: 'Combine', text: '1/r + 1/s = (r + s)/(rs)' },
                  { label: 'Substitute', text: `${S}/${P}${den === P ? '' : ` = ${frac(num, den)}`}` },
                ]),
              },
            ],
          };
        }
        const k = int(rng, 1, 4);
        return {
          prompt: `Let r and s be the solutions of ${eq}. What is (r + ${k})(s + ${k})?`,
          answer: { kind: 'number', value: P + k * S + k * k },
          hints: [`First read off r + s = ${S} and rs = ${P}.`, `Expand: (r + ${k})(s + ${k}) = rs + ${k}(r + s) + ${k * k}.`],
          solution: [
            lead,
            {
              text: 'Expand, and the sum and product appear.',
              visual: working([
                { label: 'Expand', text: `rs + ${term(k, '(r + s)')} + ${k * k}` },
                { label: 'Substitute', text: `${P} + ${k} × ${S} + ${k * k}` },
                { label: 'So', text: `${P + k * S + k * k}` },
              ]),
            },
          ],
        };
      },
    },
  ],
};

// ── Clever Substitution ──────────────────────────────────────────────────────

const substitution: Lesson = {
  topic: 'substitution',
  intro: [
    {
      text: 'Some expressions go on forever, and that is exactly what makes them solvable. Take x = √(6 + √(6 + √(6 + …))). Cover up the first "√(6 +" with your hand. What remains is the very same infinite expression, so it also equals x.',
      visual: working([
        { label: 'Name it', text: 'x = √(6 + √(6 + √(6 + …)))' },
        { label: 'It contains itself', text: 'x = √(6 + x)' },
        { label: 'Square', text: 'x² = 6 + x' },
        { label: 'Solve', text: 'x² − x − 6 = 0, so (x − 3)(x + 2) = 0' },
        { label: 'So', text: 'x = 3 (a square root cannot be −2)' },
      ]),
    },
    {
      text: 'The same move handles an infinite continued fraction. In x = 2 + 3/(2 + 3/(2 + …)), everything under the first fraction bar is x again.',
      visual: working([
        { label: 'It contains itself', text: 'x = 2 + 3/x' },
        { label: 'Multiply by x', text: 'x² = 2x + 3' },
        { label: 'Solve', text: '(x − 3)(x + 1) = 0' },
        { label: 'So', text: 'x = 3 (every term is positive)' },
      ]),
    },
    {
      text: 'Substitution also tames finite equations that are quadratics in disguise. x⁴ − 13x² + 36 = 0 has only x⁴ and x² terms, so let y = x². It becomes y² − 13y + 36 = 0, which factors as (y − 4)(y − 9). So x² = 4 or x² = 9, giving four solutions: ±2 and ±3.',
    },
    {
      text: 'The habit to build: when a chunk repeats, give it a name. Whether the chunk is an infinite tail, an x², or a 2ˣ, one new letter usually turns a scary problem into a quadratic you already know how to solve. Then remember to undo the substitution, and to discard any value the original expression could not take.',
    },
  ],
  rungs: [
    {
      id: 'substitution/nested-radical',
      idea: 'An infinite radical contains itself',
      buildsOn: 'quadratics/factor',
      generate: rng => {
        const k = int(rng, 3, 12);
        const minus = rng() < 0.35;
        const n = minus ? k * (k + 1) : k * (k - 1);
        const op = minus ? '−' : '+';
        return {
          prompt: `What is the value of √(${n} ${op} √(${n} ${op} √(${n} ${op} …)))?`,
          answer: { kind: 'number', value: k },
          hints: [
            `Call the whole thing x. Under the first root, after "${n} ${op}", the same expression appears again.`,
            `x = √(${n} ${op} x), so x² = ${n} ${op} x.`,
          ],
          solution: [
            {
              text: 'Name the expression x. It reappears inside itself, which gives an equation.',
              visual: working([
                { label: 'Self-similar', text: `x = √(${n} ${op} x)` },
                { label: 'Square', text: `x² = ${n} ${op} x` },
                { label: 'Rearrange', text: `x² ${minus ? '+' : '−'} x − ${n} = 0` },
                { label: 'Factor', text: minus ? `(x − ${k})(x + ${k + 1}) = 0` : `(x − ${k})(x + ${k - 1}) = 0` },
              ]),
            },
            { text: `A square root is never negative, so x = ${k}. Check: √(${n} ${op} ${k}) = √${minus ? n - k : n + k} = ${k}.` },
          ],
        };
      },
    },
    {
      id: 'substitution/continued-fraction',
      idea: 'An infinite fraction contains itself',
      buildsOn: 'substitution/nested-radical',
      generate: rng => {
        const r = int(rng, 3, 10);
        const a = int(rng, 1, r - 1);
        if (rng() < 0.6) {
          const b = r * (r - a);
          return {
            prompt: `What is the value of ${a} + ${b}/(${a} + ${b}/(${a} + ${b}/(${a} + …)))?`,
            answer: { kind: 'number', value: r },
            hints: [`Call it x. Everything below the first fraction bar is x again.`, `x = ${a} + ${b}/x. Multiply both sides by x.`],
            solution: [
              {
                text: 'The denominator of the first fraction is a copy of the whole expression.',
                visual: working([
                  { label: 'Self-similar', text: `x = ${a} + ${b}/x` },
                  { label: 'Multiply by x', text: `x² = ${term(a, 'x')} + ${b}` },
                  { label: 'Rearrange', text: `${quad(-a, -b)} = 0` },
                  { label: 'Factor', text: `(x − ${r})(x + ${r - a}) = 0` },
                ]),
              },
              { text: `Every piece of the expression is positive, so x = ${r}. Check: ${a} + ${b}/${r} = ${a} + ${b / r} = ${r}.` },
            ],
          };
        }
        const b = r * (r + a);
        return {
          prompt: `What is the value of ${b}/(${a} + ${b}/(${a} + ${b}/(${a} + …)))?`,
          answer: { kind: 'number', value: r },
          hints: [`Call it x. The part added to ${a} in the first denominator is x again.`, `x = ${b}/(${a} + x), so x(${a} + x) = ${b}.`],
          solution: [
            {
              text: 'Look inside the first denominator: after the plus sign, the whole expression starts over.',
              visual: working([
                { label: 'Self-similar', text: `x = ${b}/(${a} + x)` },
                { label: 'Clear the fraction', text: `x(${a} + x) = ${b}` },
                { label: 'Rearrange', text: `${quad(a, -b)} = 0` },
                { label: 'Factor', text: `(x − ${r})(x + ${r + a}) = 0` },
              ]),
            },
            { text: `The expression is positive, so x = ${r}. Check: ${b}/(${a} + ${r}) = ${b}/${a + r} = ${r}.` },
          ],
        };
      },
    },
    {
      id: 'substitution/disguised',
      idea: 'A quadratic in disguise',
      buildsOn: 'substitution/continued-fraction',
      generate: rng => {
        const variant = int(rng, 0, 2);
        if (variant === 0) {
          const u = int(rng, 1, 5);
          const v = u + int(rng, 1, 4);
          const [A, B] = [u * u, v * v];
          const want = pick(rng, ['largest', 'count', 'positive-sum'] as const);
          return {
            prompt:
              want === 'largest'
                ? `What is the largest solution of x⁴ − ${A + B}x² + ${A * B} = 0?`
                : want === 'count'
                  ? `How many real solutions does x⁴ − ${A + B}x² + ${A * B} = 0 have?`
                  : `What is the sum of the positive solutions of x⁴ − ${A + B}x² + ${A * B} = 0?`,
            answer: { kind: 'number', value: want === 'largest' ? v : want === 'count' ? 4 : u + v },
            hints: ['Only x⁴ and x² appear. Let y = x², so x⁴ = y².', `y² − ${A + B}y + ${A * B} = 0 factors as (y − ${A})(y − ${B}).`],
            solution: [
              {
                text: 'Substitute y = x² to get an ordinary quadratic.',
                visual: working([
                  { label: 'Let y = x²', text: `y² − ${A + B}y + ${A * B} = 0` },
                  { label: 'Factor', text: `(y − ${A})(y − ${B}) = 0` },
                  { label: 'Undo', text: `x² = ${A} or x² = ${B}` },
                  { label: 'Solutions', text: `x = ±${u} or x = ±${v}` },
                ]),
              },
              { text: want === 'largest' ? `The largest of the four is ${v}.` : want === 'count' ? 'Each positive value of y gives two values of x, so there are 4 solutions.' : `The positive ones are ${u} and ${v}, with sum ${u + v}.` },
            ],
          };
        }
        if (variant === 1) {
          const u = int(rng, 2, 6);
          const A = u * u;
          const m = pick(rng, [1, 2, 3, 5, 6, 7, 8].filter(v => v !== A));
          const mid = (v: string) => `${m - A < 0 ? '−' : '+'} ${term(Math.abs(m - A), v)}`;
          const want = pick(rng, ['count', 'largest'] as const);
          return {
            prompt:
              want === 'count'
                ? `How many real solutions does x⁴ ${mid('x²')} − ${A * m} = 0 have?`
                : `What is the largest real solution of x⁴ ${mid('x²')} − ${A * m} = 0?`,
            answer: { kind: 'number', value: want === 'count' ? 2 : u },
            hints: ['Let y = x² and factor the quadratic in y.', `(y − ${A})(y + ${m}) = 0. Can x² equal −${m}?`],
            solution: [
              {
                text: 'Substitute y = x², solve for y, then undo the substitution carefully.',
                visual: working([
                  { label: 'Let y = x²', text: `y² ${mid('y')} − ${A * m} = 0` },
                  { label: 'Factor', text: `(y − ${A})(y + ${m}) = 0` },
                  { label: 'Undo', text: `x² = ${A} or x² = −${m}` },
                  { label: 'Real solutions', text: `x = ±${u} only` },
                ]),
              },
              { text: `A square of a real number cannot be negative, so x² = −${m} gives nothing. That leaves 2 solutions, the largest being ${u}.` },
            ],
          };
        }
        const base = pick(rng, [2, 3]);
        const i = int(rng, 0, 2);
        const j = i + int(rng, 1, 3);
        const [A, B] = [base ** i, base ** j];
        const sq = base * base;
        return {
          prompt: `What is the sum of all solutions of ${sq}ˣ − ${A + B} · ${base}ˣ + ${A * B} = 0?`,
          answer: { kind: 'number', value: i + j },
          hints: [`${sq}ˣ is (${base}ˣ)². Let y = ${base}ˣ.`, `y² − ${A + B}y + ${A * B} = 0 gives y = ${A} or y = ${B}. Which powers of ${base} are those?`],
          solution: [
            {
              text: `Since ${sq}ˣ = (${base}ˣ)², the repeating chunk is ${base}ˣ.`,
              visual: working([
                { label: `Let y = ${base}ˣ`, text: `y² − ${A + B}y + ${A * B} = 0` },
                { label: 'Factor', text: `(y − ${A})(y − ${B}) = 0` },
                { label: 'Undo', text: `${base}ˣ = ${A} or ${base}ˣ = ${B}` },
                { label: 'Solutions', text: `x = ${i} or x = ${j}` },
              ]),
            },
            { text: `The sum of the solutions is ${i} + ${j} = ${i + j}.` },
          ],
        };
      },
    },
    {
      id: 'substitution/reverse',
      idea: 'Run the self-similarity backwards',
      buildsOn: 'substitution/disguised',
      generate: rng => {
        const k = int(rng, 3, 14);
        if (rng() < 0.5) {
          return {
            prompt: `If √(n + √(n + √(n + …))) = ${k}, what is n?`,
            answer: { kind: 'number', value: k * k - k },
            hints: [`The expression under the first root is n plus the whole thing again, and the whole thing is ${k}.`, `${k} = √(n + ${k}). Square both sides.`],
            solution: [
              {
                text: `The infinite tail under the first root is the same expression, so it equals ${k} too.`,
                visual: working([
                  { label: 'Self-similar', text: `${k} = √(n + ${k})` },
                  { label: 'Square', text: `${k * k} = n + ${k}` },
                  { label: 'So', text: `n = ${k * k - k}` },
                ]),
              },
              { text: 'Knowing the value made this easier than the forward problem: no quadratic to factor.' },
            ],
          };
        }
        const a = int(rng, 1, k - 1);
        return {
          prompt: `If ${a} + n/(${a} + n/(${a} + n/(${a} + …))) = ${k}, what is n?`,
          answer: { kind: 'number', value: k * (k - a) },
          hints: [`The denominator of the first fraction is the whole expression again, which equals ${k}.`, `${k} = ${a} + n/${k}.`],
          solution: [
            {
              text: `Replace the infinite denominator by its value, ${k}.`,
              visual: working([
                { label: 'Self-similar', text: `${k} = ${a} + n/${k}` },
                { label: `Subtract ${a}`, text: `${k - a} = n/${k}` },
                { label: `Multiply by ${k}`, text: `n = ${k * (k - a)}` },
              ]),
            },
          ],
        };
      },
    },
  ],
};

export const POWER_LESSONS: Lesson[] = [specialProducts, exponents, quadratics, substitution];
