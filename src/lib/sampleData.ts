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
      { ...createActivityLog('car', 15, getDayDate(0), false, 'Morning office commute'), id: 'sample_bal_1' },
      { ...createActivityLog('veg_meal', 1, getDayDate(0), false, 'Plant-based lunch'), id: 'sample_bal_2' },
      { ...createActivityLog('bus', 12, getDayDate(1), false, 'City transit to library'), id: 'sample_bal_3' },
      { ...createActivityLog('electricity', 6, getDayDate(1), false, 'Evening home appliances'), id: 'sample_bal_4' },
      { ...createActivityLog('non_veg_meal', 1, getDayDate(2), false, 'Chicken dinner with colleagues'), id: 'sample_bal_5' },
      { ...createActivityLog('car', 7.5, getDayDate(3), false, 'Grocery run'), id: 'sample_bal_6' },
      { ...createActivityLog('veg_meal', 2, getDayDate(3), false, 'Home cooked meals'), id: 'sample_bal_7' },
    ];
  }

  if (scenario === 'exceeded') {
    // Total 25.45 kg CO2 (target 20 kg -> exceeded by 5.45 kg, triggers DP1)
    return [
      { ...createActivityLog('flight', 65, getDayDate(0), false, 'Regional flight for client meeting'), id: 'sample_exc_1' },
      { ...createActivityLog('car', 20, getDayDate(1), false, 'Airport transit shuttle'), id: 'sample_exc_2' },
      { ...createActivityLog('electricity', 4, getDayDate(1), false, 'Hotel room electronics'), id: 'sample_exc_3' },
      { ...createActivityLog('non_veg_meal', 1, getDayDate(2), false, 'Team dinner'), id: 'sample_exc_4' },
    ];
  }

  return [];
}
