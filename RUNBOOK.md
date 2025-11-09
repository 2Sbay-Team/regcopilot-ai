# Compliance & ESG Copilot – Operations Runbook

## 🎯 Purpose

This runbook provides operational procedures, troubleshooting guides, and maintenance protocols for platform administrators and DevOps teams managing the Compliance & ESG Copilot in production.

---

## 📋 System Overview

### Architecture Stack

**Frontend**:
- React 18 + TypeScript
- Vite build system
- Tailwind CSS + shadcn/ui components
- React Query for state management
- PWA-enabled (offline capability)

**Backend**:
- Supabase (PostgreSQL + pgvector)
- Deno Edge Functions
- Row-Level Security (RLS) policies
- Real-time subscriptions

**AI Layer**:
- OpenAI API (GPT-4o, text-embedding-3-large)
- Google Gemini (gemini-2.0-flash-exp)
- Mistral AI models
- Multi-model AI Gateway

**Storage**:
- Supabase Storage buckets (GDPR docs, ESG docs, connector files)
- S3-compatible object storage

**Authentication**:
- Supabase Auth (JWT-based)
- Multi-factor authentication (TOTP)
- Password leak detection
- Auth audit logging

---

## 🚀 Deployment Procedures

### Production Deployment Checklist

```bash
# 1. Pre-deployment checks
- [ ] All tests passing
- [ ] Database migrations reviewed
- [ ] Edge functions validated
- [ ] Environment variables configured
- [ ] SSL certificates valid
- [ ] Backup completed

# 2. Deployment steps
- [ ] Run database migrations
- [ ] Deploy edge functions
- [ ] Build frontend assets
- [ ] Update CDN cache
- [ ] Verify health endpoints
- [ ] Monitor error logs

# 3. Post-deployment verification
- [ ] Test authentication flow
- [ ] Run smoke tests on all copilots
- [ ] Verify connector sync jobs
- [ ] Check scheduled cron jobs
- [ ] Monitor performance metrics
- [ ] Validate audit log integrity
```

### Rolling Back Deployment

```bash
# Database rollback
psql $DATABASE_URL -c "SELECT version FROM supabase_migrations ORDER BY version DESC LIMIT 5;"
# Identify migration to rollback to
psql $DATABASE_URL -f migrations/[version]_rollback.sql

# Edge function rollback
supabase functions deploy [function-name] --version [previous-version]

# Frontend rollback
# Restore previous build artifacts from backup
aws s3 sync s3://backup-bucket/build-[timestamp] ./dist
# Invalidate CDN cache
aws cloudfront create-invalidation --distribution-id [id] --paths "/*"
```

---

## 🔧 Configuration Management

### Environment Variables

**Required Variables**:
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_ANON_KEY=[anon-key]
VITE_SUPABASE_PROJECT_ID=[project-id]

# Edge Function Secrets (Supabase Secrets)
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
SUPABASE_DB_URL=postgresql://[connection-string]
OPENAI_API_KEY=[openai-key]
MISTRAL_API_KEY=[mistral-key]
GOOGLE_API_KEY=[google-key]
```

### Database Connection Strings

**Production**:
```
postgresql://postgres.[project-id]:[password]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
```

**Connection Pooling**:
- Mode: Transaction
- Pool size: 15
- Max lifetime: 3600s

---

## 📊 Monitoring & Observability

### Health Check Endpoints

```bash
# Frontend health
curl https://app.compliancecopilot.ai/health

# Database health
curl https://[project-id].supabase.co/rest/v1/

# Edge function health
curl https://[project-id].supabase.co/functions/v1/health
```

### Key Metrics to Monitor

**Application Metrics**:
- Request latency (P50, P95, P99)
- Error rate (target: < 1%)
- Uptime (target: 99.9%)
- Active users (concurrent sessions)

**Database Metrics**:
- Connection pool utilization
- Query execution time
- Database size growth
- Replication lag (if applicable)

**Edge Function Metrics**:
- Invocation count
- Execution duration
- Cold start frequency
- Error count by function

**Storage Metrics**:
- Bucket size
- Upload/download throughput
- Failed uploads
- Storage quota utilization

### Alerting Thresholds

```yaml
alerts:
  - metric: error_rate
    threshold: 2%
    duration: 5m
    severity: critical
    
  - metric: response_time_p95
    threshold: 2000ms
    duration: 10m
    severity: warning
    
  - metric: database_connections
    threshold: 80%
    duration: 5m
    severity: warning
    
  - metric: edge_function_errors
    threshold: 10/min
    duration: 5m
    severity: critical
    
  - metric: storage_quota
    threshold: 90%
    severity: warning
```

---

## 🔍 Troubleshooting Guide

### Issue: Authentication Failures

**Symptoms**:
- Users unable to login
- JWT token errors
- MFA verification failures

**Diagnosis**:
```sql
-- Check recent auth errors
SELECT * FROM auth_audit_logs 
WHERE success = false 
ORDER BY created_at DESC 
LIMIT 50;

-- Check MFA setup status
SELECT p.email, p.mfa_enabled, COUNT(mbc.id) as backup_codes
FROM profiles p
LEFT JOIN mfa_backup_codes mbc ON p.id = mbc.user_id
GROUP BY p.id, p.email, p.mfa_enabled;
```

**Resolution**:
1. Verify Supabase Auth service status
2. Check JWT secret configuration
3. Clear user sessions if needed:
   ```sql
   DELETE FROM auth.sessions WHERE user_id = '[user-id]';
   ```
4. Reset MFA if locked out:
   ```sql
   UPDATE profiles SET mfa_enabled = false WHERE id = '[user-id]';
   DELETE FROM mfa_backup_codes WHERE user_id = '[user-id]';
   ```

---

### Issue: Edge Function Timeouts

**Symptoms**:
- 504 Gateway Timeout errors
- Slow assessment generation
- Incomplete responses

**Diagnosis**:
```bash
# Check edge function logs
supabase functions logs [function-name] --limit 100

# Check execution duration
SELECT 
  function_name, 
  AVG(execution_time_ms) as avg_time,
  MAX(execution_time_ms) as max_time,
  COUNT(*) as invocations
FROM function_logs
WHERE timestamp > NOW() - INTERVAL '1 hour'
GROUP BY function_name;
```

**Resolution**:
1. Increase function timeout (max 300s for Pro plan)
2. Optimize database queries (add indexes)
3. Implement response streaming for large outputs
4. Add retry logic with exponential backoff
5. Consider function decomposition for complex workflows

---

### Issue: Connector Sync Failures

**Symptoms**:
- Data sources not updating
- Sync logs showing errors
- Missing files in storage

**Diagnosis**:
```sql
-- Check recent sync failures
SELECT 
  c.name,
  c.connector_type,
  csl.status,
  csl.error_message,
  csl.started_at
FROM connector_sync_logs csl
JOIN connectors c ON csl.connector_id = c.id
WHERE csl.status = 'failed'
ORDER BY csl.started_at DESC
LIMIT 20;

-- Check connector configuration
SELECT 
  id, 
  name, 
  connector_type, 
  status, 
  last_sync_at,
  last_error
FROM connectors
WHERE status = 'error';
```

**Resolution**:
1. Verify connector credentials are valid
2. Check API rate limits for external services
3. Validate network connectivity
4. Review and fix configuration errors
5. Manually trigger sync for testing:
   ```sql
   SELECT supabase.functions.invoke(
     'connector-sync',
     json_build_object('connector_id', '[connector-id]')
   );
   ```

---

### Issue: High Database CPU

**Symptoms**:
- Slow query execution
- Timeouts on dashboard load
- Connection pool exhaustion

**Diagnosis**:
```sql
-- Find slow queries
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Check long-running queries
SELECT 
  pid,
  now() - query_start as duration,
  state,
  query
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY duration DESC;

-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;
```

**Resolution**:
1. Add missing indexes on frequently queried columns
2. Optimize N+1 queries with JOINs
3. Implement query result caching
4. Archive old data (use retention policies)
5. Upgrade database instance size if needed

---

### Issue: RAG Search Returns Poor Results

**Symptoms**:
- Irrelevant search results
- Low similarity scores
- Missing expected regulations

**Diagnosis**:
```sql
-- Check embedding quality
SELECT 
  COUNT(*) as total_chunks,
  COUNT(CASE WHEN embedding IS NOT NULL THEN 1 END) as with_embeddings,
  AVG(LENGTH(content)) as avg_content_length
FROM document_chunks;

-- Test similarity search
SELECT 
  content,
  metadata->>'source' as source,
  1 - (embedding <=> '[query-embedding]'::vector) as similarity
FROM document_chunks
ORDER BY embedding <=> '[query-embedding]'::vector
LIMIT 10;
```

**Resolution**:
1. Re-run embedding generation for documents:
   ```bash
   supabase functions invoke seed-regulations
   ```
2. Verify OpenAI API key is valid
3. Check embedding model version consistency
4. Adjust similarity threshold (default: 0.7)
5. Update regulatory document corpus

---

## 🔐 Security Operations

### RLS Policy Audit

```sql
-- List all tables without RLS enabled
SELECT 
  schemaname,
  tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename NOT IN (
    SELECT tablename 
    FROM pg_policies
  );

-- Review RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Secrets Rotation Procedure

```bash
# 1. Generate new secrets
NEW_SECRET=$(openssl rand -base64 32)

# 2. Update in Supabase Secrets
supabase secrets set OPENAI_API_KEY=$NEW_SECRET

# 3. Update in environment variables
# Update .env.production

# 4. Redeploy edge functions
supabase functions deploy --all

# 5. Verify functionality
curl -X POST https://[project-id].supabase.co/functions/v1/ai-gateway \
  -H "Authorization: Bearer $ANON_KEY" \
  -d '{"test": true}'

# 6. Revoke old secret from provider
# (e.g., OpenAI dashboard)
```

### User Access Audit

```sql
-- List users and their roles
SELECT 
  p.email,
  p.full_name,
  o.name as organization,
  ur.role,
  p.mfa_enabled,
  p.created_at
FROM profiles p
JOIN organizations o ON p.organization_id = o.id
LEFT JOIN user_roles ur ON p.id = ur.user_id
ORDER BY p.created_at DESC;

-- Check recent auth anomalies
SELECT 
  aal.user_id,
  p.email,
  aal.event_type,
  aal.ip_address,
  aal.success,
  aal.created_at
FROM auth_audit_logs aal
JOIN profiles p ON aal.user_id = p.id
WHERE aal.success = false
  AND aal.created_at > NOW() - INTERVAL '24 hours'
ORDER BY aal.created_at DESC;
```

---

## 📅 Scheduled Maintenance

### Daily Tasks

```bash
# Check system health
curl https://app.compliancecopilot.ai/health

# Review error logs
supabase functions logs --tail 100 | grep ERROR

# Check database size
psql $DATABASE_URL -c "SELECT pg_size_pretty(pg_database_size('postgres'));"

# Verify backup completion
# (automated via Supabase daily backups)
```

### Weekly Tasks

```bash
# Analyze database performance
psql $DATABASE_URL -c "VACUUM ANALYZE;"

# Review slow queries
psql $DATABASE_URL -c "SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"

# Check storage usage
psql $DATABASE_URL -c "
SELECT 
  bucket_id, 
  COUNT(*) as file_count,
  pg_size_pretty(SUM(metadata->>'size'::bigint)) as total_size
FROM storage.objects
GROUP BY bucket_id;
"

# Review connector sync success rates
psql $DATABASE_URL -c "
SELECT 
  connector_type,
  status,
  COUNT(*) as sync_count,
  ROUND(AVG(records_processed)) as avg_records
FROM connector_sync_logs
WHERE started_at > NOW() - INTERVAL '7 days'
GROUP BY connector_type, status;
"
```

### Monthly Tasks

```bash
# Run data retention purge (automated via cron)
psql $DATABASE_URL -c "SELECT public.purge_old_audit_logs();"

# Review and optimize indexes
psql $DATABASE_URL -c "SELECT * FROM pg_stat_user_indexes WHERE idx_scan < 100;"

# Update SSL certificates (if self-managed)

# Review user access and remove inactive accounts
psql $DATABASE_URL -c "
SELECT email, last_sign_in_at
FROM auth.users
WHERE last_sign_in_at < NOW() - INTERVAL '90 days';
"

# Generate monthly compliance report
curl -X POST https://[project-id].supabase.co/functions/v1/generate-unified-report \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -d '{"period": "monthly"}'
```

---

## 🔄 Backup & Recovery

### Backup Strategy

**Database Backups**:
- Automated daily backups (Supabase Pro)
- Retention: 7 days (Point-in-Time Recovery available)
- Manual backup before major changes

**Storage Backups**:
- Weekly S3 bucket replication
- Immutable backups with versioning enabled

**Configuration Backups**:
- Version-controlled infrastructure as code
- Environment variables stored in secure vault

### Disaster Recovery Procedure

**RTO (Recovery Time Objective)**: 4 hours  
**RPO (Recovery Point Objective)**: 15 minutes

```bash
# 1. Assess incident severity
# Determine if full recovery is needed

# 2. Restore database
supabase db restore --backup-id [backup-id]

# 3. Restore edge functions
supabase functions deploy --all

# 4. Restore frontend
aws s3 sync s3://backup-bucket/latest ./dist
# Deploy to production

# 5. Verify data integrity
psql $DATABASE_URL -f scripts/verify_data_integrity.sql

# 6. Test critical paths
./scripts/smoke_test.sh

# 7. Update DNS if failover occurred

# 8. Monitor error rates for 24h post-recovery
```

---

## 📈 Performance Optimization

### Database Optimization

```sql
-- Add composite indexes for common queries
CREATE INDEX CONCURRENTLY idx_audit_logs_org_timestamp 
ON audit_logs(organization_id, timestamp DESC);

CREATE INDEX CONCURRENTLY idx_assessment_org_date 
ON ai_act_assessments(organization_id, assessment_date DESC);

-- Partition large tables (if > 10M rows)
-- Example for audit_logs
CREATE TABLE audit_logs_2025_01 PARTITION OF audit_logs
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- Enable parallel query execution
ALTER DATABASE postgres SET max_parallel_workers_per_gather = 4;
```

### Edge Function Optimization

```typescript
// Implement response streaming
async function handleLargeResponse(req: Request) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // Stream chunks as they're generated
      for await (const chunk of generateResponse()) {
        controller.enqueue(encoder.encode(JSON.stringify(chunk) + '\n'));
      }
      controller.close();
    },
  });
  
  return new Response(stream, {
    headers: { 'Content-Type': 'application/x-ndjson' },
  });
}

// Use connection pooling
const supabase = createClient(url, key, {
  db: { pooler: { max: 10, idleTimeout: 60000 } },
});
```

### Frontend Optimization

```tsx
// Implement virtualization for large lists
import { VirtualList } from '@tanstack/react-virtual';

// Code splitting
const ESGCopilot = lazy(() => import('./pages/ESGCopilot'));

// Image optimization
<img 
  src={imageUrl} 
  loading="lazy" 
  srcSet={`${imageUrl}?w=400 400w, ${imageUrl}?w=800 800w`}
/>
```

---

## 🧪 Testing Procedures

### Smoke Tests

```bash
#!/bin/bash
# smoke_test.sh

echo "Running smoke tests..."

# Test authentication
curl -X POST https://app.compliancecopilot.ai/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}' \
  | jq '.access_token' || exit 1

# Test AI Act copilot
curl -X POST https://[project-id].supabase.co/functions/v1/ai-act-auditor \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"system_name":"Test System","purpose":"Testing"}' \
  | jq '.risk_category' || exit 1

# Test RAG search
curl -X POST https://[project-id].supabase.co/functions/v1/rag-search \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"query":"high-risk AI systems"}' \
  | jq '.chunks | length' || exit 1

echo "✅ All smoke tests passed"
```

### Load Testing

```bash
# Use Apache Bench for load testing
ab -n 1000 -c 10 -H "Authorization: Bearer $TOKEN" \
  https://[project-id].supabase.co/functions/v1/health

# Or use k6 for complex scenarios
k6 run scripts/load_test.js
```

---

## 📞 Incident Response

### Severity Levels

**P0 (Critical)**:
- Complete service outage
- Data breach or security incident
- Data loss or corruption
- Response time: Immediate

**P1 (High)**:
- Major feature unavailable
- Performance degradation affecting all users
- Response time: 1 hour

**P2 (Medium)**:
- Minor feature unavailable
- Performance degradation affecting some users
- Response time: 4 hours

**P3 (Low)**:
- Cosmetic issues
- Non-critical bugs
- Response time: 24 hours

### Incident Response Checklist

```markdown
1. **Detection**
   - [ ] Alert received via monitoring
   - [ ] User report validated
   - [ ] Severity assessed

2. **Triage**
   - [ ] Incident channel created (#incident-[id])
   - [ ] On-call engineer paged
   - [ ] Initial investigation started

3. **Mitigation**
   - [ ] Immediate workaround identified
   - [ ] Traffic rerouted if needed
   - [ ] Status page updated

4. **Resolution**
   - [ ] Root cause identified
   - [ ] Fix implemented and tested
   - [ ] Deployment completed
   - [ ] Monitoring confirms resolution

5. **Post-Mortem**
   - [ ] Incident timeline documented
   - [ ] Root cause analysis completed
   - [ ] Action items created
   - [ ] Post-mortem review scheduled
```

---

## 📚 Runbook Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-09 | DevOps Team | Initial runbook creation |

---

**Document Owner**: DevOps Team  
**Last Review**: 2025-11-09  
**Next Review**: 2025-12-09  
**Classification**: Internal Use Only
