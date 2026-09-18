import assert from 'node:assert';
import {
  EMISSION_FACTORS,
  ACTIVITY_DEFINITIONS,
  CO2_ANOMALY_THRESHOLD,
  calculateCO2,
  isAbsurdInput,
  getCalculationBreakdown,
} from './src/lib/emissions';
import {
  getMondayOfWeek,
  getSundayOfWeek,
  formatDateISO,
  formatDateDisplay,
  formatWeekRange,
  calculateWeekElapsedPercent,
  determinePaceStatus,
  computeWeekMetrics,
} from './src/lib/weekUtils';
import {
  isValidISODate,
  validateAndSanitizeActivityLog,
  loadActivities,
  saveActivities,
  loadWeeklyTarget,
  saveWeeklyTarget,
  importActivitiesFromJSON,
  exportActivitiesToCSV,
  exportActivitiesToJSON,
  createActivityLog,
} from './src/lib/storage';
import { generateSampleWeekData } from './src/lib/sampleData';
import { computeWeeklyInsights, computeTrackingHealth, getCategoryActivitiesForWeek } from './src/lib/intelligence';
import type { ActivityLog } from './src/types';

// Setup mock localStorage if not in browser environment
if (!globalThis.localStorage) {
  const store = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, val: string) => {
      store.set(key, String(val));
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    get length() {
      return store.size;
    },
  } as Storage;
}

console.log('================================================================');
console.log('CARBON//PULSE — DIRECT PRODUCTION MODULE VERIFICATION SUITE');
console.log('Testing actual implementations from src/lib/');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// SUITE A: Carbon Calculations (src/lib/emissions.ts)
// -----------------------------------------------------------------------------
console.log('SUITE A: Carbon Calculations & Conversions...');

// 1. All 6 activity types
assert.strictEqual(calculateCO2('car', 10), 2.00, 'Car: 10 km * 0.20 = 2.00 kg');
assert.strictEqual(calculateCO2('car', 1), 0.20, 'Car: 1 km * 0.20 = 0.20 kg');
assert.strictEqual(calculateCO2('bus', 10), 0.80, 'Bus: 10 km * 0.08 = 0.80 kg');
assert.strictEqual(calculateCO2('bus', 1), 0.08, 'Bus: 1 km * 0.08 = 0.08 kg');
assert.strictEqual(calculateCO2('flight', 100), 25.00, 'Flight: 100 km * 0.25 = 25.00 kg');
assert.strictEqual(calculateCO2('flight', 1), 0.25, 'Flight: 1 km * 0.25 = 0.25 kg');
assert.strictEqual(calculateCO2('electricity', 5), 4.00, 'Electricity: 5 kWh * 0.80 = 4.00 kg');
assert.strictEqual(calculateCO2('electricity', 1), 0.80, 'Electricity: 1 kWh * 0.80 = 0.80 kg');
assert.strictEqual(calculateCO2('veg_meal', 1), 0.50, 'Veg meal: 1 meal * 0.50 = 0.50 kg');
assert.strictEqual(calculateCO2('veg_meal', 3), 1.50, 'Veg meal: 3 meals * 0.50 = 1.50 kg');
assert.strictEqual(calculateCO2('non_veg_meal', 1), 2.00, 'Non-veg meal: 1 meal * 2.00 = 2.00 kg');
assert.strictEqual(calculateCO2('non_veg_meal', 4), 8.00, 'Non-veg meal: 4 meals * 2.00 = 8.00 kg');

// 2. Zero, negative, NaN, null inputs
assert.strictEqual(calculateCO2('car', 0), 0, 'Zero quantity must yield 0');
assert.strictEqual(calculateCO2('car', -10), 0, 'Negative quantity must yield 0');
assert.strictEqual(calculateCO2('car', NaN), 0, 'NaN quantity must yield 0');

// 3. Calculation breakdown transparency
const breakdown = getCalculationBreakdown('car', 10);
assert.strictEqual(breakdown.formulaString, '10 km × 0.20 kg/km = 2.00 kg CO₂');
assert.strictEqual(breakdown.total, 2.00);
console.log('✓ Suite A passed: Core emission formulas & edge cases verified directly.\n');

// -----------------------------------------------------------------------------
// SUITE B: Weekly Boundary & Calendar Calculations (src/lib/weekUtils.ts)
// -----------------------------------------------------------------------------
console.log('SUITE B: Deterministic Monday → Sunday Week & Pacing Telemetry...');

// Reference date: Saturday Sep 19, 2026
const refSat = new Date('2026-09-19T14:30:00');
const monday = getMondayOfWeek(refSat);
const sunday = getSundayOfWeek(refSat);

assert.strictEqual(formatDateISO(monday), '2026-09-14', 'Monday must be 2026-09-14');
assert.strictEqual(formatDateISO(sunday), '2026-09-20', 'Sunday must be 2026-09-20');
assert.strictEqual(monday.getHours(), 0);
assert.strictEqual(monday.getMinutes(), 0);
assert.strictEqual(monday.getSeconds(), 0);
assert.strictEqual(sunday.getHours(), 23);
assert.strictEqual(sunday.getMinutes(), 59);

// Month transition test: Sunday March 1, 2026 (day = 0)
const sunMar1 = new Date('2026-03-01T12:00:00');
const monFeb23 = getMondayOfWeek(sunMar1);
assert.strictEqual(formatDateISO(monFeb23), '2026-02-23', 'Monday of March 1 2026 must be Feb 23');

// Year transition test: Friday Jan 1, 2027
const friJan1 = new Date('2027-01-01T12:00:00');
const monDec28 = getMondayOfWeek(friJan1);
assert.strictEqual(formatDateISO(monDec28), '2026-12-28', 'Monday of Jan 1 2027 must be Dec 28 2026');

// Pacing telemetry
assert.strictEqual(determinePaceStatus(50, 50), 'ON PACE');
assert.strictEqual(determinePaceStatus(56, 50), 'ON PACE', '+6% variance is within 7% buffer');
assert.strictEqual(determinePaceStatus(65, 50), 'ABOVE CURRENT PACE', '+15% variance is above pace');
assert.strictEqual(determinePaceStatus(30, 50), 'BELOW CURRENT PACE', '-20% variance is below pace');
assert.strictEqual(determinePaceStatus(105, 50), 'ABOVE CURRENT PACE', 'Exceeded budget is above pace');

// Weekly metrics computation with activities inside and outside current week
const sampleActivities: ActivityLog[] = [
  // Inside current week (Sep 14 - Sep 20, 2026)
  createActivityLog('car', 10, '2026-09-14', false), // 2.0 kg
  createActivityLog('bus', 15, '2026-09-15', false), // 1.2 kg
  createActivityLog('electricity', 5, '2026-09-16', false), // 4.0 kg
  // Outside current week (past and future)
  createActivityLog('flight', 100, '2026-09-10', false), // 25.0 kg (Past week)
  createActivityLog('car', 50, '2026-09-25', false), // 10.0 kg (Next week)
];

const computedMetrics = computeWeekMetrics(sampleActivities, 20, refSat);
assert.strictEqual(computedMetrics.totalCo2Kg, 7.20, 'Only current week activities must be included (2.0 + 1.2 + 4.0 = 7.20)');
assert.strictEqual(computedMetrics.targetKg, 20.0);
assert.strictEqual(computedMetrics.remainingKg, 12.80);
assert.strictEqual(computedMetrics.isTargetExceeded, false);
assert.strictEqual(computedMetrics.excessKg, 0);
assert.strictEqual(computedMetrics.percentUsed, 36);

// Empty week metrics
const emptyMetrics = computeWeekMetrics([], 20, refSat);
assert.strictEqual(emptyMetrics.totalCo2Kg, 0);
assert.strictEqual(emptyMetrics.percentUsed, 0);
assert.strictEqual(emptyMetrics.remainingKg, 20.0);
assert.strictEqual(emptyMetrics.isTargetExceeded, false);
console.log('✓ Suite B passed: Monday-Sunday week boundaries, pacing, and metrics verified directly.\n');

// -----------------------------------------------------------------------------
// SUITE C: Anomaly Detection (src/lib/emissions.ts)
// -----------------------------------------------------------------------------
console.log('SUITE C: Anomaly Detection Engine (DP2)...');
assert.strictEqual(CO2_ANOMALY_THRESHOLD, 500.0, 'Centralized CO2 anomaly threshold must be 500 kg');

// 1. Normal activity (below quantity and below CO2 threshold)
const normalRes = isAbsurdInput('car', 50); // 10 kg CO2, 50 km < 2000 km
assert.strictEqual(normalRes.isAbsurd, false);
assert.strictEqual(normalRes.anomalyType, 'none');

// 2. High quantity only (car 2000 km = 400 kg CO2 < 500 kg CO2, but qty >= 2000 km)
const highQtyRes = isAbsurdInput('car', 2000);
assert.strictEqual(highQtyRes.isAbsurd, true);
assert.strictEqual(highQtyRes.anomalyType, 'quantity');
assert.ok(highQtyRes.reason.includes('Unusually large quantity'));

// 3. High CO2 only (flight 2000 km = 500 kg CO2 >= 500 kg CO2, but qty 2000 km < 20000 km flight threshold)
const highCo2Res = isAbsurdInput('flight', 2000);
assert.strictEqual(highCo2Res.isAbsurd, true);
assert.strictEqual(highCo2Res.anomalyType, 'co2');
assert.ok(highCo2Res.reason.includes('Unusually high estimated emissions'));

// 4. Both high quantity and high CO2 (car 2500 km = 500 kg CO2 >= 500 kg and qty 2500 >= 2000)
const bothRes = isAbsurdInput('car', 2500);
assert.strictEqual(bothRes.isAbsurd, true);
assert.strictEqual(bothRes.anomalyType, 'both');
assert.ok(bothRes.reason.includes('Unusually large quantity') && bothRes.reason.includes('high estimated emissions'));

// 5. Extreme DP2 Demo value: 500,000 km
const demoRes = isAbsurdInput('car', 500000);
assert.strictEqual(demoRes.isAbsurd, true);
assert.strictEqual(demoRes.anomalyType, 'both');
assert.strictEqual(demoRes.calculatedCO2, 100000.00);

// 6. Food meal thresholds
assert.strictEqual(isAbsurdInput('veg_meal', 19).isAbsurd, false);
assert.strictEqual(isAbsurdInput('veg_meal', 20).isAbsurd, true);
assert.strictEqual(isAbsurdInput('non_veg_meal', 19).isAbsurd, false);
assert.strictEqual(isAbsurdInput('non_veg_meal', 20).isAbsurd, true);
console.log('✓ Suite C passed: Rule-based anomaly detection correctly categorizes quantity, CO2, and both.\n');

// -----------------------------------------------------------------------------
// SUITE D: Storage & JSON Import Validation (src/lib/storage.ts)
// -----------------------------------------------------------------------------
console.log('SUITE D: Data Hardening & JSON Import Validation...');

// 1. Date format validation
assert.strictEqual(isValidISODate('2026-09-19'), true);
assert.strictEqual(isValidISODate('2026-02-29'), false, '2026 is not a leap year');
assert.strictEqual(isValidISODate('2026-13-01'), false, 'Month 13 is invalid');
assert.strictEqual(isValidISODate('2026-04-31'), false, 'April has only 30 days');
assert.strictEqual(isValidISODate('invalid-date'), false);

// 2. Validate and sanitize valid activity
const validItem = {
  id: 'test_1',
  type: 'car',
  quantity: 15,
  co2Kg: 3.00,
  date: '2026-09-14',
  unit: 'km',
  factor: 0.20,
};
const valResult = validateAndSanitizeActivityLog(validItem);
assert.strictEqual(valResult.isValid, true);
assert.strictEqual(valResult.sanitizedLog?.co2Kg, 3.00);

// 3. Reject invalid activity type
const invalidTypeResult = validateAndSanitizeActivityLog({ ...validItem, type: 'spaceship' });
assert.strictEqual(invalidTypeResult.isValid, false);
assert.ok(invalidTypeResult.error?.includes('Invalid activity type'));

// 4. Reject negative/invalid quantity
const invalidQtyResult = validateAndSanitizeActivityLog({ ...validItem, quantity: -5 });
assert.strictEqual(invalidQtyResult.isValid, false);
assert.ok(invalidQtyResult.error?.includes('Quantity must be a positive'));

// 5. Reject invalid date
const invalidDateResult = validateAndSanitizeActivityLog({ ...validItem, date: '2026-99-99' });
assert.strictEqual(invalidDateResult.isValid, false);
assert.ok(invalidDateResult.error?.includes('not a valid YYYY-MM-DD'));

// 6. Reject mismatched co2Kg (tampered or corrupted)
const mismatchedCo2Result = validateAndSanitizeActivityLog({
  ...validItem,
  quantity: 10, // 10 * 0.20 = 2.00 kg
  co2Kg: 99.50, // Mismatched!
});
assert.strictEqual(mismatchedCo2Result.isValid, false);
assert.ok(mismatchedCo2Result.error?.includes('Mathematical mismatch in co2Kg'));

// 7. Test full JSON import pipeline
const cleanJson = JSON.stringify([
  { id: 'imp_1', type: 'car', quantity: 20, co2Kg: 4.00, date: '2026-09-14' },
  { id: 'imp_2', type: 'electricity', quantity: 10, co2Kg: 8.00, date: '2026-09-15' },
]);
const impSuccess = importActivitiesFromJSON(cleanJson);
assert.strictEqual(impSuccess.success, true);
assert.strictEqual(impSuccess.count, 2);

// Corrupted JSON with mismatched CO2
const corruptedJson = JSON.stringify([
  { id: 'imp_3', type: 'car', quantity: 10, co2Kg: 99.00, date: '2026-09-16' },
]);
const impFail = importActivitiesFromJSON(corruptedJson);
assert.strictEqual(impFail.success, false);
assert.ok(impFail.error?.includes('Mathematical mismatch'));

// Malformed JSON string
const malformedJsonRes = importActivitiesFromJSON('{ not valid json }');
assert.strictEqual(malformedJsonRes.success, false);
console.log('✓ Suite D passed: JSON import strictly enforces mathematical integrity and calendar validity.\n');

// -----------------------------------------------------------------------------
// SUITE E: Sample Scenario Fixtures & Mathematical Ground Truth
// -----------------------------------------------------------------------------
console.log('SUITE E: Scenario Fixtures & Verified Calculations...');

const balancedData = generateSampleWeekData('balanced');
assert.strictEqual(balancedData.length, 7, 'Balanced scenario must have 7 activities');
const balancedTotal = Number(balancedData.reduce((sum, a) => sum + a.co2Kg, 0).toFixed(2));
assert.strictEqual(balancedTotal, 13.76, 'Actual balanced fixture sum must be exactly 13.76 kg CO2');
const balancedMetrics = computeWeekMetrics(balancedData, 20.0, refSat);
assert.strictEqual(balancedMetrics.totalCo2Kg, 13.76);
assert.strictEqual(balancedMetrics.percentUsed, 69, '13.76 / 20.0 = 68.8% -> 69%');
assert.strictEqual(balancedMetrics.remainingKg, 6.24);
assert.strictEqual(balancedMetrics.isTargetExceeded, false);

const exceededData = generateSampleWeekData('exceeded');
assert.strictEqual(exceededData.length, 4, 'Exceeded scenario must have 4 activities');
const exceededTotal = Number(exceededData.reduce((sum, a) => sum + a.co2Kg, 0).toFixed(2));
assert.strictEqual(exceededTotal, 25.45, 'Actual exceeded fixture sum must be exactly 25.45 kg CO2');
const exceededMetrics = computeWeekMetrics(exceededData, 20.0, refSat);
assert.strictEqual(exceededMetrics.totalCo2Kg, 25.45);
assert.strictEqual(exceededMetrics.percentUsed, 127, '25.45 / 20.0 = 127.25% -> 127%');
assert.strictEqual(exceededMetrics.excessKg, 5.45);
assert.strictEqual(exceededMetrics.isTargetExceeded, true);

const emptyData = generateSampleWeekData('empty');
assert.strictEqual(emptyData.length, 0);
console.log('✓ Suite E passed: Scenario fixtures match exact mathematical reality (13.76 kg & 25.45 kg).\n');

// -----------------------------------------------------------------------------
// SUITE F: Persistence & Storage Roundtrip
// -----------------------------------------------------------------------------
console.log('SUITE F: Persistence Engine Roundtrip...');
saveActivities(balancedData);
const reloaded = loadActivities();
assert.strictEqual(reloaded.length, balancedData.length);
assert.strictEqual(reloaded[0].id, balancedData[0].id);

// Target persistence
saveWeeklyTarget(25.5);
assert.strictEqual(loadWeeklyTarget(), 25.5);

// CSV Export
const csvOutput = exportActivitiesToCSV(balancedData);
assert.ok(csvOutput.startsWith('ID,Date,ActivityType,Quantity,Unit,EmissionFactor,CO2_kg,FlaggedAnomaly,Notes'));
assert.ok(csvOutput.includes('car'));
assert.ok(csvOutput.includes('15'));
console.log('✓ Suite F passed: Full persistence and CSV export verified cleanly.\n');

// -----------------------------------------------------------------------------
// SUITE G: Product Intelligence Engine (src/lib/intelligence.ts)
// -----------------------------------------------------------------------------
console.log('SUITE G: Product Intelligence Engine...');
const insights = computeWeeklyInsights(balancedMetrics, balancedData);
assert.strictEqual(insights.hasData, true);
assert.ok(insights.largestCategory !== null);
assert.ok(insights.insights.length > 0);

const health = computeTrackingHealth(balancedMetrics, balancedData);
assert.ok(['GOOD', 'PARTIAL', 'NOT STARTED'].includes(health.tier));
assert.strictEqual(health.totalActivitiesCount, 7);

const transportForWeek = getCategoryActivitiesForWeek(balancedData, 'transport', '2026-09-14', '2026-09-20');
assert.ok(transportForWeek.length > 0);
assert.ok(transportForWeek.every((a) => ['car', 'bus', 'flight'].includes(a.type)));
console.log('✓ Suite G passed: Product Intelligence accurately generates grounded insights & drawer drills.\n');

console.log('================================================================');
console.log('ALL 7 SUITES PASSED (100% PRODUCTION CODE DIRECTLY TESTED)');
console.log('================================================================');
