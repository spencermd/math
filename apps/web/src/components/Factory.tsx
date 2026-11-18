import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  COUNTDOWN_PROBLEMS,
  COUNTDOWN_SECONDS,
  FACTORY_MODES,
  NODE_BY_ID,
  REALMS,
  REALM_ORDER,
  RUNG_BY_ID,
  SPRINT_SECONDS,
  TIER_LABEL,
  answerText,
  buildFactoryRun,
  checkTyped,
  cleanInput,
  diagnose,
  dueTopics,
  factoryPool,
  getStatus,
  isDone,
  makeProblem,
  parseTyped,
  scopeKey,
  targetMs,
  topicMetrics,
  topicOfRung,
  type FactoryItem,
  type FactoryMode,
  type FactoryScope,
  type Attempt,
  type Tier,
} from '@mathtree/curriculum';
import { useProgress } from '@/lib/progress-store';
import { MathText } from './MathText';
import { ProblemCard, StepView } from './ProblemCard';
import { LevelChip, measures, stopwatch } from './Readiness';
import { Session } from './Session';
import { VisualView } from './Visual';

type Timed = Exclude<FactoryMode, 'free'>;

interface Answered extends FactoryItem {
  outcome: 'right' | 'wrong' | 'timeout';
  /** What the learner answered, as they gave it. */
  given?: string;
  /** What a wrong answer suggests went wrong. */
  note?: string | null;
}
type Result = Pick<Answered, 'outcome' | 'given' | 'note'>;

/** A timed round in progress or just finished. */
interface Run {
  mode: Timed;
  key: string;
  items: FactoryItem[];
  answered: Answered[];
  /** Clock time the round (sprint) or the current problem (countdown) runs out, in ms. */
  deadline: number;
  now: number;
  /** Best score for this mode and scope before the round began. */
  best: number;
  over: boolean;
}

/** An untimed run of problems. */
interface Free {
  items: FactoryItem[];
  index: number;
  solved: number;
  streak: number;
}

const score = (run: Run) => run.answered.filter(a => a.outcome === 'right').length;

/** Move the clock on. Running out ends a sprint, and costs a countdown its current problem. */
function tick(run: Run, now: number): Run {
  if (run.over) return run;
  if (now < run.deadline) return { ...run, now };
  if (run.mode === 'sprint') return { ...run, now, over: true };
  return record(run, { outcome: 'timeout' }, now);
}

function record(run: Run, result: Result, now: number): Run {
  if (run.over) return run;
  const answered = [...run.answered, { ...run.items[run.answered.length], ...result }];
  return {
    ...run,
    answered,
    now,
    over: answered.length >= run.items.length,
    deadline: run.mode === 'countdown' ? now + COUNTDOWN_SECONDS * 1000 : run.deadline,
  };
}

const clock = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

/** A wrong answer on a finished topic brings it back in tomorrow's review. */
function noteMiss(rungId: string) {
  const topicId = topicOfRung(rungId);
  const { nodes, recordReview } = useProgress.getState();
  if (isDone(getStatus(topicId, nodes))) recordReview(topicId, false, false);
}

interface Props {
  /** Which problems to make to begin with; the learner can change it before starting. */
  scope: FactoryScope;
  onClose: () => void;
  /** Leave for the tree, to study this topic. */
  onStudy: (topicId: string) => void;
  /** Switch to a review of finished topics. */
  onReview: () => void;
}

/**
 * The Problem Factory: contest problems from anywhere on the tree, with or without a clock. Each one
 * names its topic once it's answered, with a way straight back to the tree to study it.
 */
export function Factory({ scope: initialScope, onClose, onStudy, onReview }: Props) {
  const [mode, setMode] = useState<FactoryMode | 'review'>('free');
  const [scope, setScope] = useState(initialScope);
  const [run, setRun] = useState<Run | null>(null);
  const [free, setFree] = useState<Free | null>(null);
  const live = run !== null && !run.over;

  useEffect(() => {
    if (!live) return;
    const timer = setInterval(() => setRun(r => r && tick(r, Date.now())), 200);
    return () => clearInterval(timer);
  }, [live]);

  // A countdown problem that runs out of time counts against its topic's level.
  const filed = useRef(0);
  useEffect(() => {
    if (!run) {
      filed.current = 0;
      return;
    }
    if (run.answered.length < filed.current) filed.current = 0;
    for (const a of run.answered.slice(filed.current)) {
      if (a.outcome === 'timeout') {
        useProgress
          .getState()
          .recordAttempt({ rungId: a.rungId, ms: COUNTDOWN_SECONDS * 1000, tries: 0, hints: 0, solved: false, timedOut: true }, run.mode);
      }
    }
    filed.current = run.answered.length;
  }, [run]);

  // Keep the score once a timed round ends.
  const finished = run?.over ? run : null;
  useEffect(() => {
    if (finished) useProgress.getState().recordScore(finished.key, score(finished));
  }, [finished]);

  const start = () => {
    if (mode === 'review') return onReview();
    const pool = factoryPool(scope);
    if (!pool.length) return;
    if (mode === 'free') {
      return setFree({ items: buildFactoryRun(pool, 300, Math.random), index: 0, solved: 0, streak: 0 });
    }
    const key = `${mode}:${scopeKey(scope)}`;
    const now = Date.now();
    setRun({
      mode,
      key,
      // A sprint needs more problems than anyone can finish.
      items: buildFactoryRun(pool, mode === 'sprint' ? 90 : COUNTDOWN_PROBLEMS, Math.random),
      answered: [],
      deadline: now + (mode === 'sprint' ? SPRINT_SECONDS : COUNTDOWN_SECONDS) * 1000,
      now,
      best: useProgress.getState().bests[key] ?? 0,
      over: false,
    });
  };

  const answer = (result: Result) => {
    if (!run) return;
    if (result.outcome === 'wrong') noteMiss(run.items[run.answered.length].rungId);
    setRun(r => r && record(r, result, Date.now()));
  };

  const toSetup = () => {
    setRun(null);
    setFree(null);
  };

  const title = run ? FACTORY_MODES[run.mode].name : free ? FACTORY_MODES.free.name : 'Problem Factory';
  return (
    <Session
      kicker={run || free ? 'Problem Factory' : 'Contest practice'}
      title={title}
      closeLabel={live ? 'End round' : 'Back to the tree'}
      onClose={live ? () => setRun(r => r && { ...r, over: true }) : onClose}
    >
      {run ? (
        run.over ? (
          <Results run={run} onAgain={toSetup} onClose={onClose} onStudy={onStudy} />
        ) : (
          <Round run={run} onAnswer={answer} />
        )
      ) : free ? (
        <FreePlay free={free} onChange={setFree} onSetup={toSetup} onStudy={onStudy} />
      ) : (
        <Setup mode={mode} scope={scope} onMode={setMode} onScope={setScope} onStart={start} />
      )}
    </Session>
  );
}

function Setup({
  mode,
  scope,
  onMode,
  onScope,
  onStart,
}: {
  mode: FactoryMode | 'review';
  scope: FactoryScope;
  onMode: (m: FactoryMode | 'review') => void;
  onScope: (s: FactoryScope) => void;
  onStart: () => void;
}) {
  const best = useProgress(s => s.bests[`${mode}:${scopeKey(scope)}`] ?? 0);
  const due = useProgress(s => dueTopics(s.reviews, s.nodes).length);
  const anyDone = useProgress(s => Object.values(s.nodes).some(n => isDone(n.status)));

  const modes: { id: FactoryMode | 'review'; name: string; blurb: string }[] = [
    ...(Object.keys(FACTORY_MODES) as FactoryMode[]).map(id => ({ id, ...FACTORY_MODES[id] })),
    ...(anyDone
      ? [
          {
            id: 'review' as const,
            name: 'Review',
            blurb: due > 0 ? `${due} finished topic${due === 1 ? ' is' : 's are'} due to be checked.` : 'A mix from the topics you\'ve finished.',
          },
        ]
      : []),
  ];
  const count = factoryPool(scope).length;

  return (
    <div className="card">
      <p className="card-kicker">Pick your problems</p>
      <h3>Contest problems from the whole tree.</h3>
      <p className="card-text">
        You won&apos;t know every one, and that&apos;s the point. Each problem names its topic once you&apos;ve answered,
        with a way straight back to the tree to study it.
      </p>

      <div className="option-row" role="radiogroup" aria-label="Mode">
        {modes.map(m => (
          <button key={m.id} className="option" role="radio" aria-checked={m.id === mode} onClick={() => onMode(m.id)}>
            <strong>{m.name}</strong>
            <span>{m.blurb}</span>
          </button>
        ))}
      </div>

      {mode !== 'review' && (
        <>
          {scope.topicId ? (
            <div className="chip-row" role="radiogroup" aria-label="Topic">
              <button className="chip" role="radio" aria-checked onClick={() => onScope(scope)}>
                {NODE_BY_ID[scope.topicId].label}
              </button>
              <button className="chip" role="radio" aria-checked={false} onClick={() => onScope({ realm: null, tier: null })}>
                The whole tree
              </button>
            </div>
          ) : (
            <>
              <div className="chip-row" role="radiogroup" aria-label="Realm">
                <button className="chip" role="radio" aria-checked={scope.realm === null} onClick={() => onScope({ ...scope, realm: null })}>
                  Every realm
                </button>
                {REALM_ORDER.map(realm => (
                  <button
                    key={realm}
                    className="chip"
                    role="radio"
                    aria-checked={scope.realm === realm}
                    onClick={() => onScope({ ...scope, realm })}
                  >
                    {REALMS[realm].name}
                  </button>
                ))}
              </div>
              <div className="chip-row" role="radiogroup" aria-label="Level">
                <button className="chip" role="radio" aria-checked={scope.tier === null} onClick={() => onScope({ ...scope, tier: null })}>
                  Any level
                </button>
                {([1, 2, 3] as Tier[]).map(tier => (
                  <button
                    key={tier}
                    className="chip"
                    role="radio"
                    aria-checked={scope.tier === tier}
                    onClick={() => onScope({ ...scope, tier })}
                  >
                    {TIER_LABEL[tier]}
                  </button>
                ))}
              </div>
            </>
          )}
        </>
      )}

      <div className="card-actions">
        <button className="btn-primary" autoFocus onClick={onStart} disabled={mode !== 'review' && count === 0}>
          Start
        </button>
        {mode !== 'review' && (
          <span className="speed-meta">
            {count === 0 ? 'Nothing matches. Widen the choice.' : `${count} kinds of problem`}
            {mode !== 'free' && best > 0 && ` · your best: ${best}`}
          </span>
        )}
      </div>
    </div>
  );
}

/** Where a problem came from, and the way back to the tree to study it. */
function Source({ rungId, onStudy }: { rungId: string; onStudy: (topicId: string) => void }) {
  const topicId = topicOfRung(rungId);
  return (
    <p className="reveal">
      From <strong>{NODE_BY_ID[topicId].label}</strong>: {RUNG_BY_ID[rungId].idea.toLowerCase()}.{' '}
      <button className="link-btn" onClick={() => onStudy(topicId)}>Study it on the tree</button>
    </p>
  );
}

/** How long a solved problem took against contest pace, and where its topic stands now. */
function Pace({ rungId, result }: { rungId: string; result: Attempt }) {
  const topicId = topicOfRung(rungId);
  const mastery = useProgress(s => s.mastery);
  const metrics = topicMetrics(topicId, mastery);
  return (
    <p className="pace">
      {result.solved && (
        <>
          Solved in {stopwatch(result.ms)}
          {result.tries > 1 && ` on try ${result.tries}`}. Contest pace is {stopwatch(targetMs(rungId))}.{' '}
        </>
      )}
      {NODE_BY_ID[topicId].label}: <LevelChip metrics={metrics} />
      {metrics.count > 0 && <span className="pace-measures"> {measures(metrics)}</span>}
    </p>
  );
}

function FreePlay({
  free,
  onChange,
  onSetup,
  onStudy,
}: {
  free: Free;
  onChange: (free: Free) => void;
  onSetup: () => void;
  onStudy: (topicId: string) => void;
}) {
  const item = free.items[free.index % free.items.length];
  const [last, setLast] = useState<(Attempt & { index: number }) | null>(null);
  return (
    <>
      <div className="speed-head">
        <span className="speed-score">
          <strong>{free.solved}</strong> solved
          {free.streak > 1 && <> · <strong>{free.streak}</strong> in a row</>}
        </span>
        <button className="link-btn" onClick={onSetup}>Change problems</button>
      </div>
      <ProblemCard
        key={free.index}
        rungId={item.rungId}
        seed={item.seed}
        mode="free"
        kicker={`Problem ${free.index + 1}`}
        onOutcome={firstTry => {
          if (!firstTry) noteMiss(item.rungId);
          onChange({ ...free, solved: free.solved + (firstTry ? 1 : 0), streak: firstTry ? free.streak + 1 : 0 });
        }}
        rightText={earned => (earned ? 'Correct!' : 'Got it.')}
        onNext={() => onChange({ ...free, index: free.index + 1 })}
        onFinish={result => {
          const filed = useProgress.getState().recordAttempt({ rungId: item.rungId, ...result }, 'free');
          setLast({ ...filed, index: free.index });
        }}
        after={
          <>
            {last?.index === free.index && <Pace rungId={item.rungId} result={last} />}
            <Source rungId={item.rungId} onStudy={onStudy} />
          </>
        }
      />
    </>
  );
}

function Round({ run, onAnswer }: { run: Run; onAnswer: (result: Result) => void }) {
  const index = run.answered.length;
  const left = run.deadline - run.now;
  const total = (run.mode === 'sprint' ? SPRINT_SECONDS : COUNTDOWN_SECONDS) * 1000;
  const last = run.answered[index - 1];

  return (
    <>
      <div className="speed-head">
        <span className="speed-clock" data-low={left <= 10000 || undefined} aria-label="Time left">{clock(left)}</span>
        <span className="speed-score">
          {run.mode === 'countdown' && `Problem ${index + 1} of ${run.items.length} · `}
          <strong>{score(run)}</strong> correct
        </span>
      </div>
      <div className="session-progress" data-low={left <= 10000 || undefined}>
        <span style={{ width: `${Math.max(0, (left / total) * 100)}%` }} />
      </div>
      <TimedProblem key={index} item={run.items[index]} mode={run.mode} deadline={run.deadline} onAnswer={onAnswer} />
      <p className="speed-last" data-outcome={last?.outcome} aria-live="polite">
        {last &&
          (last.outcome === 'right'
            ? '✓ Correct'
            : `${last.outcome === 'timeout' ? 'Out of time' : '✗ Not that one'}. It was ${answerText(makeProblem(last.rungId, last.seed).answer)}.`)}
      </p>
    </>
  );
}

function TimedProblem({
  item,
  mode,
  deadline,
  onAnswer,
}: {
  item: FactoryItem;
  mode: Timed;
  deadline: number;
  onAnswer: (result: Result) => void;
}) {
  const problem = makeProblem(item.rungId, item.seed);
  const { answer } = problem;
  const [input, setInput] = useState('');
  const [unreduced, setUnreduced] = useState(false);
  const shownAt = useRef(0);
  useEffect(() => {
    shownAt.current = Date.now();
  }, []);

  const give = (result: Result) => {
    useProgress.getState().recordAnswer({
      rungId: item.rungId,
      right: result.outcome === 'right',
      attempt: 1,
      aided: false,
      mode,
      answer,
      shownAt: shownAt.current,
      deadline,
    });
    const right = result.outcome === 'right';
    useProgress
      .getState()
      .recordAttempt({ rungId: item.rungId, shownAt: shownAt.current, tries: 1, hints: 0, solved: right }, mode);
    onAnswer(result);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const typed = parseTyped(input);
    if (!typed || answer.kind === 'choice') return;
    const verdict = checkTyped(answer, typed);
    if (verdict === 'unreduced') return setUnreduced(true);
    give(verdict === 'right' ? { outcome: 'right' } : { outcome: 'wrong', given: input, note: diagnose(problem, typed) });
  };

  return (
    <div className="card">
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
              onClick={() => give(i === answer.correct ? { outcome: 'right' } : { outcome: 'wrong', given: option })}
            >
              <MathText text={option} />
            </button>
          ))}
        </div>
      )}
      {unreduced && <p className="feedback" data-kind="wrong">Right value. Write it in lowest terms.</p>}
    </div>
  );
}

function Results({
  run,
  onAgain,
  onClose,
  onStudy,
}: {
  run: Run;
  onAgain: () => void;
  onClose: () => void;
  onStudy: (topicId: string) => void;
}) {
  const right = score(run);
  const missed = run.answered.filter(a => a.outcome !== 'right');
  const attempted = run.answered.length;
  return (
    <>
      <div className="card done-card">
        <p className="card-kicker">{FACTORY_MODES[run.mode].name} · round over</p>
        <h3>
          {run.mode === 'sprint' ? `${right} correct in ${SPRINT_SECONDS / 60} minutes.` : `${right} of ${attempted} correct.`}
        </h3>
        <p className="card-text">
          {right > run.best && run.best > 0
            ? `A new best. Your old one was ${run.best}.`
            : right > run.best
              ? 'That\'s your first score to beat.'
              : run.best > 0
                ? `Your best is ${run.best}.`
                : 'No score yet. The problems below are the place to start.'}
          {run.mode === 'sprint' && attempted > 0 && ` You answered ${attempted} and got ${right} right.`}
        </p>
        <div className="card-actions">
          <button className="btn-primary" autoFocus onClick={onAgain}>Go again</button>
          <button className="btn-ghost" onClick={onClose}>Back to the tree</button>
        </div>
      </div>

      <Standing topics={[...new Set(run.answered.map(a => topicOfRung(a.rungId)))]} />

      {missed.length > 0 && (
        <div className="card">
          <p className="card-kicker">The ones that got away</p>
          <ul className="missed-list">
            {missed.map((m, i) => {
              const problem = makeProblem(m.rungId, m.seed);
              return (
                <li key={i}>
                  <p className="missed-prompt"><MathText text={problem.prompt} /></p>
                  {problem.visual && <VisualView visual={problem.visual} />}
                  <p className="missed-answer">
                    {m.outcome === 'timeout' ? 'Out of time. ' : `You said ${m.given?.replace('-', '−')}. `}
                    <strong>Answer: {answerText(problem.answer)}</strong>
                  </p>
                  {m.note && <p className="feedback-note"><MathText text={m.note} /></p>}
                  <Source rungId={m.rungId} onStudy={onStudy} />
                  <details className="missed-solution">
                    <summary>How to solve it</summary>
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

/** Each topic from a round, with its level now. */
function Standing({ topics }: { topics: string[] }) {
  const mastery = useProgress(s => s.mastery);
  if (!topics.length) return null;
  return (
    <div className="card">
      <p className="card-kicker">Where you stand</p>
      <ul className="standing-list">
        {topics.map(id => {
          const m = topicMetrics(id, mastery);
          return (
            <li key={id}>
              <span className="standing-topic">{NODE_BY_ID[id].label}</span>
              <LevelChip metrics={m} />
              <span className="standing-measures">{measures(m)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
