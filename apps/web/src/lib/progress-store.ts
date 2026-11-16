import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  cascadeUnlocks,
  getStatus,
  isDone,
  lessonProgress,
  newlyEnteredRealms,
  topicOfRung,
  updateStreak,
  type PracticeMap,
  type ProgressMap,
  type RealmId,
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

  setStatus: (id: string, status: Status) => void;
  /** Credit a first-try correct answer. Clearing a topic's whole ladder completes the topic. */
  recordCorrect: (rungId: string) => void;
  dismissCeremony: () => void;
  reset: () => void;
}

const freshNodes = () => cascadeUnlocks({}).newNodes;

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      nodes: freshNodes(),
      streak: 0,
      lastActiveDate: null,
      pendingCeremony: null,
      practice: {},

      setStatus: (id, status) => {
        const { nodes, streak, lastActiveDate } = get();
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

      dismissCeremony: () => set({ pendingCeremony: null }),

      reset: () =>
        set({ nodes: freshNodes(), streak: 0, lastActiveDate: null, pendingCeremony: null, practice: {} }),
    }),
    {
      // v2: the competition-math tree. Progress saved against the earlier K–college tree doesn't carry over.
      name: 'mathtree-progress-v2',
      // Rehydrated from SkillTree on mount so server and client render the same first frame.
      skipHydration: true,
      partialize: ({ nodes, streak, lastActiveDate, practice }) => ({ nodes, streak, lastActiveDate, practice }),
      // Re-run unlocks in case the curriculum changed since this was saved.
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<ProgressState>;
        return {
          ...current,
          ...saved,
          nodes: cascadeUnlocks(saved.nodes ?? {}).newNodes,
        };
      },
    },
  ),
);
