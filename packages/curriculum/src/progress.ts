import { NODES, EDGES, REALM_ORDER, getNodesForRealm } from './curriculum.ts';

export type Status = 'locked' | 'available' | 'in_progress' | 'completed' | 'mastered';

export interface NodeProgress {
  status: Status;
  progress: number;
  notes: string;
  completedAt?: string;
}

export type ProgressMap = Record<string, NodeProgress>;

export function getStatus(id: string, nodes: ProgressMap): Status {
  return nodes[id]?.status ?? 'locked';
}

export function canUnlock(id: string, nodes: ProgressMap): boolean {
  const reqEdges = EDGES.filter(e => e.target === id && !e.cross);
  if (reqEdges.length === 0) return true;
  return reqEdges.every(e => {
    const s = getStatus(e.source, nodes);
    return s === 'completed' || s === 'mastered';
  });
}

export function cascadeUnlocks(
  nodes: ProgressMap,
): { newNodes: ProgressMap; newlyUnlocked: string[] } {
  const updated: ProgressMap = { ...nodes };
  const newlyUnlocked: string[] = [];
  let changed = true;

  while (changed) {
    changed = false;
    for (const n of NODES) {
      const st = getStatus(n.id, updated);
      if (st === 'locked' && canUnlock(n.id, updated)) {
        updated[n.id] = { status: 'available', progress: 0, notes: '' };
        newlyUnlocked.push(n.id);
        changed = true;
      }
    }
  }

  return { newNodes: updated, newlyUnlocked };
}

export function getRealmProgress(
  realmId: string | number,
  nodes: ProgressMap,
): number {
  const realmNodes = NODES.filter(
    n =>
      n.realm === realmId ||
      (realmId === '8a' && n.realm === 'cap_a') ||
      (realmId === '8b' && n.realm === 'cap_b'),
  );
  if (!realmNodes.length) return 0;
  const done = realmNodes.filter(n => {
    const s = getStatus(n.id, nodes);
    return s === 'completed' || s === 'mastered';
  }).length;
  return Math.round((done / realmNodes.length) * 100);
}

export function getOverallProgress(nodes: ProgressMap): { completed: number; total: number } {
  const total = NODES.length;
  const completed = NODES.filter(n => {
    const s = getStatus(n.id, nodes);
    return s === 'completed' || s === 'mastered';
  }).length;
  return { completed, total };
}

/** Today's date as YYYY-MM-DD in the learner's local timezone. */
export function localToday(now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(to) - Date.parse(from)) / 86400000);
}

/** Record activity today. Consecutive days extend the streak; a gap restarts it at 1. */
export function updateStreak(
  currentStreak: number,
  lastActiveDate: string | null,
  today = localToday(),
): { streak: number; lastActiveDate: string } {
  if (!lastActiveDate) return { streak: 1, lastActiveDate: today };
  const diff = daysBetween(lastActiveDate, today);
  let streak = currentStreak;
  if (diff === 1) streak = currentStreak + 1;
  else if (diff > 1) streak = 1;
  return { streak, lastActiveDate: today };
}

/** Streak to show right now: it lapses if the learner missed yesterday. */
export function visibleStreak(
  streak: number,
  lastActiveDate: string | null,
  today = localToday(),
): number {
  if (!lastActiveDate) return 0;
  return daysBetween(lastActiveDate, today) <= 1 ? streak : 0;
}

/** Realms that had no unlocked topics in `prev` but have at least one in `next`. */
export function newlyEnteredRealms(
  prev: ProgressMap,
  next: ProgressMap,
): (string | number)[] {
  const entered = (realmId: string | number, nodes: ProgressMap) =>
    getNodesForRealm(realmId).some(n => getStatus(n.id, nodes) !== 'locked');
  return REALM_ORDER.filter(r => !entered(r, prev) && entered(r, next));
}
