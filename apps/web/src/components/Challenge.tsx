import { useState } from 'react';
import { NODE_BY_ID, RUNG_BY_ID, getRealmForNode } from '@mathtree/curriculum';
import { useProgress } from '@/lib/progress-store';
import { ProblemCard } from './ProblemCard';
import { Progress, Session } from './Session';

export interface ChallengeItem {
  rungId: string;
  seed: number;
}

interface Props {
  topicId: string;
  /** One problem from each step of the topic's lesson. */
  items: ChallengeItem[];
  onClose: () => void;
  onLearn: (topicId: string) => void;
}

/** Skip a topic by proving it: every step's problem, first try, with no hints. One miss ends the attempt. */
export function Challenge({ topicId, items, onClose, onLearn }: Props) {
  const setStatus = useProgress(s => s.setStatus);
  const [index, setIndex] = useState(0);
  const [missed, setMissed] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const topic = NODE_BY_ID[topicId];
  const realm = getRealmForNode(topic);
  const item = items[index];
  const last = index === items.length - 1;

  return (
    <Session kicker={`Prove it · ${realm.name}`} title={topic.label} color={realm.border} onClose={onClose}>
      {failed && missed ? (
        <div className="card done-card">
          <p className="card-kicker">Not this time</p>
          <h3>This topic has something new for you.</h3>
          <p className="card-text">
            The one that got away: {RUNG_BY_ID[missed].idea.toLowerCase()}. The lesson builds up to it step by step.
          </p>
          <div className="card-actions">
            <button className="btn-primary" autoFocus onClick={() => onLearn(topicId)}>Start the lesson</button>
            <button className="btn-ghost" onClick={onClose}>Back to the tree</button>
          </div>
        </div>
      ) : item ? (
        <>
          <Progress done={index} total={items.length} />
          <ProblemCard
            key={index}
            rungId={item.rungId}
            seed={item.seed}
            mode="challenge"
            oneShot
            kicker={`Problem ${index + 1} of ${items.length} · no hints`}
            onOutcome={firstTry => {
              if (!firstTry) setMissed(item.rungId);
              else if (last) setStatus(topicId, 'completed', true);
            }}
            rightText={() => (last ? 'Correct! That\'s all of them.' : 'Correct!')}
            nextLabel={missed ? 'Continue' : last ? 'Finish' : 'Next problem'}
            onNext={() => (missed ? setFailed(true) : setIndex(i => i + 1))}
          />
        </>
      ) : (
        <div className="card done-card">
          <p className="card-kicker">Topic complete</p>
          <h3>You already had {topic.label}.</h3>
          <p className="card-text">
            It&apos;s marked complete on your tree, and it will come up in review in a couple of days to make
            sure.
          </p>
          <div className="card-actions">
            <button className="btn-primary" autoFocus onClick={onClose}>Back to the tree</button>
          </div>
        </div>
      )}
    </Session>
  );
}
