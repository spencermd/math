import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useTutor } from '../hooks/useTutor';
import { FONTS, SIZES } from '../constants/typography';
import { COLORS } from '../constants/colors';

interface Props {
  topicId: string;
  realmColor: string;
  realmBorder: string;
}

export function TutorPanel({ topicId, realmColor, realmBorder }: Props) {
  const { response, loading, error, ask, clear } = useTutor();

  const handleAsk = (type: 'explain' | 'problems') => {
    clear();
    ask(topicId, type);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>AI Tutor</Text>

      <View style={styles.btnRow}>
        <TouchableOpacity
          style={[styles.btn, { borderColor: realmBorder }]}
          onPress={() => handleAsk('explain')}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Text style={[styles.btnText, { color: realmBorder }]}>✦ Explain This</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, { borderColor: realmBorder }]}
          onPress={() => handleAsk('problems')}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Text style={[styles.btnText, { color: realmBorder }]}>✦ Practice Problems</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={realmColor} size="small" />
          <Text style={[styles.loadingText, { color: realmColor }]}>
            The oracle contemplates...
          </Text>
        </View>
      )}

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {response && (
        <ScrollView style={styles.responseBox} showsVerticalScrollIndicator={false}>
          <Text style={styles.responseText}>{response}</Text>
        </ScrollView>
      )}

      {!loading && !error && !response && (
        <Text style={styles.hint}>Tap a button to invoke the oracle.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#0c0b18',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2a2040',
    gap: 12,
  },
  heading: {
    fontFamily: FONTS.cinzelSemibold,
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  btn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'rgba(28,22,46,0.8)',
    alignItems: 'center',
  },
  btnText: {
    fontFamily: FONTS.cinzelSemibold,
    fontSize: SIZES.xs,
    letterSpacing: 0.5,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  loadingText: {
    fontFamily: FONTS.inter,
    fontSize: SIZES.sm,
    fontStyle: 'italic',
  },
  errorBox: {
    backgroundColor: 'rgba(255,80,60,0.1)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,80,60,0.3)',
  },
  errorText: {
    fontFamily: FONTS.inter,
    fontSize: SIZES.sm,
    color: '#ff8070',
    lineHeight: 20,
  },
  responseBox: {
    maxHeight: 280,
    backgroundColor: 'rgba(8,7,18,0.9)',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e1a30',
  },
  responseText: {
    fontFamily: FONTS.inter,
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  hint: {
    fontFamily: FONTS.inter,
    fontSize: SIZES.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingVertical: 8,
  },
});
