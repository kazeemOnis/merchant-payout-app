import * as SecureStore from 'expo-secure-store';
import { useEffect, useRef, useState } from 'react';
import { isBiometricAuthenticated } from 'screen-security';

import { useAccountStore } from '@/store/account-store';
import {
  MOCK_MERCHANT,
  MOCK_TOKEN,
  TOKEN_KEY,
  useAuthStore,
} from '@/store/auth-store';

/**
 * Runs once when fonts and MSW are ready. Checks secure storage for an
 * existing session token and gates returning users behind biometrics before
 * restoring their session. The SplashScreen stays visible until this resolves,
 * so there is never a flash of the wrong screen.
 *
 * Returns `isAuthChecked` — true once the check has completed (pass or fail).
 */
export function useBootstrap(
  fontsLoaded: boolean,
  isMSWReady: boolean,
): boolean {
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const bootstrapped = useRef(false);

  useEffect(() => {
    if (!fontsLoaded || !isMSWReady || bootstrapped.current) return;
    bootstrapped.current = true;

    async function run() {
      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        if (token === MOCK_TOKEN) {
          const { biometricEnabled } = useAccountStore.getState();

          if (!biometricEnabled) {
            // User hasn't opted into biometric sign-in — restore session silently
            useAuthStore.getState().setAuth(token, MOCK_MERCHANT);
          } else {
            // Returning user with Face ID enabled — prompt before restoring session
            try {
              const ok = await isBiometricAuthenticated();
              if (ok) {
                useAuthStore.getState().setAuth(token, MOCK_MERCHANT);
              }
              // ok === false: user cancelled — keep token, they stay on the lock screen
            } catch (e) {
              const code = (e as { code?: string })?.code ?? String(e);
              const isUnavailable =
                code === 'BIOMETRICS_NOT_ENROLLED' ||
                code === 'BIOMETRIC_UNAVAILABLE' ||
                code.includes('NOT_ENROLLED') ||
                code.includes('UNAVAILABLE');

              if (isUnavailable) {
                // Face ID no longer available — restore session and clear preference
                useAccountStore.getState().setBiometricEnabled(false);
                useAuthStore.getState().setAuth(token, MOCK_MERCHANT);
              } else {
                await SecureStore.deleteItemAsync(TOKEN_KEY);
              }
            }
          }
        }
      } finally {
        setIsAuthChecked(true);
      }
    }

    run();
  }, [fontsLoaded, isMSWReady]);

  return isAuthChecked;
}
