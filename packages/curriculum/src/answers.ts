// Checking a typed answer, and saying something useful about a wrong one.
import type { Answer, Problem } from './lessons/types.ts';

/** A typed answer as a fraction; a whole number has `den` 1. */
export interface Typed {
  num: number;
  den: number;
}

/** Keep only what an answer can contain: digits, one leading minus sign, and "/" where fractions are allowed. */
export function cleanInput(raw: string, fractions: boolean): string {
  const kept = raw.replace(/−/g, '-').replace(fractions ? /[^0-9/-]/g : /[^0-9-]/g, '');
  return kept.slice(0, 1) + kept.slice(1).replace(/-/g, '');
}

/** "3/8" → { num: 3, den: 8 }; "12" → { num: 12, den: 1 }. Null while the input isn't a finished answer. */
export function parseTyped(input: string): Typed | null {
  const [top, bottom = '1', extra] = input.split('/');
  if (top === '' || top === '-' || bottom === '' || extra !== undefined) return null;
  const [num, den] = [Number(top), Number(bottom)];
  if (Number.isNaN(num) || Number.isNaN(den) || den === 0) return null;
  return { num, den };
}

/** 'unreduced' is the right value in the wrong form: a fraction not in lowest terms. */
export function checkTyped(answer: Answer, typed: Typed): 'right' | 'wrong' | 'unreduced' {
  if (answer.kind === 'choice') return 'wrong';
  if (answer.kind === 'number') return typed.den === 1 && typed.num === answer.value ? 'right' : 'wrong';
  if (typed.num * answer.den !== answer.num * typed.den) return 'wrong';
  return typed.den === answer.den ? 'right' : 'unreduced';
}

export function answerText(answer: Answer): string {
  if (answer.kind === 'choice') return answer.options[answer.correct];
  const text = answer.kind === 'number' ? `${answer.value}` : answer.den === 1 ? `${answer.num}` : `${answer.num}/${answer.den}`;
  return text.replace('-', '−');
}

const isPowerOfTen = (ratio: number) => [10, 100, 1000].some(k => ratio === k || ratio * k === 1);

/**
 * What a wrong typed answer suggests went wrong, or null if nothing stands out. The problem's own
 * list of tempting answers comes first, then slips that look the same in any problem.
 */
export function diagnose(problem: Problem, typed: Typed): string | null {
  const { answer } = problem;
  if (answer.kind === 'choice') return null;
  const got = typed.num / typed.den;
  const want = answer.kind === 'number' ? answer.value : answer.num / answer.den;

  if (typed.den === 1) {
    const known = problem.mistakes?.find(m => m.value === typed.num && m.value !== want);
    if (known) return known.why;
  }
  if (want !== 0 && got === -want) return 'Right size, wrong sign.';

  if (answer.kind === 'fraction') {
    if (got !== 0 && got * want === 1) return 'That is the answer turned upside down. Check which number belongs on top.';
    if (want > 0 && want < 1 && Math.abs(got + want - 1) < 1e-9) {
      return 'That is the other part of the whole: the two add up to 1. Check which part the question asks for.';
    }
    return null;
  }

  if (typed.den !== 1) return 'This answer is a whole number.';
  if (Math.abs(got - want) === 1) return 'Off by exactly one. Recheck the last step of your working.';
  if (want !== 0 && got !== 0) {
    const ratio = got / want;
    if (isPowerOfTen(ratio)) return 'The digits are right but the size is off. Check the place value.';
    if (ratio === 2) return 'That is exactly double. Was something counted twice?';
    if (ratio === 0.5) return 'That is exactly half. Check whether you needed to divide by 2.';
  }
  return null;
}
