import { render, screen } from '@testing-library/react-native';
import React from 'react';

import { NotificationsSection } from '@/components/account/notifications-section';

jest.mock('@/hooks/use-translation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

jest.mock('@/store/account-store', () => ({
  useAccountStore: () => ({
    notifPayoutSuccess: true,
    notifPayoutFailure: false,
    setNotifPayoutSuccess: jest.fn(),
    setNotifPayoutFailure: jest.fn(),
  }),
}));

// permission denied for this suite
jest.mock('@/store/onboarding-store', () => ({
  useOnboardingStore: () => ({ notificationPermission: 'denied' }),
}));

jest.mock('@/hooks/use-theme-palette', () => ({
  useThemePalette: () => ({
    surface: '#111',
    white: '#fff',
    textMuted: '#888',
    surfaceElevated: '#222',
  }),
}));

describe('NotificationsSection (permission denied)', () => {
  it('shows account.notifications.disabledBanner text when permission is denied', () => {
    render(<NotificationsSection />);
    expect(
      screen.getByText('account.notifications.disabledBanner'),
    ).toBeTruthy();
  });

  it('shows account.notifications.openSettings link when denied', () => {
    render(<NotificationsSection />);
    expect(screen.getByText('account.notifications.openSettings')).toBeTruthy();
  });
});
