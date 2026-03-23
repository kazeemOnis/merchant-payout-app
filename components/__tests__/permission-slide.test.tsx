import { act, fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import { PermissionSlide } from '@/components/onboarding/permission-slide';

jest.mock('@/hooks/use-translation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
}));

jest.mock('expo-tracking-transparency', () => ({
  requestTrackingPermissionsAsync: jest
    .fn()
    .mockResolvedValue({ status: 'granted' }),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children, ...props }: any) => {
    const { View } = require('react-native');
    return require('react').createElement(View, props, children);
  },
}));

jest.mock('@/store/onboarding-store', () => ({
  useOnboardingStore: () => ({
    setAttStatus: jest.fn(),
    setNotificationPermission: jest.fn(),
  }),
}));

jest.mock('@/hooks/use-theme-palette', () => ({
  useThemePalette: () => ({
    bgDark: '#000',
    surface: '#111',
    white: '#fff',
    textMuted: '#888',
  }),
}));

describe('PermissionSlide (kind=att)', () => {
  it('shows onboarding.att.allow button', () => {
    render(<PermissionSlide kind='att' onComplete={jest.fn()} />);
    expect(screen.getByText('onboarding.att.allow')).toBeTruthy();
  });

  it('shows onboarding.notNow skip button', () => {
    render(<PermissionSlide kind='att' onComplete={jest.fn()} />);
    expect(screen.getByText('onboarding.notNow')).toBeTruthy();
  });

  it('calls onComplete when allow is pressed', async () => {
    const onComplete = jest.fn();
    render(<PermissionSlide kind='att' onComplete={onComplete} />);
    await act(async () => {
      fireEvent.press(screen.getByText('onboarding.att.allow'));
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('calls onComplete when skip is pressed', () => {
    const onComplete = jest.fn();
    render(<PermissionSlide kind='att' onComplete={onComplete} />);
    fireEvent.press(screen.getByText('onboarding.notNow'));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});

describe('PermissionSlide (kind=notifications)', () => {
  it('shows onboarding.notifications.allow button when kind=notifications', () => {
    render(<PermissionSlide kind='notifications' onComplete={jest.fn()} />);
    expect(screen.getByText('onboarding.notifications.allow')).toBeTruthy();
  });
});
