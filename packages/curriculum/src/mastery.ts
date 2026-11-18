// Contest readiness: how well a learner knows a topic, judged on the speed and accuracy of their
// Problem Factory answers. Every threshold is in mastery-config.ts.
import { LESSONS, RUNG_BY_ID, topicOfRung } from './lessons/index.ts';
import { COMPETITIVE_SECONDS, MASTERY } from './mastery-config.ts';

export type Level = 'unrated' | 'beginner' | 'intermediate' | 'competitive';

export const LEVEL_LABEL: Record<Level, string> = {
  unrated: 'Not rated yet',
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  competitive: 'Competitive',
};

/** One Factory problem, from the moment it appeared until it was solved, given up on or timed out. */
export interface Attempt {
  rungId: string;
  /** Time from seeing the problem to the right answer, or to giving up. */
  ms: number;
  /** Answers submitted, the right one included. */
  tries: number;
  /** Hints the learner asked for. */
  hints: number;
  /** Got it right without seeing the solution first. */
  solved: boolean;
  /** Ran out of time in a timed round. */
  timedOut?: boolean;
  /** Clock time it finished, in ms. */
  at: number;
}

/** topic id → its Factory problems, oldest first. */
export type MasteryMap = Record<string, Attempt[]>;

/** Competitive time for a kind of problem, in ms. */
export function targetMs(rungId: string): number {
  return (COMPETITIVE_SECONDS[rungId] ?? 60) * 1000;
}

/** Accuracy credit for one problem, from 0 to 1. */
export function accuracyCredit(a: Attempt, config = MASTERY): number {
  if (!a.solved) return 0;
  const tries = a.tries + (config.hintCostsATry ? a.hints : 0);
  return config.tryCredit[tries - 1] ?? 0;
}

/** Speed for one solved problem: competitive time ÷ time taken, capped. Null for an unsolved one. */
export function speedRatio(a: Attempt, config = MASTERY): number | null {
  if (!a.solved) return null;
  return Math.min(config.speedCap, targetMs(a.rungId) / Math.max(a.ms, 1));
}

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const mid = s.length >> 1;
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export interface TopicMetrics {
  level: Level;
  /** Problems the level is based on. */
  count: number;
  /** Mean accuracy credit, 0–1. */
  accuracy: number;
  /** Median speed ratio over solved problems; 1 is competitive pace. 0 if none were solved. */
  speed: number;
  /** Share of the topic's kinds of problem that appear in the window, 0–1. */
  kindsShare: number;
}

/** Add one finished problem to the record, keeping only the most recent ones. */
export function addAttempt(map: MasteryMap, attempt: Attempt, config = MASTERY): MasteryMap {
  if (attempt.timedOut && !config.timeoutIsMiss) return map;
  const topic = topicOfRung(attempt.rungId);
  const list = [...(map[topic] ?? []), attempt].slice(-config.keep);
  return { ...map, [topic]: list };
}

/** A topic's level and its two measures, from its most recent problems. */
export function topicMetrics(topicId: string, map: MasteryMap, config = MASTERY): TopicMetrics {
  const recent = (map[topicId] ?? []).slice(-config.window);
  const count = recent.length;
  const kinds = LESSONS[topicId]?.rungs.length ?? 0;
  const seen = new Set(recent.map(a => a.rungId).filter(id => id in RUNG_BY_ID)).size;
  const kindsShare = kinds ? seen / kinds : 0;
  if (!count) return { level: 'unrated', count, accuracy: 0, speed: 0, kindsShare };

  const accuracy = recent.reduce((sum, a) => sum + accuracyCredit(a, config), 0) / count;
  const speeds = recent.map(a => speedRatio(a, config)).filter((s): s is number => s !== null);
  const speed = speeds.length ? median(speeds) : 0;

  const { competitive: c, intermediate: i } = config.levels;
  let level: Level = 'beginner';
  if (count < config.minToRate) level = 'unrated';
  else if (count >= c.minProblems && kindsShare >= c.minKindsShare && accuracy >= c.accuracy && speed >= c.speed) {
    level = 'competitive';
  } else if (accuracy >= i.accuracy && speed >= i.speed) level = 'intermediate';
  return { level, count, accuracy, speed, kindsShare };
}

/** What's still missing for the next level up, in plain words. Null at the top, or before a level is set. */
export function nextLevelGap(m: TopicMetrics, config = MASTERY): string | null {
  const pct = (x: number) => `${Math.round(x * 100)}%`;
  if (m.level === 'unrated') {
    const left = config.minToRate - m.count;
    return `Solve ${left} more Factory problem${left === 1 ? '' : 's'} from this topic to get a level.`;
  }
  if (m.level === 'competitive') return null;
  const goal = m.level === 'beginner' ? config.levels.intermediate : config.levels.competitive;
  const needs: string[] = [];
  if (m.accuracy < goal.accuracy) needs.push(`accuracy of ${pct(goal.accuracy)}`);
  if (m.speed < goal.speed) needs.push(`speed at ${pct(goal.speed)} of contest pace`);
  if (m.level === 'intermediate') {
    const c = config.levels.competitive;
    if (m.count < c.minProblems) needs.push(`at least ${c.minProblems} problems on record`);
    if (m.kindsShare < c.minKindsShare) needs.push('a wider mix of this topic\'s problems');
  }
  const next = m.level === 'beginner' ? 'Intermediate' : 'Competitive';
  if (!needs.length) return null;
  const list = needs.length > 1 ? `${needs.slice(0, -1).join(', ')} and ${needs[needs.length - 1]}` : needs[0];
  return `For ${next} you need ${list}.`;
}
