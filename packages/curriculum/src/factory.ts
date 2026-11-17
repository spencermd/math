// The Problem Factory: an endless supply of contest problems from anywhere on the tree.
import { NODES, type RealmId, type Tier } from './curriculum.ts';
import { LESSONS } from './lessons/index.ts';
import { shuffle } from './lessons/util.ts';
import type { Rng } from './lessons/types.ts';

export type FactoryMode = 'free' | 'sprint' | 'countdown';

export const FACTORY_MODES: Record<FactoryMode, { name: string; blurb: string }> = {
  free: { name: 'Free play', blurb: 'No clock. One problem after another, for as long as you like.' },
  sprint: { name: 'Sprint', blurb: '3 minutes. Solve as many as you can.' },
  countdown: { name: 'Countdown', blurb: '10 problems, 45 seconds each.' },
};

export const SPRINT_SECONDS = 180;
export const COUNTDOWN_PROBLEMS = 10;
export const COUNTDOWN_SECONDS = 45;

/** Which problems to make. Null means no limit; a topic overrides the other two. */
export interface FactoryScope {
  realm: RealmId | null;
  tier: Tier | null;
  topicId?: string;
}

export const EVERYTHING: FactoryScope = { realm: null, tier: null };

export function scopeKey(scope: FactoryScope): string {
  return scope.topicId ? `topic-${scope.topicId}` : `realm-${scope.realm ?? 'any'}-tier-${scope.tier ?? 'any'}`;
}

/** Ids of the lesson steps whose problems fit the scope. */
export function factoryPool(scope: FactoryScope): string[] {
  return NODES.filter(
    n =>
      n.id in LESSONS &&
      (scope.topicId
        ? n.id === scope.topicId
        : (scope.realm === null || n.realm === scope.realm) && (scope.tier === null || n.tier === scope.tier)),
  ).flatMap(n => LESSONS[n.id].rungs.map(r => r.id));
}

export interface FactoryItem {
  rungId: string;
  seed: number;
}

/** `count` problems that work through the pool in shuffled order, lap after lap. */
export function buildFactoryRun(pool: readonly string[], count: number, rng: Rng): FactoryItem[] {
  const items: FactoryItem[] = [];
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
