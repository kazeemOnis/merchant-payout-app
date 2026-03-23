/**
 * Analytics service unit tests — verifies ATT gate and provider delegation.
 */

// ─── Mock storage before importing analytics ──────────────────────────────────

// ─── Import after mocks ───────────────────────────────────────────────────────

import { analytics } from '@/services/analytics';

const mockGetItem = jest.fn<string | null, [string]>().mockReturnValue(null);

jest.mock('@/utils/storage', () => ({
  mmkvStorage: {
    getItem: (key: string) => mockGetItem(key),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('analytics service', () => {
  let consoleSpy: jest.SpyInstance;

  beforeAll(() => {
    // The console provider only logs in __DEV__ — ensure it's set
    (global as Record<string, unknown>).__DEV__ = true;
  });

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    mockGetItem.mockReturnValue(null);
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    jest.clearAllMocks();
  });

  it('track() calls console.log with [Analytics] prefix in dev', () => {
    analytics.track('test_event', { prop: 'value' });
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[Analytics] track'),
      expect.anything(),
    );
  });

  it('track() is silenced when ATT status is denied', () => {
    mockGetItem.mockReturnValue('denied');
    analytics.track('test_event');
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it('track() is allowed when ATT status is authorized', () => {
    mockGetItem.mockReturnValue('authorized');
    analytics.track('test_event');
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('track() is allowed when ATT status is not-determined', () => {
    mockGetItem.mockReturnValue('not-determined');
    analytics.track('test_event');
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('track() is allowed when ATT status is undefined (not set)', () => {
    mockGetItem.mockReturnValue(null);
    analytics.track('test_event');
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('identify() is silenced when ATT status is denied', () => {
    mockGetItem.mockReturnValue('denied');
    analytics.identify('user-123');
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it('identify() is allowed when ATT status is authorized', () => {
    mockGetItem.mockReturnValue('authorized');
    analytics.identify('user-123');
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('screen() is silenced when ATT status is denied', () => {
    mockGetItem.mockReturnValue('denied');
    analytics.screen('home');
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it('screen() is allowed when ATT status is not denied', () => {
    mockGetItem.mockReturnValue('authorized');
    analytics.screen('home');
    expect(consoleSpy).toHaveBeenCalled();
  });
});
