import { LEVEL_LABEL, nextLevelGap, topicMetrics, type TopicMetrics } from '@mathtree/curriculum';
import { useProgress } from '@/lib/progress-store';

const pct = (x: number) => `${Math.round(x * 100)}%`;

/** "0:34" from milliseconds. */
export const stopwatch = (ms: number) => {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

export function useTopicMetrics(topicId: string): TopicMetrics {
  const record = useProgress(s => s.mastery[topicId]);
  return topicMetrics(topicId, record ? { [topicId]: record } : {});
}

export function LevelChip({ metrics }: { metrics: TopicMetrics }) {
  return (
    <span className="level-chip" data-level={metrics.level}>
      {LEVEL_LABEL[metrics.level]}
    </span>
  );
}

/** The two measures, in a line. */
export function measures(m: TopicMetrics): string {
  return m.count ? `Accuracy ${pct(m.accuracy)} · Speed ${pct(m.speed)} of contest pace` : 'No Factory problems yet';
}

/** A topic's contest-readiness level with its speed and accuracy, for the topic panel. */
export function Readiness({ topicId }: { topicId: string }) {
  const m = useTopicMetrics(topicId);
  const gap = nextLevelGap(m);
  return (
    <section className="readiness" aria-label="Contest readiness">
      <div className="readiness-head">
        <h3>Contest readiness</h3>
        <LevelChip metrics={m} />
      </div>
      {m.count > 0 && (
        <dl className="readiness-measures">
          <div>
            <dt>Accuracy</dt>
            <dd>{pct(m.accuracy)}</dd>
          </div>
          <div>
            <dt>Speed</dt>
            <dd>{pct(m.speed)}<span> of contest pace</span></dd>
          </div>
        </dl>
      )}
      <p className="panel-hint">
        {m.count > 0 && `From your last ${m.count} Factory problem${m.count === 1 ? '' : 's'} here. `}
        {gap}
      </p>
    </section>
  );
}
