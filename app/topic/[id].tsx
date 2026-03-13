import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TutorPanel } from '@/components/TutorPanel';
import { NODES, PREREQS, CHILDREN, getRealmForNode, isCapstone } from '@/data/curriculum';
import { useProgressStore } from '@/store/progressStore';
import { getStatus } from '@/utils/progressEngine';
import { FONTS, SIZES } from '@/constants/typography';
import { COLORS } from '@/constants/colors';

const { width } = Dimensions.get('window');
const PANEL_WIDTH = Math.min(420, width * 0.42);

export default function TopicScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const nodes = useProgressStore(s => s.nodes);
  const setStatus = useProgressStore(s => s.setStatus);
  const setNotes = useProgressStore(s => s.setNotes);
  const setProgress = useProgressStore(s => s.setProgress);

  const node = NODES.find(n => n.id === id);
  if (!node) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={{ color: 'white', padding: 20 }}>Topic not found.</Text>
      </SafeAreaView>
    );
  }

  const realm = getRealmForNode(node);
  const capstone = isCapstone(node);
  const status = getStatus(node.id, nodes);
  const nodeData = nodes[node.id] ?? { status: 'locked', progress: 0, notes: '' };
  const prereqs = PREREQS[node.id] ?? [];
  const children = CHILDREN[node.id] ?? [];

  const navigateTo = (targetId: string) => {
    router.push(`/topic/${targetId}`);
  };

  const renderActions = () => {
    switch (status) {
      case 'locked':
        return (
          <View style={[styles.lockedBtn, { borderColor: '#2a2a3a' }]}>
            <Text style={styles.lockedBtnText}>🔒 Complete Prerequisites First</Text>
          </View>
        );

      case 'available':
        return (
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: realm.color }]}
            onPress={() => setStatus(node.id, 'in_progress', 0)}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryBtnText}>✦ Begin Study</Text>
          </TouchableOpacity>
        );

      case 'in_progress': {
        const prog = nodeData.progress ?? 0;
        return (
          <View style={styles.progressSection}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={[styles.progressPct, { color: realm.border }]}>{prog}%</Text>
            </View>
            <View style={styles.sliderTrack}>
              <View
                style={[
                  styles.sliderFill,
                  { width: `${prog}%` as `${number}%`, backgroundColor: realm.color },
                ]}
              />
              {/* Touch zones: tap left half to decrease, right half to increase */}
              <View style={styles.sliderTapZone}>
                {[0, 25, 50, 75, 100].map(v => (
                  <TouchableOpacity
                    key={v}
                    style={styles.sliderTick}
                    onPress={() => setProgress(node.id, v)}
                    hitSlop={{ top: 20, bottom: 20, left: 10, right: 10 }}
                  >
                    <Text style={[styles.sliderTickLabel, { color: prog >= v ? realm.border : COLORS.textMuted }]}>
                      {v}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: realm.color, marginTop: 12 }]}
              onPress={() => setStatus(node.id, 'completed')}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryBtnText}>✓ Mark Complete</Text>
            </TouchableOpacity>
          </View>
        );
      }

      case 'completed':
        return (
          <View style={styles.actionsStack}>
            <Text style={styles.completedLabel}>
              ✓ Completed{nodeData.completedAt ? ` on ${nodeData.completedAt.split('T')[0]}` : ''}
            </Text>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: '#DAA520' }]}
              onPress={() => setStatus(node.id, 'mastered')}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryBtnText}>★ Mark as Mastered</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => setStatus(node.id, 'in_progress', 50)}
              activeOpacity={0.8}
            >
              <Text style={[styles.secondaryBtnText, { color: realm.border }]}>Revert to In Progress</Text>
            </TouchableOpacity>
          </View>
        );

      case 'mastered':
        return (
          <View style={styles.actionsStack}>
            <Text style={[styles.masteredLabel, { color: '#FFD700' }]}>★ MASTERED ★</Text>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => setStatus(node.id, 'completed')}
              activeOpacity={0.8}
            >
              <Text style={[styles.secondaryBtnText, { color: realm.border }]}>Revert to Completed</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Close button */}
      <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>

      <View style={styles.layout}>
        {/* ── LEFT: Info + Actions ──────────────────────────────── */}
        <ScrollView style={styles.leftPane} showsVerticalScrollIndicator={false}>
          {/* Realm badge + title */}
          <Text style={[styles.realmBadge, { color: realm.border }]}>
            {realm.name}
          </Text>
          <Text style={[styles.topicTitle, { color: realm.color }]}>
            {node.label}
          </Text>
          {capstone && (
            <Text style={[styles.capstoneTag, { color: '#FF9A6C' }]}>Capstone</Text>
          )}
          <Text style={styles.description}>{node.d}</Text>

          {/* Prerequisites */}
          {prereqs.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Prerequisites</Text>
              {prereqs.map(pid => {
                const pn = NODES.find(n => n.id === pid);
                const ps = getStatus(pid, nodes);
                const done = ps === 'completed' || ps === 'mastered';
                return (
                  <TouchableOpacity
                    key={pid}
                    style={styles.prereqItem}
                    onPress={() => navigateTo(pid)}
                  >
                    <View style={[styles.dot, { backgroundColor: done ? '#2dc653' : '#3a3a4a' }]} />
                    <Text style={[styles.prereqText, done && styles.prereqDone]}>
                      {pn?.label ?? pid}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Unlocks */}
          {children.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Unlocks</Text>
              {children.map(cid => {
                const cn = NODES.find(n => n.id === cid);
                const cr = getRealmForNode(cn!);
                return (
                  <TouchableOpacity
                    key={cid}
                    style={styles.prereqItem}
                    onPress={() => navigateTo(cid)}
                  >
                    <Text style={[styles.unlockDiamond, { color: cr.border }]}>◆</Text>
                    <Text style={styles.prereqText}>{cn?.label ?? cid}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Status Actions */}
          <View style={styles.section}>{renderActions()}</View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Notes</Text>
            <TextInput
              style={styles.notesInput}
              multiline
              value={nodeData.notes}
              onChangeText={text => setNotes(node.id, text)}
              placeholder="Write your thoughts, insights, or reminders..."
              placeholderTextColor={COLORS.textMuted}
            />
          </View>
        </ScrollView>

        {/* ── RIGHT: AI Tutor ─────────────────────────────────── */}
        <View style={styles.rightPane}>
          <TutorPanel
            topicId={node.id}
            realmColor={realm.color}
            realmBorder={realm.border}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 20,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#15142a',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { color: COLORS.textSecondary, fontSize: SIZES.md },
  layout: {
    flex: 1,
    flexDirection: 'row',
    paddingTop: 16,
  },
  leftPane: {
    flex: 1,
    paddingHorizontal: 28,
    paddingBottom: 40,
  },
  rightPane: {
    width: PANEL_WIDTH,
    padding: 20,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
  },
  realmBadge: {
    fontFamily: FONTS.inter,
    fontSize: SIZES.xs,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  topicTitle: {
    fontFamily: FONTS.cinzelBold,
    fontSize: SIZES.xxl,
    letterSpacing: 1,
    lineHeight: 36,
    marginBottom: 6,
  },
  capstoneTag: {
    fontFamily: FONTS.inter,
    fontSize: SIZES.xs,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  description: {
    fontFamily: FONTS.inter,
    fontSize: SIZES.base,
    color: COLORS.textSecondary,
    lineHeight: 24,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  section: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#1a1a2e',
  },
  sectionTitle: {
    fontFamily: FONTS.cinzelSemibold,
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  prereqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  dot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  unlockDiamond: { fontSize: 12, width: 14, textAlign: 'center' },
  prereqText: {
    fontFamily: FONTS.inter,
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  prereqDone: { textDecorationLine: 'line-through', color: COLORS.textMuted },
  lockedBtn: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  lockedBtnText: {
    fontFamily: FONTS.inter,
    fontSize: SIZES.sm,
    color: COLORS.textMuted,
  },
  primaryBtn: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontFamily: FONTS.cinzelBold,
    fontSize: SIZES.base,
    color: '#0a0a14',
    letterSpacing: 1,
  },
  secondaryBtn: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#15142a',
  },
  secondaryBtnText: {
    fontFamily: FONTS.cinzel,
    fontSize: SIZES.sm,
  },
  progressSection: { gap: 4 },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontFamily: FONTS.inter,
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  progressPct: {
    fontFamily: FONTS.interSemibold,
    fontSize: SIZES.sm,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: '#1a1a2e',
    borderRadius: 3,
    overflow: 'visible',
    marginBottom: 12,
  },
  sliderFill: { height: 6, borderRadius: 3 },
  sliderTapZone: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  sliderTick: { alignItems: 'center' },
  sliderTickLabel: {
    fontFamily: FONTS.inter,
    fontSize: SIZES.xs,
  },
  actionsStack: { gap: 10 },
  completedLabel: {
    fontFamily: FONTS.inter,
    fontSize: SIZES.sm,
    color: '#2dc653',
    textAlign: 'center',
    marginBottom: 4,
  },
  masteredLabel: {
    fontFamily: FONTS.cinzelBold,
    fontSize: SIZES.lg,
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: 8,
  },
  notesInput: {
    backgroundColor: '#0c0b18',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    fontFamily: FONTS.inter,
    fontSize: SIZES.sm,
    color: COLORS.textPrimary,
    minHeight: 100,
    lineHeight: 22,
  },
});
