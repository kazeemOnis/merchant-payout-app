import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import { MenuNavRow } from '@/components/account/menu-nav-row';

jest.mock('@/hooks/use-translation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

jest.mock('@/hooks/use-theme-palette', () => ({
  useThemePalette: () => ({
    white: '#fff',
    textMuted: '#888',
    surfaceElevated: '#222',
  }),
}));

describe('MenuNavRow', () => {
  it('shows title text', () => {
    render(<MenuNavRow title='Security' onPress={jest.fn()} />);
    expect(screen.getByText('Security')).toBeTruthy();
  });

  it('shows subtitle when provided', () => {
    render(
      <MenuNavRow title='Security' subtitle='Manage 2FA' onPress={jest.fn()} />,
    );
    expect(screen.getByText('Manage 2FA')).toBeTruthy();
  });

  it('does not show subtitle when not provided', () => {
    render(<MenuNavRow title='Security' onPress={jest.fn()} />);
    expect(screen.queryByText('Manage 2FA')).toBeNull();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    render(<MenuNavRow title='Security' onPress={onPress} testID='nav-row' />);
    fireEvent.press(screen.getByTestId('nav-row'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('has testID when provided', () => {
    render(
      <MenuNavRow title='Security' onPress={jest.fn()} testID='security-row' />,
    );
    expect(screen.getByTestId('security-row')).toBeTruthy();
  });
});
