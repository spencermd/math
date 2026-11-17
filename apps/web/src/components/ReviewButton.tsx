import { dueTopics, isDone } from '@mathtree/curriculum';
import { useProgress } from '@/lib/progress-store';

/** The way into mixed review. It calls for attention when topics are due, and offers extra practice when none are. */
export function ReviewButton({ onStart }: { onStart: () => void }) {
  const due = useProgress(s => dueTopics(s.reviews, s.nodes).length);
  const any = useProgress(s => Object.values(s.nodes).some(n => isDone(n.status)));
  if (!any) return null;
  return (
    <button className="review-button" data-due={due > 0 || undefined} onClick={onStart}>
      {due > 0 ? (
        <>
          <strong>Review</strong>
          <span>{due} topic{due === 1 ? '' : 's'} due</span>
        </>
      ) : (
        <>
          <strong>Mixed practice</strong>
          <span>Nothing due today</span>
        </>
      )}
    </button>
  );
}
