import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  cascadeUnlocks,
  updateStreak,
  type NodeProgress,
  type ProgressMap,
} from '../utils/progressEngine';

export type { NodeProgress };

interface ProgressState {
  version: number;
  nodes: ProgressMap;
  streak: number;
  lastActiveDate: string | null;
  isHydrated: boolean;
  /** Set when a new realm is unlocked — cleared by dismissCeremony() */
  pendingCeremony: string | number | null;

  setStatus: (id: string, status: NodeProgress['status'], progress?: number) => void;
  setNotes: (id: string, text: string) => void;
  setProgress: (id: string, progress: number) => void;
  resetProgress: () => void;
  dismissCeremony: () => void;
  hydrate: () => Promise<void>;
}

const STORAGE_KEY = 'arcanum_v2';

const DEFAULT_NODES: ProgressMap = {
  counting: { status: 'available', progress: 0, notes: '' },
};

function persist(nodes: ProgressMap, streak: number, lastActiveDate: string | null) {
  AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ version: 2, nodes, streak, lastActiveDate }),
  ).catch(() => {});
}

/** Detect which realm a set of newly-unlocked node ids belongs to (first one found) */
function detectNewRealm(
  newlyUnlocked: string[],
  prevNodes: ProgressMap,
  nextNodes: ProgressMap,
): string | number | null {
  // Import lazily to avoid circular deps
  const { NODES, REALMS } = require('../data/curriculum') as typeof import('../data/curriculum');
  for (const id of newlyUnlocked) {
    const node = NODES.find(n => n.id === id);
    if (!node) continue;
    const realm = node.realm === 'cap_a' ? '8a' : node.realm === 'cap_b' ? '8b' : node.realm;
    // Check if ANY node in this realm was previously unavailable
    const wasLocked = Object.values(prevNodes).every(
      (p, idx) => {
        const n = NODES[idx];
        return !n || n.realm !== realm || p.status === 'locked';
      },
    );
    if (wasLocked && REALMS[realm]) return realm;
  }
  return null;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  version: 2,
  nodes: DEFAULT_NODES,
  streak: 0,
  lastActiveDate: null,
  isHydrated: false,
  pendingCeremony: null,

  setStatus: (id, status, progress) => {
    const state = get();
    const existing = state.nodes[id] ?? { status: 'locked', progress: 0, notes: '' };
    const updated: NodeProgress = {
      ...existing,
      status,
      progress:
        status === 'completed' || status === 'mastered'
          ? 100
          : progress ?? existing.progress,
      completedAt:
        status === 'completed' || status === 'mastered'
          ? new Date().toISOString()
          : existing.completedAt,
    };
    const merged = { ...state.nodes, [id]: updated };
    const { newNodes, newlyUnlocked } = cascadeUnlocks(merged);
    const pendingCeremony = detectNewRealm(newlyUnlocked, state.nodes, newNodes);
    const today = new Date().toISOString().split('T')[0];
    set({ nodes: newNodes, lastActiveDate: today, pendingCeremony });
    persist(newNodes, state.streak, today);
  },

  setNotes: (id, text) => {
    const state = get();
    const existing = state.nodes[id] ?? { status: 'locked', progress: 0, notes: '' };
    const newNodes = { ...state.nodes, [id]: { ...existing, notes: text } };
    set({ nodes: newNodes });
    persist(newNodes, state.streak, state.lastActiveDate);
  },

  setProgress: (id, progress) => {
    const state = get();
    const existing = state.nodes[id] ?? { status: 'in_progress', progress: 0, notes: '' };
    const newNodes = { ...state.nodes, [id]: { ...existing, progress } };
    set({ nodes: newNodes });
    persist(newNodes, state.streak, state.lastActiveDate);
  },

  resetProgress: () => {
    const { newNodes } = cascadeUnlocks(DEFAULT_NODES);
    set({
      nodes: newNodes,
      streak: 0,
      lastActiveDate: null,
      pendingCeremony: null,
    });
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  },

  dismissCeremony: () => set({ pendingCeremony: null }),

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        type Saved = { nodes: ProgressMap; streak: number; lastActiveDate: string | null };
        const saved = JSON.parse(raw) as Saved;
        const { streak, lastActiveDate } = updateStreak(
          saved.streak ?? 0,
          saved.lastActiveDate ?? null,
        );
        const { newNodes } = cascadeUnlocks(saved.nodes ?? DEFAULT_NODES);
        set({ nodes: newNodes, streak, lastActiveDate, isHydrated: true });
        persist(newNodes, streak, lastActiveDate);
      } else {
        const { newNodes } = cascadeUnlocks(DEFAULT_NODES);
        set({ nodes: newNodes, isHydrated: true });
      }
    } catch {
      const { newNodes } = cascadeUnlocks(DEFAULT_NODES);
      set({ nodes: newNodes, isHydrated: true });
    }
  },
}));
