// A lesson is one topic's teaching content: a short interactive explanation,
// then a ladder of problem generators ("rungs") that each build on an earlier one.

/** A picture the learner can poke at. Rendered by the web app. */
export type Visual =
  /** Groups of dots to tap and count. The last `crossed` dots are taken away. */
  | { kind: 'dots'; groups: number[]; crossed?: number }
  /** A number line from `min` to `max` with `hops` single steps from `start` (negative hops go left). */
  | { kind: 'number-line'; min: number; max: number; start: number; hops: number }
  /** Lines of working, revealed one at a time: a calculation, or a list being transformed. */
  | { kind: 'rows'; rows: { label?: string; text: string }[] }
  /** A `height` × (sum of `widths`) rectangle cut into strips. Tap a strip for its partial product. */
  | { kind: 'area'; height: number; widths: number[] }
  /** The whole numbers `from`…`to` (an even count), paired off from the two ends. */
  | { kind: 'pairs'; from: number; to: number }
  /** A choice made in stages. Tap a slot for its number of options; the caption multiplies them. */
  | { kind: 'slots'; slots: { label: string; count: number; why: string }[] }
  /** Every divisor of p^a × q^b laid out as a grid. Tap one to see how it is built. */
  | { kind: 'divisor-grid'; p: number; a: number; q: number; b: number }
  /** Two overlapping groups. Tap a region for its count. `outside` is the number in neither group. */
  | { kind: 'venn'; left: string; right: string; onlyLeft: number; both: number; onlyRight: number; outside?: number }
  /** Fractions drawn as shaded bars, which can be recut into pieces of one common size to compare them. */
  | { kind: 'fraction-bars'; bars: { num: number; den: number }[] };

/** One beat of an explanation or a worked solution. */
export interface Step {
  text: string;
  visual?: Visual;
}

export type Answer =
  | { kind: 'number'; value: number }
  /** A fraction in lowest terms, typed as "3/8". A whole number has `den` 1 and may be typed without the "/1". */
  | { kind: 'fraction'; num: number; den: number }
  | { kind: 'choice'; options: string[]; correct: number };

/** A concrete problem, produced by a rung's generator. */
export interface Problem {
  prompt: string;
  visual?: Visual;
  answer: Answer;
  hints: string[];
  solution: Step[];
}

/** Random source in [0, 1). Seeded, so a problem can be rebuilt from its seed. */
export type Rng = () => number;

export interface Rung {
  /** `<topic id>/<slug>`, e.g. `add_basic/count-on`. Saved progress is keyed by this, so don't rename. */
  id: string;
  /** The one idea this rung practices, shown to the learner. */
  idea: string;
  /** Rung this one extends. It may live in a prerequisite topic. */
  buildsOn?: string;
  generate: (rng: Rng) => Problem;
}

export interface Lesson {
  topic: string;
  intro: Step[];
  rungs: Rung[];
}
