import { API_BASE_URL } from '@/constants';
import { useAuthStore } from '@/store/auth-store';

// ─── Error types ──────────────────────────────────────────────────────────────

export type ApiErrorCode =
  | 'INSUFFICIENT_FUNDS'
  | 'SERVICE_UNAVAILABLE'
  | 'NETWORK_ERROR'
  | 'UNAUTHORISED'
  | 'UNKNOWN';

export class ApiError extends Error {
  constructor(
    public readonly code: ApiErrorCode,
    public readonly status: number | null,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ─── Error normalisation ──────────────────────────────────────────────────────

function normaliseError(status: number | null, raw: unknown): ApiError {
  if (status === 400)
    return new ApiError('INSUFFICIENT_FUNDS', status, 'Insufficient funds');
  if (status === 401)
    return new ApiError('UNAUTHORISED', status, 'Unauthorised');
  if (status === 503)
    return new ApiError('SERVICE_UNAVAILABLE', status, 'Service unavailable');
  if (status === null)
    return new ApiError('NETWORK_ERROR', null, 'Network error');

  const message =
    raw && typeof raw === 'object' && 'message' in raw
      ? String((raw as { message: unknown }).message)
      : `Request failed (${status})`;

  return new ApiError('UNKNOWN', status, message);
}

// ─── Request options ──────────────────────────────────────────────────────────

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: Method;
  body?: unknown;
  headers?: Record<string, string>;
}

// ─── Core client ─────────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, headers: extraHeaders = {} } = options;

  // ── Request interceptor ───────────────────────────────────────────────────
  const token = useAuthStore.getState().token;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Attach idempotency key on mutating requests to make them safe to retry
  if (method !== 'GET') {
    headers['Idempotency-Key'] = `${method}-${path}-${Date.now()}`;
  }

  // ── Fetch ─────────────────────────────────────────────────────────────────
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw normaliseError(null, null);
  }

  // ── Response interceptor ──────────────────────────────────────────────────
  if (res.status === 401) {
    useAuthStore.getState().clearAuth();
    throw normaliseError(401, null);
  }

  if (!res.ok) {
    let raw: unknown;
    try {
      raw = await res.json();
    } catch {
      raw = null;
    }
    const err = normaliseError(res.status, raw);
    console.error(`[ApiClient] ${method} ${path} → ${res.status}`, err.message);
    throw err;
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

// ─── Convenience methods ──────────────────────────────────────────────────────

export const apiClient = {
  get<T>(path: string, headers?: Record<string, string>): Promise<T> {
    return request<T>(path, { method: 'GET', headers });
  },
  post<T>(
    path: string,
    body: unknown,
    headers?: Record<string, string>,
  ): Promise<T> {
    return request<T>(path, { method: 'POST', body, headers });
  },
  patch<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, { method: 'PATCH', body });
  },
  delete<T>(path: string): Promise<T> {
    return request<T>(path, { method: 'DELETE' });
  },
};
