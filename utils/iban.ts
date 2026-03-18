/** Strip whitespace and uppercase — canonical IBAN form for storage/API. */
export function normaliseIban(value: string): string {
  return value.replace(/\s+/g, '').toUpperCase();
}

/**
 * Basic structural IBAN validation.
 * 2-letter country code + 2 check digits + 11–30 alphanumeric BBAN chars.
 * Total length: 15–34 characters (per ISO 13616).
 */
export function isValidIban(value: string): boolean {
  const clean = normaliseIban(value);
  return /^[A-Z]{2}[0-9]{2}[0-9A-Z]{11,30}$/.test(clean);
}

/** Format IBAN for human-readable display: groups of 4 separated by spaces. */
export function formatIbanDisplay(value: string): string {
  const clean = normaliseIban(value);
  return clean.match(/.{1,4}/g)?.join(' ') ?? clean;
}
