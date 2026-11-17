import { useState } from 'react';
import { NODE_BY_ID, RUNG_BY_ID, daysUntilDue, getRealmForNode, getStatus, type ReviewItem } from '@mathtree/curriculum';
import { useProgress } from '@/lib/progress-store';
import { ProblemCard } from './ProblemCard';
import { Progress, Session } from './Session';

const inDays = (n: number) => (n <= 1 ? 'tomorrow' : `in ${n} days`);

interface Props {
  items: ReviewItem[];
  onClose: () => void;
}

/**
 * Mixed review: problems from different completed topics, in shuffled order and without their topic's
 * name on them, so the learner has to recognise which idea applies.
 */
export function Review({ items, onClose }: Props) {
  const recordReview = useProgress(s => s.recordReview);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);

  const item = items[index];
  return (
    <Session kicker="Mixed review" title="Which idea is it?" onClose={onClose}>
      {item ? (
        <>
          <Progress done={index} total={items.length} />
          <ProblemCard
            key={index}
            rungId={item.rungId}
            seed={item.seed}
            oneShot
            kicker={`Problem ${index + 1} of ${items.length}`}
            onOutcome={firstTry => {
              recordReview(item.topicId, firstTry, item.counts);
              setResults(r => [...r, firstTry]);
            }}
            rightText={() => 'Correct!'}
            nextLabel={index === items.length - 1 ? 'Finish' : 'Next problem'}
            onNext={() => setIndex(i => i + 1)}
            after={
              <p className="reveal">
                From <strong>{NODE_BY_ID[item.topicId].label}</strong>: {RUNG_BY_ID[item.rungId].idea.toLowerCase()}.
              </p>
            }
          />
        </>
      ) : (
        <Summary items={items} results={results} onClose={onClose} />
      )}
    </Session>
  );
}

function Summary({ items, results, onClose }: Props & { results: boolean[] }) {
  const nodes = useProgress(s => s.nodes);
  const reviews = useProgress(s => s.reviews);
  const right = results.filter(Boolean).length;

  // One line per topic. A topic asked twice counts as missed if either answer was.
  const topics = [...new Set(items.map(i => i.topicId))].map(id => {
    const mine = items.map((it, i) => ({ ...it, ok: results[i] })).filter(it => it.topicId === id);
    const ok = mine.every(it => it.ok);
    const counted = mine.some(it => it.counts);
    const note = !ok
      ? 'Back tomorrow'
      : !counted
        ? 'Extra practice'
        : getStatus(id, nodes) === 'mastered'
          ? `Mastered · back ${inDays(daysUntilDue(reviews[id]))}`
          : `Back ${inDays(daysUntilDue(reviews[id]))}`;
    return { id, ok, note, mastered: ok && counted && getStatus(id, nodes) === 'mastered' };
  });

  return (
    <div className="card done-card">
      <p className="card-kicker">Review complete</p>
      <h3>{right} of {items.length} on the first try.</h3>
      <p className="card-text">
        {right === items.length
          ? 'Everything held. Topics you keep getting right come back less and less often.'
          : 'The ones you missed come back tomorrow. Open a topic from the tree to practice it again.'}
      </p>
      <ul className="summary-list">
        {topics.map(t => (
          <li key={t.id} data-ok={t.ok || undefined}>
            <span className="dot" style={{ background: getRealmForNode(NODE_BY_ID[t.id]).border }} />
            <span className="summary-topic">{NODE_BY_ID[t.id].label}</span>
            <span className="summary-note">{t.mastered ? '★ ' : t.ok ? '✓ ' : ''}{t.note}</span>
          </li>
        ))}
      </ul>
      <div className="card-actions">
        <button className="btn-primary" autoFocus onClick={onClose}>Back to the tree</button>
      </div>
    </div>
  );
}
