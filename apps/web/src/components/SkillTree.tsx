'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  EDGES,
  NODES,
  getNodesForRealm,
  getRealmForNode,
  getStatus,
  isCapstone,
  type Status,
} from '@mathtree/curriculum';
import { useProgress } from '@/lib/progress-store';
import { LAYOUT } from '@/lib/tree-layout';
import TopicNode, { type TopicFlowNode } from './TopicNode';
import { TopicPanel } from './TopicPanel';
import { RealmBar } from './RealmBar';
import { TopBar } from './TopBar';
import { RealmCeremony } from './RealmCeremony';

const nodeTypes = { topic: TopicNode };
const isDone = (s: Status) => s === 'completed' || s === 'mastered';
const byId = new Map(NODES.map(n => [n.id, n]));

export function SkillTree() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    Promise.resolve(useProgress.persist.rehydrate()).then(() => setHydrated(true));
  }, []);

  if (!hydrated) {
    return <div className="loading">Growing your tree…</div>;
  }
  return (
    <ReactFlowProvider>
      <TreeView />
    </ReactFlowProvider>
  );
}

function TreeView() {
  const progress = useProgress(s => s.nodes);
  const pendingCeremony = useProgress(s => s.pendingCeremony);
  const dismissCeremony = useProgress(s => s.dismissCeremony);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { fitView, setCenter } = useReactFlow();

  // Open on the learner's frontier rather than the whole tree.
  const [initialFit] = useState(() => {
    const saved = useProgress.getState().nodes;
    const frontier = NODES.filter(n => {
      const s = getStatus(n.id, saved);
      return s === 'available' || s === 'in_progress';
    });
    return { nodes: frontier.map(n => ({ id: n.id })), padding: 0.5, maxZoom: 1.1 };
  });

  const nodes = useMemo<TopicFlowNode[]>(
    () =>
      NODES.map(topic => {
        const box = LAYOUT[topic.id];
        return {
          id: topic.id,
          type: 'topic',
          position: { x: box.x, y: box.y },
          width: box.width,
          height: box.height,
          selected: topic.id === selectedId,
          data: {
            topic,
            status: getStatus(topic.id, progress),
            realm: getRealmForNode(topic),
            capstone: isCapstone(topic),
          },
        };
      }),
    [progress, selectedId],
  );

  const edges = useMemo<Edge[]>(
    () =>
      EDGES.map(e => {
        const sourceDone = isDone(getStatus(e.source, progress));
        const targetDone = isDone(getStatus(e.target, progress));
        const realm = getRealmForNode(byId.get(e.target)!);
        const touched = selectedId === e.source || selectedId === e.target;
        const stroke = sourceDone && targetDone ? realm.color : sourceDone ? realm.border : 'var(--line)';
        return {
          id: `${e.source}->${e.target}`,
          source: e.source,
          target: e.target,
          selectable: false,
          animated: sourceDone && !targetDone,
          style: {
            stroke: touched ? 'var(--ink)' : stroke,
            strokeWidth: touched ? 2.5 : sourceDone ? 2 : 1.25,
            strokeDasharray: e.cross ? '6 4' : undefined,
            opacity: touched || sourceDone ? 0.95 : 0.5,
          },
        };
      }),
    [progress, selectedId],
  );

  const focusTopic = useCallback(
    (id: string) => {
      const box = LAYOUT[id];
      setSelectedId(id);
      setCenter(box.x + box.width / 2, box.y + box.height / 2, { zoom: 1.1, duration: 500 });
    },
    [setCenter],
  );

  // Realms are spread across the whole tree, so zoom to the topics the learner can reach there.
  const jumpToRealm = useCallback(
    (realmId: string | number) => {
      const realmNodes = getNodesForRealm(realmId);
      const nodes = useProgress.getState().nodes;
      const open = realmNodes.filter(n => getStatus(n.id, nodes) !== 'locked');
      setSelectedId(null);
      fitView({
        nodes: (open.length ? open : realmNodes).map(n => ({ id: n.id })),
        padding: 0.3,
        maxZoom: 1.1,
        duration: 700,
      });
    },
    [fitView],
  );

  return (
    <div className="tree-shell">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        colorMode="dark"
        fitView
        fitViewOptions={initialFit}
        minZoom={0.1}
        maxZoom={2.5}
        nodesDraggable={false}
        nodesConnectable={false}
        edgesFocusable={false}
        onNodeClick={(_, node) => setSelectedId(node.id)}
        onPaneClick={() => setSelectedId(null)}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={28} size={1} color="var(--line)" />
        <Controls showInteractive={false} position="bottom-left" />
      </ReactFlow>

      <TopBar />
      <RealmBar onJump={jumpToRealm} />
      {selectedId && (
        <TopicPanel topicId={selectedId} onClose={() => setSelectedId(null)} onSelect={focusTopic} />
      )}
      {pendingCeremony !== null && (
        <RealmCeremony
          realmId={pendingCeremony}
          onEnter={() => {
            dismissCeremony();
            jumpToRealm(pendingCeremony);
          }}
        />
      )}
    </div>
  );
}
