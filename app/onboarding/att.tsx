import { useRouter } from 'expo-router';

import { PermissionSlide } from '@/components/onboarding/permission-slide';

export default function AttPermissionScreen() {
  const router = useRouter();

  return (
    <PermissionSlide kind='att' onComplete={() => router.replace('/sign-in')} />
  );
}
