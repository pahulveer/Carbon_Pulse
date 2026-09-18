import type { ActivityCategory, ActivityLog, WeekMetrics } from '../types';
import { ACTIVITY_DEFINITIONS } from './emissions';
import { formatDateDisplay } from './weekUtils';

export interface WeeklyInsightItem {
  id: string;
  type: 'largest_source' | 'highest_day' | 'coverage' | 'target_pace';
  title: string;
  headline: string;
  detail: string;
  metricValue?: string;
  badge?: {
    label: string;
    variant: 'emerald' | 'amber' | 'rose' | 'sky';
  };
}

export interface WeeklyInsightsReport {
  hasData: boolean;
  insights: WeeklyInsightItem[];
  largestCategory: {
    category: ActivityCategory;
    label: string;
    totalCo2: number;
    percentage: number;
    color: string;
  } | null;
  highestDay: {
    dayName: string;
    dayDate: string;
    totalCo2: number;
    activityCount: number;
  } | null;
}

/**
 * Computes deterministic, grounded weekly insights purely from existing weekly metrics and logs.
 * Zero fabricated claims, zero external emissions assumptions, strictly neutral framing.
 */
export function computeWeeklyInsights(
  metrics: WeekMetrics,
  weeklyActivities: ActivityLog[]
): WeeklyInsightsReport {
  if (!weeklyActivities || weeklyActivities.length === 0 || metrics.totalCo2Kg === 0) {
    return {
      hasData: false,
      insights: [],
      largestCategory: null,
      highestDay: null,
    };
  }

  const insights: WeeklyInsightItem[] = [];

  // 1. Largest Emission Category
  const activeCategories = [...metrics.categoryTotals]
    .filter((c) => c.totalCo2 > 0)
    .sort((a, b) => b.totalCo2 - a.totalCo2);

  let largestCategoryData: WeeklyInsightsReport['largestCategory'] = null;

  if (activeCategories.length > 0) {
    const top = activeCategories[0];
    largestCategoryData = {
      category: top.category,
      label: top.label,
      totalCo2: top.totalCo2,
      percentage: top.percentage,
      color: top.color,
    };

    insights.push({
      id: 'largest_source',
      type: 'largest_source',
      title: 'PRIMARY EMISSION SOURCE',
      headline: `${top.label.toUpperCase()} IS YOUR LARGEST SOURCE`,
      detail: `${top.totalCo2.toFixed(1)} kg CO₂ represents ${top.percentage}% of your current weekly footprint across ${top.count} recorded ${top.count === 1 ? 'activity' : 'activities'}.`,
      metricValue: `${top.percentage}%`,
      badge: {
        label: `${top.totalCo2.toFixed(1)} kg`,
        variant: top.category === 'transport' ? 'sky' : top.category === 'energy' ? 'amber' : 'emerald',
      },
    });
  }

  // 2. Highest-Impact Day
  const activeDays = [...metrics.dailyTotals]
    .filter((d) => d.totalCo2 > 0)
    .sort((a, b) => b.totalCo2 - a.totalCo2);

  let highestDayData: WeeklyInsightsReport['highestDay'] = null;

  if (activeDays.length > 0) {
    const topDay = activeDays[0];
    highestDayData = {
      dayName: topDay.dayName,
      dayDate: topDay.dayDate,
      totalCo2: topDay.totalCo2,
      activityCount: topDay.activityCount,
    };

    insights.push({
      id: 'highest_day',
      type: 'highest_day',
      title: 'PEAK EMISSION DAY',
      headline: `${topDay.dayName.toUpperCase()} RECORDED HIGHEST IMPACT`,
      detail: `${topDay.totalCo2.toFixed(2)} kg CO₂ logged across ${topDay.activityCount} ${topDay.activityCount === 1 ? 'entry' : 'entries'} on ${formatDateDisplay(topDay.dayDate)}.`,
      metricValue: `${topDay.totalCo2.toFixed(1)} kg`,
      badge: {
        label: topDay.dayName,
        variant: 'amber',
      },
    });
  }

  // 3. Activity Coverage
  const count = weeklyActivities.length;
  insights.push({
    id: 'coverage',
    type: 'coverage',
    title: 'ACTIVITY LOGGING VOLUME',
    headline: `${count} ${count === 1 ? 'ACTIVITY' : 'ACTIVITIES'} RECORDED THIS WEEK`,
    detail: `Averaging ${(metrics.totalCo2Kg / count).toFixed(2)} kg CO₂ per entry across ${activeCategories.length} emission ${activeCategories.length === 1 ? 'category' : 'categories'}.`,
    metricValue: `${count}`,
    badge: {
      label: `${activeCategories.length} categories`,
      variant: 'emerald',
    },
  });

  // 4. Weekly Target Pace (DP3 Telemetry)
  let paceHeadline = 'CONSUMPTION IS PROPORTIONAL TO CALENDAR TIME';
  let paceVariant: 'emerald' | 'amber' | 'rose' | 'sky' = 'emerald';

  if (metrics.isTargetExceeded) {
    paceHeadline = 'WEEKLY TARGET EXCEEDED';
    paceVariant = 'rose';
  } else if (metrics.paceStatus === 'ABOVE CURRENT PACE') {
    paceHeadline = 'FOOTPRINT ACCELERATING AHEAD OF TIME';
    paceVariant = 'amber';
  } else if (metrics.paceStatus === 'BELOW CURRENT PACE') {
    paceHeadline = 'FOOTPRINT ACCUMULATING BELOW ELAPSED TIME';
    paceVariant = 'sky';
  }

  insights.push({
    id: 'target_pace',
    type: 'target_pace',
    title: 'BUDGET PACING TELEMETRY',
    headline: paceHeadline,
    detail: `${metrics.percentUsed}% of weekly ${metrics.targetKg.toFixed(1)} kg target used with ${metrics.percentElapsed}% of calendar week elapsed.`,
    metricValue: `${metrics.percentUsed}%`,
    badge: {
      label: metrics.paceStatus,
      variant: paceVariant,
    },
  });

  return {
    hasData: true,
    insights,
    largestCategory: largestCategoryData,
    highestDay: highestDayData,
  };
}

export type TrackingHealthTier = 'GOOD' | 'PARTIAL' | 'NOT STARTED';

export interface DayCoverageItem {
  dayName: string;
  dayDate: string;
  isToday: boolean;
  hasActivity: boolean;
  activityCount: number;
  totalCo2: number;
}

export interface TrackingHealthReport {
  tier: TrackingHealthTier;
  title: string;
  scoreLabel: string;
  daysCoveredCount: number;
  totalDays: number;
  categoriesTrackedCount: number;
  totalCategories: number;
  totalActivitiesCount: number;
  days: DayCoverageItem[];
  explanatoryNarrative: string;
}

/**
 * Computes tracking health to distinguish between zero recorded activity and zero actual emissions.
 * Evaluates dataset completeness strictly without passing lifestyle judgments.
 */
export function computeTrackingHealth(
  metrics: WeekMetrics,
  weeklyActivities: ActivityLog[]
): TrackingHealthReport {
  const totalActivitiesCount = weeklyActivities.length;
  const totalDays = 7;
  const totalCategories = 3; // Transport, Energy, Food

  const days: DayCoverageItem[] = metrics.dailyTotals.map((d) => ({
    dayName: d.dayName,
    dayDate: d.dayDate,
    isToday: d.isToday,
    hasActivity: d.activityCount > 0,
    activityCount: d.activityCount,
    totalCo2: d.totalCo2,
  }));

  const daysCoveredCount = days.filter((d) => d.hasActivity).length;
  const categoriesTrackedCount = metrics.categoryTotals.filter((c) => c.count > 0).length;

  if (totalActivitiesCount === 0 || daysCoveredCount === 0) {
    return {
      tier: 'NOT STARTED',
      title: 'DATASET NOT STARTED',
      scoreLabel: '0 / 7 DAYS RECORDED',
      daysCoveredCount: 0,
      totalDays,
      categoriesTrackedCount: 0,
      totalCategories,
      totalActivitiesCount: 0,
      days,
      explanatoryNarrative:
        'No activities have been logged for this week yet. Missing entries represent untracked days, not zero carbon impact. Start logging daily commutes or energy use to build your baseline.',
    };
  }

  // Determine completeness tier based on regular tracking frequency
  let tier: TrackingHealthTier = 'PARTIAL';
  let title = 'PARTIAL DATASET COVERAGE';
  let narrative =
    'Intermittent logging detected. Days with unrecorded activities do not imply zero emissions—they reflect gaps in personal telemetry. Log consistently for holistic weekly insights.';

  if (daysCoveredCount >= 4 && categoriesTrackedCount >= 2 && totalActivitiesCount >= 5) {
    tier = 'GOOD';
    title = 'ROBUST DATASET COVERAGE';
    narrative =
      'High tracking frequency across the calendar week. Multi-day coverage ensures your weekly telemetry closely mirrors your real lifestyle footprint rather than isolated events.';
  }

  return {
    tier,
    title,
    scoreLabel: `${daysCoveredCount} / ${totalDays} DAYS COVERED`,
    daysCoveredCount,
    totalDays,
    categoriesTrackedCount,
    totalCategories,
    totalActivitiesCount,
    days,
    explanatoryNarrative: narrative,
  };
}

/**
 * Filter and group activities belonging to a specific category for a target week
 */
export function getCategoryActivitiesForWeek(
  activities: ActivityLog[],
  category: ActivityCategory,
  mondayDateISO: string,
  sundayDateISO: string
): ActivityLog[] {
  return activities
    .filter((act) => {
      const def = ACTIVITY_DEFINITIONS[act.type];
      const isMatchCat = def && def.category === category;
      const isInWeek = act.date >= mondayDateISO && act.date <= sundayDateISO;
      return isMatchCat && isInWeek;
    })
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
}
