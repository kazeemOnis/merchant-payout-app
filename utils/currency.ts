import type { Currency } from '@/types/api';

const CURRENCY_LOCALE: Record<Currency, string> = {
  GBP: 'en-GB',
  EUR: 'en-IE',
};

/**
 * Convert a decimal string amount (e.g. "12.50") to lowest denomination integer (e.g. 1250).
 */
export function amountToPence(value: string): number {
  return Math.round(parseFloat(value) * 100);
}

/**
 * Format an amount from its lowest denomination (pence/cents) to a display string.
 * e.g. 500000 GBP → "£5,000.00"
 *      -50000 GBP → "-£500.00"
 */
export function formatAmount(amount: number, currency: Currency): string {
  const value = amount / 100;
  return new Intl.NumberFormat(CURRENCY_LOCALE[currency], {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format amount with an explicit + prefix for positive values.
 * e.g. 17092 GBP → "+£170.92"
 */
export function formatAmountSigned(amount: number, currency: Currency): string {
  const formatted = formatAmount(Math.abs(amount), currency);
  return amount >= 0 ? `+${formatted}` : `-${formatted.replace('-', '')}`;
}
