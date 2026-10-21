import { NODES, EDGES } from '../data/curriculum';

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

export function updateStreak(
  currentStreak: number,
  lastActiveDate: string | null,
): { streak: number; lastActiveDate: string } {
  const today = new Date().toISOString().split('T')[0];
  if (!lastActiveDate) return { streak: 1, lastActiveDate: today };
  const diff = Math.floor(
    (new Date(today).getTime() - new Date(lastActiveDate).getTime()) / 86400000,
  );
  let streak = currentStreak;
  if (diff === 1) streak = currentStreak + 1;
  else if (diff > 1) streak = 0;
  return { streak, lastActiveDate: today };
}
