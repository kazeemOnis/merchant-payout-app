import { render, screen } from '@testing-library/react-native';
import React from 'react';

import { RevenueChart } from '@/components/analytics/revenue-chart';

jest.mock('@/hooks/use-translation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

/** Avoid async font load in Icon — prevents act() warnings in tests */
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Ionicons: () => React.createElement(View, { testID: 'ionicons-mock' }),
  };
});

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

jest.mock('react-native-gifted-charts', () => ({ LineChart: () => null }));

jest.mock('@/utils/gifted-charts', () => ({
  shallowCloneChartData: (d: unknown) => d,
}));

jest.mock('@/hooks/use-theme-palette', () => ({
  useThemePalette: () => ({
    surface: '#111',
    white: '#fff',
    textMuted: '#888',
    surfaceElevated: '#222',
  }),
}));

jest.mock('@/components/ui/skeleton', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Skeleton: () =>
      React.createElement(View, { testID: 'revenue-chart-skeleton' }),
  };
});

const trendData = [
  { label: 'Mon', value: 5000 },
  { label: 'Tue', value: 8000 },
];

describe('RevenueChart', () => {
  it('shows analytics.revenueTrend title', () => {
    render(<RevenueChart data={trendData} range='7d' loading={false} />);
    expect(screen.getByText('analytics.revenueTrend')).toBeTruthy();
  });

  it('shows skeleton when loading=true', () => {
    render(<RevenueChart data={trendData} range='7d' loading={true} />);
    expect(screen.getByTestId('revenue-chart-skeleton')).toBeTruthy();
  });

  it('does NOT show skeleton when loading=false', () => {
    render(<RevenueChart data={trendData} range='7d' loading={false} />);
    expect(screen.queryByTestId('revenue-chart-skeleton')).toBeNull();
  });
});
