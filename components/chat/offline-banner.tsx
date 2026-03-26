import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { useThemePalette } from '@/hooks/use-theme-palette';
import { useChatStore } from '@/store/chat-store';

export function OfflineBanner() {
  const palette = useThemePalette();
  const connectionStatus = useChatStore(s => s.connectionStatus);
  const height = useSharedValue(0);

  const isVisible = connectionStatus === 'connecting'
    || connectionStatus === 'reconnecting'
    || connectionStatus === 'disconnected';

  const isReconnecting = connectionStatus === 'connecting' || connectionStatus === 'reconnecting';

  useEffect(() => {
    height.value = withTiming(isVisible ? 36 : 0, { duration: 200 });
  }, [isVisible]);

  const animStyle = useAnimatedStyle(() => ({ height: height.value, overflow: 'hidden' }));

  const bgColor = isReconnecting ? palette.accentOrange : palette.accentRed;

  const label = isReconnecting
    ? 'Reconnecting…'
    : 'No connection — messages will be queued';

  return (
    <Animated.View style={[styles.banner, { backgroundColor: bgColor }, animStyle]}>
      <ThemedText variant='caption' color='#1b1c22' style={styles.text}>
        {label}
      </ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  text: {
    fontWeight: '600',
  },
});
