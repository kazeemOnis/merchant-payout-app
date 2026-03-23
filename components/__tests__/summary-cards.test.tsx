import { render, screen } from '@testing-library/react-native';
import React from 'react';

import { SummaryCards } from '@/components/analytics/summary-cards';
import type { SummaryCard } from '@/hooks/use-analytics-data';

jest.mock('@/hooks/use-translation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

const cards: SummaryCard[] = [
  {
    id: 'revenue',
    labelKey: 'analytics.revenue',
    value: '£12k',
    delta: '+18.2%',
    positive: true,
    iconName: 'cash-outline',
    iconColor: '#186aff',
  },
  {
    id: 'transactions',
    labelKey: 'analytics.transactions',
    value: '240',
    delta: '+12.5%',
    positive: true,
    iconName: 'card-outline',
    iconColor: '#7c3aed',
  },
];

describe('SummaryCards', () => {
  it('shows placeholder cards when loading', () => {
    render(<SummaryCards cards={[]} loading={true} />);
    // CARD_PLACEHOLDERS has 4 static entries — all render even while loading
    expect(screen.getByTestId('summary-card-revenue')).toBeTruthy();
    expect(screen.getByTestId('summary-card-transactions')).toBeTruthy();
  });

  it('renders a card for each item when loaded', () => {
    render(<SummaryCards cards={cards} loading={false} />);
    expect(screen.getByTestId('summary-card-revenue')).toBeTruthy();
    expect(screen.getByTestId('summary-card-transactions')).toBeTruthy();
  });

  it('shows card values when not loading', () => {
    render(<SummaryCards cards={cards} loading={false} />);
    expect(screen.getByText('£12k')).toBeTruthy();
    expect(screen.getByText('240')).toBeTruthy();
  });

  it('shows delta values', () => {
    render(<SummaryCards cards={cards} loading={false} />);
    expect(screen.getByText('+18.2%')).toBeTruthy();
  });
});
