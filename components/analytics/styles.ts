import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

function makeSummaryCardsStyles() {
  return StyleSheet.create({
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    card: {
      flex: 1,
      minWidth: '45%',
      borderRadius: 16,
      padding: 16,
      gap: 8,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    iconCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    value: {
      marginTop: 4,
    },
    deltaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
  });
}

function makeRevenueChartStyles() {
  return StyleSheet.create({
    card: {
      borderRadius: 16,
      padding: 16,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    rangeLabel: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
  });
}

function makePaymentMethodsChartStyles() {
  return StyleSheet.create({
    card: {
      borderRadius: 16,
      padding: 16,
    },
    title: {
      marginBottom: 16,
    },
    chartRow: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
      minHeight: 180,
    },
    empty: {
      textAlign: 'center',
      paddingHorizontal: 16,
    },
    legend: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      minWidth: '45%',
    },
    legendDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
  });
}

function makeDateRangeFilterStyles() {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: 8,
    },
    pill: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
    },
  });
}

function makeRegionalChartStyles() {
  return StyleSheet.create({
    card: {
      borderRadius: 16,
      padding: 16,
      overflow: 'hidden',
    },
    title: {
      marginBottom: 16,
    },
  });
}

export function useAnalyticsStyles() {
  return useMemo(
    () => ({
      summaryCards: makeSummaryCardsStyles(),
      revenueChart: makeRevenueChartStyles(),
      paymentMethodsChart: makePaymentMethodsChartStyles(),
      dateRangeFilter: makeDateRangeFilterStyles(),
      regionalChart: makeRegionalChartStyles(),
    }),
    [],
  );
}
