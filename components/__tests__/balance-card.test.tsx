import { render, screen } from '@testing-library/react-native';
import React from 'react';

import {
  BalanceCard,
  BalanceCards,
  BalanceCardsSkeleton,
} from '@/components/home/balance-card';

jest.mock('@/hooks/use-translation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

describe('BalanceCard', () => {
  it('renders the label', () => {
    render(
      <BalanceCard
        label='Available'
        amount={500000}
        currency='GBP'
        variant='available'
      />,
    );
    expect(screen.getByText('Available')).toBeTruthy();
  });

  it('renders the formatted amount', () => {
    render(
      <BalanceCard
        label='Available'
        amount={500000}
        currency='GBP'
        variant='available'
        testID='card'
      />,
    );
    expect(screen.getByTestId('card-amount')).toBeTruthy();
    expect(screen.getByText('£5,000.00')).toBeTruthy();
  });

  it('renders pending variant', () => {
    render(
      <BalanceCard
        label='Pending'
        amount={25000}
        currency='GBP'
        variant='pending'
        testID='card'
      />,
    );
    expect(screen.getByText('£250.00')).toBeTruthy();
  });

  it('renders EUR amounts', () => {
    render(
      <BalanceCard
        label='Available'
        amount={100050}
        currency='EUR'
        variant='available'
      />,
    );
    // Should contain the numeric value regardless of locale symbol differences
    expect(screen.getByText(/1,000\.50/)).toBeTruthy();
  });
});

describe('BalanceCardsSkeleton', () => {
  it('renders skeleton placeholder', () => {
    render(<BalanceCardsSkeleton testID='skeleton' />);
    expect(screen.getByTestId('skeleton')).toBeTruthy();
  });
});

describe('BalanceCards', () => {
  it('shows skeletons when loading', () => {
    render(
      <BalanceCards available={0} pending={0} currency='GBP' loading={true} />,
    );
    expect(screen.getByTestId('balance-skeleton')).toBeTruthy();
  });

  it('shows balance cards when not loading', () => {
    render(
      <BalanceCards
        available={500000}
        pending={25000}
        currency='GBP'
        loading={false}
      />,
    );
    expect(screen.getByTestId('balance-available')).toBeTruthy();
    expect(screen.getByTestId('balance-pending')).toBeTruthy();
    expect(screen.getByText('home.available')).toBeTruthy();
    expect(screen.getByText('home.pending')).toBeTruthy();
    expect(screen.getByText('£5,000.00')).toBeTruthy();
    expect(screen.getByText('£250.00')).toBeTruthy();
  });
});
