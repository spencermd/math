// Spaced review: a completed topic comes back after a few days, mixed in with others, to check it stuck.
import { NODES } from './curriculum.ts';
import { LESSONS } from './lessons/index.ts';
import { shuffle } from './lessons/util.ts';
import type { Rng } from './lessons/types.ts';
import { daysBetween, getStatus, isDone, localToday, type ProgressMap } from './progress.ts';

export interface ReviewState {
  /** Reviews passed in a row, less one for each miss. */
  stage: number;
  /** YYYY-MM-DD the topic next comes up. */
  due: string;
}

/** topic id → its review schedule. Every completed topic has an entry. */
export type ReviewMap = Record<string, ReviewState>;

/** Days until the next review, by stage. The last gap repeats. */
export const REVIEW_GAPS = [2, 5, 12, 30];

/** Passing this many spaced reviews turns a completed topic into a mastered one. */
export const MASTERY_STAGE = 2;

export const REVIEW_SESSION_SIZE = 8;
/** A session shorter than this is topped up with second problems from the same topics. */
const REVIEW_SESSION_MIN = 4;

export function addDays(date: string, days: number): string {
  return new Date(Date.parse(date) + days * 86400000).toISOString().slice(0, 10);
}

/** Schedule for a topic that has just been completed. */
export function firstReview(today = localToday()): ReviewState {
  return { stage: 0, due: addDays(today, REVIEW_GAPS[0]) };
}

/** A first-try answer moves the topic a stage up and further out; a miss brings it back tomorrow. */
export function gradeReview(state: ReviewState | undefined, firstTry: boolean, today = localToday()): ReviewState {
  const stage = state?.stage ?? 0;
  if (!firstTry) return { stage: Math.max(0, stage - 1), due: addDays(today, 1) };
  const next = stage + 1;
  return { stage: next, due: addDays(today, REVIEW_GAPS[Math.min(next, REVIEW_GAPS.length - 1)]) };
}

/** Days until the topic is due; zero or less means it is due now. */
export function daysUntilDue(state: ReviewState | undefined, today = localToday()): number {
  return state ? daysBetween(today, state.due) : 0;
}

function reviewable(nodes: ProgressMap): string[] {
  return NODES.filter(n => isDone(getStatus(n.id, nodes)) && n.id in LESSONS).map(n => n.id);
}

export function dueTopics(reviews: ReviewMap, nodes: ProgressMap, today = localToday()): string[] {
  return reviewable(nodes)
    .filter(id => daysUntilDue(reviews[id], today) <= 0)
    .sort((a, b) => daysUntilDue(reviews[a], today) - daysUntilDue(reviews[b], today));
}

export interface ReviewItem {
  topicId: string;
  rungId: string;
  seed: number;
  /** Whether a first-try answer advances the topic's schedule. False for practice ahead of its due date. */
  counts: boolean;
}

/**
 * One problem from each of several completed topics, in shuffled order: the topics that are due
 * (most overdue first), topped up with others as extra practice.
 */
export function buildReviewSession(
  reviews: ReviewMap,
  nodes: ProgressMap,
  rng: Rng,
  today = localToday(),
): ReviewItem[] {
  const due = dueTopics(reviews, nodes, today).slice(0, REVIEW_SESSION_SIZE);
  const early = shuffle(rng, reviewable(nodes).filter(id => !due.includes(id)));
  const topics = [...due, ...early].slice(0, REVIEW_SESSION_SIZE);

  const used = new Set<string>();
  const item = (topicId: string, counts: boolean): ReviewItem => {
    const rungs = LESSONS[topicId].rungs.map(r => r.id);
    const fresh = rungs.filter(id => !used.has(id));
    const rungId = shuffle(rng, fresh.length ? fresh : rungs)[0];
    used.add(rungId);
    return { topicId, rungId, seed: Math.floor(rng() * 2 ** 31), counts };
  };

  const items = topics.map(id => item(id, due.includes(id)));
  while (topics.length && items.length < REVIEW_SESSION_MIN) {
    for (const id of topics) {
      if (items.length >= REVIEW_SESSION_MIN) break;
      items.push(item(id, false));
    }
  }
  return shuffle(rng, items);
}
