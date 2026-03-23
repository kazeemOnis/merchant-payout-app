import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { usePayoutStyles } from '@/components/payouts/styles';
import { SummaryRow } from '@/components/payouts/summary-row';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Palette } from '@/constants/theme';
import type { PayoutForm } from '@/hooks/use-payout';
import { useThemePalette } from '@/hooks/use-theme-palette';
import { useTranslation } from '@/hooks/use-translation';
import { useAccountStore } from '@/store/account-store';
import type { Currency } from '@/types/api';
import { amountToPence, formatAmount } from '@/utils/currency';
import { formatIbanDisplay } from '@/utils/iban';

interface Props {
  values: PayoutForm;
  submitting: boolean;
  onBack: () => void;
  onSend: () => void;
}

export function PayoutConfirmStep({
  values,
  submitting,
  onBack,
  onSend,
}: Props) {
  const { t } = useTranslation();
  const palette = useThemePalette();
  const { sharedStyles, confirmStepStyles } = usePayoutStyles();
  const { biometricThresholdGBP } = useAccountStore();
  const thresholdPence = biometricThresholdGBP * 100;
  const pence = amountToPence(values.amount);
  const requiresBiometric = pence > thresholdPence;

  return (
    <SafeAreaView style={sharedStyles.container} edges={['top']}>
      <ScrollView
        style={sharedStyles.flex}
        contentContainerStyle={sharedStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={onBack}
          hitSlop={12}
          style={confirmStepStyles.backButton}
        >
          <ThemedText variant='label' color={Palette.ctaBlue}>
            {t('payouts.back')}
          </ThemedText>
        </Pressable>

        <ThemedText
          variant='h2'
          color={palette.white}
          style={sharedStyles.title}
          testID='payout-confirm-title'
        >
          {t('payouts.confirmTitle')}
        </ThemedText>
        <ThemedText
          variant='bodySmall'
          color={palette.textMuted}
          style={confirmStepStyles.subtitle}
        >
          {t('payouts.confirmDescription')}
        </ThemedText>

        <View style={confirmStepStyles.summaryCard}>
          <SummaryRow label={t('payouts.amount')}>
            <ThemedText variant='amount' color={palette.white}>
              {formatAmount(pence, values.currency as Currency)}
            </ThemedText>
          </SummaryRow>
          <SummaryRow label={t('payouts.currency')}>
            <ThemedText variant='label' color={palette.white}>
              {values.currency}
            </ThemedText>
          </SummaryRow>
          <SummaryRow label={t('payouts.to')}>
            <ThemedText
              variant='accountNumber'
              color={palette.white}
              style={confirmStepStyles.ibanValue}
              numberOfLines={2}
            >
              {formatIbanDisplay(values.iban)}
            </ThemedText>
          </SummaryRow>
        </View>

        {requiresBiometric && (
          <View style={confirmStepStyles.biometricNotice}>
            <Ionicons name='finger-print' size={14} color={palette.textMuted} />
            <ThemedText variant='caption' color={palette.textMuted}>
              {t('payouts.biometricRequired', {
                threshold: formatAmount(
                  thresholdPence,
                  values.currency as Currency,
                ),
              })}
            </ThemedText>
          </View>
        )}
      </ScrollView>

      <View style={sharedStyles.footer}>
        <Button
          label={t('payouts.send')}
          onPress={onSend}
          fullWidth
          size='lg'
          loading={submitting}
        />
      </View>
    </SafeAreaView>
  );
}
