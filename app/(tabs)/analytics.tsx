import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DateRangeFilter } from '@/components/analytics/date-range-filter';
import { PaymentMethodsChart } from '@/components/analytics/payment-methods-chart';
import { RegionalChart } from '@/components/analytics/regional-chart';
import { RevenueChart } from '@/components/analytics/revenue-chart';
import { SummaryCards } from '@/components/analytics/summary-cards';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { useAnalyticsData } from '@/hooks/use-analytics-data';
import { useThemePalette } from '@/hooks/use-theme-palette';
import { useTranslation } from '@/hooks/use-translation';
import { analytics } from '@/services/analytics';
import { useAnalyticsStore } from '@/store/analytics-store';

export default function AnalyticsScreen() {
  const { t } = useTranslation();
  const palette = useThemePalette();
  const { dateRange, setDateRange } = useAnalyticsStore();
  const { loading, error, summaryCards, trendData, typeBreakdown, refetch } =
    useAnalyticsData(dateRange);

  useEffect(() => {
    analytics.screen('analytics');
  }, []);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: palette.bgDark }]}
      edges={['top']}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText variant='h2' color={palette.white} style={styles.title}>
          {t('analytics.title')}
        </ThemedText>

        <DateRangeFilter value={dateRange} onChange={setDateRange} />

        {error ? (
          <View style={styles.errorState}>
            <ThemedText
              variant='body'
              color={palette.textMuted}
              style={styles.errorText}
            >
              {t('analytics.errorLoad')}
            </ThemedText>
            <Button
              label={t('common.retry')}
              onPress={() => {
                void refetch();
              }}
              variant='secondary'
              size='sm'
            />
          </View>
        ) : (
          <>
            <SummaryCards cards={summaryCards} loading={loading} />
            <RevenueChart
              data={trendData}
              range={dateRange}
              loading={loading}
            />
            <PaymentMethodsChart data={typeBreakdown} loading={loading} />
            <RegionalChart />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 20,
  },
  title: {
    marginBottom: 4,
  },
  errorState: {
    alignItems: 'center',
    gap: 12,
    paddingTop: 40,
  },
  errorText: {
    textAlign: 'center',
  },
});
