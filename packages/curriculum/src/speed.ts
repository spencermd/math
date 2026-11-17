// Speed rounds: timed, contest-style practice drawn from what the learner has already covered.
import { NODES, type RealmId } from './curriculum.ts';
import { LESSONS, isRungCleared, type PracticeMap } from './lessons/index.ts';
import { shuffle } from './lessons/util.ts';
import type { Rng } from './lessons/types.ts';
import { getStatus, isDone, type ProgressMap } from './progress.ts';

export type SpeedFormat = 'sprint' | 'countdown';

export const SPEED_FORMATS: Record<SpeedFormat, { name: string; blurb: string }> = {
  sprint: { name: 'Sprint', blurb: '3 minutes. Solve as many as you can.' },
  countdown: { name: 'Countdown', blurb: '10 problems, 45 seconds each.' },
};

export const SPRINT_SECONDS = 180;
export const COUNTDOWN_PROBLEMS = 10;
export const COUNTDOWN_SECONDS = 45;

/** Where a round's problems come from. */
export type SpeedScope = { kind: 'all' } | { kind: 'realm'; realm: RealmId } | { kind: 'topic'; topicId: string };

export function scopeKey(scope: SpeedScope): string {
  return scope.kind === 'all' ? 'all' : scope.kind === 'realm' ? `realm-${scope.realm}` : `topic-${scope.topicId}`;
}

/**
 * The steps a round can draw on: every step of a finished topic, and the steps already cleared in a
 * topic that's under way. Nothing the learner hasn't been taught.
 */
export function speedPool(nodes: ProgressMap, practice: PracticeMap, scope: SpeedScope = { kind: 'all' }): string[] {
  return NODES.filter(
    n =>
      n.id in LESSONS &&
      (scope.kind === 'all' || (scope.kind === 'realm' ? n.realm === scope.realm : n.id === scope.topicId)),
  ).flatMap(n => {
    const status = getStatus(n.id, nodes);
    const rungs = LESSONS[n.id].rungs.map(r => r.id);
    if (isDone(status)) return rungs;
    return status === 'in_progress' ? rungs.filter(id => isRungCleared(id, practice)) : [];
  });
}

export interface SpeedItem {
  rungId: string;
  seed: number;
}

/** `count` problems that work through the pool in shuffled order, lap after lap. */
export function buildSpeedRound(pool: readonly string[], count: number, rng: Rng): SpeedItem[] {
  const items: SpeedItem[] = [];
  while (pool.length && items.length < count) {
    const lap = shuffle(rng, pool);
    // Don't open a lap with the step the last one closed on.
    if (lap.length > 1 && items.length && lap[0] === items[items.length - 1].rungId) lap.push(lap.shift()!);
    for (const rungId of lap) {
      if (items.length < count) items.push({ rungId, seed: Math.floor(rng() * 2 ** 31) });
    }
  }
  return items;
}
