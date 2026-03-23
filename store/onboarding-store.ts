import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStorage } from '@/utils/storage';

export type PermissionStatus = 'undetermined' | 'granted' | 'denied';

type OnboardingState = {
  notificationPermission: PermissionStatus;
  attStatus: PermissionStatus;
  setNotificationPermission: (status: PermissionStatus) => void;
  setAttStatus: (status: PermissionStatus) => void;
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    set => ({
      notificationPermission: 'undetermined',
      attStatus: 'undetermined',
      setNotificationPermission: (status: PermissionStatus) =>
        set({ notificationPermission: status }),
      setAttStatus: (status: PermissionStatus) => set({ attStatus: status }),
    }),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: state => ({
        notificationPermission: state.notificationPermission,
        attStatus: state.attStatus,
      }),
    },
  ),
);
