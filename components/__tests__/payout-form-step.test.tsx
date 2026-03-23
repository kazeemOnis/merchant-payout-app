import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { useForm } from 'react-hook-form';

import { PayoutFormStep } from '@/components/payouts/payout-form-step';
import type { PayoutForm } from '@/hooks/use-payout';

jest.mock('@/hooks/use-translation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

jest.mock('@/hooks/use-theme-palette', () => ({
  useThemePalette: () => ({
    bgDark: '#000',
    surface: '#111',
    white: '#fff',
    textMuted: '#888',
    surfaceElevated: '#222',
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children, ...props }: any) => {
    const { View } = require('react-native');
    return require('react').createElement(View, props, children);
  },
}));

jest.mock('@/components/home/balance-card', () => ({
  BalanceCard: (_props: any) => {
    const mockRN = require('react-native');
    return require('react').createElement(mockRN.View, {
      testID: 'balance-card',
    });
  },
  BalanceCardsSkeleton: () => {
    const mockRN = require('react-native');
    return require('react').createElement(mockRN.View, {
      testID: 'balance-skeleton',
    });
  },
}));

jest.mock('@/components/payouts/currency-picker', () => ({
  CurrencyPicker: (_props: any) => {
    const mockRN = require('react-native');
    return require('react').createElement(mockRN.View, {
      testID: 'currency-picker',
    });
  },
}));

jest.mock('@/utils/iban', () => ({
  normaliseIban: (v: string) => v,
}));

function TestWrapper({
  canContinue,
  merchantLoading = false,
  onContinue = jest.fn(),
}: {
  canContinue: boolean;
  merchantLoading?: boolean;
  onContinue?: () => void;
}) {
  const {
    control,
    formState: { errors },
    setValue,
  } = useForm<PayoutForm>({
    defaultValues: { amount: '', currency: 'GBP', iban: '' },
  });
  return (
    <PayoutFormStep
      control={control}
      errors={errors}
      setValue={setValue as any}
      canContinue={canContinue}
      merchantData={null}
      merchantLoading={merchantLoading}
      onContinue={onContinue}
    />
  );
}

describe('PayoutFormStep', () => {
  it('shows the payouts.title heading', () => {
    render(<TestWrapper canContinue={true} />);
    expect(screen.getByText('payouts.title')).toBeTruthy();
  });

  it('shows skeleton when merchantLoading=true', () => {
    render(<TestWrapper canContinue={true} merchantLoading={true} />);
    expect(screen.getByTestId('balance-skeleton')).toBeTruthy();
  });

  it('shows BalanceCard when not loading', () => {
    render(<TestWrapper canContinue={true} merchantLoading={false} />);
    expect(screen.getByTestId('balance-card')).toBeTruthy();
  });

  it('shows amount input with testID amount-input', () => {
    render(<TestWrapper canContinue={true} />);
    expect(screen.getByTestId('amount-input')).toBeTruthy();
  });

  it('shows IBAN input with testID iban-input', () => {
    render(<TestWrapper canContinue={true} />);
    expect(screen.getByTestId('iban-input')).toBeTruthy();
  });

  it('Continue button is disabled when canContinue=false', () => {
    const onContinue = jest.fn();
    render(<TestWrapper canContinue={false} onContinue={onContinue} />);
    fireEvent.press(screen.getByText('payouts.continue'));
    expect(onContinue).not.toHaveBeenCalled();
  });

  it('Continue button calls onContinue when pressed and canContinue=true', () => {
    const onContinue = jest.fn();
    render(<TestWrapper canContinue={true} onContinue={onContinue} />);
    fireEvent.press(screen.getByText('payouts.continue'));
    expect(onContinue).toHaveBeenCalledTimes(1);
  });
});
