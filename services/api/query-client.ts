import { QueryClient } from '@tanstack/react-query';

/**
 * Shared React Query client for the app root.
 * Tuned for merchant balance / activity: short stale window, modest cache retention.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000, // 30 s — balance and activity don't need to be live
      gcTime: 5 * 60_000, // 5 min cache
    },
  },
});
