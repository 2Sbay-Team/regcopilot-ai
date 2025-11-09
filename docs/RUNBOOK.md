# Compliance & ESG Copilot - Operations Runbook

**Version**: 4.2.0  
**Last Updated**: 2025-11-09  
**Maintained By**: DevOps Team

---

## Table of Contents

1. [Overview](#1-overview)
2. [Environment Configuration](#2-environment-configuration)
3. [Database Management](#3-database-management)
4. [Edge Functions](#4-edge-functions)
5. [Frontend Deployment](#5-frontend-deployment)
6. [Security & Compliance](#6-security--compliance)
7. [Troubleshooting](#7-troubleshooting)
8. [Operations SOPs](#8-operations-sops)
9. [SLOs & Monitoring](#9-slos--monitoring)
10. [Roadmap & Future Enhancements](#10-roadmap--future-enhancements)

---

## 1. Overview

### 1.1 System Purpose

The Compliance & ESG Copilot is an AI-powered RegTech platform that automates compliance assessments across multiple regulatory frameworks:

- **EU AI Act** - Risk classification and conformity assessment
- **GDPR** - Privacy compliance and DSAR management
- **CSRD/ESRS** - ESG reporting and sustainability metrics
- **NIS2** - Cybersecurity maturity assessment
- **DORA** - ICT operational resilience
- **DMA** - Digital platform gatekeeping compliance

### 1.2 Architecture Overview

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────────────────────────┐
│   Lovable Cloud (Frontend)      │
│   - React + TypeScript + Vite   │
│   - Tailwind CSS + shadcn-ui    │
└──────────────┬──────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│   Supabase (Backend)             │
│   ┌─────────────────────────┐   │
│   │  PostgreSQL + pgvector  │   │
│   │  - RLS + Audit Logs     │   │
│   └─────────────────────────┘   │
│   ┌─────────────────────────┐   │
│   │  Deno Edge Functions    │   │
│   │  - Copilot Logic        │   │
│   │  - RAG Retrieval        │   │
│   └─────────────────────────┘   │
│   ┌─────────────────────────┐   │
│   │  Supabase Auth          │   │
│   │  - JWT + MFA + RLS      │   │
│   └─────────────────────────┘   │
│   ┌─────────────────────────┐   │
│   │  Storage Buckets        │   │
│   │  - GDPR/ESG Documents   │   │
│   └─────────────────────────┘   │
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│   Lovable AI Gateway             │
│   - google/gemini-2.5-pro/flash  │
│   - text-embedding-3-large       │
└──────────────────────────────────┘
```

### 1.3 Data Flow

**User Interaction Flow**:
1. User logs in → Supabase Auth validates JWT
2. User submits assessment → Edge function processes request
3. Edge function calls Lovable AI → LLM analyzes input
4. RAG system retrieves relevant regulations → pgvector search
5. Result stored in DB → RLS ensures org isolation
6. Audit log created → Hash chain updated
7. User receives response → Toast notification shown

**Feedback Loop Flow**:
1. User provides feedback → FeedbackButton component
2. Feedback submitted → `/feedback-handler` edge function
3. Validated & sanitized → PII removed
4. Stored in `chunk_feedback` → RLS applied
5. Materialized view refreshed → `chunk_feedback_scores` updated
6. Audit log created → Event logged
7. Next RAG search → Feedback scores influence ranking

---

## 2. Environment Configuration

### 2.1 Required Environment Variables

**Frontend (.env)**:
```bash
# Lovable Cloud auto-manages these - DO NOT edit manually
VITE_SUPABASE_URL=https://usaygwvfanqlpruyzmhl.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID=usaygwvfanqlpruyzmhl
```

**Backend (Supabase Secrets)**:
```bash
# Managed via Lovable Secrets UI
SUPABASE_URL=https://usaygwvfanqlpruyzmhl.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # ⚠️ NEVER expose
LOVABLE_API_KEY=lov_... # For AI Gateway access
```

### 2.2 Secrets Management

**Adding Secrets** (via Lovable UI):
1. Open project in Lovable
2. Click Settings → Secrets
3. Add secret name and value
4. Secret available as `Deno.env.get('SECRET_NAME')` in edge functions

**Security Rules**:
- ❌ NEVER commit secrets to git
- ❌ NEVER log secret values
- ❌ NEVER expose service role key to frontend
- ✅ Use `SUPABASE_SERVICE_ROLE_KEY` only in edge functions
- ✅ Use `SUPABASE_ANON_KEY` in frontend

### 2.3 Database Connection

**Supabase Connection Pooling**:
- Direct connection: Port 5432 (limited to 60 connections)
- Pooled connection: Port 6543 (recommended for serverless)
- Connection string: Available in Supabase dashboard

**Connection from Edge Functions**:
```typescript
import { createClient } from '@supabase/supabase-js@2.80.0'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)
```

### 2.4 RLS Policy Summary

**Key Principles**:
- All user data scoped by `organization_id`
- Service role bypasses RLS for system operations
- `SECURITY DEFINER` functions prevent RLS recursion
- Audit logs readable by org, writable by service role only

**Helper Functions**:
```sql
-- Get user's organization ID
get_user_organization_id(auth.uid()) → uuid

-- Check if user has role
has_role(auth.uid(), 'admin'::app_role) → boolean
```

---

## 3. Database Management

### 3.1 Migration History

**Applied Migrations** (chronological):
1. `20250101_initial_schema.sql` - Base tables (orgs, profiles, user_roles)
2. `20250102_copilot_tables.sql` - Assessment tables (ai_act, gdpr, esg)
3. `20250103_audit_chain.sql` - Audit logs + hash chain trigger
4. `20250104_rag_system.sql` - Document chunks + embeddings
5. `20250105_connectors.sql` - Data source connectors
6. `20250106_agent_queue.sql` - Automated task queue
7. `20250107_feedback.sql` - Feedback tables + materialized view
8. `20250108_mfa_security.sql` - MFA enrollment + password leak check
9. `20250109_data_retention.sql` - Retention policies + pg_cron

**Running Migrations**:
- Migrations auto-apply via Lovable Cloud
- Manual apply: Use Lovable Supabase UI → Migrations tab
- Rollback: Not supported - use manual SQL to reverse changes

### 3.2 Table Schemas

**Core Tables**:
| Table | Purpose | RLS Scope | Key Columns |
|-------|---------|-----------|-------------|
| `organizations` | Tenant isolation | Global | `id`, `name`, `country_code` |
| `profiles` | User metadata | User-owned | `id`, `organization_id`, `email` |
| `user_roles` | RBAC | User-owned | `user_id`, `role` (admin/analyst/user) |
| `audit_logs` | Compliance trail | Org-scoped | `organization_id`, `prev_hash`, `output_hash` |

**Assessment Tables**:
| Table | Purpose | Copilot Module |
|-------|---------|----------------|
| `ai_act_assessments` | AI system risk classification | AI Act Auditor |
| `gdpr_assessments` | Privacy compliance scan | GDPR Checker |
| `esg_reports` | Sustainability metrics | ESG Reporter |
| `nis2_assessments` | Cybersecurity maturity | NIS2 Assessor |
| `dora_assessments` | ICT resilience | DORA Assessor |
| `dma_assessments` | Platform gatekeeping | DMA Assessor |

**Feedback Tables**:
| Table | Purpose | Retention |
|-------|---------|-----------|
| `chunk_feedback` | User signals on citations | 12 months |
| `retrieval_feedback` | Search quality metrics | 12 months |
| `org_policies` | Custom knowledge overlay | Permanent |
| `chunk_feedback_scores` | Aggregated scores (MV) | Auto-refresh |

### 3.3 Materialized View Management

**Chunk Feedback Scores**:
```sql
-- View definition
CREATE MATERIALIZED VIEW chunk_feedback_scores AS
SELECT 
  chunk_id,
  SUM(CASE WHEN signal='upvote' THEN weight ELSE 0 END) - 
  SUM(CASE WHEN signal='downvote' THEN weight ELSE 0 END) AS score,
  COUNT(*) AS total_votes,
  MAX(created_at) AS last_feedback_at
FROM chunk_feedback
GROUP BY chunk_id;
```

**Manual Refresh**:
```sql
-- Concurrent refresh (non-blocking)
REFRESH MATERIALIZED VIEW CONCURRENTLY chunk_feedback_scores;

-- Or via function
SELECT refresh_chunk_feedback_scores();
```

**Auto-Refresh Trigger**:
- Triggers after each feedback submission
- Uses `CONCURRENTLY` to avoid lock contention
- Typically completes in <500ms for 100k rows

### 3.4 Index Optimization

**Critical Indexes**:
```sql
-- Feedback queries
CREATE INDEX idx_chunk_feedback_org ON chunk_feedback(organization_id, chunk_id);

-- Vector search
CREATE INDEX idx_document_chunks_embedding ON document_chunks 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Org policies
CREATE INDEX idx_org_policies_embedding ON org_policies 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Audit logs
CREATE INDEX idx_audit_logs_org_time ON audit_logs(organization_id, timestamp DESC);
```

**Index Maintenance**:
```sql
-- Check index bloat
SELECT schemaname, tablename, indexname, 
       pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
ORDER BY pg_relation_size(indexrelid) DESC;

-- Rebuild bloated index
REINDEX INDEX CONCURRENTLY idx_name;
```

---

## 4. Edge Functions

### 4.1 Function Inventory

**Copilot Modules**:
| Function | Purpose | Auth | Timeout |
|----------|---------|------|---------|
| `ai-act-auditor` | Risk classification | JWT | 30s |
| `gdpr-checker` | Privacy scan | JWT | 30s |
| `esg-reporter` | Sustainability report | JWT | 30s |
| `nis2-assessor` | Cybersecurity assessment | JWT | 30s |
| `dora-assessor` | ICT resilience | JWT | 30s |
| `dma-assessor` | Platform compliance | JWT | 30s |

**Supporting Functions**:
| Function | Purpose | Auth | Timeout |
|----------|---------|------|---------|
| `feedback-handler` | Process user feedback | JWT | 10s |
| `rag-search` | Retrieve regulations | None | 15s |
| `seed-regulations` | Initialize RAG corpus | None | 60s |
| `refresh-feedback-views` | Admin MV refresh | JWT (admin) | 5s |
| `mfa-setup` | MFA enrollment | JWT | 10s |
| `password-leak-check` | HaveIBeenPwned check | JWT | 5s |

### 4.2 Deployment Process

**Automatic Deployment** (Lovable Cloud):
1. Commit edge function code to repo
2. Lovable Cloud detects changes
3. Functions auto-deploy within 2-3 minutes
4. Version history maintained

**Manual Deployment** (CLI - if needed):
```bash
# Not typically required with Lovable Cloud
supabase functions deploy <function-name>
```

### 4.3 Function Configuration

**JWT Verification** (`supabase/config.toml`):
```toml
# Public endpoints (no auth)
[functions.rag-search]
verify_jwt = false

# Authenticated endpoints
[functions.feedback-handler]
verify_jwt = true

# Admin-only endpoints
[functions.refresh-feedback-views]
verify_jwt = true
```

**CORS Headers** (all functions):
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Handle preflight
if (req.method === 'OPTIONS') {
  return new Response(null, { headers: corsHeaders })
}
```

### 4.4 Function Monitoring

**Viewing Logs**:
1. Lovable UI → Cloud → Edge Functions → Select function
2. View real-time logs and error traces
3. Filter by status code or search term

**Log Retention**: 7 days (Lovable Cloud default)

**Alerting**:
- Set up external monitoring (e.g., Sentry, DataDog)
- Forward logs to external service via webhooks

---

## 5. Frontend Deployment

### 5.1 Build Process

**Vite Build**:
```bash
# Automatic via Lovable Cloud on every commit
npm run build

# Output: dist/ directory
# - index.html
# - assets/index-[hash].js
# - assets/index-[hash].css
```

**Environment Variables**:
- Injected at build time via `import.meta.env.VITE_*`
- Managed by Lovable Cloud (no manual .env editing)

### 5.2 Deployment Workflow

**Lovable Cloud Deployment**:
1. Code committed to Lovable repo
2. Build triggered automatically
3. Frontend builds complete (~2 min)
4. Edge functions deploy (~3 min)
5. Live preview updates

**Production Deployment**:
1. Click "Publish" button (top right)
2. Review changes in publish dialog
3. Click "Update" to deploy frontend changes
4. Backend (edge functions) already deployed

**Rollback**:
1. Open project history
2. Find previous working version
3. Click "Restore" to rollback

### 5.3 PWA Configuration

**Manifest** (`public/manifest.json`):
```json
{
  "name": "Compliance & ESG Copilot",
  "short_name": "ESG Copilot",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4f46e5",
  "icons": [...]
}
```

**Service Worker**:
- Auto-generated by `vite-plugin-pwa`
- Caches static assets for offline use
- Updates on new deployment

**Install Prompt**:
- Automatic on supported browsers
- Shows "Install App" banner

---

## 6. Security & Compliance

### 6.1 RLS Enforcement Patterns

**Organization Isolation**:
```sql
-- Standard RLS pattern
CREATE POLICY "Users can view their org's data"
ON table_name FOR SELECT
USING (organization_id = get_user_organization_id(auth.uid()));
```

**Role-Based Access**:
```sql
-- Admin-only access
CREATE POLICY "Admins can manage data"
ON table_name FOR ALL
USING (
  organization_id = get_user_organization_id(auth.uid()) AND
  has_role(auth.uid(), 'admin'::app_role)
);
```

**Service Role Bypass**:
```sql
-- System operations (edge functions)
CREATE POLICY "Service role can write audit logs"
ON audit_logs FOR INSERT
WITH CHECK (true);
```

### 6.2 PII Redaction

**Sanitization Function** (`supabase/functions/_shared/sanitize.ts`):
```typescript
export function sanitizeInput(input: string, maxLength = 2000): string {
  // Remove control characters
  let sanitized = input.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')
  
  // Remove Unicode direction overrides
  sanitized = sanitized.replace(/[\u202A-\u202E\u2066-\u2069]/g, '')
  
  // Limit length
  return sanitized.slice(0, maxLength).trim()
}
```

**Usage in Edge Functions**:
```typescript
import { sanitizeInput } from '../_shared/sanitize.ts'

const userInput = await req.json()
const safeNotes = sanitizeInput(userInput.notes, 500)
```

### 6.3 Audit Logging

**Standard Audit Entry**:
```typescript
await supabase.from('audit_logs').insert({
  organization_id: orgId,
  actor_id: userId,
  agent: 'user', // or 'system'
  event_type: 'assessment_created',
  event_category: 'compliance',
  action: 'ai_act_audit',
  status: 'success',
  input_hash: inputHash,
  output_hash: outputHash,
  request_payload: { /* redacted */ }
})
```

**Hash Generation** (SHA-256):
```typescript
const hashBuffer = await crypto.subtle.digest(
  'SHA-256', 
  new TextEncoder().encode(data)
)
const hash = Array.from(new Uint8Array(hashBuffer))
  .map(b => b.toString(16).padStart(2, '0'))
  .join('')
  .padStart(64, '0')
```

### 6.4 Data Retention

**Automated Purge** (`pg_cron`):
```sql
-- Schedule monthly cleanup
SELECT cron.schedule(
  'monthly_data_purge',
  '0 3 1 * *', -- 1st of month at 3 AM
  $$CALL purge_old_audit_logs();$$
);
```

**Manual Cleanup**:
```sql
-- Delete audit logs older than 12 months
DELETE FROM audit_logs WHERE timestamp < NOW() - INTERVAL '12 months';

-- Delete old feedback
DELETE FROM chunk_feedback WHERE created_at < NOW() - INTERVAL '12 months';
```

**GDPR Deletion**:
```sql
-- Delete all user data
SELECT gdpr_delete_user_data('user@example.com');
```

---

## 7. Troubleshooting

### 7.1 Dashboard Blank / No Data

**Symptoms**: Analytics dashboard shows no charts or empty tables

**Common Causes**:
1. ✅ RLS policy blocking query
2. ✅ User not assigned to organization
3. ✅ Materialized view not refreshed
4. ✅ Frontend query error (check console)

**Debugging Steps**:
```sql
-- 1. Check user's organization
SELECT id, organization_id FROM profiles WHERE id = '<user_id>';

-- 2. Verify RLS policies
SELECT * FROM chunk_feedback WHERE organization_id = '<org_id>';

-- 3. Check MV data
SELECT COUNT(*) FROM chunk_feedback_scores;

-- 4. Manually refresh MV
REFRESH MATERIALIZED VIEW CONCURRENTLY chunk_feedback_scores;
```

**Frontend Debugging**:
1. Open browser DevTools → Console
2. Look for 400/403/500 errors
3. Check Network tab for failed requests
4. Verify JWT token is present in request headers

### 7.2 No Re-Ranking Effect

**Symptoms**: Feedback submitted but RAG results unchanged

**Common Causes**:
1. ✅ Feedback scores not applied in `rag-search` function
2. ✅ Normalization not applied to scores
3. ✅ Hybrid scoring weights incorrect
4. ✅ MV refresh failed

**Verification**:
```sql
-- Check if scores exist
SELECT chunk_id, score, total_votes 
FROM chunk_feedback_scores 
ORDER BY score DESC LIMIT 10;

-- Check feedback submissions
SELECT COUNT(*), signal FROM chunk_feedback GROUP BY signal;
```

**Fix**:
1. Ensure `rag-search` joins on `chunk_feedback_scores`
2. Verify hybrid scoring formula: `0.6*cosine + 0.25*text + 0.15*feedback`
3. Normalize scores: `(score - min) / (max - min)`

### 7.3 MV Refresh Locked

**Symptoms**: `REFRESH MATERIALIZED VIEW` hangs or times out

**Cause**: Concurrent refresh blocked by active queries

**Solution**:
```sql
-- Check for blocking queries
SELECT pid, query, state, wait_event_type, wait_event
FROM pg_stat_activity
WHERE query LIKE '%chunk_feedback_scores%';

-- Terminate blocking query (if safe)
SELECT pg_terminate_backend(pid) WHERE pid = <blocking_pid>;

-- Refresh with CONCURRENTLY (non-blocking)
REFRESH MATERIALIZED VIEW CONCURRENTLY chunk_feedback_scores;
```

**Prevention**:
- Always use `CONCURRENTLY` for production refreshes
- Schedule refreshes during low-traffic hours (3-5 AM)
- Monitor query duration and set alerts for >1s refreshes

### 7.4 Rate Limits / AI Provider Errors

**Symptoms**: 429 "Too Many Requests" or 503 "Service Unavailable"

**Lovable AI Gateway Limits**:
- Free tier: 1000 requests/day
- Pro tier: 10,000 requests/day
- Enterprise: Unlimited

**Debugging**:
```typescript
// Check edge function logs for error details
console.error('AI Gateway error:', error)

// Typical error response
{
  "error": "Rate limit exceeded",
  "retry_after": 60 // seconds
}
```

**Mitigation**:
1. Implement exponential backoff retry logic
2. Cache embeddings for frequently queried chunks
3. Batch multiple requests together
4. Fallback to text-only search if AI unavailable

---

## 8. Operations SOPs

### 8.1 Weekly Operations

**Every Monday 9 AM**:
1. ✅ Verify MV refresh completed successfully
   ```sql
   SELECT * FROM cron_job_logs 
   WHERE job_name = 'monthly_data_purge' 
   ORDER BY started_at DESC LIMIT 5;
   ```

2. ✅ Review feedback analytics dashboard
   - Check for anomalies in submission rates
   - Identify top "missing citation" queries
   - Review satisfaction trends by module

3. ✅ Export organization feedback CSV
   ```sql
   \copy (SELECT * FROM chunk_feedback WHERE organization_id = '<org_id>') TO 'feedback_export.csv' CSV HEADER;
   ```

4. ✅ Check edge function error rates
   - Target: <2% error rate
   - Alert if >5% for 24 hours

### 8.2 Monthly Operations

**First Monday of Month**:
1. ✅ Review "missing citations" hotspot report
   ```sql
   SELECT module, query, COUNT(*) AS missing_count
   FROM retrieval_feedback
   WHERE missing_citation = true
     AND created_at > NOW() - INTERVAL '30 days'
   GROUP BY 1, 2
   ORDER BY missing_count DESC
   LIMIT 20;
   ```

2. ✅ Curate new regulatory content based on feedback
   - Identify top 5 missing citation queries
   - Research relevant regulations
   - Add to RAG corpus via `seed-regulations`

3. ✅ Review retention policy compliance
   ```sql
   SELECT COUNT(*), DATE_TRUNC('month', created_at) AS month
   FROM audit_logs
   GROUP BY month
   ORDER BY month DESC;
   ```

4. ✅ Update model usage costs
   ```sql
   SELECT 
     SUM(cost_estimate) AS total_cost,
     COUNT(*) AS request_count
   FROM model_usage_logs
   WHERE timestamp > NOW() - INTERVAL '30 days';
   ```

### 8.3 Quarterly Operations

**Every 3 Months**:
1. ✅ Conduct retriever evaluation with held-out test set
   - Prepare 100-query test set with known answers
   - Run RAG search against test queries
   - Calculate precision@5, recall@5, MRR
   - Target: >85% precision, >80% recall

2. ✅ Review security audit logs
   ```sql
   SELECT event_type, COUNT(*) 
   FROM auth_audit_logs
   WHERE created_at > NOW() - INTERVAL '90 days'
   GROUP BY event_type;
   ```

3. ✅ Update RLS policies for new regulations
   - Check for new compliance requirements
   - Add tables/policies as needed
   - Test with non-admin users

4. ✅ Disaster recovery drill
   - Export database backup
   - Verify backup restoration process
   - Test failover procedures

---

## 9. SLOs & Monitoring

### 9.1 Service Level Objectives

**Availability SLOs**:
| Service | Target | Measurement |
|---------|--------|-------------|
| Frontend | 99.9% | Uptime monitoring |
| Edge Functions | 99.5% | Function invocation success rate |
| Database | 99.95% | Connection pool availability |
| Overall Platform | 99.5% | Composite of all services |

**Performance SLOs**:
| Metric | Target | Measurement |
|--------|--------|-------------|
| RAG Search Latency | <800ms P95 | Edge function duration |
| Feedback Submission | <150ms P95 | POST /feedback-handler |
| Dashboard Load Time | <3s P95 | Browser timing API |
| MV Refresh Duration | <500ms | Cron job logs |

**Error Budget**:
- 99.9% availability = 43.2 minutes downtime/month
- 99.5% availability = 3.6 hours downtime/month
- Error rate budget: 0.5% (1 error per 200 requests)

### 9.2 Alerting Configuration

**Critical Alerts** (PagerDuty / Slack - immediate):
- ❌ Database connection lost (>1 min)
- ❌ Edge function error rate >10% (>5 min)
- ❌ Audit chain integrity broken
- ❌ RLS policy bypass detected
- ❌ Service outage (>5 min downtime)

**Warning Alerts** (Email - daily digest):
- ⚠️ Error rate >5% for 24 hours
- ⚠️ Slow query detected (>1s)
- ⚠️ Token usage >80% of quota
- ⚠️ Failed cron job execution
- ⚠️ Disk usage >80%

**Info Alerts** (Dashboard - no notification):
- ℹ️ High feedback submission rate (spike)
- ℹ️ New user signup
- ℹ️ Connector sync completed
- ℹ️ Report generation finished

### 9.3 Metrics to Monitor

**Business Metrics**:
- Daily active users (DAU)
- Monthly active users (MAU)
- Assessments created per day
- Feedback submission rate
- Average satisfaction score

**Technical Metrics**:
- Edge function invocation count
- AI token usage (input + output)
- Database query latency (P50, P95, P99)
- Cache hit rate (if applicable)
- Error rate by function

**Compliance Metrics**:
- DSAR response time (target: <30 days)
- Audit log completeness (target: 100%)
- Data retention compliance (target: 100%)
- RLS policy coverage (target: 100%)

---

## 10. Roadmap & Future Enhancements

### 10.1 Phase 5: Adaptive Intelligence (Q1 2026)

**Reinforcement Learning Pipeline**:
```typescript
// Queue feedback samples for offline training
async function queueFeedbackSample(data: FeedbackSample) {
  await supabase.from('ml_training_queue').insert({
    organization_id: data.organizationId,
    module: data.module,
    query: data.query,
    response: data.response,
    feedback_signal: data.feedbackSignal,
    timestamp: new Date()
  })
}
```

**A/B Testing Framework**:
- Test retrieval strategies (vector-only vs hybrid)
- Compare embedding models (text-3-large vs text-3-small)
- Evaluate feedback score weights (0.15 vs 0.25)

**Automated Policy Suggestion**:
- LLM generates policy drafts from feedback patterns
- Template library for common organizational needs
- Approval workflow before activation

### 10.2 Phase 6: Multi-Model Routing (Q2 2026)

**Intelligent Model Selection**:
```typescript
function selectModel(task: AssessmentTask): ModelConfig {
  if (task.complexity === 'high' && task.requiresReasoning) {
    return { provider: 'lovable-ai', model: 'google/gemini-2.5-pro' }
  } else if (task.complexity === 'medium') {
    return { provider: 'lovable-ai', model: 'google/gemini-2.5-flash' }
  } else {
    return { provider: 'lovable-ai', model: 'google/gemini-2.5-flash-lite' }
  }
}
```

**Cost Optimization**:
- Route simple queries to fast/cheap models
- Reserve expensive models for complex reasoning
- Track cost per assessment by model

### 10.3 Phase 7: Enterprise Features (Q3-Q4 2026)

**SSO Integration** (SAML/OAuth):
- Azure AD / Okta / Google Workspace
- Automatic user provisioning
- Role mapping from IdP

**Collaborative Workflows**:
- Multi-user assessment reviews
- Comment threads on findings
- Approval workflows for reports

**API Access**:
- REST API for programmatic access
- Webhook notifications for events
- GraphQL endpoint for flexible queries

**White-Label Customization**:
- Custom branding (logo, colors)
- Domain mapping (client.custom-domain.com)
- Configurable email templates

### 10.4 Plugin Architecture (Phase 8)

**MCP Integration** (Model Context Protocol):
- Register copilots as MCP agents
- Composable assessment workflows
- Cross-module reasoning chains

**n8n Workflow Automation**:
- Visual workflow builder integration
- Trigger copilots from external events
- Chain multiple copilots together

**Marketplace Ecosystem**:
- Third-party copilot plugins
- Industry-specific templates
- Connector marketplace

---

## Appendix A: Database Schema Reference

**Full schema export**: Available in Supabase dashboard → Database → Schema

**Key tables**:
- Organizations (1) → Profiles (N)
- Profiles (1) → User Roles (N)
- Organizations (1) → Assessments (N)
- Organizations (1) → Feedback (N)
- Documents (1) → Chunks (N)
- Chunks (1) → Feedback (N)

---

## Appendix B: Edge Function API Reference

**Complete API spec**: See `docs/API_REFERENCE.md` (to be generated)

**Example request**:
```bash
curl -X POST https://usaygwvfanqlpruyzmhl.supabase.co/functions/v1/ai-act-auditor \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "system_name": "HR Hiring Assistant",
    "purpose": "Automated CV screening and candidate ranking",
    "sector": "Human Resources"
  }'
```

---

## Appendix C: Support Contacts

**Technical Support**:
- Email: support@lovable.dev
- Discord: https://discord.com/channels/1119885301872070706

**Documentation**:
- Lovable Docs: https://docs.lovable.dev
- Supabase Docs: https://supabase.com/docs

**Emergency Contacts**:
- On-call engineer: [Configure PagerDuty]
- Database admin: [Configure escalation]

---

**Document Version**: 4.2.0  
**Last Reviewed**: 2025-11-09  
**Next Review**: 2025-12-09

---

**END OF RUNBOOK**
