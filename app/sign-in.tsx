import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { type ThemePalette, useThemePalette } from '@/hooks/use-theme-palette';
import { useTranslation } from '@/hooks/use-translation';

type SignInForm = { email: string };

export default function SignInScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const palette = useThemePalette();
  const styles = useMemo(() => makeStyles(palette), [palette]);

  const schema = useMemo(
    () =>
      z.object({
        email: z
          .string()
          .min(1, t('errors.required'))
          .email(t('errors.invalidEmail')),
      }),
    [t],
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInForm>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (_data: SignInForm) => {
    // Mock auth — any valid email succeeds
    await new Promise(resolve => setTimeout(resolve, 800));
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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
          <Controller
            control={control}
            name='email'
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                inputType='email'
                label={t('signIn.emailLabel')}
                placeholder={t('signIn.emailPlaceholder')}
                returnKeyType='go'
                onSubmitEditing={handleSubmit(onSubmit)}
                error={errors.email?.message}
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
              />
            )}
          />
        </View>

        <Button
          label={t('signIn.cta')}
          onPress={handleSubmit(onSubmit)}
          fullWidth
          size='lg'
          loading={isSubmitting}
        />
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
  });
}
