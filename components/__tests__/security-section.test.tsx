import { render, screen } from '@testing-library/react-native';
import React from 'react';

import { SecuritySection } from '@/components/account/security-section';

jest.mock('@/components/ui/toast', () => ({
  Toast: () => null,
}));

jest.mock('@/hooks/use-translation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

jest.mock('@/hooks/use-theme-palette', () => ({
  useThemePalette: () => ({
    surface: '#111',
    white: '#fff',
    textMuted: '#888',
    surfaceElevated: '#222',
  }),
}));

// Default: biometricEnabled = false
jest.mock('@/store/account-store', () => ({
  useAccountStore: () => ({
    biometricEnabled: false,
    biometricThresholdGBP: 1000,
    setBiometricEnabled: jest.fn(),
    setBiometricThresholdGBP: jest.fn(),
  }),
}));

describe('SecuritySection (biometricEnabled=false)', () => {
  it('shows account.security.biometricEnabled label', () => {
    render(<SecuritySection />);
    expect(screen.getByText('account.security.biometricEnabled')).toBeTruthy();
  });

  it('does NOT show threshold input when biometricEnabled=false', () => {
    render(<SecuritySection />);
    expect(
      screen.queryByText('account.security.biometricThreshold'),
    ).toBeNull();
  });
});
