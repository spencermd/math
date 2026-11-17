import { NODE_BY_ID, dailyPlan, isDone, speedPool } from '@mathtree/curriculum';
import { useShallow } from 'zustand/react/shallow';
import { useProgress } from '@/lib/progress-store';

interface Props {
  onReview: () => void;
  onLearn: (topicId: string) => void;
  onSpeed: () => void;
}

/**
 * What to do today, in one button: clear the reviews that are due, then climb one new step. Once that's
 * done it steps aside for the optional extras.
 */
export function TodayBar({ onReview, onLearn, onSpeed }: Props) {
  const plan = useProgress(useShallow(dailyPlan));
  const anyDone = useProgress(s => Object.values(s.nodes).some(n => isDone(n.status)));
  const canSpeed = useProgress(s => speedPool(s.nodes, s.practice).length > 0);
  const { due, steps, focus } = plan;

  const reviewText = `Review ${due} topic${due === 1 ? '' : 's'}`;
  return (
    <div className="today-bar">
      {plan.done ? (
        <span className="today-done">
          <strong>✓ Done for today</strong>
          {anyDone && <button className="link-btn" onClick={onReview}>Mixed practice</button>}
        </span>
      ) : due > 0 ? (
        <button className="today-main" onClick={onReview}>
          <strong>Today</strong>
          <span>{steps === 0 && focus ? `${reviewText}, then one new step` : reviewText}</span>
        </button>
      ) : (
        focus && (
          <button className="today-main" onClick={() => onLearn(focus)}>
            <strong>Today</strong>
            <span>One new step in {NODE_BY_ID[focus].label}</span>
          </button>
        )
      )}
      {canSpeed && (
        <button className="today-speed" onClick={onSpeed} title="Timed, contest-style practice">
          ⚡ Speed round
        </button>
      )}
    </div>
  );
}
