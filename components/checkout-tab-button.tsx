import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import { useNavigationState } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Platform, StyleSheet, View } from 'react-native';

import { resolveTabBarScheme, tabBarByScheme } from '@/constants/tab-bar';
import { useColorScheme } from '@/hooks/use-color-scheme';

const INDICATOR_HEIGHT = 3;

type Props = BottomTabBarButtonProps & {
  routeName: string;
};

/**
 * Custom tab button: full-width top blue bar for the active tab + haptics.
 * No selection overlay — the tab row sits above the home-indicator inset; filling
 * that gap would fight the safe area, so active state is border + tint only.
 */
export function CheckoutTabButton({
  routeName,
  children,
  style,
  ...pressableProps
}: Props) {
  const focused = useNavigationState(
    state => state.routes[state.index]?.name === routeName,
  );
  const scheme = resolveTabBarScheme(useColorScheme());
  const indicatorColor = tabBarByScheme[scheme].activeIndicator;

  return (
    <PlatformPressable
      {...pressableProps}
      accessibilityState={focused ? { selected: true } : { selected: false }}
      style={[styles.pressable, style, styles.pressableOverrides]}
      onPressIn={e => {
        if (Platform.OS === 'ios') {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        pressableProps.onPressIn?.(e);
      }}
    >
      <View style={styles.column}>
        <View
          style={[
            styles.indicator,
            focused && { backgroundColor: indicatorColor },
          ]}
        />
        <View style={styles.content}>{children}</View>
      </View>
    </PlatformPressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
  },
  /** Applied after RN tab styles so we win over alignItems:center, padding:5, borderRadius. */
  pressableOverrides: {
    backgroundColor: 'transparent',
    alignItems: 'stretch',
    alignSelf: 'stretch',
    borderRadius: 0,
    padding: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  column: {
    flex: 1,
    width: '100%',
    flexDirection: 'column',
    alignItems: 'stretch',
    alignSelf: 'stretch',
    minHeight: 0,
  },
  indicator: {
    height: INDICATOR_HEIGHT,
    alignSelf: 'stretch',
    backgroundColor: 'transparent',
  },
  content: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 0,
  },
});
