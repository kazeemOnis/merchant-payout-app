import { Palette } from '@/constants/theme';

export type TabBarScheme = 'light' | 'dark';

/** Tokens per app theme (from settings Appearance — see `useColorScheme`). */
export const tabBarByScheme = {
  dark: {
    background: '#1A1D21',
    inactive: '#8E9196',
    activeIndicator: Palette.brandBlue,
    cornerRadius: 20,
  },
  light: {
    background: '#FFFFFF',
    inactive: '#6c6c70',
    activeIndicator: Palette.brandBlue,
    cornerRadius: 20,
  },
} as const;

export type TabBarTokens = (typeof tabBarByScheme)[TabBarScheme];

export function resolveTabBarScheme(
  theme: TabBarScheme | undefined | null,
): TabBarScheme {
  return theme === 'dark' ? 'dark' : 'light';
}
