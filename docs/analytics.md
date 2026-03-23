# Analytics

## Pattern

All tracking calls go through the `analytics` facade in `services/analytics/index.ts`.
Components and hooks never import or call any third-party SDK directly.

```ts
import { analytics, Events } from '@/services/analytics';

analytics.track(Events.PAYOUT_CONFIRMED, { currency: 'GBP', above_threshold: true });
analytics.screen('home');
analytics.identify(userId, { name: merchantName });
```

---

## Provider interface

```ts
interface AnalyticsProvider {
  track(event: string, properties?: AnalyticsProperties): void;
  identify(userId: string, traits?: AnalyticsProperties): void;
  screen(name: string, properties?: AnalyticsProperties): void;
  reset(): void;
}
```

The active provider is a module-level variable. Swap it at boot by calling:

```ts
import { initAnalytics } from '@/services/analytics';
import { posthogProvider } from './posthog-provider';

initAnalytics(posthogProvider);
```

The default provider is `consoleProvider`, which logs to the metro console in
`__DEV__` mode and is silent in production.

---

## ATT gate

Every `track`, `identify`, and `screen` call on the public `analytics` facade
checks MMKV for `att_status` before delegating to the active provider.

```ts
function isAttDenied(): boolean {
  return mmkvStorage.getItem('att_status') === 'denied';
}
```

If the value is `'denied'`, the call returns immediately without forwarding to
the provider. `reset()` is not gated — it always runs so the provider can clear
its own state on sign-out regardless of ATT status.

The `att_status` key is written by `PermissionSlide` (kind `'att'`) during
onboarding. On iOS, the actual `requestTrackingPermissionsAsync()` dialog is
shown; on Android the status is set to `'granted'` directly.

---

## Event catalogue (`services/analytics/events.ts`)

| Constant | Value | When |
|---|---|---|
| `Events.SIGN_IN` | `sign_in` | Sign-in form submitted or Face ID approved |
| `Events.SIGN_OUT` | `sign_out` | User taps Sign Out |
| `Events.PAYOUT_CONFIRMED` | `payout_confirmed` | Payout API returns success |
| `Events.PAYOUT_FAILED` | `payout_failed` | Payout API returns any error |
| `Events.SCREENSHOT_DETECTED` | `screenshot_detected` | Native `onScreenshotTaken` fires |
| `Events.SCREEN_VIEWED` | `screen_viewed` | Payouts screen comes into focus |

Screen views on the home screen use `analytics.screen('home')` directly (no
`Events` constant), following the same convention.

---

## Privacy rules

- Raw monetary amounts are never logged as event properties.
- Use `above_threshold: boolean` to indicate whether a payout exceeded the
  biometric threshold without revealing the value.
- `SIGN_IN` carries `{ method: 'email' | 'biometric' }`.
- `PAYOUT_FAILED` carries `{ currency, error_code }` — the normalised error code
  string, never a raw HTTP status.

---

## `initAnalytics` pattern

```ts
// At app boot, after ATT resolves:
if (attStatus === 'granted') {
  initAnalytics(posthogProvider);
} else {
  // Default consoleProvider remains active — calls are silenced by ATT gate
}
```

Only one call to `initAnalytics` is needed. All subsequent `analytics.*` calls
in any component or hook automatically use the new provider.
