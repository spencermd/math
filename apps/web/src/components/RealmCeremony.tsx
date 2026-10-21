import { REALMS, gradeLabel } from '@mathtree/curriculum';

interface Props {
  realmId: string | number;
  onEnter: () => void;
}

export function RealmCeremony({ realmId, onEnter }: Props) {
  const realm = REALMS[realmId];
  if (!realm) return null;
  return (
    <div className="ceremony" role="dialog" aria-modal="true" aria-labelledby="ceremony-title">
      <div className="ceremony-card" style={{ ['--realm' as string]: realm.border, ['--glow' as string]: realm.glow }}>
        <p className="ceremony-kicker">A new realm opens</p>
        <div className="ceremony-sigil" style={{ color: realm.border }}>{realm.label}</div>
        <h2 id="ceremony-title" style={{ color: realm.border }}>{realm.name}</h2>
        <p className="ceremony-sub">{realm.sub}</p>
        <p className="ceremony-grades">{gradeLabel(realm)} math</p>
        <button className="btn-primary" onClick={onEnter} autoFocus>
          Enter the realm
        </button>
      </div>
    </div>
  );
}
