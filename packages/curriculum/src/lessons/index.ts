import { ALGEBRA_LESSONS } from './algebra.ts';
import { ARRANGEMENT_LESSONS } from './arrangements.ts';
import { CHANCE_LESSONS } from './chance.ts';
import { CHOOSING_LESSONS } from './choosing.ts';
import { COUNTING_LESSONS } from './counting.ts';
import { DIGIT_LESSONS } from './digits.ts';
import { FRACTION_LESSONS } from './fractions.ts';
import { GCD_LCM_LESSONS } from './gcd-lcm.ts';
import { NUMBER_SENSE_LESSONS } from './number-sense.ts';
import { NUMBER_THEORY_LESSONS } from './number-theory.ts';
import { PROBABILITY_LESSONS } from './probability.ts';
import { PROPORTION_LESSONS } from './proportions.ts';
import { STATISTICS_LESSONS } from './statistics.ts';
import { MOTION_LINE_LESSONS } from './motion-lines.ts';
import { POWER_LESSONS } from './powers.ts';
import { SEQUENCE_LESSONS } from './sequences.ts';
import { COUNTING_ADVANCED_LESSONS } from './counting-advanced.ts';
import { FACTOR_ADVANCED_LESSONS } from './factors-advanced.ts';
import { DIGIT_BASE_LESSONS } from './digits-bases.ts';
import { GEOMETRY_ANGLE_LESSONS } from './geometry-angles.ts';
import { GEOMETRY_AREA_LESSONS } from './geometry-area.ts';
import { GEOMETRY_CIRCLE_LESSONS, GEO_PROB_LESSONS } from './geometry-circles.ts';
import { GEOMETRY_SOLID_LESSONS } from './geometry-solids.ts';
import type { Lesson, Problem, Rng, Rung } from './types.ts';

export type * from './types.ts';

/** topic id → lesson. Topics without an entry have no problems written yet. */
export const LESSONS: Record<string, Lesson> = {};
export const RUNG_BY_ID: Record<string, Rung> = {};

for (const lesson of [
  ...NUMBER_SENSE_LESSONS,
  ...FRACTION_LESSONS,
  ...PROPORTION_LESSONS,
  ...STATISTICS_LESSONS,
  ...ALGEBRA_LESSONS,
  ...COUNTING_LESSONS,
  ...ARRANGEMENT_LESSONS,
  ...CHOOSING_LESSONS,
  ...PROBABILITY_LESSONS,
  ...CHANCE_LESSONS,
  ...NUMBER_THEORY_LESSONS,
  ...GCD_LCM_LESSONS,
  ...DIGIT_LESSONS,
  ...MOTION_LINE_LESSONS,
  ...POWER_LESSONS,
  ...SEQUENCE_LESSONS,
  ...COUNTING_ADVANCED_LESSONS,
  ...GEO_PROB_LESSONS,
  ...FACTOR_ADVANCED_LESSONS,
  ...DIGIT_BASE_LESSONS,
  ...GEOMETRY_ANGLE_LESSONS,
  ...GEOMETRY_AREA_LESSONS,
  ...GEOMETRY_CIRCLE_LESSONS,
  ...GEOMETRY_SOLID_LESSONS,
]) {
  LESSONS[lesson.topic] = lesson;
  for (const rung of lesson.rungs) RUNG_BY_ID[rung.id] = rung;
}

export function topicOfRung(rungId: string): string {
  return rungId.slice(0, rungId.indexOf('/'));
}

/** Small seeded generator (mulberry32). */
function seeded(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The same rung and seed always give the same problem. */
export function makeProblem(rungId: string, seed: number): Problem {
  return RUNG_BY_ID[rungId].generate(seeded(seed));
}

/** First-try correct answers needed to clear a rung. */
export const RUNG_GOAL = 3;

/** rung id → first-try correct answers so far. */
export type PracticeMap = Record<string, number>;

export function isRungCleared(rungId: string, practice: PracticeMap): boolean {
  return (practice[rungId] ?? 0) >= RUNG_GOAL;
}

/** Percent of a topic's ladder climbed, counting partial credit on each rung. 0 if it has no lesson. */
export function lessonProgress(topicId: string, practice: PracticeMap): number {
  const lesson = LESSONS[topicId];
  if (!lesson) return 0;
  const earned = lesson.rungs.reduce((sum, r) => sum + Math.min(practice[r.id] ?? 0, RUNG_GOAL), 0);
  return Math.round((earned / (lesson.rungs.length * RUNG_GOAL)) * 100);
}
