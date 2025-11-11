# ESG Data Ingestion - Demo Walkthrough

## Overview

This walkthrough demonstrates the complete ESG data ingestion, mapping, and KPI evaluation pipeline using synthetic demo data. Follow these steps to verify the system is working end-to-end.

## Prerequisites

- Logged into the application
- Access to ESG Reports module
- Lovable Cloud backend active

---

## Step 1: Load Demo Data

### 1.1 Navigate to ESG Reports
```
App → ESG Reports
```

### 1.2 Initialize Demo Data
Click **"Load Demo Data"** button in the Results tab.

**What this does:**
- Creates 3 demo connectors (Energy DB, Emissions DB, HR System)
- Populates `source_schema_cache` with 5 tables:
  - `energy_usage`
  - `emissions_scope1`
  - `emissions_scope2`
  - `hr_headcount`
  - `hr_diversity`
- Inserts 60 staging rows (synthetic data for Q1-Q4 2024)
- Creates pre-configured mapping profile with joins and field mappings
- Adds 5 KPI rules for ESRS metrics
- Sets up monthly scheduled sync job

**Expected Response:**
```json
{
  "success": true,
  "connectors_created": 3,
  "schema_rows": 25,
  "staging_rows": 60,
  "mapping_profiles": 1,
  "kpi_rules": 5
}
```

**Verify:**
```sql
-- Check connectors
SELECT name, type, status FROM connectors;

-- Expected:
-- Energy Database    | postgres | active
-- Emissions Database | postgres | active  
-- HR System          | postgres | active

-- Check staging data
SELECT connector_id, src_table, COUNT(*) 
FROM staging_rows 
GROUP BY connector_id, src_table;

-- Expected: 12-20 rows per table
```

---

## Step 2: Sync Connectors

### 2.1 Trigger Sync
In the **Connectors** tab, click **"Sync All"** or sync individual connectors.

**What this does:**
- Simulates fetching data from external sources
- In demo mode: refreshes staging data with timestamp
- Creates `connector_sync_logs` entry
- Updates `last_sync_at` timestamp

**Expected Response:**
```json
{
  "success": true,
  "items_read": 20,
  "items_written": 20,
  "sync_duration_ms": 450
}
```

**Verify:**
```sql
SELECT 
  c.name,
  csl.status,
  csl.items_read,
  csl.items_written,
  csl.finished_at
FROM connector_sync_logs csl
JOIN connectors c ON c.id = csl.connector_id
ORDER BY csl.finished_at DESC
LIMIT 3;

-- Expected: 3 rows with status='success'
```

---

## Step 3: Suggest Mapping

### 3.1 Generate Mapping Suggestions
In the **Mapping** tab, click **"Suggest Mapping"**.

**What this does:**
- Analyzes `source_schema_cache`
- Identifies ESG-relevant tables using pattern matching
- Proposes join candidates based on FK detection
- Suggests field-to-metric mappings
- Creates draft `mapping_profile` with child records

**Expected Response:**
```json
{
  "profile_id": "uuid",
  "tables_suggested": 5,
  "joins_suggested": 3,
  "fields_suggested": 8,
  "status": "draft"
}
```

**Tables Suggested:**
- ✓ `energy_usage` (reason: contains 'kwh', 'renewable')
- ✓ `emissions_scope1` (reason: contains 'co2', 'scope')
- ✓ `emissions_scope2` (reason: contains 'co2', 'scope')
- ✓ `hr_headcount` (reason: contains 'employee', 'headcount')
- ✓ `hr_diversity` (reason: contains 'gender', 'diversity')

**Joins Suggested:**
```
energy_usage.site_id = emissions_scope1.site_id (confidence: 0.98)
energy_usage.site_id = emissions_scope2.site_id (confidence: 0.98)
hr_headcount.period = hr_diversity.period (confidence: 0.85)
```

**Field Mappings Suggested:**
```
energy_usage.kwh_consumed → E1-2.energyTotal (transform: kWh → MWh)
emissions_scope1.co2_kg → E1-1.scope1 (transform: kg → tonnes)
emissions_scope2.co2_kg → E1-1.scope2 (transform: kg → tonnes)
hr_headcount.total → S1-1.totalEmployees
hr_diversity.female_count → S1-1.femaleEmployees
```

**Verify:**
```sql
-- Check mapping profile
SELECT id, name, status FROM mapping_profiles ORDER BY created_at DESC LIMIT 1;

-- Check suggested tables
SELECT src_table, alias FROM mapping_tables WHERE profile_id = 'your-profile-id';

-- Check suggested joins
SELECT left_table, right_table, left_key, right_key 
FROM mapping_joins WHERE profile_id = 'your-profile-id';

-- Check field mappings
SELECT src_table, src_column, target_metric_code, transform 
FROM mapping_fields WHERE profile_id = 'your-profile-id';
```

---

## Step 4: Run Mapping

### 4.1 Execute Mapping
With the mapping profile confirmed, click **"Run Mapping"**.

**What this does:**
- Fetches staging data for mapped tables
- Performs joins as configured
- Applies field transformations (unit conversions, aggregations)
- Aggregates by period
- Inserts intermediate results into `esg_kpi_results`
- Creates `data_lineage_edges` for traceability
- Logs audit entry with hash chain

**Expected Response:**
```json
{
  "success": true,
  "metrics_processed": 5,
  "metric_codes": [
    "E1-1.scope1",
    "E1-1.scope2",
    "E1-2.energyTotal",
    "S1-1.totalEmployees",
    "S1-1.femaleEmployees"
  ]
}
```

**Sample Results:**
```sql
SELECT metric_code, period, value, unit
FROM esg_kpi_results
WHERE source_profile_id = 'your-profile-id'
ORDER BY metric_code, period;
```

**Expected Output:**
```
metric_code          | period   | value    | unit
---------------------+----------+----------+-------------
E1-1.scope1          | 2024-Q1  | 1250.5   | tonnes CO2e
E1-1.scope1          | 2024-Q2  | 1190.2   | tonnes CO2e
E1-1.scope1          | 2024-Q3  | 1320.8   | tonnes CO2e
E1-1.scope1          | 2024-Q4  | 1405.1   | tonnes CO2e
E1-1.scope2          | 2024-Q1  | 847.2    | tonnes CO2e
E1-1.scope2          | 2024-Q2  | 823.5    | tonnes CO2e
E1-2.energyTotal     | 2024-Q1  | 12500.0  | MWh
E1-2.energyTotal     | 2024-Q2  | 11800.0  | MWh
S1-1.totalEmployees  | 2024-Q1  | 450      | count
S1-1.femaleEmployees | 2024-Q1  | 180      | count
```

**Verify Lineage:**
```sql
SELECT from_ref, to_ref, relation_type 
FROM data_lineage_edges 
WHERE to_ref LIKE 'E1-%' OR to_ref LIKE 'S1-%'
ORDER BY created_at DESC 
LIMIT 10;
```

**Expected:**
```
from_ref                       | to_ref           | relation_type
-------------------------------+------------------+--------------
energy_usage.kwh_consumed      | E1-2.energyTotal | field_mapping
emissions_scope1.co2_kg        | E1-1.scope1      | field_mapping
emissions_scope2.co2_kg        | E1-1.scope2      | field_mapping
hr_headcount.total             | S1-1.totalEmployees | field_mapping
hr_diversity.female_count      | S1-1.femaleEmployees | field_mapping
```

---

## Step 5: Evaluate KPIs

### 5.1 Run KPI Evaluation
In the **KPI Evaluation** tab, click **"Evaluate KPIs"**.

**What this does:**
- Fetches all active KPI rules
- Loads intermediate metric results from Step 4
- Evaluates formulas in dependency order:
  1. Base metrics (already computed)
  2. Derived metrics (totals, ratios)
- Inserts/updates final KPI results
- Logs audit entry

**Expected Response:**
```json
{
  "success": true,
  "rules_evaluated": 5,
  "results_generated": 3,
  "metric_codes": [
    "E1-1.total",
    "E1-2.renewablePercent",
    "S1-1.genderRatio"
  ]
}
```

**KPI Rules Evaluated:**

#### E1-1.total (Sum)
```json
{
  "type": "sum",
  "fields": ["E1-1.scope1", "E1-1.scope2", "E1-1.scope3"]
}
```

#### E1-2.renewablePercent (Ratio)
```json
{
  "type": "ratio",
  "numerator": "E1-2.renewableEnergy",
  "denominator": "E1-2.energyTotal",
  "multiply_by": 100
}
```

#### S1-1.genderRatio (Ratio)
```json
{
  "type": "ratio",
  "numerator": "S1-1.femaleEmployees",
  "denominator": "S1-1.totalEmployees",
  "multiply_by": 100
}
```

**Final Results:**
```sql
SELECT metric_code, period, value, unit
FROM esg_kpi_results
WHERE metric_code IN ('E1-1.total', 'E1-2.renewablePercent', 'S1-1.genderRatio')
ORDER BY metric_code, period;
```

**Expected Output:**
```
metric_code             | period   | value  | unit
------------------------+----------+--------+-------
E1-1.total              | 2024-Q1  | 4201.5 | tonnes CO2e
E1-1.total              | 2024-Q2  | 4115.8 | tonnes CO2e
E1-2.renewablePercent   | 2024-Q1  | 32.5   | %
E1-2.renewablePercent   | 2024-Q2  | 35.2   | %
S1-1.genderRatio        | 2024-Q1  | 40.0   | %
S1-1.genderRatio        | 2024-Q2  | 40.9   | %
```

---

## Step 6: View Results & Lineage

### 6.1 Results Dashboard
In the **Results** tab, view:
- Total KPI metrics computed
- Latest values for key metrics
- Completeness by period

**Expected Display:**
```
Total Metrics: 13
Periods Covered: 2024-Q1, 2024-Q2, 2024-Q3, 2024-Q4

Key Metrics:
┌──────────────────────┬─────────┬─────────────┐
│ Metric               │ Value   │ Unit        │
├──────────────────────┼─────────┼─────────────┤
│ E1-1.total           │ 4201.5  │ tonnes CO2e │
│ E1-2.energyTotal     │ 12500.0 │ MWh         │
│ S1-1.genderRatio     │ 40.0    │ %           │
└──────────────────────┴─────────┴─────────────┘
```

### 6.2 Data Lineage Graph
Navigate to **Data Lineage** page (if available) or query:

```sql
SELECT 
  from_ref as source,
  to_ref as target,
  relation_type
FROM data_lineage_edges
WHERE organization_id = 'your-org-id'
ORDER BY created_at;
```

**Visualize as Graph:**
```
staging_rows
  ↓
energy_usage.kwh_consumed
  ↓ (field_mapping)
E1-2.energyTotal
  ↓ (kpi_formula)
E1-2.renewablePercent

emissions_scope1.co2_kg
  ↓ (field_mapping)
E1-1.scope1
  ↓ (kpi_formula)
E1-1.total
```

---

## Step 7: Verify Audit Chain

### 7.1 Check Audit Integrity
```sql
SELECT 
  event_type,
  input_hash,
  output_hash,
  prev_hash,
  occurred_at
FROM esg_ingestion_audit
WHERE organization_id = 'your-org-id'
ORDER BY occurred_at;
```

**Expected Sequence:**
```
event_type      | input_hash   | output_hash  | prev_hash    | occurred_at
----------------+--------------+--------------+--------------+-------------------
demo_seed       | abc123...    | def456...    | NULL         | 2024-04-01 10:00
connector_sync  | ghi789...    | jkl012...    | def456...    | 2024-04-01 10:05
run_mapping     | mno345...    | pqr678...    | jkl012...    | 2024-04-01 10:10
kpi_evaluation  | stu901...    | vwx234...    | pqr678...    | 2024-04-01 10:15
```

### 7.2 Verify Chain Integrity
Call verification endpoint:
```bash
curl -X POST https://your-project.supabase.co/functions/v1/audit-verify-chain \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "chain_valid": true,
  "entries_checked": 4,
  "first_entry": "2024-04-01T10:00:00Z",
  "last_entry": "2024-04-01T10:15:00Z"
}
```

---

## Troubleshooting

### Issue: Demo data not loading
**Check:**
```sql
SELECT COUNT(*) FROM connectors;
SELECT COUNT(*) FROM staging_rows;
```

**Solution:** 
- Ensure user has `organization_id` in profile
- Check Lovable Cloud edge functions are deployed
- Review console logs for errors

### Issue: Mapping returns 0 results
**Check:**
```sql
SELECT * FROM staging_rows WHERE connector_id = 'connector-uuid' LIMIT 5;
SELECT * FROM mapping_fields WHERE profile_id = 'profile-uuid';
```

**Solution:**
- Verify staging data exists
- Confirm mapping profile has field mappings
- Check join keys match actual data

### Issue: KPI evaluation produces null values
**Check:**
```sql
SELECT metric_code, COUNT(*) 
FROM esg_kpi_results 
WHERE source_profile_id IS NOT NULL
GROUP BY metric_code;
```

**Solution:**
- Ensure `run-mapping` completed successfully first
- Verify KPI rule formulas reference correct metric codes
- Check formula dependencies (e.g., can't compute total if components missing)

---

## Expected Final State

After completing all steps, you should have:

✅ 3 connectors with `status='active'`
✅ 60+ staging rows across 5 tables
✅ 1 mapping profile with status='ready'
✅ 8+ field mappings configured
✅ 13+ KPI results across 4 periods
✅ 20+ lineage edges
✅ 4+ audit log entries with valid chain

---

## Next Steps

1. **Customize Demo Data** - Modify synthetic values to match your domain
2. **Add Real Connectors** - Configure actual database connections
3. **Create Custom Mappings** - Build mappings for your specific sources
4. **Define Additional KPIs** - Add organization-specific metrics
5. **Schedule Automated Syncs** - Set up recurring jobs
6. **Generate Reports** - Use KPI results to create ESRS reports

---

## Performance Benchmarks

### Demo Data Scale
- Connectors: 3
- Tables: 5
- Staging Rows: 60
- Mapping Execution: < 1s
- KPI Evaluation: < 500ms
- Total End-to-End: < 5s

### Production Scale Estimates
- Connectors: 10-50
- Tables: 50-200
- Staging Rows: 100K-10M
- Mapping Execution: 10s-60s (with chunking)
- KPI Evaluation: 2s-10s
- Total End-to-End: 30s-5min (depending on data volume)

---

## Support

If you encounter issues during the demo walkthrough:
1. Check console logs in browser DevTools
2. Review Lovable Cloud edge function logs
3. Verify RLS policies allow data access
4. Ensure all edge functions are deployed
5. Contact support with specific error messages
