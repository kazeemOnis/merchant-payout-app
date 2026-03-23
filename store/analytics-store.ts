import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStorage } from '@/utils/storage';

export type DateRange = '24h' | '7d' | '30d' | '90d' | '1y';

type AnalyticsState = {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
};

export const useAnalyticsStore = create<AnalyticsState>()(
  persist(
    set => ({
      dateRange: '7d',
      setDateRange: dateRange => set({ dateRange }),
    }),
    {
      name: 'analytics-storage',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: state => ({ dateRange: state.dateRange }),
    },
  ),
);
