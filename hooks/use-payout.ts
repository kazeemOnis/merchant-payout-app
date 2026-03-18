import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert } from 'react-native';
import { getDeviceId, isBiometricAuthenticated } from 'screen-security';
import { z } from 'zod';

import { API_BASE_URL } from '@/constants';
import { useTranslation } from '@/hooks/use-translation';
import { amountToPence } from '@/utils/currency';
import { isValidIban, normaliseIban } from '@/utils/iban';

// 1,000.00 in lowest denomination (pence / cents) — applies to both GBP and EUR
const BIOMETRIC_THRESHOLD_PENCE = 100_000;

export type PayoutForm = {
  amount: string;
  currency: 'GBP' | 'EUR';
  iban: string;
};
export type PayoutStep = 'form' | 'confirm' | 'result';

export function usePayout() {
  const { t } = useTranslation();

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
  const [submitting, setSubmitting] = useState(false);

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

  const canContinue = (() => {
    const n = parseFloat(values.amount);
    return !isNaN(n) && n > 0 && values.iban.trim().length > 0;
  })();

  const onContinue = handleSubmit(() => setStep('confirm'));

  const onSend = useCallback(async () => {
    const { amount, currency, iban } = getValues();
    const pence = amountToPence(amount);
    setSubmitting(true);

    // Biometric gate — required for payouts exceeding the threshold
    if (pence > BIOMETRIC_THRESHOLD_PENCE) {
      try {
        const authenticated = await isBiometricAuthenticated();
        if (!authenticated) {
          // User cancelled — keep them on the confirm screen
          setSubmitting(false);
          return;
        }
      } catch (e) {
        const code = (e as { code?: string })?.code ?? '';
        const isNotEnrolled =
          code === 'BIOMETRICS_NOT_ENROLLED' ||
          String(e).includes('NOT_ENROLLED');
        Alert.alert(
          t('payouts.biometricPrompt'),
          isNotEnrolled
            ? t('payouts.biometricNotEnrolled')
            : t('payouts.errorGeneric'),
        );
        setSubmitting(false);
        return;
      }
    }

    try {
      const deviceId = await getDeviceId();

      const res = await fetch(`${API_BASE_URL}/api/payouts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: pence,
          currency,
          iban: normaliseIban(iban),
          ...(deviceId ? { device_id: deviceId } : {}),
        }),
      });

      if (!res.ok) {
        const errorKey =
          res.status === 400
            ? 'payouts.errorInsufficient'
            : res.status === 503
            ? 'payouts.errorUnavailable'
            : 'payouts.errorGeneric';
        setResultError(t(errorKey));
        setResultStatus('error');
      } else {
        setResultStatus('success');
        setResultError(null);
      }
    } catch {
      setResultError(t('payouts.errorNetwork'));
      setResultStatus('error');
    } finally {
      setSubmitting(false);
      setStep('result');
    }
  }, [getValues, t]);

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
