# ESG Data Mapping Guide

## Overview

The mapping system transforms raw source data into standardized ESRS-compliant metrics. It supports visual mapping, automatic join inference, field transformations, and unit conversions.

## Core Concepts

### Mapping Profile
A **mapping profile** is a complete configuration that defines:
- Which source tables to use
- How tables are joined together
- Which fields map to which ESRS metrics
- Transformations and unit conversions

**Example:**
```
Profile: "2024 Energy & Emissions"
├── Tables: energy_usage, emissions_scope1, emissions_scope2
├── Joins: energy_usage.site_id = emissions_scope1.site_id
├── Fields: 
│   ├── energy_usage.kwh_consumed → E1-2.energyTotal (transform: kWh → MWh)
│   ├── emissions_scope1.co2_kg → E1-1.scope1 (transform: kg → t)
│   └── emissions_scope2.co2_kg → E1-1.scope2 (transform: kg → t)
```

## Visual Mapping Canvas

### Layout
```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│ Source       │      │ Joins &      │      │ Target       │
│ Tables       │ ───> │ Transforms   │ ───> │ ESRS Metrics │
│              │      │              │      │              │
│ ▢ energy     │      │  ═══════     │      │ E1-1.scope1  │
│ ▢ emissions  │      │  site_id     │      │ E1-1.scope2  │
│ ▢ hr_data    │      │  ═══════     │      │ E1-2.energy  │
└──────────────┘      └──────────────┘      └──────────────┘
```

### Workflow
1. **Select Source Tables** (left panel)
2. **Confirm Joins** (middle panel) - auto-suggested or manual
3. **Map Fields** (right panel) - drag & drop or click to connect
4. **Configure Transforms** (field details)
5. **Validate & Apply**

## Automatic Mapping Suggestions

### Table Identification
The system suggests ESG-relevant tables using:

**Heuristics:**
- Table name patterns: `*energy*`, `*emission*`, `*sustainability*`, `*esg*`, `*carbon*`, `*waste*`, `*water*`, `*diversity*`, `*safety*`
- Column patterns: `co2`, `kwh`, `ghg`, `renewable`, `headcount`, `gender`, `incidents`

**Example Suggestions:**
```json
{
  "likely_esg_tables": [
    {
      "table": "energy_consumption_monthly",
      "confidence": 0.95,
      "reason": "contains columns: site_id, period, kwh_total, renewable_kwh"
    },
    {
      "table": "emissions_inventory",
      "confidence": 0.92,
      "reason": "contains columns: scope, co2_tonnes, source, reporting_period"
    }
  ]
}
```

### Join Inference
The system suggests joins based on:

**Foreign Key Detection:**
- Named constraints in schema
- Column naming patterns (`*_id`, `*_key`, `*_code`)
- Data type matching

**Example:**
```json
{
  "join_candidates": [
    {
      "left_table": "energy_usage",
      "right_table": "sites",
      "left_key": "site_id",
      "right_key": "id",
      "join_type": "LEFT",
      "confidence": 0.98,
      "reason": "FK constraint detected"
    }
  ]
}
```

**User Confirmation Required:**
- System proposes joins but **never applies automatically**
- User must explicitly confirm each join
- Prevents accidental data multiplication or loss

### Field-to-Metric Mapping
The system suggests metric mappings using:

**Pattern Matching:**
```javascript
// Energy mappings
"kwh_consumed" → "E1-2.energyTotal"
"renewable_energy" → "E1-2.renewableEnergy"

// Emissions mappings
"scope1_co2" → "E1-1.scope1"
"scope2_co2" → "E1-1.scope2"
"scope3_co2" → "E1-1.scope3"

// Social mappings
"total_employees" → "S1-1.headcount"
"female_count" → "S1-1.femaleEmployees"
"safety_incidents" → "S1-2.workplaceIncidents"
```

**Unit Detection:**
```javascript
// Detects common units and suggests conversions
"kwh" → suggests conversion to "MWh"
"kg_co2" → suggests conversion to "tonnes"
"gallons" → suggests conversion to "liters"
```

## Field Transformations

### Transformation Types

#### 1. Unit Conversion
```json
{
  "type": "convert_unit",
  "from": "kWh",
  "to": "MWh",
  "factor": 0.001
}
```

**Common Conversions:**
| From | To | Factor |
|------|-----|---------|
| kWh | MWh | 0.001 |
| kg | tonnes | 0.001 |
| gallons | liters | 3.78541 |
| miles | km | 1.60934 |

#### 2. Aggregation
```json
{
  "type": "sum",
  "group_by": ["site_id", "period"]
}
```

**Supported Aggregations:**
- `sum` - Total across groups
- `avg` - Average value
- `min` / `max` - Extremes
- `count` - Row count
- `count_distinct` - Unique values

#### 3. Date Bucketing
```json
{
  "type": "date_bucket",
  "source_field": "transaction_date",
  "bucket": "month",
  "output_format": "YYYY-MM"
}
```

**Bucket Options:** `day`, `week`, `month`, `quarter`, `year`

#### 4. Conditional Logic
```json
{
  "type": "case",
  "conditions": [
    {"when": "energy_source = 'renewable'", "then": "renewable_kwh"},
    {"when": "energy_source = 'fossil'", "then": "fossil_kwh"}
  ],
  "default": 0
}
```

#### 5. Coalesce (Null Handling)
```json
{
  "type": "coalesce",
  "fields": ["primary_value", "backup_value", "default_value"]
}
```

## Join Confirmation Flow

### Step 1: Review Suggested Joins
System displays:
```
Suggested Join:
  energy_usage.site_id = sites.id
  Type: LEFT JOIN
  Confidence: 98%
  Reason: FK constraint detected
  
  Sample Preview:
  ┌────────────┬─────────────┐
  │ site_id    │ site_name   │
  ├────────────┼─────────────┤
  │ 1          │ Factory A   │
  │ 2          │ Warehouse B │
  └────────────┴─────────────┘
```

### Step 2: User Actions
- ✅ **Confirm** - Accept suggested join
- ✏️ **Modify** - Change join type or keys
- ❌ **Reject** - Remove join
- ➕ **Add Custom** - Define new join manually

### Step 3: Validation
System validates:
- Both tables exist in selected sources
- Join keys have compatible data types
- Join produces reasonable row count (warns if massive multiplication)

**Example Validation:**
```
⚠️ Warning: This join will increase row count from 1,000 to 50,000
   Left table: energy_usage (1,000 rows)
   Right table: hourly_readings (50 rows per energy record)
   Consider: Is this the intended granularity?
```

### Step 4: Preview Results
Before applying, user can preview:
- First 100 rows of joined data
- Row count impact
- Column availability for mapping

## Creating a Mapping Profile

### Example: Energy & Emissions Mapping

#### Step 1: Create Profile
```typescript
POST /functions/v1/mapping-suggest
{
  "connector_id": "energy-db-connector",
  "name": "2024 Energy & Emissions"
}
```

Response includes suggested tables, joins, and field mappings.

#### Step 2: Review & Confirm
Review UI shows:
- **Tables:** `energy_usage`, `emissions_scope1`, `emissions_scope2`, `sites`
- **Suggested Joins:**
  ```
  energy_usage.site_id = sites.id (LEFT)
  emissions_scope1.site_id = sites.id (LEFT)
  emissions_scope2.site_id = sites.id (LEFT)
  ```
- **Suggested Mappings:**
  ```
  energy_usage.kwh_consumed → E1-2.energyTotal (convert: kWh → MWh)
  emissions_scope1.co2_kg → E1-1.scope1 (convert: kg → tonnes)
  emissions_scope2.co2_kg → E1-1.scope2 (convert: kg → tonnes)
  ```

#### Step 3: Confirm & Apply
```typescript
POST /functions/v1/mapping-apply
{
  "profile_id": "mapping-profile-uuid"
}
```

Validates and marks profile as `ready`.

#### Step 4: Execute Mapping
```typescript
POST /functions/v1/run-mapping
{
  "profile_id": "mapping-profile-uuid"
}
```

Processes data and generates intermediate KPI results.

## Advanced Patterns

### Multi-Table Aggregations
Combine multiple sources for a single metric:

```json
{
  "metric_code": "E1-1.total",
  "sources": [
    {"table": "emissions_scope1", "field": "co2_tonnes"},
    {"table": "emissions_scope2", "field": "co2_tonnes"},
    {"table": "emissions_scope3", "field": "co2_tonnes"}
  ],
  "transform": {
    "type": "sum",
    "group_by": ["period"]
  }
}
```

### Hierarchical Dimensions
Map organizational hierarchy:

```json
{
  "joins": [
    {"left": "energy", "right": "sites", "on": "site_id"},
    {"left": "sites", "right": "regions", "on": "region_id"},
    {"left": "regions", "right": "countries", "on": "country_id"}
  ],
  "group_by": ["country_id", "region_id", "site_id", "period"]
}
```

### Time-Based Windows
Aggregate across custom time periods:

```json
{
  "transform": {
    "type": "rolling_sum",
    "window": "12 months",
    "date_field": "reporting_period"
  }
}
```

## Troubleshooting

### Issue: Joins produce too many rows
**Cause:** Many-to-many relationship or incorrect join keys
**Solution:** 
- Check join keys are unique on at least one side
- Add intermediate join table if needed
- Use `DISTINCT` in transform if appropriate

### Issue: Units don't match
**Cause:** Source data in unexpected unit
**Solution:**
- Update transform factor
- Add conditional unit detection
- Validate source data quality

### Issue: Missing data after join
**Cause:** INNER JOIN filtering out null keys
**Solution:**
- Change to LEFT JOIN to preserve all records
- Add COALESCE to handle nulls

### Issue: Duplicate periods
**Cause:** Multiple records per period from source
**Solution:**
- Add aggregation transform (SUM or AVG)
- Check if source has finer granularity (daily vs monthly)

## Best Practices

1. **Start with Auto-Suggest** - Let the system propose mappings, then refine
2. **Preview Before Applying** - Always check join results before full execution
3. **Document Custom Logic** - Add notes to mappings explaining business rules
4. **Version Your Profiles** - Create new profiles for new fiscal years/changes
5. **Validate Outputs** - Use QA checks to verify mapped data quality
6. **Maintain Lineage** - System automatically tracks lineage, review regularly

## Next Steps

1. Implement visual React Flow canvas for drag-and-drop mapping
2. Add AI-assisted mapping suggestions using LLM
3. Create mapping templates for common ERP systems
4. Add mapping versioning and change tracking
5. Implement mapping preview with sample data
