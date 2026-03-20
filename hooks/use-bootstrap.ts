import * as SecureStore from 'expo-secure-store';
import { useEffect, useRef, useState } from 'react';
import { isBiometricAuthenticated } from 'screen-security';

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
          // Returning user — require biometrics before restoring session
          try {
            const ok = await isBiometricAuthenticated();
            if (ok) {
              useAuthStore.getState().setAuth(token, MOCK_MERCHANT);
            } else {
              await SecureStore.deleteItemAsync(TOKEN_KEY);
            }
          } catch {
            // Biometrics unavailable or not enrolled — force re-login
            await SecureStore.deleteItemAsync(TOKEN_KEY);
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
