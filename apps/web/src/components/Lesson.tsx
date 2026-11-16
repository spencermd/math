import { useState, type FormEvent } from 'react';
import {
  LESSONS,
  NODE_BY_ID,
  RUNG_BY_ID,
  RUNG_GOAL,
  getRealmForNode,
  isRungCleared,
  makeProblem,
  topicOfRung,
  type Rung,
  type Step,
} from '@mathtree/curriculum';
import { useProgress } from '@/lib/progress-store';
import { VisualView } from './Visual';

type View =
  | { mode: 'learn'; step: number }
  | { mode: 'practice'; rungId: string; seed: number }
  | { mode: 'done' };

// Only called from event handlers, so rendering stays pure.
const newSeed = () => Math.floor(Math.random() * 2 ** 31);

interface Props {
  topicId: string;
  onClose: () => void;
}

/** Full-screen lesson: an interactive explanation, then the topic's ladder of problems. */
export function Lesson({ topicId: homeTopic, onClose }: Props) {
  const practice = useProgress(s => s.practice);
  // Stepping back to an earlier idea can lead into a prerequisite topic's lesson.
  const [topicId, setTopicId] = useState(homeTopic);
  const [view, setView] = useState<View>({ mode: 'learn', step: 0 });

  const lesson = LESSONS[topicId];
  const topic = NODE_BY_ID[topicId];
  const realm = getRealmForNode(topic);

  const openRung = (rungId: string) => {
    setTopicId(topicOfRung(rungId));
    setView({ mode: 'practice', rungId, seed: newSeed() });
  };

  const startPractice = () => {
    const next = lesson.rungs.find(r => !isRungCleared(r.id, practice)) ?? lesson.rungs[0];
    openRung(next.id);
  };

  // After a correct answer: stay on the rung until it's cleared, then climb.
  const advance = (rungId: string) => {
    const latest = useProgress.getState().practice;
    const justCleared = (latest[rungId] ?? 0) === RUNG_GOAL;
    if (!justCleared) return openRung(rungId);
    const next = lesson.rungs.find(r => !isRungCleared(r.id, latest));
    if (next) openRung(next.id);
    else setView({ mode: 'done' });
  };

  return (
    <div
      className="lesson"
      role="dialog"
      aria-modal="true"
      aria-label={`${topic.label} lesson`}
      style={{ ['--realm' as string]: realm.border, ['--realm-deep' as string]: realm.color }}
    >
      <header className="lesson-head">
        <div>
          <p className="lesson-realm">Realm {realm.label} · {realm.name}</p>
          <h2 className="lesson-title">{topic.label}</h2>
        </div>
        <button className="btn-ghost" onClick={onClose}>Back to the tree</button>
      </header>

      <div className="lesson-body">
        <nav className="ladder" aria-label="Lesson steps">
          {topicId !== homeTopic && (
            <button
              className="ladder-home"
              onClick={() => {
                setTopicId(homeTopic);
                setView({ mode: 'learn', step: 0 });
              }}
            >
              ← Back to {NODE_BY_ID[homeTopic].label}
            </button>
          )}
          <button
            className="ladder-item"
            data-current={view.mode === 'learn' || undefined}
            onClick={() => setView({ mode: 'learn', step: 0 })}
          >
            <span className="ladder-idea">Learn the idea</span>
          </button>
          {lesson.rungs.map(rung => {
            const got = Math.min(practice[rung.id] ?? 0, RUNG_GOAL);
            return (
              <button
                key={rung.id}
                className="ladder-item"
                data-current={(view.mode === 'practice' && view.rungId === rung.id) || undefined}
                data-cleared={got >= RUNG_GOAL || undefined}
                onClick={() => openRung(rung.id)}
              >
                <span className="ladder-idea">{rung.idea}</span>
                <span className="pips" aria-label={`${got} of ${RUNG_GOAL} solved`}>
                  {Array.from({ length: RUNG_GOAL }, (_, i) => (
                    <span key={i} className="pip" data-on={i < got || undefined} />
                  ))}
                </span>
              </button>
            );
          })}
        </nav>

        <main className="stage">
          {view.mode === 'learn' && (
            <Explanation
              key={topicId}
              steps={lesson.intro}
              start={view.step}
              onStep={step => setView({ mode: 'learn', step })}
              onDone={startPractice}
            />
          )}
          {view.mode === 'practice' && (
            <ProblemCard
              key={`${view.rungId}:${view.seed}`}
              rung={RUNG_BY_ID[view.rungId]}
              seed={view.seed}
              onNext={() => advance(view.rungId)}
              onStepBack={openRung}
            />
          )}
          {view.mode === 'done' && (
            <div className="card done-card">
              <p className="card-kicker">Topic complete</p>
              <h3>You&apos;ve mastered every step of {topic.label}.</h3>
              <p className="card-text">The topics that build on it are now open on your tree.</p>
              <div className="card-actions">
                <button className="btn-primary" onClick={onClose}>Back to the tree</button>
                <button className="btn-ghost" onClick={startPractice}>Keep practicing</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function StepView({ step }: { step: Step }) {
  return (
    <div className="step">
      <p className="card-text">{step.text}</p>
      {step.visual && <VisualView key={JSON.stringify(step.visual)} visual={step.visual} />}
    </div>
  );
}

function Explanation({
  steps,
  start,
  onStep,
  onDone,
}: {
  steps: Step[];
  start: number;
  onStep: (step: number) => void;
  onDone: () => void;
}) {
  const last = start === steps.length - 1;
  return (
    <div className="card">
      <p className="card-kicker">The idea · {start + 1} of {steps.length}</p>
      <StepView key={start} step={steps[start]} />
      <div className="card-actions">
        {last ? (
          <button className="btn-primary" onClick={onDone}>Try some problems</button>
        ) : (
          <button className="btn-primary" onClick={() => onStep(start + 1)}>Next</button>
        )}
        {start > 0 && <button className="btn-ghost" onClick={() => onStep(start - 1)}>Back</button>}
      </div>
    </div>
  );
}

function ProblemCard({
  rung,
  seed,
  onNext,
  onStepBack,
}: {
  rung: Rung;
  seed: number;
  onNext: () => void;
  onStepBack: (rungId: string) => void;
}) {
  const recordCorrect = useProgress(s => s.recordCorrect);
  const count = useProgress(s => s.practice[rung.id] ?? 0);
  const problem = makeProblem(rung.id, seed);
  const { answer } = problem;

  const [input, setInput] = useState('');
  const [result, setResult] = useState<'correct' | 'wrong' | 'unreduced' | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [earned, setEarned] = useState(false);
  const [hints, setHints] = useState(0);
  const [shown, setShown] = useState(0); // solution steps revealed

  const solved = result === 'correct';
  const builtOn = rung.buildsOn ? RUNG_BY_ID[rung.buildsOn] : undefined;

  const submit = (right: boolean) => {
    // Credit only counts when it's solved unaided on the first try.
    if (right && attempts === 0 && shown === 0) {
      recordCorrect(rung.id);
      setEarned(true);
    }
    setResult(right ? 'correct' : 'wrong');
    setAttempts(a => a + 1);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Enter again on an answer already marked wrong moves on to a fresh problem.
    if (result === 'wrong') return onNext();
    if (answer.kind === 'choice') return;
    const [top, bottom = '1', extra] = input.split('/');
    if (top === '' || bottom === '' || extra !== undefined || Number(bottom) === 0) return;
    const [num, den] = [Number(top), Number(bottom)];
    if (answer.kind === 'number') return submit(den === 1 && num === answer.value);
    const sameValue = num * answer.den === answer.num * den;
    // The right value in the wrong form gets a nudge, not a miss.
    if (sameValue && den !== answer.den) return setResult('unreduced');
    submit(sameValue);
  };

  return (
    <div className="card">
      <p className="card-kicker">{rung.idea}</p>
      <h3 className="prompt">{problem.prompt}</h3>
      {problem.visual && <VisualView visual={problem.visual} />}

      {answer.kind !== 'choice' ? (
        <form className="answer-row" onSubmit={onSubmit}>
          <input
            className="answer-input"
            inputMode={answer.kind === 'fraction' ? 'text' : 'numeric'}
            autoComplete="off"
            autoFocus
            aria-label="Your answer"
            value={input}
            disabled={solved}
            onChange={e => {
              setInput(e.target.value.replace(answer.kind === 'fraction' ? /[^0-9/]/g : /[^0-9]/g, ''));
              if (result !== null) setResult(null);
            }}
          />
          {!solved && <button className="btn-primary" type="submit">{result === 'wrong' ? 'New problem' : 'Check'}</button>}
        </form>
      ) : (
        <div className="choices">
          {answer.options.map((option, i) => (
            <button key={option} className="choice" disabled={solved} data-right={(solved && i === answer.correct) || undefined} onClick={() => submit(i === answer.correct)}>
              {option}
            </button>
          ))}
        </div>
      )}

      <div aria-live="polite">
        {result === 'wrong' && (
          <p className="feedback" data-kind="wrong">
            {answer.kind === 'choice'
              ? 'Not quite. Have another look, or use a hint.'
              : 'Not quite. Change your answer to try again, or press Enter for a new problem.'}
          </p>
        )}
        {result === 'unreduced' && <p className="feedback" data-kind="wrong">That&apos;s the right value. Now write it in lowest terms.</p>}
        {solved && (
          <p className="feedback" data-kind="right">
            {earned
              ? count >= RUNG_GOAL
                ? 'Correct! You\'ve cleared this step.'
                : `Correct! ${count} of ${RUNG_GOAL} on this step.`
              : 'That\'s it. Solve a fresh one on your first try to earn the point.'}
          </p>
        )}
      </div>

      {problem.hints.slice(0, hints).map((hint, i) => (
        <p className="hint" key={i}><strong>Hint.</strong> {hint}</p>
      ))}

      {shown > 0 && (
        <section className="solution">
          <h4>How to solve it</h4>
          {problem.solution.slice(0, shown).map((step, i) => (
            <StepView key={i} step={step} />
          ))}
          {shown < problem.solution.length && (
            <button className="btn-ghost" onClick={() => setShown(s => s + 1)}>Next step</button>
          )}
        </section>
      )}

      <div className="card-actions">
        {(solved || shown >= problem.solution.length) && (
          // Focused as soon as the answer is right, so Enter carries straight on to the next problem.
          <button key={solved ? 'next' : 'again'} className="btn-primary" autoFocus={solved} onClick={onNext}>{solved ? 'Next problem' : 'Try another like this'}</button>
        )}
        {!solved && hints < problem.hints.length && (
          <button className="btn-ghost" onClick={() => setHints(h => h + 1)}>{hints ? 'Another hint' : 'Hint'}</button>
        )}
        {shown === 0 && (
          <button className="btn-ghost" onClick={() => setShown(1)}>{solved ? 'See how it\'s solved' : 'Show me how'}</button>
        )}
        {builtOn && attempts > 0 && !solved && (
          <button className="btn-ghost" onClick={() => onStepBack(builtOn.id)}>
            Step back: {builtOn.idea}
          </button>
        )}
      </div>
    </div>
  );
}
