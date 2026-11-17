import { NODES } from '@mathtree/curriculum';

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
        <p className="ceremony-kicker">Welcome to</p>
        <h2 id="welcome-title" className="brand welcome-brand">MathTree</h2>
        <p className="welcome-text">
          {NODES.length} topics of contest math, from clever arithmetic up to MATHCOUNTS and AMC 8. Every topic is
          open: learn them in any order, or dive into problems and come back for the ones that stump you.
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
