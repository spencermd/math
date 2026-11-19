import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  MASTERY_STAGE,
  NODE_BY_ID,
  MASTERY,
  NO_STATS,
  addAttempt,
  countAnswer,
  firstReview,
  getStatus,
  gradeReview,
  isDone,
  lessonProgress,
  localToday,
  newBadges,
  topicOfRung,
  updateStreak,
  type AnswerEvent,
  type AnswerMode,
  type Attempt,
  type MasteryMap,
  type PracticeMap,
  type ProgressMap,
  type ReviewMap,
  type Stats,
  type Status,
} from '@mathtree/curriculum';

// Local-only progress until parent accounts land; then this syncs to the server.

interface ProgressState {
  /** Topics that have been begun. One that's missing hasn't been, and is open like every other. */
  nodes: ProgressMap;
  streak: number;
  lastActiveDate: string | null;
  /** First-try correct answers per problem rung. */
  practice: PracticeMap;
  /** When each completed topic next comes up for review. */
  reviews: ReviewMap;
  /** The first-visit welcome has been answered. */
  welcomed: boolean;
  /** Best timed-round score, by mode and scope. */
  bests: Record<string, number>;
  /** Running totals that badges are judged on. */
  stats: Stats;
  /** Badges earned: id → the date. */
  badges: Record<string, string>;
  /** Recent Problem Factory problems per topic, with their times and tries, for contest-readiness levels. */
  mastery: MasteryMap;
  /** Badges earned but not yet announced, oldest first. Not saved. */
  unseenBadges: string[];

  /** `proved` marks a topic completed by challenge rather than by its lesson. */
  setStatus: (id: string, status: Status, proved?: boolean) => void;
  /** Credit a first-try correct answer. Clearing a topic's whole ladder completes the topic. */
  recordCorrect: (rungId: string) => void;
  /**
   * Record a review problem. A miss always brings the topic back tomorrow; a first-try answer moves it
   * on only when the topic was due (`counts`), and enough of those master it.
   */
  recordReview: (topicId: string, firstTry: boolean, counts: boolean) => void;
  /** Note any answer to any problem, for the running totals and the badges that watch single answers. */
  recordAnswer: (given: GivenAnswer) => void;
  /**
   * File a finished problem toward its topic's level, if it came from a mode that counts. Give `ms`, or
   * `shownAt` (clock time the problem appeared) and the store reads the clock. Returns what was filed.
   */
  recordAttempt: (attempt: Omit<Attempt, 'at' | 'ms'> & { ms?: number; shownAt?: number }, mode: AnswerMode) => Attempt;
  /** Keep a timed-round score if it beats the best so far. */
  recordScore: (key: string, score: number) => void;
  setWelcomed: () => void;
  /** Hand out badges that saved progress has already earned, such as from before badges existed. */
  checkBadges: () => void;
  dismissBadge: () => void;
  reset: () => void;
}

/** An answer as the screen reports it; the store reads the clock. */
export interface GivenAnswer extends Omit<AnswerEvent, 'ms' | 'at' | 'msLeft'> {
  /** Clock time the problem appeared, in ms. */
  shownAt: number;
  /** Clock time the problem's timer runs out, in a timed round. */
  deadline?: number;
}

/** Every completed topic is on the review schedule; ones saved before reviews existed are due now. */
function withReviews(reviews: ReviewMap, nodes: ProgressMap, due?: string): ReviewMap {
  const out = { ...reviews };
  for (const [id, node] of Object.entries(nodes)) {
    if (isDone(node.status) && !out[id]) out[id] = due ? { stage: 0, due } : firstReview();
  }
  return out;
}

const FRESH = {
  nodes: {},
  streak: 0,
  lastActiveDate: null,
  practice: {},
  reviews: {},
  welcomed: false,
  bests: {},
  stats: NO_STATS,
  badges: {},
  mastery: {},
  unseenBadges: [],
};

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => {
      /** Hand out any badges the latest change earned. */
      const award = (event?: AnswerEvent) => {
        const state = get();
        const earned = newBadges(state.badges, state, event);
        if (!earned.length) return;
        const today = localToday();
        set({
          badges: { ...state.badges, ...Object.fromEntries(earned.map(id => [id, today])) },
          unseenBadges: [...state.unseenBadges, ...earned],
        });
      };
      const active = () => updateStreak(get().streak, get().lastActiveDate);

      return {
        ...FRESH,

        setStatus: (id, status, proved = false) => {
          const { nodes, reviews, stats } = get();
          const existing = nodes[id] ?? { status: 'available', progress: 0, notes: '' };
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
          set({
            nodes: merged,
            reviews: withReviews(reviews, merged),
            stats: proved ? { ...stats, proved: stats.proved + 1 } : stats,
            ...active(),
          });
          award();
        },

        recordCorrect: rungId => {
          const { practice } = get();
          const next = { ...practice, [rungId]: (practice[rungId] ?? 0) + 1 };
          set({ practice: next, ...active() });

          const topic = topicOfRung(rungId);
          if (lessonProgress(topic, next) === 100 && !isDone(getStatus(topic, get().nodes))) {
            get().setStatus(topic, 'completed');
          } else {
            award();
          }
        },

        recordReview: (topicId, firstTry, counts) => {
          const { nodes, reviews } = get();
          if (firstTry && !counts) return set(active());
          const next = gradeReview(reviews[topicId], firstTry);
          const node = nodes[topicId];
          const mastered = next.stage >= MASTERY_STAGE && node?.status === 'completed';
          set({
            reviews: { ...reviews, [topicId]: next },
            nodes: mastered ? { ...nodes, [topicId]: { ...node, status: 'mastered' } } : nodes,
            ...active(),
          });
          award();
        },

        recordAnswer: ({ shownAt, deadline, ...given }) => {
          const at = Date.now();
          const event: AnswerEvent = {
            ...given,
            at,
            ms: at - shownAt,
            msLeft: deadline === undefined ? undefined : deadline - at,
          };
          const realm = NODE_BY_ID[topicOfRung(event.rungId)].realm;
          set({ stats: countAnswer(get().stats, event, realm), ...(event.right ? active() : {}) });
          award(event);
        },

        recordAttempt: ({ shownAt, ms, ...given }, mode) => {
          const at = Date.now();
          const attempt: Attempt = { ...given, ms: ms ?? at - (shownAt ?? at), at };
          if (MASTERY.countedModes.includes(mode)) set({ mastery: addAttempt(get().mastery, attempt) });
          return attempt;
        },

        recordScore: (key, score) => {
          const { bests } = get();
          if (score > (bests[key] ?? 0)) set({ bests: { ...bests, [key]: score } });
          award();
        },

        setWelcomed: () => set({ welcomed: true }),

        checkBadges: () => award(),

        dismissBadge: () => set({ unseenBadges: get().unseenBadges.slice(1) }),

        reset: () => set(FRESH),
      };
    },
    {
      // v2: the competition-math tree. Progress saved against the earlier K–college tree doesn't carry over.
      // A preview build sets NEXT_PUBLIC_STORAGE_SUFFIX so trying it out never touches real progress.
      name: `mathtree-progress-v2${process.env.NEXT_PUBLIC_STORAGE_SUFFIX ?? ''}`,
      // Rehydrated from SkillTree on mount so server and client render the same first frame.
      skipHydration: true,
      partialize: ({ nodes, streak, lastActiveDate, practice, reviews, welcomed, bests, stats, badges, mastery }) => ({
        nodes,
        streak,
        lastActiveDate,
        practice,
        reviews,
        welcomed,
        bests,
        stats,
        badges,
        mastery,
      }),
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<ProgressState>;
        // Topics used to be locked until their prerequisites were done; any saved that way are simply open now.
        const nodes = Object.fromEntries(
          Object.entries(saved.nodes ?? {}).filter(([, node]) => (node.status as string) !== 'locked'),
        );
        return {
          ...current,
          ...saved,
          nodes,
          stats: { ...NO_STATS, ...saved.stats },
          // Saves from before levels existed have no record yet.
          mastery: saved.mastery ?? {},
          reviews: withReviews(saved.reviews ?? {}, nodes, localToday()),
        };
      },
    },
  ),
);
