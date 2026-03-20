import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
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

export type ToastVariant = 'success' | 'error' | 'info';

interface Props {
  message: string;
  variant?: ToastVariant;
  visible: boolean;
  onDismiss: () => void;
  dismissAfterMs?: number;
}

const ACCENT: Record<ToastVariant, string> = {
  success: Palette.accentGreen,
  error: Palette.accentRed,
  info: Palette.ctaBlue,
};

const ICON: Record<
  ToastVariant,
  React.ComponentProps<typeof Ionicons>['name']
> = {
  success: 'checkmark-circle-outline',
  error: 'close-circle-outline',
  info: 'information-circle-outline',
};

const SPRING = { damping: 20, stiffness: 140 };

export function Toast({
  message,
  variant = 'info',
  visible,
  onDismiss,
  dismissAfterMs = 3500,
}: Props) {
  const palette = useThemePalette();
  const insets = useSafeAreaInsets();

  const translateY = useSharedValue(-120);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, SPRING);
      opacity.value = withTiming(1, { duration: 180 });
      const timer = setTimeout(onDismiss, dismissAfterMs);
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

  const accentColor = ACCENT[variant];

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { top: insets.top + 12, backgroundColor: palette.surface },
        animStyle,
      ]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <View style={styles.inner}>
        <View style={[styles.accent, { backgroundColor: accentColor }]} />
        <Ionicons
          name={ICON[variant]}
          size={18}
          color={accentColor}
          style={styles.icon}
        />
        <ThemedText
          variant='bodySmall'
          color={palette.white}
          style={styles.text}
        >
          {message}
        </ThemedText>
      </View>
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
  },
  icon: {
    marginLeft: 8,
  },
  text: {
    flex: 1,
    lineHeight: 20,
  },
});
