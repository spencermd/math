// Sanity checks for the curriculum graph. Run: npm run validate
import {
  NODES, EDGES, REALMS, REALM_ORDER, CHILDREN, gradeLabel,
  cascadeUnlocks, newlyEnteredRealms, updateStreak, visibleStreak, type ProgressMap,
} from '../src/index.ts';

const errors: string[] = [];
const ids = new Set(NODES.map(n => n.id));

if (ids.size !== NODES.length) errors.push('duplicate node ids');
for (const n of NODES) {
  const realm = n.realm === 'cap_a' ? '8a' : n.realm === 'cap_b' ? '8b' : n.realm;
  if (!REALMS[realm]) errors.push(`${n.id}: unknown realm ${n.realm}`);
}
const seen = new Set<string>();
for (const e of EDGES) {
  if (!ids.has(e.source)) errors.push(`edge source missing: ${e.source}`);
  if (!ids.has(e.target)) errors.push(`edge target missing: ${e.target}`);
  const key = `${e.source}->${e.target}`;
  if (seen.has(key)) errors.push(`duplicate edge ${key}`);
  seen.add(key);
}

// Grade bands must be well-formed and never go backwards through the realms
let prevFrom = -1;
for (const id of REALM_ORDER) {
  const { from, to } = REALMS[id].grades;
  if (from > to) errors.push(`realm ${id}: grades from ${from} > to ${to}`);
  if (from < prevFrom) errors.push(`realm ${id}: starts at grade ${from}, before the previous realm`);
  prevFrom = from;
}

// Cycle check (DFS over all edges)
const state: Record<string, 0 | 1 | 2> = {};
const visit = (id: string): boolean => {
  if (state[id] === 1) return false;
  if (state[id] === 2) return true;
  state[id] = 1;
  const ok = CHILDREN[id].every(visit);
  state[id] = 2;
  return ok;
};
if (!NODES.every(n => visit(n.id))) errors.push('cycle detected');

// Completing every topic in order must eventually unlock all of them
let nodes: ProgressMap = { counting: { status: 'available', progress: 0, notes: '' } };
const enteredOrder: (string | number)[] = [];
for (let pass = 0; pass < NODES.length; pass++) {
  const next: ProgressMap = { ...nodes };
  for (const [id, p] of Object.entries(next)) {
    if (p.status === 'available') next[id] = { ...p, status: 'completed', progress: 100 };
  }
  const { newNodes } = cascadeUnlocks(next);
  enteredOrder.push(...newlyEnteredRealms(nodes, newNodes));
  nodes = newNodes;
}
const unreachable = NODES.filter(n => nodes[n.id]?.status !== 'completed').map(n => n.id);
if (unreachable.length) errors.push(`unreachable topics: ${unreachable.join(', ')}`);

// Streak rules
const check = (name: string, got: unknown, want: unknown) => {
  if (got !== want) errors.push(`streak: ${name} → got ${got}, want ${want}`);
};
check('first day', updateStreak(0, null, '2026-10-21').streak, 1);
check('same day', updateStreak(3, '2026-10-21', '2026-10-21').streak, 3);
check('next day', updateStreak(3, '2026-10-20', '2026-10-21').streak, 4);
check('after gap', updateStreak(3, '2026-10-18', '2026-10-21').streak, 1);
check('month boundary', updateStreak(2, '2026-10-31', '2026-11-01').streak, 3);
check('visible yesterday', visibleStreak(5, '2026-10-20', '2026-10-21'), 5);
check('visible lapsed', visibleStreak(5, '2026-10-19', '2026-10-21'), 0);

console.log(`${NODES.length} topics, ${EDGES.length} edges (${EDGES.filter(e => e.cross).length} cross), ${Object.keys(REALMS).length} realms`);
console.log(`grades: ${REALM_ORDER.map(id => `${REALMS[id].label} ${gradeLabel(REALMS[id])}`).join(' · ')}`);
console.log(`realm unlock order: ${enteredOrder.join(' → ')}`);
if (errors.length) {
  console.error('FAIL\n- ' + errors.join('\n- '));
  process.exit(1);
}
console.log('OK');
