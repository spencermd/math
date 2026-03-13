import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { isValidKeyFormat } from '@/services/secureStorage';
import { FONTS, SIZES } from '@/constants/typography';
import { COLORS } from '@/constants/colors';

export default function AuthScreen() {
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setApiKey = useAuthStore(s => s.setKey);

  const handleSubmit = async () => {
    const trimmed = key.trim();
    if (!isValidKeyFormat(trimmed)) {
      setError('That doesn\'t look like a valid Anthropic API key.\nIt should start with "sk-ant-".');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await setApiKey(trimmed);
      router.replace('/realms');
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.headerBlock}>
            <Text style={styles.title}>Arcanum{'\n'}Mathematica</Text>
            <Text style={styles.subtitle}>A Journey Through the Realms of Mathematics</Text>
          </View>

          {/* Setup card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Begin Your Quest</Text>
            <Text style={styles.cardBody}>
              To unlock the AI Tutor, a parent needs to paste an{' '}
              <Text style={styles.accent}>Anthropic API key</Text> below.
              It is stored safely on this iPad and never shared.
            </Text>

            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, error ? styles.inputError : null]}
                value={key}
                onChangeText={v => { setKey(v); setError(''); }}
                placeholder="sk-ant-api03-..."
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry={!showKey}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
              <TouchableOpacity
                onPress={() => setShowKey(v => !v)}
                style={styles.eyeBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.eyeText}>{showKey ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={loading || !key.trim()}
              activeOpacity={0.8}
            >
              <Text style={styles.submitText}>
                {loading ? 'Setting up...' : '✦ Enter the Realm ✦'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.helpText}>
              Get your free API key at console.anthropic.com
            </Text>
          </View>

          {/* Feature hints */}
          <View style={styles.features}>
            {[
              ['🗺', '9 mathematical realms to explore'],
              ['🔓', 'Topics unlock as you master prerequisites'],
              ['🤖', 'AI tutor explains any concept on demand'],
              ['⭐', 'Track progress from Counting to Calculus'],
            ].map(([icon, text]) => (
              <View key={text} style={styles.featureRow}>
                <Text style={styles.featureIcon}>{icon}</Text>
                <Text style={styles.featureText}>{text}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  kav: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 32,
  },
  headerBlock: { alignItems: 'center' },
  title: {
    fontFamily: FONTS.cinzelBold,
    fontSize: SIZES.hero,
    color: COLORS.goldLight,
    textAlign: 'center',
    lineHeight: 52,
    letterSpacing: 2,
  },
  subtitle: {
    fontFamily: FONTS.cinzel,
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    letterSpacing: 2,
    marginTop: 10,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#0f0e17',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 32,
    gap: 16,
  },
  cardTitle: {
    fontFamily: FONTS.cinzelSemibold,
    fontSize: SIZES.xl,
    color: COLORS.textPrimary,
    letterSpacing: 1,
  },
  cardBody: {
    fontFamily: FONTS.inter,
    fontSize: SIZES.base,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  accent: { color: COLORS.gold, fontFamily: FONTS.interSemibold },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgInput,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    fontFamily: FONTS.inter,
    fontSize: SIZES.base,
    color: COLORS.textPrimary,
    paddingVertical: 14,
  },
  inputError: { borderColor: '#e86b7f' },
  eyeBtn: { paddingLeft: 8 },
  eyeText: { fontSize: SIZES.md },
  errorText: {
    fontFamily: FONTS.inter,
    fontSize: SIZES.sm,
    color: '#e86b7f',
    lineHeight: 20,
  },
  submitBtn: {
    backgroundColor: COLORS.gold,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnDisabled: { opacity: 0.45 },
  submitText: {
    fontFamily: FONTS.cinzelBold,
    fontSize: SIZES.base,
    color: '#0a0a14',
    letterSpacing: 2,
  },
  helpText: {
    fontFamily: FONTS.inter,
    fontSize: SIZES.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  features: { width: '100%', maxWidth: 480, gap: 12 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureIcon: { fontSize: SIZES.lg, width: 30 },
  featureText: {
    fontFamily: FONTS.inter,
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
});
