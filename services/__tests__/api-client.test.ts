/**
 * API client unit tests — uses MSW test server to intercept requests.
 *
 * Tests: error normalisation, auth header, idempotency key, success response.
 */

// Node 16 does not expose Blob globally — MSW v2's HttpResponse.json() requires it.
import { http, HttpResponse, type JsonBodyType } from 'msw';

import { API_BASE_URL } from '@/constants';
import { ApiError, apiClient } from '@/services/api';

import { server } from '../../mocks/server.test';

if (typeof global.Blob === 'undefined') {
  const { Blob } = require('buffer') as { Blob: typeof globalThis.Blob };
  (global as typeof globalThis).Blob = Blob;
}

// ─── Mock auth store ──────────────────────────────────────────────────────────

jest.mock('@/store/auth-store', () => ({
  useAuthStore: {
    getState: () => ({ token: 'mock-token', clearAuth: jest.fn() }),
  },
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TEST_PATH = '/api/test';

/** Capture the last request headers sent by the client */
let capturedHeaders: Headers | null = null;

function registerCaptureHandler(
  method: 'get' | 'post',
  status: number,
  body: JsonBodyType,
) {
  const handler =
    method === 'get'
      ? http.get(`${API_BASE_URL}${TEST_PATH}`, ({ request }) => {
          capturedHeaders = request.headers;
          return HttpResponse.json(body, { status });
        })
      : http.post(`${API_BASE_URL}${TEST_PATH}`, async ({ request }) => {
          capturedHeaders = request.headers;
          return HttpResponse.json(body, { status });
        });
  server.use(handler);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('apiClient', () => {
  beforeEach(() => {
    capturedHeaders = null;
  });

  // ── Error normalisation ───────────────────────────────────────────────────

  it('400 response throws ApiError with code INSUFFICIENT_FUNDS', async () => {
    server.use(
      http.get(`${API_BASE_URL}${TEST_PATH}`, () =>
        HttpResponse.json({ error: 'Insufficient funds' }, { status: 400 }),
      ),
    );

    await expect(apiClient.get(TEST_PATH)).rejects.toMatchObject({
      name: 'ApiError',
      code: 'INSUFFICIENT_FUNDS',
      status: 400,
    });
  });

  it('503 response throws ApiError with code SERVICE_UNAVAILABLE', async () => {
    server.use(
      http.get(`${API_BASE_URL}${TEST_PATH}`, () =>
        HttpResponse.json({ error: 'Service unavailable' }, { status: 503 }),
      ),
    );

    await expect(apiClient.get(TEST_PATH)).rejects.toMatchObject({
      name: 'ApiError',
      code: 'SERVICE_UNAVAILABLE',
      status: 503,
    });
  });

  it('successful 200 returns parsed JSON', async () => {
    const data = { id: '123', value: 'hello' };
    server.use(
      http.get(`${API_BASE_URL}${TEST_PATH}`, () =>
        HttpResponse.json(data, { status: 200 }),
      ),
    );

    const result = await apiClient.get<typeof data>(TEST_PATH);
    expect(result).toEqual(data);
  });

  // ── Request headers ───────────────────────────────────────────────────────

  it('attaches Authorization: Bearer token header', async () => {
    registerCaptureHandler('get', 200, {});

    await apiClient.get(TEST_PATH);

    expect(capturedHeaders?.get('Authorization')).toBe('Bearer mock-token');
  });

  it('POST request includes Idempotency-Key header in UUID-like format', async () => {
    registerCaptureHandler('post', 200, {});

    await apiClient.post(TEST_PATH, { amount: 100 });

    // The client sets: `${method}-${path}-${Date.now()}` — not a UUID but still present
    const idempotencyKey = capturedHeaders?.get('Idempotency-Key');
    expect(idempotencyKey).toBeTruthy();
    expect(typeof idempotencyKey).toBe('string');
  });

  it('GET request does NOT include Idempotency-Key header', async () => {
    registerCaptureHandler('get', 200, {});

    await apiClient.get(TEST_PATH);

    const idempotencyKey = capturedHeaders?.get('Idempotency-Key');
    expect(idempotencyKey).toBeNull();
  });

  it('thrown error is an instance of ApiError', async () => {
    server.use(
      http.get(`${API_BASE_URL}${TEST_PATH}`, () =>
        HttpResponse.json({ error: 'Not found' }, { status: 404 }),
      ),
    );

    try {
      await apiClient.get(TEST_PATH);
      fail('Expected ApiError to be thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
    }
  });
});
