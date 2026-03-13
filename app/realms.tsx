import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RealmCard } from '@/components/RealmCard';
import { REALMS, REALM_ORDER } from '@/data/curriculum';
import { useRealmProgress, useOverallProgress, useCurrentRealm } from '@/hooks/useProgress';
import { useProgressStore } from '@/store/progressStore';
import { useAuthStore } from '@/store/authStore';
import { FONTS, SIZES } from '@/constants/typography';
import { COLORS } from '@/constants/colors';

const { width } = Dimensions.get('window');

function RealmRow({ realmId }: { realmId: string | number }) {
  const progress = useRealmProgress(realmId);
  const realm = REALMS[realmId];

  // A realm is locked if 0% complete AND no nodes are available in it
  // (simplified: show as locked if progress is 0 and it's not realm 1)
  const isLocked = progress === 0 && realmId !== 1 && realmId !== REALM_ORDER[0];

  return (
    <RealmCard
      realm={realm}
      progress={progress}
      isLocked={false}  // Let the card dim based on progress; don't block navigation
      onPress={() => router.push(`/realm/${realmId}`)}
    />
  );
}

export default function RealmsScreen() {
  const { completed, total } = useOverallProgress();
  const currentRealm = useCurrentRealm();
  const streak = useProgressStore(s => s.streak);
  const resetProgress = useProgressStore(s => s.resetProgress);
  const clearKey = useAuthStore(s => s.clearKey);
  const [showSettings, setShowSettings] = useState(false);

  const handleReset = () => {
    Alert.alert(
      'Reset Progress',
      'Are you sure? All your progress will be erased.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: resetProgress },
      ],
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Remove your API key from this iPad?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await clearKey();
            router.replace('/auth');
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Arcanum Mathematica</Text>
          <Text style={styles.subtitle}>
            {REALMS[currentRealm]?.name ?? 'The Primordial Garden'}
          </Text>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{completed}/{total}</Text>
            <Text style={styles.statLabel}>Mastered</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => setShowSettings(v => !v)}
          >
            <Text style={styles.settingsIcon}>⚙</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Settings dropdown */}
      {showSettings && (
        <View style={styles.settingsPanel}>
          <TouchableOpacity style={styles.settingsItem} onPress={handleReset}>
            <Text style={styles.settingsItemText}>Reset All Progress</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.settingsItem} onPress={handleSignOut}>
            <Text style={[styles.settingsItemText, { color: '#e86b7f' }]}>Remove API Key</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Realm grid */}
      <FlatList
        data={REALM_ORDER}
        keyExtractor={id => String(id)}
        numColumns={3}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => <RealmRow realmId={item} />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontFamily: FONTS.cinzelBold,
    fontSize: SIZES.xl,
    color: COLORS.goldLight,
    letterSpacing: 2,
  },
  subtitle: {
    fontFamily: FONTS.inter,
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    letterSpacing: 1,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  stat: { alignItems: 'center' },
  statVal: {
    fontFamily: FONTS.cinzelBold,
    fontSize: SIZES.lg,
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontFamily: FONTS.inter,
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  settingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#15142a',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: { fontSize: 16, color: COLORS.textSecondary },
  settingsPanel: {
    position: 'absolute',
    right: 28,
    top: 70,
    backgroundColor: '#15142a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    zIndex: 100,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 0.5,
  },
  settingsItem: { padding: 16 },
  settingsItemText: {
    fontFamily: FONTS.inter,
    fontSize: SIZES.base,
    color: COLORS.textPrimary,
  },
  divider: { height: 1, backgroundColor: COLORS.border },
  grid: { padding: 20 },
  row: { gap: 14, justifyContent: 'center', marginBottom: 14 },
});
