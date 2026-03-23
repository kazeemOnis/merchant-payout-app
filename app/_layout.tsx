import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useBootstrap } from '@/hooks/use-bootstrap';
import { queryClient } from '@/services/api';
import { useSettingsStore } from '@/store/settings-store';
import { mmkvStorage } from '@/utils/storage';

import { useMSW } from '../mocks/useMSW';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: false,
    shouldShowList: false,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='index' />
      <Stack.Screen name='onboarding' />
      <Stack.Screen name='sign-in' />
      <Stack.Screen name='(tabs)' />
      <Stack.Screen name='modal' options={{ presentation: 'modal' }} />
    </Stack>
  );
}

function AppShell() {
  const theme = useSettingsStore(s => s.theme);
  const router = useRouter();

  useEffect(() => {
    // Read notification permission on boot and persist to MMKV
    Notifications.getPermissionsAsync().then(({ status }) => {
      mmkvStorage.setItem('notification_permission', status);
    });

    const receivedSub = Notifications.addNotificationReceivedListener(
      notification => {
        if (__DEV__) {
          console.log('[Notifications] received', notification);
        }
      },
    );

    const responseSub = Notifications.addNotificationResponseReceivedListener(
      response => {
        const screen: string =
          (response.notification.request.content.data as { screen?: string })
            ?.screen ?? '/(tabs)';
        router.push(screen as Parameters<typeof router.push>[0]);
      },
    );

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, [router]);

  return (
    <ThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
      <RootNavigator />
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

  const isAuthChecked = useBootstrap(fontsLoaded, isMSWReady);
  const isReady = fontsLoaded && isMSWReady && isAuthChecked;

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
      <QueryClientProvider client={queryClient}>
        <AppShell />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
