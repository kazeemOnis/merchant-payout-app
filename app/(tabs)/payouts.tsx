import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { addScreenshotListener } from 'screen-security';

import { PayoutConfirmStep } from '@/components/payouts/payout-confirm-step';
import { PayoutFormStep } from '@/components/payouts/payout-form-step';
import { PayoutResultStep } from '@/components/payouts/payout-result-step';
import { ScreenshotToast } from '@/components/ui/screenshot-toast';
import { useMerchant } from '@/hooks/use-merchant';
import { usePayout } from '@/hooks/use-payout';
import { analytics, Events } from '@/services/analytics';

export default function PayoutsScreen() {
  const { data: merchantData, loading: merchantLoading } = useMerchant();
  const {
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
  } = usePayout();

  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    analytics.screen(Events.SCREEN_VIEWED, { screen: 'payouts' });
  }, []);
  useEffect(() => {
    return addScreenshotListener(() => {
      setToastVisible(true);
      analytics.track(Events.SCREENSHOT_DETECTED);
    });
  }, []);

  const dismissToast = useCallback(() => setToastVisible(false), []);

  return (
    <View style={styles.root}>
      {step === 'form' && (
        <PayoutFormStep
          control={control}
          errors={errors}
          setValue={setValue}
          canContinue={canContinue}
          merchantData={merchantData}
          merchantLoading={merchantLoading}
          onContinue={onContinue}
        />
      )}

      {step === 'confirm' && (
        <PayoutConfirmStep
          values={values}
          submitting={submitting}
          onBack={() => setStep('form')}
          onSend={onSend}
        />
      )}

      {step === 'result' && (
        <PayoutResultStep
          resultStatus={resultStatus}
          resultError={resultError}
          values={values}
          onDone={onDone}
        />
      )}

      <ScreenshotToast visible={toastVisible} onDismiss={dismissToast} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
