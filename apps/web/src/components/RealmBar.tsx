import { REALMS, REALM_ORDER, getNodesForRealm, getRealmProgress, getStatus } from '@mathtree/curriculum';
import { useProgress } from '@/lib/progress-store';

export function RealmBar({ onJump }: { onJump: (realmId: string | number) => void }) {
  const nodes = useProgress(s => s.nodes);
  return (
    <nav className="realm-bar" aria-label="Realms">
      {REALM_ORDER.map(id => {
        const realm = REALMS[id];
        const open = getNodesForRealm(id).some(n => getStatus(n.id, nodes) !== 'locked');
        const pct = getRealmProgress(id, nodes);
        return (
          <button
            key={id}
            className="realm-pip"
            data-open={open || undefined}
            style={{
              ['--realm' as string]: realm.color,
              ['--realm-border' as string]: realm.border,
              ['--pct' as string]: `${pct}%`,
            }}
            onClick={() => onJump(id)}
            title={`${realm.name} — ${pct}% complete${open ? '' : ' (locked)'}`}
            aria-label={`Realm ${realm.label}: ${realm.name}, ${pct}% complete`}
          >
            {realm.label}
          </button>
        );
      })}
    </nav>
  );
}
