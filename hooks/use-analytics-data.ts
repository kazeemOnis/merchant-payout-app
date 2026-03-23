import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { getActivity } from '@/services/api';
import type { DateRange } from '@/store/analytics-store';
import type { ActivityItem, ActivityType } from '@/types/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SummaryCard = {
  id: string;
  labelKey: string;
  value: string;
  delta: string;
  positive: boolean;
  iconName: string;
  iconColor: string;
};

export type TrendPoint = {
  value: number;
  label: string;
};

export type TypeBreakdownSlice = {
  type: ActivityType;
  labelKey: string;
  count: number;
  percent: number;
  color: string;
};

export type RegionalBar = {
  value: number;
  label: string;
  frontColor: string;
};

// ─── Static data (no field in API model) ──────────────────────────────────────

export const REGIONAL_DATA: RegionalBar[] = [
  { value: 125000, label: 'UK', frontColor: '#186aff' },
  { value: 90000, label: 'EU', frontColor: '#186aff' },
  { value: 70000, label: 'US', frontColor: '#186aff' },
  { value: 40000, label: 'Asia', frontColor: '#186aff' },
  { value: 25000, label: 'Other', frontColor: '#186aff' },
];

const TYPE_CONFIG: Record<ActivityType, { labelKey: string; color: string }> = {
  deposit: { labelKey: 'analytics.typeDeposit', color: '#186aff' },
  payout: { labelKey: 'analytics.typePayout', color: '#4098ff' },
  refund: { labelKey: 'analytics.typeRefund', color: '#ffc4b7' },
  fee: { labelKey: 'analytics.typeFee', color: '#424249' },
};

// ─── Trend bucketing ───────────────────────────────────────────────────────────

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

/** Returns the bucket label key for a given item date + range. */
function bucketKey(date: Date, range: DateRange): string {
  switch (range) {
    case '24h': {
      const slot = Math.floor(date.getHours() / 4) * 4;
      return `${String(slot).padStart(2, '0')}:00`;
    }
    case '7d':
      return DAYS[date.getDay()];
    case '30d':
      return `W${Math.ceil(date.getDate() / 7)}`;
    case '90d':
    case '1y':
      return MONTHS[date.getMonth()];
  }
}

/** Generates all ordered bucket labels for a given range, anchored to `now`. */
function generateBuckets(range: DateRange, now: Date): string[] {
  switch (range) {
    case '24h':
      return ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];
    case '7d': {
      const labels: string[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        labels.push(DAYS[d.getDay()]);
      }
      return labels;
    }
    case '30d':
      return ['W1', 'W2', 'W3', 'W4'];
    case '90d': {
      const labels: string[] = [];
      for (let i = 2; i >= 0; i--) {
        const d = new Date(now);
        d.setMonth(d.getMonth() - i);
        labels.push(MONTHS[d.getMonth()]);
      }
      return labels;
    }
    case '1y': {
      const labels: string[] = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now);
        d.setMonth(d.getMonth() - i);
        labels.push(MONTHS[d.getMonth()]);
      }
      return labels;
    }
  }
}

/** Buckets deposit amounts (in pence) into ordered TrendPoints (in whole £). */
function buildTrendData(items: ActivityItem[], range: DateRange): TrendPoint[] {
  const now = new Date();
  const buckets = generateBuckets(range, now);
  const sums: Record<string, number> = Object.fromEntries(
    buckets.map(b => [b, 0]),
  );

  for (const item of items) {
    if (item.type !== 'deposit') continue;
    const key = bucketKey(new Date(item.date), range);
    if (key in sums) sums[key] += item.amount;
  }

  return buckets.map(label => ({
    label,
    value: Math.round(sums[label] / 100),
  }));
}

/** Derives the count + percent breakdown per ActivityType. */
function buildTypeBreakdown(items: ActivityItem[]): TypeBreakdownSlice[] {
  const counts: Record<ActivityType, number> = {
    deposit: 0,
    payout: 0,
    refund: 0,
    fee: 0,
  };
  for (const item of items) counts[item.type]++;
  const total = items.length || 1;

  return (Object.entries(counts) as [ActivityType, number][])
    .filter(([, count]) => count > 0)
    .map(([type, count]) => ({
      type,
      ...TYPE_CONFIG[type],
      count,
      percent: Math.round((count / total) * 100),
    }));
}

// ─── Fetch (via service) ──────────────────────────────────────────────────────

const RANGE_DAYS: Record<DateRange, number> = {
  '24h': 1,
  '7d': 7,
  '30d': 30,
  '90d': 90,
  '1y': 365,
};

function rangeCutoff(range: DateRange): Date {
  const d = new Date();
  d.setDate(d.getDate() - RANGE_DAYS[range]);
  return d;
}

/** Exhausts cursor pagination and returns only items within the range window. */
async function fetchAllActivity(range: DateRange): Promise<ActivityItem[]> {
  const cutoff = rangeCutoff(range);
  const items: ActivityItem[] = [];
  let cursor: string | null = null;

  while (true) {
    const page = await getActivity({ limit: 50, cursor });

    let reachedCutoff = false;
    for (const item of page.items) {
      if (new Date(item.date) < cutoff) {
        reachedCutoff = true;
        break;
      }
      items.push(item);
    }

    if (!page.has_more || reachedCutoff) break;
    cursor = page.next_cursor;
  }

  return items;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAnalyticsData(range: DateRange) {
  const {
    data: items = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['analytics-activity', range] as const,
    queryFn: () => fetchAllActivity(range),
    staleTime: 60_000, // analytics can tolerate 1 min staleness
  });

  const summaryCards = useMemo<SummaryCard[]>(() => {
    const deposits = items.filter(i => i.type === 'deposit');
    const totalRevenuePence = deposits.reduce((sum, i) => sum + i.amount, 0);
    const totalCount = items.length;
    const completedCount = items.filter(i => i.status === 'completed').length;
    const successRate =
      totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    const revenueGBP = totalRevenuePence / 100;
    const revenueFormatted =
      revenueGBP >= 1000
        ? `£${(revenueGBP / 1000).toFixed(0)}k`
        : `£${revenueGBP.toFixed(0)}`;

    return [
      {
        id: 'revenue',
        labelKey: 'analytics.revenue',
        value: revenueFormatted,
        delta: '+18.2%',
        positive: true,
        iconName: 'cash-outline',
        iconColor: '#186aff',
      },
      {
        id: 'transactions',
        labelKey: 'analytics.transactions',
        value: totalCount.toLocaleString(),
        delta: '+12.5%',
        positive: true,
        iconName: 'card-outline',
        iconColor: '#7c3aed',
      },
      {
        id: 'successRate',
        labelKey: 'analytics.successRate',
        value: `${successRate.toFixed(1)}%`,
        delta: '+2.1%',
        positive: true,
        iconName: 'trending-up-outline',
        iconColor: '#16a34a',
      },
      {
        id: 'countries',
        labelKey: 'analytics.countries',
        value: '42',
        delta: '+3',
        positive: true,
        iconName: 'globe-outline',
        iconColor: '#ea580c',
      },
    ];
  }, [items]);

  const trendData = useMemo(() => buildTrendData(items, range), [items, range]);
  const typeBreakdown = useMemo(() => buildTypeBreakdown(items), [items]);

  return {
    loading: isLoading,
    error: error ? (error as Error).message : null,
    summaryCards,
    trendData,
    typeBreakdown,
    refetch,
  };
}
