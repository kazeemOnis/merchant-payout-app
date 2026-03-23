import { useRouter } from 'expo-router';
import { Platform } from 'react-native';

import { PermissionSlide } from '@/components/onboarding/permission-slide';
import { useOnboardingStore } from '@/store/onboarding-store';

export default function NotificationsPermissionScreen() {
  const router = useRouter();
  const { attStatus } = useOnboardingStore();

  const handleComplete = () => {
    if (Platform.OS === 'ios' && attStatus === 'undetermined') {
      router.replace('/onboarding/att');
    } else {
      router.replace('/sign-in');
    }
  };

  return <PermissionSlide kind='notifications' onComplete={handleComplete} />;
}
