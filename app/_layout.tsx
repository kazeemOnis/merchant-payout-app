import { Ionicons } from '@expo/vector-icons';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { SettingsModal } from '@/components/ui/settings-modal';
import { SettingsProvider, useSettings } from '@/contexts/settings-context';
import { useThemePalette } from '@/hooks/use-theme-palette';

import { useMSW } from '../mocks/useMSW';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='index' />
      <Stack.Screen name='sign-in' />
      <Stack.Screen name='(tabs)' />
      <Stack.Screen name='modal' options={{ presentation: 'modal' }} />
    </Stack>
  );
}

function SettingsButton({ onPress }: { onPress: () => void }) {
  const insets = useSafeAreaInsets();
  const palette = useThemePalette();

  return (
    <View style={[styles.settingsButtonContainer, { top: insets.top + 12 }]}>
      <Pressable
        onPress={onPress}
        hitSlop={12}
        style={[styles.settingsButton, { backgroundColor: palette.surface }]}
        testID='settings-button'
      >
        <Ionicons name='settings-outline' size={20} color={palette.textMuted} />
      </Pressable>
    </View>
  );
}

function AppShell() {
  const { theme } = useSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <ThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
      <RootNavigator />
      <SettingsButton onPress={() => setSettingsOpen(true)} />
      <SettingsModal
        visible={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const isMSWReady = useMSW();

  const [fontsLoaded] = useFonts({
    Inter: require('@/assets/fonts/Inter.ttf'),
    'Inter-Italic': require('@/assets/fonts/Inter-Italic.ttf'),
    'IBMPlexMono-Regular': require('@/assets/fonts/IBMPlexMono-Regular.ttf'),
    'IBMPlexMono-Light': require('@/assets/fonts/IBMPlexMono-Light.ttf'),
    'IBMPlexMono-Medium': require('@/assets/fonts/IBMPlexMono-Medium.ttf'),
    'IBMPlexMono-SemiBold': require('@/assets/fonts/IBMPlexMono-SemiBold.ttf'),
    'IBMPlexMono-Bold': require('@/assets/fonts/IBMPlexMono-Bold.ttf'),
  });

  const isReady = fontsLoaded && isMSWReady;

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SettingsProvider>
        <AppShell />
      </SettingsProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  settingsButtonContainer: {
    position: 'absolute',
    right: 16,
    zIndex: 100,
  },
  settingsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
