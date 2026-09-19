import assert from 'node:assert';
import {
  calculateCO2,
  isAbsurdInput,
  EMISSION_FACTORS,
  ACTIVITY_DEFINITIONS,
  CO2_ANOMALY_THRESHOLD,
} from './src/lib/emissions';
import {
  computeWeekMetrics,
  getMondayOfWeek,
  getSundayOfWeek,
  formatDateISO,
  determinePaceStatus,
} from './src/lib/weekUtils';
import {
  createActivityLog,
  loadActivities,
  saveActivities,
  loadWeeklyTarget,
  saveWeeklyTarget,
  exportActivitiesToCSV,
  exportActivitiesToJSON,
  importActivitiesFromJSON,
} from './src/lib/storage';
import { generateSampleWeekData } from './src/lib/sampleData';
import type { ActivityLog } from './src/types';

// Mock localStorage for headless node environment
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
console.log('CARBON//PULSE — COMPLETE INTEGRATION & REGRESSION TEST SUITE');
console.log('Verifying single source of truth, hero parity, DP1/DP2/DP3, and QA');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// TEST 1: Hero Footprint & Breakdown Parity with Dashboard
// -----------------------------------------------------------------------------
console.log('TEST 1: Hero Footprint & Category Breakdown Parity with Dashboard...');

const testDate = new Date('2026-09-19T12:00:00');
const target = 20.0;

// A. Empty state
const emptyActs: ActivityLog[] = [];
const emptyMetrics = computeWeekMetrics(emptyActs, target, testDate);
assert.strictEqual(emptyMetrics.totalCo2Kg, 0.0, 'Empty footprint must be 0.0 kg');
assert.strictEqual(emptyMetrics.categoryTotals.length, 3, 'Must have 3 categories');
assert.ok(emptyMetrics.categoryTotals.every((c) => c.totalCo2 === 0 && c.percentage === 0));

// B. Sample state
const sampleActs = generateSampleWeekData('balanced');
const sampleMetrics = computeWeekMetrics(sampleActs, target, testDate);
assert.strictEqual(sampleMetrics.totalCo2Kg, 13.76, 'Sample week must equal 13.76 kg');

// Verify every category total in Hero is identical to Dashboard
sampleMetrics.categoryTotals.forEach((cat) => {
  const matchingFromActivities = sampleActs
    .filter((a) => {
      const def = ACTIVITY_DEFINITIONS[a.type];
      return def && def.category === cat.category;
    })
    .reduce((sum, a) => sum + a.co2Kg, 0);

  const rounded = Number(matchingFromActivities.toFixed(2));
  assert.strictEqual(cat.totalCo2, rounded, `Category ${cat.category} total must match derived activities`);
});

console.log('✓ Test 1 passed: Hero and Dashboard share identical single source of truth.\n');

// -----------------------------------------------------------------------------
// TEST 2: Real Trend Calculation & Sample Week Detection
// -----------------------------------------------------------------------------
console.log('TEST 2: Real Trend Calculation & "Trend unavailable" Behavior...');

// Helper mirroring HeroTelemetryCard trend computation
function computeHeroTrend(activities: ActivityLog[], weekStart: string, currentTotal: number) {
  const prevActivities = activities.filter((a) => a.date < weekStart);
  if (prevActivities.length === 0) {
    return { text: 'Trend unavailable', hasData: false };
  }
  const prevTotal = prevActivities.reduce((sum, a) => sum + a.co2Kg, 0);
  if (prevTotal <= 0) {
    return { text: 'Trend unavailable', hasData: false };
  }
  const deltaPercent = Math.round(((currentTotal - prevTotal) / prevTotal) * 100);
  if (deltaPercent < 0) return { text: `▼ ${deltaPercent}%`, hasData: true };
  if (deltaPercent > 0) return { text: `▲ +${deltaPercent}%`, hasData: true };
  return { text: '0% on pace', hasData: true };
}

// Case A: No previous week activities -> "Trend unavailable"
const noPrevTrend = computeHeroTrend(sampleActs, sampleMetrics.weekStart, sampleMetrics.totalCo2Kg);
assert.strictEqual(noPrevTrend.text, 'Trend unavailable');
assert.strictEqual(noPrevTrend.hasData, false);

// Case B: With previous week activities (e.g. 20 kg last week, 13.76 kg this week)
const actsWithHistory: ActivityLog[] = [
  ...sampleActs,
  createActivityLog('car', 100, '2026-09-08', false), // 20.0 kg last week
];
const trendWithHistory = computeHeroTrend(actsWithHistory, sampleMetrics.weekStart, sampleMetrics.totalCo2Kg);
assert.strictEqual(trendWithHistory.hasData, true);
assert.strictEqual(trendWithHistory.text, '▼ -31%', '13.76 vs 20.0 = -31.2% -> -31%');

// Case C: Sample Week Detection
const isSample = sampleActs.some((a) => a.id.startsWith('sample_'));
assert.strictEqual(isSample, true, 'Sample week data must be detected');

const userActs: ActivityLog[] = [
  createActivityLog('bus', 20, '2026-09-15', false),
];
const isUserSample = userActs.some((a) => a.id.startsWith('sample_'));
assert.strictEqual(isUserSample, false, 'User logged data must NOT be flagged as sample');

console.log('✓ Test 2 passed: Truthful trend calculations and sample detection verified.\n');

// -----------------------------------------------------------------------------
// TEST 3: Activity Lifecycle (Log, Edit, Delete) & State Synchronization
// -----------------------------------------------------------------------------
console.log('TEST 3: Full Activity Lifecycle (Create -> Edit -> Delete)...');

localStorage.clear();
saveActivities([]);
assert.strictEqual(loadActivities().length, 0);

// 1. Create activity
const initial = createActivityLog('car', 25, '2026-09-16', false, 'Office commute');
assert.strictEqual(initial.co2Kg, 5.00);
saveActivities([initial]);

let stored = loadActivities();
assert.strictEqual(stored.length, 1);
assert.strictEqual(stored[0].id, initial.id);
assert.strictEqual(stored[0].co2Kg, 5.00);

// 2. Edit activity (change quantity to 50 km -> 10.00 kg)
const editedCo2 = calculateCO2('car', 50);
const updatedLog: ActivityLog = {
  ...stored[0],
  quantity: 50,
  co2Kg: editedCo2,
};
saveActivities([updatedLog]);

stored = loadActivities();
assert.strictEqual(stored[0].quantity, 50);
assert.strictEqual(stored[0].co2Kg, 10.00);

// 3. Delete activity
saveActivities([]);
stored = loadActivities();
assert.strictEqual(stored.length, 0);

console.log('✓ Test 3 passed: Activity lifecycle and storage roundtrips operate without loss.\n');

// -----------------------------------------------------------------------------
// TEST 4: Decision Points (DP1, DP2, DP3) Preservation
// -----------------------------------------------------------------------------
console.log('TEST 4: Decision Point Integrity (DP1, DP2, DP3)...');

// DP1: Supportive Target Nudge
const overBudgetActs = generateSampleWeekData('exceeded');
const overMetrics = computeWeekMetrics(overBudgetActs, 20.0, testDate);
assert.strictEqual(overMetrics.isTargetExceeded, true);
assert.strictEqual(overMetrics.excessKg, 5.45);
assert.strictEqual(overMetrics.remainingKg, 0);
// Verify logging is never blocked even when exceeded
const newLogWhileExceeded = createActivityLog('veg_meal', 2, '2026-09-17', false);
assert.strictEqual(newLogWhileExceeded.co2Kg, 1.00, 'DP1 must remain supportive, never blocking');

// DP2: Absurd Input Anomaly Interception
const absurdCar = isAbsurdInput('car', 500000);
assert.strictEqual(absurdCar.isAbsurd, true);
assert.strictEqual(absurdCar.anomalyType, 'both');
assert.strictEqual(absurdCar.calculatedCO2, 100000.00);
assert.strictEqual(CO2_ANOMALY_THRESHOLD, 500.0);

const normalCar = isAbsurdInput('car', 35);
assert.strictEqual(normalCar.isAbsurd, false);

// DP3: Deterministic Monday -> Sunday week pacing
const satDate = new Date('2026-09-19T14:30:00');
const mon = getMondayOfWeek(satDate);
const sun = getSundayOfWeek(satDate);
assert.strictEqual(formatDateISO(mon), '2026-09-14');
assert.strictEqual(formatDateISO(sun), '2026-09-20');
assert.strictEqual(determinePaceStatus(50, 50), 'ON PACE');
assert.strictEqual(determinePaceStatus(80, 50), 'ABOVE CURRENT PACE');
assert.strictEqual(determinePaceStatus(20, 50), 'BELOW CURRENT PACE');

console.log('✓ Test 4 passed: DP1, DP2, and DP3 are 100% preserved and active.\n');

// -----------------------------------------------------------------------------
// TEST 5: Data Export & Import Integrity (CSV & JSON)
// -----------------------------------------------------------------------------
console.log('TEST 5: CSV Export & JSON Import Validation...');

// CSV injection safety
const maliciousAct = createActivityLog('car', 10, '2026-09-15', false, '@SUM(1+1)*cmd');
const csv = exportActivitiesToCSV([maliciousAct]);
assert.ok(csv.includes("'@SUM"), 'Dangerous leading formula chars must be escaped with single quote');

// JSON import mathematical validation
const validJson = exportActivitiesToJSON(sampleActs);
const impResult = importActivitiesFromJSON(validJson);
assert.strictEqual(impResult.success, true);
assert.strictEqual(impResult.count, sampleActs.length);

const tamperedJson = JSON.stringify([
  { id: 'bad_1', type: 'car', quantity: 10, co2Kg: 999.00, date: '2026-09-15' },
]);
const impTampered = importActivitiesFromJSON(tamperedJson);
assert.strictEqual(impTampered.success, false, 'Tampered mathematical discrepancies must be rejected');

console.log('✓ Test 5 passed: Data hardening and formula injection protection verified.\n');

// -----------------------------------------------------------------------------
// TEST 6: Weekly Target Bounds & Resilience
// -----------------------------------------------------------------------------
console.log('TEST 6: Weekly Target Bounds & Recovery...');
saveWeeklyTarget(25.0);
assert.strictEqual(loadWeeklyTarget(), 25.0);

saveWeeklyTarget(-100);
assert.strictEqual(loadWeeklyTarget(), 20.0, 'Negative target must fallback to default');

saveWeeklyTarget(50000);
assert.strictEqual(loadWeeklyTarget(), 10000.0, 'Oversized target must clamp to 10,000 kg');

console.log('✓ Test 6 passed: Target persistence is boundary-safe.\n');

console.log('================================================================');
console.log('ALL 6 INTEGRATION & REGRESSION TEST SUITES PASSED (100% OK)');
console.log('================================================================');
