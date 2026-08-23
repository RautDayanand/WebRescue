export interface ValidationError {
  type: 'SCHEMA' | 'TYPE' | 'RANGE' | 'ANOMALY';
  field: string;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface CompletenessMap {
  [field: string]: number; // Completeness ratio 0.0 - 1.0 (e.g., 0.96 for 96%)
}

export interface ValidationMetrics {
  totalRecords: number;
  fieldCompleteness: CompletenessMap;
}

export interface ValidationResult {
  valid: boolean;
  severity: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  healthScore: number; // 0 - 100
  errors: ValidationError[];
  warnings: ValidationError[];
  metrics: ValidationMetrics;
}

export interface ValidationOptions {
  requiredFields?: string[];
  completenessThreshold?: number; // Default 0.40 (40%)
}

/**
 * Calculates a 0-100 Scraper Health Score based on completeness, type purity, range bounds, and anomalies.
 */
export function calculateHealthScore(
  totalRecords: number,
  fieldCompleteness: CompletenessMap,
  errors: ValidationError[]
): number {
  if (totalRecords === 0) return 0;

  const completenessValues = Object.values(fieldCompleteness);
  const avgCompleteness = completenessValues.length > 0
    ? completenessValues.reduce((a, b) => a + b, 0) / completenessValues.length
    : 0;

  let baseScore = Math.round(avgCompleteness * 100);

  // Penalize based on severity of errors
  errors.forEach((err) => {
    if (err.severity === 'CRITICAL') baseScore -= 40;
    else if (err.severity === 'HIGH') baseScore -= 25;
    else if (err.severity === 'MEDIUM') baseScore -= 10;
    else if (err.severity === 'LOW') baseScore -= 5;
  });

  return Math.max(0, Math.min(100, baseScore));
}

/**
 * Data Validation Engine
 * 1. Schema Presence
 * 2. Type Checks
 * 3. Range Limits
 * 4. Anomaly Extraction Drift Detection
 */
export function validateScrapedDataset(
  dataset: any[],
  options: ValidationOptions = {}
): ValidationResult {
  const { requiredFields = ['name', 'price'], completenessThreshold = 0.4 } = options;
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!Array.isArray(dataset) || dataset.length === 0) {
    return {
      valid: false,
      severity: 'CRITICAL',
      healthScore: 0,
      errors: [
        {
          type: 'SCHEMA',
          field: '*',
          message: 'Scraped dataset is empty or invalid format.',
          severity: 'CRITICAL',
        },
      ],
      warnings: [],
      metrics: { totalRecords: 0, fieldCompleteness: {} },
    };
  }

  const totalRecords = dataset.length;
  const fieldCompleteness: CompletenessMap = {};

  // 1. Calculate Field Completeness Ratios
  requiredFields.forEach((field) => {
    const nonNullCount = dataset.filter((item) => {
      const val = item[field];
      if (val === undefined || val === null || val === '' || val === 'N/A' || val === '₹N/A') return false;
      if (typeof val === 'string' && (val.trim().toLowerCase() === 'n/a' || val.trim().toLowerCase() === '₹n/a')) return false;
      if (typeof val === 'number' && isNaN(val)) return false;
      return true;
    }).length;
    fieldCompleteness[field] = parseFloat((nonNullCount / totalRecords).toFixed(2));
  });

  // 2. Detect EXTRACTION_DRIFT (Anomaly Detection)
  requiredFields.forEach((field) => {
    const completeness = fieldCompleteness[field] ?? 0;

    if (completeness < completenessThreshold) {
      errors.push({
        type: 'ANOMALY',
        field,
        message: `Critical extraction drift detected: "${field}" field completeness dropped to ${Math.round(completeness * 100)}% (${Math.round(completeness * totalRecords)} of ${totalRecords} records). Website structure or DOM selectors moved.`,
        severity: 'CRITICAL',
      });
    } else if (completeness < 0.7) {
      warnings.push({
        type: 'ANOMALY',
        field,
        message: `Extraction completeness warning: "${field}" completeness is ${Math.round(completeness * 100)}%.`,
        severity: 'MEDIUM',
      });
    }
  });

  // 3. Range & Type Checks
  dataset.forEach((item, index) => {
    if (typeof item.price === 'number' && item.price < 0) {
      errors.push({
        type: 'RANGE',
        field: 'price',
        message: `Record #${index + 1} has negative price (${item.price}).`,
        severity: 'HIGH',
      });
    }
    if (typeof item.rating === 'number' && (item.rating < 0 || item.rating > 5)) {
      warnings.push({
        type: 'RANGE',
        field: 'rating',
        message: `Record #${index + 1} rating out of 0-5 bounds (${item.rating}).`,
        severity: 'LOW',
      });
    }
  });

  const valid = errors.filter((e) => e.severity === 'CRITICAL' || e.severity === 'HIGH').length === 0;

  let maxSeverity: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'NONE';
  if (errors.some((e) => e.severity === 'CRITICAL')) maxSeverity = 'CRITICAL';
  else if (errors.some((e) => e.severity === 'HIGH')) maxSeverity = 'HIGH';
  else if (warnings.some((w) => w.severity === 'MEDIUM')) maxSeverity = 'MEDIUM';
  else if (warnings.some((w) => w.severity === 'LOW')) maxSeverity = 'LOW';

  const healthScore = calculateHealthScore(totalRecords, fieldCompleteness, errors);

  return {
    valid,
    severity: maxSeverity,
    healthScore,
    errors,
    warnings,
    metrics: {
      totalRecords,
      fieldCompleteness,
    },
  };
}
