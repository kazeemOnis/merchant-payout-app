import { render, screen } from '@testing-library/react-native';
import React from 'react';

import { PreferencesSection } from '@/components/account/preferences-section';

jest.mock('@/hooks/use-translation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

jest.mock('@/store/account-store', () => ({
  useAccountStore: () => ({
    defaultCurrency: 'GBP',
    setDefaultCurrency: jest.fn(),
  }),
}));

jest.mock('@/store/settings-store', () => {
  const state = {
    theme: 'dark',
    setTheme: jest.fn(),
    locale: 'en',
    setLocale: jest.fn(),
  };
  return {
    useSettingsStore: (selector?: (s: typeof state) => unknown) =>
      selector ? selector(state) : state,
  };
});

jest.mock('@/hooks/use-theme-palette', () => ({
  useThemePalette: () => ({
    surface: '#111',
    white: '#fff',
    textMuted: '#888',
    surfaceElevated: '#222',
  }),
}));

jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: () => 'dark',
}));

describe('PreferencesSection', () => {
  it('renders account.preferences.defaultCurrency label', () => {
    render(<PreferencesSection />);
    expect(
      screen.getByText('account.preferences.defaultCurrency'),
    ).toBeTruthy();
  });

  it('renders account.preferences.theme label', () => {
    render(<PreferencesSection />);
    expect(screen.getByText('account.preferences.theme')).toBeTruthy();
  });

  it('renders account.preferences.language label', () => {
    render(<PreferencesSection />);
    expect(screen.getByText('account.preferences.language')).toBeTruthy();
  });

  it('shows theme-option-dark and theme-option-light segments', () => {
    render(<PreferencesSection />);
    expect(screen.getByTestId('theme-option-dark')).toBeTruthy();
    expect(screen.getByTestId('theme-option-light')).toBeTruthy();
  });

  it('shows locale-option-en and locale-option-fr segments', () => {
    render(<PreferencesSection />);
    expect(screen.getByTestId('locale-option-en')).toBeTruthy();
    expect(screen.getByTestId('locale-option-fr')).toBeTruthy();
  });
});
