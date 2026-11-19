import dagre from '@dagrejs/dagre';
import { NODES, EDGES, REALM_ORDER, isCapstone, type RealmId, type TopicNode } from '@mathtree/curriculum';

export interface Box {
  x: number; // top-left, as React Flow expects
  y: number;
  width: number;
  height: number;
}

export const TOPIC_SIZE = { width: 160, height: 60 };
export const CAPSTONE_SIZE = { width: 220, height: 76 };

/**
 * Where each realm sits in the canopy: an upper and a lower row of the crown, left to right.
 * Number Sense, which nearly everything builds on, sits in the middle right above the trunk.
 */
const CROWN: RealmId[][] = [
  [2, 4, 5],
  [3, 1, 6],
];
const GAP_X = 170;
const GAP_Y = 260;
/** Room around each realm's topics for its glow and banner. */
const PAD = 70;
const TRUNK_HEIGHT = 520;

/** One realm laid out on its own, foundations at the bottom and its summit at the top. */
function layoutRealm(nodes: TopicNode[]) {
  const ids = new Set(nodes.map(n => n.id));
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'BT', nodesep: 36, ranksep: 80, edgesep: 12, ranker: 'tight-tree' });
  g.setDefaultEdgeLabel(() => ({}));
  // dagre writes x/y onto the label object, so each node needs its own copy.
  for (const n of nodes) g.setNode(n.id, { ...(isCapstone(n) ? CAPSTONE_SIZE : TOPIC_SIZE) });
  for (const e of EDGES) if (ids.has(e.source) && ids.has(e.target)) g.setEdge(e.source, e.target);
  dagre.layout(g);
  const boxes: Record<string, Box> = {};
  for (const n of nodes) {
    const { x, y, width, height } = g.node(n.id);
    boxes[n.id] = { x: x - width / 2, y: y - height / 2, width, height };
  }
  const { width = 0, height = 0 } = g.graph();
  return { boxes, width: width + PAD * 2, height: height + PAD * 2 };
}

export interface TreeShape {
  /** Each realm's patch of canopy, padding included. */
  realms: Record<RealmId, Box>;
  /** Where the trunk meets the crown, and where it meets the ground. */
  trunkTop: { x: number; y: number };
  trunkBase: { x: number; y: number };
  /** Everything, roots included. */
  bounds: Box;
}

/** The whole tree: each realm its own branch of one oak. Deterministic, so computed once. */
function layoutTree(): { boxes: Record<string, Box>; shape: TreeShape } {
  const parts = Object.fromEntries(
    REALM_ORDER.map(id => [id, layoutRealm(NODES.filter(n => n.realm === id))]),
  ) as Record<RealmId, ReturnType<typeof layoutRealm>>;

  const boxes: Record<string, Box> = {};
  const realms = {} as Record<RealmId, Box>;
  let top = 0;
  let minX = Infinity;
  let maxX = -Infinity;
  for (const row of CROWN) {
    const rowHeight = Math.max(...row.map(id => parts[id].height));
    const rowWidth = row.reduce((w, id) => w + parts[id].width, 0) + GAP_X * (row.length - 1);
    let left = -rowWidth / 2;
    for (const id of row) {
      const part = parts[id];
      // Realms in a row stand on the same branch line, so they line up along their bottoms.
      const realmTop = top + rowHeight - part.height;
      realms[id] = { x: left, y: realmTop, width: part.width, height: part.height };
      for (const [nodeId, b] of Object.entries(part.boxes)) {
        boxes[nodeId] = { ...b, x: b.x + left + PAD, y: b.y + realmTop + PAD };
      }
      minX = Math.min(minX, left);
      maxX = Math.max(maxX, left + part.width);
      left += part.width + GAP_X;
    }
    top += rowHeight + GAP_Y;
  }
  const crownBottom = top - GAP_Y;
  const trunkTop = { x: 0, y: crownBottom + 40 };
  const trunkBase = { x: 0, y: crownBottom + TRUNK_HEIGHT };
  return {
    boxes,
    shape: {
      realms,
      trunkTop,
      trunkBase,
      bounds: { x: minX, y: 0, width: maxX - minX, height: trunkBase.y + 160 },
    },
  };
}

const TREE = layoutTree();
export const LAYOUT = TREE.boxes;
export const TREE_SHAPE = TREE.shape;
