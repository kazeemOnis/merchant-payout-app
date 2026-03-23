import { render, screen } from '@testing-library/react-native';
import React from 'react';

import { PaymentMethodsChart } from '@/components/analytics/payment-methods-chart';
import type { TypeBreakdownSlice } from '@/hooks/use-analytics-data';

jest.mock('@/hooks/use-translation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

jest.mock('react-native-gifted-charts', () => ({
  PieChart: () => null,
}));

jest.mock('@/utils/gifted-charts', () => ({
  shallowCloneChartData: (d: unknown) => d,
}));

const slices: TypeBreakdownSlice[] = [
  {
    type: 'deposit',
    labelKey: 'analytics.typeDeposit',
    count: 10,
    percent: 50,
    color: '#186aff',
  },
  {
    type: 'payout',
    labelKey: 'analytics.typePayout',
    count: 10,
    percent: 50,
    color: '#4098ff',
  },
];

describe('PaymentMethodsChart', () => {
  it('shows empty state when no data', () => {
    render(<PaymentMethodsChart data={[]} loading={false} />);
    expect(screen.getByText('analytics.emptyActivityMix')).toBeTruthy();
  });

  it('renders legend items for each slice', () => {
    render(<PaymentMethodsChart data={slices} loading={false} />);
    expect(screen.getByText('analytics.typeDeposit')).toBeTruthy();
    expect(screen.getByText('analytics.typePayout')).toBeTruthy();
  });

  it('renders percent values in legend', () => {
    render(<PaymentMethodsChart data={slices} loading={false} />);
    expect(screen.getAllByText('50%').length).toBe(2);
  });

  it('does not show legend while loading', () => {
    render(<PaymentMethodsChart data={slices} loading={true} />);
    expect(screen.queryByText('analytics.typeDeposit')).toBeNull();
  });
});
