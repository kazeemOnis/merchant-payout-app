import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Palette } from '@/constants/theme';
import { useThemePalette } from '@/hooks/use-theme-palette';
import { useTranslation } from '@/hooks/use-translation';

const AUTO_DISMISS_MS = 4000;
const SPRING = { damping: 20, stiffness: 140 };

interface Props {
  visible: boolean;
  onDismiss: () => void;
}

export function ScreenshotToast({ visible, onDismiss }: Props) {
  const { t } = useTranslation();
  const palette = useThemePalette();
  const insets = useSafeAreaInsets();

  const translateY = useSharedValue(-120);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, SPRING);
      opacity.value = withTiming(1, { duration: 180 });
      const timer = setTimeout(onDismiss, AUTO_DISMISS_MS);
      return () => clearTimeout(timer);
    } else {
      translateY.value = withTiming(-120, { duration: 220 });
      opacity.value = withTiming(0, { duration: 180 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { top: insets.top + 12, backgroundColor: palette.surface },
        animStyle,
      ]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <Pressable onPress={onDismiss} style={styles.inner}>
        {/* Left accent bar */}
        <View style={styles.accent} />

        {/* Icon */}
        <Ionicons
          name='eye-off-outline'
          size={18}
          color={Palette.accentOrange}
          style={styles.icon}
        />

        {/* Message */}
        <ThemedText
          variant='bodySmall'
          color={palette.white}
          style={styles.text}
        >
          {t('payouts.screenshotWarning')}
        </ThemedText>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 12,
    overflow: 'hidden',
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 10,
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: Palette.accentOrange,
  },
  icon: {
    marginLeft: 8, // clear the accent bar
  },
  text: {
    flex: 1,
    lineHeight: 20,
  },
});
