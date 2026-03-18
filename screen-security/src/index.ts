import { requireNativeModule } from 'expo-modules-core';

// In Expo SDK 52+, requireNativeModule already returns an EventEmitter.
// Do NOT wrap in `new EventEmitter(Native)` — that API is removed in 3.x.
type NativeScreenSecurityModule = {
  getDeviceId(): Promise<string>;
  isBiometricAuthenticated(): Promise<boolean>;
  simulateScreenshot?(): void; // dev only — #if DEBUG / BuildConfig.DEBUG
  addListener(
    event: string,
    listener: (...args: unknown[]) => void,
  ): { remove(): void };
  removeAllListeners(event: string): void;
};

let Native: NativeScreenSecurityModule | null = null;

try {
  Native = requireNativeModule<NativeScreenSecurityModule>('ScreenSecurity');
  console.log('[ScreenSecurity] Native module loaded successfully');
} catch (e) {
  console.warn(
    '[ScreenSecurity] Native module not available — running without native features',
    e,
  );
}

/**
 * Returns the device's unique identifier, or null when the native module
 * is unavailable (web / Expo Go).
 */
export async function getDeviceId(): Promise<string | null> {
  return Native?.getDeviceId() ?? null;
}

/**
 * Triggers the device biometric prompt.
 *
 * Resolves `true`  → authenticated
 * Resolves `false` → user cancelled
 * Throws           → error.code === 'BIOMETRICS_NOT_ENROLLED' or unavailable
 *
 * Returns `true` in non-native environments so the flow isn't blocked.
 */
export async function isBiometricAuthenticated(): Promise<boolean> {
  if (!Native) return true;
  return Native.isBiometricAuthenticated();
}

/**
 * Subscribes to the native screenshot/screen-capture event.
 *
 * iOS     — UIApplication.userDidTakeScreenshotNotification
 * Android — Activity.ScreenCaptureCallback (API 34+)
 *
 * Returns an unsubscribe function — call it from useEffect cleanup.
 *
 * NOTE: iOS Simulator does NOT trigger this via Cmd+S. Use
 * `simulateScreenshot()` in __DEV__ or test on a real device.
 */
export function addScreenshotListener(listener: () => void): () => void {
  if (!Native) {
    console.warn(
      '[ScreenSecurity] addScreenshotListener: native module unavailable',
    );
    return () => {};
  }
  console.log('[ScreenSecurity] Registering screenshot listener');
  const subscription = Native.addListener('onScreenshotTaken', () => {
    console.log('[ScreenSecurity] onScreenshotTaken event received in JS');
    listener();
  });
  return () => {
    console.log('[ScreenSecurity] Removing screenshot listener');
    subscription.remove();
  };
}

/**
 * Manually fires the screenshot event for simulator/emulator testing.
 * Only works in debug builds — no-op in production.
 */
export function simulateScreenshot(): void {
  if (!__DEV__) return;
  if (!Native?.simulateScreenshot) {
    console.warn(
      '[ScreenSecurity] simulateScreenshot not available — rebuild with native code',
    );
    return;
  }
  console.log('[ScreenSecurity] Simulating screenshot event');
  Native.simulateScreenshot();
}
