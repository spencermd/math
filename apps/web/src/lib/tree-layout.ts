import dagre from '@dagrejs/dagre';
import { NODES, EDGES, isCapstone } from '@mathtree/curriculum';

export interface Box {
  x: number; // top-left, as React Flow expects
  y: number;
  width: number;
  height: number;
}

export const TOPIC_SIZE = { width: 160, height: 60 };
export const CAPSTONE_SIZE = { width: 220, height: 76 };

/** Top-to-bottom layered layout of the whole curriculum. Deterministic, so computed once. */
function layoutTree(): Record<string, Box> {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'TB', nodesep: 40, ranksep: 90, edgesep: 12, ranker: 'tight-tree' });
  g.setDefaultEdgeLabel(() => ({}));

  // dagre writes x/y onto the label object, so each node needs its own copy.
  for (const n of NODES) g.setNode(n.id, { ...(isCapstone(n) ? CAPSTONE_SIZE : TOPIC_SIZE) });
  for (const e of EDGES) g.setEdge(e.source, e.target);
  dagre.layout(g);

  const boxes: Record<string, Box> = {};
  for (const n of NODES) {
    const { x, y, width, height } = g.node(n.id);
    boxes[n.id] = { x: x - width / 2, y: y - height / 2, width, height };
  }
  return boxes;
}

export const LAYOUT = layoutTree();
