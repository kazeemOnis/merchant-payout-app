import { render, screen } from '@testing-library/react-native';
import React from 'react';

import { ProfileCard } from '@/components/account/profile-card';

jest.mock('@/hooks/use-translation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

const mockMerchant = {
  name: 'Checkout Merchant',
  email: 'merchant@checkout.com',
  accountId: 'MCH-00123',
};

jest.mock('@/store/auth-store', () => ({
  useAuthStore: () => ({ merchant: mockMerchant }),
}));

describe('ProfileCard', () => {
  it('renders merchant name', () => {
    render(<ProfileCard />);
    expect(screen.getByText('Checkout Merchant')).toBeTruthy();
  });

  it('renders account ID', () => {
    render(<ProfileCard />);
    expect(screen.getByText('ID: MCH-00123')).toBeTruthy();
  });

  it('renders business account label', () => {
    render(<ProfileCard />);
    expect(screen.getByText('account.businessAccount')).toBeTruthy();
  });

  it('renders nothing when merchant is null', () => {
    jest.resetModules();
    jest.doMock('@/store/auth-store', () => ({
      useAuthStore: () => ({ merchant: null }),
    }));
    jest.doMock('@/hooks/use-theme-palette', () => ({
      useThemePalette: () => ({
        bgDark: '#000',
        surface: '#111',
        white: '#fff',
        textMuted: '#888',
        surfaceElevated: '#222',
      }),
    }));
    jest.doMock('@/components/account/styles', () => ({
      useAccountStyles: () => ({
        profileCard: {
          card: {},
          avatarRow: {},
          avatar: {},
          info: {},
          label: {},
          accountId: {},
        },
      }),
    }));
    const { ProfileCard: Card } = require('@/components/account/profile-card');
    const { toJSON } = render(<Card />);
    expect(toJSON()).toBeNull();
  });
});
