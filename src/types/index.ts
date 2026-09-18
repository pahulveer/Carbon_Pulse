export type ActivityType =
  | 'car'
  | 'bus'
  | 'flight'
  | 'electricity'
  | 'veg_meal'
  | 'non_veg_meal';

export type ActivityCategory = 'transport' | 'energy' | 'food';

export type ActivityUnit = 'km' | 'kWh' | 'meals';

export interface ActivityDefinition {
  id: ActivityType;
  label: string;
  category: ActivityCategory;
  factor: number; // kg CO₂ per unit
  unit: ActivityUnit;
  unitLabelSingular: string;
  unitLabelPlural: string;
  iconName: string;
  anomalyThreshold: number; // Threshold for DP2: Absurd Input detection
  suggestedStep: number;
  minVal: number;
  description: string;
}

export interface ActivityLog {
  id: string;
  type: ActivityType;
  quantity: number;
  unit: ActivityUnit;
  factor: number;
  co2Kg: number;
  date: string; // ISO format: YYYY-MM-DD
  createdAt: number; // timestamp ms
  notes?: string;
  flaggedAsAbsurd?: boolean;
}

export type PaceStatus = 'ON PACE' | 'ABOVE CURRENT PACE' | 'BELOW CURRENT PACE';

export interface WeekMetrics {
  weekStart: string; // YYYY-MM-DD (Monday)
  weekEnd: string; // YYYY-MM-DD (Sunday)
  weekRangeFormatted: string; // e.g. "15 Sep → 21 Sep"
  totalCo2Kg: number;
  targetKg: number;
  remainingKg: number;
  percentUsed: number;
  percentElapsed: number;
  paceStatus: PaceStatus;
  isTargetExceeded: boolean;
  excessKg: number;
  dailyTotals: {
    dayName: string; // Mon, Tue, etc.
    dayDate: string; // YYYY-MM-DD
    totalCo2: number;
    activityCount: number;
    isToday: boolean;
  }[];
  categoryTotals: {
    category: ActivityCategory;
    label: string;
    totalCo2: number;
    percentage: number;
    color: string;
    count: number;
  }[];
}

export interface FilterOptions {
  searchQuery: string;
  activityType: ActivityType | 'all';
  category: ActivityCategory | 'all';
  dateRange: 'all' | 'this_week' | 'last_week' | 'custom';
  customStartDate?: string;
  customEndDate?: string;
  sortBy: 'date_desc' | 'date_asc' | 'co2_desc' | 'co2_asc';
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  description?: string;
}
