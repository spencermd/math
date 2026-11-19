// ─────────────────────────────────────────────────────────────────────────────
// Curriculum data — middle school competition math (MATHCOUNTS, AMC 8).
// Topic coverage follows the AoPS Middle School Contest Math syllabus and
// Batterson's "Competition Math for Middle School".
// 58 topics · 6 strands ("realms")
// ─────────────────────────────────────────────────────────────────────────────

export type RealmId = 1 | 2 | 3 | 4 | 5 | 6;

/** How far along the road from ordinary school math to contest star a topic sits. */
export type Tier = 1 | 2 | 3;

export const TIER_LABEL: Record<Tier, string> = {
  1: 'Foundations',
  2: 'AMC 8 level',
  3: 'MATHCOUNTS level',
};

export interface RealmDef {
  id: RealmId;
  label: string;   // Roman numeral for sidebar
  name: string;
  sub: string;
  color: string;
  border: string;
  glow: string;
}

export interface TopicNode {
  id: string;
  label: string;
  realm: RealmId;
  tier: Tier;
  d: string;  // description
  /** The final, summit topic of its realm. */
  capstone?: true;
}

export interface TopicEdge {
  source: string;
  target: string;
  cross: boolean;
}

// ── Realms ────────────────────────────────────────────────────────────────────
export const REALMS: Record<RealmId, RealmDef> = {
  // Muted jewel tones for the dark fairy-core look; `border` is the lit edge, `glow` the halo.
  1: { id:1, label:'I',   name:'Number Sense',  sub:'Calculate cleverly, not laboriously',        color:'#8A5A34', border:'#D4A574', glow:'#D4A57440' },
  2: { id:2, label:'II',  name:'Algebra',       sub:'Turn any story into an equation you can solve', color:'#4F3D8C', border:'#9681D9', glow:'#9681D940' },
  3: { id:3, label:'III', name:'Counting',      sub:'Count without counting one by one',          color:'#4A6538', border:'#A3BE88', glow:'#A3BE8840' },
  4: { id:4, label:'IV',  name:'Probability',   sub:'Measure chance by counting what can happen', color:'#6E4258', border:'#C49AB2', glow:'#C49AB240' },
  5: { id:5, label:'V',   name:'Number Theory', sub:'The hidden structure of whole numbers',      color:'#2A6A7A', border:'#7DBCC8', glow:'#7DBCC840' },
  6: { id:6, label:'VI',  name:'Geometry',      sub:'See the figure inside the figure',           color:'#34509A', border:'#93AEE6', glow:'#93AEE640' },
};

export const REALM_ORDER: RealmId[] = [1, 2, 3, 4, 5, 6];

// ── Nodes (58) ────────────────────────────────────────────────────────────────
export const NODES: TopicNode[] = [
  // Realm I: Number Sense
  { id:'clever_calc',        label:'Clever Calculations',     realm:1, tier:1, d:'Contest arithmetic is about spotting the shortcut: regroup, break numbers apart, and pair up long sums instead of grinding.' },
  { id:'fractions_decimals', label:'Fractions & Decimals',    realm:1, tier:1, d:'Move fluently between fractions and decimals, compare them without a calculator, and simplify before you multiply.' },
  { id:'ratios',             label:'Ratios & Proportions',    realm:1, tier:1, d:'Think in parts. A ratio of 3 : 5 means 8 equal parts — most ratio problems fall once you find the size of one part.' },
  { id:'percents',           label:'Percents',                realm:1, tier:1, d:'Percent of, percent change, and back-to-back changes. A 20% rise then a 20% drop does not get you back where you started.' },
  { id:'rates',              label:'Rates & Conversions',     realm:1, tier:1, d:'Carry the units along and they tell you what to multiply. Miles per hour to feet per second without memorizing a thing.' },
  { id:'statistics',         label:'Mean, Median & Mode',     realm:1, tier:1, d:'The mean is a balancing point and a sum in disguise: knowing the average tells you the total.' },

  // Realm II: Algebra
  { id:'equations',          label:'Words into Equations',    realm:2, tier:1, d:'Name the unknown, translate the story, solve. Consecutive integers, ages, coins — the same move every time.' },
  { id:'motion_work',        label:'Distance, Rate & Work',   realm:2, tier:2, d:'d = rt, round trips and the harmonic mean, and workers who add their rates rather than their times.' },
  { id:'lines',              label:'Lines & Slope',           realm:2, tier:2, d:'Slope, intercepts, and the three forms of a line. Parallel lines share a slope; perpendicular slopes multiply to −1.' },
  { id:'systems',            label:'Systems of Equations',    realm:2, tier:2, d:'Substitution and elimination — and "cheating the system": adding the equations to get exactly what was asked.' },
  { id:'special_products',   label:'Special Products',        realm:2, tier:2, d:'Difference of squares and perfect squares. They turn 47 × 53 and 99² into mental arithmetic.' },
  { id:'exponents',          label:'Exponents & Radicals',    realm:2, tier:2, d:'Exponent rules, negative and fractional powers, and simplifying square roots by pulling out perfect squares.' },
  { id:'quadratics',         label:'Quadratics',              realm:2, tier:3, d:'Factor, use the formula, or skip solving altogether: the sum and product of the roots are sitting in the coefficients.' },
  { id:'arith_sequences',    label:'Arithmetic Sequences',    realm:2, tier:2, d:'Constant steps. Find the 100th term, or which term a number is, by counting steps from the start.' },
  { id:'arith_series',       label:'Arithmetic Series',       realm:2, tier:2, d:'Add a whole sequence at once: the average of the first and last terms, times the number of terms.' },
  { id:'geo_sequences',      label:'Geometric Sequences',     realm:2, tier:3, d:'Constant ratios, and the trick of multiplying a sum by its ratio so that almost everything cancels.' },
  { id:'substitution',       label:'Clever Substitution',     realm:2, tier:3, d:'Infinite nested radicals and continued fractions collapse when you notice the expression contains itself.' },

  // Realm III: Counting
  { id:'counting_lists',     label:'Counting Lists',          realm:3, tier:1, d:'How many numbers are in 23, 24, …, 71? Shift and scale any list until it reads 1, 2, 3, …, n.' },
  { id:'venn',               label:'Venn Diagrams',           realm:3, tier:1, d:'Sort overlapping groups by filling in the overlap first. Add the groups, subtract what you counted twice.' },
  { id:'mult_principle',     label:'Multiplication Principle',realm:3, tier:1, d:'A choice made in stages has (ways for stage one) × (ways for stage two) × … outcomes. The engine of all counting.' },
  { id:'handshakes',         label:'Handshakes & Triangular Numbers', realm:3, tier:2, d:'Handshakes, bowling pins, diagonals and round-robin games are all the same count: n(n − 1)/2.' },
  { id:'casework',           label:'Casework',                realm:3, tier:2, d:'Split a messy count into clean cases that do not overlap and miss nothing, then add.' },
  { id:'permutations',       label:'Permutations',            realm:3, tier:2, d:'Arrangements where order matters: factorials, people in a row, and letters of a word with repeats.' },
  { id:'combinations',       label:'Combinations',            realm:3, tier:2, d:'Choosing a committee, not a line-up. Count arrangements, then divide out the orders you did not care about.' },
  { id:'complementary',      label:'Complementary Counting',  realm:3, tier:2, d:'When "at least one" is hard to count, count everything and subtract what you do not want.' },
  { id:'grid_paths',         label:'Paths on a Grid',         realm:3, tier:3, d:'Every shortest path is a word made of Rs and Us, so counting paths is choosing where the Rs go.' },
  { id:'stars_bars',         label:'Sticks & Stones',         realm:3, tier:3, d:'Hand out identical objects to different people by arranging stones and dividers in a row.' },
  { id:'pascal',             label:'Pascal\'s Triangle',      realm:3, tier:3, d:'Every combination lives in one triangle. Its rows sum to powers of 2 and hide a dozen other patterns.' },

  // Realm IV: Probability
  { id:'prob_basics',        label:'Probability Basics',      realm:4, tier:1, d:'Successful outcomes over total outcomes — as long as every outcome is equally likely.' },
  { id:'prob_compound',      label:'Compound Events',         realm:4, tier:2, d:'"And" multiplies, "or" adds. With or without replacement changes everything after the first draw.' },
  { id:'prob_counting',      label:'Probability by Counting', realm:4, tier:2, d:'Use permutations and combinations to count the successes and the total, then divide.' },
  { id:'prob_complement',    label:'At Least One',            realm:4, tier:2, d:'The probability of at least one success is 1 minus the probability of none.' },
  { id:'geo_prob',           label:'Geometric Probability',   realm:4, tier:3, d:'When outcomes are points on a segment or in a region, probability is a ratio of lengths or areas.' },
  { id:'expected_value',     label:'Expected Value',          realm:4, tier:3, d:'The long-run average of a game: each outcome weighted by how often it happens.' },

  // Realm V: Number Theory
  { id:'divisibility',       label:'Divisibility Rules',      realm:5, tier:1, d:'Test for 2, 3, 4, 5, 6, 9, 10 and 11 at a glance — and understand why each test works.' },
  { id:'prime_factorization',label:'Primes & Factorization',  realm:5, tier:1, d:'Every whole number breaks into primes in exactly one way. That factorization answers almost any question about it.' },
  { id:'factor_counting',    label:'Counting Factors',        realm:5, tier:2, d:'How many divisors does 360 have? Add one to each exponent in its factorization and multiply.' },
  { id:'gcd_lcm',            label:'GCD & LCM',               realm:5, tier:2, d:'Greatest common divisors and least common multiples from prime factorizations, and why GCD × LCM is the product.' },
  { id:'factor_tricks',      label:'Factor Tricks',           realm:5, tier:3, d:'The sum and the product of all of a number\'s factors, and why only perfect squares have an odd number of them.' },
  { id:'factorials_nt',      label:'Factorials & Trailing Zeros', realm:5, tier:3, d:'How many zeros end 100!? Count the 5s hiding in its prime factorization.' },
  { id:'digits',             label:'Digit Problems',          realm:5, tier:2, d:'Write a two-digit number as 10a + b and puzzles about reversed and summed digits turn into algebra.' },
  { id:'units_digit',        label:'The Units Digit',         realm:5, tier:2, d:'The last digit of 7¹⁰⁰ without computing it: units digits of powers run in short cycles.' },
  { id:'repeating_decimals', label:'Repeating Decimals',      realm:5, tier:2, d:'Which fractions terminate, which repeat, and how to turn 0.272727… back into a fraction.' },
  { id:'bases',              label:'Number Bases',            realm:5, tier:2, d:'Place value with a base other than ten. Convert both ways and do arithmetic in base 2, 5 or 8.' },
  { id:'mod_arith',          label:'Modular Arithmetic',      realm:5, tier:3, d:'Clock arithmetic: work with remainders only, and enormous powers and sums become tiny problems.' },

  // Realm VI: Geometry
  { id:'angles',             label:'Angles & Parallel Lines', realm:6, tier:1, d:'Vertical, supplementary, corresponding, alternate. Chase angles around a figure until the unknown gives itself up.' },
  { id:'triangles',          label:'Triangle Basics',         realm:6, tier:1, d:'Angles sum to 180°, an exterior angle equals the two far interior angles, and the triangle inequality limits the sides.' },
  { id:'polygons',           label:'Polygons',                realm:6, tier:2, d:'Interior and exterior angle sums, regular polygons, and counting diagonals.' },
  { id:'area',               label:'Area',                    realm:6, tier:1, d:'Triangles, parallelograms and trapezoids — plus cutting apart, rearranging, and subtracting from a bigger shape.' },
  { id:'pythagorean',        label:'Pythagorean Theorem',     realm:6, tier:2, d:'a² + b² = c², the triples worth memorizing, and the distance formula that is the same idea on a grid.' },
  { id:'special_right',      label:'Special Right Triangles', realm:6, tier:2, d:'45-45-90 and 30-60-90: half a square and half an equilateral triangle, with side ratios you can read off.' },
  { id:'quadrilaterals',     label:'Quadrilaterals',          realm:6, tier:2, d:'Parallelograms, rhombi, kites and trapezoids: what their diagonals do and how to find their areas.' },
  { id:'circles',            label:'Circles',                 realm:6, tier:2, d:'Circumference, area, arcs and sectors, with answers left in terms of π.' },
  { id:'circle_angles',      label:'Chords, Tangents & Inscribed Angles', realm:6, tier:3, d:'An inscribed angle is half its arc, a tangent meets its radius at a right angle, and right triangles hide everywhere.' },
  { id:'similarity',         label:'Similarity',              realm:6, tier:2, d:'Same shape, different size. Spot the similar triangles and set up the proportion.' },
  { id:'solids',             label:'3D Geometry',             realm:6, tier:2, d:'Volume and surface area of prisms, cylinders, pyramids, cones and spheres; faces, vertices and edges.' },
  { id:'scaling',            label:'Area & Volume Scaling',   realm:6, tier:3, d:'Scale lengths by k and areas scale by k², volumes by k³. A fast way through many hard problems.' },
  { id:'shaded',             label:'Funky Figures',           realm:6, tier:3, d:'Shaded regions built from circles, squares and triangles: add the pieces you know, subtract the ones you do not want.' },
];

// ── Edges ────────────────────────────────────────────────────────────────────
// [prerequisite, topic, cross?]
const RAW_EDGES: [string, string, boolean?][] = [
  // Number Sense
  ['clever_calc','fractions_decimals'],['fractions_decimals','ratios'],['fractions_decimals','percents'],
  ['ratios','rates'],['clever_calc','statistics'],
  // Algebra
  ['clever_calc','equations'],['equations','motion_work'],['rates','motion_work'],
  ['equations','lines'],['equations','systems'],['equations','special_products'],['equations','exponents'],
  ['special_products','quadratics'],['exponents','quadratics'],
  ['equations','arith_sequences'],['counting_lists','arith_sequences'],['arith_sequences','arith_series'],
  ['arith_sequences','geo_sequences'],['exponents','geo_sequences'],['quadratics','substitution'],
  // Counting
  ['clever_calc','counting_lists'],['counting_lists','venn'],['counting_lists','mult_principle'],
  ['mult_principle','handshakes'],['mult_principle','casework'],['mult_principle','permutations'],
  ['permutations','combinations'],['handshakes','combinations'],
  ['casework','complementary'],['venn','complementary'],
  ['combinations','grid_paths'],['combinations','stars_bars'],['combinations','pascal'],
  // Probability
  ['fractions_decimals','prob_basics'],['mult_principle','prob_basics'],['prob_basics','prob_compound'],
  ['prob_compound','prob_counting'],['combinations','prob_counting'],
  ['prob_compound','prob_complement'],['complementary','prob_complement'],
  ['prob_basics','geo_prob'],['area','geo_prob'],
  ['prob_compound','expected_value'],['statistics','expected_value'],
  // Number Theory
  ['clever_calc','divisibility'],['divisibility','prime_factorization'],
  ['prime_factorization','factor_counting'],['mult_principle','factor_counting'],
  ['prime_factorization','gcd_lcm'],['factor_counting','factor_tricks'],
  ['prime_factorization','factorials_nt'],['permutations','factorials_nt'],
  ['divisibility','digits'],['equations','digits'],['divisibility','units_digit'],
  ['fractions_decimals','repeating_decimals'],['prime_factorization','repeating_decimals'],
  ['exponents','bases'],['units_digit','mod_arith'],['gcd_lcm','mod_arith'],
  // Geometry
  ['angles','triangles'],['triangles','polygons'],['triangles','area'],
  ['area','pythagorean'],['exponents','pythagorean'],['pythagorean','special_right'],
  ['area','quadrilaterals'],['area','circles'],
  ['circles','circle_angles'],['pythagorean','circle_angles'],
  ['triangles','similarity'],['ratios','similarity'],['area','solids'],
  ['similarity','scaling'],['solids','scaling'],['circles','shaded'],['special_right','shaded'],
];

export const EDGES: TopicEdge[] = RAW_EDGES.map(([s, t, cross]) => ({
  source: s,
  target: t,
  cross: cross === true,
}));

// ── Pre-computed adjacency maps ──────────────────────────────────────────────
export const PREREQS: Record<string, string[]> = {};  // id → prerequisite ids
export const CHILDREN: Record<string, string[]> = {}; // id → child ids
export const NODE_BY_ID: Record<string, TopicNode> = {};

NODES.forEach(n => { PREREQS[n.id] = []; CHILDREN[n.id] = []; NODE_BY_ID[n.id] = n; });
EDGES.forEach(e => {
  if (PREREQS[e.target]) PREREQS[e.target].push(e.source);
  if (CHILDREN[e.source]) CHILDREN[e.source].push(e.target);
});

// ── Helpers ─────────────────────────────────────────────────────────────────
export function getRealmForNode(node: TopicNode): RealmDef {
  return REALMS[node.realm];
}

export function getNodesForRealm(realmId: RealmId): TopicNode[] {
  return NODES.filter(n => n.realm === realmId);
}

export function isCapstone(node: TopicNode): boolean {
  return node.capstone === true;
}
