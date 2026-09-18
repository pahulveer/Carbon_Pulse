import type { ActivityLog } from '../types';
import { createActivityLog } from './storage';
import { formatDateISO, getMondayOfWeek } from './weekUtils';

/**
 * Generates sample data tailored to the current week
 */
export function generateSampleWeekData(scenario: 'balanced' | 'exceeded' | 'empty'): ActivityLog[] {
  if (scenario === 'empty') return [];

  const now = new Date();
  const monday = getMondayOfWeek(now);

  const getDayDate = (offsetDays: number): string => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + offsetDays);
    return formatDateISO(d);
  };

  if (scenario === 'balanced') {
    // Total 13.76 kg CO2 (target 20 kg -> 69% used, 6.24 kg safe remaining)
    return [
      createActivityLog('car', 15, getDayDate(0), false, 'Morning office commute'), // 15 * 0.2 = 3.0 kg
      createActivityLog('veg_meal', 1, getDayDate(0), false, 'Plant-based lunch'), // 1 * 0.5 = 0.5 kg
      createActivityLog('bus', 12, getDayDate(1), false, 'City transit to library'), // 12 * 0.08 = 0.96 kg
      createActivityLog('electricity', 6, getDayDate(1), false, 'Evening home appliances'), // 6 * 0.8 = 4.8 kg
      createActivityLog('non_veg_meal', 1, getDayDate(2), false, 'Chicken dinner with colleagues'), // 1 * 2.0 = 2.0 kg
      createActivityLog('car', 7.5, getDayDate(3), false, 'Grocery run'), // 7.5 * 0.2 = 1.50 kg
      createActivityLog('veg_meal', 2, getDayDate(3), false, 'Home cooked meals'), // 2 * 0.5 = 1.0 kg
    ];
  }

  if (scenario === 'exceeded') {
    // Total 25.45 kg CO2 (target 20 kg -> exceeded by 5.45 kg, triggers DP1)
    return [
      createActivityLog('flight', 65, getDayDate(0), false, 'Regional flight for client meeting'), // 65 * 0.25 = 16.25 kg
      createActivityLog('car', 20, getDayDate(1), false, 'Airport transit shuttle'), // 20 * 0.2 = 4.0 kg
      createActivityLog('electricity', 4, getDayDate(1), false, 'Hotel room electronics'), // 4 * 0.8 = 3.2 kg
      createActivityLog('non_veg_meal', 1, getDayDate(2), false, 'Team dinner'), // 1 * 2.0 = 2.0 kg
    ];
  }

  return [];
}
