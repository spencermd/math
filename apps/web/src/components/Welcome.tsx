import { NODES, PLACEMENT_TOPICS } from '@mathtree/curriculum';

interface Props {
  /** Label of the topic a beginner starts with. */
  firstTopic: string;
  onStart: () => void;
  onPlacement: () => void;
  onBrowse: () => void;
}

/** First visit: say what this is and offer a way in, for a beginner or for someone who knows the basics. */
export function Welcome({ firstTopic, onStart, onPlacement, onBrowse }: Props) {
  return (
    <div className="ceremony" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
      <div className="ceremony-card welcome-card" style={{ ['--realm' as string]: 'var(--gold)', ['--glow' as string]: '#D4A01740' }}>
        <p className="ceremony-kicker">Welcome to</p>
        <h2 id="welcome-title" className="brand welcome-brand">MathTree</h2>
        <p className="welcome-text">
          {NODES.length} topics of contest math, from clever arithmetic up to MATHCOUNTS and AMC 8. Each topic is
          one short idea and a handful of problems. Finish one and the topics that build on it open up.
        </p>
        <button className="btn-primary" onClick={onStart} autoFocus>
          Start with {firstTopic}
        </button>
        <button className="welcome-option" onClick={onPlacement}>
          <strong>I know some of this already</strong>
          <span>Find my level: up to {PLACEMENT_TOPICS.length} questions, and you skip what you can already do.</span>
        </button>
        <button className="link-btn" onClick={onBrowse}>Just show me the tree</button>
      </div>
    </div>
  );
}
