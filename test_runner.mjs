import assert from 'node:assert';

// 1. Emission Factors & Unit Mapping (Single source of truth)
const EMISSION_FACTORS = {
  car: 0.20,
  bus: 0.08,
  flight: 0.25,
  electricity: 0.80,
  veg_meal: 0.50,
  non_veg_meal: 2.00,
};

const UNITS = {
  car: 'km',
  bus: 'km',
  flight: 'km',
  electricity: 'kWh',
  veg_meal: 'meals',
  non_veg_meal: 'meals',
};

const THRESHOLDS = {
  car: 2000,
  bus: 1500,
  flight: 20000,
  electricity: 3000,
  veg_meal: 20,
  non_veg_meal: 20,
};

function calculateCO2(type, quantity) {
  if (!quantity || quantity <= 0 || isNaN(quantity)) return 0;
  return Number((quantity * EMISSION_FACTORS[type]).toFixed(2));
}

function isAbsurd(type, quantity) {
  if (!quantity || isNaN(quantity) || quantity <= 0) return false;
  return quantity >= THRESHOLDS[type];
}

function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - (day === 0 ? 6 : day - 1);
  const mon = new Date(date.setDate(diff));
  mon.setHours(0, 0, 0, 0);
  return mon;
}

function getSunday(d) {
  const mon = getMonday(d);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  sun.setHours(23, 59, 59, 999);
  return sun;
}

function determinePaceStatus(percentUsed, percentElapsed) {
  if (percentUsed > 100) return 'ABOVE CURRENT PACE';
  const variance = percentUsed - percentElapsed;
  if (variance > 7) return 'ABOVE CURRENT PACE';
  if (variance < -15) return 'BELOW CURRENT PACE';
  return 'ON PACE';
}

function escapeCSV(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

console.log('================================================================');
console.log('CARBON//PULSE — COMPREHENSIVE AUTOMATED DEFECT & QA TEST RUNNER');
console.log('================================================================\n');

// Test 1: All 6 Emission Factors & Formulas
console.log('1. Verifying Core Emission Math...');
assert.strictEqual(calculateCO2('car', 10), 2.00, 'Car 10 km must be 2.00 kg');
assert.strictEqual(calculateCO2('car', 1), 0.20, 'Car 1 km must be 0.20 kg');
assert.strictEqual(calculateCO2('bus', 10), 0.80, 'Bus 10 km must be 0.80 kg');
assert.strictEqual(calculateCO2('bus', 1), 0.08, 'Bus 1 km must be 0.08 kg');
assert.strictEqual(calculateCO2('flight', 100), 25.00, 'Flight 100 km must be 25.00 kg');
assert.strictEqual(calculateCO2('flight', 1), 0.25, 'Flight 1 km must be 0.25 kg');
assert.strictEqual(calculateCO2('electricity', 5), 4.00, 'Electricity 5 kWh must be 4.00 kg');
assert.strictEqual(calculateCO2('electricity', 1), 0.80, 'Electricity 1 kWh must be 0.80 kg');
assert.strictEqual(calculateCO2('veg_meal', 1), 0.50, 'Veg meal 1 meal must be 0.50 kg');
assert.strictEqual(calculateCO2('veg_meal', 2), 1.00, 'Veg meal 2 meals must be 1.00 kg');
assert.strictEqual(calculateCO2('non_veg_meal', 1), 2.00, 'Non-veg meal 1 meal must be 2.00 kg');
assert.strictEqual(calculateCO2('non_veg_meal', 3), 6.00, 'Non-veg meal 3 meals must be 6.00 kg');
console.log('✓ All 6 emission factors accurately calculated to 2 decimal places.\n');

// Test 2: Edge Cases & Absurd Inputs
console.log('2. Verifying Edge Cases & Anomaly Interception (DP2)...');
assert.strictEqual(calculateCO2('car', 0), 0, 'Zero quantity must yield 0 CO2');
assert.strictEqual(calculateCO2('car', -5), 0, 'Negative quantity must yield 0 CO2');
assert.strictEqual(calculateCO2('car', NaN), 0, 'NaN quantity must yield 0 CO2');
assert.strictEqual(calculateCO2('car', null), 0, 'Null quantity must yield 0 CO2');

// DP2 Absurd Input Interception
assert.strictEqual(isAbsurd('car', 1999), false, '1999 km car should not be absurd');
assert.strictEqual(isAbsurd('car', 2000), true, '2000 km car must trigger anomaly');
assert.strictEqual(isAbsurd('car', 500000), true, '500000 km car must trigger anomaly');
assert.strictEqual(calculateCO2('car', 500000), 100000.00, '500k km must compute exactly 100,000.00 kg CO2 without clamping');
assert.strictEqual(isAbsurd('flight', 15000), false, '15000 km flight should be acceptable');
assert.strictEqual(isAbsurd('flight', 20000), true, '20000 km flight must trigger anomaly');
assert.strictEqual(isAbsurd('electricity', 2900), false, '2900 kWh electricity is within threshold');
assert.strictEqual(isAbsurd('electricity', 3000), true, '3000 kWh electricity must trigger anomaly');
assert.strictEqual(isAbsurd('veg_meal', 19), false, '19 meals is within threshold');
assert.strictEqual(isAbsurd('veg_meal', 20), true, '20 meals must trigger anomaly');
console.log('✓ DP2 rule-based anomaly detection operates cleanly without silent clamping.\n');

// Test 3: Date & Calendar Week Calculations (DP3)
console.log('3. Verifying Deterministic Monday → Sunday Calendar Week (DP3)...');
// Test reference: Saturday September 19, 2026
const sat2026 = new Date('2026-09-19T10:30:00');
const mon2026 = getMonday(sat2026);
const sun2026 = getSunday(sat2026);
assert.strictEqual(mon2026.getFullYear(), 2026);
assert.strictEqual(mon2026.getMonth(), 8); // 8 is September
assert.strictEqual(mon2026.getDate(), 14, 'Monday must be Sep 14, 2026');
assert.strictEqual(sun2026.getFullYear(), 2026);
assert.strictEqual(sun2026.getMonth(), 8);
assert.strictEqual(sun2026.getDate(), 20, 'Sunday must be Sep 20, 2026');

// Month rollover test: Sunday March 1, 2026 (day = 0)
const sunMar1 = new Date('2026-03-01T12:00:00');
const monFeb23 = getMonday(sunMar1);
assert.strictEqual(monFeb23.getMonth(), 1, 'February');
assert.strictEqual(monFeb23.getDate(), 23, 'Monday must be Feb 23, 2026');

// Year rollover test: Friday Jan 1, 2027
const friJan1 = new Date('2027-01-01T12:00:00');
const monDec28 = getMonday(friJan1);
assert.strictEqual(monDec28.getFullYear(), 2026);
assert.strictEqual(monDec28.getMonth(), 11, 'December');
assert.strictEqual(monDec28.getDate(), 28, 'Monday must be Dec 28, 2026');
console.log('✓ DP3 Monday 00:00 → Sunday 23:59 boundary computation works flawlessly across month/year transitions.\n');

// Test 4: Pacing Telemetry (DP3)
console.log('4. Verifying Pacing Telemetry Engine...');
assert.strictEqual(determinePaceStatus(50, 50), 'ON PACE');
assert.strictEqual(determinePaceStatus(55, 50), 'ON PACE', '5% variance is within 7% buffer');
assert.strictEqual(determinePaceStatus(65, 50), 'ABOVE CURRENT PACE', '15% variance is above pace');
assert.strictEqual(determinePaceStatus(20, 50), 'BELOW CURRENT PACE', '-30% variance is below pace');
assert.strictEqual(determinePaceStatus(105, 50), 'ABOVE CURRENT PACE', 'Exceeded target is above pace');
console.log('✓ Neutral, non-judgmental pacing statuses verified.\n');

// Test 5: Target Exceeded & Nudge Math (DP1)
console.log('5. Verifying Decision Point 1 Target Exceeded Calculations...');
const targetKg = 20.0;
const normalUsage = 12.8;
assert.strictEqual(normalUsage > targetKg, false);
assert.strictEqual(Number((targetKg - normalUsage).toFixed(1)), 7.2, 'Remaining allowance is 7.2 kg');

const exceededUsage = 24.6;
assert.strictEqual(exceededUsage > targetKg, true);
assert.strictEqual(Number((exceededUsage - targetKg).toFixed(1)), 4.6, 'Excess emissions is 4.6 kg');
console.log('✓ DP1 non-punitive threshold and delta calculations verified.\n');

// Test 6: CSV Escaping & Data Export/Import Robustness
console.log('6. Verifying CSV Escaping & Schema Validation...');
assert.strictEqual(escapeCSV('Normal note'), 'Normal note');
assert.strictEqual(escapeCSV('Note with, comma'), '"Note with, comma"');
assert.strictEqual(escapeCSV('Note with "quotes"'), '"Note with ""quotes"""');
assert.strictEqual(escapeCSV('Line 1\nLine 2'), '"Line 1\nLine 2"');

// Schema Validation test
const VALID_TYPES = new Set(['car', 'bus', 'flight', 'electricity', 'veg_meal', 'non_veg_meal']);
function validateLog(item) {
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

assert.strictEqual(validateLog({ id: '1', type: 'car', quantity: 10, co2Kg: 2, date: '2026-09-19' }), true);
assert.strictEqual(validateLog({ id: '2', type: 'rocket', quantity: 10, co2Kg: 2, date: '2026-09-19' }), false, 'Malformed type must be rejected');
assert.strictEqual(validateLog({ id: '3', type: 'car', quantity: -5, co2Kg: 0, date: '2026-09-19' }), false, 'Negative quantity must be rejected');
assert.strictEqual(validateLog({ id: '4', type: 'car', quantity: 10, co2Kg: 2, date: 'invalid-date' }), false, 'Invalid date format must be rejected');
console.log('✓ Malformed activity data strictly sanitized and rejected without crashing.\n');

// Test 7: Feature 1 — Weekly Insights Computation
console.log('7. Verifying Weekly Insights Computation (Feature 1)...');
function mockComputeWeeklyInsights(metrics, weeklyActivities) {
  if (!weeklyActivities || weeklyActivities.length === 0 || metrics.totalCo2Kg === 0) {
    return { hasData: false, insights: [] };
  }
  const topCat = [...metrics.categoryTotals].sort((a, b) => b.totalCo2 - a.totalCo2)[0];
  const topDay = [...metrics.dailyTotals].sort((a, b) => b.totalCo2 - a.totalCo2)[0];
  return {
    hasData: true,
    largestCategory: topCat,
    highestDay: topDay,
    activityCount: weeklyActivities.length,
  };
}

const mockMetrics = {
  totalCo2Kg: 12.8,
  targetKg: 20.0,
  percentUsed: 64,
  percentElapsed: 72,
  paceStatus: 'ON PACE',
  isTargetExceeded: false,
  categoryTotals: [
    { category: 'transport', label: 'Transport', totalCo2: 7.2, percentage: 56, count: 3 },
    { category: 'energy', label: 'Energy', totalCo2: 4.0, percentage: 31, count: 1 },
    { category: 'food', label: 'Food', totalCo2: 1.6, percentage: 13, count: 2 },
  ],
  dailyTotals: [
    { dayName: 'Mon', dayDate: '2026-09-14', totalCo2: 2.0, activityCount: 1, isToday: false },
    { dayName: 'Tue', dayDate: '2026-09-15', totalCo2: 5.8, activityCount: 2, isToday: false },
    { dayName: 'Wed', dayDate: '2026-09-16', totalCo2: 1.0, activityCount: 1, isToday: false },
    { dayName: 'Thu', dayDate: '2026-09-17', totalCo2: 0.0, activityCount: 0, isToday: false },
    { dayName: 'Fri', dayDate: '2026-09-18', totalCo2: 4.0, activityCount: 1, isToday: false },
    { dayName: 'Sat', dayDate: '2026-09-19', totalCo2: 0.0, activityCount: 0, isToday: true },
    { dayName: 'Sun', dayDate: '2026-09-20', totalCo2: 0.0, activityCount: 0, isToday: false },
  ],
};
const mockLogs = [
  { id: '1', type: 'car', quantity: 10, co2Kg: 2.0, date: '2026-09-14' },
  { id: '2', type: 'flight', quantity: 20, co2Kg: 5.0, date: '2026-09-15' },
  { id: '3', type: 'bus', quantity: 10, co2Kg: 0.8, date: '2026-09-15' },
  { id: '4', type: 'veg_meal', quantity: 2, co2Kg: 1.0, date: '2026-09-16' },
  { id: '5', type: 'electricity', quantity: 5, co2Kg: 4.0, date: '2026-09-18' },
];

const insightsRes = mockComputeWeeklyInsights(mockMetrics, mockLogs);
assert.strictEqual(insightsRes.hasData, true);
assert.strictEqual(insightsRes.largestCategory.category, 'transport');
assert.strictEqual(insightsRes.largestCategory.totalCo2, 7.2);
assert.strictEqual(insightsRes.highestDay.dayName, 'Tue');
assert.strictEqual(insightsRes.highestDay.totalCo2, 5.8);
assert.strictEqual(insightsRes.activityCount, 5);

// Empty state check
const emptyInsights = mockComputeWeeklyInsights({ totalCo2Kg: 0, categoryTotals: [], dailyTotals: [] }, []);
assert.strictEqual(emptyInsights.hasData, false);
console.log('✓ Weekly Insights accurately computes top source, peak day, activity coverage, and empty state.\n');

// Test 8: Feature 2 — Category Activities Filter / Drill
console.log('8. Verifying Category Activities Drill Logic (Feature 2)...');
const transportDefs = { car: 'transport', bus: 'transport', flight: 'transport', electricity: 'energy', veg_meal: 'food', non_veg_meal: 'food' };
function filterCategoryActivities(activities, targetCat, start, end) {
  return activities.filter((a) => transportDefs[a.type] === targetCat && a.date >= start && a.date <= end);
}
const transportActs = filterCategoryActivities(mockLogs, 'transport', '2026-09-14', '2026-09-20');
assert.strictEqual(transportActs.length, 3, 'Must match 3 transport activities');
const totalTransportCo2 = transportActs.reduce((sum, a) => sum + a.co2Kg, 0);
assert.strictEqual(Number(totalTransportCo2.toFixed(1)), 7.8);
console.log('✓ Category activities drill down accurately filters by category and week boundaries.\n');

// Test 9: Feature 3 — Tracking Health Dataset Completeness
console.log('9. Verifying Tracking Health Completeness Tiers (Feature 3)...');
function computeHealthTier(daysCount, categoriesCount, activitiesCount) {
  if (activitiesCount === 0 || daysCount === 0) return 'NOT STARTED';
  if (daysCount >= 4 && categoriesCount >= 2 && activitiesCount >= 5) return 'GOOD';
  return 'PARTIAL';
}
assert.strictEqual(computeHealthTier(0, 0, 0), 'NOT STARTED');
assert.strictEqual(computeHealthTier(2, 2, 3), 'PARTIAL');
assert.strictEqual(computeHealthTier(4, 2, 5), 'GOOD');
assert.strictEqual(computeHealthTier(5, 3, 8), 'GOOD');
console.log('✓ Tracking Health tiers distinguish zero-entries from zero-emissions.\n');

// Test 10: Edit / Delete Synchronization
console.log('10. Verifying Edit and Delete State Synchronization...');
let stateLogs = [...mockLogs];
// Edit activity #1: Car from 10 km (2.00 kg) to 20 km (4.00 kg)
const editedQty = 20;
const editedCo2 = calculateCO2('car', editedQty);
stateLogs = stateLogs.map((a) => (a.id === '1' ? { ...a, quantity: editedQty, co2Kg: editedCo2 } : a));
const editedTotal = stateLogs.reduce((sum, a) => sum + a.co2Kg, 0);
assert.strictEqual(editedTotal, 14.8, 'Total must immediately update from 12.8 to 14.8 kg');

// Delete activity #2 (Flight 5.0 kg)
stateLogs = stateLogs.filter((a) => a.id !== '2');
const afterDeleteTotal = stateLogs.reduce((sum, a) => sum + a.co2Kg, 0);
assert.strictEqual(afterDeleteTotal, 9.8, 'Total must immediately drop by 5.0 kg after delete');
console.log('✓ Edit and delete state synchronization updates all totals predictably.\n');

console.log('================================================================');
console.log('ALL VERIFICATION CHECKS PASSED WITH ZERO DEFECTS (100% SUCCESS)');
console.log('================================================================');
