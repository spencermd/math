import { getOverallProgress, visibleStreak } from '@mathtree/curriculum';
import { useProgress } from '@/lib/progress-store';

export function TopBar({ onBadges }: { onBadges: () => void }) {
  const badges = useProgress(s => Object.keys(s.badges).length);
  const nodes = useProgress(s => s.nodes);
  const streak = useProgress(s => visibleStreak(s.streak, s.lastActiveDate));
  const reset = useProgress(s => s.reset);
  const { completed, total } = getOverallProgress(nodes);

  return (
    <header className="top-bar">
      <h1 className="brand">MathTree</h1>
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
          className="btn-ghost"
          onClick={() => confirm('Start over? This erases all progress on this device.') && reset()}
        >
          Reset
        </button>
      </div>
    </header>
  );
}
