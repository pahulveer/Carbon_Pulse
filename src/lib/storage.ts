import type { ActivityLog, ActivityType } from '../types';
import { EMISSION_FACTORS, calculateCO2 } from './emissions';

const STORAGE_KEYS = {
  ACTIVITIES: 'carbon_pulse_activities_v1',
  WEEKLY_TARGET: 'carbon_pulse_target_v1',
  FIRST_RUN: 'carbon_pulse_initialized_v1',
};

const DEFAULT_TARGET_KG = 20.0;

const VALID_TYPES = new Set<string>(['car', 'bus', 'flight', 'electricity', 'veg_meal', 'non_veg_meal']);

/**
 * Validates whether an object conforms to ActivityLog structure
 */
function isValidActivityLog(obj: unknown): obj is ActivityLog {
  if (!obj || typeof obj !== 'object') return false;
  const item = obj as Record<string, unknown>;
  return (
    typeof item.id === 'string' &&
    typeof item.type === 'string' &&
    VALID_TYPES.has(item.type) &&
    typeof item.quantity === 'number' &&
    !isNaN(item.quantity) &&
    item.quantity > 0 &&
    typeof item.co2Kg === 'number' &&
    !isNaN(item.co2Kg) &&
    item.co2Kg >= 0 &&
    typeof item.date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(item.date)
  );
}

/**
 * Loads activities safely from localStorage
 */
export function loadActivities(): ActivityLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.warn('[CARBON//PULSE] Stored activities is not an array, resetting to empty.');
      return [];
    }
    // Filter and sanitize valid entries
    return parsed.filter(isValidActivityLog);
  } catch (err) {
    console.error('[CARBON//PULSE] Failed to load activities from localStorage:', err);
    return [];
  }
}

/**
 * Saves activities safely to localStorage
 */
export function saveActivities(activities: ActivityLog[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
    return true;
  } catch (err) {
    console.error('[CARBON//PULSE] Failed to save activities to localStorage:', err);
    return false;
  }
}

/**
 * Loads user-defined weekly target from localStorage
 */
export function loadWeeklyTarget(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WEEKLY_TARGET);
    if (raw === null) return DEFAULT_TARGET_KG;
    const val = parseFloat(raw);
    if (isNaN(val) || val <= 0) return DEFAULT_TARGET_KG;
    return Number(val.toFixed(1));
  } catch (err) {
    console.error('[CARBON//PULSE] Failed to load target from localStorage:', err);
    return DEFAULT_TARGET_KG;
  }
}

/**
 * Saves user-defined weekly target
 */
export function saveWeeklyTarget(targetKg: number): boolean {
  try {
    const safeTarget = Math.max(1, Number(targetKg.toFixed(1)));
    localStorage.setItem(STORAGE_KEYS.WEEKLY_TARGET, safeTarget.toString());
    return true;
  } catch (err) {
    console.error('[CARBON//PULSE] Failed to save target to localStorage:', err);
    return false;
  }
}

/**
 * Check if app has been initialized before
 */
export function isAppInitialized(): boolean {
  return localStorage.getItem(STORAGE_KEYS.FIRST_RUN) === 'true';
}

export function markAppInitialized(): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FIRST_RUN, 'true');
  } catch {
    // ignore
  }
}

function escapeCSV(val: unknown): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Export activities to CSV string
 */
export function exportActivitiesToCSV(activities: ActivityLog[]): string {
  const headers = ['ID', 'Date', 'ActivityType', 'Quantity', 'Unit', 'EmissionFactor', 'CO2_kg', 'FlaggedAnomaly', 'Notes'];
  const rows = activities.map((a) => [
    escapeCSV(a.id),
    escapeCSV(a.date),
    escapeCSV(a.type),
    escapeCSV(a.quantity),
    escapeCSV(a.unit),
    escapeCSV(a.factor),
    escapeCSV(a.co2Kg),
    escapeCSV(a.flaggedAsAbsurd ? 'YES' : 'NO'),
    escapeCSV(a.notes || ''),
  ]);
  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Export activities to JSON string
 */
export function exportActivitiesToJSON(activities: ActivityLog[]): string {
  return JSON.stringify(activities, null, 2);
}

/**
 * Import and merge activities safely
 */
export function importActivitiesFromJSON(jsonString: string): { success: boolean; count: number; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) {
      return { success: false, count: 0, error: 'File content must be a JSON array of activity objects.' };
    }
    const valid = parsed.filter(isValidActivityLog);
    if (valid.length === 0) {
      return { success: false, count: 0, error: 'No valid activity records found in JSON.' };
    }
    const existing = loadActivities();
    const existingIds = new Set(existing.map((e) => e.id));
    const toAdd = valid.filter((v) => !existingIds.has(v.id));
    const merged = [...existing, ...toAdd];
    saveActivities(merged);
    return { success: true, count: toAdd.length };
  } catch (err) {
    return { success: false, count: 0, error: (err as Error).message || 'Invalid JSON format' };
  }
}

/**
 * Helper to build a new ActivityLog entry
 */
export function createActivityLog(
  type: ActivityType,
  quantity: number,
  date: string,
  flaggedAsAbsurd = false,
  notes?: string
): ActivityLog {
  const factor = EMISSION_FACTORS[type];
  const co2Kg = calculateCO2(type, quantity);
  const unit = type === 'electricity' ? 'kWh' : type === 'veg_meal' || type === 'non_veg_meal' ? 'meals' : 'km';

  return {
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    type,
    quantity,
    unit,
    factor,
    co2Kg,
    date,
    createdAt: Date.now(),
    flaggedAsAbsurd,
    notes,
  };
}
