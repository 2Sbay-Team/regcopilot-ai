# ESG Data Ingestion System

## Overview

This document describes the production-grade ESG data ingestion and mapping system. The system supports delta and full loads, schema discovery, visual mapping, KPI aggregation, and complete auditability.

## Architecture Components

### 1. Connectors
Connectors represent external data sources (databases, ERP systems, object storage).

**Supported Types:**
- PostgreSQL
- MySQL / MariaDB
- Microsoft SQL Server
- Snowflake
- Amazon S3
- Azure Blob Storage
- SAP
- Databricks

### 2. Load Strategies

#### Full Load
- Loads entire dataset each sync
- Uses chunking for large tables (configurable window size)
- Truncates previous data for the same scope before loading
- Best for: static reference data, small tables

#### Delta Load
- Only loads changed/new records since last sync
- Uses `updated_at` timestamp or cursor-based tracking
- Maintains `connector_sync_state` for resumability
- Best for: transactional data, large tables

**Configuration:**
```json
{
  "load_type": "delta",
  "chunk_size": 10000,
  "time_window": "1 month",
  "cursor_field": "updated_at"
}
```

### 3. Chunking & Checkpoints

**Chunking Strategy:**
- Time-based: split by month/week/day
- ID-based: split by row ID ranges
- Configurable chunk size (default: 10,000 rows)

**Checkpoint Mechanism:**
- After each chunk completes, state is saved to `connector_sync_state`
- If sync fails mid-process, it resumes from last successful chunk
- No data loss or duplication

**Resume After Timeout:**
```typescript
// System automatically resumes from:
{
  "last_cursor": "2024-01-15T10:30:00Z",
  "last_row_id": 150000,
  "last_window_start": "2024-01-01",
  "last_window_end": "2024-01-31"
}
```

### 4. Retry Logic

**Exponential Backoff:**
- Retry 1: wait 2 seconds
- Retry 2: wait 4 seconds
- Retry 3: wait 8 seconds
- After 3 failures: mark chunk as failed, continue with next chunk

**Partial Success Handling:**
- Successfully loaded chunks are never rolled back
- Failed chunks are logged with error details
- Sync status marked as `partial_success` if some chunks fail
- Failed chunks can be retried independently

## How to Add a Connector

### Step 1: Create Connector
```sql
INSERT INTO connectors (
  organization_id,
  type,
  name,
  config,
  load_type,
  status
) VALUES (
  'org-uuid',
  'postgres',
  'Production Database',
  '{
    "host": "db.example.com",
    "port": 5432,
    "database": "production",
    "schema": "public",
    "username": "readonly_user"
  }',
  'delta',
  'pending'
);
```

### Step 2: Validate Connector
Call `connector-validate` to test connectivity and permissions:
```bash
curl -X POST https://your-project.supabase.co/functions/v1/connector-validate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"connector_id": "connector-uuid"}'
```

### Step 3: Discover Schema
Call `connector-discover` to enumerate tables and columns:
```bash
curl -X POST https://your-project.supabase.co/functions/v1/connector-discover \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"connector_id": "connector-uuid"}'
```

This populates `source_schema_cache` with:
- Table names
- Column names and types
- Primary/foreign keys
- Sample data (up to 100 rows per table)

### Step 4: Configure Sync Schedule
```sql
INSERT INTO scheduled_jobs (
  organization_id,
  job_name,
  cron,
  enabled,
  config
) VALUES (
  'org-uuid',
  'Monthly Energy Data Sync',
  '0 0 1 * *',  -- First day of each month
  true,
  '{
    "connector_id": "connector-uuid",
    "action": "sync"
  }'
);
```

### Step 5: Run Initial Sync
```bash
curl -X POST https://your-project.supabase.co/functions/v1/connector-sync \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"connector_id": "connector-uuid"}'
```

## Chunk Size Configuration

Choose chunk size based on:

| Data Volume | Recommended Chunk Size | Time Window |
|-------------|----------------------|-------------|
| < 100K rows | 10,000 | N/A |
| 100K - 1M | 50,000 | 1 month |
| 1M - 10M | 100,000 | 1 week |
| > 10M | 250,000 | 1 day |

**Configuration Example:**
```json
{
  "chunking": {
    "strategy": "time",
    "field": "created_at",
    "window": "1 month",
    "size": 50000
  }
}
```

## Monitoring & Troubleshooting

### Check Sync Status
```sql
SELECT 
  c.name,
  csl.status,
  csl.started_at,
  csl.finished_at,
  csl.items_read,
  csl.items_written,
  csl.error
FROM connector_sync_logs csl
JOIN connectors c ON c.id = csl.connector_id
WHERE c.organization_id = 'your-org-id'
ORDER BY csl.started_at DESC
LIMIT 10;
```

### Resume Failed Sync
Failed syncs automatically resume from checkpoint. To manually trigger:
```bash
curl -X POST https://your-project.supabase.co/functions/v1/connector-sync \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "connector_id": "connector-uuid",
    "resume": true
  }'
```

### View Checkpoint State
```sql
SELECT * FROM connector_sync_state 
WHERE connector_id = 'connector-uuid';
```

## Performance Optimization

### Indexes
Critical indexes are automatically created:
```sql
CREATE INDEX idx_staging_connector_arrived 
  ON staging_rows(connector_id, arrived_at);

CREATE INDEX idx_staging_period 
  ON staging_rows(period);

CREATE INDEX idx_schema_cache_connector 
  ON source_schema_cache(connector_id, table_name);
```

### Batching
- Inserts use batch operations (1000 rows per batch)
- Staging data is inserted using `COPY` protocol when possible
- Minimal round trips to database

### Concurrency
- Multiple connectors can sync in parallel
- Each connector sync runs independently
- Row-level locking prevents conflicts

## Security

### Credential Storage
- Never store passwords in `config` jsonb
- Use Supabase encrypted secrets for credentials
- Rotate credentials regularly

### Row-Level Security
All tables enforce RLS based on `organization_id`:
```sql
CREATE POLICY org_isolation ON connectors
  FOR ALL USING (organization_id = auth.jwt() ->> 'organization_id');
```

### Audit Trail
Every ingestion action is logged in `esg_ingestion_audit` with:
- Input hash (what was requested)
- Output hash (what was produced)
- Previous hash (chain integrity)
- Complete metadata

## Deviations & Rationale

### 1. Simulated External Connections
**Current:** Demo mode simulates external data sources with synthetic data.
**Production:** Implement actual SDK/API clients for each connector type.
**Rationale:** Allows full testing of ingestion pipeline without external dependencies.

### 2. Simplified Retry Logic
**Current:** 3 retries with exponential backoff, then skip chunk.
**Production:** Consider dead-letter queue for failed chunks with manual review.
**Rationale:** Balances reliability with complexity for MVP.

### 3. Schema Discovery Sampling
**Current:** Samples up to 100 rows per table for preview.
**Production:** Configurable sample size with statistical sampling for large tables.
**Rationale:** Provides sufficient preview without overwhelming system.

## Next Steps

1. Implement actual connector SDKs for production systems
2. Add connector credential management UI
3. Create monitoring dashboard for sync health
4. Add alerting for failed syncs
5. Implement advanced scheduling (dependencies, retries, priorities)
