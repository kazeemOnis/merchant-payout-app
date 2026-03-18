import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActivitySection } from '@/components/home/activity-section';
import { BalanceCards } from '@/components/home/balance-card';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { useMerchant } from '@/hooks/use-merchant';
import { useThemePalette } from '@/hooks/use-theme-palette';
import { useTranslation } from '@/hooks/use-translation';

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const palette = useThemePalette();
  const styles = useMemo(() => makeStyles(palette), [palette]);
  const { data, loading, error, refetch } = useMerchant();

  const handleViewAll = () => router.push('/modal');

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <ThemedText
            variant='body'
            color={palette.textMuted}
            style={styles.errorText}
          >
            {t('home.errorBalance')}
          </ThemedText>
          <Button label={t('common.retry')} onPress={refetch} size='md' />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText variant='h2' color={palette.white} style={styles.title}>
          {t('home.title')}
        </ThemedText>

        <BalanceCards
          available={data?.available_balance ?? 0}
          pending={data?.pending_balance ?? 0}
          currency={data?.currency ?? 'GBP'}
          loading={loading}
        />

        <ActivitySection
          items={data?.activity ?? []}
          currency={data?.currency ?? 'GBP'}
          loading={loading}
          onViewAll={handleViewAll}
          testID='activity-section'
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(p: ReturnType<typeof useThemePalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: p.bgDark },
    scroll: { flex: 1 },
    content: {
      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: 32,
      gap: 20,
    },
    title: { marginBottom: 4 },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 16,
      padding: 24,
    },
    errorText: { textAlign: 'center' },
  });
}
