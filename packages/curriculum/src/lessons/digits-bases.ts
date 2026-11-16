// Realm V: Number Theory — digit problems, repeating decimals, and number bases.
import type { Lesson, Step } from './types.ts';
import { LOWEST, choices, factored, factorize, fmt, frac, int, pick, pow, reduce, shuffle, working } from './util.ts';

// ── Digit Problems ───────────────────────────────────────────────────────────

const digits: Lesson = {
  topic: 'digits',
  intro: [
    {
      text: 'The number 73 is not "7 and 3". It is 7 tens and 3 ones: 10 × 7 + 3. That is the whole secret of digit problems. Call the tens digit a and the units digit b, write the number as 10a + b, and a puzzle about digits becomes ordinary algebra.',
      visual: working([
        { label: 'Two digits', text: '"ab" = 10a + b' },
        { label: 'Three digits', text: '"abc" = 100a + 10b + c' },
        { label: 'Reversed', text: '"ba" = 10b + a' },
      ]),
    },
    {
      text: 'Try it: reversing the digits of a two-digit number makes it 27 larger, and the digits add up to 9. Subtract the original from the reversed number and watch what happens.',
      visual: working([
        { label: 'Reversed − original', text: '(10b + a) − (10a + b) = 27' },
        { label: 'Simplify', text: '9b − 9a = 27, so b − a = 3' },
        { label: 'Also', text: 'a + b = 9' },
        { label: 'Solve', text: 'b = 6 and a = 3: the number is 36' },
      ]),
    },
    {
      text: 'That simplification is worth remembering on its own. A two-digit number and its reversal always differ by 9 times the difference of the digits: 82 − 28 = 54 = 9 × 6. And they always ADD to 11 times the sum of the digits: 82 + 28 = 110 = 11 × 10.',
      visual: working([
        { label: 'Difference', text: '(10a + b) − (10b + a) = 9(a − b)' },
        { label: 'Sum', text: '(10a + b) + (10b + a) = 11(a + b)' },
      ]),
    },
    {
      text: 'One more: subtract the sum of the digits from any number and the result is a multiple of 9, since (10a + b) − (a + b) = 9a. This is the real reason the divisibility test for 9 works. Remember that digits are whole numbers from 0 to 9, and a leading digit cannot be 0. Those limits often pin down the answer when the algebra alone does not.',
    },
  ],
  rungs: [
    {
      id: 'digits/expanded',
      idea: 'Name the digits and translate',
      buildsOn: 'equations/translate',
      generate: rng => {
        if (rng() < 0.6) {
          const a = int(rng, 1, 9);
          let b = int(rng, 0, 9);
          if (b === a) b = (b + 2) % 10;
          const [s, d] = [a + b, Math.abs(a - b)];
          return {
            prompt: `The digits of a two-digit number add up to ${s}. Its tens digit is ${d} ${a > b ? 'more' : 'less'} than its units digit. What is the number?`,
            answer: { kind: 'number', value: 10 * a + b },
            hints: [
              `Call the tens digit a and the units digit b. Then a + b = ${s} and ${a > b ? `a − b = ${d}` : `b − a = ${d}`}.`,
              'Add the two equations to eliminate one digit.',
            ],
            solution: [
              {
                text: 'Name the digits, then solve the sum-and-difference system.',
                visual: working([
                  { label: 'Sum', text: `a + b = ${s}` },
                  { label: 'Difference', text: a > b ? `a − b = ${d}` : `b − a = ${d}` },
                  { label: 'Add', text: a > b ? `2a = ${s + d}, so a = ${a}` : `2b = ${s + d}, so b = ${b}` },
                  { label: 'Other digit', text: a > b ? `b = ${s} − ${a} = ${b}` : `a = ${s} − ${b} = ${a}` },
                ]),
              },
              { text: `The number is ${10 * a + b}. (The tens digit goes first.)` },
            ],
          };
        }
        const k = pick(rng, [2, 3, 4]);
        const small = int(rng, 1, Math.floor(9 / k));
        const tensBig = rng() < 0.5;
        const [a, b] = tensBig ? [k * small, small] : [small, k * small];
        const word = k === 2 ? 'twice' : k === 3 ? 'three times' : 'four times';
        return {
          prompt: `In a two-digit number, the ${tensBig ? 'tens' : 'units'} digit is ${word} the ${tensBig ? 'units' : 'tens'} digit, and the digits add up to ${a + b}. What is the number?`,
          answer: { kind: 'number', value: 10 * a + b },
          hints: [
            `Call the smaller digit x. The other digit is ${k}x.`,
            `x + ${k}x = ${a + b}, so x = ${small}.`,
          ],
          solution: [
            {
              text: 'Name the smaller digit x and write the other in terms of it.',
              visual: working([
                { label: 'Digits', text: `x and ${k}x` },
                { label: 'Sum', text: `${k + 1}x = ${a + b}, so x = ${small}` },
                { label: 'Digits', text: `tens digit ${a}, units digit ${b}` },
              ]),
            },
            { text: `The number is ${10 * a + b}.` },
          ],
        };
      },
    },
    {
      id: 'digits/reverse',
      idea: 'Reversing changes a number by a multiple of 9',
      buildsOn: 'digits/expanded',
      generate: rng => {
        const a = int(rng, 1, 9);
        let b = int(rng, 1, 9);
        if (b === a) b = a === 9 ? 5 : a + 1;
        const n = 10 * a + b;
        const rev = 10 * b + a;
        const diff = Math.abs(n - rev);
        const bigger = rev > n;
        return {
          prompt: `When the digits of a two-digit number are reversed, the new number is ${diff} ${bigger ? 'greater' : 'less'} than the original. The digits of the original add up to ${a + b}. What is the original number?`,
          answer: { kind: 'number', value: n },
          hints: [
            `Write the original as 10a + b and the reversal as 10b + a. Their difference is 9 times the difference of the digits.`,
            `${diff} ÷ 9 = ${diff / 9}, so the digits differ by ${diff / 9}. The reversal is ${bigger ? 'greater' : 'less'}, so the ${bigger ? 'units' : 'tens'} digit is the larger one.`,
          ],
          solution: [
            {
              text: 'Subtract the two forms. Everything collapses to 9 times the gap between the digits.',
              visual: working([
                bigger
                  ? { label: 'Reversed − original', text: `(10b + a) − (10a + b) = 9(b − a) = ${diff}` }
                  : { label: 'Original − reversed', text: `(10a + b) − (10b + a) = 9(a − b) = ${diff}` },
                { label: 'Divide by 9', text: bigger ? `b − a = ${diff / 9}` : `a − b = ${diff / 9}` },
                { label: 'Sum', text: `a + b = ${a + b}` },
                { label: 'Solve', text: `a = ${a}, b = ${b}` },
              ]),
            },
            { text: `The original is ${n}. Check: ${Math.max(n, rev)} − ${Math.min(n, rev)} = ${diff}.` },
          ],
        };
      },
    },
    {
      id: 'digits/patterns',
      idea: 'Let the algebra expose the pattern',
      buildsOn: 'digits/reverse',
      generate: rng => {
        const variant = int(rng, 0, 2);
        if (variant === 0) {
          // 10a + b = k(a + b) has exactly one two-digit solution for these k.
          const [k, a, b] = pick(rng, [[2, 1, 8], [3, 2, 7], [5, 4, 5], [6, 5, 4], [8, 7, 2], [9, 8, 1]] as const);
          return {
            prompt: `A two-digit number is exactly ${k} times the sum of its digits. What is the number?`,
            answer: { kind: 'number', value: 10 * a + b },
            hints: [
              `Write it as 10a + b = ${k}(a + b) and collect the a terms and the b terms.`,
              `${10 - k}a = ${k - 1}b. Both are digits, and a is at least 1.`,
            ],
            solution: [
              {
                text: 'Translate and simplify.',
                visual: working([
                  { label: 'Translate', text: `10a + b = ${k}(a + b)` },
                  { label: 'Expand', text: `10a + b = ${k}a + ${k}b` },
                  { label: 'Collect', text: `${10 - k === 1 ? '' : 10 - k}a = ${k - 1 === 1 ? '' : k - 1}b` },
                ]),
              },
              { text: `One equation, two unknowns, but they are DIGITS. The only single digits that work are a = ${a} and b = ${b}, so the number is ${10 * a + b}. Check: ${k} × (${a} + ${b}) = ${10 * a + b}.` },
            ],
          };
        }
        if (variant === 1) {
          const a = int(rng, 3, 9);
          const c = int(rng, 1, a - 1);
          return {
            prompt: `A three-digit number has a hundreds digit that is ${a - c} more than its units digit. The digits are reversed and the new number is subtracted from the original. What is the result?`,
            answer: { kind: 'number', value: 99 * (a - c) },
            hints: [
              'Write the number as 100a + 10b + c and its reversal as 100c + 10b + a.',
              'Subtract: the middle digit cancels, leaving 99a − 99c.',
            ],
            solution: [
              {
                text: 'The middle digit never matters. It sits in the tens place both times.',
                visual: working([
                  { label: 'Original', text: '100a + 10b + c' },
                  { label: 'Reversed', text: '100c + 10b + a' },
                  { label: 'Subtract', text: '99a − 99c = 99(a − c)' },
                  { label: 'Here', text: `99 × ${a - c} = ${99 * (a - c)}` },
                ]),
              },
              { text: `Try one: ${a}0${c} − ${c}0${a} = ${a * 100 + c - (c * 100 + a)}.` },
            ],
          };
        }
        const a = int(rng, 2, 9);
        return {
          prompt: `When the sum of the digits of a two-digit number is subtracted from the number itself, the result is ${9 * a}. What is the tens digit of the number?`,
          answer: { kind: 'number', value: a },
          hints: ['Write the number as 10a + b and subtract a + b.', `The b cancels: 9a = ${9 * a}.`],
          solution: [
            {
              text: 'Translate and simplify. The units digit drops out completely.',
              visual: working([
                { label: 'Translate', text: `(10a + b) − (a + b) = ${9 * a}` },
                { label: 'Simplify', text: `9a = ${9 * a}` },
                { label: 'So', text: `a = ${a}` },
              ]),
            },
            { text: `Any of ${a}0, ${a}1, …, ${a}9 works, which is why the question could only ask for the tens digit.` },
          ],
        };
      },
    },
    {
      id: 'digits/how-many',
      idea: 'Count the numbers that fit',
      buildsOn: 'counting_lists/consecutive',
      generate: rng => {
        if (rng() < 0.5) {
          const s = int(rng, 4, 16);
          const count = s <= 10 ? s - 1 : 19 - s;
          const lo = Math.max(1, s - 9);
          const hi = Math.min(9, s - 1);
          return {
            prompt: `A two-digit number with no zero digit is added to the number formed by reversing its digits, and the total is ${11 * s}. How many two-digit numbers have this property?`,
            answer: { kind: 'number', value: count },
            hints: [
              `(10a + b) + (10b + a) = 11(a + b), so a + b = ${s}.`,
              `Count the ways to pick digits from 1 to 9 with a + b = ${s}. The tens digit can be anything from ${lo} to ${hi}.`,
            ],
            solution: [
              {
                text: 'The sum of a number and its reversal is 11 times the digit sum.',
                visual: working([
                  { label: 'Add', text: `11(a + b) = ${11 * s}` },
                  { label: 'Digit sum', text: `a + b = ${s}` },
                ]),
              },
              { text: `Both digits must be between 1 and 9. The tens digit a can be ${lo}, ${lo + 1}, …, ${hi}, and each choice fixes b. That is ${hi} − ${lo} + 1 = ${count} numbers, from ${lo}${s - lo} to ${hi}${s - hi}.` },
            ],
          };
        }
        const k = int(rng, 1, 7);
        return {
          prompt: `A two-digit number with no zero digit is ${9 * k} greater than the number formed by reversing its digits. How many two-digit numbers have this property?`,
          answer: { kind: 'number', value: 9 - k },
          hints: [
            `(10a + b) − (10b + a) = 9(a − b), so a − b = ${k}.`,
            `The units digit b can be 1, 2, …, up to whatever keeps a = b + ${k} at most 9.`,
          ],
          solution: [
            {
              text: 'The difference between a number and its reversal is 9 times the digit difference.',
              visual: working([
                { label: 'Subtract', text: `9(a − b) = ${9 * k}` },
                { label: 'Digit difference', text: `a − b = ${k}` },
              ]),
            },
            { text: `The units digit b can be 1, 2, …, ${9 - k}, giving tens digit b + ${k}. That is ${9 - k} numbers, from ${1 + k}1 to 9${9 - k}.` },
          ],
        };
      },
    },
  ],
};

// ── Repeating Decimals ───────────────────────────────────────────────────────

const TERMINATING = ['7/8', '3/16', '9/20', '11/25', '6/15', '9/12', '21/28', '14/35', '3/24', '7/40', '13/50', '27/36', '33/55', '9/75'];
const REPEATING = ['5/12', '7/15', '4/18', '5/6', '9/14', '10/21', '8/30', '15/36', '7/30', '11/24', '5/22', '4/9', '8/45', '13/60', '2/7', '25/60', '6/26', '12/27'];

/** The repeating block of num/den, where den shares no factor with 10. */
function repeatingBlock(num: number, den: number): number[] {
  const out: number[] = [];
  let r = num % den;
  const start = r;
  do {
    r *= 10;
    out.push(Math.floor(r / den));
    r %= den;
  } while (r !== start);
  return out;
}

const repeatingDecimals: Lesson = {
  topic: 'repeating_decimals',
  intro: [
    {
      text: 'Every fraction becomes a decimal that either stops (1/8 = 0.125) or repeats forever (1/3 = 0.333…). You can tell which without dividing. A decimal that stops is a fraction over a power of 10, and 10 = 2 × 5. So a fraction terminates exactly when its denominator, IN LOWEST TERMS, has no prime factors other than 2 and 5.',
      visual: working([
        { label: '7/40', text: '40 = 2³ × 5: terminates (0.175)' },
        { label: '5/12', text: '12 = 2² × 3: the 3 makes it repeat' },
        { label: '6/15', text: 'reduces to 2/5: terminates (0.4)' },
      ]),
    },
    {
      text: 'That last one is the classic trap. 15 contains a 3, but the 3 cancels with the numerator. Always reduce first.',
    },
    {
      text: 'Going the other way, how do you turn 0.272727… into a fraction? Name it x. Multiplying by 100 slides the decimal point exactly one block to the right, so 100x has the SAME infinite tail as x. Subtract and the tails cancel.',
      visual: working([
        { label: 'Name it', text: 'x = 0.272727…' },
        { label: 'Shift one block', text: '100x = 27.272727…' },
        { label: 'Subtract', text: '99x = 27' },
        { label: 'So', text: 'x = 27/99 = 3/11' },
      ]),
    },
    {
      text: 'The pattern: a repeating block goes over as many 9s as it has digits. 0.777… = 7/9, 0.272727… = 27/99, 0.135135… = 135/999. Then reduce.',
    },
    {
      text: 'If some digits come before the repeating part, shift twice. For x = 0.1666…, 10x = 1.666… and 100x = 16.666… have matching tails, so 90x = 15 and x = 1/6.',
      visual: working([
        { label: '100x', text: '16.666…' },
        { label: '10x', text: '1.666…' },
        { label: 'Subtract', text: '90x = 15' },
        { label: 'So', text: 'x = 15/90 = 1/6' },
      ]),
    },
  ],
  rungs: [
    {
      id: 'repeating_decimals/terminates',
      idea: 'Reduce, then look for primes other than 2 and 5',
      buildsOn: 'prime_factorization/factor',
      generate: rng => {
        const findRepeating = rng() < 0.35;
        const right = pick(rng, findRepeating ? REPEATING : TERMINATING);
        const wrong = shuffle(rng, findRepeating ? TERMINATING : REPEATING).slice(0, 3);
        const answer = choices(rng, right, wrong);
        const explain = (f: string): Step => {
          const [n, d] = f.split('/').map(Number);
          const [rn, rd] = reduce(n, d);
          const bad = factorize(rd).filter(([q]) => q !== 2 && q !== 5).map(([q]) => q);
          return {
            text: `${f}${rd === d ? '' : ` reduces to ${rn}/${rd}`}: the denominator is ${rd} = ${factored(factorize(rd))}. ${bad.length ? `The factor ${bad[0]} means it repeats.` : 'Only 2s and 5s, so it terminates.'}`,
          };
        };
        return {
          prompt: findRepeating
            ? 'Exactly one of these fractions has a decimal that repeats forever. Which one?'
            : 'Exactly one of these fractions has a decimal that terminates. Which one?',
          answer,
          hints: [
            'Reduce each fraction to lowest terms first. A factor in the denominator might cancel.',
            'Then factor each denominator. Only 2s and 5s means the decimal terminates.',
          ],
          solution: [
            { text: 'A fraction in lowest terms terminates exactly when its denominator has no prime factor other than 2 and 5.' },
            ...answer.options.map(explain),
          ],
        };
      },
    },
    {
      id: 'repeating_decimals/to-fraction',
      idea: 'A repeating block goes over 9s',
      buildsOn: 'fractions_decimals/cancel',
      generate: rng => {
        const len = pick(rng, [1, 2, 2, 2, 3]);
        let block: number;
        if (len === 1) block = int(rng, 1, 8);
        else if (len === 2) {
          block = int(rng, 1, 98);
          if (block % 11 === 0) block += 1;
        } else block = pick(rng, [135, 108, 216, 297, 351, 37, 74, 185, 259, 27, 54, 81, 162, 189, 243, 405, 111 * 3 + 12]);
        const text = String(block).padStart(len, '0');
        const nines = 10 ** len - 1;
        const [num, den] = reduce(block, nines);
        return {
          prompt: `Write 0.${text}${text}${text}… as a fraction. ${LOWEST}`,
          answer: { kind: 'fraction', num, den },
          hints: [
            `The repeating block is "${text}", which is ${len} digit${len === 1 ? '' : 's'} long. Multiply by ${fmt(10 ** len)} to shift exactly one block.`,
            `${fmt(nines)}x = ${block}. Now reduce.`,
          ],
          solution: [
            {
              text: `Name the decimal x and shift it one full block (${len} digit${len === 1 ? '' : 's'}).`,
              visual: working([
                { label: 'x', text: `0.${text}${text}…` },
                { label: `${fmt(10 ** len)}x`, text: `${block}.${text}${text}…` },
                { label: 'Subtract', text: `${fmt(nines)}x = ${block}` },
                { label: 'So', text: `x = ${block}/${nines}${den === nines ? '' : ` = ${frac(num, den)}`}` },
              ]),
            },
            ...(den === nines ? [] : [{ text: `Reducing: both ${block} and ${nines} are divisible by ${nines / den}.` }]),
          ],
        };
      },
    },
    {
      id: 'repeating_decimals/delayed',
      idea: 'Digits before the repeat: shift twice',
      buildsOn: 'repeating_decimals/to-fraction',
      generate: rng => {
        const a = int(rng, 0, 9);
        let b = int(rng, 1, 9);
        if (b === a) b = a === 9 ? 3 : a + 1;
        const top = 9 * a + b;
        const [num, den] = reduce(top, 90);
        return {
          prompt: `Write 0.${a}${b}${b}${b}… as a fraction, where the ${b} repeats forever. ${LOWEST}`,
          answer: { kind: 'fraction', num, den },
          hints: [
            'Find two multiples of x whose decimal parts match: 10x and 100x both end in the same repeating tail.',
            `100x − 10x = ${10 * a + b} − ${a}.`,
          ],
          solution: [
            {
              text: `Shift past the non-repeating digit (10x), and shift one more repeating digit (100x). Now the tails agree.`,
              visual: working([
                { label: '100x', text: `${10 * a + b}.${b}${b}${b}…` },
                { label: '10x', text: `${a}.${b}${b}${b}…` },
                { label: 'Subtract', text: `90x = ${10 * a + b} − ${a} = ${top}` },
                { label: 'So', text: `x = ${top}/90${den === 90 ? '' : ` = ${frac(num, den)}`}` },
              ]),
            },
            { text: `Sanity check: ${frac(num, den)} should be a bit ${b > a ? 'more' : 'less'} than 0.${a}${a}, and ${num} ÷ ${den} ≈ ${(num / den).toFixed(4)}.` },
          ],
        };
      },
    },
    {
      id: 'repeating_decimals/nth-digit',
      idea: 'Which digit lands in the nth place?',
      buildsOn: 'units_digit/cycle',
      generate: rng => {
        const [num, den] = pick(rng, [[1, 7], [2, 7], [3, 7], [5, 7], [6, 7], [1, 13], [2, 13], [7, 13], [5, 37], [1, 37], [1, 27], [2, 27], [1, 41], [4, 11], [3, 11], [1, 101]] as const);
        const block = repeatingBlock(num, den);
        const L = block.length;
        const n = int(rng, 20, 500);
        const pos = n % L === 0 ? L : n % L;
        const text = block.join('');
        return {
          prompt: `The decimal for ${num}/${den} is 0.${text}${text.slice(0, Math.max(2, 8 - L))}…, repeating forever. What is the ${fmt(n)}${n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th'][n % 10]} digit after the decimal point?`,
          answer: { kind: 'number', value: block[pos - 1] },
          hints: [
            `The block "${text}" has ${L} digits and then starts over.`,
            `${fmt(n)} = ${L} × ${Math.floor(n / L)} + ${n % L}. ${n % L === 0 ? 'A remainder of 0 means the last digit of a block.' : `So it is digit number ${pos} of a block.`}`,
          ],
          solution: [
            {
              text: `The digits repeat in blocks of ${L}: ${text}. Throw away the complete blocks and see where you land.`,
              visual: working([
                { label: 'Block', text: `${block.join(' ')} (length ${L})` },
                { label: 'Divide', text: `${fmt(n)} = ${L} × ${Math.floor(n / L)} + ${n % L}` },
                { label: 'Position', text: n % L === 0 ? `remainder 0: the last digit of a block` : `digit number ${pos} of a block` },
                { label: 'Digit', text: `${block[pos - 1]}` },
              ]),
            },
          ],
        };
      },
    },
  ],
};

// ── Number Bases ─────────────────────────────────────────────────────────────

const SUB = '₀₁₂₃₄₅₆₇₈₉';
/** inBase('231', 5) → "231₅" */
const inBase = (digitString: string, b: number) => `${digitString}${[...String(b)].map(d => SUB[Number(d)]).join('')}`;
const toBase = (n: number, b: number) => n.toString(b);
const BASE_NAME: Record<number, string> = { 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine' };

/** "2 × 25 + 3 × 5 + 1" for 231 in base 5 */
const expand = (digitString: string, b: number) =>
  [...digitString].map((d, i) => { const place = b ** (digitString.length - 1 - i); return place === 1 ? d : `${d} × ${fmt(place)}`; }).join(' + ');

const bases: Lesson = {
  topic: 'bases',
  intro: [
    {
      text: 'In our usual system each place is worth ten times the place to its right: ones, tens, hundreds. That "ten" is a choice, probably made because of fingers. In base five each place is worth FIVE times the one to its right: ones, fives, twenty-fives, and the only digits are 0 through 4. A small subscript names the base.',
      visual: working([
        { label: 'Base ten', text: '231 = 2 × 100 + 3 × 10 + 1' },
        { label: 'Base five', text: '231₅ = 2 × 25 + 3 × 5 + 1' },
        { label: 'So', text: '231₅ = 50 + 15 + 1 = 66' },
      ]),
    },
    {
      text: 'To go the other way, divide by the base again and again and collect the remainders. The first remainder is the ones digit, the next is the fives digit, and so on, so read the remainders from the bottom up. Converting 66 to base five:',
      visual: working([
        { text: '66 ÷ 5 = 13 remainder 1' },
        { text: '13 ÷ 5 = 2 remainder 3' },
        { text: '2 ÷ 5 = 0 remainder 2' },
        { label: 'Read upward', text: '231₅' },
      ]),
    },
    {
      text: 'Base two (binary) uses only 0 and 1, and its places are the powers of 2: 1, 2, 4, 8, 16, … So 1011₂ = 8 + 0 + 2 + 1 = 11. Every whole number is a sum of distinct powers of 2 in exactly one way, which is why computers can store anything with on-off switches.',
    },
    {
      text: 'Arithmetic works the same way in any base. You just carry at the base instead of at ten. In base five, 4 + 3 makes seven, which is one five and two ones: write 2, carry 1.',
      visual: working([
        { label: 'Problem', text: '34₅ + 23₅' },
        { label: 'Ones', text: '4 + 3 = 7 = 1 five + 2: write 2, carry 1' },
        { label: 'Fives', text: '3 + 2 + 1 = 6 = 1 twenty-five + 1: write 1, carry 1' },
        { label: 'Answer', text: '112₅ (check: 19 + 13 = 32 = 25 + 5 + 2)' },
      ]),
    },
  ],
  rungs: [
    {
      id: 'bases/to-ten',
      idea: 'Each place is a power of the base',
      buildsOn: 'exponents/rules',
      generate: rng => {
        const b = pick(rng, [2, 2, 3, 4, 5, 5, 6, 7, 8]);
        const len = b === 2 ? int(rng, 5, 7) : b === 3 ? 4 : 3;
        const n = int(rng, b ** (len - 1), b ** len - 1);
        const s = toBase(n, b);
        return {
          prompt: `What is ${inBase(s, b)} written in base ten?`,
          answer: { kind: 'number', value: n },
          hints: [
            `From the right, the places in base ${BASE_NAME[b]} are worth ${Array.from({ length: len }, (_, i) => fmt(b ** i)).join(', ')}.`,
            `${inBase(s, b)} = ${expand(s, b)}.`,
          ],
          solution: [
            {
              text: `Each place is worth ${b} times the place to its right.`,
              visual: working([
                { label: 'Place values', text: Array.from({ length: len }, (_, i) => fmt(b ** (len - 1 - i))).join(', ') },
                { label: 'Expand', text: expand(s, b) },
                { label: 'Add', text: fmt(n) },
              ]),
            },
          ],
        };
      },
    },
    {
      id: 'bases/from-ten',
      idea: 'Divide by the base and collect remainders',
      buildsOn: 'bases/to-ten',
      generate: rng => {
        const b = pick(rng, [2, 3, 4, 5, 5, 6, 7, 8]);
        const n = b === 2 ? int(rng, 17, 63) : int(rng, b * b, Math.min(b ** 4 - 1, 400));
        const s = toBase(n, b);
        const rows = [];
        for (let q = n; q > 0; q = Math.floor(q / b)) rows.push({ text: `${q} ÷ ${b} = ${Math.floor(q / b)} remainder ${q % b}` });
        return {
          prompt: `Write the base-ten number ${n} in base ${BASE_NAME[b]}. (Type just the digits.)`,
          answer: { kind: 'number', value: Number(s) },
          hints: [
            `Divide ${n} by ${b} and keep the remainder: it is the last digit. Then repeat with the quotient.`,
            `The remainders, in the order you find them, are ${[...s].reverse().join(', ')}. Read them backwards.`,
          ],
          solution: [
            { text: `Divide by ${b} repeatedly. Each remainder is the next digit, starting from the ones place.`, visual: working([...rows, { label: 'Read upward', text: inBase(s, b) }]) },
            { text: `Check: ${expand(s, b)} = ${n}.` },
          ],
        };
      },
    },
    {
      id: 'bases/arithmetic',
      idea: 'Carry at the base, not at ten',
      buildsOn: 'bases/from-ten',
      generate: rng => {
        const b = pick(rng, [3, 4, 5, 5, 6, 7, 8]);
        if (rng() < 0.65) {
          const x = int(rng, b * b, b ** 3 - 1);
          const y = int(rng, b, b ** 3 - 1);
          const [sx, sy, ssum] = [toBase(x, b), toBase(y, b), toBase(x + y, b)];
          const rows = [];
          let carry = 0;
          const names = ['Ones', `${b}s`, `${b * b}s`, `${b ** 3}s`];
          for (let i = 0; i < Math.max(sx.length, sy.length) || carry; i++) {
            const dx = Number(sx[sx.length - 1 - i] ?? 0);
            const dy = Number(sy[sy.length - 1 - i] ?? 0);
            const t = dx + dy + carry;
            rows.push({ label: names[i] ?? 'Next', text: `${dx} + ${dy}${carry ? ' + 1' : ''} = ${t}${t >= b ? ` = ${b} + ${t - b}: write ${t - b}, carry 1` : `: write ${t}`}` });
            carry = t >= b ? 1 : 0;
          }
          return {
            prompt: `Add ${inBase(sx, b)} + ${inBase(sy, b)}. Give the answer in base ${BASE_NAME[b]}. (Type just the digits.)`,
            answer: { kind: 'number', value: Number(ssum) },
            hints: [
              `Add column by column from the right. Whenever a column reaches ${b} or more, subtract ${b} and carry 1.`,
              `Or convert: ${inBase(sx, b)} = ${x} and ${inBase(sy, b)} = ${y}. Add, then convert ${x + y} back.`,
            ],
            solution: [
              { text: `Work right to left, carrying whenever a column total reaches ${b}.`, visual: working([...rows, { label: 'Answer', text: inBase(ssum, b) }]) },
              { text: `Check in base ten: ${x} + ${y} = ${x + y}, and ${inBase(ssum, b)} = ${expand(ssum, b)} = ${x + y}.` },
            ],
          };
        }
        const len = pick(rng, [2, 3]);
        const largest = rng() < 0.5;
        const value = largest ? b ** len - 1 : (b - 1) * b ** (len - 1);
        return {
          prompt: largest
            ? `What is the largest number that can be written with ${len} digits in base ${BASE_NAME[b]}? Give your answer in base ten.`
            : `How many different ${len}-digit numbers are there in base ${BASE_NAME[b]}? (The leading digit cannot be 0.)`,
          answer: { kind: 'number', value },
          hints: largest
            ? [`The largest digit in base ${BASE_NAME[b]} is ${b - 1}. Use it in every place.`, `${String(b - 1).repeat(len)} in base ${BASE_NAME[b]} is one less than 1${'0'.repeat(len)} in base ${BASE_NAME[b]}, which is ${pow(b, len)}.`]
            : [`How many choices are there for the first digit? For each other digit?`, `The first digit has ${b - 1} choices (not 0), and every other digit has ${b}.`],
          solution: largest
            ? [
                { text: `The largest ${len}-digit numeral is ${inBase(String(b - 1).repeat(len), b)}. Adding 1 to it rolls every digit over, giving ${inBase(`1${'0'.repeat(len)}`, b)} = ${pow(b, len)}.` },
                { text: 'So it is one less than that power.', visual: working([{ label: 'Value', text: `${pow(b, len)} − 1 = ${fmt(b ** len)} − 1 = ${fmt(value)}` }]) },
              ]
            : [
                { text: `Use the multiplication principle on the digits. In base ${BASE_NAME[b]} the digits are 0 through ${b - 1}.` },
                { text: 'Multiply the choices.', visual: { kind: 'slots', slots: Array.from({ length: len }, (_, i) => ({ label: i === 0 ? 'First digit' : `Digit ${i + 1}`, count: i === 0 ? b - 1 : b, why: i === 0 ? `1 through ${b - 1}: it cannot be 0` : `0 through ${b - 1}` })) } },
              ],
        };
      },
    },
    {
      id: 'bases/unknown-base',
      idea: 'Solve for the base',
      buildsOn: 'bases/to-ten',
      generate: rng => {
        const b = int(rng, 4, 9);
        if (rng() < 0.4) {
          const d1 = int(rng, 1, b - 1);
          const d0 = int(rng, 0, b - 1);
          const n = d1 * b + d0;
          return {
            prompt: `In a certain base b, the numeral ${d1}${d0} represents the base-ten number ${n}. What is b?`,
            answer: { kind: 'number', value: b },
            hints: [`In base b, the numeral ${d1}${d0} means ${d1} × b + ${d0}.`, `${d1 === 1 ? '' : d1}b + ${d0} = ${n}.`],
            solution: [
              {
                text: 'Write out what the numeral means, with b as the unknown place value.',
                visual: working([
                  { label: 'Meaning', text: `${d1 === 1 ? '' : d1}b + ${d0} = ${n}` },
                  { label: 'Solve', text: `${d1 === 1 ? '' : d1}b = ${n - d0}, so b = ${b}` },
                ]),
              },
              { text: `Sanity check: every digit of the numeral must be less than the base, and ${Math.max(d1, d0)} is less than ${b}.` },
            ],
          };
        }
        const d2 = int(rng, 1, Math.min(3, b - 1));
        const d1 = int(rng, 0, b - 1);
        const d0 = int(rng, 0, b - 1);
        const n = d2 * b * b + d1 * b + d0;
        const numeral = `${d2}${d1}${d0}`;
        const guess = Math.floor(Math.sqrt(n / d2));
        return {
          prompt: `In a certain base b, the numeral ${numeral} represents the base-ten number ${n}. What is b?`,
          answer: { kind: 'number', value: b },
          hints: [
            `In base b, the numeral ${numeral} means ${d2 === 1 ? '' : d2}b² + ${d1}b + ${d0}.`,
            `The b² term dominates, so b is a little less than √(${n} ÷ ${d2}) ≈ ${Math.sqrt(n / d2).toFixed(1)}. Also, b must be bigger than every digit.`,
          ],
          solution: [
            {
              text: 'Write out the place values with b unknown. It is a quadratic, but an estimate and a check is faster than factoring.',
              visual: working([
                { label: 'Meaning', text: `${d2 === 1 ? '' : d2}b² + ${d1}b + ${d0} = ${n}` },
                { label: 'Estimate', text: `${d2 === 1 ? '' : d2}b² is at most ${n}, so b ≤ ${guess}` },
                { label: `Try b = ${b}`, text: `${d2 === 1 ? '' : `${d2} × `}${b * b} + ${d1} × ${b} + ${d0} = ${n} ✓` },
              ]),
            },
            { text: `So b = ${b}. A larger base would overshoot and a smaller one would fall short, so the answer is unique.` },
          ],
        };
      },
    },
  ],
};

export const DIGIT_BASE_LESSONS: Lesson[] = [digits, repeatingDecimals, bases];
