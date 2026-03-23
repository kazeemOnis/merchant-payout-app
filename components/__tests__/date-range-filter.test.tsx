import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import { DateRangeFilter } from '@/components/analytics/date-range-filter';

jest.mock('@/hooks/use-translation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

jest.mock('@/hooks/use-theme-palette', () => ({
  useThemePalette: () => ({
    surface: '#111',
    textMuted: '#888',
  }),
}));

describe('DateRangeFilter', () => {
  it('renders all 5 range pills', () => {
    render(<DateRangeFilter value='7d' onChange={jest.fn()} />);
    expect(screen.getByTestId('date-range-24h')).toBeTruthy();
    expect(screen.getByTestId('date-range-7d')).toBeTruthy();
    expect(screen.getByTestId('date-range-30d')).toBeTruthy();
    expect(screen.getByTestId('date-range-90d')).toBeTruthy();
    expect(screen.getByTestId('date-range-1y')).toBeTruthy();
  });

  it('calls onChange with the correct range when a pill is pressed', () => {
    const onChange = jest.fn();
    render(<DateRangeFilter value='7d' onChange={onChange} />);
    fireEvent.press(screen.getByTestId('date-range-30d'));
    expect(onChange).toHaveBeenCalledWith('30d');
  });

  it('calls onChange with 24h when 24h pill is pressed', () => {
    const onChange = jest.fn();
    render(<DateRangeFilter value='7d' onChange={onChange} />);
    fireEvent.press(screen.getByTestId('date-range-24h'));
    expect(onChange).toHaveBeenCalledWith('24h');
  });

  it('renders all range pill testIDs (active range pill is present)', () => {
    render(<DateRangeFilter value='24h' onChange={jest.fn()} />);
    // Active pill still has the testID
    expect(screen.getByTestId('date-range-24h')).toBeTruthy();
  });
});
