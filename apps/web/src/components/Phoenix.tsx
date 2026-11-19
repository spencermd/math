import { useMemo, useState } from 'react';
import { NODES, REALMS, getStatus, isReady, type RealmId } from '@mathtree/curriculum';
import { useProgress } from '@/lib/progress-store';
import { useLook } from '@/lib/look-store';
import { REALM_LOOK } from '@/lib/realm-look';
import { PhoenixArt } from './PhoenixArt';

interface Tip {
  text: string;
  action?: { label: string; run: () => void };
}

interface Props {
  /** The realm just flown to, if any: the phoenix introduces it. */
  realm: RealmId | null;
  /** Bumped on every flight, so flying to the same realm twice still gets its introduction. */
  flight: number;
  due: number;
  onFocus: (topicId: string) => void;
  onReview: () => void;
}

const GENERAL: string[] = [
  'Every realm is open. Wander wherever you like; I will light the way to good next steps.',
  'Thorny branches are the trickiest topics, MATHCOUNTS level. Brave them when you feel ready.',
  'Step through the glowing portal in the trunk for a stream of contest problems from all over the tree.',
  'Tap your character at the top to visit the Wardrobe and dress up.',
  'Finish a topic and a flower blooms on its branch. Master it and the flower turns gold.',
];

/** The phoenix companion: a guide who perches in the corner with a tip and a way forward. */
export function Phoenix({ realm, flight, due, onFocus, onReview }: Props) {
  const nodes = useProgress(s => s.nodes);
  const quiet = useLook(s => s.phoenixQuiet);
  const setQuiet = useLook(s => s.setPhoenixQuiet);
  const [turn, setTurn] = useState(0);
  const [seenFlight, setSeenFlight] = useState(0);

  const tips = useMemo<Tip[]>(() => {
    const out: Tip[] = [];
    const current = NODES.find(n => getStatus(n.id, nodes) === 'in_progress');
    const next = NODES.find(n => isReady(n.id, nodes));
    if (due > 0) {
      out.push({
        text: `${due} topic${due === 1 ? ' is' : 's are'} ready to review. A quick review keeps their branches glowing.`,
        action: { label: 'Review now', run: onReview },
      });
    }
    if (current) {
      out.push({
        text: `You are partway through ${current.label} in ${REALM_LOOK[current.realm].land}. Pick up where you left off?`,
        action: { label: 'Take me there', run: () => onFocus(current.id) },
      });
    }
    if (next && next !== current) {
      out.push({
        text: `${next.label} is ready for you in ${REALM_LOOK[next.realm].land}.`,
        action: { label: 'Show me', run: () => onFocus(next.id) },
      });
    }
    return [...out, ...GENERAL.map(text => ({ text }))];
  }, [nodes, due, onFocus, onReview]);

  const introducing = realm !== null && flight !== seenFlight;
  const tip: Tip = introducing
    ? { text: REALM_LOOK[realm].intro + ` (${REALMS[realm].name})` }
    : tips[turn % tips.length];

  const nextTip = () => {
    if (introducing) setSeenFlight(flight);
    else setTurn(t => t + 1);
    setQuiet(false);
  };

  return (
    <aside className="phoenix" data-quiet={quiet || undefined} aria-label="Phoenix guide">
      {!quiet && (
        <div className="phoenix-bubble" aria-live="polite">
          <p>{tip.text}</p>
          <div className="phoenix-actions">
            {tip.action && (
              <button className="btn-ghost" onClick={tip.action.run}>{tip.action.label}</button>
            )}
            <button className="link-btn" onClick={nextTip}>Another tip</button>
            <button className="link-btn" onClick={() => setQuiet(true)}>Hush</button>
          </div>
        </div>
      )}
      <button
        className="phoenix-perch"
        onClick={nextTip}
        aria-label={quiet ? 'Wake the phoenix guide' : 'Next tip from the phoenix'}
        title="Your phoenix guide"
      >
        <PhoenixArt size={quiet ? 56 : 76} />
      </button>
    </aside>
  );
}
