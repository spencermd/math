import { useState } from 'react';
import {
  NODE_BY_ID,
  NODES,
  PLACEMENT_TOPICS,
  getRealmForNode,
  getStatus,
  nextPlacementTopic,
  placementRung,
} from '@mathtree/curriculum';
import { useProgress } from '@/lib/progress-store';
import { ProblemCard } from './ProblemCard';
import { Session } from './Session';

export interface PlacementItem {
  topicId: string;
  seed: number;
}

interface Props {
  first: PlacementItem;
  /** Seed for each later problem. Called from event handlers only. */
  newSeed: () => number;
  onClose: () => void;
}

/**
 * Find the learner's level: one hard problem from each Foundations topic they can reach. A first-try
 * answer completes that topic and opens the next ones; a miss leaves it for them to learn.
 */
export function Placement({ first, newSeed, onClose }: Props) {
  const setStatus = useProgress(s => s.setStatus);
  const [current, setCurrent] = useState<PlacementItem | null>(first);
  const [asked, setAsked] = useState<string[]>([]);
  const [skipped, setSkipped] = useState<string[]>([]);

  const next = () => {
    const done = [...asked, current!.topicId];
    const topicId = nextPlacementTopic(useProgress.getState().nodes, done);
    setAsked(done);
    setCurrent(topicId ? { topicId, seed: newSeed() } : null);
  };

  return (
    <Session
      kicker="Find my level"
      title="Show what you know"
      closeLabel={current ? 'Stop here' : 'See my tree'}
      onClose={current ? () => setCurrent(null) : onClose}
    >
      {current ? (
        <>
          <p className="session-note">
            Question {asked.length + 1} of at most {PLACEMENT_TOPICS.length}. No hints here, and a miss costs nothing: it
            just means that topic stays on your tree to learn.
          </p>
          <ProblemCard
            key={current.topicId}
            rungId={placementRung(current.topicId)}
            seed={current.seed}
            oneShot
            kicker={NODE_BY_ID[current.topicId].label}
            onOutcome={firstTry => {
              if (!firstTry) return;
              setStatus(current.topicId, 'completed');
              setSkipped(s => [...s, current.topicId]);
            }}
            rightText={() => 'Correct! You can skip this topic.'}
            nextLabel="Next question"
            onNext={next}
          />
        </>
      ) : (
        <PlacementSummary skipped={skipped} onClose={onClose} />
      )}
    </Session>
  );
}

function TopicChips({ ids }: { ids: string[] }) {
  return (
    <ul className="chips">
      {ids.map(id => (
        <li key={id}>
          <span className="dot" style={{ background: getRealmForNode(NODE_BY_ID[id]).border }} />
          {NODE_BY_ID[id].label}
        </li>
      ))}
    </ul>
  );
}

function PlacementSummary({ skipped, onClose }: { skipped: string[]; onClose: () => void }) {
  const nodes = useProgress(s => s.nodes);
  const open = NODES.filter(n => getStatus(n.id, nodes) === 'available').map(n => n.id);
  return (
    <div className="card done-card">
      <p className="card-kicker">Your level</p>
      <h3>
        {skipped.length
          ? `You skipped ${skipped.length} topic${skipped.length === 1 ? '' : 's'}.`
          : 'You\'re starting from the roots.'}
      </h3>
      {skipped.length > 0 ? (
        <>
          <TopicChips ids={skipped} />
          <p className="card-text">
            They&apos;re marked complete, and they&apos;ll come up in review in a couple of days to make sure.
          </p>
        </>
      ) : (
        <p className="card-text">That&apos;s the right place to begin: every later topic leans on these ideas.</p>
      )}
      {open.length > 0 && (
        <>
          <p className="card-text">Ready for you to start:</p>
          <TopicChips ids={open} />
        </>
      )}
      <div className="card-actions">
        <button className="btn-primary" autoFocus onClick={onClose}>See my tree</button>
      </div>
    </div>
  );
}
