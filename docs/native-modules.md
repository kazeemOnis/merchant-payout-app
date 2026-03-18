# Native Module: ScreenSecurity

The `ScreenSecurity` native module was built across Steps 4, 5, and 6 of the challenge. It provides device identity, biometric authentication, and screenshot detection — all without any third-party native libraries.

## Module location

```
screen-security/              # standalone Expo module (project root)
  ios/
    ScreenSecurityModule.swift
    ScreenSecurity.podspec
  android/
    build.gradle
    src/main/java/expo/modules/screensecurity/
      ScreenSecurityModule.kt
  src/
    index.ts                  # TypeScript public API
  expo-module.config.json
  package.json
```

The module is a standalone package created with `npx create-expo-module screen-security`. It lives at the project root (not inside `modules/`) and is linked to the main app via:

```json
// package.json (main app)
"screen-security": "file:./screen-security"
```

## Why `create-expo-module`

`npx create-expo-module` is the recommended way to scaffold a local Expo native module. It generates everything the Expo toolchain needs to autolink and compile the module correctly:

- `expo-module.config.json` with the `"apple"` platform key (required by Expo SDK 52+)
- Podspec inside `ios/` with `s.platforms = { :ios => '15.1' }` matching the project's minimum deployment target
- Correct package structure so `expo-modules-autolinking` resolves and registers `ScreenSecurityModule` in `ExpoModulesProvider.swift` at build time

## Commands run

```bash
# 1. Create the module scaffold (run from project root)
npx create-expo-module screen-security

# 2. Verify autolinking finds the module (run from project root)
node node_modules/.bin/expo-modules-autolinking search

# 3. Clean prebuild — regenerates ios/ and android/, runs pod install
npx expo prebuild --clean

# 4. Build and run (also triggers pod install automatically)
npx expo run:ios
```

> Node 20 is required. Node 16 throws `ReadableStream is not defined` from the `undici` dependency used by the Expo CLI.

## What was built

### Step 4 — Device Identity

**iOS:** `UIDevice.current.identifierForVendor?.uuidString` — stable per app install per device. Falls back to a new `UUID()` if unavailable (rare).

**Android:** `Settings.Secure.ANDROID_ID` — stable hardware identifier scoped to the app signing key.

The device ID is sent as `device_id` in every `POST /api/payouts` request body. If the native module is unavailable (Expo Go, web), `getDeviceId()` returns `null` and the field is omitted.

### Step 5 — Biometric Authentication

Payouts over £1,000 (100,000 pence, strictly `>`) are gated behind biometrics before the network request is made.

**iOS:** `LAContext.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics)` — presents Face ID or Touch ID. The prompt reason is `"Verify your identity to authorise this payout"`.

**Android:** `BiometricPrompt` from `androidx.biometric:biometric:1.1.0` — requires `FragmentActivity`. The prompt is shown on the UI thread via `activity.runOnUiThread`.

**Outcomes:**

| Result | Behaviour |
|---|---|
| `true` | Proceed to network request |
| `false` (cancelled) | `setSubmitting(false)` — stay on confirm screen silently |
| throws `BIOMETRICS_NOT_ENROLLED` | Alert: prompt user to set up Face ID / Fingerprint in Settings |
| throws `BIOMETRIC_UNAVAILABLE` | Alert: device not capable |

The `isBiometricAuthenticated` function returns `true` when the native module is unavailable (Expo Go, web), so the flow is never blocked in development.

**Simulator testing:**
- iOS: `Features → Face ID → Enrolled`, then `Features → Face ID → Matching Face`
- Android: `Settings → Security → Fingerprint`, then Extended Controls `→ Fingerprint`

### Step 6 — Screenshot Detection

**iOS:** `NotificationCenter.addObserver(forName: UIApplication.userDidTakeScreenshotNotification)` — registered in `OnCreate`, removed in `OnDestroy`.

**Android:** `Activity.ScreenCaptureCallback` (API 34+ only, `UPSIDE_DOWN_CAKE`). Registered in `OnActivityEntersForeground`, unregistered in `OnActivityEntersBackground`. The callback is stored as `Any?` to avoid compile-time API level errors on the class definition.

When the event fires, the native layer calls `sendEvent("onScreenshotTaken")`. The JS layer subscribes via `addScreenshotListener` in `app/(tabs)/payouts.tsx`:

```ts
useEffect(() => {
  return addScreenshotListener(() => setToastVisible(true));
}, []);
```

The returned cleanup function is called automatically when the component unmounts.

**Toast design:** The `ScreenshotToast` component slides in from the top (below the safe area inset), auto-dismisses after 4 seconds, and can be tapped to dismiss early. It uses Reanimated `withSpring` for entry and `withTiming` for exit. `zIndex: 999` ensures it renders above the settings button.

### Dev helper — `simulateScreenshot()`

iOS Simulator does not trigger `UIApplication.userDidTakeScreenshotNotification` via `Cmd+S`. Android emulators cannot simulate hardware button presses via standard controls. Both platforms expose a `simulateScreenshot()` native function compiled only in `#if DEBUG` (iOS) / `BuildConfig.DEBUG` (Android).

## TypeScript API

```ts
// screen-security/src/index.ts

// Returns device unique ID, or null if native module unavailable
getDeviceId(): Promise<string | null>

// Triggers biometric prompt. Returns true=auth'd, false=cancelled, throws=error
isBiometricAuthenticated(): Promise<boolean>

// Subscribe to screenshot events. Returns unsubscribe function.
addScreenshotListener(listener: () => void): () => void

// Fire screenshot event manually (dev builds only)
simulateScreenshot(): void
```

The module uses `requireNativeModule('ScreenSecurity')` from `expo-modules-core`. In Expo SDK 52+, `requireNativeModule` already returns an `EventEmitter` — the old `new EventEmitter(nativeModule)` pattern is removed. `addListener` is called directly on the module instance.
