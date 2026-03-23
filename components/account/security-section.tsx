import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { SwitchRow } from '@/components/account/row';
import { SectionCard } from '@/components/account/section-card';
import { useAccountStyles } from '@/components/account/styles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toast, type ToastVariant } from '@/components/ui/toast';
import { useThemePalette } from '@/hooks/use-theme-palette';
import { useTranslation } from '@/hooks/use-translation';
import { useAccountStore } from '@/store/account-store';

export function SecuritySection() {
  const { t } = useTranslation();
  const palette = useThemePalette();
  const { securitySection: styles } = useAccountStyles();
  const {
    biometricEnabled,
    biometricThresholdGBP,
    setBiometricEnabled,
    setBiometricThresholdGBP,
  } = useAccountStore();

  const [thresholdInput, setThresholdInput] = useState(
    String(biometricThresholdGBP),
  );
  const [thresholdError, setThresholdError] = useState('');
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    variant: ToastVariant;
  }>({ visible: false, message: '', variant: 'info' });

  const showToast = (message: string, variant: ToastVariant) => {
    setToast({ visible: true, message, variant });
  };

  const handleThresholdSave = () => {
    const n = parseFloat(thresholdInput);
    if (isNaN(n) || n <= 0) {
      setThresholdError(t('account.security.thresholdError'));
      showToast(t('account.security.thresholdError'), 'error');
      return;
    }
    setThresholdError('');
    setBiometricThresholdGBP(n);
    showToast(t('account.security.thresholdSaved'), 'success');
  };

  return (
    <>
      <Toast
        message={toast.message}
        variant={toast.variant}
        visible={toast.visible}
        onDismiss={() => setToast(prev => ({ ...prev, visible: false }))}
      />
      <SectionCard titleKey='account.security.title'>
        <SwitchRow
          label={t('account.security.biometricEnabled')}
          value={biometricEnabled}
          onValueChange={setBiometricEnabled}
        />
        {biometricEnabled && (
          <View
            style={[
              styles.thresholdRow,
              {
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: palette.surfaceElevated,
              },
            ]}
          >
            <Input
              label={t('account.security.biometricThreshold')}
              value={thresholdInput}
              onChangeText={text => {
                setThresholdInput(text);
                setThresholdError('');
              }}
              inputType='decimal'
              error={thresholdError}
            />
            <Button
              label={t('common.save')}
              onPress={handleThresholdSave}
              variant='secondary'
              size='sm'
            />
          </View>
        )}
      </SectionCard>
    </>
  );
}
