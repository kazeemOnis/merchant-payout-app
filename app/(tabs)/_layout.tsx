import { Redirect, Tabs } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CheckoutTabButton } from '@/components/checkout-tab-button';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { resolveTabBarScheme, tabBarByScheme } from '@/constants/tab-bar';
import { Palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTranslation } from '@/hooks/use-translation';
import { useAuthStore } from '@/store/auth-store';

type TabScreenConfig = {
  name: 'index' | 'payouts' | 'analytics' | 'account';
  titleKey: 'tabs.home' | 'tabs.payouts' | 'tabs.analytics' | 'tabs.account';
  icon: IconSymbolName;
};

const TAB_SCREENS: readonly TabScreenConfig[] = [
  { name: 'index', titleKey: 'tabs.home', icon: 'house.fill' },
  { name: 'payouts', titleKey: 'tabs.payouts', icon: 'creditcard.fill' },
  { name: 'analytics', titleKey: 'tabs.analytics', icon: 'chart.bar.fill' },
  { name: 'account', titleKey: 'tabs.account', icon: 'person.fill' },
];

export default function TabLayout() {
  const { isAuthenticated } = useAuthStore();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const scheme = resolveTabBarScheme(useColorScheme());
  const tab = tabBarByScheme[scheme];

  if (!isAuthenticated) {
    return <Redirect href='/' />;
  }

  const bottomPad = Math.max(insets.bottom, Platform.OS === 'ios' ? 8 : 6);

  const tabBarLightStyle =
    scheme === 'light'
      ? {
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: 'rgba(60, 60, 67, 0.29)',
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -1 },
              shadowOpacity: 0.06,
              shadowRadius: 4,
            },
            android: { elevation: 6 },
            default: {},
          }),
        }
      : {
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          shadowRadius: 0,
          shadowOffset: { width: 0, height: 0 },
        };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        /** Matches Settings → Appearance (light: white bar + separator; dark: charcoal bar). */
        tabBarActiveTintColor: Palette.brandBlue,
        tabBarInactiveTintColor: tab.inactive,
        tabBarStyle: {
          backgroundColor: tab.background,
          paddingTop: 0,
          paddingBottom: bottomPad,
          paddingHorizontal: 0,
          minHeight: 56 + bottomPad,
          borderBottomLeftRadius: tab.cornerRadius,
          borderBottomRightRadius: tab.cornerRadius,
          overflow: 'hidden',
          ...tabBarLightStyle,
        },
        tabBarLabelStyle: {
          marginTop: 2,
          fontSize: 11,
          fontWeight: '500',
          letterSpacing: 0.2,
        },
        /** Full width per tab so the active indicator + overlay span the column. */
        tabBarItemStyle: {
          paddingHorizontal: 0,
        },
      }}
    >
      {TAB_SCREENS.map(({ name, titleKey, icon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title: t(titleKey),
            /** Maestro E2E: tap by id (`tab-payouts`) — label text alone is unreliable. */
            tabBarButtonTestID: `tab-${name}`,
            tabBarIcon: ({ color }) => (
              <IconSymbol size={24} name={icon} color={color} />
            ),
            tabBarButton: props => (
              <CheckoutTabButton {...props} routeName={name} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
