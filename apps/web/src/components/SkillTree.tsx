'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controls, ReactFlow, ReactFlowProvider, ViewportPortal, useReactFlow, type Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  EDGES,
  EVERYTHING,
  LESSONS,
  NODES,
  NODE_BY_ID,
  buildReviewSession,
  dueTopics,
  getNodesForRealm,
  getRealmForNode,
  getStatus,
  isCapstone,
  isDone,
  isReady,
  isRungCleared,
  type FactoryScope,
  type RealmId,
  type ReviewItem,
} from '@mathtree/curriculum';
import { useProgress } from '@/lib/progress-store';
import { useLook } from '@/lib/look-store';
import { LAYOUT } from '@/lib/tree-layout';
import TopicNode, { type TopicFlowNode } from './TopicNode';
import { TopicPanel } from './TopicPanel';
import { RealmBar } from './RealmBar';
import { TopBar } from './TopBar';
import { Lesson } from './Lesson';
import { Review } from './Review';
import { Factory } from './Factory';
import { Challenge, type ChallengeItem } from './Challenge';
import { BadgeGallery, BadgeToast } from './Badges';
import { Welcome } from './Welcome';
import { TreeBackdrop } from './TreeBackdrop';
import { Sky, Vines } from './Sky';
import { Phoenix } from './Phoenix';
import { Wardrobe } from './Wardrobe';
import { PhoenixArt } from './PhoenixArt';

const nodeTypes = { topic: TopicNode };

/** The full-screen activity in front of the tree, if any. */
type Activity =
  | { kind: 'lesson'; topicId: string; resume?: { rungId: string; seed: number } }
  | { kind: 'factory'; scope: FactoryScope }
  | { kind: 'review'; items: ReviewItem[] }
  | { kind: 'challenge'; topicId: string; items: ChallengeItem[] }
  | { kind: 'badges' }
  | { kind: 'wardrobe' };

// Only called from event handlers, so rendering stays pure.
const newSeed = () => Math.floor(Math.random() * 2 ** 31);

export function SkillTree() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    Promise.all([useProgress.persist.rehydrate(), useLook.persist.rehydrate()]).then(() => {
      useProgress.getState().checkBadges();
      setHydrated(true);
    });
  }, []);

  if (!hydrated) {
    return (
      <div className="loading">
        <PhoenixArt size={64} className="loading-phoenix" />
        Growing your tree…
      </div>
    );
  }
  return (
    <ReactFlowProvider>
      <TreeView />
    </ReactFlowProvider>
  );
}

function TreeView() {
  const progress = useProgress(s => s.nodes);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activity, setActivity] = useState<Activity | null>(null);
  // The realm last flown to, for the phoenix to introduce; `flight` counts trips.
  const [flown, setFlown] = useState<{ realm: RealmId | null; flight: number }>({ realm: null, flight: 0 });
  const { fitView, setCenter } = useReactFlow();
  const setStatus = useProgress(s => s.setStatus);
  const setWelcomed = useProgress(s => s.setWelcomed);
  // Greet a learner who hasn't begun. Anyone with saved progress has plainly found their way in.
  const showWelcome = useProgress(s => !s.welcomed && Object.values(s.nodes).every(n => n.status === 'available'));
  const due = useProgress(s => dueTopics(s.reviews, s.nodes).length);
  const firstTopic = NODES[0];

  // Open where the learner left off: the topics they're partway through, or else a good one to do next.
  // Fitting the whole tree would zoom out until nothing is readable.
  const [initialFit] = useState(() => {
    const saved = useProgress.getState().nodes;
    const current = NODES.filter(n => getStatus(n.id, saved) === 'in_progress');
    const next = NODES.find(n => isReady(n.id, saved));
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
            ready: isReady(topic.id, progress),
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
        // A link from another realm crosses the whole canopy; it stays faint until one of its ends is picked.
        const crossRealm = NODE_BY_ID[e.source].realm !== NODE_BY_ID[e.target].realm;
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
            strokeDasharray: e.cross || crossRealm ? '6 6' : undefined,
            opacity: touched ? 0.95 : crossRealm ? 0.14 : sourceDone ? 0.9 : 0.5,
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

  const jumpToRealm = useCallback(
    (realmId: RealmId) => {
      setSelectedId(null);
      setFlown(f => ({ realm: realmId, flight: f.flight + 1 }));
      fitView({
        nodes: getNodesForRealm(realmId).map(n => ({ id: n.id })),
        padding: 0.3,
        maxZoom: 1.1,
        duration: 700,
      });
    },
    [fitView],
  );

  // Begin a topic, or carry on from the first step not yet cleared if the learner has already been practicing.
  const startLearning = (topicId: string) => {
    const { nodes, practice } = useProgress.getState();
    if (getStatus(topicId, nodes) === 'available') setStatus(topicId, 'in_progress');
    const rungs = LESSONS[topicId].rungs;
    const next = rungs.find(r => !isRungCleared(r.id, practice));
    const begun = rungs.some(r => (practice[r.id] ?? 0) > 0);
    setActivity({
      kind: 'lesson',
      topicId,
      resume: begun && next ? { rungId: next.id, seed: newSeed() } : undefined,
    });
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

  const openFactory = (scope: FactoryScope = EVERYTHING) => setActivity({ kind: 'factory', scope });

  // From a problem straight to its topic on the tree, with the topic's panel open.
  const study = (topicId: string) => {
    setActivity(null);
    focusTopic(topicId);
  };

  return (
    <div className="tree-shell">
      <Sky />
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
        <ViewportPortal>
          <TreeBackdrop onPortal={() => openFactory()} />
        </ViewportPortal>
        <Controls showInteractive={false} position="bottom-left" />
      </ReactFlow>

      <Vines />
      <TopBar onBadges={() => setActivity({ kind: 'badges' })} onWardrobe={() => setActivity({ kind: 'wardrobe' })} />
      <RealmBar onJump={jumpToRealm} />
      {selectedId && (
        <TopicPanel
          topicId={selectedId}
          onClose={() => setSelectedId(null)}
          onSelect={focusTopic}
          onPractice={startLearning}
          onChallenge={startChallenge}
          onFactory={topicId => openFactory({ realm: null, tier: null, topicId })}
        />
      )}
      {!selectedId && (
        <button className="factory-button" onClick={() => openFactory()}>
          <span className="factory-portal" aria-hidden />
          <strong>Problem Factory</strong>
          <span>{due > 0 ? `Contest problems · ${due} to review` : 'Try some contest problems'}</span>
        </button>
      )}
      {activity?.kind === 'lesson' && (
        <Lesson
          key={activity.topicId}
          topicId={activity.topicId}
          resume={activity.resume}
          onClose={() => setActivity(null)}
        />
      )}
      {activity?.kind === 'factory' && (
        <Factory scope={activity.scope} onClose={() => setActivity(null)} onStudy={study} onReview={startReview} />
      )}
      {activity?.kind === 'review' && <Review items={activity.items} onClose={() => setActivity(null)} onStudy={study} />}
      {activity?.kind === 'challenge' && (
        <Challenge
          topicId={activity.topicId}
          items={activity.items}
          onClose={() => setActivity(null)}
          onLearn={startLearning}
        />
      )}
      {activity?.kind === 'badges' && <BadgeGallery onClose={() => setActivity(null)} />}
      {activity?.kind === 'wardrobe' && <Wardrobe onClose={() => setActivity(null)} />}
      {!selectedId && !activity && !showWelcome && (
        <Phoenix realm={flown.realm} flight={flown.flight} due={due} onFocus={focusTopic} onReview={startReview} />
      )}
      {showWelcome && !activity && (
        <Welcome
          firstTopic={firstTopic.label}
          onStart={() => {
            setWelcomed();
            startLearning(firstTopic.id);
          }}
          onFactory={() => {
            setWelcomed();
            openFactory();
          }}
          onBrowse={setWelcomed}
        />
      )}
      <BadgeToast />
    </div>
  );
}
