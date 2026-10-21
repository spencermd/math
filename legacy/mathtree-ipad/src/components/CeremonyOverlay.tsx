import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, Animated } from 'react-native';
import { REALMS } from '../data/curriculum';
import { FONTS, SIZES } from '../constants/typography';
import { useProgressStore } from '../store/progressStore';

export function CeremonyOverlay() {
  const pendingCeremony = useProgressStore(s => s.pendingCeremony);
  const dismiss = useProgressStore(s => s.dismissCeremony);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    if (pendingCeremony) {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.85);
      Animated.sequence([
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
        ]),
        Animated.delay(2000),
        Animated.timing(fadeAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]).start(() => dismiss());
    }
  }, [pendingCeremony, fadeAnim, scaleAnim, dismiss]);

  if (!pendingCeremony) return null;

  const realm = REALMS[pendingCeremony];
  if (!realm) return null;

  return (
    <Modal transparent animationType="none" visible={!!pendingCeremony}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={[styles.label, { color: realm.border }]}>Realm Unlocked</Text>
          <Text style={[styles.realmName, { color: realm.color }]}>{realm.name}</Text>
          <Text style={[styles.sub, { color: realm.border }]}>{realm.sub}</Text>
          <Text style={styles.stars}>✦ ✦ ✦</Text>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#0f0e17',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2d2b42',
    minWidth: 360,
    shadowColor: '#e6a817',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 40,
    shadowOpacity: 0.4,
  },
  label: {
    fontFamily: FONTS.inter,
    fontSize: SIZES.sm,
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  realmName: {
    fontFamily: FONTS.cinzelBold,
    fontSize: SIZES.xxl,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 8,
  },
  sub: {
    fontFamily: FONTS.cinzel,
    fontSize: SIZES.base,
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 20,
  },
  stars: {
    fontSize: SIZES.lg,
    color: '#e6a817',
    letterSpacing: 8,
  },
});
