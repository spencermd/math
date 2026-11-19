import { getOverallProgress, visibleStreak } from '@mathtree/curriculum';
import { useProgress } from '@/lib/progress-store';
import { useLook } from '@/lib/look-store';
import { AvatarBadge } from './Avatar';

export function TopBar({ onBadges, onWardrobe }: { onBadges: () => void; onWardrobe: () => void }) {
  const avatar = useLook(s => s.avatar);
  const sound = useLook(s => s.sound);
  const setSound = useLook(s => s.setSound);
  const badges = useProgress(s => Object.keys(s.badges).length);
  const nodes = useProgress(s => s.nodes);
  const streak = useProgress(s => visibleStreak(s.streak, s.lastActiveDate));
  const reset = useProgress(s => s.reset);
  const { completed, total } = getOverallProgress(nodes);

  return (
    <header className="top-bar">
      <div className="brand-row">
        <button className="avatar-button" onClick={onWardrobe} aria-label="Your character: open the Wardrobe" title="Dress up your character">
          <AvatarBadge avatar={avatar} size={42} />
        </button>
        <h1 className="brand">MathTree</h1>
      </div>
      <div className="stats">
        <span title="Topics completed">
          <strong>{completed}</strong> / {total}<span className="stat-label"> topics</span>
        </span>
        <span title="Days in a row">
          🔥 <strong>{streak}</strong><span className="stat-label"> day{streak === 1 ? '' : 's'}</span>
        </span>
        <button className="btn-ghost badge-count" onClick={onBadges} aria-label={`Badges: ${badges} earned`}>
          🏅 <strong>{badges}</strong><span className="stat-label"> badge{badges === 1 ? '' : 's'}</span>
        </button>
        <button
          className="btn-ghost sound-toggle"
          onClick={() => setSound(!sound)}
          aria-pressed={sound}
          aria-label={sound ? 'Sound on. Turn sound off' : 'Sound off. Turn sound on'}
          title={sound ? 'Sound is on' : 'Sound is off'}
        >
          {sound ? '🔊' : '🔇'}
        </button>
        <button
          className="btn-ghost"
          onClick={() => confirm('Start over? This erases all progress on this device.') && reset()}
        >
          Reset
        </button>
      </div>
    </header>
  );
}
