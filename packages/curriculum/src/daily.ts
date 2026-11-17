// The daily goal: clear what's due for review, then climb one new step.
import { NODES } from './curriculum.ts';
import { LESSONS, lessonProgress, type PracticeMap } from './lessons/index.ts';
import { getStatus, localToday, type ProgressMap } from './progress.ts';
import { dueTopics, type ReviewMap } from './review.ts';

/** What the learner has done on one day. */
export interface DayLog {
  date: string;
  /** Lesson steps cleared. */
  steps: number;
}

export interface DailyPlan {
  /** Topics due for review. */
  due: number;
  /** New steps cleared today. */
  steps: number;
  /** The topic to learn from next: one under way, or else the first that's open. Null when all are finished. */
  focus: string | null;
  done: boolean;
}

export function dailyPlan(
  state: { nodes: ProgressMap; practice: PracticeMap; reviews: ReviewMap; day: DayLog | null },
  today = localToday(),
): DailyPlan {
  const { nodes, practice, reviews, day } = state;
  const unfinished = (status: string) =>
    NODES.find(n => n.id in LESSONS && getStatus(n.id, nodes) === status && lessonProgress(n.id, practice) < 100);
  const focus = (unfinished('in_progress') ?? unfinished('available'))?.id ?? null;
  const due = dueTopics(reviews, nodes, today).length;
  const steps = day?.date === today ? day.steps : 0;
  return { due, steps, focus, done: due === 0 && (steps > 0 || focus === null) };
}
