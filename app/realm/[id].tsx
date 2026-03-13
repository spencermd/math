import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopicCard } from '@/components/TopicCard';
import { REALMS, getNodesForRealm } from '@/data/curriculum';
import { useProgressStore } from '@/store/progressStore';
import { useRealmProgress } from '@/hooks/useProgress';
import { getStatus } from '@/utils/progressEngine';
import { FONTS, SIZES } from '@/constants/typography';
import { COLORS } from '@/constants/colors';

export default function RealmScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const nodes = useProgressStore(s => s.nodes);
  const realm = REALMS[id ?? 1];
  const topics = getNodesForRealm(id ?? 1);
  const progress = useRealmProgress(id ?? 1);

  if (!realm) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.notFound}>Realm not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: realm.color + '40' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: realm.border }]}>‹ Realms</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[styles.realmLabel, { color: realm.border }]}>
            {realm.label} · {realm.name}
          </Text>
          <Text style={styles.realmSub}>{realm.sub}</Text>
        </View>

        <View style={styles.progressBadge}>
          <View style={[styles.progressTrack, { backgroundColor: realm.color + '30' }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress}%` as `${number}%`, backgroundColor: realm.color },
              ]}
            />
          </View>
          <Text style={[styles.progressPct, { color: realm.border }]}>{progress}%</Text>
        </View>
      </View>

      {/* Topics grid */}
      <FlatList
        data={topics}
        keyExtractor={n => n.id}
        numColumns={5}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <TopicCard
            node={item}
            status={getStatus(item.id, nodes)}
            progress={nodes[item.id]?.progress ?? 0}
            onPress={() => router.push(`/topic/${item.id}`)}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  notFound: { color: COLORS.textSecondary, textAlign: 'center', marginTop: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    gap: 20,
  },
  backBtn: { minWidth: 80 },
  backText: {
    fontFamily: FONTS.cinzelSemibold,
    fontSize: SIZES.base,
    letterSpacing: 0.5,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  realmLabel: {
    fontFamily: FONTS.cinzelBold,
    fontSize: SIZES.lg,
    letterSpacing: 1,
  },
  realmSub: {
    fontFamily: FONTS.inter,
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  progressBadge: {
    minWidth: 120,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: { height: 6, borderRadius: 3 },
  progressPct: {
    fontFamily: FONTS.interSemibold,
    fontSize: SIZES.sm,
    minWidth: 34,
    textAlign: 'right',
  },
  grid: { padding: 20 },
  row: { gap: 4, justifyContent: 'flex-start', marginBottom: 4 },
});
