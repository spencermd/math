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
  LESSONS,
  NODES,
  NODE_BY_ID,
  getNodesForRealm,
  getRealmForNode,
  getStatus,
  isCapstone,
  buildReviewSession,
  isDone,
  nextPlacementTopic,
  type RealmId,
  type ReviewItem,
} from '@mathtree/curriculum';
import { useProgress } from '@/lib/progress-store';
import { LAYOUT } from '@/lib/tree-layout';
import TopicNode, { type TopicFlowNode } from './TopicNode';
import { TopicPanel } from './TopicPanel';
import { RealmBar } from './RealmBar';
import { TopBar } from './TopBar';
import { RealmCeremony } from './RealmCeremony';
import { Lesson } from './Lesson';
import { Review } from './Review';
import { ReviewButton } from './ReviewButton';
import { Challenge, type ChallengeItem } from './Challenge';
import { Placement, type PlacementItem } from './Placement';
import { Welcome } from './Welcome';

const nodeTypes = { topic: TopicNode };

/** The full-screen activity in front of the tree, if any. */
type Activity =
  | { kind: 'lesson'; topicId: string }
  | { kind: 'review'; items: ReviewItem[] }
  | { kind: 'challenge'; topicId: string; items: ChallengeItem[] }
  | { kind: 'placement'; first: PlacementItem };

// Only called from event handlers, so rendering stays pure.
const newSeed = () => Math.floor(Math.random() * 2 ** 31);

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
  const [activity, setActivity] = useState<Activity | null>(null);
  const { fitView, setCenter } = useReactFlow();
  const setStatus = useProgress(s => s.setStatus);
  const setWelcomed = useProgress(s => s.setWelcomed);
  // Greet a learner who hasn't begun. Anyone with saved progress has plainly found their way in.
  const showWelcome = useProgress(
    s => !s.welcomed && !Object.values(s.nodes).some(n => n.status !== 'locked' && n.status !== 'available'),
  );
  const firstTopic = NODES.find(n => getStatus(n.id, progress) === 'available');

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

  const openLesson = useCallback((topicId: string) => setActivity({ kind: 'lesson', topicId }), []);

  const startLearning = (topicId: string) => {
    if (getStatus(topicId, useProgress.getState().nodes) === 'available') setStatus(topicId, 'in_progress');
    openLesson(topicId);
  };

  const startReview = () => {
    const { reviews, nodes } = useProgress.getState();
    const items = buildReviewSession(reviews, nodes, Math.random);
    if (items.length) setActivity({ kind: 'review', items });
  };

  const startChallenge = (topicId: string) =>
    setActivity({
      kind: 'challenge',
      topicId,
      items: LESSONS[topicId].rungs.map(r => ({ rungId: r.id, seed: newSeed() })),
    });

  const startPlacement = () => {
    const topicId = nextPlacementTopic(useProgress.getState().nodes, []);
    if (topicId) setActivity({ kind: 'placement', first: { topicId, seed: newSeed() } });
  };

  // Back from the placement quiz, show everything it opened rather than a ceremony for each realm.
  const finishPlacement = () => {
    setActivity(null);
    setSelectedId(null);
    dismissCeremony();
    const nodes = useProgress.getState().nodes;
    const open = NODES.filter(n => getStatus(n.id, nodes) === 'available');
    fitView({ nodes: open.map(n => ({ id: n.id })), padding: 0.3, maxZoom: 1.1, duration: 700 });
  };

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
          onPractice={openLesson}
          onChallenge={startChallenge}
        />
      )}
      {!selectedId && <ReviewButton onStart={startReview} />}
      {activity?.kind === 'lesson' && <Lesson topicId={activity.topicId} onClose={() => setActivity(null)} />}
      {activity?.kind === 'review' && <Review items={activity.items} onClose={() => setActivity(null)} />}
      {activity?.kind === 'challenge' && (
        <Challenge
          topicId={activity.topicId}
          items={activity.items}
          onClose={() => setActivity(null)}
          onLearn={startLearning}
        />
      )}
      {activity?.kind === 'placement' && (
        <Placement first={activity.first} newSeed={newSeed} onClose={finishPlacement} />
      )}
      {showWelcome && !activity && firstTopic && (
        <Welcome
          firstTopic={firstTopic.label}
          onStart={() => {
            setWelcomed();
            startLearning(firstTopic.id);
          }}
          onPlacement={() => {
            setWelcomed();
            startPlacement();
          }}
          onBrowse={setWelcomed}
        />
      )}
      {/* A realm unlocked mid-lesson is celebrated once the learner is back at the tree. */}
      {pendingCeremony !== null && !activity && (
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
