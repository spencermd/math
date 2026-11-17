import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  MASTERY_STAGE,
  cascadeUnlocks,
  firstReview,
  getStatus,
  gradeReview,
  isDone,
  localToday,
  lessonProgress,
  newlyEnteredRealms,
  topicOfRung,
  updateStreak,
  type PracticeMap,
  type ProgressMap,
  type RealmId,
  type ReviewMap,
  type Status,
} from '@mathtree/curriculum';

// Local-only progress until parent accounts land; then this syncs to the server.

interface ProgressState {
  nodes: ProgressMap;
  streak: number;
  lastActiveDate: string | null;
  /** Realm just entered, shown as a ceremony until dismissed. */
  pendingCeremony: RealmId | null;
  /** First-try correct answers per problem rung. */
  practice: PracticeMap;
  /** When each completed topic next comes up for review. */
  reviews: ReviewMap;
  /** The first-visit welcome has been answered. */
  welcomed: boolean;

  setStatus: (id: string, status: Status) => void;
  /** Credit a first-try correct answer. Clearing a topic's whole ladder completes the topic. */
  recordCorrect: (rungId: string) => void;
  /**
   * Record a review problem. A miss always brings the topic back tomorrow; a first-try answer moves it
   * on only when the topic was due (`counts`), and enough of those master it.
   */
  recordReview: (topicId: string, firstTry: boolean, counts: boolean) => void;
  dismissCeremony: () => void;
  setWelcomed: () => void;
  reset: () => void;
}

const freshNodes = () => cascadeUnlocks({}).newNodes;

/** Every completed topic is on the review schedule; ones saved before reviews existed are due now. */
function withReviews(reviews: ReviewMap, nodes: ProgressMap, due?: string): ReviewMap {
  const out = { ...reviews };
  for (const [id, node] of Object.entries(nodes)) {
    if (isDone(node.status) && !out[id]) out[id] = due ? { stage: 0, due } : firstReview();
  }
  return out;
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      nodes: freshNodes(),
      streak: 0,
      lastActiveDate: null,
      pendingCeremony: null,
      practice: {},
      reviews: {},
      welcomed: false,

      setStatus: (id, status) => {
        const { nodes, reviews, streak, lastActiveDate } = get();
        const existing = nodes[id] ?? { status: 'locked', progress: 0, notes: '' };
        const done = isDone(status);
        const merged: ProgressMap = {
          ...nodes,
          [id]: {
            ...existing,
            status,
            progress: done ? 100 : existing.progress,
            completedAt: done ? new Date().toISOString() : existing.completedAt,
          },
        };
        const { newNodes } = cascadeUnlocks(merged);
        const entered = newlyEnteredRealms(nodes, newNodes);
        set({
          nodes: newNodes,
          reviews: withReviews(reviews, newNodes),
          ...updateStreak(streak, lastActiveDate),
          pendingCeremony: entered[0] ?? null,
        });
      },

      recordCorrect: rungId => {
        const { practice, streak, lastActiveDate } = get();
        const next = { ...practice, [rungId]: (practice[rungId] ?? 0) + 1 };
        set({ practice: next, ...updateStreak(streak, lastActiveDate) });

        const topic = topicOfRung(rungId);
        const status = getStatus(topic, get().nodes);
        if (lessonProgress(topic, next) === 100 && status !== 'locked' && !isDone(status)) {
          get().setStatus(topic, 'completed');
        }
      },

      recordReview: (topicId, firstTry, counts) => {
        const { nodes, reviews, streak, lastActiveDate } = get();
        const active = updateStreak(streak, lastActiveDate);
        if (firstTry && !counts) return set(active);
        const next = gradeReview(reviews[topicId], firstTry);
        const node = nodes[topicId];
        const mastered = next.stage >= MASTERY_STAGE && node?.status === 'completed';
        set({
          reviews: { ...reviews, [topicId]: next },
          nodes: mastered ? { ...nodes, [topicId]: { ...node, status: 'mastered' } } : nodes,
          ...active,
        });
      },

      dismissCeremony: () => set({ pendingCeremony: null }),

      setWelcomed: () => set({ welcomed: true }),

      reset: () =>
        set({
          nodes: freshNodes(),
          streak: 0,
          lastActiveDate: null,
          pendingCeremony: null,
          practice: {},
          reviews: {},
          welcomed: false,
        }),
    }),
    {
      // v2: the competition-math tree. Progress saved against the earlier K–college tree doesn't carry over.
      name: 'mathtree-progress-v2',
      // Rehydrated from SkillTree on mount so server and client render the same first frame.
      skipHydration: true,
      partialize: ({ nodes, streak, lastActiveDate, practice, reviews, welcomed }) => ({
        nodes,
        streak,
        lastActiveDate,
        practice,
        reviews,
        welcomed,
      }),
      // Re-run unlocks in case the curriculum changed since this was saved.
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<ProgressState>;
        const nodes = cascadeUnlocks(saved.nodes ?? {}).newNodes;
        return {
          ...current,
          ...saved,
          nodes,
          reviews: withReviews(saved.reviews ?? {}, nodes, localToday()),
        };
      },
    },
  ),
);
