import { formatIbanDisplay, isValidIban, normaliseIban } from '@/utils/iban';

describe('normaliseIban', () => {
  it('strips spaces and uppercases', () => {
    expect(normaliseIban('gb29 nwbk 6016 1331 9268 19')).toBe(
      'GB29NWBK60161331926819',
    );
  });

  it('handles already normalised input', () => {
    expect(normaliseIban('GB29NWBK60161331926819')).toBe(
      'GB29NWBK60161331926819',
    );
  });
});

describe('isValidIban', () => {
  it('accepts a valid GB IBAN', () => {
    expect(isValidIban('GB29NWBK60161331926819')).toBe(true);
  });

  it('accepts a valid FR IBAN', () => {
    expect(isValidIban('FR1212345123451234567A12310')).toBe(true);
  });

  it('accepts IBAN with spaces (normalises internally)', () => {
    expect(isValidIban('GB29 NWBK 6016 1331 9268 19')).toBe(true);
  });

  it('rejects an empty string', () => {
    expect(isValidIban('')).toBe(false);
  });

  it('rejects a string starting with digits', () => {
    expect(isValidIban('12NWBK60161331926819')).toBe(false);
  });

  it('rejects a string that is too short', () => {
    expect(isValidIban('GB29')).toBe(false);
  });

  it('rejects a string with invalid characters', () => {
    expect(isValidIban('GB29-NWBK-6016')).toBe(false);
  });
});

describe('formatIbanDisplay', () => {
  it('groups characters in blocks of 4', () => {
    expect(formatIbanDisplay('GB29NWBK60161331926819')).toBe(
      'GB29 NWBK 6016 1331 9268 19',
    );
  });

  it('normalises before formatting', () => {
    expect(formatIbanDisplay('gb29 nwbk 6016')).toBe('GB29 NWBK 6016');
  });
});
