import { act, renderHook } from '@testing-library/react-native';

// ─── Import hook after mocks ──────────────────────────────────────────────────

import { usePayout } from '@/hooks/use-payout';
import { ApiError } from '@/services/api';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockGetDeviceId = jest.fn().mockResolvedValue('test-device-id');
const mockIsBiometricAuthenticated = jest.fn().mockResolvedValue(true);

jest.mock('screen-security', () => ({
  getDeviceId: (...args: unknown[]) => mockGetDeviceId(...args),
  isBiometricAuthenticated: (...args: unknown[]) =>
    mockIsBiometricAuthenticated(...args),
  addScreenshotListener: jest.fn(() => jest.fn()),
}));

const mockCreatePayout = jest.fn().mockResolvedValue(undefined);

jest.mock('@/services/api', () => ({
  createPayout: (...args: unknown[]) => mockCreatePayout(...args),
  ApiError: class ApiError extends Error {
    code: string;
    status: number | null;
    constructor(code: string, status: number | null, message: string) {
      super(message);
      this.name = 'ApiError';
      this.code = code;
      this.status = status;
    }
  },
}));

const mockAccountStore = {
  biometricEnabled: false,
  biometricThresholdGBP: 1000,
  notifPayoutSuccess: true,
  notifPayoutFailure: true,
  setBiometricEnabled: jest.fn(),
  setBiometricThresholdGBP: jest.fn(),
  setDefaultCurrency: jest.fn(),
  setNotifPayoutSuccess: jest.fn(),
  setNotifPayoutFailure: jest.fn(),
  defaultCurrency: 'GBP' as const,
};

jest.mock('@/store/account-store', () => ({
  useAccountStore: () => mockAccountStore,
}));

jest.mock('@/store/auth-store', () => ({
  useAuthStore: {
    getState: () => ({ token: 'mock-token' }),
  },
}));

jest.mock('@/hooks/use-translation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const mockScheduleNotificationAsync = jest
  .fn()
  .mockResolvedValue('notification-id');

jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: (...args: unknown[]) =>
    mockScheduleNotificationAsync(...args),
}));

// Storage mock — using a module-level object so we can reset it in beforeEach
const mockStorageGetItem = jest
  .fn<string | null, [string]>()
  .mockReturnValue('granted');

jest.mock('@/utils/storage', () => ({
  mmkvStorage: {
    getItem: (key: string) => mockStorageGetItem(key),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

jest.mock('@/services/analytics', () => ({
  analytics: {
    track: jest.fn(),
    screen: jest.fn(),
    identify: jest.fn(),
    reset: jest.fn(),
  },
  Events: {
    SIGN_IN: 'sign_in',
    SIGN_OUT: 'sign_out',
    PAYOUT_CONFIRMED: 'payout_confirmed',
    PAYOUT_FAILED: 'payout_failed',
    SCREENSHOT_DETECTED: 'screenshot_detected',
    SCREEN_VIEWED: 'screen_viewed',
  },
}));

jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual('@tanstack/react-query');
  return {
    ...actual,
    useMutation: ({
      mutationFn,
    }: {
      mutationFn: (...args: unknown[]) => unknown;
    }) => ({
      mutateAsync: mutationFn,
      isPending: false,
    }),
    useQueryClient: () => ({
      invalidateQueries: jest.fn(),
    }),
  };
});

jest.mock('@/hooks/use-merchant', () => ({
  MERCHANT_QUERY_KEY: ['merchant'],
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

type HookResult = { current: ReturnType<typeof usePayout> };

function fillForm(result: HookResult, amount: string, iban: string) {
  act(() => {
    result.current.setValue('amount', amount);
    result.current.setValue('iban', iban);
    result.current.setValue('currency', 'GBP');
  });
}

const VALID_IBAN = 'GB29NWBK60161331926819';

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('usePayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDeviceId.mockResolvedValue('test-device-id');
    mockIsBiometricAuthenticated.mockResolvedValue(true);
    mockCreatePayout.mockResolvedValue(undefined);
    mockAccountStore.biometricEnabled = false;
    mockAccountStore.biometricThresholdGBP = 1000;
    mockAccountStore.notifPayoutSuccess = true;
    mockAccountStore.notifPayoutFailure = true;
    mockStorageGetItem.mockReturnValue('granted');
    mockScheduleNotificationAsync.mockResolvedValue('notification-id');
  });

  it('initial state: step is form, resultError is null', () => {
    const { result } = renderHook(() => usePayout());
    expect(result.current.step).toBe('form');
    expect(result.current.resultError).toBeNull();
  });

  it('canContinue is false when IBAN fails structural validation (matches handleSubmit)', () => {
    const { result } = renderHook(() => usePayout());
    fillForm(result, '999.99', 'NOT-A-VALID-IBAN');
    expect(result.current.canContinue).toBe(false);
  });

  it('onContinue with valid form moves step to confirm', async () => {
    const { result } = renderHook(() => usePayout());

    fillForm(result, '500', VALID_IBAN);

    await act(async () => {
      await result.current.onContinue();
    });

    expect(result.current.step).toBe('confirm');
  });

  it('biometric NOT called when amount is below threshold', async () => {
    mockAccountStore.biometricEnabled = true;
    mockAccountStore.biometricThresholdGBP = 1000;

    const { result } = renderHook(() => usePayout());

    fillForm(result, '500', VALID_IBAN); // 500 GBP = 50000 pence < 100000 threshold

    await act(async () => {
      await result.current.onContinue();
    });

    await act(async () => {
      await result.current.onSend();
    });

    expect(mockIsBiometricAuthenticated).not.toHaveBeenCalled();
  });

  it('biometric IS called when amount is above threshold and biometricEnabled is true', async () => {
    mockAccountStore.biometricEnabled = true;
    mockAccountStore.biometricThresholdGBP = 1000;

    const { result } = renderHook(() => usePayout());

    fillForm(result, '1500', VALID_IBAN); // 1500 GBP = 150000 pence > 100000 threshold

    await act(async () => {
      await result.current.onContinue();
    });

    await act(async () => {
      await result.current.onSend();
    });

    expect(mockIsBiometricAuthenticated).toHaveBeenCalled();
  });

  it('cancelled biometric keeps step as confirm and makes no API call', async () => {
    mockAccountStore.biometricEnabled = true;
    mockAccountStore.biometricThresholdGBP = 1000;
    mockIsBiometricAuthenticated.mockResolvedValue(false);

    const { result } = renderHook(() => usePayout());

    fillForm(result, '1500', VALID_IBAN);

    await act(async () => {
      await result.current.onContinue();
    });

    expect(result.current.step).toBe('confirm');

    await act(async () => {
      await result.current.onSend();
    });

    // Step stays confirm, no payout API call
    expect(result.current.step).toBe('confirm');
    expect(mockCreatePayout).not.toHaveBeenCalled();
  });

  it('successful payout sets resultStatus to success and step to result', async () => {
    const { result } = renderHook(() => usePayout());

    fillForm(result, '100', VALID_IBAN);

    await act(async () => {
      await result.current.onContinue();
    });

    await act(async () => {
      await result.current.onSend();
    });

    expect(result.current.step).toBe('result');
    expect(result.current.resultStatus).toBe('success');
  });

  it('INSUFFICIENT_FUNDS ApiError sets resultError and resultStatus error', async () => {
    mockCreatePayout.mockRejectedValue(
      new ApiError('INSUFFICIENT_FUNDS', 400, 'Insufficient funds'),
    );

    const { result } = renderHook(() => usePayout());

    fillForm(result, '100', VALID_IBAN);

    await act(async () => {
      await result.current.onContinue();
    });

    await act(async () => {
      await result.current.onSend();
    });

    expect(result.current.step).toBe('result');
    expect(result.current.resultStatus).toBe('error');
    expect(result.current.resultError).toBe('payouts.errorInsufficient');
  });

  it('onDone resets step to form', async () => {
    const { result } = renderHook(() => usePayout());

    fillForm(result, '100', VALID_IBAN);

    await act(async () => {
      await result.current.onContinue();
    });

    await act(async () => {
      await result.current.onSend();
    });

    expect(result.current.step).toBe('result');

    act(() => {
      result.current.onDone();
    });

    expect(result.current.step).toBe('form');
  });
});
