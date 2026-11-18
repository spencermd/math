// Every knob for contest-readiness levels lives here, so they can be tuned in one place.
// Changing a number re-scores saved answers too: the raw times and tries are kept, not the verdicts.

import type { AnswerMode } from './badges.ts';

export const MASTERY = {
  /** Answers from these modes count toward a topic's level. */
  countedModes: ['free', 'sprint', 'countdown'] as AnswerMode[],
  /** A topic's level looks at its most recent this-many problems. */
  window: 20,
  /** How many to keep per topic, so the window can be widened later without losing history. */
  keep: 50,
  /** Problems needed before a topic gets a level at all. */
  minToRate: 5,
  /**
   * Accuracy credit for solving on the 1st, 2nd, 3rd try. Later tries, a solution seen first,
   * a skip or a timeout earn 0.
   */
  tryCredit: [1, 0.5, 0.25],
  /** Each hint the learner asks for costs one try, as if they had answered wrong once more. */
  hintCostsATry: true,
  /** A timed-out problem counts as a miss. */
  timeoutIsMiss: true,
  /**
   * Speed is measured per solved problem as (competitive time ÷ time taken), so 1 means exactly at
   * competitive pace and 0.5 means twice as long. The topic's speed is the median, capped here so
   * one lucky guess can't carry it.
   */
  speedCap: 2,
  levels: {
    /** Essentially all right, at the pace of a strong MATHCOUNTS competitor. */
    competitive: {
      accuracy: 0.9,
      speed: 1,
      /** Needs a fuller record than the other levels. */
      minProblems: 10,
      /** Share of the topic's kinds of problem that must appear in the window. */
      minKindsShare: 0.5,
    },
    /** Mostly right, within about twice competitive time. */
    intermediate: { accuracy: 0.7, speed: 0.5 },
  },
};

/**
 * Seconds a strong middle-school competitor (a MATHCOUNTS state-level student) needs for each kind of
 * problem, reading included. These are estimates to adjust. For scale: the Sprint Round allows about
 * 80 seconds a problem, with the early ones taking 20–30; the Countdown Round gives 45 seconds; the AMC 8
 * allows about 96 seconds a problem.
 */
export const COMPETITIVE_SECONDS: Record<string, number> = {
  // Clever Calculations
  'clever_calc/regroup': 15,
  'clever_calc/distribute': 15,
  'clever_calc/pairing': 25,
  // Fractions & Decimals
  'fractions_decimals/cancel': 20,
  'fractions_decimals/compare': 25,
  'fractions_decimals/decimal-friends': 10,
  'fractions_decimals/telescope': 25,
  // Ratios & Proportions
  'ratios/one-part': 20,
  'ratios/difference': 25,
  'ratios/chain': 45,
  'ratios/change': 45,
  // Percents
  'percents/of': 10,
  'percents/change': 20,
  'percents/successive': 30,
  'percents/reverse': 20,
  // Rates & Conversions
  'rates/unit-rate': 25,
  'rates/convert': 30,
  'rates/square-units': 25,
  'rates/joint': 30,
  // Mean, Median & Mode
  'statistics/total': 25,
  'statistics/combine': 35,
  'statistics/median-mode': 40,
  'statistics/extreme': 45,
  // Words into Equations
  'equations/translate': 20,
  'equations/consecutive': 20,
  'equations/two-kinds': 40,
  // Distance, Rate & Work
  'motion_work/drt': 20,
  'motion_work/closing': 40,
  'motion_work/round-trip': 35,
  'motion_work/together': 35,
  // Lines & Slope
  'lines/slope': 25,
  'lines/intercepts': 35,
  'lines/equation': 30,
  'lines/perpendicular': 50,
  // Systems of Equations
  'systems/eliminate': 30,
  'systems/story': 40,
  'systems/cheat': 20,
  'systems/pair-sums': 40,
  // Special Products
  'special_products/mental': 20,
  'special_products/factor': 20,
  'special_products/sum-product': 30,
  'special_products/hidden': 25,
  // Exponents & Radicals
  'exponents/rules': 15,
  'exponents/negative': 25,
  'exponents/same-base': 25,
  'exponents/radicals': 15,
  // Quadratics
  'quadratics/factor': 30,
  'quadratics/story': 25,
  'quadratics/vieta': 30,
  'quadratics/root-expressions': 45,
  // Arithmetic Sequences
  'arith_sequences/nth-term': 25,
  'arith_sequences/which-term': 40,
  'arith_sequences/two-terms': 35,
  'arith_sequences/middle': 35,
  // Arithmetic Series
  'arith_series/gauss': 25,
  'arith_series/any': 35,
  'arith_series/story': 45,
  'arith_series/hidden': 35,
  // Geometric Sequences
  'geo_sequences/nth-term': 35,
  'geo_sequences/mean': 30,
  'geo_sequences/sum': 30,
  'geo_sequences/infinite': 35,
  // Clever Substitution
  'substitution/nested-radical': 35,
  'substitution/continued-fraction': 35,
  'substitution/disguised': 50,
  'substitution/reverse': 30,
  // Counting Lists
  'counting_lists/consecutive': 15,
  'counting_lists/arithmetic': 25,
  'counting_lists/multiples': 20,
  // Venn Diagrams
  'venn/either': 20,
  'venn/neither-or-both': 20,
  'venn/multiples': 35,
  // Multiplication Principle
  'mult_principle/stages': 15,
  'mult_principle/codes': 25,
  'mult_principle/restricted': 45,
  // Handshakes & Triangular Numbers
  'handshakes/count': 20,
  'handshakes/triangular': 30,
  'handshakes/variations': 25,
  'handshakes/reverse': 30,
  // Casework
  'casework/digits': 30,
  'casework/coins': 60,
  'casework/exactly': 50,
  'casework/triangles': 90,
  // Permutations
  'permutations/arrange': 20,
  'permutations/factorials': 20,
  'permutations/repeats': 35,
  'permutations/together': 45,
  // Combinations
  'combinations/choose': 25,
  'combinations/complement': 25,
  'combinations/groups': 40,
  'combinations/disguise': 25,
  // Complementary Counting
  'complementary/not': 25,
  'complementary/at-least-one': 35,
  'complementary/neither': 50,
  'complementary/repeats': 40,
  // Paths on a Grid
  'grid_paths/count': 30,
  'grid_paths/through': 45,
  'grid_paths/avoid': 60,
  'grid_paths/closed-block': 75,
  // Sticks & Stones
  'stars_bars/distribute': 30,
  'stars_bars/at-least-one': 40,
  'stars_bars/equations': 35,
  'stars_bars/disguise': 50,
  // Pascal's Triangle
  'pascal/entries': 25,
  'pascal/row-sum': 25,
  'pascal/binomial': 30,
  'pascal/hockey-stick': 40,
  // Probability Basics
  'prob_basics/single': 30,
  'prob_basics/two-dice': 40,
  'prob_basics/coins': 30,
  'prob_basics/slots': 35,
  // Compound Events
  'prob_compound/independent': 40,
  'prob_compound/without': 40,
  'prob_compound/same': 55,
  'prob_compound/orders': 50,
  // Probability by Counting
  'prob_counting/pairs': 45,
  'prob_counting/committee': 60,
  'prob_counting/lineups': 60,
  'prob_counting/numbers': 50,
  // At Least One
  'prob_complement/repeat': 35,
  'prob_complement/draws': 45,
  'prob_complement/mixed': 40,
  'prob_complement/match': 50,
  // Geometric Probability
  'geo_prob/length': 40,
  'geo_prob/area': 45,
  'geo_prob/regions': 50,
  'geo_prob/two-numbers': 50,
  // Expected Value
  'expected_value/equal': 30,
  'expected_value/weighted': 40,
  'expected_value/fair': 30,
  'expected_value/linearity': 25,
  // Divisibility Rules
  'divisibility/test': 15,
  'divisibility/missing-digit': 35,
  'divisibility/combine': 25,
  // Primes & Factorization
  'prime_factorization/spot-the-prime': 25,
  'prime_factorization/factor': 20,
  'prime_factorization/make-a-square': 30,
  // Counting Factors
  'factor_counting/from-factorization': 15,
  'factor_counting/from-number': 25,
  'factor_counting/restricted': 30,
  // GCD & LCM
  'gcd_lcm/gcd': 15,
  'gcd_lcm/lcm': 20,
  'gcd_lcm/product': 20,
  'gcd_lcm/stories': 30,
  // Factor Tricks
  'factor_tricks/odd-count': 45,
  'factor_tricks/sum': 30,
  'factor_tricks/product': 35,
  'factor_tricks/smallest': 60,
  // Factorials & Trailing Zeros
  'factorials_nt/cancel': 25,
  'factorials_nt/prime-power': 25,
  'factorials_nt/zeros': 20,
  'factorials_nt/beyond': 35,
  // Digit Problems
  'digits/expanded': 25,
  'digits/reverse': 40,
  'digits/patterns': 35,
  'digits/how-many': 45,
  // The Units Digit
  'units_digit/arithmetic': 15,
  'units_digit/cycle': 20,
  'units_digit/short-cycles': 25,
  'units_digit/combined': 30,
  // Repeating Decimals
  'repeating_decimals/terminates': 35,
  'repeating_decimals/to-fraction': 25,
  'repeating_decimals/delayed': 40,
  'repeating_decimals/nth-digit': 35,
  // Number Bases
  'bases/to-ten': 20,
  'bases/from-ten': 35,
  'bases/arithmetic': 40,
  'bases/unknown-base': 30,
  // Modular Arithmetic
  'mod_arith/clock': 20,
  'mod_arith/reduce-first': 25,
  'mod_arith/powers': 45,
  'mod_arith/two-remainders': 45,
  // Angles & Parallel Lines
  'angles/line': 20,
  'angles/crossing': 25,
  'angles/parallel': 15,
  'angles/zigzag': 30,
  // Triangle Basics
  'triangles/angle-sum': 30,
  'triangles/exterior': 15,
  'triangles/inequality': 25,
  'triangles/chase': 45,
  // Polygons
  'polygons/angle-sum': 20,
  'polygons/regular': 25,
  'polygons/diagonals': 25,
  'polygons/combine': 40,
  // Area
  'area/formulas': 15,
  'area/grid': 50,
  'area/subtract': 35,
  'area/shared-height': 30,
  // Pythagorean Theorem
  'pythagorean/triples': 25,
  'pythagorean/distance': 30,
  'pythagorean/hidden': 25,
  'pythagorean/two-steps': 30,
  // Special Right Triangles
  'special_right/45': 20,
  'special_right/30-60': 15,
  'special_right/equilateral': 25,
  'special_right/combined': 35,
  // Quadrilaterals
  'quadrilaterals/angles': 25,
  'quadrilaterals/diagonals': 45,
  'quadrilaterals/trapezoid': 45,
  'quadrilaterals/midpoints': 25,
  // Circles
  'circles/basics': 15,
  'circles/sectors': 30,
  'circles/rings': 40,
  'circles/inscribed': 35,
  // Chords, Tangents & Inscribed Angles
  'circle_angles/inscribed': 35,
  'circle_angles/tangent': 35,
  'circle_angles/chords': 25,
  'circle_angles/cyclic': 30,
  // Similarity
  'similarity/scale-factor': 30,
  'similarity/shadows': 25,
  'similarity/parallel': 30,
  'similarity/hidden': 35,
  // 3D Geometry
  'solids/boxes': 50,
  'solids/round': 50,
  'solids/euler': 20,
  'solids/painted-cube': 40,
  // Area & Volume Scaling
  'scaling/area': 20,
  'scaling/volume': 20,
  'scaling/through-length': 50,
  'scaling/slices': 35,
  // Funky Figures
  'shaded/square-circle': 30,
  'shaded/quarters': 40,
  'shaded/semicircles': 45,
  'shaded/segments': 50,
};
