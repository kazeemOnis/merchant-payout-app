import { formatAmount, formatAmountSigned } from '@/utils/currency';

describe('formatAmount', () => {
  it('formats a whole GBP amount correctly', () => {
    expect(formatAmount(500000, 'GBP')).toBe('£5,000.00');
  });

  it('formats an amount with pence remainder', () => {
    expect(formatAmount(17092, 'GBP')).toBe('£170.92');
  });

  it('formats a negative amount', () => {
    expect(formatAmount(-50000, 'GBP')).toBe('-£500.00');
  });

  it('formats zero', () => {
    expect(formatAmount(0, 'GBP')).toBe('£0.00');
  });

  it('formats EUR currency with correct symbol', () => {
    expect(formatAmount(500000, 'EUR')).toContain('5,000.00');
    expect(formatAmount(500000, 'EUR')).toMatch(/€|EUR/);
  });

  it('formats small amounts correctly', () => {
    expect(formatAmount(1, 'GBP')).toBe('£0.01');
  });

  it('formats large amounts correctly', () => {
    expect(formatAmount(1000000, 'GBP')).toBe('£10,000.00');
  });
});

describe('formatAmountSigned', () => {
  it('prefixes positive amounts with +', () => {
    expect(formatAmountSigned(17092, 'GBP')).toBe('+£170.92');
  });

  it('prefixes negative amounts with -', () => {
    expect(formatAmountSigned(-50000, 'GBP')).toBe('-£500.00');
  });

  it('treats zero as positive', () => {
    expect(formatAmountSigned(0, 'GBP')).toBe('+£0.00');
  });
});
