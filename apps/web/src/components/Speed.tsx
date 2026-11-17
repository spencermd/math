import { useEffect, useState, type FormEvent } from 'react';
import {
  COUNTDOWN_PROBLEMS,
  COUNTDOWN_SECONDS,
  NODE_BY_ID,
  REALMS,
  REALM_ORDER,
  RUNG_BY_ID,
  SPEED_FORMATS,
  SPRINT_SECONDS,
  answerText,
  buildSpeedRound,
  checkTyped,
  cleanInput,
  diagnose,
  getStatus,
  isDone,
  makeProblem,
  parseTyped,
  scopeKey,
  speedPool,
  topicOfRung,
  type SpeedFormat,
  type SpeedItem,
  type SpeedScope,
} from '@mathtree/curriculum';
import { useProgress } from '@/lib/progress-store';
import { StepView } from './ProblemCard';
import { Session } from './Session';
import { VisualView } from './Visual';

interface Answered extends SpeedItem {
  outcome: 'right' | 'wrong' | 'timeout';
  /** What the learner answered, as they gave it. */
  given?: string;
  /** What a wrong answer suggests went wrong. */
  note?: string | null;
}

interface Run {
  format: SpeedFormat;
  key: string;
  items: SpeedItem[];
  answered: Answered[];
  /** Clock time the round (sprint) or the current problem (countdown) runs out, in ms. */
  deadline: number;
  now: number;
  /** Best score for this format and scope before the round began. */
  best: number;
  over: boolean;
}

const score = (run: Run) => run.answered.filter(a => a.outcome === 'right').length;

/** Move the clock on. Running out ends a sprint, and costs a countdown its current problem. */
function tick(run: Run, now: number): Run {
  if (run.over || now < run.deadline) return run.over ? run : { ...run, now };
  if (run.format === 'sprint') return { ...run, now, over: true };
  return record(run, { outcome: 'timeout' }, now);
}

function record(run: Run, result: Pick<Answered, 'outcome' | 'given' | 'note'>, now: number): Run {
  if (run.over) return run;
  const answered = [...run.answered, { ...run.items[run.answered.length], ...result }];
  return {
    ...run,
    answered,
    now,
    over: answered.length >= run.items.length,
    deadline: run.format === 'countdown' ? now + COUNTDOWN_SECONDS * 1000 : run.deadline,
  };
}

const clock = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

interface Props {
  /** Where to draw problems from to begin with; the learner can change it before starting. */
  scope: SpeedScope;
  onClose: () => void;
}

/** Timed, contest-style practice on what the learner has already covered: one answer each, no hints, keep moving. */
export function Speed({ scope: initialScope, onClose }: Props) {
  const [format, setFormat] = useState<SpeedFormat>('sprint');
  const [scope, setScope] = useState(initialScope);
  const [run, setRun] = useState<Run | null>(null);
  const live = run !== null && !run.over;

  useEffect(() => {
    if (!live) return;
    const timer = setInterval(() => setRun(r => r && tick(r, Date.now())), 200);
    return () => clearInterval(timer);
  }, [live]);

  // Keep the score once the round ends.
  const finished = run?.over ? run : null;
  useEffect(() => {
    if (finished) useProgress.getState().recordSpeed(finished.key, score(finished));
  }, [finished]);

  const start = () => {
    const { nodes, practice, bests } = useProgress.getState();
    const pool = speedPool(nodes, practice, scope);
    if (!pool.length) return;
    const key = `${format}:${scopeKey(scope)}`;
    const now = Date.now();
    setRun({
      format,
      key,
      // A sprint needs more problems than anyone can finish.
      items: buildSpeedRound(pool, format === 'sprint' ? 90 : COUNTDOWN_PROBLEMS, Math.random),
      answered: [],
      deadline: now + (format === 'sprint' ? SPRINT_SECONDS : COUNTDOWN_SECONDS) * 1000,
      now,
      best: bests[key] ?? 0,
      over: false,
    });
  };

  const answer = (result: Pick<Answered, 'outcome' | 'given' | 'note'>) => {
    if (!run) return;
    // A wrong answer on a finished topic brings it back in tomorrow's review. Running out of time doesn't.
    const topicId = topicOfRung(run.items[run.answered.length].rungId);
    const { nodes, recordReview } = useProgress.getState();
    if (result.outcome === 'wrong' && isDone(getStatus(topicId, nodes))) recordReview(topicId, false, false);
    setRun(r => r && record(r, result, Date.now()));
  };

  return (
    <Session
      kicker="Speed round"
      title={run ? SPEED_FORMATS[run.format].name : 'Against the clock'}
      closeLabel={live ? 'End round' : 'Back to the tree'}
      onClose={live ? () => setRun(r => r && { ...r, over: true }) : onClose}
    >
      {!run ? (
        <Setup format={format} scope={scope} onFormat={setFormat} onScope={setScope} onStart={start} />
      ) : run.over ? (
        <Results run={run} onAgain={() => setRun(null)} onClose={onClose} />
      ) : (
        <Round run={run} onAnswer={answer} />
      )}
    </Session>
  );
}

function Setup({
  format,
  scope,
  onFormat,
  onScope,
  onStart,
}: {
  format: SpeedFormat;
  scope: SpeedScope;
  onFormat: (f: SpeedFormat) => void;
  onScope: (s: SpeedScope) => void;
  onStart: () => void;
}) {
  const nodes = useProgress(s => s.nodes);
  const practice = useProgress(s => s.practice);
  const best = useProgress(s => s.bests[`${format}:${scopeKey(scope)}`] ?? 0);

  const scopes: { scope: SpeedScope; label: string }[] = [
    { scope: { kind: 'all' }, label: 'Everything I\'ve covered' },
    ...REALM_ORDER.filter(realm => speedPool(nodes, practice, { kind: 'realm', realm }).length > 0).map(realm => ({
      scope: { kind: 'realm', realm } as SpeedScope,
      label: REALMS[realm].name,
    })),
    ...(scope.kind === 'topic' ? [{ scope, label: NODE_BY_ID[scope.topicId].label }] : []),
  ];
  const count = speedPool(nodes, practice, scope).length;

  return (
    <div className="card">
      <p className="card-kicker">Contest practice</p>
      <h3>Quick answers, no hints, keep moving.</h3>
      <p className="card-text">
        Every problem is from a step you&apos;ve already cleared. You get one answer each, and you see the ones
        you missed at the end.
      </p>

      <div className="option-row" role="radiogroup" aria-label="Format">
        {(Object.keys(SPEED_FORMATS) as SpeedFormat[]).map(f => (
          <button key={f} className="option" role="radio" aria-checked={f === format} onClick={() => onFormat(f)}>
            <strong>{SPEED_FORMATS[f].name}</strong>
            <span>{SPEED_FORMATS[f].blurb}</span>
          </button>
        ))}
      </div>

      <div className="chip-row" role="radiogroup" aria-label="Topics">
        {scopes.map(s => (
          <button
            key={scopeKey(s.scope)}
            className="chip"
            role="radio"
            aria-checked={scopeKey(s.scope) === scopeKey(scope)}
            onClick={() => onScope(s.scope)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="card-actions">
        <button className="btn-primary" autoFocus onClick={onStart} disabled={count === 0}>Start</button>
        <span className="speed-meta">
          Drawn from {count} step{count === 1 ? '' : 's'} you&apos;ve cleared{best > 0 && ` · your best: ${best}`}
        </span>
      </div>
    </div>
  );
}

function Round({ run, onAnswer }: { run: Run; onAnswer: (result: Pick<Answered, 'outcome' | 'given' | 'note'>) => void }) {
  const index = run.answered.length;
  const left = run.deadline - run.now;
  const total = (run.format === 'sprint' ? SPRINT_SECONDS : COUNTDOWN_SECONDS) * 1000;
  const last = run.answered[index - 1];

  return (
    <>
      <div className="speed-head">
        <span className="speed-clock" data-low={left <= 10000 || undefined} aria-label="Time left">{clock(left)}</span>
        <span className="speed-score">
          {run.format === 'countdown' && `Problem ${index + 1} of ${run.items.length} · `}
          <strong>{score(run)}</strong> correct
        </span>
      </div>
      <div className="session-progress" data-low={left <= 10000 || undefined}>
        <span style={{ width: `${Math.max(0, (left / total) * 100)}%` }} />
      </div>
      <SpeedProblem key={index} item={run.items[index]} onAnswer={onAnswer} />
      <p className="speed-last" data-outcome={last?.outcome} aria-live="polite">
        {last &&
          (last.outcome === 'right'
            ? '✓ Correct'
            : `${last.outcome === 'timeout' ? 'Out of time' : '✗ Not that one'}. It was ${answerText(makeProblem(last.rungId, last.seed).answer)}.`)}
      </p>
    </>
  );
}

function SpeedProblem({ item, onAnswer }: { item: SpeedItem; onAnswer: (result: Pick<Answered, 'outcome' | 'given' | 'note'>) => void }) {
  const problem = makeProblem(item.rungId, item.seed);
  const { answer } = problem;
  const [input, setInput] = useState('');
  const [unreduced, setUnreduced] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const typed = parseTyped(input);
    if (!typed || answer.kind === 'choice') return;
    const verdict = checkTyped(answer, typed);
    if (verdict === 'unreduced') return setUnreduced(true);
    onAnswer(verdict === 'right' ? { outcome: 'right' } : { outcome: 'wrong', given: input, note: diagnose(problem, typed) });
  };

  return (
    <div className="card">
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
            onChange={e => {
              setInput(cleanInput(e.target.value, answer.kind === 'fraction'));
              setUnreduced(false);
            }}
          />
          <button className="btn-primary" type="submit">Enter</button>
        </form>
      ) : (
        <div className="choices">
          {answer.options.map((option, i) => (
            <button
              key={option}
              className="choice"
              onClick={() => onAnswer(i === answer.correct ? { outcome: 'right' } : { outcome: 'wrong', given: option })}
            >
              {option}
            </button>
          ))}
        </div>
      )}
      {unreduced && <p className="feedback" data-kind="wrong">Right value. Write it in lowest terms.</p>}
    </div>
  );
}

function Results({ run, onAgain, onClose }: { run: Run; onAgain: () => void; onClose: () => void }) {
  const right = score(run);
  const missed = run.answered.filter(a => a.outcome !== 'right');
  const attempted = run.answered.length;
  return (
    <>
      <div className="card done-card">
        <p className="card-kicker">{SPEED_FORMATS[run.format].name} · round over</p>
        <h3>
          {run.format === 'sprint'
            ? `${right} correct in ${SPRINT_SECONDS / 60} minutes.`
            : `${right} of ${attempted} correct.`}
        </h3>
        <p className="card-text">
          {right > run.best && run.best > 0
            ? `A new best. Your old one was ${run.best}.`
            : right > run.best
              ? 'That\'s your first score to beat.'
              : `Your best is ${run.best}.`}
          {run.format === 'sprint' && attempted > 0 && ` You answered ${attempted} and got ${right} right.`}
        </p>
        <div className="card-actions">
          <button className="btn-primary" autoFocus onClick={onAgain}>Go again</button>
          <button className="btn-ghost" onClick={onClose}>Back to the tree</button>
        </div>
      </div>

      {missed.length > 0 && (
        <div className="card">
          <p className="card-kicker">The ones that got away</p>
          <ul className="missed-list">
            {missed.map((m, i) => {
              const problem = makeProblem(m.rungId, m.seed);
              return (
                <li key={i}>
                  <p className="missed-prompt">{problem.prompt}</p>
                  {problem.visual && <VisualView visual={problem.visual} />}
                  <p className="missed-answer">
                    {m.outcome === 'timeout' ? 'Out of time. ' : `You said ${m.given?.replace('-', '−')}. `}
                    <strong>Answer: {answerText(problem.answer)}</strong>
                  </p>
                  {m.note && <p className="feedback-note">{m.note}</p>}
                  <details className="missed-solution">
                    <summary>
                      How to solve it · {NODE_BY_ID[topicOfRung(m.rungId)].label}: {RUNG_BY_ID[m.rungId].idea.toLowerCase()}
                    </summary>
                    {problem.solution.map((step, j) => (
                      <StepView key={j} step={step} />
                    ))}
                  </details>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
}
