import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  cascadeUnlocks,
  newlyEnteredRealms,
  updateStreak,
  type ProgressMap,
  type Status,
} from '@mathtree/curriculum';

// Local-only progress until parent accounts land; then this syncs to the server.

interface ProgressState {
  nodes: ProgressMap;
  streak: number;
  lastActiveDate: string | null;
  /** Realm just entered, shown as a ceremony until dismissed. */
  pendingCeremony: string | number | null;

  setStatus: (id: string, status: Status) => void;
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

      setStatus: (id, status) => {
        const { nodes, streak, lastActiveDate } = get();
        const existing = nodes[id] ?? { status: 'locked', progress: 0, notes: '' };
        const done = status === 'completed' || status === 'mastered';
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

      dismissCeremony: () => set({ pendingCeremony: null }),

      reset: () =>
        set({ nodes: freshNodes(), streak: 0, lastActiveDate: null, pendingCeremony: null }),
    }),
    {
      name: 'mathtree-progress-v1',
      // Rehydrated from SkillTree on mount so server and client render the same first frame.
      skipHydration: true,
      partialize: ({ nodes, streak, lastActiveDate }) => ({ nodes, streak, lastActiveDate }),
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
