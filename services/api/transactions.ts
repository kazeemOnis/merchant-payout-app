import type { PaginatedActivityResponse } from '@/types/api';

import { apiClient } from './client';

export interface FetchActivityParams {
  limit?: number;
  cursor?: string | null;
}

export function getActivity(
  params: FetchActivityParams = {},
): Promise<PaginatedActivityResponse> {
  const { limit = 15, cursor } = params;
  const qs = new URLSearchParams({ limit: String(limit) });
  if (cursor) qs.set('cursor', cursor);
  return apiClient.get<PaginatedActivityResponse>(
    `/api/merchant/activity?${qs.toString()}`,
  );
}
