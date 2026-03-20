import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { isBiometricAuthenticated } from 'screen-security';
import { z } from 'zod';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toast } from '@/components/ui/toast';
import { Palette } from '@/constants/theme';
import { type ThemePalette, useThemePalette } from '@/hooks/use-theme-palette';
import { useTranslation } from '@/hooks/use-translation';
import { MOCK_MERCHANT, MOCK_TOKEN, useAuthStore } from '@/store/auth-store';

type SignInForm = { email: string; password: string };

export default function SignInScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const palette = useThemePalette();
  const styles = useMemo(() => makeStyles(palette), [palette]);
  const { setAuth } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    variant: 'success' | 'error' | 'info';
  }>({ visible: false, message: '', variant: 'info' });

  const showToast = (
    message: string,
    variant: 'success' | 'error' | 'info' = 'info',
  ) => {
    setToast({ visible: true, message, variant });
  };

  const schema = useMemo(
    () =>
      z.object({
        email: z
          .string()
          .min(1, t('errors.required'))
          .email(t('errors.invalidEmail'))
          .refine(
            v => v.endsWith('@checkout.com'),
            t('errors.checkoutEmailOnly'),
          ),
        password: z.string().min(1, t('errors.required')),
      }),
    [t],
  );

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<SignInForm>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (_data: SignInForm) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    setAuth(MOCK_TOKEN, MOCK_MERCHANT);
    router.replace('/(tabs)');
  };

  const onFaceId = async () => {
    try {
      const ok = await isBiometricAuthenticated();
      if (ok) {
        setAuth(MOCK_TOKEN, MOCK_MERCHANT);
        router.replace('/(tabs)');
      }
    } catch (e) {
      const code = (e as { code?: string })?.code ?? '';
      if (
        code === 'BIOMETRICS_NOT_ENROLLED' ||
        String(e).includes('NOT_ENROLLED')
      ) {
        showToast(t('signIn.biometricNotEnrolled'), 'error');
      }
      // User cancelled — do nothing
    }
  };

  const onForgotPassword = () => {
    const email = getValues('email');
    if (!email || !email.endsWith('@checkout.com')) {
      showToast(t('signIn.forgotPasswordEnterEmail'), 'error');
      return;
    }
    Alert.alert(
      t('signIn.forgotPasswordConfirmTitle'),
      t('signIn.forgotPasswordConfirmBody', { email }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('signIn.forgotPasswordConfirmSend'),
          style: 'default',
          onPress: async () => {
            setForgotLoading(true);
            await new Promise(resolve => setTimeout(resolve, 900));
            setForgotLoading(false);
            showToast(t('signIn.forgotPasswordSent'), 'success');
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Toast
        message={toast.message}
        variant={toast.variant}
        visible={toast.visible}
        onDismiss={() => setToast(prev => ({ ...prev, visible: false }))}
      />

      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={16}
      >
        <View style={styles.header}>
          <ThemedText variant='h2' color={palette.white} style={styles.title}>
            {t('signIn.title')}
          </ThemedText>
          <ThemedText variant='body' color={palette.textMuted}>
            {t('signIn.subtitle')}
          </ThemedText>
        </View>

        <View style={styles.form}>
          {/* Email */}
          <Controller
            control={control}
            name='email'
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                inputType='email'
                label={t('signIn.emailLabel')}
                placeholder={t('signIn.emailPlaceholder')}
                returnKeyType='next'
                error={errors.email?.message}
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
              />
            )}
          />

          {/* Password with show/hide toggle */}
          <Controller
            control={control}
            name='password'
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                inputType='password'
                secureTextEntry={!showPassword}
                label={t('signIn.passwordLabel')}
                placeholder='••••••••'
                returnKeyType='go'
                onSubmitEditing={handleSubmit(onSubmit)}
                error={errors.password?.message}
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                rightAccessory={
                  <Pressable
                    onPress={() => setShowPassword(p => !p)}
                    hitSlop={8}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color={palette.textMuted}
                    />
                  </Pressable>
                }
              />
            )}
          />

          {/* Forgot password */}
          <Pressable
            onPress={onForgotPassword}
            disabled={forgotLoading}
            style={styles.forgotRow}
            hitSlop={8}
          >
            <ThemedText
              variant='bodySmall'
              color={forgotLoading ? palette.textMuted : Palette.ctaBlue}
            >
              {forgotLoading
                ? t('signIn.forgotPasswordSending')
                : t('signIn.forgotPassword')}
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.actions}>
          <Button
            label={t('signIn.cta')}
            onPress={handleSubmit(onSubmit)}
            fullWidth
            size='lg'
            loading={isSubmitting}
          />

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <ThemedText variant='caption' color={palette.textMuted}>
              {t('signIn.orSignInWith')}
            </ThemedText>
            <View style={styles.dividerLine} />
          </View>

          <Pressable
            onPress={onFaceId}
            style={[
              styles.faceIdButton,
              { borderColor: palette.surfaceElevated },
            ]}
          >
            <Ionicons name='scan-outline' size={20} color={palette.white} />
            <ThemedText variant='body' color={palette.white}>
              {t('signIn.faceId')}
            </ThemedText>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function makeStyles(p: ThemePalette) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: p.bgDark,
    },
    inner: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 48,
      paddingBottom: 16,
    },
    header: {
      gap: 8,
      marginBottom: 32,
    },
    title: {
      marginBottom: 4,
    },
    form: {
      gap: 20,
      marginBottom: 'auto',
    },
    forgotRow: {
      alignSelf: 'flex-end',
      marginTop: -8,
    },
    actions: {
      gap: 16,
    },
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    dividerLine: {
      flex: 1,
      height: StyleSheet.hairlineWidth,
      backgroundColor: p.surfaceElevated,
    },
    faceIdButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      paddingVertical: 16,
      borderRadius: 6,
      borderWidth: 1,
    },
  });
}
