import LottieView from 'lottie-react-native';
import { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Highlight, ThemedText } from '@/components/themed-text';
import { type OnboardingSlide as OnboardingSlideType } from '@/constants/onboarding';
import { useThemePalette } from '@/hooks/use-theme-palette';
import { useTranslation } from '@/hooks/use-translation';

import { useOnboardingStyles } from './styles';

type OnboardingSlideProps = {
  slide: OnboardingSlideType;
  index: number;
};

const SPRING_CONFIG = { damping: 18, stiffness: 120 };

export function OnboardingSlide({ slide }: OnboardingSlideProps) {
  const { t } = useTranslation();
  const palette = useThemePalette();
  const { slide: styles } = useOnboardingStyles();

  const titlePre = t(slide.titlePreKey);
  const titleHighlight = t(slide.titleHighlightKey);
  const titlePost = t(slide.titlePostKey);
  const subtitle = t(slide.subtitleKey);

  // Text slides down from above; Lottie slides up from below
  const textTranslateY = useSharedValue(-40);
  const lottieTranslateY = useSharedValue(60);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 250 });
    textTranslateY.value = withSpring(0, SPRING_CONFIG);
    lottieTranslateY.value = withSpring(0, SPRING_CONFIG);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const textAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: textTranslateY.value }],
    opacity: opacity.value,
  }));

  const lottieAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: lottieTranslateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={styles.container}>
      <Animated.View style={[styles.textContent, textAnimatedStyle]}>
        <ThemedText variant='h1' color={palette.white} style={styles.title}>
          {titlePre} <Highlight variant='h1'>{titleHighlight}</Highlight>
          {titlePost ? ` ${titlePost}` : ''}
        </ThemedText>

        <ThemedText
          variant='body'
          color={palette.textMuted}
          style={styles.subtitle}
        >
          {subtitle}
        </ThemedText>
      </Animated.View>

      <Animated.View style={[styles.animationContainer, lottieAnimatedStyle]}>
        <LottieView
          source={slide.animation as string}
          autoPlay
          loop
          style={styles.animation}
          resizeMode='contain'
        />
      </Animated.View>
    </Animated.View>
  );
}
