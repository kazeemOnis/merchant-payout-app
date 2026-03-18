import { Control, Controller, FieldErrors } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  BalanceCard,
  BalanceCardsSkeleton,
} from '@/components/home/balance-card';
import { CurrencyPicker } from '@/components/payouts/currency-picker';
import { usePayoutStyles } from '@/components/payouts/styles';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Palette } from '@/constants/theme';
import type { PayoutForm } from '@/hooks/use-payout';
import { useThemePalette } from '@/hooks/use-theme-palette';
import { useTranslation } from '@/hooks/use-translation';
import type { Currency, MerchantDataResponse } from '@/types/api';
import { normaliseIban } from '@/utils/iban';

interface Props {
  control: Control<PayoutForm>;
  errors: FieldErrors<PayoutForm>;
  setValue: (name: keyof PayoutForm, value: string) => void;
  canContinue: boolean;
  merchantData: MerchantDataResponse | null;
  merchantLoading: boolean;
  onContinue: () => void;
}

export function PayoutFormStep({
  control,
  errors,
  setValue,
  canContinue,
  merchantData,
  merchantLoading,
  onContinue,
}: Props) {
  const { t } = useTranslation();
  const palette = useThemePalette();
  const { sharedStyles, formStepStyles } = usePayoutStyles();

  return (
    <SafeAreaView style={sharedStyles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={sharedStyles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={16}
      >
        <ScrollView
          style={sharedStyles.flex}
          contentContainerStyle={sharedStyles.scrollContent}
          keyboardShouldPersistTaps='handled'
          showsVerticalScrollIndicator={false}
        >
          <ThemedText
            variant='h2'
            color={palette.white}
            style={sharedStyles.title}
          >
            {t('payouts.title')}
          </ThemedText>

          {merchantLoading ? (
            <BalanceCardsSkeleton />
          ) : (
            <BalanceCard
              label={t('payouts.availableBalance')}
              amount={merchantData?.available_balance ?? 0}
              currency={merchantData?.currency ?? 'GBP'}
              variant='available'
            />
          )}

          <View style={formStepStyles.inputCard}>
            <ThemedText
              variant='caption'
              color={palette.textMuted}
              style={formStepStyles.cardLabel}
            >
              {t('payouts.enterAmount')}
            </ThemedText>
            <View style={formStepStyles.amountRow}>
              <Controller
                control={control}
                name='amount'
                render={({ field }) => (
                  <TextInput
                    style={[
                      formStepStyles.amountInput,
                      {
                        color: field.value ? palette.white : palette.textMuted,
                      },
                    ]}
                    value={field.value}
                    onChangeText={field.onChange}
                    placeholder='0.00'
                    placeholderTextColor={palette.textMuted}
                    keyboardType='decimal-pad'
                    returnKeyType='done'
                    testID='amount-input'
                  />
                )}
              />
              <Controller
                control={control}
                name='currency'
                render={({ field }) => (
                  <CurrencyPicker
                    value={field.value as Currency}
                    onChange={field.onChange}
                    testID='currency-picker'
                  />
                )}
              />
            </View>
            {errors.amount && (
              <ThemedText
                variant='caption'
                color={Palette.accentRed}
                style={formStepStyles.fieldError}
              >
                {errors.amount.message}
              </ThemedText>
            )}
          </View>

          <View style={formStepStyles.inputCard}>
            <ThemedText
              variant='label'
              color={palette.white}
              style={formStepStyles.cardLabel}
            >
              {t('payouts.destinationIban')}
            </ThemedText>
            <Controller
              control={control}
              name='iban'
              render={({ field }) => (
                <TextInput
                  style={formStepStyles.ibanInput}
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={() => setValue('iban', normaliseIban(field.value))}
                  placeholder={t('payouts.ibanPlaceholder')}
                  placeholderTextColor={palette.textMuted}
                  autoCapitalize='characters'
                  autoCorrect={false}
                  autoComplete='off'
                  returnKeyType='done'
                  testID='iban-input'
                />
              )}
            />
            <View style={formStepStyles.ibanDivider} />
            <ThemedText
              variant='caption'
              color={errors.iban ? Palette.accentRed : palette.textMuted}
            >
              {errors.iban ? errors.iban.message : t('payouts.ibanHelper')}
            </ThemedText>
          </View>
        </ScrollView>

        <View style={sharedStyles.footer}>
          <Button
            label={t('payouts.continue')}
            onPress={onContinue}
            fullWidth
            size='lg'
            disabled={!canContinue}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
