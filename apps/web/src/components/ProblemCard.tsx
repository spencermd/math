import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import {
  RUNG_BY_ID,
  answerText,
  checkTyped,
  cleanInput,
  diagnose,
  makeProblem,
  parseTyped,
  type AnswerMode,
  type Step,
} from '@mathtree/curriculum';
import { useProgress } from '@/lib/progress-store';
import { MathText } from './MathText';
import { VisualView } from './Visual';

export function StepView({ step }: { step: Step }) {
  return (
    <div className="step">
      <p className="card-text"><MathText text={step.text} /></p>
      {step.visual && <VisualView key={JSON.stringify(step.visual)} visual={step.visual} />}
    </div>
  );
}

interface Props {
  rungId: string;
  seed: number;
  /** Where the problem is being worked on, for the record of answers. */
  mode: AnswerMode;
  /** Small label above the prompt. */
  kicker: string;
  /**
   * One answer only, with no hints: a check of what the learner already knows. Otherwise it's practice,
   * where a miss can be corrected and hints are on offer.
   */
  oneShot?: boolean;
  /** Called once, when the problem is first answered or given up on: was it solved unaided on the first try? */
  onOutcome: (firstTry: boolean) => void;
  /** What to say once the answer is right. */
  rightText: (earned: boolean) => string;
  onNext: () => void;
  nextLabel?: string;
  /** Offer the earlier idea this one builds on after a miss. */
  onStepBack?: (rungId: string) => void;
  /** Shown once the outcome is settled. */
  after?: ReactNode;
}

export function ProblemCard({
  rungId,
  seed,
  mode,
  kicker,
  oneShot = false,
  onOutcome,
  rightText,
  onNext,
  nextLabel = 'Next problem',
  onStepBack,
  after,
}: Props) {
  const rung = RUNG_BY_ID[rungId];
  const problem = makeProblem(rungId, seed);
  const { answer } = problem;

  const [input, setInput] = useState('');
  const [result, setResult] = useState<'correct' | 'wrong' | 'unreduced' | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [earned, setEarned] = useState(false);
  const [hints, setHints] = useState(0);
  const [shown, setShown] = useState(0); // solution steps revealed
  // What the latest wrong answer suggests went wrong, and whether a hint was opened in reply to it.
  const [note, setNote] = useState<string | null>(null);
  const [nudged, setNudged] = useState(false);

  const shownAt = useRef(0);
  useEffect(() => {
    shownAt.current = Date.now();
  }, []);

  const solved = result === 'correct';
  // The outcome is settled by the first answer, or by asking to see the solution.
  const settled = attempts > 0 || shown > 0;
  const locked = solved || (oneShot && settled);
  const builtOn = rung.buildsOn ? RUNG_BY_ID[rung.buildsOn] : undefined;

  const submit = (right: boolean, why: string | null = null) => {
    if (!settled) {
      onOutcome(right);
      setEarned(right);
    }
    useProgress.getState().recordAnswer({
      rungId,
      right,
      attempt: attempts + 1,
      aided: shown > 0,
      mode,
      answer,
      shownAt: shownAt.current,
    });
    setResult(right ? 'correct' : 'wrong');
    setAttempts(a => a + 1);
    setNote(why);
    // A miss with nothing specific to say about it gets the next hint instead, so there is always a way forward.
    const nudge = !right && !oneShot && !why && shown === 0 && hints < problem.hints.length;
    setNudged(nudge);
    if (nudge) setHints(h => h + 1);
  };

  const showSolution = () => {
    if (!settled) onOutcome(false);
    setShown(1);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    // An answer already marked wrong has to change before it's checked again.
    if (result === 'wrong' || answer.kind === 'choice') return;
    const typed = parseTyped(input);
    if (!typed) return;
    const verdict = checkTyped(answer, typed);
    // The right value in the wrong form gets a nudge, not a miss.
    if (verdict === 'unreduced') return setResult('unreduced');
    submit(verdict === 'right', verdict === 'right' ? null : diagnose(problem, typed));
  };

  return (
    <div className="card">
      <p className="card-kicker">{kicker}</p>
      <h3 className="prompt"><MathText text={problem.prompt} /></h3>
      {problem.visual && <VisualView visual={problem.visual} />}

      {answer.kind !== 'choice' ? (
        <form className="answer-row" onSubmit={onSubmit}>
          <input
            className="answer-input"
            inputMode="text"
            autoComplete="off"
            autoFocus
            aria-label="Your answer"
            value={input}
            disabled={locked}
            onChange={e => {
              setInput(cleanInput(e.target.value, answer.kind === 'fraction'));
              if (result !== null) setResult(null);
            }}
          />
          {!locked && <button className="btn-primary" type="submit" disabled={result === 'wrong'}>Check</button>}
        </form>
      ) : (
        <div className="choices">
          {answer.options.map((option, i) => (
            <button key={option} className="choice" disabled={locked} data-right={(locked && i === answer.correct) || undefined} onClick={() => submit(i === answer.correct)}>
              <MathText text={option} />
            </button>
          ))}
        </div>
      )}

      <div aria-live="polite">
        {result === 'wrong' && (
          <p className="feedback" data-kind="wrong">
            {oneShot
              ? `Not quite. The answer is ${answerText(answer)}.`
              : note
                ? `Not quite. ${note}`
                : nudged
                  ? `Not quite. Here's a hint. ${answer.kind === 'choice' ? 'Pick again.' : 'Change your answer to try again.'}`
                  : `Not quite. ${answer.kind === 'choice' ? 'Pick again' : 'Change your answer to try again'}, or see how it's solved.`}
          </p>
        )}
        {result === 'wrong' && oneShot && note && <p className="feedback-note"><MathText text={note} /></p>}
        {result === 'unreduced' && <p className="feedback" data-kind="wrong">That&apos;s the right value. Now write it in lowest terms.</p>}
        {oneShot && settled && attempts === 0 && (
          <p className="feedback" data-kind="wrong">The answer is {answerText(answer)}.</p>
        )}
        {solved && <p className="feedback" data-kind="right">{rightText(earned)}</p>}
      </div>

      {settled && after}

      {problem.hints.slice(0, hints).map((hint, i) => (
        <p className="hint" key={i}><strong>Hint.</strong> <MathText text={hint} /></p>
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
        {(locked || shown >= problem.solution.length) && (
          // Focused as soon as the answer is settled, so Enter carries straight on to the next problem.
          <button key={locked ? 'next' : 'again'} className="btn-primary" autoFocus={locked} onClick={onNext}>
            {locked ? nextLabel : 'Try another like this'}
          </button>
        )}
        {!locked && !oneShot && hints < problem.hints.length && (
          <button className="btn-ghost" onClick={() => setHints(h => h + 1)}>{hints ? 'Another hint' : 'Hint'}</button>
        )}
        {shown === 0 && (
          <button className="btn-ghost" onClick={showSolution}>
            {locked ? 'See how it\'s solved' : oneShot ? 'I\'m not sure' : 'Show me how'}
          </button>
        )}
        {onStepBack && builtOn && attempts > 0 && !solved && (
          <button className="btn-ghost" onClick={() => onStepBack(builtOn.id)}>
            Step back: {builtOn.idea}
          </button>
        )}
        {!locked && attempts > 0 && shown < problem.solution.length && (
          <button className="btn-ghost" onClick={onNext}>Skip this one</button>
        )}
      </div>
    </div>
  );
}
