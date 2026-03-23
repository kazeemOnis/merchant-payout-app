import { Redirect, Stack } from 'expo-router';

import { useAuthStore } from '@/store/auth-store';

export default function OnboardingLayout() {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Redirect href='/(tabs)' />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
