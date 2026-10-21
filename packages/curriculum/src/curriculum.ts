// ─────────────────────────────────────────────────────────────────────────────
// Curriculum data — ported from Arcanum Mathematica (math_skill_tree.html)
// 107 topics · ~170 prerequisite edges · 9 realms
// ─────────────────────────────────────────────────────────────────────────────

export type RealmId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | '8a' | '8b';
export type CapstoneId = 'cap_a' | 'cap_b';
export type NodeRealmId = RealmId | CapstoneId;

/** School grade: 0 = kindergarten, 1–12 = grades 1–12, 13 = college. */
export type Grade = number;

export interface RealmDef {
  id: RealmId;
  /** Typical US grade band for this realm's topics. */
  grades: { from: Grade; to: Grade };
  label: string;   // Roman numeral for sidebar
  name: string;
  sub: string;
  color: string;
  border: string;
  glow: string;
  locked: string;
}

export interface TopicNode {
  id: string;
  label: string;
  realm: NodeRealmId;
  d: string;  // description
}

export interface TopicEdge {
  source: string;
  target: string;
  cross: boolean;
}

// ── Realms ────────────────────────────────────────────────────────────────────
export const REALMS: Record<string | number, RealmDef> = {
  1:   { id:1,  label:'I',   grades:{ from: 0, to: 2 }, name:'The Primordial Garden',    sub:'Where numbers are born',                            color:'#D4A017', border:'#F5D060', glow:'#D4A01740', locked:'#3A3520' },
  2:   { id:2,  label:'II',  grades:{ from: 3, to: 4 }, name:'The Stone Columns',        sub:'Structure rises from arithmetic',                   color:'#5A6A8A', border:'#8899BB', glow:'#5A6A8A40', locked:'#2A2E38' },
  3:   { id:3,  label:'III', grades:{ from: 5, to: 6 }, name:'The Crossroads',           sub:'Paths diverge through number and form',             color:'#1A8A7A', border:'#40D4B8', glow:'#1A8A7A40', locked:'#1A2E2A' },
  4:   { id:4,  label:'IV',  grades:{ from: 7, to: 8 }, name:'The Awakening',            sub:'Letters replace numbers — abstraction ignites',     color:'#7B4FBF', border:'#B89AE8', glow:'#7B4FBF40', locked:'#2A2038' },
  5:   { id:5,  label:'V',   grades:{ from: 9, to:10 }, name:'The Ascent',               sub:'The mountain of algebra and proof',                 color:'#B5334A', border:'#E86B7F', glow:'#B5334A40', locked:'#381A22' },
  6:   { id:6,  label:'VI',  grades:{ from:10, to:11 }, name:'The Deepening',            sub:'Crystalline caverns of advanced algebra',           color:'#2255AA', border:'#5599EE', glow:'#2255AA40', locked:'#1A2238' },
  7:   { id:7,  label:'VII', grades:{ from:11, to:12 }, name:'The Convergence',          sub:'All paths meet in the temple of angles',            color:'#E6A817', border:'#FFD65C', glow:'#E6A81740', locked:'#3A3520' },
  '8a':{ id:'8a' as RealmId, label:'∞',   grades:{ from:13, to:13 }, name:'The Infinite Staircase', sub:'Calculus and differential equations', color:'#1B998B', border:'#3DCBB8', glow:'#1B998B40', locked:'#1A2E28' },
  '8b':{ id:'8b' as RealmId, label:'◇',   grades:{ from:13, to:13 }, name:'The Crystal Lattice',   sub:'Linear algebra — pure structure',      color:'#6C5CE7', border:'#A29BFE', glow:'#6C5CE740', locked:'#221E38' },
};

export const REALM_ORDER: (string | number)[] = [1, 2, 3, 4, 5, 6, 7, '8a', '8b'];

// ── Nodes (107) ───────────────────────────────────────────────────────────────
export const NODES: TopicNode[] = [
  // Realm I: The Primordial Garden
  { id:'counting',          label:'Counting',              realm:1, d:'Where all journeys begin. Ancient shepherds placed stones — calculi — to track their flocks, and so mathematics was born.' },
  { id:'number_sense',      label:'Number Sense',          realm:1, d:'Comparing quantities: more, less, equal. The first ordering that brings structure to chaos.' },
  { id:'add_basic',         label:'Addition',              realm:1, d:'The first act of combination. Two quantities unite to form something greater — the primal spell of arithmetic.' },
  { id:'sub_basic',         label:'Subtraction',           realm:1, d:'The art of taking away. What remains when part of the whole is removed? Addition\'s shadow and twin.' },
  { id:'place_value',       label:'Place Value',           realm:1, d:'A digit\'s position determines its power. The Babylonians glimpsed it; the Hindu scholars perfected it.' },
  { id:'shapes_2d',         label:'Flat Shapes',           realm:1, d:'Circles, squares, triangles — the fundamental forms that compose all of visible reality. Geometry\'s first words.' },
  { id:'patterns',          label:'Patterns',              realm:1, d:'Recognizing recurrence. Patterns are the heartbeat of mathematics, repeating endlessly in nature and number.' },
  { id:'measurement',       label:'Measurement',           realm:1, d:'Assigning numbers to the physical world. Length, weight, capacity — bridging the abstract and the tangible.' },
  { id:'time_money',        label:'Time & Money',          realm:1, d:'Clocks divide the day, coins divide value. Mathematics enters daily life through commerce and timekeeping.' },

  // Realm II: The Stone Columns
  { id:'mult',              label:'Multiplication',        realm:2, d:'Repeated addition reveals a deeper operation. The times table, memorized by scholars for millennia across every civilization.' },
  { id:'div',               label:'Division',              realm:2, d:'The inverse of multiplication. Fair sharing, partitioning — finding how many times one quantity contains another.' },
  { id:'multi_digit_add',   label:'Multi-Digit Addition',  realm:2, d:'Carrying and regrouping — the algorithm that lets us add numbers of any magnitude, digit by patient digit.' },
  { id:'multi_digit_sub',   label:'Multi-Digit Subtraction',realm:2,d:'Borrowing across place values. A mechanical procedure that encodes deep understanding of number structure.' },
  { id:'place_value_ext',   label:'Extended Place Value',  realm:2, d:'Thousands, millions, billions. Each new magnitude opens another chamber of numerical possibility.' },
  { id:'fractions_intro',   label:'Intro to Fractions',    realm:2, d:'Breaking the whole into parts. Half, third, quarter — the Egyptians wrote fractions with the Eye of Horus.' },
  { id:'geometry_basic',    label:'Basic Geometry',        realm:2, d:'Perimeter traces the boundary; area fills the interior. The first quantification of space itself.' },
  { id:'data_graphs',       label:'Data & Graphs',         realm:2, d:'Making numbers visible. Bar charts and picture graphs transform raw data into stories the eye can read.' },
  { id:'word_problems',     label:'Word Problems',         realm:2, d:'Translating stories into equations. The bridge between natural language and mathematical symbolism.' },

  // Realm III: The Crossroads
  { id:'fractions',         label:'Fractions',             realm:3, d:'Equivalent fractions, common denominators, mixed numbers. Between any two fractions lie infinitely more — the rationals are dense.' },
  { id:'frac_mult_div',     label:'Fraction Mult & Div',   realm:3, d:'Multiplying fractions: "of" becomes "times." Dividing: multiply by the reciprocal. Elegant inversions of thought.' },
  { id:'decimals',          label:'Decimals',              realm:3, d:'Fractions in the language of place value. Simon Stevin\'s 1585 notation transformed commerce and science forever.' },
  { id:'dec_operations',    label:'Decimal Operations',    realm:3, d:'Arithmetic with decimal points. The rules of alignment and shifting that govern our currency and measurements.' },
  { id:'percents',          label:'Percents',              realm:3, d:'Parts per hundred — a universal language of comparison, from interest rates to probabilities to the chance of rain.' },
  { id:'neg_numbers',       label:'Negative Numbers',      realm:3, d:'Below zero lies a mirror world. Chinese scribes used red and black rods; Brahmagupta formalized the rules in 628 AD.' },
  { id:'int_operations',    label:'Integer Operations',    realm:3, d:'Arithmetic across the full number line. Negative times negative yields positive — a fact that puzzled minds for centuries.' },
  { id:'ratios',            label:'Ratios & Proportions',  realm:3, d:'Comparing quantities by division. The golden ratio, pi, the speed of light — all ratios that define our universe.' },
  { id:'order_ops',         label:'Order of Operations',   realm:3, d:'PEMDAS: the grammar of mathematical expression. Without agreed conventions, equations dissolve into ambiguity.' },
  { id:'factors_primes',    label:'Factors & Primes',      realm:3, d:'Primes — the atoms of arithmetic. Every integer has a unique prime factorization: the Fundamental Theorem of Arithmetic.' },
  { id:'geometry_mid',      label:'Intermediate Geometry', realm:3, d:'Areas of triangles and parallelograms, volume of prisms. Geometry grows from lines to surfaces to solids.' },
  { id:'data_stats',        label:'Statistics Basics',     realm:3, d:'Mean, median, mode — different lenses for finding the center of a dataset. Statistics begins its whispered revelations.' },

  // Realm IV: The Awakening
  { id:'variables',         label:'Variables & Expressions',realm:4,d:'Letters replace numbers. al-Khwarizmi\'s al-jabr gave algebra its name and mathematics its most powerful instrument.' },
  { id:'one_step_eq',       label:'One-Step Equations',    realm:4, d:'Solving for x. One operation guards the unknown. Undo it with its inverse, and the truth stands revealed.' },
  { id:'two_step_eq',       label:'Two-Step Equations',    realm:4, d:'Two barriers to the unknown. Peel them away in reverse order — the first taste of algorithmic reasoning.' },
  { id:'inequalities_basic',label:'Basic Inequalities',    realm:4, d:'Not everything is equal. Greater than, less than — constraints that define entire regions of possibility on the number line.' },
  { id:'linear_patterns',   label:'Linear Patterns',       realm:4, d:'Input becomes output through a rule. The seed of function, the essence of mathematical predictability.' },
  { id:'coord_plane',       label:'Coordinate Plane',      realm:4, d:'Descartes\' great synthesis: geometry meets algebra on a grid. Every point has coordinates; every equation has a shape.' },
  { id:'graphing_lines',    label:'Graphing Lines',        realm:4, d:'y = mx + b. Slope captures rate of change; intercept captures starting position. The simplest function, yet endlessly useful.' },
  { id:'exponents_intro',   label:'Exponents',             realm:4, d:'Repeated multiplication. Powers of 2 double; powers of 10 add zeros. Einstein called compound growth the eighth wonder.' },
  { id:'roots_intro',       label:'Square Roots',          realm:4, d:'The inverse of squaring. √2 was the first known irrational — it shattered the Pythagorean belief that all is ratio.' },
  { id:'geometry_trans',    label:'Transformations',       realm:4, d:'Translations, reflections, rotations, dilations. Geometry becomes dynamic — shapes dance across the coordinate plane.' },
  { id:'probability',       label:'Probability',           realm:4, d:'Quantifying uncertainty. Pascal and Fermat exchanged letters about gambling — and probability theory was born.' },
  { id:'angle_relationships',label:'Angle Relationships',  realm:4, d:'Complementary, supplementary, vertical. When parallel lines meet a transversal, angle pairs dance in predictable patterns.' },

  // Realm V: The Ascent
  { id:'multi_step_eq',     label:'Multi-Step Equations',  realm:5, d:'Variables on both sides. Some equations have no solution; others have infinitely many. Existence becomes a question.' },
  { id:'systems_intro',     label:'Systems of Equations',  realm:5, d:'Two equations, two unknowns. Where lines intersect, solutions live. Substitution and elimination — methods of revelation.' },
  { id:'linear_ineq_sys',   label:'Systems of Inequalities',realm:5,d:'Inequalities carve out feasible regions. Linear programming optimizes within constraints — the mathematics of real-world decisions.' },
  { id:'functions',         label:'Functions',             realm:5, d:'f(x) — a machine transforming input to output. Domain, range, composition. Functions are the native language of science.' },
  { id:'polynomials',       label:'Polynomials',           realm:5, d:'Sums of power terms. From linear to cubic and beyond — each degree adds new curves to the polynomial garden.' },
  { id:'factoring',         label:'Factoring',             realm:5, d:'Decomposing polynomials into irreducible pieces. The reverse of multiplication, and the master key to solving equations.' },
  { id:'quadratics',        label:'Quadratic Equations',   realm:5, d:'ax² + bx + c = 0. The quadratic formula, known to Babylonian scribes 4000 years ago, solves every one.' },
  { id:'quad_graphs',       label:'Quadratic Graphs',      realm:5, d:'Parabolas — the curves of projectiles, satellite dishes, and suspension bridges. Vertex, axis of symmetry, concavity.' },
  { id:'exponent_rules',    label:'Exponent Rules',        realm:5, d:'Product rule, quotient rule, power rule. Negative and rational exponents extend the operation into new territories.' },
  { id:'radicals',          label:'Radicals',              realm:5, d:'nth roots and rational exponents. Rationalizing denominators, solving radical equations. The irrational becomes tractable.' },
  { id:'rational_expr',     label:'Rational Expressions',  realm:5, d:'Fractions with polynomials. All the rules of fractions, elevated to the algebraic realm. Watch for excluded values.' },
  { id:'rational_eq',       label:'Rational Equations',    realm:5, d:'Equations with rational expressions. Beware extraneous solutions — not every algebraic answer survives verification.' },
  { id:'geometry_proof',    label:'Geometric Proofs',      realm:5, d:'Two-column proofs and congruence theorems: SSS, SAS, ASA. Euclid\'s method — the gold standard of logical certainty.' },
  { id:'circle_geo',        label:'Circle Geometry',       realm:5, d:'Inscribed angles, central angles, tangent lines, secants. The circle\'s geometry is among the richest in all mathematics.' },
  { id:'similarity',        label:'Similarity',            realm:5, d:'Same shape, different scale. AA similarity, geometric mean, special right triangles — 30-60-90 and 45-45-90.' },
  { id:'data_regression',   label:'Regression',            realm:5, d:'Fitting curves to scattered data. The line of best fit, correlation — mathematics learns to see pattern in noise.' },

  // Realm VI: The Deepening
  { id:'abs_value',         label:'Absolute Value',        realm:6, d:'Distance from zero, regardless of direction. V-shaped graphs emerge — piecewise linearity in its simplest form.' },
  { id:'poly_graphs',       label:'Polynomial Graphs',     realm:6, d:'End behavior, turning points, zeros and multiplicity. Every polynomial tells a story in the shape of its curve.' },
  { id:'poly_div',          label:'Polynomial Division',   realm:6, d:'Long division and synthetic division. The Remainder and Factor Theorems connect a polynomial\'s zeros to its factors.' },
  { id:'complex_numbers',   label:'Complex Numbers',       realm:6, d:'i = √(−1). Euler called them "imaginary," yet complex numbers complete algebra — every polynomial now has roots.' },
  { id:'exponential',       label:'Exponential Functions', realm:6, d:'Growth and decay. Populations double, isotopes halve. The number e ≈ 2.718... emerges as nature\'s own base.' },
  { id:'logarithms',        label:'Logarithms',            realm:6, d:'The inverse of exponentiation. Napier\'s 1614 invention turned multiplication into addition and empowered astronomers.' },
  { id:'log_exp_eq',        label:'Log & Exp Equations',   realm:6, d:'Variables in the exponent yield to logarithms. Half-lives, pH scales, Richter magnitudes — all logarithmic.' },
  { id:'sequences_series',  label:'Sequences & Series',    realm:6, d:'Arithmetic and geometric progressions. Sigma notation compresses infinite sums. Young Gauss summed 1 to 100 in seconds.' },
  { id:'conic_sections',    label:'Conic Sections',        realm:6, d:'Slice a cone: ellipses, parabolas, hyperbolas emerge. Apollonius classified them; Kepler found planets follow them.' },
  { id:'matrices_intro',    label:'Intro to Matrices',     realm:6, d:'Arrays of numbers encoding transformations. Cayley\'s 1858 invention would reshape mathematics and computer science.' },
  { id:'matrix_systems',    label:'Matrix Systems',        realm:6, d:'Solving systems via augmented matrices. Row reduction — a mechanical path to solutions of any linear system.' },
  { id:'vectors_intro',     label:'Intro to Vectors',      realm:6, d:'Magnitude and direction united. Hamilton searched years to extend complex numbers to 3D — and discovered quaternions.' },
  { id:'combinatorics',     label:'Counting & Combinatorics',realm:6,d:'Permutations, combinations, Pascal\'s triangle, the binomial theorem. The mathematics of "how many ways?"' },

  // Realm VII: The Convergence
  { id:'trig_ratios',       label:'Trig Ratios',           realm:7, d:'SOH-CAH-TOA. In a right triangle, three ratios encode all angle-side relationships. Hipparchus tabulated them circa 150 BC.' },
  { id:'unit_circle',       label:'The Unit Circle',       realm:7, d:'One circle of radius one contains all of trigonometry. Every angle, every ratio, every wave — encoded in perfect unity.' },
  { id:'trig_graphs',       label:'Trig Graphs',           realm:7, d:'Sine waves: the shape of sound, light, electricity, tides. Amplitude, period, phase shift — the parameters of oscillation.' },
  { id:'trig_identities',   label:'Trig Identities',       realm:7, d:'Pythagorean, double-angle, sum-difference. These identities are the algebraic skeleton beneath trigonometry\'s flesh.' },
  { id:'trig_equations',    label:'Trig Equations',        realm:7, d:'Solving equations with trig functions. Infinite solutions collapse to finitely many on restricted domains.' },
  { id:'law_of_sines_cos',  label:'Law of Sines & Cosines',realm:7, d:'Beyond right triangles. These laws solve any triangle — navigation, surveying, and astronomy depend on them.' },
  { id:'polar_coords',      label:'Polar Coordinates',     realm:7, d:'r and θ replace x and y. Spirals, roses, cardioids bloom in polar gardens — a new way to see the plane.' },
  { id:'parametric',        label:'Parametric Equations',  realm:7, d:'Curves traced by a moving point through time. Projectile paths, cycloids, Lissajous figures — motion made mathematical.' },
  { id:'precalculus',       label:'Pre-Calculus',          realm:7, d:'The summit before the infinite. Advanced function analysis, composition, inverses, and the first whispers of limits.' },

  // Realm VIII-A: The Infinite Staircase
  { id:'limits',            label:'Limits & Continuity',   realm:'8a', d:'ε–δ: the rigorous heart of calculus. What happens as we approach — never quite arriving, yet knowing exactly what awaits.' },
  { id:'derivatives',       label:'Derivatives',           realm:'8a', d:'The slope of the tangent line. Newton saw falling apples; Leibniz saw infinitesimal geometry. Together they unveiled the calculus.' },
  { id:'deriv_apps',        label:'Applications of Derivatives',realm:'8a',d:'Optimization, related rates, L\'Hôpital\'s rule. Derivatives answer the practical: maximum profit, minimum cost, fastest path.' },
  { id:'integration',       label:'Integration',           realm:'8a', d:'The Fundamental Theorem unites derivatives and integrals — area under curves becomes antiderivative. Newton and Leibniz\'s miracle.' },
  { id:'int_tech',          label:'Integration Techniques',realm:'8a', d:'By parts, trig substitution, partial fractions. Each technique unlocks integrals that resist simpler methods.' },
  { id:'int_apps',          label:'Applications of Integration',realm:'8a',d:'Volumes of revolution, arc length, surface area, work. Integration builds three-dimensional objects from two-dimensional slices.' },
  { id:'sequences_calc',    label:'Calculus of Series',    realm:'8a', d:'Convergence tests, Taylor series, power series. Infinite sums can approximate any function — analysis at its purest.' },
  { id:'multivar',          label:'Multivariable Calculus', realm:'8a', d:'Partial derivatives, gradients, Lagrange multipliers. Calculus escapes the line and enters the vast landscape of higher dimensions.' },
  { id:'mult_int',          label:'Multiple Integrals',    realm:'8a', d:'Double and triple integrals. Jacobians, coordinate transforms. Volume, mass, center of gravity — all emerge from integration.' },
  { id:'vec_calc',          label:'Vector Calculus',       realm:'8a', d:'Line and surface integrals. Green\'s, Stokes\', Gauss\' theorems — the crown jewels connecting local behavior to global truth.' },
  { id:'ode1',              label:'First-Order ODEs',      realm:'8a', d:'Separable, exact, linear. Differential equations model everything: populations, circuits, springs, planetary orbits.' },
  { id:'ode2',              label:'Second-Order ODEs',     realm:'8a', d:'Characteristic equations, undetermined coefficients, variation of parameters. The Wronskian tests for independence of solutions.' },
  { id:'laplace',           label:'Laplace Transforms',   realm:'8a', d:'Transform a differential equation into algebra, solve, transform back. Heaviside\'s trick, formalized by Laplace.' },
  { id:'sys_ode',           label:'Systems of ODEs',       realm:'8a', d:'Matrix exponentials, phase portraits, stability analysis. Near equilibria, nonlinear systems reveal their linear soul.' },
  { id:'pde_intro',         label:'Intro to PDEs',         realm:'8a', d:'Heat, wave, and Laplace equations. Fourier\'s bold claim: any function decomposes into sine waves.' },
  { id:'diffeq_capstone',   label:'DIFFERENTIAL EQUATIONS',realm:'cap_a',d:'Sturm-Liouville theory, Green\'s functions, nonlinear dynamics, bifurcation, chaos. The frontier where equations meet nature\'s full complexity.' },

  // Realm VIII-B: The Crystal Lattice
  { id:'proofs',            label:'Proofs & Logic',        realm:'8b', d:'Direct proof, contradiction, induction. The tools of rigorous reasoning — mathematics\' absolute demand for certainty.' },
  { id:'sets',              label:'Set Theory',            realm:'8b', d:'Sets, relations, functions as mappings. Cantor\'s paradise: even infinity comes in different sizes.' },
  { id:'vectors_formal',    label:'Vectors (Formal)',      realm:'8b', d:'Span, linear independence, basis. Vectors freed from coordinates become abstract arrows pointing in any dimension.' },
  { id:'matrices_formal',   label:'Matrix Algebra',        realm:'8b', d:'Multiplication, inverse, transpose, determinants formalized. Cayley\'s creation becomes the universal language of transformation.' },
  { id:'lin_sys',           label:'Linear Systems',        realm:'8b', d:'Gaussian elimination, RREF, rank-nullity. Every linear system is either impossible, unique, or infinite — and we can always tell which.' },
  { id:'vec_spaces',        label:'Vector Spaces',         realm:'8b', d:'Axiomatic spaces, subspaces, basis, dimension. ℝ¹ is a line, ℝ² a plane — but vector spaces can have any dimension, even infinite.' },
  { id:'lin_trans',         label:'Linear Transformations',realm:'8b', d:'Functions preserving vector structure. Every linear transformation is secretly a matrix — and every matrix is secretly a transformation.' },
  { id:'inner_prod',        label:'Inner Product Spaces',  realm:'8b', d:'Inner products generalize angles and lengths. Gram-Schmidt, orthogonal projection, QR factorization, least squares.' },
  { id:'eigen',             label:'Eigenvalues & Eigenvectors',realm:'8b',d:'The soul of a matrix: directions unchanged by transformation, only scaled. Diagonalization reveals a matrix\'s deepest structure.' },
  { id:'svd',               label:'SVD',                   realm:'8b', d:'Singular Value Decomposition: any matrix decomposed into rotation, scaling, rotation. The Swiss army knife of applied mathematics.' },
  { id:'linalg_capstone',   label:'LINEAR ALGEBRA',        realm:'cap_b',d:'Spectral theorem, Jordan normal form, abstract fields. The crystalline foundation for quantum mechanics, machine learning, and pure mathematics.' },
];

// ── Edges (~170) ─────────────────────────────────────────────────────────────
// [source, target, cross?]
const RAW_EDGES: [string, string, boolean?][] = [
  // Realm I
  ['counting','number_sense'],['counting','shapes_2d'],['counting','patterns'],
  ['number_sense','add_basic'],['number_sense','place_value'],['number_sense','measurement'],
  ['add_basic','sub_basic'],['add_basic','time_money'],
  // I → II
  ['sub_basic','mult'],['place_value','mult'],['place_value','multi_digit_add'],['sub_basic','multi_digit_add'],
  // Realm II
  ['mult','div'],['multi_digit_add','multi_digit_sub'],['div','fractions_intro'],
  ['shapes_2d','geometry_basic'],['mult','geometry_basic'],['mult','data_graphs'],
  ['mult','word_problems'],['multi_digit_sub','word_problems'],['place_value','place_value_ext'],
  // II → III
  ['fractions_intro','fractions'],['multi_digit_sub','fractions'],
  // Realm III
  ['fractions','frac_mult_div'],['fractions','decimals'],['place_value_ext','decimals'],
  ['decimals','dec_operations'],['multi_digit_sub','dec_operations'],
  ['decimals','percents'],['frac_mult_div','percents'],
  ['dec_operations','neg_numbers'],['neg_numbers','int_operations'],
  ['frac_mult_div','ratios'],['percents','ratios'],['int_operations','order_ops'],
  ['div','factors_primes'],['mult','factors_primes'],
  ['geometry_basic','geometry_mid'],['dec_operations','geometry_mid'],
  ['data_graphs','data_stats'],['dec_operations','data_stats'],
  // III → IV
  ['order_ops','variables'],['order_ops','exponents_intro'],['factors_primes','exponents_intro'],
  // Realm IV
  ['variables','one_step_eq'],['one_step_eq','two_step_eq'],['frac_mult_div','two_step_eq'],
  ['two_step_eq','inequalities_basic'],['variables','linear_patterns'],['ratios','linear_patterns'],
  ['geometry_mid','coord_plane'],['int_operations','coord_plane'],
  ['coord_plane','graphing_lines'],['linear_patterns','graphing_lines'],
  ['exponents_intro','roots_intro'],['geometry_mid','geometry_trans'],['coord_plane','geometry_trans'],
  ['fractions','probability'],['data_stats','probability'],['geometry_mid','angle_relationships'],
  // IV → V
  ['two_step_eq','multi_step_eq'],['graphing_lines','multi_step_eq'],
  ['graphing_lines','systems_intro'],['graphing_lines','functions'],['linear_patterns','functions'],
  ['variables','polynomials'],['exponents_intro','polynomials'],
  ['exponents_intro','exponent_rules'],['frac_mult_div','exponent_rules'],
  ['roots_intro','quadratics'],['roots_intro','radicals'],['roots_intro','circle_geo'],
  ['angle_relationships','geometry_proof'],['geometry_trans','geometry_proof'],
  ['ratios','similarity'],['data_stats','data_regression'],['graphing_lines','data_regression'],
  // Realm V
  ['multi_step_eq','systems_intro'],['systems_intro','linear_ineq_sys'],['inequalities_basic','linear_ineq_sys'],
  ['polynomials','factoring'],['factoring','quadratics'],['quadratics','quad_graphs'],['functions','quad_graphs'],
  ['exponent_rules','radicals'],['factoring','rational_expr'],['frac_mult_div','rational_expr'],
  ['rational_expr','rational_eq'],['geometry_proof','circle_geo'],['geometry_proof','similarity'],
  // V → VI
  ['functions','abs_value'],['multi_step_eq','abs_value'],
  ['quad_graphs','poly_graphs'],['factoring','poly_graphs'],
  ['radicals','complex_numbers'],['quadratics','complex_numbers'],
  ['exponent_rules','exponential'],['functions','exponential'],
  ['circle_geo','conic_sections'],['quad_graphs','conic_sections'],
  ['systems_intro','matrices_intro'],['similarity','vectors_intro'],['coord_plane','vectors_intro'],
  ['probability','combinatorics'],['factoring','combinatorics'],
  ['linear_patterns','sequences_series'],
  // Realm VI
  ['poly_graphs','poly_div'],['exponential','logarithms'],['logarithms','log_exp_eq'],
  ['exponential','sequences_series'],['matrices_intro','matrix_systems'],['systems_intro','matrix_systems'],
  // VI → VII
  ['similarity','trig_ratios'],['roots_intro','trig_ratios'],
  ['circle_geo','unit_circle'],['functions','trig_graphs'],
  ['complex_numbers','trig_identities'],['vectors_intro','law_of_sines_cos'],
  ['conic_sections','polar_coords'],['poly_graphs','precalculus'],['log_exp_eq','precalculus'],
  // Realm VII
  ['trig_ratios','unit_circle'],['unit_circle','trig_graphs'],['unit_circle','trig_identities'],
  ['trig_identities','trig_equations'],['trig_ratios','law_of_sines_cos'],
  ['unit_circle','polar_coords'],['polar_coords','parametric'],['trig_graphs','parametric'],
  ['trig_graphs','precalculus'],
  // VII → VIII
  ['precalculus','limits'],['precalculus','proofs'],
  ['trig_identities','int_tech'],['sequences_series','sequences_calc'],
  ['vectors_intro','vectors_formal'],['matrices_intro','matrices_formal'],
  ['complex_numbers','ode2'],
  // Realm VIII-A
  ['limits','derivatives'],['derivatives','deriv_apps'],['derivatives','integration'],
  ['integration','int_tech'],['int_tech','int_apps'],['int_tech','sequences_calc'],
  ['deriv_apps','multivar'],['int_tech','mult_int'],['multivar','mult_int'],
  ['multivar','vec_calc'],['mult_int','vec_calc'],
  ['deriv_apps','ode1'],['integration','ode1'],
  ['ode1','ode2'],['ode2','laplace'],['ode2','sys_ode'],
  ['laplace','pde_intro'],['sys_ode','pde_intro'],['vec_calc','pde_intro'],['sequences_calc','pde_intro'],
  ['pde_intro','diffeq_capstone'],
  // Realm VIII-B
  ['proofs','sets'],['proofs','vectors_formal'],
  ['vectors_formal','matrices_formal'],['matrices_formal','lin_sys'],
  ['sets','vec_spaces'],['lin_sys','vec_spaces'],
  ['vec_spaces','lin_trans'],['matrices_formal','lin_trans'],
  ['lin_trans','inner_prod'],['vectors_formal','inner_prod'],
  ['lin_trans','eigen'],['eigen','svd'],['inner_prod','svd'],
  ['svd','linalg_capstone'],
  // Cross-path links
  ['eigen','sys_ode',true],['matrices_formal','sys_ode',true],
  ['lin_trans','multivar',true],['inner_prod','vec_calc',true],
  ['eigen','pde_intro',true],['vec_spaces','sequences_calc',true],
];

export const EDGES: TopicEdge[] = RAW_EDGES.map(([s, t, cross]) => ({
  source: s,
  target: t,
  cross: cross === true,
}));

// ── Pre-computed adjacency maps ──────────────────────────────────────────────
export const PREREQS: Record<string, string[]> = {};  // id → prerequisite ids
export const CHILDREN: Record<string, string[]> = {}; // id → child ids

NODES.forEach(n => { PREREQS[n.id] = []; CHILDREN[n.id] = []; });
EDGES.forEach(e => {
  if (PREREQS[e.target]) PREREQS[e.target].push(e.source);
  if (CHILDREN[e.source]) CHILDREN[e.source].push(e.target);
});

// ── Helpers ─────────────────────────────────────────────────────────────────
export const COLLEGE: Grade = 13;

/** "Grades K–2", "Grades 9–10", "College" */
export function gradeLabel({ grades: { from, to } }: RealmDef): string {
  if (from >= COLLEGE) return 'College';
  const name = (g: Grade) => (g <= 0 ? 'K' : String(g));
  return from === to ? `Grade ${name(from)}` : `Grades ${name(from)}–${name(to)}`;
}

export function getRealmForNode(node: TopicNode): RealmDef {
  if (node.realm === 'cap_a') return REALMS['8a'];
  if (node.realm === 'cap_b') return REALMS['8b'];
  return REALMS[node.realm as RealmId];
}

export function getNodesForRealm(realmId: string | number): TopicNode[] {
  return NODES.filter(n =>
    n.realm === realmId ||
    (realmId === '8a' && n.realm === 'cap_a') ||
    (realmId === '8b' && n.realm === 'cap_b'),
  );
}

export function isCapstone(node: TopicNode): boolean {
  return node.realm === 'cap_a' || node.realm === 'cap_b';
}
