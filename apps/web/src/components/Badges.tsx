import { useEffect } from 'react';
import { BADGES, BADGE_BY_ID } from '@mathtree/curriculum';
import { useProgress } from '@/lib/progress-store';

/** Announces each newly earned badge in turn, over whatever the learner is doing. */
export function BadgeToast() {
  const id = useProgress(s => s.unseenBadges[0]);
  const dismiss = useProgress(s => s.dismissBadge);

  useEffect(() => {
    if (!id) return;
    const timer = setTimeout(dismiss, 4500);
    return () => clearTimeout(timer);
  }, [id, dismiss]);

  const badge = id ? BADGE_BY_ID[id] : undefined;
  if (!badge) return null;
  return (
    <button key={id} className="badge-toast" onClick={dismiss} aria-live="polite">
      <span className="badge-icon" aria-hidden>{badge.icon}</span>
      <span>
        <span className="badge-toast-kicker">{badge.secret ? 'Secret badge found' : 'Badge earned'}</span>
        <strong>{badge.name}</strong>
        <span className="badge-how">{badge.how}</span>
      </span>
    </button>
  );
}

/** Every badge: the ones earned, the ones still to earn, and blanks where the secret ones are. */
export function BadgeGallery({ onClose }: { onClose: () => void }) {
  const held = useProgress(s => s.badges);
  const earned = BADGES.filter(b => b.id in held).length;
  const secretsLeft = BADGES.filter(b => b.secret && !(b.id in held)).length;

  return (
    <div className="ceremony" role="dialog" aria-modal="true" aria-labelledby="badges-title" onClick={onClose}>
      <div className="gallery" onClick={e => e.stopPropagation()}>
        <button className="panel-close" onClick={onClose} aria-label="Close" autoFocus>×</button>
        <h2 id="badges-title" className="gallery-title">Badges</h2>
        <p className="gallery-sub">
          {earned} of {BADGES.length} earned
          {secretsLeft > 0 && ` · ${secretsLeft} secret badge${secretsLeft === 1 ? '' : 's'} still hidden`}
        </p>
        <ul className="badge-grid">
          {BADGES.map(b => {
            const got = b.id in held;
            const hidden = b.secret && !got;
            return (
              <li key={b.id} className="badge" data-earned={got || undefined} data-secret={b.secret || undefined}>
                <span className="badge-icon" aria-hidden>{hidden ? '?' : b.icon}</span>
                <strong>{hidden ? 'Secret badge' : b.name}</strong>
                <span className="badge-how">{hidden ? 'Keep playing to find it.' : b.how}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
