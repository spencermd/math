// Badges: rewards for milestones, speed and persistence. Secret ones stay hidden until they're earned.
import { NODES, REALMS, REALM_ORDER, getNodesForRealm, type RealmId } from './curriculum.ts';
import { RUNG_GOAL, type PracticeMap } from './lessons/index.ts';
import type { Answer } from './lessons/types.ts';
import { getStatus, isDone, type ProgressMap } from './progress.ts';

/** Running totals that badges are judged on. */
export interface Stats {
  /** Problems answered correctly without first seeing the solution. */
  solved: number;
  /** Of those, how many were answered first try in under ten seconds. */
  quick: number;
  /** First-try answers in a row right now, and the longest such run. */
  run: number;
  bestRun: number;
  /** Whether the current run began after a miss. */
  afterMiss: boolean;
  /** Realms with at least one problem solved. */
  realms: RealmId[];
  /** Topics completed by proving them rather than taking the lesson. */
  proved: number;
}

export const NO_STATS: Stats = { solved: 0, quick: 0, run: 0, bestRun: 0, afterMiss: false, realms: [], proved: 0 };

export type AnswerMode = 'lesson' | 'review' | 'challenge' | 'free' | 'sprint' | 'countdown';

/** One answer to one problem, as it happened. */
export interface AnswerEvent {
  rungId: string;
  right: boolean;
  /** 1 for the first answer to this problem, 2 for the second, and so on. */
  attempt: number;
  /** The solution had already been opened. */
  aided: boolean;
  /** Time from seeing the problem to answering. */
  ms: number;
  mode: AnswerMode;
  /** Clock time of the answer, in ms. */
  at: number;
  /** Time left on the clock, in a timed round. */
  msLeft?: number;
  answer: Answer;
}

export const QUICK_MS = 10000;

/** Fold one answer into the running totals. */
export function countAnswer(stats: Stats, e: AnswerEvent, realm: RealmId): Stats {
  if (e.aided) return stats;
  const first = e.attempt === 1;
  if (!e.right) return first ? { ...stats, run: 0, afterMiss: true } : stats;
  const run = first ? stats.run + 1 : stats.run;
  return {
    ...stats,
    solved: stats.solved + 1,
    quick: stats.quick + (first && e.ms < QUICK_MS ? 1 : 0),
    run,
    bestRun: Math.max(stats.bestRun, run),
    realms: stats.realms.includes(realm) ? stats.realms : [...stats.realms, realm],
  };
}

/** Everything a badge can be judged on. */
export interface BadgeState {
  nodes: ProgressMap;
  practice: PracticeMap;
  stats: Stats;
  streak: number;
  bests: Record<string, number>;
}

export interface Badge {
  id: string;
  icon: string;
  name: string;
  /** How it's earned. For a secret badge this is only shown afterwards. */
  how: string;
  secret?: true;
  /** `e` is the answer that was just given, when there is one. */
  earned: (s: BadgeState, e?: AnswerEvent) => boolean;
}

const doneCount = (s: BadgeState) => NODES.filter(n => isDone(getStatus(n.id, s.nodes))).length;
const masteredCount = (s: BadgeState) => NODES.filter(n => getStatus(n.id, s.nodes) === 'mastered').length;
const bestOf = (s: BadgeState, mode: string) =>
  Math.max(0, ...Object.entries(s.bests).filter(([key]) => key.startsWith(`${mode}:`)).map(([, score]) => score));
/** A right answer given first time, unaided. */
const clean = (e?: AnswerEvent): e is AnswerEvent => !!e && e.right && e.attempt === 1 && !e.aided;
const hour = (e: AnswerEvent) => new Date(e.at).getHours();

const REALM_ICONS: Record<RealmId, string> = { 1: '🔢', 2: '🧮', 3: '🧩', 4: '🎲', 5: '🔐', 6: '📐' };

export const BADGES: Badge[] = [
  // Getting going
  { id: 'first_step', icon: '🌱', name: 'First Step', how: 'Clear your first lesson step.', earned: s => Object.values(s.practice).some(n => n >= RUNG_GOAL) },
  { id: 'first_topic', icon: '🍃', name: 'Branch Out', how: 'Complete a topic.', earned: s => doneCount(s) >= 1 },
  { id: 'topics_5', icon: '🌿', name: 'Sapling', how: 'Complete 5 topics.', earned: s => doneCount(s) >= 5 },
  { id: 'topics_15', icon: '🌳', name: 'Tall Tree', how: 'Complete 15 topics.', earned: s => doneCount(s) >= 15 },
  { id: 'topics_30', icon: '🌲', name: 'Grove', how: 'Complete 30 topics.', earned: s => doneCount(s) >= 30 },
  { id: 'topics_all', icon: '👑', name: 'The Whole Tree', how: `Complete all ${NODES.length} topics.`, earned: s => doneCount(s) >= NODES.length },
  ...REALM_ORDER.map(
    (realm): Badge => ({
      id: `realm_${realm}`,
      icon: REALM_ICONS[realm],
      name: `${REALMS[realm].name} Ace`,
      how: `Complete every ${REALMS[realm].name} topic.`,
      earned: s => getNodesForRealm(realm).every(n => isDone(getStatus(n.id, s.nodes))),
    }),
  ),
  { id: 'summit', icon: '⛰️', name: 'Summit', how: 'Complete a MATHCOUNTS-level topic.', earned: s => NODES.some(n => n.tier === 3 && isDone(getStatus(n.id, s.nodes))) },
  { id: 'called_it', icon: '🎯', name: 'Called It', how: 'Skip a lesson by proving you know the topic.', earned: s => s.stats.proved >= 1 },
  { id: 'master_1', icon: '⭐', name: 'Made It Stick', how: 'Master a topic by getting it right in two reviews.', earned: s => masteredCount(s) >= 1 },
  { id: 'master_10', icon: '🌟', name: 'Long Memory', how: 'Master 10 topics.', earned: s => masteredCount(s) >= 10 },

  // Volume
  { id: 'solved_10', icon: '✏️', name: 'Warming Up', how: 'Solve 10 problems.', earned: s => s.stats.solved >= 10 },
  { id: 'solved_100', icon: '💯', name: 'Century', how: 'Solve 100 problems.', earned: s => s.stats.solved >= 100 },
  { id: 'solved_500', icon: '🏭', name: 'Factory Regular', how: 'Solve 500 problems.', earned: s => s.stats.solved >= 500 },
  { id: 'solved_1000', icon: '🚀', name: 'Problem Machine', how: 'Solve 1,000 problems.', earned: s => s.stats.solved >= 1000 },
  { id: 'explorer', icon: '🧭', name: 'Explorer', how: 'Solve a problem in all six realms.', earned: s => s.stats.realms.length >= REALM_ORDER.length },

  // Speed and accuracy
  { id: 'quick_draw', icon: '⚡', name: 'Quick Draw', how: 'Answer a problem correctly in under 10 seconds.', earned: (_, e) => clean(e) && e.ms < QUICK_MS },
  { id: 'quick_10', icon: '🌩️', name: 'Lightning Hands', how: 'Give 10 correct answers in under 10 seconds each.', earned: s => s.stats.quick >= 10 },
  { id: 'run_10', icon: '🔥', name: 'On Fire', how: 'Get 10 problems in a row right on the first try.', earned: s => s.stats.bestRun >= 10 },
  { id: 'run_25', icon: '☄️', name: 'Unstoppable', how: 'Get 25 problems in a row right on the first try.', earned: s => s.stats.bestRun >= 25 },
  { id: 'sprint_10', icon: '🏃', name: 'Sprinter', how: 'Score 10 in a Sprint.', earned: s => bestOf(s, 'sprint') >= 10 },
  { id: 'sprint_20', icon: '🏅', name: 'Sprint Champion', how: 'Score 20 in a Sprint.', earned: s => bestOf(s, 'sprint') >= 20 },
  { id: 'countdown_10', icon: '⏱️', name: 'Perfect Countdown', how: 'Get all 10 right in a Countdown.', earned: s => bestOf(s, 'countdown') >= 10 },

  // Habit
  { id: 'streak_3', icon: '📅', name: 'Three in a Row', how: 'Practice 3 days in a row.', earned: s => s.streak >= 3 },
  { id: 'streak_7', icon: '🗓️', name: 'Full Week', how: 'Practice 7 days in a row.', earned: s => s.streak >= 7 },
  { id: 'streak_30', icon: '🏆', name: 'Habit', how: 'Practice 30 days in a row.', earned: s => s.streak >= 30 },

  // Secret
  { id: 'blink', icon: '👀', name: 'Blink', how: 'Answer correctly in under 3 seconds.', secret: true, earned: (_, e) => clean(e) && e.ms < 3000 },
  { id: 'buzzer', icon: '🚨', name: 'Buzzer Beater', how: 'Answer correctly with under 3 seconds left in a Countdown.', secret: true, earned: (_, e) => clean(e) && e.mode === 'countdown' && e.msLeft !== undefined && e.msLeft < 3000 },
  { id: 'never_give_up', icon: '🪨', name: 'Never Give Up', how: 'Get a problem right after missing it three times.', secret: true, earned: (_, e) => !!e && e.right && !e.aided && e.attempt >= 4 },
  { id: 'bounce_back', icon: '🏀', name: 'Bounce Back', how: 'Follow a miss with 5 right in a row.', secret: true, earned: s => s.stats.afterMiss && s.stats.run >= 5 },
  { id: 'answer_42', icon: '🌌', name: 'The Answer', how: 'Solve a problem whose answer is 42.', secret: true, earned: (_, e) => clean(e) && e.answer.kind === 'number' && e.answer.value === 42 },
  { id: 'night_owl', icon: '🦉', name: 'Night Owl', how: 'Solve a problem after 10 at night.', secret: true, earned: (_, e) => clean(e) && (hour(e) >= 22 || hour(e) < 4) },
  { id: 'early_bird', icon: '🐦', name: 'Early Bird', how: 'Solve a problem before 7 in the morning.', secret: true, earned: (_, e) => clean(e) && hour(e) >= 4 && hour(e) < 7 },
  { id: 'pi_day', icon: '🥧', name: 'Pi Day', how: 'Solve a problem on March 14.', secret: true, earned: (_, e) => clean(e) && new Date(e.at).getMonth() === 2 && new Date(e.at).getDate() === 14 },
];

export const BADGE_BY_ID: Record<string, Badge> = Object.fromEntries(BADGES.map(b => [b.id, b]));

/** Ids of badges just earned: those whose conditions now hold and that aren't held already. */
export function newBadges(held: Record<string, string>, s: BadgeState, e?: AnswerEvent): string[] {
  return BADGES.filter(b => !(b.id in held) && b.earned(s, e)).map(b => b.id);
}
