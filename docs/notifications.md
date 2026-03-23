# Notifications

## Setup

`expo-notifications` is registered as an Expo config plugin in `app.config.ts`:

```ts
['expo-notifications', { icon: './assets/images/adaptive-icon.png', color: '#186AFE' }]
```

This adds the required native entitlements and metadata on both platforms during
`expo prebuild`.

---

## Permission request — onboarding

`PermissionSlide` (kind `'notifications'`) is shown once during onboarding when
`notificationPermission === 'undetermined'` (stored in `useOnboardingStore`, backed
by MMKV).

Tapping "Allow Notifications" calls `Notifications.requestPermissionsAsync()`. The
result (`'granted'` or `'denied'`) is written to `useOnboardingStore` via
`setNotificationPermission`. Tapping "Not now" records `'denied'` immediately
without showing the system dialog.

The slide is never shown again after the first decision.

---

## ATT (iOS) — same slide sequence

On iOS, the ATT permission slide (`kind='att'`) is shown immediately after the
notifications slide if `attStatus === 'undetermined'`. This ensures ATT resolves
before any analytics SDK would initialise, which is required by Apple guidelines.

---

## Foreground handling

`app/_layout.tsx` configures the global notification handler at module level:

```ts
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: false,
    shouldShowList: false,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});
```

Notifications received while the app is in the foreground are suppressed — no
system banner appears. The `addNotificationReceivedListener` subscription logs
the payload in `__DEV__` only.

---

## Boot permission sync

On every app launch, `AppShell` reads the current permission state and syncs it
to MMKV:

```ts
Notifications.getPermissionsAsync().then(({ status }) => {
  mmkvStorage.setItem('notification_permission', status);
});
```

This keeps the stored value in sync if the user revokes permission in device
Settings between launches. `usePayout` reads `notification_permission` from MMKV
before scheduling notifications.

---

## Mock push notifications on payout outcome

`usePayout` schedules a local notification (`trigger: null` = immediate delivery)
after each payout attempt, gated on two conditions:

1. `notifPayoutSuccess` / `notifPayoutFailure` preference is `true` in
   `useAccountStore` (persisted via MMKV).
2. `notification_permission` MMKV key equals `'granted'`.

Success notification:
- Title: `"Payout confirmed"` (`account.notifications.payoutSuccess`)
- Body: formatted amount string (e.g. `"£500.00"`)
- `data.screen`: `"/(tabs)"` — tapping the notification navigates to the home tab.

Failure notification:
- Title: `"Payout failed"` (`account.notifications.payoutFailure`)
- Body: the localised error message (e.g. `"Insufficient funds for this payout."`)
- `data.screen`: `"/(tabs)/payouts"` — tapping navigates back to the payout form.

Notification tap navigation is handled by `addNotificationResponseReceivedListener`
in `AppShell`, which calls `router.push(data.screen)`.

---

## Re-prompt policy

Notifications are requested once in onboarding. After a `'denied'` decision, the
app never re-prompts automatically.

The Account → Settings → Notifications section shows a "Notifications are disabled"
banner with an "Open Settings" link that deep-links to the device settings page,
allowing the user to re-enable manually. The app itself makes no further
`requestPermissionsAsync` calls after onboarding.
