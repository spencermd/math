import { memo } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import type { RealmDef, Status, TopicNode as Topic } from '@mathtree/curriculum';

export type TopicNodeData = {
  topic: Topic;
  status: Status;
  realm: RealmDef;
  capstone: boolean;
};

export type TopicFlowNode = Node<TopicNodeData, 'topic'>;

const GLYPH: Partial<Record<Status, string>> = {
  locked: '🔒',
  in_progress: '◐',
  completed: '✓',
  mastered: '★',
};

function styleFor(status: Status, realm: RealmDef) {
  switch (status) {
    case 'locked':
      return { background: realm.locked, borderColor: 'var(--line)', color: 'var(--ink-faint)', opacity: 0.45 };
    case 'available':
      return { background: 'var(--surface)', borderColor: realm.border, color: 'var(--ink)', boxShadow: `0 0 18px ${realm.glow}` };
    case 'in_progress':
      return { background: `${realm.color}99`, borderColor: realm.border, color: 'var(--ink)', boxShadow: `0 0 22px ${realm.glow}` };
    case 'completed':
      return { background: realm.color, borderColor: realm.border, color: '#fff', boxShadow: `0 0 22px ${realm.glow}` };
    case 'mastered':
      return { background: realm.color, borderColor: 'var(--gold)', color: '#fff', borderWidth: 3, boxShadow: '0 0 26px #FFD70066' };
  }
}

function TopicNodeView({ data, selected }: NodeProps<TopicFlowNode>) {
  const { topic, status, realm, capstone } = data;
  const glyph = GLYPH[status];
  return (
    <div
      className="topic-node"
      data-status={status}
      data-capstone={capstone || undefined}
      data-selected={selected || undefined}
      style={styleFor(status, realm)}
      aria-label={`${topic.label}, ${status.replace('_', ' ')}`}
    >
      <Handle type="target" position={Position.Top} isConnectable={false} />
      <span className="topic-label">{topic.label}</span>
      {glyph && <span className="topic-glyph" aria-hidden>{glyph}</span>}
      <Handle type="source" position={Position.Bottom} isConnectable={false} />
    </div>
  );
}

export default memo(TopicNodeView);
