import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { TopicNode, getRealmForNode, isCapstone } from '../data/curriculum';
import { type Status } from '../utils/progressEngine';
import { FONTS, SIZES } from '../constants/typography';
import { COLORS } from '../constants/colors';

interface Props {
  node: TopicNode;
  status: Status;
  progress: number;
  onPress: () => void;
}

const STATUS_ICONS: Record<Status, string> = {
  locked:      '🔒',
  available:   '✦',
  in_progress: '◐',
  completed:   '✓',
  mastered:    '★',
};

export function TopicCard({ node, status, progress, onPress }: Props) {
  const realm = getRealmForNode(node);
  const capstone = isCapstone(node);
  const glowAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (status === 'available') {
      const glow = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1.0, duration: 1500, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0.4, duration: 1500, useNativeDriver: true }),
        ]),
      );
      glow.start();
      return () => glow.stop();
    }
    glowAnim.setValue(status === 'locked' ? 0 : 1);
  }, [status, glowAnim]);

  const sc = COLORS.status[status];
  const borderColor =
    status === 'mastered' ? '#FFD700' :
    status === 'locked'   ? '#2a2a3a' :
    realm.border;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={status === 'locked'}
      activeOpacity={0.7}
      style={[
        styles.card,
        capstone && styles.capstoneBorder,
        {
          borderColor,
          backgroundColor: sc.bg,
          opacity: sc.opacity,
          shadowColor: status === 'locked' ? 'transparent' : realm.color,
        },
      ]}
    >
      {/* Status icon */}
      <Text style={[styles.icon, { color: status === 'locked' ? '#3a3a4a' : realm.border }]}>
        {STATUS_ICONS[status]}
      </Text>

      {/* Label */}
      <Text
        style={[styles.label, { color: sc.text }]}
        numberOfLines={3}
      >
        {node.label}
      </Text>

      {/* Progress bar for in_progress */}
      {status === 'in_progress' && (
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress}%` as `${number}%`, backgroundColor: realm.color },
            ]}
          />
        </View>
      )}

      {/* Glow border animation for available */}
      {status === 'available' && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.glowBorder,
            { borderColor: realm.border, opacity: glowAnim },
          ]}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 150,
    minHeight: 110,
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 12,
    margin: 6,
    justifyContent: 'space-between',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    shadowOpacity: 0.4,
    elevation: 4,
  },
  capstoneBorder: {
    borderWidth: 2,
    borderRadius: 8,
  },
  glowBorder: {
    borderRadius: 11,
    borderWidth: 1.5,
  },
  icon: {
    fontSize: SIZES.md,
    marginBottom: 6,
  },
  label: {
    fontFamily: FONTS.cinzelSemibold,
    fontSize: SIZES.sm,
    lineHeight: 18,
    letterSpacing: 0.3,
    flex: 1,
  },
  progressTrack: {
    height: 3,
    backgroundColor: '#1a1a2e',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFill: {
    height: 3,
    borderRadius: 2,
  },
});
