import { useQuery } from '@tanstack/react-query';

import { getMerchant } from '@/services/api';

export const MERCHANT_QUERY_KEY = ['merchant'] as const;

export function useMerchant() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: MERCHANT_QUERY_KEY,
    queryFn: getMerchant,
  });

  return {
    data: data ?? null,
    loading: isLoading,
    error: error ? (error as Error).message : null,
    refetch,
  };
}
