import { Redirect, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingSlide } from '@/components/onboarding/onboarding-slide';
import { PaginationDots } from '@/components/onboarding/pagination-dots';
import { Button } from '@/components/ui/button';
import { SLIDES } from '@/constants/onboarding';
import { type ThemePalette, useThemePalette } from '@/hooks/use-theme-palette';
import { useTranslation } from '@/hooks/use-translation';
import { useAuthStore } from '@/store/auth-store';
import { useOnboardingStore } from '@/store/onboarding-store';

const SWIPE_THRESHOLD = 50;

export default function OnboardingScreen() {
  const { isAuthenticated } = useAuthStore();
  const { notificationPermission, attStatus } = useOnboardingStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();
  const { t } = useTranslation();
  const palette = useThemePalette();
  const styles = useMemo(() => makeStyles(palette), [palette]);

  if (isAuthenticated) {
    return <Redirect href='/(tabs)' />;
  }

  const isLastSlide = currentIndex === SLIDES.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      if (notificationPermission === 'undetermined') {
        router.push('/onboarding/notifications');
      } else if (Platform.OS === 'ios' && attStatus === 'undetermined') {
        router.push('/onboarding/att');
      } else {
        router.replace('/sign-in');
      }
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < SLIDES.length - 1) setCurrentIndex(prev => prev + 1);
  };

  const goToPrev = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  const swipeGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onEnd(event => {
      if (event.translationX < -SWIPE_THRESHOLD) runOnJS(goToNext)();
      else if (event.translationX > SWIPE_THRESHOLD) runOnJS(goToPrev)();
    });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <GestureDetector gesture={swipeGesture}>
        <View style={styles.slideArea}>
          <OnboardingSlide
            key={SLIDES[currentIndex].id}
            slide={SLIDES[currentIndex]}
            index={currentIndex}
          />
        </View>
      </GestureDetector>

      <View style={styles.footer}>
        <PaginationDots total={SLIDES.length} current={currentIndex} />
        <Button
          label={isLastSlide ? t('common.getStarted') : t('common.next')}
          onPress={handleNext}
        />
      </View>
    </SafeAreaView>
  );
}

function makeStyles(p: ThemePalette) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: p.bgDark },
    slideArea: { flex: 1 },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      paddingBottom: 16,
      paddingTop: 8,
    },
  });
}
