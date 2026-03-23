import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import { PayoutConfirmStep } from '@/components/payouts/payout-confirm-step';

jest.mock('@/hooks/use-translation', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string>) => {
      if (params)
        return Object.entries(params).reduce(
          (s, [k, v]) => s.replace(`{${k}}`, v),
          key,
        );
      return key;
    },
  }),
}));

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

const baseValues = {
  amount: '500',
  currency: 'GBP' as const,
  iban: 'GB29NWBK60161331926819',
};

describe('PayoutConfirmStep', () => {
  it('shows the confirm title', () => {
    render(
      <PayoutConfirmStep
        values={baseValues}
        submitting={false}
        onBack={() => {}}
        onSend={() => {}}
      />,
    );
    expect(screen.getByText('payouts.confirmTitle')).toBeTruthy();
  });

  it('shows amount and IBAN summary rows', () => {
    render(
      <PayoutConfirmStep
        values={baseValues}
        submitting={false}
        onBack={() => {}}
        onSend={() => {}}
      />,
    );
    expect(screen.getByText('payouts.amount')).toBeTruthy();
    expect(screen.getByText('payouts.to')).toBeTruthy();
  });

  it('does not show biometric notice below threshold', () => {
    render(
      <PayoutConfirmStep
        values={{ ...baseValues, amount: '500' }}
        submitting={false}
        onBack={() => {}}
        onSend={() => {}}
      />,
    );
    expect(screen.queryByText(/payouts.biometricRequired/)).toBeNull();
  });

  it('shows biometric notice for amounts over £1,000', () => {
    render(
      <PayoutConfirmStep
        values={{ ...baseValues, amount: '1001' }}
        submitting={false}
        onBack={() => {}}
        onSend={() => {}}
      />,
    );
    expect(screen.getByText(/payouts.biometricRequired/)).toBeTruthy();
  });

  it('calls onSend when Send button is pressed', () => {
    const onSend = jest.fn();
    render(
      <PayoutConfirmStep
        values={baseValues}
        submitting={false}
        onBack={() => {}}
        onSend={onSend}
      />,
    );
    fireEvent.press(screen.getByText('payouts.send'));
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it('calls onBack when back is pressed', () => {
    const onBack = jest.fn();
    render(
      <PayoutConfirmStep
        values={baseValues}
        submitting={false}
        onBack={onBack}
        onSend={() => {}}
      />,
    );
    fireEvent.press(screen.getByText('payouts.back'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('shows loading state when submitting', () => {
    render(
      <PayoutConfirmStep
        values={baseValues}
        submitting={true}
        onBack={() => {}}
        onSend={() => {}}
      />,
    );
    expect(screen.getByTestId('button-activity-indicator')).toBeTruthy();
  });
});
