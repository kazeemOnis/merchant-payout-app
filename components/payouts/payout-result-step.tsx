import LottieView from 'lottie-react-native';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { usePayoutStyles } from '@/components/payouts/styles';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import type { PayoutForm } from '@/hooks/use-payout';
import { useThemePalette } from '@/hooks/use-theme-palette';
import { useTranslation } from '@/hooks/use-translation';
import type { Currency } from '@/types/api';
import { amountToPence, formatAmount } from '@/utils/currency';

interface Props {
  resultStatus: 'success' | 'error';
  resultError: string | null;
  values: PayoutForm;
  onDone: () => void;
}

export function PayoutResultStep({
  resultStatus,
  resultError,
  values,
  onDone,
}: Props) {
  const { t } = useTranslation();
  const palette = useThemePalette();
  const { resultStepStyles } = usePayoutStyles();
  const pence = amountToPence(values.amount);

  return (
    <SafeAreaView style={resultStepStyles.container} edges={['top']}>
      <View style={resultStepStyles.resultContainer}>
        <LottieView
          source={
            resultStatus === 'success'
              ? require('@/assets/animations/success.json')
              : require('@/assets/animations/error.json')
          }
          autoPlay
          loop
          style={resultStepStyles.lottie}
        />

        <ThemedText
          variant='h3'
          color={palette.white}
          style={resultStepStyles.title}
        >
          {resultStatus === 'success'
            ? t('payouts.successTitle')
            : t('payouts.failTitle')}
        </ThemedText>

        <ThemedText
          variant='body'
          color={palette.textMuted}
          style={resultStepStyles.message}
        >
          {resultStatus === 'success'
            ? t('payouts.successDescription', {
                amount: formatAmount(pence, values.currency as Currency),
              })
            : resultError ?? t('payouts.errorGeneric')}
        </ThemedText>

        <Button
          label={
            resultStatus === 'success'
              ? t('payouts.done')
              : t('payouts.tryAgain')
          }
          onPress={onDone}
          fullWidth
          size='lg'
          style={resultStepStyles.button}
        />
      </View>
    </SafeAreaView>
  );
}
