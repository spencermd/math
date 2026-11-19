import { memo } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import type { RealmDef, Status, TopicNode as Topic } from '@mathtree/curriculum';

export type TopicNodeData = {
  topic: Topic;
  status: Status;
  realm: RealmDef;
  capstone: boolean;
  /** A good one to do next: everything it builds on is finished. */
  ready: boolean;
};

export type TopicFlowNode = Node<TopicNodeData, 'topic'>;

const GLYPH: Partial<Record<Status, string>> = {
  in_progress: '◐',
  completed: '✓',
  mastered: '★',
};

function styleFor(status: Status, realm: RealmDef, ready: boolean) {
  switch (status) {
    case 'available':
      // Every topic is open. The ones worth doing next are lit; the rest wait quietly in their realm's colour.
      return ready
        ? { background: 'var(--surface)', borderColor: realm.border, color: 'var(--ink)', boxShadow: `0 0 18px ${realm.glow}` }
        : { background: 'var(--surface)', borderColor: `${realm.color}99`, color: 'var(--ink-muted)' };
    case 'in_progress':
      return { background: `${realm.color}99`, borderColor: realm.border, color: 'var(--ink)', boxShadow: `0 0 22px ${realm.glow}` };
    case 'completed':
      return { background: realm.color, borderColor: realm.border, color: '#fff', boxShadow: `0 0 22px ${realm.glow}` };
    case 'mastered':
      return { background: realm.color, borderColor: 'var(--gold)', color: '#fff', borderWidth: 3, boxShadow: '0 0 26px #FFD70066' };
  }
}

/** A thorny bramble along the top and bottom edges of a tricky topic. */
function Thorns() {
  const spikes = (y: number, dir: 1 | -1) =>
    Array.from({ length: 9 }, (_, i) => {
      const x = 6 + i * 11;
      return `M${x} ${y} L${x + 3} ${y - dir * 7} L${x + 6} ${y}`;
    }).join(' ');
  return (
    <svg className="thorns" viewBox="0 0 106 40" preserveAspectRatio="none" aria-hidden>
      <path d="M0 2 C20 5 40 -1 60 3 C80 6 95 0 106 3" />
      <path d="M0 38 C20 35 40 41 60 37 C80 34 95 40 106 37" />
      <path className="thorn-spikes" d={`${spikes(3, 1)} ${spikes(37, -1)}`} />
    </svg>
  );
}

function TopicNodeView({ data, selected }: NodeProps<TopicFlowNode>) {
  const { topic, status, realm, capstone, ready } = data;
  const glyph = GLYPH[status];
  // The trickiest branches, MATHCOUNTS level, grow thorns.
  const thorny = topic.tier === 3;
  const isDone = status === 'completed' || status === 'mastered';
  return (
    <div
      className="topic-node"
      data-status={status}
      data-capstone={capstone || undefined}
      data-selected={selected || undefined}
      data-thorny={thorny || undefined}
      style={styleFor(status, realm, ready)}
      aria-label={`${topic.label}, ${status.replace('_', ' ')}${thorny ? ', tricky' : ''}`}
    >
      {/* The tree grows upward: what a topic builds on lies below it. */}
      <Handle type="target" position={Position.Bottom} isConnectable={false} />
      {thorny && <Thorns />}
      <span className="topic-label">{topic.label}</span>
      {glyph && <span className="topic-glyph" aria-hidden>{glyph}</span>}
      {isDone && <span className="topic-bloom" aria-hidden>{status === 'mastered' ? '🌼' : '🌸'}</span>}
      <Handle type="source" position={Position.Top} isConnectable={false} />
    </div>
  );
}

export default memo(TopicNodeView);
