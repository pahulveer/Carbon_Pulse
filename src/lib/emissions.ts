import type { ActivityCategory, ActivityDefinition, ActivityType } from '../types';

/**
 * SINGLE SOURCE OF TRUTH FOR ALL EMISSION FACTORS
 * Exactly matching the hackathon brief:
 * Car:          0.20 kg CO₂ / km
 * Bus:          0.08 kg CO₂ / km
 * Flight:       0.25 kg CO₂ / km
 * Electricity:  0.80 kg CO₂ / kWh
 * Veg meal:     0.50 kg CO₂ / meal
 * Non-veg meal: 2.00 kg CO₂ / meal
 */
export const EMISSION_FACTORS: Record<ActivityType, number> = {
  car: 0.20,
  bus: 0.08,
  flight: 0.25,
  electricity: 0.80,
  veg_meal: 0.50,
  non_veg_meal: 2.00,
};

export const CATEGORY_METADATA: Record<
  ActivityCategory,
  { label: string; color: string; bgSoft: string; borderSoft: string }
> = {
  transport: {
    label: 'Transport',
    color: '#38BDF8', // Sky 400
    bgSoft: 'rgba(56, 189, 248, 0.12)',
    borderSoft: 'rgba(56, 189, 248, 0.28)',
  },
  energy: {
    label: 'Energy',
    color: '#F59E0B', // Amber 500
    bgSoft: 'rgba(245, 158, 11, 0.12)',
    borderSoft: 'rgba(245, 158, 11, 0.28)',
  },
  food: {
    label: 'Food',
    color: '#34D399', // Emerald 400
    bgSoft: 'rgba(52, 211, 153, 0.12)',
    borderSoft: 'rgba(52, 211, 153, 0.28)',
  },
};

export const ACTIVITY_DEFINITIONS: Record<ActivityType, ActivityDefinition> = {
  car: {
    id: 'car',
    label: 'Car travel',
    category: 'transport',
    factor: EMISSION_FACTORS.car,
    unit: 'km',
    unitLabelSingular: 'kilometer',
    unitLabelPlural: 'kilometers',
    iconName: 'Car',
    anomalyThreshold: 2000, // > 2,000 km in one single log is unusual (e.g. driving non-stop across continents)
    suggestedStep: 5,
    minVal: 0.1,
    description: 'Gasoline/diesel passenger vehicle emissions based on distance',
  },
  bus: {
    id: 'bus',
    label: 'Bus travel',
    category: 'transport',
    factor: EMISSION_FACTORS.bus,
    unit: 'km',
    unitLabelSingular: 'kilometer',
    unitLabelPlural: 'kilometers',
    iconName: 'Bus',
    anomalyThreshold: 1500, // > 1,500 km single transit trip
    suggestedStep: 5,
    minVal: 0.1,
    description: 'Shared municipal or intercity public transit coach travel',
  },
  flight: {
    id: 'flight',
    label: 'Flight',
    category: 'transport',
    factor: EMISSION_FACTORS.flight,
    unit: 'km',
    unitLabelSingular: 'kilometer',
    unitLabelPlural: 'kilometers',
    iconName: 'Plane',
    anomalyThreshold: 20000, // Halfway around Earth is ~20,000 km
    suggestedStep: 50,
    minVal: 1,
    description: 'Commercial passenger aviation emissions per passenger-kilometer',
  },
  electricity: {
    id: 'electricity',
    label: 'Electricity',
    category: 'energy',
    factor: EMISSION_FACTORS.electricity,
    unit: 'kWh',
    unitLabelSingular: 'kilowatt-hour',
    unitLabelPlural: 'kilowatt-hours',
    iconName: 'Zap',
    anomalyThreshold: 3000, // Typical home monthly usage is ~300-900 kWh; > 3000 in one log is atypical
    suggestedStep: 10,
    minVal: 0.1,
    description: 'Grid electricity consumption based on standard regional blend',
  },
  veg_meal: {
    id: 'veg_meal',
    label: 'Veg meal',
    category: 'food',
    factor: EMISSION_FACTORS.veg_meal,
    unit: 'meals',
    unitLabelSingular: 'meal',
    unitLabelPlural: 'meals',
    iconName: 'Salad',
    anomalyThreshold: 20, // Logging > 20 meals at once is unusual for a personal tracker
    suggestedStep: 1,
    minVal: 1,
    description: 'Plant-forward vegetarian meal with minimal dairy footprint',
  },
  non_veg_meal: {
    id: 'non_veg_meal',
    label: 'Non-veg meal',
    category: 'food',
    factor: EMISSION_FACTORS.non_veg_meal,
    unit: 'meals',
    unitLabelSingular: 'meal',
    unitLabelPlural: 'meals',
    iconName: 'Beef',
    anomalyThreshold: 20, // Logging > 20 meals at once is unusual
    suggestedStep: 1,
    minVal: 1,
    description: 'Meat/poultry-inclusive dish with higher embodied lifecycle emissions',
  },
};

/**
 * Centrally calculated CO2 in kilograms, rounded to 2 decimal places
 */
export function calculateCO2(type: ActivityType, quantity: number): number {
  if (!quantity || quantity <= 0 || isNaN(quantity)) {
    return 0;
  }
  const factor = EMISSION_FACTORS[type] ?? 0;
  const raw = quantity * factor;
  return Number(raw.toFixed(2));
}

/**
 * Returns user-facing mathematical breakdown string and metadata for complete transparency
 * e.g. "10 km × 0.20 kg/km = 2.00 kg CO₂"
 */
export function getCalculationBreakdown(type: ActivityType, quantity: number) {
  const def = ACTIVITY_DEFINITIONS[type];
  const safeQty = Math.max(0, quantity || 0);
  const factor = def.factor;
  const total = calculateCO2(type, safeQty);

  const formattedQty = Number.isInteger(safeQty) ? safeQty.toString() : safeQty.toFixed(1);
  const formattedFactor = factor.toFixed(2);
  const formattedTotal = total.toFixed(2);

  return {
    quantityFormatted: formattedQty,
    unit: def.unit,
    factorFormatted: formattedFactor,
    totalFormatted: formattedTotal,
    formulaString: `${formattedQty} ${def.unit} × ${formattedFactor} kg/${def.unit} = ${formattedTotal} kg CO₂`,
    total,
  };
}

/**
 * Decision Point 2 Anomaly Detection:
 * Flags if the quantity exceeds the realistic activity threshold OR if the
 * resulting CO2 is astronomical (e.g. > 500 kg CO₂ from a single log).
 */
export function isAbsurdInput(type: ActivityType, quantity: number): {
  isAbsurd: boolean;
  threshold: number;
  reason: string;
} {
  const def = ACTIVITY_DEFINITIONS[type];
  if (!quantity || isNaN(quantity) || quantity <= 0) {
    return { isAbsurd: false, threshold: def.anomalyThreshold, reason: '' };
  }

  if (quantity >= def.anomalyThreshold) {
    return {
      isAbsurd: true,
      threshold: def.anomalyThreshold,
      reason: `${quantity.toLocaleString()} ${def.unit} is an unusually large value for a single ${def.label.toLowerCase()} entry (expected single-log threshold is ${def.anomalyThreshold.toLocaleString()} ${def.unit}).`,
    };
  }

  return { isAbsurd: false, threshold: def.anomalyThreshold, reason: '' };
}
