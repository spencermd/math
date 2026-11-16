// Realm I: Number Sense — ratios, percents and rates: thinking in parts and multipliers.
import type { Lesson, Visual } from './types.ts';
import { fmt, frac, gcd, int, lcm, pick, reduce } from './util.ts';

type Row = { label?: string; text: string };
const working = (rows: Row[]): Visual => ({ kind: 'rows', rows });

// ── Ratios ───────────────────────────────────────────────────────────────────

/** Ratios in lowest terms, smaller number first. */
const PAIRS: [number, number][] = [
  [2, 3], [3, 4], [2, 5], [3, 5], [4, 5], [2, 7], [3, 7], [4, 7], [5, 7], [3, 8], [5, 8], [5, 6], [4, 9], [5, 9],
];

/** Two kinds of thing in one place. `arrive` finishes "After 6 more <first> …". */
const MIXES = [
  { place: 'In a bag of red and blue marbles', first: 'red marbles', second: 'blue marbles', whole: 'marbles', arrive: 'are added' },
  { place: 'In a chess club', first: 'boys', second: 'girls', whole: 'members', arrive: 'join' },
  { place: 'At a shelter that houses only cats and dogs', first: 'cats', second: 'dogs', whole: 'animals', arrive: 'arrive' },
  { place: 'In an orchard of apple and pear trees', first: 'apple trees', second: 'pear trees', whole: 'trees', arrive: 'are planted' },
];

const ratios: Lesson = {
  topic: 'ratios',
  intro: [
    {
      text: 'A ratio of 3 : 5 says nothing about how many there are. It says that if you cut everything into equal parts, one group gets 3 parts and the other gets 5, which makes 8 parts in all. Find the size of one part and the problem is over. Say a bag of 40 marbles has red and blue in the ratio 3 : 5.',
      visual: working([
        { label: 'Count parts', text: '3 + 5 = 8 parts' },
        { label: 'One part', text: '40 ÷ 8 = 5 marbles' },
        { label: 'Red', text: '3 × 5 = 15' },
        { label: 'Blue', text: '5 × 5 = 25' },
      ]),
    },
    {
      text: 'You are not always handed the total. Suppose the ratio is still 3 : 5 and you are told there are 12 more blue than red. Blue has 5 − 3 = 2 more parts than red, so those 2 parts are the 12 marbles. One part is 6, and everything else follows: 18 red, 30 blue, 48 in all. Whatever number you are given, ask how many parts it is.',
    },
    {
      text: 'Two ratios can be chained when they share a member. If a : b = 2 : 3 and b : c = 4 : 5, then b is 3 parts in one ratio and 4 in the other. Rescale both so that b is 12 parts, the least common multiple.',
      visual: working([
        { label: 'a : b', text: '2 : 3 = 8 : 12' },
        { label: 'b : c', text: '4 : 5 = 12 : 15' },
        { label: 'Chain', text: 'a : b : c = 8 : 12 : 15' },
      ]),
    },
    {
      text: 'The same rescaling cracks problems where a ratio changes. A club has boys and girls in the ratio 3 : 4. Six more boys join and the ratio becomes 1 : 1. The girls did not change, so keep them at 4 parts in both ratios: 3 : 4 before, 4 : 4 after. The boys went up by one part, and that part is the 6 new boys. So there are 24 girls.',
    },
  ],
  rungs: [
    {
      id: 'ratios/one-part',
      idea: 'Find the size of one part',
      generate: rng => {
        if (rng() < 0.3) {
          const [a, b, c] = pick(rng, [[1, 2, 3], [2, 3, 4], [2, 3, 5], [1, 3, 4], [3, 4, 5], [2, 5, 6], [1, 4, 5], [3, 5, 7]] as const);
          const parts = a + b + c;
          const k = int(rng, 4, 15);
          const total = parts * k;
          const want = pick(rng, ['smallest', 'largest'] as const);
          const share = want === 'smallest' ? a : c;
          return {
            prompt: `Three friends split $${total} in the ratio ${a} : ${b} : ${c}. How many dollars is the ${want} share?`,
            answer: { kind: 'number', value: share * k },
            hints: [
              'How many equal parts is the money being cut into?',
              `There are ${a} + ${b} + ${c} = ${parts} parts. How much is one part?`,
            ],
            solution: [
              { text: `The ratio cuts the money into ${a} + ${b} + ${c} = ${parts} equal parts.` },
              { text: `One part is $${total} ÷ ${parts} = $${k}.` },
              { text: `The ${want} share is ${share} part${share === 1 ? '' : 's'}: ${share} × $${k} = $${share * k}.` },
            ],
          };
        }

        const mix = pick(rng, MIXES);
        const [lo, hi] = pick(rng, PAIRS);
        const [a, b] = rng() < 0.5 ? [lo, hi] : [hi, lo];
        const k = int(rng, 3, 12);
        const total = (a + b) * k;
        const askFirst = rng() < 0.5;
        const [asked, share] = askFirst ? [mix.first, a] : [mix.second, b];
        return {
          prompt: `${mix.place}, the ratio of ${mix.first} to ${mix.second} is ${a} : ${b}. There are ${total} ${mix.whole} in all. How many ${asked} are there?`,
          answer: { kind: 'number', value: share * k },
          hints: [
            `Think of the ${mix.whole} as ${a} parts ${mix.first} and ${b} parts ${mix.second}. How many parts is that in all?`,
            `${a} + ${b} = ${a + b} parts make ${total} ${mix.whole}. How big is one part?`,
          ],
          solution: [
            {
              text: `Cut the ${mix.whole} into equal parts: ${a} parts are ${mix.first} and ${b} parts are ${mix.second}.`,
              visual: working([
                { label: 'Count parts', text: `${a} + ${b} = ${a + b} parts` },
                { label: 'One part', text: `${total} ÷ ${a + b} = ${k}` },
                { label: 'Answer', text: `${share} × ${k} = ${share * k} ${asked}` },
              ]),
            },
            { text: `Check with the other group: ${askFirst ? b : a} × ${k} = ${(askFirst ? b : a) * k}, and ${a * k} + ${b * k} = ${total}.` },
          ],
        };
      },
    },
    {
      id: 'ratios/difference',
      idea: 'Ask how many parts the clue is',
      buildsOn: 'ratios/one-part',
      generate: rng => {
        const mix = pick(rng, MIXES);
        const [a, b] = pick(rng, PAIRS);
        const k = int(rng, 3, 12);
        const gap = b - a;
        const more = gap * k;
        const want = pick(rng, ['total', 'first', 'second'] as const);
        const [question, parts] =
          want === 'total'
            ? [`How many ${mix.whole} are there in all?`, a + b]
            : want === 'first'
              ? [`How many ${mix.first} are there?`, a]
              : [`How many ${mix.second} are there?`, b];
        return {
          prompt: `${mix.place}, the ratio of ${mix.first} to ${mix.second} is ${a} : ${b}, and there are ${more} more ${mix.second} than ${mix.first}. ${question}`,
          answer: { kind: 'number', value: parts * k },
          hints: [
            `You are not told the total this time. How many more parts do the ${mix.second} have than the ${mix.first}?`,
            `The ${mix.second} have ${b} − ${a} = ${gap} more part${gap === 1 ? '' : 's'}, and that is ${more} ${mix.whole}.`,
          ],
          solution: [
            { text: `The ${mix.first} are ${a} parts and the ${mix.second} are ${b} parts, so the ${mix.second} have ${b} − ${a} = ${gap} more part${gap === 1 ? '' : 's'}.` },
            { text: gap === 1 ? `That one extra part is the ${more} extra ${mix.second}, so one part is ${k}.` : `Those ${gap} parts are the ${more} extra ${mix.second}, so one part is ${more} ÷ ${gap} = ${k}.` },
            {
              text:
                want === 'total'
                  ? `There are ${a} + ${b} = ${a + b} parts in all: ${a + b} × ${k} = ${parts * k} ${mix.whole}.`
                  : `The ${want === 'first' ? mix.first : mix.second} are ${parts} parts: ${parts} × ${k} = ${parts * k}.`,
            },
          ],
        };
      },
    },
    {
      id: 'ratios/chain',
      idea: 'Chain two ratios together',
      buildsOn: 'ratios/difference',
      generate: rng => {
        let p: number, q: number, r: number, s: number, L: number, A: number, C: number;
        do {
          [p, q] = pick(rng, PAIRS);
          [r, s] = pick(rng, PAIRS);
          if (rng() < 0.5) [p, q] = [q, p];
          if (rng() < 0.5) [r, s] = [s, r];
          L = lcm(q, r);
          A = (p * L) / q;
          C = (s * L) / r;
        } while (q === r || L > 30 || A === C);
        const rescale = working([
          { label: 'Ana : Ben', text: L === q ? `${p} : ${q}` : `${p} : ${q} = ${A} : ${L}` },
          { label: 'Ben : Cal', text: L === r ? `${r} : ${s}` : `${r} : ${s} = ${L} : ${C}` },
          { label: 'Chain', text: `Ana : Ben : Cal = ${A} : ${L} : ${C}` },
        ]);
        const setup = `The ratio of Ana's stickers to Ben's is ${p} : ${q}, and the ratio of Ben's stickers to Cal's is ${r} : ${s}.`;
        const hints = [
          `Ben is ${q} parts in one ratio and ${r} parts in the other. Rescale so he is the same number of parts in both.`,
          `The least common multiple of ${q} and ${r} is ${L}. Write both ratios with Ben as ${L}.`,
        ];
        const first = { text: `Ben appears in both ratios, as ${q} parts and as ${r} parts. Rescale both so that Ben is ${L} parts, the least common multiple of ${q} and ${r}.`, visual: rescale };

        if (rng() < 0.5) {
          const [num, den] = reduce(A, C);
          return {
            prompt: `${setup} What is the ratio of Ana's stickers to Cal's? Write it as a fraction in lowest terms.`,
            answer: { kind: 'fraction', num, den },
            hints,
            solution: [
              first,
              { text: `So Ana : Cal = ${A} : ${C}${gcd(A, C) > 1 ? `, which simplifies to ${num} : ${den}` : ''}. As a fraction that is ${frac(num, den)}.` },
            ],
          };
        }
        const k = int(rng, 1, 4);
        const total = (A + L + C) * k;
        return {
          prompt: `${setup} Together the three of them have ${total} stickers. How many does Cal have?`,
          answer: { kind: 'number', value: C * k },
          hints,
          solution: [
            first,
            { text: `That is ${A} + ${L} + ${C} = ${A + L + C} parts in all, so one part is ${total} ÷ ${A + L + C} = ${k} sticker${k === 1 ? '' : 's'}.` },
            { text: `Cal has ${C} parts: ${C} × ${k} = ${C * k} stickers.` },
          ],
        };
      },
    },
    {
      id: 'ratios/change',
      idea: 'Hold the unchanged group fixed',
      buildsOn: 'ratios/chain',
      generate: rng => {
        const mix = pick(rng, MIXES);
        let a: number, b: number, c: number, d: number, L: number;
        do {
          [a, b] = pick(rng, PAIRS);
          if (rng() < 0.3) [a, b] = [b, a];
          [c, d] = pick(rng, [[1, 1], [1, 2], [2, 1], [3, 2], [4, 3], [5, 4], [5, 3], [2, 3], [3, 4], [4, 5], [5, 6], [7, 4]] as const);
          L = lcm(b, d);
        } while (c * b <= a * d || L > 24);
        const t = int(rng, 2, 6);
        const [before, after] = [(a * L) / b, (c * L) / d];
        const added = (after - before) * t;
        const second = L * t;
        const first = before * t;
        const askSecond = rng() < 0.6;
        return {
          prompt: `${mix.place}, the ratio of ${mix.first} to ${mix.second} is ${a} : ${b}. After ${added} more ${mix.first} ${mix.arrive}, the ratio is ${c} : ${d}. How many ${askSecond ? `${mix.second} are there` : `${mix.first} were there to begin with`}?`,
          answer: { kind: 'number', value: askSecond ? second : first },
          hints: [
            `The number of ${mix.second} never changes. Write both ratios so the ${mix.second} are the same number of parts.`,
            `With the ${mix.second} as ${L} parts, the ${mix.first} go from ${before} parts to ${after} parts.`,
          ],
          solution: [
            {
              text: `Only the ${mix.first} change, so rescale both ratios until the ${mix.second} are the same number of parts: ${L}.`,
              visual: working([
                { label: 'Before', text: L === b ? `${a} : ${b}` : `${a} : ${b} = ${before} : ${L}` },
                { label: 'After', text: L === d ? `${c} : ${d}` : `${c} : ${d} = ${after} : ${L}` },
              ]),
            },
            { text: `The ${mix.first} went from ${before} parts to ${after} parts, a gain of ${after - before} part${after - before === 1 ? '' : 's'}. That gain is the ${added} new ${mix.first}, so one part is ${after - before === 1 ? added : `${added} ÷ ${after - before} = ${t}`}.` },
            { text: askSecond ? `The ${mix.second} are ${L} parts: ${L} × ${t} = ${second}.` : `To begin with the ${mix.first} were ${before} parts: ${before} × ${t} = ${first}.` },
            { text: `Check: ${first} : ${second} is ${a} : ${b}, and ${first + added} : ${second} is ${c} : ${d}.` },
          ],
        };
      },
    },
  ],
};

// ── Percents ─────────────────────────────────────────────────────────────────

/** Percents worth knowing as fractions. */
const PERCENT_FRIENDS: { p: string; n: number; d: number }[] = [
  { p: '25', n: 1, d: 4 },
  { p: '75', n: 3, d: 4 },
  { p: '20', n: 1, d: 5 },
  { p: '40', n: 2, d: 5 },
  { p: '60', n: 3, d: 5 },
  { p: '80', n: 4, d: 5 },
  { p: '12.5', n: 1, d: 8 },
  { p: '37.5', n: 3, d: 8 },
  { p: '62.5', n: 5, d: 8 },
  { p: '87.5', n: 7, d: 8 },
];

/** A percent change and the fraction it multiplies by: up 20% is × 6/5. */
const CHANGES: { p: number; up: boolean; n: number; d: number }[] = [
  { p: 20, up: true, n: 6, d: 5 },
  { p: 25, up: true, n: 5, d: 4 },
  { p: 10, up: true, n: 11, d: 10 },
  { p: 40, up: true, n: 7, d: 5 },
  { p: 50, up: true, n: 3, d: 2 },
  { p: 30, up: true, n: 13, d: 10 },
  { p: 20, up: false, n: 4, d: 5 },
  { p: 25, up: false, n: 3, d: 4 },
  { p: 10, up: false, n: 9, d: 10 },
  { p: 40, up: false, n: 3, d: 5 },
  { p: 30, up: false, n: 7, d: 10 },
  { p: 60, up: false, n: 2, d: 5 },
];

const GOODS = ['jacket', 'bike', 'pair of skates', 'telescope', 'guitar', 'backpack'];

const percents: Lesson = {
  topic: 'percents',
  intro: [
    {
      text: 'Percent means "out of a hundred", so every percent is a fraction, and the common ones are worth knowing cold: 50% = 1/2, 25% = 1/4, 20% = 1/5, 10% = 1/10, 12.5% = 1/8, and 33⅓% = 1/3. Then 75% of 84 is not a multiplication at all. It is three quarters of 84: 84 ÷ 4 = 21, times 3 is 63.',
    },
    {
      text: 'Here is a trick that feels like cheating. What is 36% of 25? Swap the numbers: it equals 25% of 36, which is 9. It works because both are the same product divided by 100.',
      visual: working([
        { text: '36% of 25' },
        { label: 'Write it out', text: '= 36 × 25 ÷ 100' },
        { label: 'Reorder', text: '= 25 × 36 ÷ 100' },
        { text: '= 25% of 36 = 9' },
      ]),
    },
    {
      text: 'A percent change is a multiplication. A price that rises 20% ends at 120% of where it began, so you multiply by 1.2, which is 6/5. A price that falls 25% keeps 75% of itself, so you multiply by 3/4. One step, no adding or subtracting afterwards.',
    },
    {
      text: 'Because changes multiply, they do not undo each other. Raise $100 by 20%, then cut the result by 20%. The cut is taken from the bigger number, so it removes more than the rise added.',
      visual: working([
        { label: 'Start', text: '$100' },
        { label: 'Up 20%', text: '$100 + $20 = $120' },
        { label: 'Down 20%', text: '$120 − $24 = $96' },
        { label: 'Overall', text: 'a 4% loss, not back to $100' },
      ]),
    },
    {
      text: 'Going backwards catches almost everyone. After a 20% discount a game costs $60. What did it cost before? Not $72: the discount was 20% of the original price, not 20% of $60. Instead say what you know. $60 is 80% of the original, which is 4/5 of it. So one fifth is $15 and the original was $75.',
    },
  ],
  rungs: [
    {
      id: 'percents/of',
      idea: 'Turn a percent into an easy fraction',
      buildsOn: 'fractions_decimals/decimal-friends',
      generate: rng => {
        if (rng() < 0.45) {
          // The swap: p% of 25 is 25% of p.
          const [base, d, n] = pick(rng, [[25, 4, 1], [25, 4, 1], [50, 2, 1], [75, 4, 3], [20, 5, 1]] as const);
          let p: number;
          do p = d * int(rng, 2, 24);
          while (p >= 100 || p % 10 === 0 || p === 25 || p === 75);
          const answer = (p / d) * n;
          return {
            prompt: `What is ${p}% of ${base}?`,
            answer: { kind: 'number', value: answer },
            hints: [
              `${p}% is not a friendly percent, but ${base}% is. Can you trade them?`,
              `${p}% of ${base} equals ${base}% of ${p}.`,
            ],
            solution: [
              { text: `Swap the two numbers: ${p}% of ${base} and ${base}% of ${p} are both ${p} × ${base} ÷ 100.` },
              { text: `${base}% is ${frac(n, d)}, and ${frac(n, d)} of ${p} is ${n === 1 ? `${p} ÷ ${d} = ${answer}` : `${p} ÷ ${d} × ${n} = ${answer}`}.` },
            ],
          };
        }
        const f = pick(rng, PERCENT_FRIENDS);
        let k = int(rng, 6, 30);
        if (k % 10 === 0) k += 1;
        const whole = f.d * k;
        const answer = f.n * k;
        return {
          prompt: `What is ${f.p}% of ${whole}?`,
          answer: { kind: 'number', value: answer },
          hints: [`What fraction is ${f.p}%?`, `${f.p}% = ${frac(f.n, f.d)}, so divide ${whole} by ${f.d}${f.n > 1 ? ` and multiply by ${f.n}` : ''}.`],
          solution: [
            { text: `${f.p}% is the fraction ${frac(f.n, f.d)}.` },
            { text: `${frac(f.n, f.d)} of ${whole}: ${whole} ÷ ${f.d} = ${k}${f.n > 1 ? `, and ${k} × ${f.n} = ${answer}` : ''}.` },
          ],
        };
      },
    },
    {
      id: 'percents/change',
      idea: 'A percent change is one multiplication',
      buildsOn: 'percents/of',
      generate: rng => {
        const ch = pick(rng, CHANGES);
        const thing = pick(rng, GOODS);
        const k = int(rng, 4, 24);
        const [before, after] = [ch.d * k, ch.n * k];
        const kept = ch.up ? 100 + ch.p : 100 - ch.p;

        if (rng() < 0.5) {
          return {
            prompt: `A ${thing} cost $${before}. Its price then ${ch.up ? 'went up' : 'came down'} by ${ch.p}%. What is the new price in dollars?`,
            answer: { kind: 'number', value: after },
            hints: [
              'What percent of the old price is the new price?',
              `The new price is ${kept}% of the old one, and ${kept}% = ${frac(ch.n, ch.d)}.`,
            ],
            solution: [
              { text: `${ch.up ? 'A rise' : 'A fall'} of ${ch.p}% leaves ${ch.up ? `100% + ${ch.p}%` : `100% − ${ch.p}%`} = ${kept}% of the old price. As a fraction, ${kept}% is ${frac(ch.n, ch.d)}.` },
              { text: `${frac(ch.n, ch.d)} of $${before}: ${before} ÷ ${ch.d} = ${k}, and ${k} × ${ch.n} = ${after}. The new price is $${after}.` },
            ],
          };
        }
        const change = Math.abs(after - before);
        const [cn, cd] = reduce(change, before);
        return {
          prompt: `The price of a ${thing} ${ch.up ? 'rose' : 'fell'} from $${before} to $${after}. By what percent did it ${ch.up ? 'increase' : 'decrease'}?`,
          answer: { kind: 'number', value: ch.p },
          hints: [
            `The price changed by $${change}. That is a fraction of which price, the old one or the new one?`,
            `Compare the change with where it started: ${change}/${before}.`,
          ],
          solution: [
            { text: `The price ${ch.up ? 'rose' : 'fell'} by $${change}.` },
            { text: `A percent change is always measured against the starting amount: ${change}/${before} = ${frac(cn, cd)} = ${ch.p}%.` },
            { text: `Dividing by the new price, $${after}, is the classic slip here. It gives a different, wrong, percent.` },
          ],
        };
      },
    },
    {
      id: 'percents/successive',
      idea: 'Back-to-back changes multiply',
      buildsOn: 'percents/change',
      generate: rng => {
        const thing = pick(rng, GOODS);
        const [p, q] = [10 * int(rng, 1, 5), 10 * int(rng, 1, 5)];
        const up1 = rng() < 0.5;
        const up2 = rng() < 0.35 ? up1 : !up1;
        const mid = up1 ? 100 + p : 100 - p;
        const step = (mid * q) / 100;
        const end = up2 ? mid + step : mid - step;
        const naive = 100 + (up1 ? p : -p) + (up2 ? q : -q);
        const net = Math.abs(end - 100);
        return {
          prompt: `A shop ${up1 ? 'raises' : 'cuts'} the price of a ${thing} by ${p}%. A month later it ${up2 ? 'raises' : 'cuts'} the new price by ${q}%. The final price is what percent of the original price?`,
          answer: { kind: 'number', value: end },
          hints: [
            'No price is given, so choose one. $100 makes percents easy.',
            `After the first change a $100 ${thing} costs $${mid}. The second change is ${q}% of $${mid}, not of $100.`,
          ],
          solution: [
            {
              text: 'No price is given, so pick an easy one: $100.',
              visual: working([
                { label: 'Start', text: '$100' },
                { label: `${up1 ? 'Up' : 'Down'} ${p}%`, text: `$100 ${up1 ? '+' : '−'} $${p} = $${mid}` },
                { label: `${up2 ? 'Up' : 'Down'} ${q}%`, text: `$${mid} ${up2 ? '+' : '−'} $${step} = $${end}` },
              ]),
            },
            { text: `The final price is ${end}% of the original, a net ${end > 100 ? 'rise' : 'fall'} of ${net}%.` },
            {
              text: `Adding and subtracting the percents would give ${naive === 100 ? 'no change at all' : `${naive}%`}, which is wrong: the second ${q}% is taken from $${mid}, not from $100. As multipliers, ${mid / 100} × ${(up2 ? 100 + q : 100 - q) / 100} = ${end / 100}.`,
            },
          ],
        };
      },
    },
    {
      id: 'percents/reverse',
      idea: 'Work back to the original',
      buildsOn: 'percents/successive',
      generate: rng => {
        const ch = pick(rng, CHANGES);
        const kept = ch.up ? 100 + ch.p : 100 - ch.p;
        const sale = !ch.up;
        const k = sale ? int(rng, 3, 15) : 100 * int(rng, 2, 12);
        const [before, after] = [ch.d * k, ch.n * k];
        const thing = pick(rng, GOODS);
        const unit = sale ? '$' : '';
        const wrong = sale ? after + (after * ch.p) / 100 : after - (after * ch.p) / 100;
        return {
          prompt: sale
            ? `After a ${ch.p}% discount, a ${thing} costs $${after}. What was its original price in dollars?`
            : `A town's population grew by ${ch.p}% this year and is now ${fmt(after)}. What was it a year ago?`,
          answer: { kind: 'number', value: before },
          hints: [
            `The ${ch.p}% was taken of the original amount, which you don't know yet. What percent of the original is ${unit}${fmt(after)}?`,
            `${unit}${fmt(after)} is ${kept}% of the original, and ${kept}% = ${frac(ch.n, ch.d)}.`,
          ],
          solution: [
            { text: `${unit}${fmt(after)} is ${ch.up ? `100% + ${ch.p}%` : `100% − ${ch.p}%`} = ${kept}% of the original, and ${kept}% is ${frac(ch.n, ch.d)}.` },
            { text: `Cut the original into ${ch.d} equal pieces. ${unit}${fmt(after)} is worth ${ch.n} of those pieces, so one piece is ${fmt(after)} ÷ ${ch.n} = ${unit}${fmt(k)}, and the original is ${ch.d} × ${fmt(k)} = ${unit}${fmt(before)}.` },
            {
              text: `The tempting move, ${sale ? 'adding' : 'taking off'} ${ch.p}% of ${unit}${fmt(after)}, gives ${unit}${Number.isInteger(wrong) ? fmt(wrong) : wrong.toFixed(2)}. That is wrong because the ${ch.p}% was a share of the ${sale ? 'larger' : 'smaller'} original amount.`,
            },
          ],
        };
      },
    },
  ],
};

// ── Rates ────────────────────────────────────────────────────────────────────

/** Things that happen at a steady rate. `did` takes a count and a number of minutes. */
const STEADY = [
  { items: 'pages', did: (n: number, t: number) => `A printer prints ${n} pages in ${t} minutes`, does: 'does it print', todo: 'to print' },
  { items: 'bottles', did: (n: number, t: number) => `A machine fills ${n} bottles in ${t} minutes`, does: 'does it fill', todo: 'to fill' },
  { items: 'boxes', did: (n: number, t: number) => `A robot packs ${n} boxes in ${t} minutes`, does: 'does it pack', todo: 'to pack' },
];

const TEAMS = [
  { who: 'painters', made: 'paint', what: 'fences', one: 'a fence', time: 'days', unit: 'painter-day' },
  { who: 'hens', made: 'lay', what: 'eggs', one: 'an egg', time: 'days', unit: 'hen-day' },
  { who: 'machines', made: 'make', what: 'gears', one: 'a gear', time: 'hours', unit: 'machine-hour' },
  { who: 'bakers', made: 'bake', what: 'pies', one: 'a pie', time: 'hours', unit: 'baker-hour' },
];

const rates: Lesson = {
  topic: 'rates',
  intro: [
    {
      text: 'A rate is a ratio with units attached: miles per hour, pages per minute, dollars per pound. The units are the best part, because they behave like factors in a fraction and cancel. "60 minutes per hour" is 60 minutes ÷ 1 hour, a fraction equal to 1, so you may multiply by it freely. 3 hours × 60 minutes/hour: the hours cancel and you are left with 180 minutes.',
    },
    {
      text: 'So to convert anything, line up fractions equal to 1 so that the units you do not want cancel. A car goes 60 miles per hour. How many feet per second is that? There are 5,280 feet in a mile and 3,600 seconds in an hour.',
      visual: working([
        { text: '60 miles/hour' },
        { label: 'Miles to feet', text: '= 60 × 5,280 feet/hour' },
        { label: 'Hours to seconds', text: '= 60 × 5,280 ÷ 3,600 feet/second' },
        { label: 'Cancel first', text: '= 5,280 ÷ 60 = 88 feet/second' },
      ]),
    },
    {
      text: 'Square and cubic units need care. A yard is 3 feet, but a square yard is a 3-foot by 3-foot square, which is 3 × 3 = 9 square feet, not 3. A cubic yard is 3 × 3 × 3 = 27 cubic feet. Convert each dimension separately and you cannot go wrong.',
    },
    {
      text: 'Some rates depend on two things at once. If 4 painters paint 6 fences in 3 days, how many fences do 6 painters paint in 4 days? Count the work in painter-days. The first crew put in 4 × 3 = 12 painter-days for 6 fences, so each painter-day paints half a fence. The second crew puts in 6 × 4 = 24 painter-days: 12 fences.',
    },
  ],
  rungs: [
    {
      id: 'rates/unit-rate',
      idea: 'Scale a rate up or down',
      buildsOn: 'ratios/one-part',
      generate: rng => {
        const s = pick(rng, STEADY);
        const [u, v] = pick(rng, [[3, 2], [5, 2], [7, 2], [4, 3], [5, 3], [7, 3], [8, 3], [5, 4], [7, 4], [9, 4], [6, 5], [8, 5]] as const);
        const i = int(rng, 2, 6);
        let j: number;
        do j = int(rng, 3, 12);
        while (j % i === 0);
        const [n, t] = [u * i, v * i];
        const simplify = `${n} ${s.items} in ${t} minutes is the same rate as ${u} ${s.items} every ${v} minutes (divide both by ${i}).`;
        if (rng() < 0.5) {
          return {
            prompt: `${s.did(n, t)}. At that rate, how many ${s.items} ${s.does} in ${v * j} minutes?`,
            answer: { kind: 'number', value: u * j },
            hints: [
              `${v * j} is not a multiple of ${t}, so shrink the rate first. What is the smallest whole-number version of "${n} ${s.items} in ${t} minutes"?`,
              `It is ${u} ${s.items} every ${v} minutes. How many lots of ${v} minutes are in ${v * j} minutes?`,
            ],
            solution: [
              { text: simplify },
              { text: `${v * j} minutes is ${v * j} ÷ ${v} = ${j} lots of ${v} minutes, so the answer is ${j} × ${u} = ${u * j} ${s.items}.` },
            ],
          };
        }
        return {
          prompt: `${s.did(n, t)}. At that rate, how many minutes does it take ${s.todo} ${u * j} ${s.items}?`,
          answer: { kind: 'number', value: v * j },
          hints: [
            `Shrink the rate first. What is the smallest whole-number version of "${n} ${s.items} in ${t} minutes"?`,
            `It is ${u} ${s.items} every ${v} minutes. How many lots of ${u} ${s.items} are in ${u * j}?`,
          ],
          solution: [
            { text: simplify },
            { text: `${u * j} ${s.items} is ${u * j} ÷ ${u} = ${j} lots of ${u}, and each lot takes ${v} minutes: ${j} × ${v} = ${v * j} minutes.` },
          ],
        };
      },
    },
    {
      id: 'rates/convert',
      idea: 'Let the units cancel',
      buildsOn: 'rates/unit-rate',
      generate: rng => {
        const variant = int(rng, 0, 3);
        const k = int(rng, 1, 6);
        if (variant === 0) {
          const [v, answer] = [15 * k, 22 * k];
          return {
            prompt: `A car travels at ${v} miles per hour. How many feet per second is that? (1 mile = 5,280 feet)`,
            answer: { kind: 'number', value: answer },
            hints: [
              'Change miles to feet and hours to seconds, one at a time. Which way does each one push the number?',
              `Multiply by 5,280 feet per mile, then divide by 3,600 seconds per hour. Cancel before you multiply.`,
            ],
            solution: [
              {
                text: 'Multiply by fractions equal to 1, chosen so that miles and hours cancel.',
                visual: working([
                  { text: `${v} miles/hour` },
                  { label: 'Miles to feet', text: `= ${v} × 5,280 feet/hour` },
                  { label: 'Hours to seconds', text: `= ${v} × 5,280 ÷ 3,600 feet/second` },
                  { label: 'Cancel', text: `= ${v} × 22 ÷ 15 = ${answer} feet/second` },
                ]),
              },
              { text: '5,280 ÷ 3,600 simplifies to 22/15 (divide both by 240). Worth remembering: 15 miles per hour is 22 feet per second, and 60 is 88.' },
            ],
          };
        }
        if (variant === 1) {
          const [v, answer] = [22 * k, 15 * k];
          return {
            prompt: `A ball is thrown at ${v} feet per second. How many miles per hour is that? (1 mile = 5,280 feet)`,
            answer: { kind: 'number', value: answer },
            hints: [
              'Change seconds to hours and feet to miles, one at a time.',
              'Multiply by 3,600 seconds per hour, then divide by 5,280 feet per mile. Cancel before you multiply.',
            ],
            solution: [
              {
                text: 'Multiply by fractions equal to 1, chosen so that feet and seconds cancel.',
                visual: working([
                  { text: `${v} feet/second` },
                  { label: 'Seconds to hours', text: `= ${v} × 3,600 feet/hour` },
                  { label: 'Feet to miles', text: `= ${v} × 3,600 ÷ 5,280 miles/hour` },
                  { label: 'Cancel', text: `= ${v} × 15 ÷ 22 = ${answer} miles/hour` },
                ]),
              },
              { text: '3,600 ÷ 5,280 simplifies to 15/22 (divide both by 240).' },
            ],
          };
        }
        if (variant === 2) {
          const [v, answer] = [18 * (k + 1), 5 * (k + 1)];
          return {
            prompt: `A train travels at ${v} kilometers per hour. How many meters per second is that?`,
            answer: { kind: 'number', value: answer },
            hints: [
              'There are 1,000 meters in a kilometer and 3,600 seconds in an hour.',
              'Multiply by 1,000, then divide by 3,600. Cancel before you multiply.',
            ],
            solution: [
              {
                text: 'Multiply by fractions equal to 1, chosen so that kilometers and hours cancel.',
                visual: working([
                  { text: `${v} km/hour` },
                  { label: 'Km to meters', text: `= ${v} × 1,000 meters/hour` },
                  { label: 'Hours to seconds', text: `= ${v} × 1,000 ÷ 3,600 meters/second` },
                  { label: 'Cancel', text: `= ${v} × 5 ÷ 18 = ${answer} meters/second` },
                ]),
              },
              { text: '1,000 ÷ 3,600 simplifies to 5/18. Going the other way you multiply by 18/5, which is 3.6.' },
            ],
          };
        }
        const [v, answer] = [5 * (k + 1), 18 * (k + 1)];
        return {
          prompt: `A drone flies at ${v} meters per second. How many kilometers per hour is that?`,
          answer: { kind: 'number', value: answer },
          hints: [
            'There are 3,600 seconds in an hour and 1,000 meters in a kilometer.',
            'Multiply by 3,600, then divide by 1,000. Cancel before you multiply.',
          ],
          solution: [
            {
              text: 'Multiply by fractions equal to 1, chosen so that meters and seconds cancel.',
              visual: working([
                { text: `${v} meters/second` },
                { label: 'Seconds to hours', text: `= ${v} × 3,600 meters/hour` },
                { label: 'Meters to km', text: `= ${v} × 3,600 ÷ 1,000 km/hour` },
                { label: 'Cancel', text: `= ${v} × 18 ÷ 5 = ${answer} km/hour` },
              ]),
            },
            { text: '3,600 ÷ 1,000 simplifies to 18/5, which is 3.6.' },
          ],
        };
      },
    },
    {
      id: 'rates/square-units',
      idea: 'Convert every dimension',
      buildsOn: 'rates/convert',
      generate: rng => {
        const variant = int(rng, 0, 3);
        if (variant === 0) {
          const [a, b] = [int(rng, 2, 9), int(rng, 2, 9)];
          return {
            prompt: `A rectangular lawn measures ${a} yards by ${b} yards. What is its area in square feet?`,
            answer: { kind: 'number', value: 9 * a * b },
            hints: [
              'Change each side to feet before you multiply.',
              `The lawn is ${3 * a} feet by ${3 * b} feet.`,
            ],
            solution: [
              { text: `Convert each side: ${a} yards = ${3 * a} feet and ${b} yards = ${3 * b} feet.` },
              { text: `Area = ${3 * a} × ${3 * b} = ${fmt(9 * a * b)} square feet.` },
              { text: `The trap is to find ${a} × ${b} = ${a * b} square yards and multiply by 3. Each square yard is a 3-by-3 square of 9 square feet: ${a * b} × 9 = ${fmt(9 * a * b)}.` },
            ],
          };
        }
        if (variant === 1) {
          const n = int(rng, 2, 12);
          return {
            prompt: `A truck carries ${n} cubic yards of soil. How many cubic feet is that?`,
            answer: { kind: 'number', value: 27 * n },
            hints: [
              'Picture one cubic yard: a cube 1 yard long, 1 yard wide and 1 yard tall. What are its measurements in feet?',
              'It is 3 feet by 3 feet by 3 feet, so one cubic yard is 27 cubic feet.',
            ],
            solution: [
              { text: 'One cubic yard is a cube 3 feet long, 3 feet wide and 3 feet tall: 3 × 3 × 3 = 27 cubic feet. All three dimensions get converted.' },
              { text: `${n} cubic yards = ${n} × 27 = ${fmt(27 * n)} cubic feet.` },
            ],
          };
        }
        if (variant === 2) {
          const n = int(rng, 2, 9);
          return {
            prompt: `A poster has an area of ${n} square feet. What is its area in square inches?`,
            answer: { kind: 'number', value: 144 * n },
            hints: [
              'Picture one square foot. What are its side lengths in inches?',
              'It is 12 inches by 12 inches, so one square foot is 144 square inches.',
            ],
            solution: [
              { text: 'One square foot is a 12-inch by 12-inch square: 12 × 12 = 144 square inches, not 12.' },
              { text: `${n} square feet = ${n} × 144 = ${fmt(144 * n)} square inches.` },
            ],
          };
        }
        const [a, b, c] = [int(rng, 2, 5), int(rng, 2, 5), int(rng, 1, 3)];
        return {
          prompt: `A crate is ${a} yards long, ${b} yards wide and ${c} yard${c === 1 ? '' : 's'} tall. What is its volume in cubic feet?`,
          answer: { kind: 'number', value: 27 * a * b * c },
          hints: [
            'Change all three measurements to feet before you multiply.',
            `The crate is ${3 * a} feet by ${3 * b} feet by ${3 * c} feet.`,
          ],
          solution: [
            { text: `Convert every dimension: ${3 * a} feet by ${3 * b} feet by ${3 * c} feet.` },
            { text: `Volume = ${3 * a} × ${3 * b} × ${3 * c} = ${fmt(27 * a * b * c)} cubic feet.` },
            { text: `Or find ${a} × ${b} × ${c} = ${a * b * c} cubic yards and multiply by 27, since each cubic yard is 3 × 3 × 3 cubic feet.` },
          ],
        };
      },
    },
    {
      id: 'rates/joint',
      idea: 'Count the worker-days',
      buildsOn: 'rates/square-units',
      generate: rng => {
        const team = pick(rng, TEAMS);
        let w1: number, t1: number, w2: number, t2: number, g: number, m: number, out1: number, out2: number;
        do {
          [w1, t1, w2, t2] = [int(rng, 2, 8), int(rng, 2, 6), int(rng, 2, 9), int(rng, 2, 8)];
          g = gcd(w1 * t1, w2 * t2);
          m = int(rng, 1, 5);
          out1 = ((w1 * t1) / g) * m;
          out2 = ((w2 * t2) / g) * m;
        } while (w1 === w2 || t1 === t2 || w1 * t1 === w2 * t2 || out1 === w1 * t1 || out1 > 60 || out2 > 240);
        const [x, y] = [w1 * t1, w2 * t2];
        const [rn, rd] = reduce(out1, x);
        return {
          prompt: `${w1} ${team.who} ${team.made} ${out1} ${team.what} in ${t1} ${team.time}. Working at the same rate, how many ${team.what} do ${w2} ${team.who} ${team.made} in ${t2} ${team.time}?`,
          answer: { kind: 'number', value: out2 },
          hints: [
            `Both the number of ${team.who} and the number of ${team.time} change. Measure the work in ${team.unit}s: one of the ${team.who} working for one of the ${team.time}.`,
            `The first group puts in ${w1} × ${t1} = ${x} ${team.unit}s. The second puts in ${w2} × ${t2} = ${y}.`,
          ],
          solution: [
            { text: `Measure the work in ${team.unit}s. The first group puts in ${w1} × ${t1} = ${x} ${team.unit}s and gets ${out1} ${team.what}.` },
            {
              text:
                rd === 1
                  ? `So each ${team.unit} gives ${out1} ÷ ${x} = ${rn} ${team.what}.`
                  : `So each ${team.unit} gives ${out1}/${x}${gcd(out1, x) > 1 ? ` = ${frac(rn, rd)}` : ''} of ${team.one}.`,
            },
            { text: `The second group puts in ${w2} × ${t2} = ${y} ${team.unit}s: ${y} × ${frac(rn, rd)} = ${out2} ${team.what}.` },
          ],
        };
      },
    },
  ],
};

export const PROPORTION_LESSONS: Lesson[] = [ratios, percents, rates];
