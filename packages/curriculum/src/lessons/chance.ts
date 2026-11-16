// Realm IV: Probability — counting methods, "at least one", and expected value.
import type { Answer, Lesson, Visual } from './types.ts';
import { frac, fmt, int, pick, reduce, shuffle } from './util.ts';

const LOWEST = 'Give your answer as a fraction in lowest terms.';
const WHOLE_OR_FRACTION = 'Give your answer as a whole number or a fraction in lowest terms.';

type Row = { label?: string; text: string };
const working = (rows: Row[]): Visual => ({ kind: 'rows', rows });

const fact = (n: number): number => (n <= 1 ? 1 : n * fact(n - 1));
const choose = (n: number, k: number): number => {
  let out = 1;
  for (let i = 0; i < k; i++) out = (out * (n - i)) / (i + 1);
  return out;
};
const falling = (n: number, k: number) => Array.from({ length: k }, (_, i) => n - i).join(' × ');
/** "C(7, 2) = 7 × 6 ÷ 2 = 21", or just "5" when choosing one. */
const chooseText = (n: number, k: number) => (k === 1 ? `C(${n}, 1) = ${n}` : `C(${n}, ${k}) = ${falling(n, k)} ÷ ${fact(k)} = ${choose(n, k)}`);

const fraction = (n: number, d: number): Answer => {
  const [num, den] = reduce(n, d);
  return { kind: 'fraction', num, den };
};
/** "6/36 = 1/6", or just "5/36" when nothing cancels. */
function simplified(n: number, d: number): string {
  const [rn, rd] = reduce(n, d);
  return rd === d ? frac(rn, rd) : `${n}/${d} = ${frac(rn, rd)}`;
}
/** "1 − 25/36 = 11/36" */
const oneMinus = (n: number, d: number) => `1 − ${n}/${d} = ${simplified(d - n, d)}`;
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

const BAGS = [
  { thing: 'marbles', holder: 'A bag holds', x: 'red', y: 'blue' },
  { thing: 'socks', holder: 'A drawer holds', x: 'black', y: 'white' },
  { thing: 'jelly beans', holder: 'A jar holds', x: 'cherry', y: 'lemon' },
];

const PEOPLE = ['Amy', 'Ben', 'Cara', 'Dev', 'Eli', 'Fay', 'Gus', 'Hana', 'Ivan', 'Jo', 'Kai', 'Lena'];

// ── Probability by counting ──────────────────────────────────────────────────

const probCounting: Lesson = {
  topic: 'prob_counting',
  intro: [
    {
      text: 'Reach into a bag of 3 red and 2 blue marbles and grab two at once. What is the chance both are red? You could multiply 3/5 × 2/4. Or you could count: every pair of marbles is equally likely to be the one you grab, so count the pairs you want and divide by all the pairs. Both roads lead to 3/10.',
      visual: working([
        { label: 'Red pairs', text: 'C(3, 2) = 3' },
        { label: 'All pairs', text: 'C(5, 2) = 10' },
        { label: 'Probability', text: '3/10' },
      ]),
    },
    {
      text: 'Counting really pays off when the multiplying would need lots of orders. A committee of 3 is drawn at random from 4 boys and 5 girls. What is the chance it has exactly 2 girls? Choose the 2 girls, choose the 1 boy, and divide by all possible committees.',
      visual: working([
        { label: '2 of the girls', text: 'C(5, 2) = 10' },
        { label: '1 of the boys', text: 'C(4, 1) = 4' },
        { label: 'All committees', text: 'C(9, 3) = 84' },
        { label: 'Probability', text: '(10 × 4)/84 = 40/84 = 10/21' },
      ]),
    },
    {
      text: 'The same goes for arrangements. Five friends line up at random. What is the chance Amy and Ben end up side by side? There are 5! = 120 equally likely line-ups. Glue Amy and Ben together: 4! × 2 = 48 line-ups have them adjacent. So the probability is 48/120 = 2/5.',
    },
    {
      text: 'One rule keeps you safe: count the top and the bottom the same way. If the total counts ordered line-ups, the successes must be ordered line-ups too. If the total counts unordered groups, so must the successes. Mixing the two is the classic way to get an answer bigger than 1.',
    },
  ],
  rungs: [
    {
      id: 'prob_counting/pairs',
      idea: 'Count the groups you want, and all the groups',
      buildsOn: 'combinations/choose',
      generate: rng => {
        const bag = pick(rng, BAGS);
        const k = pick(rng, [2, 2, 3]);
        let x: number, y: number;
        do [x, y] = [int(rng, k + 1, 7), int(rng, 2, 6)];
        while (x === y);
        const t = x + y;
        const [fav, all] = [choose(x, k), choose(t, k)];
        const word = k === 2 ? 'two' : 'three';
        return {
          prompt: `${bag.holder} ${x} ${bag.x} and ${y} ${bag.y} ${bag.thing}. You grab ${word} of them at once, at random. What is the probability that ${k === 2 ? 'both' : 'all three'} are ${bag.x}? ${LOWEST}`,
          answer: fraction(fav, all),
          hints: [
            `Every group of ${word} is equally likely. How many groups of ${word} are there, and how many are all ${bag.x}?`,
            `All groups: C(${t}, ${k}). All-${bag.x} groups: C(${x}, ${k}).`,
          ],
          solution: [
            { text: `Every group of ${word} ${bag.thing} is equally likely to be grabbed, so count groups. Order does not matter, so these are combinations.` },
            {
              text: `The groups you want use only the ${x} ${bag.x} ones.`,
              visual: working([
                { label: `All ${bag.x}`, text: chooseText(x, k) },
                { label: 'All groups', text: chooseText(t, k) },
                { label: 'Probability', text: simplified(fav, all) },
              ]),
            },
            { text: `Multiplying gives the same thing: ${Array.from({ length: k }, (_, i) => `${x - i}/${t - i}`).join(' × ')}.` },
          ],
        };
      },
    },
    {
      id: 'prob_counting/committee',
      idea: 'Choose from each kind, then divide',
      buildsOn: 'prob_counting/pairs',
      generate: rng => {
        const story = pick(rng, [
          { a: 'boys', b: 'girls', where: 'A club has', group: 'committee' },
          { a: 'seventh graders', b: 'eighth graders', where: 'A math team has', group: 'group' },
          { a: 'red marbles', b: 'blue marbles', where: 'A bag holds', group: 'handful' },
        ]);
        let na: number, nb: number, ka: number, kb: number;
        do [na, nb, ka, kb] = [int(rng, 3, 6), int(rng, 3, 6), int(rng, 1, 2), int(rng, 1, 2)];
        while (ka + kb < 3 || na === nb);
        const k = ka + kb;
        const [ca, cb, all] = [choose(na, ka), choose(nb, kb), choose(na + nb, k)];
        return {
          prompt: `${story.where} ${na} ${story.a} and ${nb} ${story.b}. A ${story.group} of ${k} is chosen at random. What is the probability that it has exactly ${ka} of the ${story.a} and ${kb} of the ${story.b}? ${LOWEST}`,
          answer: fraction(ca * cb, all),
          hints: [
            `Every ${story.group} of ${k} is equally likely. Count the ones with the right mix, and count them all.`,
            `Right mix: C(${na}, ${ka}) × C(${nb}, ${kb}). All: C(${na + nb}, ${k}).`,
          ],
          solution: [
            { text: `Every ${story.group} of ${k} is equally likely, so count. To build one with the right mix, choose the ${story.a} and choose the ${story.b}, then multiply.` },
            {
              text: `The total ignores the two kinds: any ${k} of the ${na + nb}.`,
              visual: working([
                { label: cap(story.a), text: chooseText(na, ka) },
                { label: cap(story.b), text: chooseText(nb, kb) },
                { label: 'Right mix', text: `${ca} × ${cb} = ${ca * cb}` },
                { label: `All of size ${k}`, text: chooseText(na + nb, k) },
                { label: 'Probability', text: simplified(ca * cb, all) },
              ]),
            },
          ],
        };
      },
    },
    {
      id: 'prob_counting/lineups',
      idea: 'Arrangements over arrangements',
      buildsOn: 'permutations/together',
      generate: rng => {
        const n = int(rng, 4, 8);
        const names = shuffle(rng, PEOPLE).slice(0, n);
        const [a, b, c] = names;
        const list = `${names.slice(0, -1).join(', ')} and ${names[n - 1]}`;
        const total = fact(n);
        const variant = int(rng, 0, 3);
        const [event, fav, how] =
          variant === 0
            ? [`${a} and ${b} are next to each other`, 2 * fact(n - 1), `Glue ${a} and ${b} into one block: ${n - 1} things to arrange in ${n - 1}! = ${fmt(fact(n - 1))} ways, times 2 for their order inside the block. That is ${fmt(2 * fact(n - 1))}.`]
            : variant === 1
              ? [`${a} is at one of the two ends`, 2 * fact(n - 1), `Put ${a} at an end (2 choices), then arrange the other ${n - 1} people in ${n - 1}! = ${fmt(fact(n - 1))} ways. That is ${fmt(2 * fact(n - 1))}.`]
              : variant === 2
                ? [`${a} and ${b} are at the two ends`, 2 * fact(n - 2), `Put ${a} and ${b} on the ends (2 ways: which of them is on the left), then arrange the other ${n - 2} in the middle in ${n - 2}! = ${fmt(fact(n - 2))} ways. That is ${fmt(2 * fact(n - 2))}.`]
                : [`${a}, ${b} and ${c} are all together, in three places side by side`, 6 * fact(n - 2), `Glue the three into one block: ${n - 2} things to arrange in ${n - 2}! = ${fmt(fact(n - 2))} ways, times 3! = 6 for their order inside the block. That is ${fmt(6 * fact(n - 2))}.`];
        return {
          prompt: `${list} line up in a random order. What is the probability that ${event}? ${LOWEST}`,
          answer: fraction(fav, total),
          hints: [
            `All ${n}! line-ups are equally likely. How many of them have what you want?`,
            variant === 0 || variant === 3 ? 'Glue the people who must be together into a single block, and remember they can be ordered inside it.' : 'Place the people the question cares about first, then arrange everyone else.',
          ],
          solution: [
            { text: `There are ${n}! = ${fmt(total)} equally likely line-ups.` },
            { text: `Count the line-ups you want. ${how}` },
            { text: `Probability = ${simplified(fav, total)}. (Cancelling factorials is quicker than multiplying them out.)` },
          ],
        };
      },
    },
    {
      id: 'prob_counting/numbers',
      idea: 'Sort the pairs into kinds',
      buildsOn: 'prob_counting/committee',
      generate: rng => {
        const n = int(rng, 5, 12);
        const [odd, even] = [Math.ceil(n / 2), Math.floor(n / 2)];
        const all = choose(n, 2);
        const [oo, ee] = [choose(odd, 2), choose(even, 2)];
        const setup = `Two different whole numbers are chosen at random from 1 to ${n}.`;
        const counts = `From 1 to ${n} there are ${odd} odd numbers and ${even} even numbers, and C(${n}, 2) = ${all} possible pairs.`;
        const variant = int(rng, 0, 3);
        if (variant === 0) {
          return {
            prompt: `${setup} What is the probability that both are odd? ${LOWEST}`,
            answer: fraction(oo, all),
            hints: [`How many odd numbers are there from 1 to ${n}? How many pairs can be made from them?`, `Pairs of odd numbers: C(${odd}, 2). All pairs: C(${n}, 2).`],
            solution: [{ text: counts }, { text: `Pairs with both odd: ${chooseText(odd, 2)}.` }, { text: `Probability = ${simplified(oo, all)}.` }],
          };
        }
        if (variant === 1) {
          return {
            prompt: `${setup} What is the probability that their sum is even? ${LOWEST}`,
            answer: fraction(oo + ee, all),
            hints: ['When is a sum of two numbers even?', `When both are odd or both are even. Count each kind of pair: C(${odd}, 2) and C(${even}, 2).`],
            solution: [
              { text: `A sum is even exactly when the two numbers are both odd or both even. ${counts}` },
              {
                text: 'Count each kind of pair and add.',
                visual: working([
                  { label: 'Both odd', text: chooseText(odd, 2) },
                  { label: 'Both even', text: chooseText(even, 2) },
                  { label: 'Even sum', text: `${oo} + ${ee} = ${oo + ee}` },
                  { label: 'Probability', text: simplified(oo + ee, all) },
                ]),
              },
            ],
          };
        }
        if (variant === 2) {
          return {
            prompt: `${setup} What is the probability that their product is even? ${LOWEST}`,
            answer: fraction(all - oo, all),
            hints: ['When is a product odd? That is the easier thing to count.', `Only when both numbers are odd: C(${odd}, 2) pairs. Everything else has an even product.`],
            solution: [
              { text: `A product is even unless both numbers are odd, so count the opposite. ${counts}` },
              { text: `Pairs with both odd: ${chooseText(odd, 2)}. So ${all} − ${oo} = ${all - oo} pairs have an even product.` },
              { text: `Probability = ${simplified(all - oo, all)}.` },
            ],
          };
        }
        return {
          prompt: `${setup} What is the probability that they are consecutive, like 3 and 4? ${LOWEST}`,
          answer: fraction(n - 1, all),
          hints: ['List the consecutive pairs by their smaller number: 1 and 2, 2 and 3, …', `The last one is ${n - 1} and ${n}, so there are ${n - 1}. All pairs: C(${n}, 2).`],
          solution: [
            { text: `The consecutive pairs are (1, 2), (2, 3), and so on up to (${n - 1}, ${n}): one for each smaller number from 1 to ${n - 1}, so ${n - 1} pairs.` },
            { text: `All pairs: ${chooseText(n, 2)}.` },
            { text: `Probability = ${simplified(n - 1, all)}.` },
          ],
        };
      },
    },
  ],
};

// ── At least one ─────────────────────────────────────────────────────────────

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six'];
const power = (b: string, n: number) => Array(n).fill(b).join(' × ');

const probComplement: Lesson = {
  topic: 'prob_complement',
  intro: [
    {
      text: 'Something either happens or it does not, so the two probabilities add up to 1. That means P(it happens) = 1 − P(it does not). This is complementary counting again, wearing probability clothes, and "at least one" is again the signal to use it.',
    },
    {
      text: 'Roll a die twice. What is the chance of at least one 6? Tempting: 1/6 + 1/6 = 1/3. But that counts the roll (6, 6) twice. Worse, by the same logic seven rolls would give a probability of 7/6. Instead find the chance of no 6 at all, which is a single multiplication, and subtract from 1.',
      visual: working([
        { label: 'No 6, one roll', text: '5/6' },
        { label: 'No 6, both rolls', text: '5/6 × 5/6 = 25/36' },
        { label: 'At least one 6', text: '1 − 25/36 = 11/36' },
      ]),
    },
    {
      text: 'It works the same without replacement. A bag holds 4 red and 3 blue marbles and you draw two. The chance of at least one red is 1 minus the chance of two blues.',
      visual: working([
        { label: 'Both blue', text: '3/7 × 2/6 = 6/42 = 1/7' },
        { label: 'At least one red', text: '1 − 1/7 = 6/7' },
      ]),
    },
    {
      text: 'And when the chances differ. Ana makes a free throw with probability 2/3 and Ben with probability 3/4. Each shoots once. For "at least one goes in", flip every probability to its miss: 1/3 and 1/4. Both miss with probability 1/3 × 1/4 = 1/12, so at least one goes in with probability 11/12.',
    },
  ],
  rungs: [
    {
      id: 'prob_complement/repeat',
      idea: 'One minus the chance of none',
      buildsOn: 'prob_compound/independent',
      generate: rng => {
        const variant = int(rng, 0, 2);
        if (variant === 0) {
          const n = int(rng, 2, 6);
          const face = pick(rng, ['heads', 'tails']);
          const other = face === 'heads' ? 'tails' : 'heads';
          const d = 2 ** n;
          return {
            prompt: `A fair coin is flipped ${n} times. What is the probability of getting ${face} at least once? ${LOWEST}`,
            answer: fraction(d - 1, d),
            hints: [`What is the only way to get no ${face} at all?`, `Every flip must be ${other}: ${power('1/2', n)}. Subtract that from 1.`],
            solution: [
              { text: `The opposite of "${face} at least once" is "no ${face} at all", which means ${other} on every flip.` },
              { text: `That has probability ${power('1/2', n)} = 1/${d}.` },
              { text: `So the answer is ${oneMinus(1, d)}.` },
            ],
          };
        }
        if (variant === 1) {
          const n = pick(rng, [2, 2, 3]);
          const e = pick(rng, [
            { event: 'a 6', miss: 5, why: '5 of the 6 faces are not a 6' },
            { event: 'a number greater than 4', miss: 4, why: '4 of the 6 faces are 4 or less' },
            { event: 'a 1 or a 2', miss: 4, why: '4 of the 6 faces are neither' },
            { event: 'a multiple of 3', miss: 4, why: '4 of the 6 faces are not multiples of 3' },
          ]);
          const [mn, md] = reduce(e.miss, 6);
          const [top, bottom] = [mn ** n, md ** n];
          return {
            prompt: `A fair die is rolled ${WORDS[n]} times. What is the probability of rolling ${e.event} at least once? ${LOWEST}`,
            answer: fraction(bottom - top, bottom),
            hints: [
              `Find the probability that it never happens. On one roll, what is the chance of not getting ${e.event}?`,
              `On one roll: ${e.miss}/6${md === 6 ? '' : ` = ${mn}/${md}`}. Then multiply for all ${n} rolls and subtract from 1.`,
            ],
            solution: [
              { text: `Find the chance that it never happens. On one roll, ${e.why}, so the chance of missing is ${e.miss}/6${md === 6 ? '' : ` = ${mn}/${md}`}.` },
              { text: `Missing on ${n === 2 ? 'both' : `all ${n}`} rolls: ${power(`${mn}/${md}`, n)} = ${top}/${bottom}.` },
              { text: `At least once: ${oneMinus(top, bottom)}.` },
            ],
          };
        }
        const s = pick(rng, [3, 4, 5, 8]);
        const n = pick(rng, [2, 2, 3]);
        const [top, bottom] = [(s - 1) ** n, s ** n];
        return {
          prompt: `A spinner has ${s} equal sections, exactly one of which is red. It is spun ${WORDS[n]} times. What is the probability that it lands on red at least once? ${LOWEST}`,
          answer: fraction(bottom - top, bottom),
          hints: ['Find the probability that it never lands on red.', `One spin misses red with probability ${s - 1}/${s}. Multiply for ${n} spins, then subtract from 1.`],
          solution: [
            { text: `One spin misses red with probability ${s - 1}/${s}.` },
            { text: `${n === 2 ? 'Both' : `All ${n}`} spins miss: ${power(`${s - 1}/${s}`, n)} = ${top}/${bottom}.` },
            { text: `At least one red: ${oneMinus(top, bottom)}.` },
          ],
        };
      },
    },
    {
      id: 'prob_complement/draws',
      idea: 'None, without replacement',
      buildsOn: 'prob_complement/repeat',
      generate: rng => {
        const bag = pick(rng, BAGS);
        const k = pick(rng, [2, 2, 3]);
        let x: number, y: number;
        do [x, y] = [int(rng, 2, 6), int(rng, k + 1, 7)];
        while (x === y);
        const t = x + y;
        const fracs: [number, number][] = Array.from({ length: k }, (_, i) => [y - i, t - i]);
        const [n, d] = [fracs.reduce((a, f) => a * f[0], 1), fracs.reduce((a, f) => a * f[1], 1)];
        const [rn, rd] = reduce(n, d);
        return {
          prompt: `${bag.holder} ${x} ${bag.x} and ${y} ${bag.y} ${bag.thing}. ${cap(WORDS[k])} are drawn at random without replacement. What is the probability that at least one of them is ${bag.x}? ${LOWEST}`,
          answer: fraction(d - n, d),
          hints: [
            `What is the opposite of "at least one is ${bag.x}"?`,
            `All ${k} are ${bag.y}: ${fracs.map(f => `${f[0]}/${f[1]}`).join(' × ')}. Subtract that from 1.`,
          ],
          solution: [
            { text: `The opposite of "at least one is ${bag.x}" is "every one is ${bag.y}". Find that, updating the odds after each draw.` },
            {
              text: 'Then subtract from 1.',
              visual: working([
                { label: `All ${bag.y}`, text: `${fracs.map(f => `${f[0]}/${f[1]}`).join(' × ')} = ${n}/${d}${rd === d ? '' : ` = ${frac(rn, rd)}`}` },
                { label: `At least one ${bag.x}`, text: oneMinus(rn, rd) },
              ]),
            },
          ],
        };
      },
    },
    {
      id: 'prob_complement/mixed',
      idea: 'Flip each chance to its miss',
      buildsOn: 'prob_complement/draws',
      generate: rng => {
        const three = rng() < 0.35;
        const names = shuffle(rng, PEOPLE).slice(0, three ? 3 : 2);
        const chances = shuffle(rng, [[1, 2], [2, 3], [3, 4], [1, 3], [3, 5], [4, 5], [2, 5], [1, 4]] as [number, number][]).slice(0, names.length);
        const story = pick(rng, [
          { does: 'makes a free throw', each: 'Each of them takes one shot', event: 'at least one shot goes in', miss: 'misses' },
          { does: 'solves the puzzle', each: 'Each of them works on it alone', event: 'at least one of them solves it', miss: 'fails' },
          { does: 'hits the target', each: 'Each of them throws one dart', event: 'at least one dart hits the target', miss: 'misses' },
        ]);
        const misses: [number, number][] = chances.map(([a, b]) => [b - a, b]);
        const [n, d] = [misses.reduce((p, f) => p * f[0], 1), misses.reduce((p, f) => p * f[1], 1)];
        const [rn, rd] = reduce(n, d);
        const told = names.map((nm, i) => `${nm} ${story.does} with probability ${chances[i][0]}/${chances[i][1]}`);
        return {
          prompt: `${told.length === 2 ? told.join(', and ') : `${told[0]}, ${told[1]}, and ${told[2]}`}. ${story.each}. What is the probability that ${story.event}? ${LOWEST}`,
          answer: fraction(d - n, d),
          hints: [
            `Find the probability that everyone ${story.miss}. What is each person's chance of that?`,
            `${names.map((nm, i) => `${nm} ${story.miss} with probability ${misses[i][0]}/${misses[i][1]}`).join(', ')}. Multiply, then subtract from 1.`,
          ],
          solution: [
            { text: `The opposite of "${story.event}" is "everyone ${story.miss}". Flip each probability: someone who succeeds with probability a/b ${story.miss} with probability 1 − a/b.` },
            {
              text: 'Multiply the misses, then subtract from 1.',
              visual: working([
                ...names.map((nm, i) => ({ label: `${nm} ${story.miss}`, text: `1 − ${chances[i][0]}/${chances[i][1]} = ${misses[i][0]}/${misses[i][1]}` })),
                { label: 'All miss', text: `${misses.map(f => `${f[0]}/${f[1]}`).join(' × ')} = ${n}/${d}${rd === d ? '' : ` = ${frac(rn, rd)}`}` },
                { label: 'At least one', text: oneMinus(rn, rd) },
              ]),
            },
          ],
        };
      },
    },
    {
      id: 'prob_complement/match',
      idea: '"Some match" is one minus "all different"',
      buildsOn: 'complementary/repeats',
      generate: rng => {
        const variant = int(rng, 0, 2);
        const [n, s, setup, event, thing] =
          variant === 0
            ? (() => {
                const k = pick(rng, [3, 3, 4]);
                return [k, 6, `${cap(WORDS[k])} fair dice are rolled.`, 'at least two of them show the same number', 'die'] as const;
              })()
            : variant === 1
              ? (() => {
                  const k = pick(rng, [3, 3, 4]);
                  return [k, 12, `${cap(WORDS[k])} friends each name the month they were born in. Assume every month is equally likely for each of them.`, 'at least two of them were born in the same month', 'friend'] as const;
                })()
              : (() => {
                  const k = pick(rng, [3, 3, 4]);
                  const sides = pick(rng, [5, 8, 10]);
                  return [k, sides, `${cap(WORDS[k])} people each secretly pick a whole number from 1 to ${sides}, at random.`, 'at least two of them pick the same number', 'person'] as const;
                })();
        const fracs: [number, number][] = Array.from({ length: n }, (_, i) => [s - i, s]);
        const [top, bottom] = [fracs.reduce((a, f) => a * f[0], 1), s ** n];
        const [rn, rd] = reduce(top, bottom);
        return {
          prompt: `${setup} What is the probability that ${event}? ${LOWEST}`,
          answer: fraction(bottom - top, bottom),
          hints: [
            'The opposite of "at least two the same" is "all different". That is the easier one.',
            `Take them one at a time. The first ${thing} can be anything: ${s}/${s}. The second must avoid the first: ${s - 1}/${s}. Keep going, multiply, and subtract from 1.`,
          ],
          solution: [
            { text: 'Count the opposite: all different. Take them one at a time, each one having to avoid everything that came before.' },
            {
              text: `The first can be anything. Each one after that has one fewer safe choice out of ${s}.`,
              visual: working([
                ...fracs.map((f, i) => ({ label: `${['1st', '2nd', '3rd', '4th'][i]} ${thing}`, text: i === 0 ? `${s}/${s} = 1` : `${f[0]}/${f[1]}` })),
                { label: 'All different', text: `${fracs.slice(1).map(f => `${f[0]}/${f[1]}`).join(' × ')}${n > 2 ? ` = ${top / s}/${bottom / s}` : ''}${rd === bottom / s ? '' : ` = ${frac(rn, rd)}`}` },
                { label: 'Some match', text: oneMinus(rn, rd) },
              ]),
            },
          ],
        };
      },
    },
  ],
};

// ── Expected value ───────────────────────────────────────────────────────────

const plus = (xs: (number | string)[]) => xs.join(' + ');

const expectedValue: Lesson = {
  topic: 'expected_value',
  intro: [
    {
      text: 'Roll a die and win as many dollars as the number showing. One roll could pay anything from $1 to $6. But play 600 times and you would expect each face about 100 times, for about $2,100 in total, which is $3.50 a game. That long-run average is called the expected value. When the outcomes are equally likely, it is simply their mean.',
      visual: working([
        { label: 'Outcomes', text: '1, 2, 3, 4, 5, 6' },
        { label: 'Mean', text: '21 ÷ 6 = 7/2' },
        { label: 'Expected value', text: '$3.50 per game' },
      ]),
    },
    {
      text: 'The expected value does not have to be something that can actually happen. No roll pays $3.50. It is an average, not a prediction.',
    },
    {
      text: 'When the outcomes are not equally likely, weight each one by its probability: multiply each value by its chance and add. A spinner pays $2 half the time, $6 a third of the time and $12 a sixth of the time.',
      visual: working([
        { label: '$2, half the time', text: '2 × 1/2 = 1' },
        { label: '$6, a third', text: '6 × 1/3 = 2' },
        { label: '$12, a sixth', text: '12 × 1/6 = 2' },
        { label: 'Expected value', text: '1 + 2 + 2 = $5' },
      ]),
    },
    {
      text: 'This tells you what a game is worth. If that spinner costs $5 a spin, the game is fair: in the long run nobody comes out ahead. At $6 a spin you lose a dollar per game on average. A raffle that sells 100 tickets for one $60 prize gives each ticket an expected value of 60 × 1/100 = $0.60.',
    },
    {
      text: 'A lovely shortcut: expected values add. The expected total of two dice is 3.5 + 3.5 = 7, with no need to think about the 36 rolls. And if something has probability p each time you try, the expected number of successes in n tries is n × p. Flip 10 coins and you expect 10 × 1/2 = 5 heads.',
    },
  ],
  rungs: [
    {
      id: 'expected_value/equal',
      idea: 'Equally likely: take the mean',
      buildsOn: 'statistics/total',
      generate: rng => {
        const count = pick(rng, [4, 5, 6, 8]);
        let values: number[];
        do values = Array.from({ length: count }, () => int(rng, 1, 12));
        while (new Set(values).size < count - 1);
        values.sort((a, b) => a - b);
        const total = values.reduce((a, b) => a + b, 0);
        const die = count === 6 || count === 8 ? rng() < 0.6 : false;
        return {
          prompt: `${die ? `A fair ${count}-sided die has faces numbered ${values.join(', ')}. It is rolled once.` : `A hat holds ${count} slips of paper numbered ${values.join(', ')}. One slip is drawn at random.`} What is the expected value of the number ${die ? 'rolled' : 'drawn'}? ${WHOLE_OR_FRACTION}`,
          answer: fraction(total, count),
          hints: [`All ${count} outcomes are equally likely, so the expected value is their mean.`, `Add them up and divide by ${count}. The total is ${total}.`],
          solution: [
            { text: `Each of the ${count} numbers is equally likely, so the expected value is just their mean.` },
            { text: `${plus(values)} = ${total}, and ${total} ÷ ${count} = ${frac(...reduce(total, count))}.` },
          ],
        };
      },
    },
    {
      id: 'expected_value/weighted',
      idea: 'Weight each outcome by its chance',
      buildsOn: 'expected_value/equal',
      generate: rng => {
        const sections = pick(rng, [6, 8, 10, 12]);
        let parts: number[], prizes: number[];
        do {
          const a = int(rng, 1, sections - 2);
          const b = int(rng, 1, sections - a - 1);
          parts = [a, b, sections - a - b];
          prizes = [int(rng, 0, 4), int(rng, 2, 10), int(rng, 5, 24)];
        } while (new Set(prizes).size < 3 || new Set(parts).size < 2);
        const total = parts.reduce((s, p, i) => s + p * prizes[i], 0);
        const said = parts.map((p, i) => `${p} ${p === 1 ? 'is' : 'are'} marked $${prizes[i]}`);
        return {
          prompt: `A spinner has ${sections} equal sections: ${said[0]}, ${said[1]} and ${said[2]}. You win the amount it lands on. What is the expected value of one spin, in dollars? ${WHOLE_OR_FRACTION}`,
          answer: fraction(total, sections),
          hints: [
            'Multiply each prize by its probability, then add.',
            `The probabilities are ${parts.map(p => `${p}/${sections}`).join(', ')}. It is easiest to add up prize × sections first and divide by ${sections} at the end.`,
          ],
          solution: [
            { text: `Each prize has probability (its number of sections)/${sections}. Multiply each prize by its probability and add.` },
            {
              text: `Every term is over ${sections}, so add the tops first.`,
              visual: working([
                ...parts.map((p, i) => ({ label: `$${prizes[i]}`, text: `${prizes[i]} × ${p}/${sections} = ${prizes[i] * p}/${sections}` })),
                { label: 'Expected value', text: `${parts.map((p, i) => prizes[i] * p).join(' + ')} = ${total}, and ${simplified(total, sections)}` },
              ]),
            },
            { text: `Another way to see it: imagine all ${sections} sections coming up once each. The prizes would total $${total}, an average of ${frac(...reduce(total, sections))} dollars per spin.` },
          ],
        };
      },
    },
    {
      id: 'expected_value/fair',
      idea: 'What a game is worth',
      buildsOn: 'expected_value/weighted',
      generate: rng => {
        const variant = int(rng, 0, 2);
        if (variant === 0) {
          const tickets = pick(rng, [50, 100, 200, 250, 500]);
          const [big, small, smalls] = [pick(rng, [100, 150, 200, 300]), pick(rng, [10, 20, 25, 50]), int(rng, 2, 5)];
          const total = big + small * smalls;
          return {
            prompt: `A raffle sells ${tickets} tickets. One ticket wins $${big}, ${smalls} other tickets win $${small} each, and the rest win nothing. What is the expected value of one ticket, in dollars? ${WHOLE_OR_FRACTION}`,
            answer: fraction(total, tickets),
            hints: ['How much prize money is given out in all? Share it over all the tickets.', `The prizes total $${big} + ${smalls} × $${small} = $${total}, spread across ${tickets} tickets.`],
            solution: [
              { text: `Each ticket has a 1/${tickets} chance at the big prize and a ${smalls}/${tickets} chance at a small one.` },
              { text: `Expected value = ${big} × 1/${tickets} + ${small} × ${smalls}/${tickets} = ${total}/${tickets}${reduce(total, tickets)[1] === tickets ? '' : ` = ${frac(...reduce(total, tickets))}`} dollars.` },
              { text: `The shortcut: $${total} in prizes shared over ${tickets} equally lucky tickets. If a ticket costs more than that, the raffle makes money.` },
            ],
          };
        }
        if (variant === 1) {
          const e = pick(rng, [
            { event: 'a 6', k: 1 },
            { event: 'a 5 or a 6', k: 2 },
            { event: 'an even number', k: 3 },
          ]);
          const prize = int(rng, 2, 15);
          return {
            prompt: `In a carnival game you roll a fair die. If you roll ${e.event} you win $${prize}; otherwise you win nothing. How many dollars should the game cost to play if it is to be fair? ${WHOLE_OR_FRACTION}`,
            answer: fraction(prize * e.k, 6),
            hints: ['A fair game costs exactly its expected value.', `You win $${prize} with probability ${e.k}/6 and $0 the rest of the time.`],
            solution: [
              { text: 'A game is fair when its price equals the expected value of what it pays.' },
              { text: `You win $${prize} with probability ${e.k}/6, and nothing otherwise: ${prize} × ${e.k}/6 + 0 = ${simplified(prize * e.k, 6)} dollars.` },
            ],
          };
        }
        const k = pick(rng, [4, 5, 6, 8, 10, 12]);
        const cost = int(rng, 2, 9);
        return {
          prompt: `A game costs $${cost} to play. You win a prize with probability 1/${k}, and otherwise you get nothing. How many dollars must the prize be for the game to be fair?`,
          answer: { kind: 'number', value: cost * k },
          hints: ['A fair game costs exactly its expected value.', `If the prize is P dollars, the expected value is P × 1/${k}. Set that equal to ${cost}.`],
          solution: [
            { text: `If the prize is P dollars, the expected value of a game is P × 1/${k}.` },
            { text: `For a fair game that must equal the price: P/${k} = ${cost}, so P = ${cost} × ${k} = ${cost * k} dollars.` },
            { text: `It makes sense: you win about once every ${k} games, and those ${k} games cost you $${cost * k}.` },
          ],
        };
      },
    },
    {
      id: 'expected_value/linearity',
      idea: 'Expected values add',
      buildsOn: 'expected_value/fair',
      generate: rng => {
        const variant = int(rng, 0, 3);
        if (variant === 0) {
          const n = int(rng, 3, 12);
          return {
            prompt: `${cap(WORDS[n] ?? `${n}`)} fair dice are rolled and the numbers showing are added. What is the expected value of the total? ${WHOLE_OR_FRACTION}`,
            answer: fraction(7 * n, 2),
            hints: ['What is the expected value of one die?', `One die averages 7/2. Expected values add, so ${n} dice average ${n} × 7/2.`],
            solution: [
              { text: 'One die has expected value (1 + 2 + 3 + 4 + 5 + 6) ÷ 6 = 7/2.' },
              { text: `Expected values add, so there is no need to think about all the possible rolls: ${n} × 7/2 = ${frac(...reduce(7 * n, 2))}.` },
            ],
          };
        }
        if (variant === 1) {
          const [k, d] = pick(rng, [[1, 6], [1, 3], [1, 2], [2, 3]] as const);
          const event = k === 1 && d === 6 ? 'a 6' : k === 1 && d === 3 ? 'a 5 or a 6' : k === 1 ? 'an even number' : 'a number greater than 2';
          const n = int(rng, 5, 40);
          return {
            prompt: `A fair die is rolled ${n} times. What is the expected number of rolls that show ${event}? ${WHOLE_OR_FRACTION}`,
            answer: fraction(n * k, d),
            hints: [`What is the probability that a single roll shows ${event}?`, `It is ${k}/${d}. The expected count in ${n} rolls is ${n} × ${k}/${d}.`],
            solution: [
              { text: `One roll shows ${event} with probability ${k}/${d}.` },
              { text: `Each roll adds ${k}/${d} of a success on average, so ${n} rolls give ${n} × ${k}/${d} = ${frac(...reduce(n * k, d))}.` },
            ],
          };
        }
        if (variant === 2) {
          const choices = pick(rng, [3, 4, 5]);
          const n = int(rng, 8, 40);
          return {
            prompt: `A quiz has ${n} multiple-choice questions, each with ${choices} choices. Milo guesses at random on every question. What is the expected number of questions he gets right? ${WHOLE_OR_FRACTION}`,
            answer: fraction(n, choices),
            hints: ['What is the probability that he guesses a single question right?', `It is 1/${choices}. The expected count over ${n} questions is ${n} × 1/${choices}.`],
            solution: [
              { text: `Each guess is right with probability 1/${choices}.` },
              { text: `The expected number right is ${n} × 1/${choices} = ${frac(...reduce(n, choices))}.` },
            ],
          };
        }
        const [a, b] = pick(rng, [[2, 3], [3, 4], [3, 5], [4, 5], [5, 8], [7, 10]] as const);
        const n = int(rng, 6, 40);
        return {
          prompt: `A basketball player makes each free throw with probability ${a}/${b}. What is the expected number of shots she makes in ${n} attempts? ${WHOLE_OR_FRACTION}`,
          answer: fraction(n * a, b),
          hints: ['Each attempt adds its probability to the expected count.', `The expected count is ${n} × ${a}/${b}.`],
          solution: [
            { text: `Each attempt goes in with probability ${a}/${b}, so each adds ${a}/${b} to the expected count.` },
            { text: `${n} × ${a}/${b} = ${simplified(n * a, b)}.` },
          ],
        };
      },
    },
  ],
};

export const CHANCE_LESSONS: Lesson[] = [probCounting, probComplement, expectedValue];
