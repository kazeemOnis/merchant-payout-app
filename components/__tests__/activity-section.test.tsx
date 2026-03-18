import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import { ActivitySection } from '@/components/home/activity-section';
import { Palette } from '@/constants/theme';
import type { ActivityItem } from '@/types/api';

jest.mock('@/hooks/use-translation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

const mockItems: ActivityItem[] = [
  {
    id: 'act_001',
    type: 'deposit',
    amount: 150000,
    currency: 'GBP',
    date: '2026-03-16T10:00:00.000Z',
    description: 'Payment from Customer ABC',
    status: 'completed',
  },
  {
    id: 'act_002',
    type: 'payout',
    amount: -50000,
    currency: 'GBP',
    date: '2026-03-15T10:00:00.000Z',
    description: 'Payout to Bank Account ****1234',
    status: 'completed',
  },
  {
    id: 'act_003',
    type: 'deposit',
    amount: 230000,
    currency: 'GBP',
    date: '2026-03-14T10:00:00.000Z',
    description: 'Payment from Customer XYZ',
    status: 'completed',
  },
  {
    id: 'act_004',
    type: 'fee',
    amount: -2500,
    currency: 'GBP',
    date: '2026-03-13T10:00:00.000Z',
    description: 'Monthly service fee',
    status: 'completed',
  },
];

const noop = () => {};

describe('ActivitySection', () => {
  it('renders the section header', () => {
    render(
      <ActivitySection
        items={mockItems}
        currency='GBP'
        loading={false}
        onViewAll={noop}
      />,
    );
    expect(screen.getByText('home.recentActivity')).toBeTruthy();
  });

  it('renders only the first 3 items', () => {
    render(
      <ActivitySection
        items={mockItems}
        currency='GBP'
        loading={false}
        onViewAll={noop}
      />,
    );
    expect(screen.getByTestId('activity-row-act_001')).toBeTruthy();
    expect(screen.getByTestId('activity-row-act_002')).toBeTruthy();
    expect(screen.getByTestId('activity-row-act_003')).toBeTruthy();
    expect(screen.queryByTestId('activity-row-act_004')).toBeNull();
  });

  it('renders item descriptions', () => {
    render(
      <ActivitySection
        items={mockItems}
        currency='GBP'
        loading={false}
        onViewAll={noop}
      />,
    );
    expect(screen.getByText('Payment from Customer ABC')).toBeTruthy();
    expect(screen.getByText('Payout to Bank Account ****1234')).toBeTruthy();
  });

  it('renders formatted amounts', () => {
    render(
      <ActivitySection
        items={mockItems}
        currency='GBP'
        loading={false}
        onViewAll={noop}
      />,
    );
    expect(screen.getByText('+£1,500.00')).toBeTruthy();
    expect(screen.getByText('-£500.00')).toBeTruthy();
  });

  it('uses green colour for positive amounts', () => {
    render(
      <ActivitySection
        items={mockItems}
        currency='GBP'
        loading={false}
        onViewAll={noop}
      />,
    );
    const positiveAmount = screen.getByTestId('activity-amount-act_001');
    expect(positiveAmount.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ color: Palette.accentGreen }),
      ]),
    );
  });

  it('uses red colour for negative amounts', () => {
    render(
      <ActivitySection
        items={mockItems}
        currency='GBP'
        loading={false}
        onViewAll={noop}
      />,
    );
    const negativeAmount = screen.getByTestId('activity-amount-act_002');
    expect(negativeAmount.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ color: Palette.accentRed }),
      ]),
    );
  });

  it('calls onViewAll when View all is pressed', () => {
    const onViewAll = jest.fn();
    render(
      <ActivitySection
        items={mockItems}
        currency='GBP'
        loading={false}
        onViewAll={onViewAll}
      />,
    );
    fireEvent.press(screen.getByTestId('activity-view-all'));
    expect(onViewAll).toHaveBeenCalledTimes(1);
  });

  it('shows skeleton rows when loading', () => {
    render(
      <ActivitySection
        items={[]}
        currency='GBP'
        loading={true}
        onViewAll={noop}
      />,
    );
    expect(screen.getByTestId('activity-skeleton-row-0')).toBeTruthy();
    expect(screen.getByTestId('activity-skeleton-row-1')).toBeTruthy();
    expect(screen.getByTestId('activity-skeleton-row-2')).toBeTruthy();
  });

  it('does not render rows when loading', () => {
    render(
      <ActivitySection
        items={mockItems}
        currency='GBP'
        loading={true}
        onViewAll={noop}
      />,
    );
    expect(screen.queryByTestId('activity-row-act_001')).toBeNull();
  });
});
