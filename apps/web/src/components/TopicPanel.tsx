import {
  NODES,
  PREREQS,
  CHILDREN,
  EDGES,
  getRealmForNode,
  getStatus,
  type Status,
} from '@mathtree/curriculum';
import { useProgress } from '@/lib/progress-store';

const isDone = (s: Status) => s === 'completed' || s === 'mastered';

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
}

export function TopicPanel({ topicId, onClose, onSelect }: Props) {
  const nodes = useProgress(s => s.nodes);
  const setStatus = useProgress(s => s.setStatus);

  const topic = NODES.find(n => n.id === topicId);
  if (!topic) return null;
  const realm = getRealmForNode(topic);
  const status = getStatus(topic.id, nodes);
  // Cross-path links are suggestions, not requirements.
  const required = new Set(EDGES.filter(e => e.target === topic.id && !e.cross).map(e => e.source));
  const missing = PREREQS[topic.id].filter(id => required.has(id) && !isDone(getStatus(id, nodes)));

  return (
    <aside className="panel" style={{ ['--realm' as string]: realm.border }} aria-label={topic.label}>
      <button className="panel-close" onClick={onClose} aria-label="Close">×</button>

      <p className="panel-realm" style={{ color: realm.border }}>
        Realm {realm.label} · {realm.name}
      </p>
      <h2 className="panel-title">{topic.label}</h2>
      <p className="panel-status" data-status={status}>{STATUS_TEXT[status]}</p>
      <p className="panel-desc">{topic.d}</p>

      <div className="panel-actions">
        {status === 'locked' && <p className="panel-hint">Finish the topics below to unlock this one.</p>}
        {status === 'available' && (
          <button className="btn-primary" onClick={() => setStatus(topic.id, 'in_progress')}>
            Start learning
          </button>
        )}
        {status === 'in_progress' && (
          <>
            <button className="btn-primary" onClick={() => setStatus(topic.id, 'completed')}>
              I&apos;ve got it!
            </button>
            <p className="panel-hint">Practice checks will replace this button soon.</p>
          </>
        )}
        {isDone(status) && <p className="panel-hint">Nice work. Its next topics are now open.</p>}
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
          const t = NODES.find(n => n.id === id)!;
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
