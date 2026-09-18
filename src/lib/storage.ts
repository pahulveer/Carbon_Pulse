import type { ActivityLog, ActivityType } from '../types';
import { EMISSION_FACTORS, calculateCO2 } from './emissions';

const STORAGE_KEYS = {
  ACTIVITIES: 'carbon_pulse_activities_v1',
  WEEKLY_TARGET: 'carbon_pulse_target_v1',
  FIRST_RUN: 'carbon_pulse_initialized_v1',
};

const DEFAULT_TARGET_KG = 20.0;

const VALID_TYPES = new Set<string>(['car', 'bus', 'flight', 'electricity', 'veg_meal', 'non_veg_meal']);

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedLog?: ActivityLog;
}

/**
 * Validates whether a date string is a real, valid YYYY-MM-DD calendar date
 */
export function isValidISODate(dateStr: string): boolean {
  if (typeof dateStr !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [y, m, d] = dateStr.split('-').map(Number);
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;
  const date = new Date(y, m - 1, d);
  return (
    date.getFullYear() === y &&
    date.getMonth() === m - 1 &&
    date.getDate() === d
  );
}

/**
 * Validates an activity log candidate, ensuring structural validity and
 * mathematical integrity between activity type, quantity, and co2Kg (tolerance ±0.05 kg CO2).
 * Reconstructs the canonical ActivityLog with calculated CO2 and correct factor/unit.
 */
export function validateAndSanitizeActivityLog(obj: unknown, index?: number): ValidationResult {
  const prefix = index !== undefined ? `Record #${index + 1}: ` : '';
  if (!obj || typeof obj !== 'object') {
    return { isValid: false, error: `${prefix}Item must be a JSON object.` };
  }

  const item = obj as Record<string, unknown>;

  // Validate ID
  if (typeof item.id !== 'string' || item.id.trim() === '') {
    return { isValid: false, error: `${prefix}Missing or invalid 'id' string.` };
  }

  // Validate Activity Type
  if (typeof item.type !== 'string' || !VALID_TYPES.has(item.type)) {
    return {
      isValid: false,
      error: `${prefix}Invalid activity type '${String(item.type)}'. Allowed types: ${Array.from(VALID_TYPES).join(', ')}.`,
    };
  }
  const type = item.type as ActivityType;

  // Validate Quantity
  if (typeof item.quantity !== 'number' || isNaN(item.quantity) || !isFinite(item.quantity) || item.quantity <= 0) {
    return { isValid: false, error: `${prefix}Quantity must be a positive finite number.` };
  }

  // Validate Date
  if (typeof item.date !== 'string' || !isValidISODate(item.date)) {
    return { isValid: false, error: `${prefix}Date '${String(item.date)}' is not a valid YYYY-MM-DD calendar date.` };
  }

  // Validate co2Kg if provided: must mathematically match production calculation within 0.05 kg CO2
  const expectedCo2 = calculateCO2(type, item.quantity);
  if (typeof item.co2Kg === 'number' && !isNaN(item.co2Kg)) {
    if (Math.abs(item.co2Kg - expectedCo2) > 0.05) {
      return {
        isValid: false,
        error: `${prefix}Mathematical mismatch in co2Kg: provided ${item.co2Kg} kg, but ${item.quantity} ${type} calculates to ${expectedCo2} kg CO₂ (±0.05 tolerance exceeded).`,
      };
    }
  } else if (item.co2Kg !== undefined && item.co2Kg !== null) {
    return { isValid: false, error: `${prefix}Invalid co2Kg field.` };
  }

  // Unit and factor
  const defUnit = type === 'electricity' ? 'kWh' : type === 'veg_meal' || type === 'non_veg_meal' ? 'meals' : 'km';
  const factor = EMISSION_FACTORS[type];

  const sanitized: ActivityLog = {
    id: item.id.trim(),
    type,
    quantity: item.quantity,
    unit: (typeof item.unit === 'string' && item.unit.trim()) || defUnit,
    factor,
    co2Kg: expectedCo2, // Reconstruct canonical CO2 from production formula
    date: item.date,
    createdAt: typeof item.createdAt === 'number' && !isNaN(item.createdAt) ? item.createdAt : Date.now(),
    flaggedAsAbsurd: Boolean(item.flaggedAsAbsurd),
    notes: typeof item.notes === 'string' ? item.notes.slice(0, 200) : undefined,
  };

  return { isValid: true, sanitizedLog: sanitized };
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
    const sanitized: ActivityLog[] = [];
    for (const item of parsed) {
      const res = validateAndSanitizeActivityLog(item);
      if (res.isValid && res.sanitizedLog) {
        sanitized.push(res.sanitizedLog);
      }
    }
    return sanitized;
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
 * Import and merge activities safely, with rigorous mathematical validation
 */
export function importActivitiesFromJSON(jsonString: string): { success: boolean; count: number; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) {
      return { success: false, count: 0, error: 'File content must be a JSON array of activity objects.' };
    }
    if (parsed.length === 0) {
      return { success: false, count: 0, error: 'The provided JSON array is empty.' };
    }

    const sanitizedLogs: ActivityLog[] = [];
    for (let i = 0; i < parsed.length; i++) {
      const check = validateAndSanitizeActivityLog(parsed[i], i);
      if (!check.isValid) {
        return {
          success: false,
          count: 0,
          error: `Import rejected: ${check.error}`,
        };
      }
      if (check.sanitizedLog) {
        sanitizedLogs.push(check.sanitizedLog);
      }
    }

    const existing = loadActivities();
    const existingIds = new Set(existing.map((e) => e.id));
    const toAdd = sanitizedLogs.filter((v) => !existingIds.has(v.id));
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
