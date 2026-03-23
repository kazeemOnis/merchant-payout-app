/**
 * Typed event catalogue — every tracked event name lives here.
 *
 * Rules:
 * - Never include raw monetary amounts in properties.
 * - Use `above_threshold: boolean` instead of the actual value.
 */

export const Events = {
  // Auth
  SIGN_IN: 'sign_in',
  SIGN_OUT: 'sign_out',

  // Payouts
  PAYOUT_CONFIRMED: 'payout_confirmed',
  PAYOUT_FAILED: 'payout_failed',

  // Security
  SCREENSHOT_DETECTED: 'screenshot_detected',

  // Screens
  SCREEN_VIEWED: 'screen_viewed',
} as const;

export type EventName = (typeof Events)[keyof typeof Events];
