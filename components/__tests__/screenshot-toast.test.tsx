import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import { ScreenshotToast } from '@/components/ui/screenshot-toast';

jest.mock('@/hooks/use-translation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@/hooks/use-theme-palette', () => ({
  useThemePalette: () => ({
    surface: '#111',
    white: '#fff',
    textMuted: '#888',
    surfaceElevated: '#222',
  }),
}));

describe('ScreenshotToast', () => {
  it('shows payouts.screenshotWarning text when visible=true', () => {
    render(<ScreenshotToast visible={true} onDismiss={jest.fn()} />);
    expect(screen.getByText('payouts.screenshotWarning')).toBeTruthy();
  });

  it('renders the component (text is in DOM) when visible=false', () => {
    // The component always renders its content; visibility is controlled by animation.
    render(<ScreenshotToast visible={false} onDismiss={jest.fn()} />);
    // The text is rendered but the animated view is positioned off-screen.
    expect(screen.getByText('payouts.screenshotWarning')).toBeTruthy();
  });

  it('calls onDismiss when pressed while visible', () => {
    const onDismiss = jest.fn();
    render(<ScreenshotToast visible={true} onDismiss={onDismiss} />);
    fireEvent.press(screen.getByText('payouts.screenshotWarning'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
