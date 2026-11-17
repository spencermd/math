import { useState } from 'react';
import {
  LESSONS,
  NODE_BY_ID,
  RUNG_BY_ID,
  RUNG_GOAL,
  dailyPlan,
  getRealmForNode,
  isRungCleared,
  topicOfRung,
  type Step,
} from '@mathtree/curriculum';
import { useProgress } from '@/lib/progress-store';
import { ProblemCard, StepView } from './ProblemCard';

type View =
  | { mode: 'learn'; step: number }
  | { mode: 'practice'; rungId: string; seed: number }
  /** Today's goal has just been met; `rungId` is the step to go on to. */
  | { mode: 'goal'; rungId: string }
  | { mode: 'done'; goal: boolean };

// Only called from event handlers, so rendering stays pure.
const newSeed = () => Math.floor(Math.random() * 2 ** 31);

interface Props {
  topicId: string;
  /** Open straight on this problem rather than the explanation: the learner has been here before. */
  resume?: { rungId: string; seed: number };
  onClose: () => void;
}

/** Full-screen lesson: an interactive explanation, then the topic's ladder of problems. */
export function Lesson({ topicId: homeTopic, resume, onClose }: Props) {
  const practice = useProgress(s => s.practice);
  // Stepping back to an earlier idea can lead into a prerequisite topic's lesson.
  const [topicId, setTopicId] = useState(homeTopic);
  const [view, setView] = useState<View>(resume ? { mode: 'practice', ...resume } : { mode: 'learn', step: 0 });
  // Meeting the daily goal partway through is worth a pause, once.
  const [goalOpen, setGoalOpen] = useState(() => !dailyPlan(useProgress.getState()).done);

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
    const goal = goalOpen && dailyPlan(useProgress.getState()).done;
    if (goal) setGoalOpen(false);
    if (!next) setView({ mode: 'done', goal });
    else if (goal) setView({ mode: 'goal', rungId: next.id });
    else openRung(next.id);
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
            <LadderProblem
              key={`${view.rungId}:${view.seed}`}
              rungId={view.rungId}
              seed={view.seed}
              onNext={() => advance(view.rungId)}
              onStepBack={openRung}
            />
          )}
          {view.mode === 'goal' && (
            <div className="card done-card">
              <p className="card-kicker">Today&apos;s goal</p>
              <h3>Step cleared. That&apos;s today done.</h3>
              <p className="card-text">
                A little every day beats a lot once a week. Stop here and come back tomorrow, or keep climbing
                while it&apos;s going well.
              </p>
              <div className="card-actions">
                <button className="btn-primary" autoFocus onClick={() => openRung(view.rungId)}>Keep climbing</button>
                <button className="btn-ghost" onClick={onClose}>Back to the tree</button>
              </div>
            </div>
          )}
          {view.mode === 'done' && (
            <div className="card done-card">
              <p className="card-kicker">Topic complete{view.goal && ' · today\'s goal done'}</p>
              <h3>You&apos;ve cleared every step of {topic.label}.</h3>
              <p className="card-text">
                The topics that build on it are now open on your tree. This one comes back in review in a couple
                of days.
              </p>
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

/** A problem on the topic's ladder: first-try answers earn the step's points, and it can be retried freely. */
function LadderProblem({
  rungId,
  seed,
  onNext,
  onStepBack,
}: {
  rungId: string;
  seed: number;
  onNext: () => void;
  onStepBack: (rungId: string) => void;
}) {
  const recordCorrect = useProgress(s => s.recordCorrect);
  const count = useProgress(s => s.practice[rungId] ?? 0);
  return (
    <ProblemCard
      rungId={rungId}
      seed={seed}
      kicker={RUNG_BY_ID[rungId].idea}
      onOutcome={firstTry => firstTry && recordCorrect(rungId)}
      rightText={earned =>
        earned
          ? count >= RUNG_GOAL
            ? 'Correct! You\'ve cleared this step.'
            : `Correct! ${count} of ${RUNG_GOAL} on this step.`
          : 'That\'s it. Solve a fresh one on your first try to earn the point.'
      }
      onNext={onNext}
      onStepBack={onStepBack}
    />
  );
}
