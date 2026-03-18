import { formatDate } from '@/utils/date';

describe('formatDate', () => {
  it('formats an ISO string as DD MMM YYYY', () => {
    expect(formatDate('2026-03-17T10:00:00.000Z')).toBe('17 Mar 2026');
  });

  it('zero-pads single-digit days', () => {
    expect(formatDate('2026-01-05T00:00:00.000Z')).toBe('05 Jan 2026');
  });

  it('formats the last day of the year', () => {
    expect(formatDate('2025-12-31T23:59:59.000Z')).toBe('31 Dec 2025');
  });

  it('handles different months correctly', () => {
    expect(formatDate('2026-07-04T12:00:00.000Z')).toBe('04 Jul 2026');
  });
});
