import { useProgressStore } from '../store/progressStore';
import { getStatus, canUnlock, getRealmProgress, getOverallProgress } from '../utils/progressEngine';
import { REALM_ORDER } from '../data/curriculum';

export function useTopicStatus(id: string) {
  const nodes = useProgressStore(s => s.nodes);
  return getStatus(id, nodes);
}

export function useCanUnlock(id: string) {
  const nodes = useProgressStore(s => s.nodes);
  return canUnlock(id, nodes);
}

export function useRealmProgress(realmId: string | number) {
  const nodes = useProgressStore(s => s.nodes);
  return getRealmProgress(realmId, nodes);
}

export function useOverallProgress() {
  const nodes = useProgressStore(s => s.nodes);
  return getOverallProgress(nodes);
}

export function useCurrentRealm(): string | number {
  const nodes = useProgressStore(s => s.nodes);
  let current: string | number = 1;
  for (const id of Object.keys(nodes)) {
    const s = getStatus(id, nodes);
    if (s === 'available' || s === 'in_progress') {
      const nodeModule = require('../data/curriculum') as typeof import('../data/curriculum');
      const node = nodeModule.NODES.find(n => n.id === id);
      if (node) {
        const realm = node.realm === 'cap_a' ? '8a' : node.realm === 'cap_b' ? '8b' : node.realm;
        if (REALM_ORDER.indexOf(realm) > REALM_ORDER.indexOf(current)) {
          current = realm;
        }
      }
    }
  }
  return current;
}
