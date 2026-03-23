import type { CreatePayoutRequest, PayoutResponse } from '@/types/api';

import { apiClient } from './client';

export function createPayout(
  body: CreatePayoutRequest,
): Promise<PayoutResponse> {
  return apiClient.post<PayoutResponse>('/api/payouts', body);
}
