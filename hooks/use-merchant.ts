import { useCallback, useEffect, useState } from 'react';

import { API_BASE_URL } from '@/constants';
import type { MerchantDataResponse } from '@/types/api';

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: MerchantDataResponse };

export function useMerchant() {
  const [state, setState] = useState<State>({ status: 'loading' });

  const fetch_ = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const res = await fetch(`${API_BASE_URL}/api/merchant`);
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }
      const data: MerchantDataResponse = await res.json();
      setState({ status: 'success', data });
    } catch (e) {
      setState({
        status: 'error',
        message: e instanceof Error ? e.message : 'Failed to load account data',
      });
    }
  }, []);

  useEffect(() => {
    fetch_();
  }, [fetch_]);

  return {
    loading: state.status === 'loading',
    error: state.status === 'error' ? state.message : null,
    data: state.status === 'success' ? state.data : null,
    refetch: fetch_,
  };
}
