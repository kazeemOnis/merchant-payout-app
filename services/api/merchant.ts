import type { MerchantDataResponse } from '@/types/api';

import { apiClient } from './client';

export function getMerchant(): Promise<MerchantDataResponse> {
  return apiClient.get<MerchantDataResponse>('/api/merchant');
}
