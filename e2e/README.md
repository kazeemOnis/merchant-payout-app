# E2E Flows — Maestro

All flows target the iOS bundle identifier `com.checkout.app` (Android package is the same).
Run against a debug build produced with `npx expo run:ios` or `npx expo run:android`.

---

## Install Maestro CLI

```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

Verify:

```bash
maestro --version
```

---

## Run a flow

```bash
# Happy path (below £1,000, no biometric)
maestro test e2e/payout-happy-path.yaml

# Biometric gate (above £1,000 threshold)
maestro test e2e/payout-biometric.yaml

# Error states (insufficient funds + service unavailable)
maestro test e2e/payout-errors.yaml

# Run all flows in sequence
maestro test e2e/
```

### Payout flows & restored sessions

`payout-errors.yaml` (and similar flows) use **`runFlow` + `when: visible:`** so they work for:

- **Fresh app data** — onboarding shows **Next**, then sign-in.
- **Restored session** — if a token is still in **SecureStore** (Maestro `clearState` does not always wipe the iOS Keychain), `useBootstrap` logs the user in and the UI shows the home screen first — the flow skips onboarding.

### Home title & tab bar (Maestro selectors)

- The home heading uses **`Typography.h2`**, which sets **`textTransform: 'uppercase'`**. The native hierarchy exposes **`BUSINESS ACCOUNT`**, not `Business Account` — use that string in **`assertVisible` / `when: visible`**.
- **Payouts** tab taps use **`id: tab-payouts`** (`tabBarButtonTestID` on `Tabs.Screen` in `app/(tabs)/_layout.tsx`) so tests don’t depend on tab label text alone.

### Payout form & confirm screen

- The amount field uses a **decimal keyboard**; focus can stay on **`amount-input`** after `inputText`. The next `inputText` may then **append to the amount** instead of the IBAN. Maestro’s **`hideKeyboard`** often fails with RN `TextInput`; flows use **`tapOn: "Available Balance"`** (static label on the balance card) to blur/dismiss the keyboard, then **`scrollUntilVisible`** + **`tapOn` `id: iban-input`** before the IBAN, then **`tapOn: "Available Balance"`** again before **`id: payout-continue-button`**. After **`Try Again`**, `reset()` clears the form — **avoid `eraseText` on empty fields** (backspaces can hit the wrong input and break `react-hook-form` validation so **Continue** stays disabled).
- The confirm step title uses **`Typography.h2`** (uppercase in the hierarchy). Prefer **`assertVisible` + `id: payout-confirm-title`** on the confirm screen rather than matching the mixed-case string `"Confirm Payout"`.

### Metro / LogBox during Maestro

- **`[ApiClient] POST /api/payouts → 400`** in the console is from **`console.error`** in `services/api/client.ts` when a request fails. The **only** payout `POST` is from **Send Payout** on the **confirm** step (not **Continue** on the form). A **400 Insufficient funds** banner can still be visible on the **form** if **LogBox** hasn’t cleared the log from the **previous** sub-flow (first error scenario). That does **not** mean **Continue** issued a `POST`.
- **`RemoteTextInput` / `XCTAutomationSupport`** noise is common when Maestro drives the iOS keyboard; it’s usually unrelated to app logic.

If a flow still fails at the first screen, check the Maestro debug hierarchy: you may need to reset the simulator (**Device → Erase All Content and Settings**) or sign out in-app for a truly clean auth state.

---

## Simulate Face ID on iOS Simulator

The biometric flow uses Maestro's built-in Face ID helpers. You can also trigger
Face ID manually from the simulator menu:

```
Features > Face ID > Enrolled          # enrol Face ID
Features > Face ID > Matching Face     # approve the prompt
Features > Face ID > Non-matching Face # reject the prompt
```

Or from the command line while the prompt is visible:

```bash
# Approve
xcrun simctl ui booted biometric --match

# Reject
xcrun simctl ui booted biometric --nonmatch
```

---

## Simulate a screenshot (screenshot detection flow)

The `ScreenSecurity` native module exposes `simulateScreenshot()` in debug builds.
Call it from the Expo dev-tools console or a custom dev menu button while on the
Payouts screen:

```ts
import { simulateScreenshot } from 'screen-security';
simulateScreenshot();
```

This fires the `onScreenshotTaken` native event, which triggers the toast on the
Payouts screen and records the `screenshot_detected` analytics event.

Note: `Cmd+S` in the iOS Simulator does NOT trigger `UIApplication.userDidTakeScreenshotNotification`.
Use `simulateScreenshot()` or test on a physical device.
