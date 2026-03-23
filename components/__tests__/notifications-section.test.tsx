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

jest.mock('@/store/onboarding-store', () => ({
  useOnboardingStore: () => ({ notificationPermission: 'granted' }),
}));

jest.mock('@/hooks/use-theme-palette', () => ({
  useThemePalette: () => ({
    surface: '#111',
    white: '#fff',
    textMuted: '#888',
    surfaceElevated: '#222',
  }),
}));

describe('NotificationsSection (permission granted)', () => {
  it('shows account.notifications.payoutSuccess label when permission granted', () => {
    render(<NotificationsSection />);
    expect(
      screen.getByText('account.notifications.payoutSuccess'),
    ).toBeTruthy();
  });

  it('shows account.notifications.payoutFailure label when permission granted', () => {
    render(<NotificationsSection />);
    expect(
      screen.getByText('account.notifications.payoutFailure'),
    ).toBeTruthy();
  });
});
