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

// biometricEnabled = true for this suite
jest.mock('@/store/account-store', () => ({
  useAccountStore: () => ({
    biometricEnabled: true,
    biometricThresholdGBP: 1000,
    setBiometricEnabled: jest.fn(),
    setBiometricThresholdGBP: jest.fn(),
  }),
}));

describe('SecuritySection (biometricEnabled=true)', () => {
  it('shows threshold input when biometricEnabled=true', () => {
    render(<SecuritySection />);
    expect(
      screen.getByText('account.security.biometricThreshold'),
    ).toBeTruthy();
  });

  it('shows save button when biometricEnabled=true', () => {
    render(<SecuritySection />);
    expect(screen.getByText('common.save')).toBeTruthy();
  });
});
