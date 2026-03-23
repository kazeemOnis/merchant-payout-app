# Auth Flow

## Storage

| Data | Store | Key |
|---|---|---|
| Session token | `expo-secure-store` | `auth_token` (`TOKEN_KEY`) |
| Biometric preference | MMKV (via Zustand persist) | `account-storage` |

Raw `AsyncStorage` is never used.

---

## Zustand slice — `useAuthStore`

```ts
type AuthState = {
  token: string | null;
  merchant: Merchant | null;
  isAuthenticated: boolean;
  setAuth: (token: string, merchant: Merchant) => void;
  clearAuth: () => void;
};
```

`setAuth` writes the token to SecureStore and flips `isAuthenticated: true` in a
single call. `clearAuth` deletes the SecureStore key and resets all fields to
their initial values.

`Merchant` shape: `{ name, email, accountId }`.

---

## First launch

```
app launch
  → onboarding slides (swipe or tap Next)
  → /onboarding/notifications  (if permission === 'undetermined')
  → /onboarding/att            (iOS only, if attStatus === 'undetermined')
  → /sign-in
```

On the sign-in screen the user enters an `@checkout.com` email and any password.
`onSubmit` calls `setAuth(MOCK_TOKEN, MOCK_MERCHANT)`, identifies the user in
analytics, then navigates to `/(tabs)` via `router.replace`.

If `biometricEnabled` is already on at sign-in time, `isBiometricAuthenticated()`
is called immediately after `setAuth` to prime the Face ID permission dialog.
If it throws (not enrolled / unavailable) the preference is silently cleared.

---

## Returning user — bootstrap

`useBootstrap` runs once when fonts and MSW are ready, before the splash screen
hides. It reads `auth_token` from SecureStore.

- Token absent → nothing restored; user sees onboarding or sign-in.
- Token present, `biometricEnabled: false` → `setAuth` called immediately; user
  lands on `/(tabs)` without any prompt.
- Token present, `biometricEnabled: true` → `isBiometricAuthenticated()` called.
  - Resolves `true` → session restored.
  - Resolves `false` (user cancelled) → token kept in SecureStore; user stays on
    the lock screen and can try again.
  - Throws `BIOMETRICS_NOT_ENROLLED` or `BIOMETRIC_UNAVAILABLE` → session
    restored anyway and `biometricEnabled` cleared so this branch is not hit
    again.
  - Any other error → token deleted from SecureStore; user must sign in again.

---

## Biometric opt-in toggle

The sign-in screen renders a `Switch` (`testID="enable-face-id-toggle"`) bound to
`useAccountStore().biometricEnabled`. Toggling it calls `setBiometricEnabled(v)`,
which persists to MMKV via Zustand's `persist` middleware. The toggle only affects
whether the biometric gate runs at bootstrap and at payout confirmation — it does
not affect the email/password sign-in flow itself.

---

## Logout

`clearAuth()` deletes the SecureStore token, resets Zustand state to
`{ token: null, merchant: null, isAuthenticated: false }`, and the app's root
navigator renders the sign-in screen because `isAuthenticated` is now false.

---

## Token lifecycle summary

```
setAuth(token, merchant)
  → SecureStore.setItemAsync('auth_token', token)
  → Zustand: isAuthenticated = true

clearAuth()
  → SecureStore.deleteItemAsync('auth_token')
  → Zustand: isAuthenticated = false
```
