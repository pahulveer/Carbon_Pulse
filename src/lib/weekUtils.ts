import type { ActivityCategory, ActivityLog, PaceStatus, WeekMetrics } from '../types';
import { CATEGORY_METADATA } from './emissions';

/**
 * Returns the Monday (00:00:00.000) of the week containing the given date
 */
export function getMondayOfWeek(d: Date = new Date()): Date {
  const date = new Date(d);
  const day = date.getDay();
  // In JS: 0 is Sunday, 1 is Monday, ..., 6 is Saturday.
  // Monday diff: if day is 0 (Sunday), diff is -6; else diff is 1 - day
  const diff = date.getDate() - (day === 0 ? 6 : day - 1);
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * Returns the Sunday (23:59:59.999) of the week containing the given date
 */
export function getSundayOfWeek(d: Date = new Date()): Date {
  const monday = getMondayOfWeek(d);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return sunday;
}

/**
 * Format date to YYYY-MM-DD
 */
export function formatDateISO(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date to human readable e.g. "15 Sep"
 */
export function formatDateDisplay(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    }
  } catch {
    // fallback
  }
  return dateStr;
}

/**
 * Formats week range e.g. "15 Sep → 21 Sep"
 */
export function formatWeekRange(monday: Date, sunday: Date): string {
  const opt: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  const monStr = monday.toLocaleDateString('en-US', opt).toUpperCase();
  const sunStr = sunday.toLocaleDateString('en-US', opt).toUpperCase();
  return `${monStr} → ${sunStr}`;
}

/**
 * Calculates percentage of the current week that has elapsed (Monday 00:00 to Sunday 23:59)
 */
export function calculateWeekElapsedPercent(now: Date = new Date()): number {
  const monday = getMondayOfWeek(now);
  const sunday = getSundayOfWeek(now);
  const totalWeekMs = sunday.getTime() - monday.getTime();
  const elapsedMs = Math.min(Math.max(now.getTime() - monday.getTime(), 0), totalWeekMs);
  const pct = (elapsedMs / totalWeekMs) * 100;
  return Math.round(pct);
}

/**
 * Computes neutral, non-judgmental pace status based on % target used vs % week elapsed
 */
export function determinePaceStatus(percentUsed: number, percentElapsed: number): PaceStatus {
  // If target is already 100% or more, pace is above current pace
  if (percentUsed > 100) {
    return 'ABOVE CURRENT PACE';
  }

  // Allow a 7% variance window for balanced pacing
  const variance = percentUsed - percentElapsed;
  if (variance > 7) {
    return 'ABOVE CURRENT PACE';
  } else if (variance < -15) {
    return 'BELOW CURRENT PACE';
  } else {
    return 'ON PACE';
  }
}

/**
 * Computes all weekly metrics for the dashboard from logs and target
 */
export function computeWeekMetrics(
  logs: ActivityLog[],
  targetKg: number,
  referenceDate: Date = new Date()
): WeekMetrics {
  const monday = getMondayOfWeek(referenceDate);
  const sunday = getSundayOfWeek(referenceDate);
  const mondayStr = formatDateISO(monday);
  const sundayStr = formatDateISO(sunday);

  // Filter logs that fall within [mondayStr, sundayStr]
  const weekLogs = logs.filter((log) => log.date >= mondayStr && log.date <= sundayStr);

  const totalCo2Kg = Number(
    weekLogs.reduce((acc, curr) => acc + curr.co2Kg, 0).toFixed(2)
  );

  const percentUsed = targetKg > 0 ? Math.round((totalCo2Kg / targetKg) * 100) : 0;
  const percentElapsed = calculateWeekElapsedPercent(referenceDate);
  const paceStatus = determinePaceStatus(percentUsed, percentElapsed);

  const isTargetExceeded = totalCo2Kg > targetKg;
  const excessKg = isTargetExceeded ? Number((totalCo2Kg - targetKg).toFixed(2)) : 0;
  const remainingKg = isTargetExceeded ? 0 : Number((targetKg - totalCo2Kg).toFixed(2));

  // Build 7-day Monday -> Sunday daily totals
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayISO = formatDateISO(referenceDate);

  const dailyTotals = dayNames.map((dayName, idx) => {
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + idx);
    const dayISO = formatDateISO(dayDate);

    const dayLogs = weekLogs.filter((l) => l.date === dayISO);
    const dayCo2 = Number(dayLogs.reduce((acc, curr) => acc + curr.co2Kg, 0).toFixed(2));

    return {
      dayName,
      dayDate: dayISO,
      totalCo2: dayCo2,
      activityCount: dayLogs.length,
      isToday: dayISO === todayISO,
    };
  });

  // Category breakdowns
  const categories: ActivityCategory[] = ['transport', 'energy', 'food'];
  const categoryTotals = categories.map((cat) => {
    const meta = CATEGORY_METADATA[cat];
    // Map logs to categories
    const catLogs = weekLogs.filter((l) => {
      if (cat === 'transport') return ['car', 'bus', 'flight'].includes(l.type);
      if (cat === 'energy') return l.type === 'electricity';
      if (cat === 'food') return ['veg_meal', 'non_veg_meal'].includes(l.type);
      return false;
    });

    const catCo2 = Number(catLogs.reduce((acc, curr) => acc + curr.co2Kg, 0).toFixed(2));
    const percentage = totalCo2Kg > 0 ? Math.round((catCo2 / totalCo2Kg) * 100) : 0;

    return {
      category: cat,
      label: meta.label,
      totalCo2: catCo2,
      percentage,
      color: meta.color,
      count: catLogs.length,
    };
  });

  return {
    weekStart: mondayStr,
    weekEnd: sundayStr,
    weekRangeFormatted: formatWeekRange(monday, sunday),
    totalCo2Kg,
    targetKg,
    remainingKg,
    percentUsed,
    percentElapsed,
    paceStatus,
    isTargetExceeded,
    excessKg,
    dailyTotals,
    categoryTotals,
  };
}
