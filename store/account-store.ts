import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStorage } from '@/utils/storage';

type AccountState = {
  biometricEnabled: boolean;
  biometricThresholdGBP: number;
  defaultCurrency: 'GBP' | 'EUR';
  notifPayoutSuccess: boolean;
  notifPayoutFailure: boolean;
  setBiometricEnabled: (v: boolean) => void;
  setBiometricThresholdGBP: (v: number) => void;
  setDefaultCurrency: (v: 'GBP' | 'EUR') => void;
  setNotifPayoutSuccess: (v: boolean) => void;
  setNotifPayoutFailure: (v: boolean) => void;
};

export const useAccountStore = create<AccountState>()(
  persist(
    set => ({
      biometricEnabled: false,
      biometricThresholdGBP: 1000,
      defaultCurrency: 'GBP',
      notifPayoutSuccess: true,
      notifPayoutFailure: true,
      setBiometricEnabled: biometricEnabled => set({ biometricEnabled }),
      setBiometricThresholdGBP: biometricThresholdGBP =>
        set({ biometricThresholdGBP }),
      setDefaultCurrency: defaultCurrency => set({ defaultCurrency }),
      setNotifPayoutSuccess: notifPayoutSuccess => set({ notifPayoutSuccess }),
      setNotifPayoutFailure: notifPayoutFailure => set({ notifPayoutFailure }),
    }),
    {
      name: 'account-storage',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: state => ({
        biometricEnabled: state.biometricEnabled,
        biometricThresholdGBP: state.biometricThresholdGBP,
        defaultCurrency: state.defaultCurrency,
        notifPayoutSuccess: state.notifPayoutSuccess,
        notifPayoutFailure: state.notifPayoutFailure,
      }),
    },
  ),
);
