import {
  LESSONS,
  NODE_BY_ID,
  PREREQS,
  CHILDREN,
  TIER_LABEL,
  daysUntilDue,
  getRealmForNode,
  getStatus,
  isDone,
  lessonProgress,
  type Status,
} from '@mathtree/curriculum';
import { useProgress } from '@/lib/progress-store';

const STATUS_TEXT: Record<Status, string> = {
  available: 'Not started',
  in_progress: 'Learning',
  completed: 'Completed',
  mastered: 'Mastered',
};

interface Props {
  topicId: string;
  onClose: () => void;
  onSelect: (id: string) => void;
  /** Open the topic's lesson. */
  onPractice: (id: string) => void;
  /** Try to skip the topic by solving a problem from each of its steps. */
  onChallenge: (id: string) => void;
  /** Open the Problem Factory on this topic alone. */
  onFactory: (id: string) => void;
}

export function TopicPanel({ topicId, onClose, onSelect, onPractice, onChallenge, onFactory }: Props) {
  const reviews = useProgress(s => s.reviews);
  const nodes = useProgress(s => s.nodes);
  const practice = useProgress(s => s.practice);
  const setStatus = useProgress(s => s.setStatus);

  const topic = NODE_BY_ID[topicId];
  if (!topic) return null;
  const realm = getRealmForNode(topic);
  const status = getStatus(topic.id, nodes);
  const hasLesson = topic.id in LESSONS;
  const climbed = lessonProgress(topic.id, practice);
  const missing = PREREQS[topic.id].filter(id => !isDone(getStatus(id, nodes)));

  return (
    <aside className="panel" style={{ ['--realm' as string]: realm.border }} aria-label={topic.label}>
      <button className="panel-close" onClick={onClose} aria-label="Close">×</button>

      <p className="panel-realm" style={{ color: realm.border }}>
        Realm {realm.label} · {realm.name}
      </p>
      <h2 className="panel-title">{topic.label}</h2>
      <div className="panel-badges">
        <span className="panel-status" data-status={status}>{STATUS_TEXT[status]}</span>
        <span className="panel-grade">{TIER_LABEL[topic.tier]}</span>
      </div>
      <p className="panel-desc">{topic.d}</p>

      <div className="panel-actions">
        {status === 'available' && (
          <button
            className="btn-primary"
            onClick={() => {
              setStatus(topic.id, 'in_progress');
              if (hasLesson) onPractice(topic.id);
            }}
          >
            Start learning
          </button>
        )}
        {status === 'in_progress' && hasLesson && (
          <>
            <button className="btn-primary" onClick={() => onPractice(topic.id)}>
              Keep practicing
            </button>
            <p className="panel-hint">{climbed}% of the way there. Finish every step to complete this topic.</p>
          </>
        )}
        {status === 'in_progress' && !hasLesson && (
          <>
            <button className="btn-primary" onClick={() => setStatus(topic.id, 'completed')}>
              I&apos;ve got it!
            </button>
            <p className="panel-hint">Problems for this topic aren&apos;t written yet, so mark it yourself for now.</p>
          </>
        )}
        {(status === 'available' || status === 'in_progress') && hasLesson && climbed < 100 && (
          <div className="panel-skip">
            <button className="btn-ghost" onClick={() => onChallenge(topic.id)}>
              Know this already? Prove it
            </button>
            <p className="panel-hint">
              Solve one problem from each step on your first try, with no hints, and the topic is done.
            </p>
          </div>
        )}
        {isDone(status) && hasLesson && (
          <p className="panel-hint">
            {reviewNote(daysUntilDue(reviews[topic.id]))}
            {status === 'completed' && ' Get it right in two reviews to master it.'}
          </p>
        )}
        {isDone(status) && hasLesson && (
          <div className="panel-more">
            <button className="btn-ghost" onClick={() => onPractice(topic.id)}>Practice again</button>
          </div>
        )}
        {hasLesson && (
          <div className="panel-more">
            <button className="btn-ghost" onClick={() => onFactory(topic.id)}>🏭 Problems from this topic</button>
          </div>
        )}
      </div>

      <TopicList title="Builds on" ids={PREREQS[topic.id]} onSelect={onSelect} />
      {!isDone(status) && missing.length > 0 && (
        <p className="panel-hint">
          You can start here anyway. If it feels steep, {missing.length === 1 ? 'that topic is' : 'those topics are'} the
          place to go first.
        </p>
      )}
      <TopicList title="Unlocks" ids={CHILDREN[topic.id]} onSelect={onSelect} />
    </aside>
  );
}

function reviewNote(days: number): string {
  if (days <= 0) return 'Due for review now.';
  return `Comes back in review ${days === 1 ? 'tomorrow' : `in ${days} days`}.`;
}

function TopicList({ title, ids, onSelect }: { title: string; ids: string[]; onSelect: (id: string) => void }) {
  const nodes = useProgress(s => s.nodes);
  if (!ids.length) return null;
  return (
    <section className="panel-list">
      <h3>{title}</h3>
      <ul>
        {ids.map(id => {
          const t = NODE_BY_ID[id];
          const s = getStatus(id, nodes);
          return (
            <li key={id}>
              <button onClick={() => onSelect(id)}>
                <span className="dot" style={{ background: getRealmForNode(t).color }} />
                {t.label}
                {isDone(s) && <span aria-label="done"> ✓</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
