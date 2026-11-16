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
  NODE_BY_ID,
  getNodesForRealm,
  getRealmForNode,
  getStatus,
  isCapstone,
  isDone,
  type RealmId,
} from '@mathtree/curriculum';
import { useProgress } from '@/lib/progress-store';
import { LAYOUT } from '@/lib/tree-layout';
import TopicNode, { type TopicFlowNode } from './TopicNode';
import { TopicPanel } from './TopicPanel';
import { RealmBar } from './RealmBar';
import { TopBar } from './TopBar';
import { RealmCeremony } from './RealmCeremony';
import { Lesson } from './Lesson';

const nodeTypes = { topic: TopicNode };

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
  const [lessonTopic, setLessonTopic] = useState<string | null>(null);
  const { fitView, setCenter } = useReactFlow();

  // Open where the learner left off: the topics they're partway through, or else the next one they can
  // start. Fitting every open topic would zoom out until nothing is readable, since they're spread wide.
  const [initialFit] = useState(() => {
    const saved = useProgress.getState().nodes;
    const current = NODES.filter(n => getStatus(n.id, saved) === 'in_progress');
    const next = NODES.find(n => getStatus(n.id, saved) === 'available');
    const focus = current.length ? current : next ? [next] : [];
    return { nodes: focus.map(n => ({ id: n.id })), padding: 0.5, maxZoom: 1.1, minZoom: 0.5 };
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
        const realm = getRealmForNode(NODE_BY_ID[e.target]);
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
    (realmId: RealmId) => {
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
        <TopicPanel
          topicId={selectedId}
          onClose={() => setSelectedId(null)}
          onSelect={focusTopic}
          onPractice={setLessonTopic}
        />
      )}
      {lessonTopic && <Lesson topicId={lessonTopic} onClose={() => setLessonTopic(null)} />}
      {/* A realm unlocked mid-lesson is celebrated once the learner is back at the tree. */}
      {pendingCeremony !== null && !lessonTopic && (
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
