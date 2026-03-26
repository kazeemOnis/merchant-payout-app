import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { useThemePalette } from '@/hooks/use-theme-palette';
import { useAuthStore } from '@/store/auth-store';
import { useChatStore } from '@/store/chat-store';

function Dot({ delayMs }: { delayMs: number }) {
  const palette = useThemePalette();
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delayMs,
      withRepeat(
        withSequence(
          withTiming(-4, { duration: 300 }),
          withTiming(0, { duration: 300 }),
        ),
        -1,
        false,
      ),
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[styles.dot, { backgroundColor: palette.textMuted }, animStyle]}
    />
  );
}

export function TypingIndicator() {
  const palette = useThemePalette();
  const { merchant } = useAuthStore();
  const typingUsers = useChatStore(s => s.typingUsers);

  // Filter out the current user from the typing display
  const names = Object.entries(typingUsers)
    .filter(([id]) => id !== merchant?.accountId)
    .map(([, name]) => name);

  if (names.length === 0) return null;

  const label =
    names.length === 1
      ? `${names[0]} is typing`
      : `${names[0]} and ${names[1]} are typing`;

  return (
    <View style={styles.container}>
      <View style={[styles.bubble, { backgroundColor: palette.surface }]}>
        <Dot delayMs={0} />
        <Dot delayMs={150} />
        <Dot delayMs={300} />
      </View>
      <ThemedText variant='caption' color={palette.textMuted} style={styles.label}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 8,
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 16,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    flexShrink: 1,
  },
});
