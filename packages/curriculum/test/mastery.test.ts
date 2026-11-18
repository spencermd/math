import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  COMPETITIVE_SECONDS,
  LESSONS,
  MASTERY,
  RUNG_BY_ID,
  accuracyCredit,
  addAttempt,
  nextLevelGap,
  speedRatio,
  targetMs,
  topicMetrics,
  type Attempt,
  type MasteryMap,
} from '../src/index.ts';

const TOPIC = 'percents';
const RUNGS = LESSONS[TOPIC].rungs.map(r => r.id);

/** A solved-first-try problem at `pace` × competitive speed (2 = twice as fast). */
function att(rungId: string, over: Partial<Attempt> = {}, pace = 1): Attempt {
  return { rungId, ms: targetMs(rungId) / pace, tries: 1, hints: 0, solved: true, at: 0, ...over };
}

function record(attempts: Attempt[]): MasteryMap {
  return attempts.reduce<MasteryMap>((map, a) => addAttempt(map, a), {});
}

/** `n` problems cycling through the topic's kinds. */
const spread = (n: number, make: (rungId: string, i: number) => Attempt) =>
  Array.from({ length: n }, (_, i) => make(RUNGS[i % RUNGS.length], i));

test('every kind of problem has a competitive time, and no time is left over', () => {
  for (const id of Object.keys(RUNG_BY_ID)) {
    const s = COMPETITIVE_SECONDS[id];
    assert.ok(s !== undefined, `missing a time for ${id}`);
    assert.ok(s >= 5 && s <= 180, `${id}: ${s}s is out of range`);
  }
  for (const id of Object.keys(COMPETITIVE_SECONDS)) assert.ok(id in RUNG_BY_ID, `${id} is not a problem`);
});

test('accuracy credit falls with each extra try, and each asked-for hint costs a try', () => {
  const r = RUNGS[0];
  assert.equal(accuracyCredit(att(r)), 1);
  assert.equal(accuracyCredit(att(r, { tries: 2 })), 0.5);
  assert.equal(accuracyCredit(att(r, { tries: 3 })), 0.25);
  assert.equal(accuracyCredit(att(r, { tries: 4 })), 0);
  assert.equal(accuracyCredit(att(r, { hints: 1 })), 0.5);
  assert.equal(accuracyCredit(att(r, { tries: 2, hints: 1 })), 0.25);
  assert.equal(accuracyCredit(att(r, { solved: false })), 0);
  assert.equal(accuracyCredit(att(r, { hints: 1 }), { ...MASTERY, hintCostsATry: false }), 1);
});

test('speed is competitive time over time taken, capped, and missing for an unsolved problem', () => {
  const r = RUNGS[0];
  assert.equal(speedRatio(att(r)), 1);
  assert.equal(speedRatio(att(r, {}, 0.5)), 0.5);
  assert.equal(speedRatio(att(r, {}, 10)), MASTERY.speedCap);
  assert.equal(speedRatio(att(r, { solved: false })), null);
});

test('a topic stays unrated until enough problems are in', () => {
  const m = topicMetrics(TOPIC, record(spread(MASTERY.minToRate - 1, r => att(r))));
  assert.equal(m.level, 'unrated');
  assert.match(nextLevelGap(m)!, /Solve 1 more Factory problem from/);
  assert.equal(topicMetrics('no_such_topic', {}).level, 'unrated');
});

test('all right at competitive pace across the topic is competitive', () => {
  const m = topicMetrics(TOPIC, record(spread(12, r => att(r))));
  assert.equal(m.level, 'competitive');
  assert.equal(m.accuracy, 1);
  assert.equal(m.speed, 1);
  assert.equal(nextLevelGap(m), null);
});

test('all right but slower than contest pace is intermediate, not competitive', () => {
  const m = topicMetrics(TOPIC, record(spread(12, r => att(r, {}, 0.8))));
  assert.equal(m.level, 'intermediate');
  assert.match(nextLevelGap(m)!, /speed at 100% of contest pace/);
});

test('fast but often wrong is beginner', () => {
  const m = topicMetrics(TOPIC, record(spread(10, (r, i) => att(r, { solved: i % 2 === 0 }, 1.5))));
  assert.equal(m.accuracy, 0.5);
  assert.equal(m.level, 'beginner');
  assert.match(nextLevelGap(m)!, /^For Intermediate you need accuracy of 70%\.$/);
});

test('right but more than twice contest time is beginner', () => {
  const m = topicMetrics(TOPIC, record(spread(10, r => att(r, {}, 0.4))));
  assert.equal(m.level, 'beginner');
});

test('competitive needs a full record and a spread of problem kinds', () => {
  const few = topicMetrics(TOPIC, record(spread(MASTERY.levels.competitive.minProblems - 1, r => att(r))));
  assert.equal(few.level, 'intermediate');
  assert.match(nextLevelGap(few)!, /at least 10 problems on record/);

  const oneKind = topicMetrics(TOPIC, record(Array.from({ length: 12 }, () => att(RUNGS[0]))));
  assert.equal(oneKind.kindsShare, 1 / RUNGS.length);
  assert.equal(oneKind.level, 'intermediate');
  assert.match(nextLevelGap(oneKind)!, /wider mix/);
});

test('one miss in twenty still allows competitive; three do not', () => {
  const oneMiss = topicMetrics(TOPIC, record(spread(20, (r, i) => att(r, { solved: i !== 3 }))));
  assert.equal(oneMiss.accuracy, 0.95);
  assert.equal(oneMiss.level, 'competitive');
  const threeMisses = topicMetrics(TOPIC, record(spread(20, (r, i) => att(r, { solved: i % 7 !== 0 }))));
  assert.equal(threeMisses.accuracy, 0.85);
  assert.equal(threeMisses.level, 'intermediate');
});

test('only the most recent window counts, so an early rough patch is outgrown', () => {
  const rough = spread(30, r => att(r, { solved: false }));
  const good = spread(MASTERY.window, r => att(r));
  const map = record([...rough, ...good]);
  assert.equal(map[TOPIC].length, MASTERY.keep);
  assert.equal(topicMetrics(TOPIC, map).level, 'competitive');
});

test('a long pause on one problem barely moves the median speed', () => {
  const list = spread(12, r => att(r));
  list[5] = att(list[5].rungId, { ms: 20 * 60 * 1000 });
  const m = topicMetrics(TOPIC, record(list));
  assert.equal(m.speed, 1);
  assert.equal(m.level, 'competitive');
});

test('attempts are filed under their own topic', () => {
  const map = record([att('percents/of'), att('ratios/one-part')]);
  assert.deepEqual(Object.keys(map).sort(), ['percents', 'ratios']);
});

test('timeouts can be left out entirely', () => {
  const t = att(RUNGS[0], { solved: false, timedOut: true });
  assert.equal(addAttempt({}, t)[TOPIC].length, 1);
  assert.deepEqual(addAttempt({}, t, { ...MASTERY, timeoutIsMiss: false }), {});
});
