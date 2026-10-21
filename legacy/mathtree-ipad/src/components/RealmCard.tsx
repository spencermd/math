import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { RealmDef } from '../data/curriculum';
import { FONTS, SIZES } from '../constants/typography';

interface Props {
  realm: RealmDef;
  progress: number;      // 0–100
  isLocked: boolean;
  onPress: () => void;
}

const { width } = Dimensions.get('window');
const CARD_W = (width - 80) / 3;  // 3-column grid with 80px total padding
const CARD_H = CARD_W * 0.65;

export function RealmCard({ realm, progress, isLocked, onPress }: Props) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isLocked && progress === 0) {
      // Pulse available (not yet started) realms
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.03, duration: 1200, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0,  duration: 1200, useNativeDriver: true }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isLocked, progress, pulseAnim]);

  const borderColor = isLocked ? '#2a2a3a' : realm.border;
  const bgOpacity = isLocked ? 0.3 : 1;
  const progressBarWidth = (CARD_W - 32) * (progress / 100);

  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        disabled={isLocked}
        activeOpacity={0.75}
        style={[
          styles.card,
          {
            borderColor,
            opacity: bgOpacity,
            shadowColor: isLocked ? 'transparent' : realm.color,
          },
        ]}
      >
        {/* Background glow layer */}
        {!isLocked && (
          <View
            style={[StyleSheet.absoluteFill, styles.glowLayer, { backgroundColor: realm.color + '18' }]}
          />
        )}

        {/* Label row */}
        <View style={styles.labelRow}>
          <Text style={[styles.numeral, { color: isLocked ? '#3a3a4a' : realm.border }]}>
            {realm.label}
          </Text>
        </View>

        {/* Realm name */}
        <Text
          style={[styles.name, { color: isLocked ? '#3a3a4a' : realm.color }]}
          numberOfLines={1}
        >
          {realm.name}
        </Text>
        <Text
          style={[styles.sub, { color: isLocked ? '#2a2a3a' : '#a7a9be' }]}
          numberOfLines={2}
        >
          {realm.sub}
        </Text>

        {/* Progress bar */}
        {!isLocked && (
          <View style={styles.progressWrap}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: progressBarWidth, backgroundColor: realm.color },
                ]}
              />
            </View>
            <Text style={[styles.progressPct, { color: realm.border }]}>
              {progress}%
            </Text>
          </View>
        )}

        {isLocked && (
          <Text style={styles.lockedLabel}>Locked</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 14,
    borderWidth: 1.5,
    backgroundColor: '#0f0e17',
    padding: 16,
    justifyContent: 'space-between',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 12,
    shadowOpacity: 0.35,
    elevation: 6,
  },
  glowLayer: {
    borderRadius: 13,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  numeral: {
    fontFamily: FONTS.cinzelBold,
    fontSize: SIZES.lg,
    letterSpacing: 1,
  },
  name: {
    fontFamily: FONTS.cinzelSemibold,
    fontSize: SIZES.base,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  sub: {
    fontFamily: FONTS.inter,
    fontSize: SIZES.xs,
    lineHeight: 15,
    marginTop: 2,
  },
  progressWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#1a1a2e',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },
  progressPct: {
    fontFamily: FONTS.inter,
    fontSize: SIZES.xs,
    minWidth: 30,
    textAlign: 'right',
  },
  lockedLabel: {
    fontFamily: FONTS.inter,
    fontSize: SIZES.xs,
    color: '#3a3a4a',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
