// Skipping ahead: a placement quiz over the Foundations topics, and a per-topic challenge.
import { NODES } from './curriculum.ts';
import { LESSONS } from './lessons/index.ts';
import { getStatus, type ProgressMap } from './progress.ts';

/** The topics the placement quiz can skip: the Foundations tier. Later tiers are always taught. */
export const PLACEMENT_TOPICS: string[] = NODES.filter(n => n.tier === 1 && n.id in LESSONS).map(n => n.id);

/**
 * The next topic to ask about: an open Foundations topic not asked yet. Passing one completes it and
 * opens what builds on it, so the quiz only goes as far as the learner's answers carry it.
 */
export function nextPlacementTopic(nodes: ProgressMap, asked: readonly string[]): string | null {
  const open = (id: string) => {
    const status = getStatus(id, nodes);
    return status === 'available' || status === 'in_progress';
  };
  return PLACEMENT_TOPICS.find(id => open(id) && !asked.includes(id)) ?? null;
}

/** A topic's last step is its most demanding, so one problem from it stands in for the topic. */
export function placementRung(topicId: string): string {
  const { rungs } = LESSONS[topicId];
  return rungs[rungs.length - 1].id;
}
