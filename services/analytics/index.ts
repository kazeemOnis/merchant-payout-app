/**
 * Analytics service — adapter pattern.
 *
 * All event tracking goes through this module. Components and hooks call
 * `analytics.track()` only — never a third-party SDK directly.
 *
 * Swapping providers (PostHog, Amplitude, Segment, etc.) means updating
 * only this file; call-sites are untouched.
 *
 * Current provider: console logger (development / no-SDK baseline).
 */

import { mmkvStorage } from '@/utils/storage';

export { Events } from './events';
export type { EventName } from './events';

// ─── Provider interface ────────────────────────────────────────────────────────

export type AnalyticsProperties = Record<
  string,
  string | number | boolean | null | undefined
>;

export interface AnalyticsProvider {
  track(event: string, properties?: AnalyticsProperties): void;
  identify(userId: string, traits?: AnalyticsProperties): void;
  screen(name: string, properties?: AnalyticsProperties): void;
  reset(): void;
}

// ─── Console provider (default) ───────────────────────────────────────────────

const consoleProvider: AnalyticsProvider = {
  track(event, properties) {
    if (__DEV__) {
      console.log(`[Analytics] track • ${event}`, properties ?? '');
    }
  },
  identify(userId, traits) {
    if (__DEV__) {
      console.log(`[Analytics] identify • ${userId}`, traits ?? '');
    }
  },
  screen(name, properties) {
    if (__DEV__) {
      console.log(`[Analytics] screen • ${name}`, properties ?? '');
    }
  },
  reset() {
    if (__DEV__) {
      console.log('[Analytics] reset');
    }
  },
};

// ─── Active provider ──────────────────────────────────────────────────────────

let _provider: AnalyticsProvider = consoleProvider;

/**
 * Override the active provider at boot time (e.g. after ATT resolves on iOS).
 * Call this before any `track` / `screen` calls.
 */
export function initAnalytics(provider: AnalyticsProvider): void {
  _provider = provider;
}

// ─── ATT gate ─────────────────────────────────────────────────────────────────

function isAttDenied(): boolean {
  return mmkvStorage.getItem('att_status') === 'denied';
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const analytics: AnalyticsProvider = {
  track(event, properties) {
    if (isAttDenied()) return;
    _provider.track(event, properties);
  },
  identify(userId, traits) {
    if (isAttDenied()) return;
    _provider.identify(userId, traits);
  },
  screen(name, properties) {
    if (isAttDenied()) return;
    _provider.screen(name, properties);
  },
  reset() {
    _provider.reset();
  },
};
