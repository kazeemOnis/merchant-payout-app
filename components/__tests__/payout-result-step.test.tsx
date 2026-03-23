import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import { PayoutResultStep } from '@/components/payouts/payout-result-step';

jest.mock('@/hooks/use-translation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

jest.mock('lottie-react-native', () => {
  const mockReact = require('react');
  const mockRN = require('react-native');
  return {
    __esModule: true,
    default: (props: { testID?: string }) =>
      mockReact.createElement(mockRN.View, {
        testID: props.testID ?? 'lottie',
      }),
  };
});

const baseValues = {
  amount: '100',
  currency: 'GBP' as const,
  iban: 'GB29NWBK60161331926819',
};

describe('PayoutResultStep', () => {
  it('shows success title and done button on success', () => {
    const onDone = jest.fn();
    render(
      <PayoutResultStep
        resultStatus='success'
        resultError={null}
        values={baseValues}
        onDone={onDone}
      />,
    );
    expect(screen.getByText('payouts.successTitle')).toBeTruthy();
    expect(screen.getByText('payouts.done')).toBeTruthy();
  });

  it('shows fail title and try again button on error', () => {
    render(
      <PayoutResultStep
        resultStatus='error'
        resultError='Insufficient funds for this payout.'
        values={baseValues}
        onDone={() => {}}
      />,
    );
    expect(screen.getByText('payouts.failTitle')).toBeTruthy();
    expect(screen.getByText('payouts.tryAgain')).toBeTruthy();
  });

  it('shows the resultError message on error', () => {
    render(
      <PayoutResultStep
        resultStatus='error'
        resultError='Insufficient funds for this payout.'
        values={baseValues}
        onDone={() => {}}
      />,
    );
    expect(
      screen.getByText('Insufficient funds for this payout.'),
    ).toBeTruthy();
  });

  it('falls back to generic error when resultError is null', () => {
    render(
      <PayoutResultStep
        resultStatus='error'
        resultError={null}
        values={baseValues}
        onDone={() => {}}
      />,
    );
    expect(screen.getByText('payouts.errorGeneric')).toBeTruthy();
  });

  it('calls onDone when button is pressed', () => {
    const onDone = jest.fn();
    render(
      <PayoutResultStep
        resultStatus='success'
        resultError={null}
        values={baseValues}
        onDone={onDone}
      />,
    );
    fireEvent.press(screen.getByText('payouts.done'));
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});
