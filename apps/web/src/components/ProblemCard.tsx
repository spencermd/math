import { useState, type FormEvent, type ReactNode } from 'react';
import { RUNG_BY_ID, makeProblem, type Answer, type Step } from '@mathtree/curriculum';
import { VisualView } from './Visual';

export function StepView({ step }: { step: Step }) {
  return (
    <div className="step">
      <p className="card-text">{step.text}</p>
      {step.visual && <VisualView key={JSON.stringify(step.visual)} visual={step.visual} />}
    </div>
  );
}

function answerText(answer: Answer): string {
  if (answer.kind === 'number') return String(answer.value).replace('-', '−');
  if (answer.kind === 'choice') return answer.options[answer.correct];
  return answer.den === 1 ? `${answer.num}` : `${answer.num}/${answer.den}`.replace('-', '−');
}

interface Props {
  rungId: string;
  seed: number;
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

  const solved = result === 'correct';
  // The outcome is settled by the first answer, or by asking to see the solution.
  const settled = attempts > 0 || shown > 0;
  const locked = solved || (oneShot && settled);
  const builtOn = rung.buildsOn ? RUNG_BY_ID[rung.buildsOn] : undefined;

  const submit = (right: boolean) => {
    if (!settled) {
      onOutcome(right);
      setEarned(right);
    }
    setResult(right ? 'correct' : 'wrong');
    setAttempts(a => a + 1);
  };

  const showSolution = () => {
    if (!settled) onOutcome(false);
    setShown(1);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Enter again on an answer already marked wrong moves on to a fresh problem.
    if (result === 'wrong') return onNext();
    if (answer.kind === 'choice') return;
    const [top, bottom = '1', extra] = input.split('/');
    if (top === '' || bottom === '' || extra !== undefined || Number(bottom) === 0 || Number.isNaN(Number(top))) return;
    const [num, den] = [Number(top), Number(bottom)];
    if (answer.kind === 'number') return submit(den === 1 && num === answer.value);
    const sameValue = num * answer.den === answer.num * den;
    // The right value in the wrong form gets a nudge, not a miss.
    if (sameValue && den !== answer.den) return setResult('unreduced');
    submit(sameValue);
  };

  return (
    <div className="card">
      <p className="card-kicker">{kicker}</p>
      <h3 className="prompt">{problem.prompt}</h3>
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
              // Digits, with an optional leading minus sign (a typed hyphen or a pasted "−").
              const raw = e.target.value.replace(/−/g, '-').replace(answer.kind === 'fraction' ? /[^0-9/-]/g : /[^0-9-]/g, '');
              setInput(raw.slice(0, 1) + raw.slice(1).replace(/-/g, ''));
              if (result !== null) setResult(null);
            }}
          />
          {!locked && <button className="btn-primary" type="submit">{result === 'wrong' ? 'New problem' : 'Check'}</button>}
        </form>
      ) : (
        <div className="choices">
          {answer.options.map((option, i) => (
            <button key={option} className="choice" disabled={locked} data-right={(locked && i === answer.correct) || undefined} onClick={() => submit(i === answer.correct)}>
              {option}
            </button>
          ))}
        </div>
      )}

      <div aria-live="polite">
        {result === 'wrong' && (
          <p className="feedback" data-kind="wrong">
            {oneShot
              ? `Not quite. The answer is ${answerText(answer)}.`
              : answer.kind === 'choice'
                ? 'Not quite. Have another look, or use a hint.'
                : 'Not quite. Change your answer to try again, or press Enter for a new problem.'}
          </p>
        )}
        {result === 'unreduced' && <p className="feedback" data-kind="wrong">That&apos;s the right value. Now write it in lowest terms.</p>}
        {oneShot && settled && attempts === 0 && (
          <p className="feedback" data-kind="wrong">The answer is {answerText(answer)}.</p>
        )}
        {solved && <p className="feedback" data-kind="right">{rightText(earned)}</p>}
      </div>

      {settled && after}

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
      </div>
    </div>
  );
}
