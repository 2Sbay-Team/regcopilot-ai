# ESG Data Quality Assurance

## Overview

Quality assurance validates ESG data throughout the ingestion and mapping pipeline. QA checks detect anomalies, ensure consistency, verify units, and flag missing data before reports are generated.

## QA Framework

### Check Categories

1. **Schema Validation** - Data types, required fields
2. **Unit Consistency** - Correct units and conversions
3. **Plausibility Ranges** - Values within expected bounds
4. **Cross-Table Consistency** - Relationships between metrics
5. **Completeness** - Missing data detection
6. **Temporal Consistency** - Trend anomalies

---

## Schema Validation

### Required Fields Check
Ensures critical fields are present and non-null.

```json
{
  "check": "required_fields",
  "table": "staging_rows",
  "fields": ["connector_id", "src_table", "payload", "period"],
  "severity": "error"
}
```

**Action on Failure:**
- Reject row
- Log error with row identifier
- Alert data steward

### Data Type Validation
Verifies payload fields match expected types.

```json
{
  "check": "data_types",
  "field": "payload.co2_tonnes",
  "expected_type": "numeric",
  "allow_null": false,
  "severity": "error"
}
```

**Common Type Checks:**
```typescript
{
  "energy_kwh": "numeric",
  "reporting_period": "date",
  "site_id": "string",
  "is_renewable": "boolean"
}
```

---

## Unit Consistency

### Unit Normalization Check
Detects and converts inconsistent units.

```json
{
  "check": "unit_normalization",
  "field": "energy_consumption",
  "expected_units": ["MWh", "kWh", "GWh"],
  "target_unit": "MWh",
  "conversions": {
    "kWh": 0.001,
    "GWh": 1000
  }
}
```

**Example Detection:**
```sql
-- Flag rows with unexpected units
SELECT 
  id,
  payload->>'energy_value' as value,
  payload->>'energy_unit' as unit
FROM staging_rows
WHERE payload->>'energy_unit' NOT IN ('MWh', 'kWh', 'GWh');
```

**Auto-Correction:**
```typescript
if (unit === 'kWh') {
  value = value * 0.001;
  unit = 'MWh';
  metadata.qa_correction = 'unit_normalized';
}
```

### Common Unit Mappings

#### Energy
```json
{
  "base_unit": "MWh",
  "accepted": {
    "kWh": {"factor": 0.001},
    "GWh": {"factor": 1000},
    "TJ": {"factor": 277.778}
  }
}
```

#### Emissions
```json
{
  "base_unit": "tonnes CO2e",
  "accepted": {
    "kg CO2e": {"factor": 0.001},
    "g CO2e": {"factor": 0.000001},
    "Mt CO2e": {"factor": 1000000}
  }
}
```

#### Volume
```json
{
  "base_unit": "m³",
  "accepted": {
    "liters": {"factor": 0.001},
    "gallons": {"factor": 0.00378541},
    "megaliters": {"factor": 1000}
  }
}
```

---

## Plausibility Ranges

### Bounds Check
Validates values fall within expected ranges.

```json
{
  "check": "plausibility_range",
  "metric": "E1-1.scope1",
  "min": 0,
  "max": null,
  "severity": "error",
  "message": "Emissions cannot be negative"
}
```

**Standard Ranges:**
```typescript
const ranges = {
  "E1-1.scope1": {min: 0, max: null, unit: "tonnes CO2e"},
  "E1-2.renewablePercent": {min: 0, max: 100, unit: "%"},
  "S1-1.genderRatio": {min: 0, max: 100, unit: "%"},
  "S1-2.incidentRate": {min: 0, max: 1000, unit: "per 1000"}
};
```

### Outlier Detection
Flags values significantly outside historical norms.

```json
{
  "check": "outlier_detection",
  "metric": "E1-1.scope1",
  "method": "iqr",
  "threshold": 3.0,
  "severity": "warning"
}
```

**Methods:**
- `iqr` - Interquartile range (Q1 - 3*IQR, Q3 + 3*IQR)
- `zscore` - Standard deviations from mean (threshold = 3)
- `mad` - Median absolute deviation

**Example:**
```typescript
// Detect outliers using IQR
const q1 = percentile(values, 25);
const q3 = percentile(values, 75);
const iqr = q3 - q1;

const lowerBound = q1 - 3 * iqr;
const upperBound = q3 + 3 * iqr;

if (value < lowerBound || value > upperBound) {
  flagOutlier(value, {q1, q3, iqr, lowerBound, upperBound});
}
```

---

## Cross-Table Consistency

### Sum Validation
Ensures totals match sum of components.

```json
{
  "check": "sum_consistency",
  "total_metric": "E1-1.total",
  "components": ["E1-1.scope1", "E1-1.scope2", "E1-1.scope3"],
  "tolerance": 0.01,
  "severity": "error"
}
```

**Implementation:**
```typescript
const total = getMetricValue("E1-1.total", period);
const components = [
  getMetricValue("E1-1.scope1", period),
  getMetricValue("E1-1.scope2", period),
  getMetricValue("E1-1.scope3", period)
];

const expectedTotal = components.reduce((a, b) => a + b, 0);
const diff = Math.abs(total - expectedTotal);
const tolerance = 0.01; // 1%

if (diff > expectedTotal * tolerance) {
  flagInconsistency({
    metric: "E1-1.total",
    period,
    expected: expectedTotal,
    actual: total,
    diff,
    diffPercent: (diff / expectedTotal) * 100
  });
}
```

### Ratio Validation
Verifies derived ratios are correct.

```json
{
  "check": "ratio_consistency",
  "ratio_metric": "E1-2.renewablePercent",
  "numerator": "E1-2.renewableEnergy",
  "denominator": "E1-2.energyTotal",
  "tolerance": 0.5,
  "severity": "warning"
}
```

### Balance Equations
Custom consistency rules for complex relationships.

```json
{
  "check": "balance_equation",
  "equation": "total_energy = renewable_energy + fossil_energy + nuclear_energy",
  "tolerance": 0.01,
  "severity": "error"
}
```

---

## Completeness Checks

### Missing Data Heatmap
Visualizes data availability across periods and metrics.

```typescript
// Generate missingness matrix
const periods = ["2024-Q1", "2024-Q2", "2024-Q3", "2024-Q4"];
const metrics = ["E1-1.scope1", "E1-1.scope2", "E1-1.scope3", "E1-2.energyTotal"];

const heatmap = {};
for (const metric of metrics) {
  heatmap[metric] = {};
  for (const period of periods) {
    const value = await getMetricValue(metric, period);
    heatmap[metric][period] = value !== null ? "✓" : "✗";
  }
}
```

**Output:**
```
Metric           | 2024-Q1 | 2024-Q2 | 2024-Q3 | 2024-Q4
-----------------+---------+---------+---------+---------
E1-1.scope1      |    ✓    |    ✓    |    ✓    |    ✗
E1-1.scope2      |    ✓    |    ✓    |    ✗    |    ✗
E1-1.scope3      |    ✗    |    ✗    |    ✗    |    ✗
E1-2.energyTotal |    ✓    |    ✓    |    ✓    |    ✓
```

### Expected Period Check
Flags missing periods based on reporting frequency.

```json
{
  "check": "expected_periods",
  "frequency": "monthly",
  "start_date": "2024-01-01",
  "end_date": "2024-12-31",
  "required_completeness": 0.9,
  "severity": "warning"
}
```

**Implementation:**
```typescript
const expectedPeriods = generatePeriods("monthly", "2024-01-01", "2024-12-31");
const actualPeriods = await getAvailablePeriods(metricCode);
const missingPeriods = expectedPeriods.filter(p => !actualPeriods.includes(p));

const completeness = actualPeriods.length / expectedPeriods.length;

if (completeness < 0.9) {
  flagIncompleteness({
    metric: metricCode,
    expectedPeriods: expectedPeriods.length,
    actualPeriods: actualPeriods.length,
    completeness,
    missingPeriods
  });
}
```

---

## Temporal Consistency

### Trend Analysis
Detects unusual period-over-period changes.

```json
{
  "check": "trend_anomaly",
  "metric": "E1-1.scope1",
  "max_change_percent": 50,
  "severity": "warning"
}
```

**Implementation:**
```typescript
const currentValue = getMetricValue(metric, currentPeriod);
const previousValue = getMetricValue(metric, previousPeriod);

const changePercent = ((currentValue - previousValue) / previousValue) * 100;

if (Math.abs(changePercent) > 50) {
  flagTrendAnomaly({
    metric,
    currentPeriod,
    previousPeriod,
    currentValue,
    previousValue,
    changePercent
  });
}
```

### Seasonality Check
Compares to same period in previous years.

```json
{
  "check": "seasonality",
  "metric": "E1-2.energyTotal",
  "compare_to_years": [1, 2],
  "max_deviation_percent": 30,
  "severity": "info"
}
```

---

## QA Dashboard

### Summary View
```typescript
interface QASummary {
  totalChecks: number;
  passed: number;
  warnings: number;
  errors: number;
  criticalIssues: string[];
  lastRun: string;
}
```

**Example:**
```json
{
  "totalChecks": 47,
  "passed": 42,
  "warnings": 4,
  "errors": 1,
  "criticalIssues": [
    "E1-1.scope3: Missing data for 2024-Q3, 2024-Q4"
  ],
  "lastRun": "2024-04-01T10:30:00Z"
}
```

### Detailed Issues
```typescript
interface QAIssue {
  id: string;
  severity: "error" | "warning" | "info";
  check: string;
  metric: string;
  period?: string;
  message: string;
  details: any;
  suggestedAction: string;
}
```

**Example:**
```json
{
  "id": "qa-issue-123",
  "severity": "error",
  "check": "sum_consistency",
  "metric": "E1-1.total",
  "period": "2024-Q1",
  "message": "Total emissions do not match sum of scopes",
  "details": {
    "expected": 4000,
    "actual": 4050,
    "diff": 50,
    "diffPercent": 1.25
  },
  "suggestedAction": "Verify E1-1.scope3 calculation or correct source data"
}
```

---

## Override Mechanism

### Acknowledged Issues
Allow users to acknowledge and suppress known issues.

```sql
CREATE TABLE qa_issue_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  check_name TEXT NOT NULL,
  metric_code TEXT,
  period TEXT,
  reason TEXT NOT NULL,
  overridden_by UUID REFERENCES auth.users(id),
  overridden_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);
```

**Usage:**
```typescript
// Override specific issue
await supabase.from('qa_issue_overrides').insert({
  organization_id: orgId,
  check_name: 'outlier_detection',
  metric_code: 'E1-1.scope1',
  period: '2024-Q1',
  reason: 'New facility came online, spike expected',
  expires_at: '2024-06-30'
});
```

---

## Execution Flow

### During Mapping
```typescript
POST /functions/v1/run-mapping
1. Execute mapping transformations
2. Run immediate QA checks:
   - Unit normalization
   - Plausibility ranges
   - Data type validation
3. Store results with QA metadata
4. Return warnings/errors to user
```

### During KPI Evaluation
```typescript
POST /functions/v1/kpi-evaluate
1. Evaluate KPI formulas
2. Run consistency checks:
   - Sum validation
   - Ratio validation
   - Balance equations
3. Check temporal consistency
4. Generate QA report
```

### Scheduled Validation
```typescript
POST /functions/v1/qa-validate-batch
1. Run all checks on final KPI results
2. Generate completeness heatmap
3. Detect outliers across all metrics
4. Create QA dashboard data
5. Alert on critical issues
```

---

## Thresholds Configuration

### Global Defaults
```json
{
  "outlier_threshold": 3.0,
  "sum_tolerance_percent": 1.0,
  "ratio_tolerance_percent": 0.5,
  "trend_change_max_percent": 50,
  "required_completeness": 0.9
}
```

### Metric-Specific Overrides
```json
{
  "E1-1.scope3": {
    "outlier_threshold": 5.0,
    "sum_tolerance_percent": 2.0,
    "note": "Scope 3 more variable, relax thresholds"
  },
  "S1-1.genderRatio": {
    "trend_change_max_percent": 10,
    "note": "Workforce metrics should be stable"
  }
}
```

---

## Best Practices

1. **Run QA Early** - Validate at ingestion, mapping, and KPI stages
2. **Document Overrides** - Always provide clear reason when suppressing checks
3. **Review Regularly** - Weekly review of QA dashboard
4. **Tune Thresholds** - Adjust based on your data characteristics
5. **Automate Alerts** - Notify data stewards of critical issues
6. **Track Trends** - Monitor QA pass rate over time

---

## Troubleshooting

### High False Positive Rate
**Cause:** Thresholds too strict for your data
**Solution:** Review historical data, adjust thresholds

### Missing Data Not Detected
**Cause:** Expected periods not configured
**Solution:** Set up `expected_periods` check with correct frequency

### Unit Inconsistencies Persist
**Cause:** Unit normalization not applied during mapping
**Solution:** Add unit conversion transforms in mapping profile

---

## Next Steps

1. Implement visual QA dashboard in React
2. Add custom check builder (no-code QA rules)
3. Create QA report export (PDF with charts)
4. Add machine learning anomaly detection
5. Implement automated data steward notifications
