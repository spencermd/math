import { NODES } from '@mathtree/curriculum';
import { PhoenixArt } from './PhoenixArt';

interface Props {
  /** Label of the topic a beginner starts with. */
  firstTopic: string;
  onStart: () => void;
  onFactory: () => void;
  onBrowse: () => void;
}

/** First visit: say what this is and offer three ways in. */
export function Welcome({ firstTopic, onStart, onFactory, onBrowse }: Props) {
  return (
    <div className="ceremony" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
      <div className="ceremony-card welcome-card" style={{ ['--realm' as string]: 'var(--gold)', ['--glow' as string]: '#D4A01740' }}>
        <PhoenixArt size={88} className="welcome-phoenix" />
        <p className="ceremony-kicker">Welcome to</p>
        <h2 id="welcome-title" className="brand welcome-brand">MathTree</h2>
        <p className="welcome-text">
          I&apos;m your phoenix guide. This glowing oak holds {NODES.length} topics of contest math, from clever
          arithmetic up to MATHCOUNTS and AMC 8, in six realms kept by foxes, wizards, gnomes, witches, dragons and
          fairies. Every realm is open: learn in any order, or step through the portal for problems.
        </p>
        <button className="btn-primary" onClick={onStart} autoFocus>
          Start with {firstTopic}
        </button>
        <button className="welcome-option" onClick={onFactory}>
          <strong>Just give me problems</strong>
          <span>The Problem Factory makes contest problems from the whole tree, timed or not.</span>
        </button>
        <button className="link-btn" onClick={onBrowse}>Look around the tree first</button>
      </div>
    </div>
  );
}
