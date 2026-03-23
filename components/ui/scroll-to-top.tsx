import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemePalette } from '@/hooks/use-theme-palette';

type Props = {
  visible: boolean;
  onPress: () => void;
  /** Extra distance above the safe-area bottom inset. Default 16. */
  bottomOffset?: number;
  testID?: string;
};

/** Floating control to jump a FlatList to the top — pair with `useScrollToTop`. */
export function ScrollToTop({
  visible,
  onPress,
  bottomOffset = 16,
  testID = 'scroll-to-top',
}: Props) {
  const palette = useThemePalette();
  const insets = useSafeAreaInsets();

  const animStyle = useAnimatedStyle(() => ({
    opacity: withTiming(visible ? 1 : 0, { duration: 200 }),
  }));

  return (
    <Animated.View
      style={[
        styles.button,
        {
          bottom: insets.bottom + bottomOffset,
          backgroundColor: palette.surface,
        },
        animStyle,
      ]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <Pressable
        onPress={onPress}
        hitSlop={8}
        testID={testID}
        accessibilityRole='button'
        accessibilityLabel='Scroll to top'
      >
        <Ionicons name='chevron-up' size={20} color={palette.white} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
});
