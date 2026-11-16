import {
  LESSONS,
  NODE_BY_ID,
  PREREQS,
  CHILDREN,
  REQUIRED,
  TIER_LABEL,
  getRealmForNode,
  getStatus,
  isDone,
  lessonProgress,
  type Status,
} from '@mathtree/curriculum';
import { useProgress } from '@/lib/progress-store';

const STATUS_TEXT: Record<Status, string> = {
  locked: 'Locked',
  available: 'Ready to start',
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
}

export function TopicPanel({ topicId, onClose, onSelect, onPractice }: Props) {
  const nodes = useProgress(s => s.nodes);
  const practice = useProgress(s => s.practice);
  const setStatus = useProgress(s => s.setStatus);

  const topic = NODE_BY_ID[topicId];
  if (!topic) return null;
  const realm = getRealmForNode(topic);
  const status = getStatus(topic.id, nodes);
  // Cross-path links are suggestions, not requirements.
  const hasLesson = topic.id in LESSONS;
  const climbed = lessonProgress(topic.id, practice);
  const missing = REQUIRED[topic.id].filter(id => !isDone(getStatus(id, nodes)));

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
        {status === 'locked' && <p className="panel-hint">Finish the topics below to unlock this one.</p>}
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
        {isDone(status) && <p className="panel-hint">Nice work. Its next topics are now open.</p>}
        {isDone(status) && hasLesson && (
          <button className="btn-ghost panel-again" onClick={() => onPractice(topic.id)}>
            Practice again
          </button>
        )}
      </div>

      <TopicList
        title={status === 'locked' ? 'Finish first' : 'Builds on'}
        ids={status === 'locked' ? missing : PREREQS[topic.id]}
        onSelect={onSelect}
      />
      <TopicList title="Unlocks" ids={CHILDREN[topic.id]} onSelect={onSelect} />
    </aside>
  );
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
              <button onClick={() => onSelect(id)} data-status={s}>
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
