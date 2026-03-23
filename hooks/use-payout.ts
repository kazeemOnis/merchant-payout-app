import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert } from 'react-native';
import { getDeviceId, isBiometricAuthenticated } from 'screen-security';
import { z } from 'zod';

import { MERCHANT_QUERY_KEY } from '@/hooks/use-merchant';
import { useTranslation } from '@/hooks/use-translation';
import { analytics, Events } from '@/services/analytics';
import { ApiError, createPayout } from '@/services/api';
import { useAccountStore } from '@/store/account-store';
import { amountToPence, formatAmount } from '@/utils/currency';
import { isValidIban, normaliseIban } from '@/utils/iban';
import { mmkvStorage } from '@/utils/storage';

export type PayoutForm = {
  amount: string;
  currency: 'GBP' | 'EUR';
  iban: string;
};
export type PayoutStep = 'form' | 'confirm' | 'result';

export function usePayout() {
  const { t } = useTranslation();
  const {
    biometricEnabled,
    biometricThresholdGBP,
    notifPayoutSuccess,
    notifPayoutFailure,
  } = useAccountStore();
  const queryClient = useQueryClient();

  const schema = useMemo(
    () =>
      z.object({
        amount: z
          .string()
          .min(1, t('errors.required'))
          .refine(v => {
            const n = parseFloat(v);
            return !isNaN(n) && n > 0;
          }, t('errors.amountZero')),
        currency: z.enum(['GBP', 'EUR'] as const),
        iban: z
          .string()
          .min(1, t('errors.required'))
          .refine(v => isValidIban(v), t('errors.invalidIban')),
      }),
    [t],
  );

  const [step, setStep] = useState<PayoutStep>('form');
  const [resultStatus, setResultStatus] = useState<'success' | 'error'>(
    'success',
  );
  const [resultError, setResultError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<PayoutForm>({
    resolver: zodResolver(schema),
    defaultValues: { amount: '', currency: 'GBP', iban: '' },
  });

  const values = watch();

  /** Must match Zod + handleSubmit — the old check only tested length, so Continue
   * could look enabled while IBAN failed isValidIban() and onContinue did nothing. */
  const canContinue = useMemo(
    () => schema.safeParse(values).success,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [schema, values.amount, values.currency, values.iban],
  );

  const onContinue = handleSubmit(() => setStep('confirm'));

  const { mutateAsync: submitPayout, isPending: submitting } = useMutation({
    mutationFn: createPayout,
    retry: false,
    onSuccess: () => {
      // Invalidate merchant balance so home screen refreshes in the background
      queryClient.invalidateQueries({ queryKey: MERCHANT_QUERY_KEY });
    },
  });

  const onSend = useCallback(async () => {
    const { amount, currency, iban } = getValues();
    const pence = amountToPence(amount);
    const thresholdPence = biometricThresholdGBP * 100;

    // Biometric gate
    if (biometricEnabled && pence > thresholdPence) {
      try {
        const authenticated = await isBiometricAuthenticated();
        if (!authenticated) return; // user cancelled — stay on confirm screen
      } catch (e) {
        const code = (e as { code?: string })?.code ?? '';
        const isNotEnrolled =
          code === 'BIOMETRICS_NOT_ENROLLED' ||
          String(e).includes('NOT_ENROLLED');
        const isUnavailable =
          code === 'BIOMETRIC_UNAVAILABLE' || String(e).includes('UNAVAILABLE');
        Alert.alert(
          t('payouts.biometricPrompt'),
          isNotEnrolled
            ? t('payouts.biometricNotEnrolled')
            : isUnavailable
            ? t('payouts.biometricUnavailable')
            : t('payouts.errorGeneric'),
        );
        return;
      }
    }

    try {
      const deviceId = await getDeviceId();

      await submitPayout({
        amount: pence,
        currency,
        iban: normaliseIban(iban),
        ...(deviceId ? { device_id: deviceId } : {}),
      });

      analytics.track(Events.PAYOUT_CONFIRMED, {
        currency,
        above_threshold: pence > thresholdPence,
      });

      setResultStatus('success');
      setResultError(null);

      const notifPermission = mmkvStorage.getItem('notification_permission');
      if (notifPayoutSuccess && notifPermission === 'granted') {
        const successDescription = formatAmount(pence, currency);
        await Notifications.scheduleNotificationAsync({
          content: {
            title: t('account.notifications.payoutSuccess'),
            body: successDescription,
            data: { screen: '/(tabs)' },
          },
          trigger: null,
        });
      }
    } catch (e) {
      const code = e instanceof ApiError ? e.code : 'UNKNOWN';
      const errorKey =
        code === 'INSUFFICIENT_FUNDS'
          ? 'payouts.errorInsufficient'
          : code === 'SERVICE_UNAVAILABLE'
          ? 'payouts.errorUnavailable'
          : code === 'NETWORK_ERROR'
          ? 'payouts.errorNetwork'
          : 'payouts.errorGeneric';

      analytics.track(Events.PAYOUT_FAILED, { currency, error_code: code });

      const errorMessage = t(errorKey);
      setResultError(errorMessage);
      setResultStatus('error');

      const notifPermission = mmkvStorage.getItem('notification_permission');
      if (notifPayoutFailure && notifPermission === 'granted') {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: t('account.notifications.payoutFailure'),
            body: errorMessage,
            data: { screen: '/(tabs)/payouts' },
          },
          trigger: null,
        });
      }
    } finally {
      setStep('result');
    }
  }, [
    getValues,
    t,
    biometricEnabled,
    biometricThresholdGBP,
    notifPayoutSuccess,
    notifPayoutFailure,
    submitPayout,
  ]);

  const onDone = useCallback(() => {
    reset();
    setStep('form');
  }, [reset]);

  return {
    step,
    setStep,
    resultStatus,
    resultError,
    submitting,
    control,
    errors,
    values,
    setValue,
    canContinue,
    onContinue,
    onSend,
    onDone,
  };
}
