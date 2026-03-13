import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Cinzel_400Regular,
  Cinzel_600SemiBold,
  Cinzel_700Bold,
} from '@expo-google-fonts/cinzel';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import { useAuthStore } from '@/store/authStore';
import { useProgressStore } from '@/store/progressStore';
import { CeremonyOverlay } from '@/components/CeremonyOverlay';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Cinzel_400Regular,
    Cinzel_600SemiBold,
    Cinzel_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const hydrateAuth = useAuthStore(s => s.hydrate);
  const hydrateProgress = useProgressStore(s => s.hydrate);
  const authHydrated = useAuthStore(s => s.isHydrated);
  const progressHydrated = useProgressStore(s => s.isHydrated);

  useEffect(() => {
    Promise.all([hydrateAuth(), hydrateProgress()]).catch(() => {});
  }, [hydrateAuth, hydrateProgress]);

  useEffect(() => {
    if (fontsLoaded && authHydrated && progressHydrated) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, authHydrated, progressHydrated]);

  if (!fontsLoaded || !authHydrated || !progressHydrated) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0a0a14' }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0a0a14' } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="realms" />
          <Stack.Screen name="realm/[id]" />
          <Stack.Screen
            name="topic/[id]"
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
        </Stack>
        <CeremonyOverlay />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
