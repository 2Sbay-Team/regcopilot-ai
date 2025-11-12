# Module & Tool Interaction Addendum
## RegSense Compliance Copilot Platform

**Version:** 1.0  
**Last Updated:** 2025-11-12  
**Status:** Production-Ready

---

## 📋 Table of Contents

1. [Architecture Overview](./ARCHITECTURE_OVERVIEW.md)
2. [Module Dependency Graph](./MODULE_DEPENDENCY_GRAPH.md)
3. [Sequence Flow: ESG Validation](./SEQUENCE_FLOW_ESG_VALIDATION.md)
4. [API Contracts](./API_CONTRACTS.md)
5. [Data Ingestion & Mapping](./DATA_INGESTION_MAP.md)
6. [Integration Gaps Report](./INTEGRATION_GAPS_REPORT.md)

---

## 🎯 Purpose

This addendum provides a complete technical specification of how all modules, tools, connectors, and automation layers interact within the RegSense Compliance Copilot platform. It serves as the authoritative reference for:

- **Developers**: Understanding system architecture and integration points
- **Operations**: Monitoring, debugging, and maintaining production systems
- **Auditors**: Verifying data lineage and security boundaries
- **Architects**: Planning extensions and migrations

---

## 🏗️ System Layers

### Layer 1: Frontend (React + TypeScript)
- **Technology**: React 18, Vite, TypeScript, Tailwind CSS
- **State Management**: Zustand, React Query
- **Authentication**: Supabase Auth (JWT + RLS)
- **Role**: User interface, visualization, workflow orchestration

### Layer 2: Edge Functions (Deno)
- **Technology**: Deno runtime, Supabase Edge Functions
- **Purpose**: Serverless business logic, AI orchestration, data transformation
- **Security**: JWT validation, input sanitization, rate limiting
- **Logging**: Comprehensive audit trails with SHA-256 hashing

### Layer 3: Database (PostgreSQL + pgvector)
- **Technology**: Supabase PostgreSQL 15+ with pgvector extension
- **Security**: Row-Level Security (RLS) policies on all tables
- **Features**: Vector search, JSONB storage, materialized views
- **Backup**: Automated daily snapshots with 30-day retention

### Layer 4: AI Gateway (Lovable AI)
- **Models**: Google Gemini 2.5 (Pro/Flash/Lite), OpenAI GPT-5 series
- **Authentication**: LOVABLE_API_KEY (pre-configured)
- **Usage Tracking**: Token consumption logged per organization
- **Rate Limits**: Per-workspace limits with 429/402 error handling

### Layer 5: Connectors & Storage
- **Supported Systems**: S3, Azure Blob, SAP, SharePoint, OneDrive, JIRA
- **Authentication**: OAuth 2.0, API keys, service principals
- **Storage**: Supabase Storage buckets with RLS policies
- **Sync Strategy**: Delta loads, scheduled jobs, webhook triggers

### Layer 6: Automation & Orchestration
- **Job Scheduler**: PostgreSQL `pg_cron` for scheduled tasks
- **Agent System**: `agent_queue` table with priority-based execution
- **Monitoring**: Real-time health checks, alerting system
- **Recovery**: Automatic retry with exponential backoff

---

## 🔐 Security Boundaries

### Authentication Flow
```
User Login → Supabase Auth → JWT Token → Edge Functions → RLS Policies → Data Access
```

### Authorization Layers
1. **JWT Validation**: All edge functions verify tokens
2. **RLS Policies**: Database-level access control per organization
3. **Role-Based Access**: Admin, Analyst, Auditor, User roles
4. **MFA Enforcement**: TOTP-based multi-factor authentication
5. **API Key Validation**: Partner API access with rate limiting

### Data Classification
- **Public**: Regulatory frameworks, help articles
- **Internal**: Organization metadata, audit logs
- **Confidential**: Personal data, API keys, assessment results
- **Restricted**: MFA secrets, encryption keys, signed reports

---

## 📊 Module Registry

The system maintains a dynamic registry of all compliance modules:

| Module | Status | Entry Point | Dependencies | Last Heartbeat |
|--------|--------|-------------|--------------|----------------|
| AI Act Auditor | Active | `/ai-act-auditor` | audit-logs, rag-search | Real-time |
| GDPR Checker | Active | `/gdpr-checker` | audit-logs, pii-redactor | Real-time |
| ESG Reporter | Active | `/esg-reporter` | connectors, kpi-evaluate | Real-time |
| RAG Search | Active | `/rag-search` | document-chunks, embeddings | Real-time |
| Audit Trail | Active | `/audit-chain-verify` | hash-chain, all modules | Real-time |
| Model Registry | Active | `/model-governance` | ai-gateway, usage-logs | Real-time |
| Connectors | Active | `/connector-sync` | storage, agent-queue | Scheduled |
| Automation | Active | `/agent-runner` | all modules, scheduler | Continuous |

---

## 🔄 Data Flow Patterns

### Pattern 1: User-Initiated Assessment
```
UI → Edge Function → RAG Search → AI Gateway → Edge Function → DB → UI
```

### Pattern 2: Scheduled Data Sync
```
Cron Job → Edge Function → External API → Transform → DB → Audit Log
```

### Pattern 3: Agent-Driven Workflow
```
Trigger → Agent Queue → Agent Runner → Multiple Edges → Result → Notification
```

### Pattern 4: Real-Time Updates
```
DB Change → Supabase Realtime → WebSocket → UI Component → State Update
```

---

## 💰 Cost Tracking

### Token Usage Monitoring
- **Table**: `model_usage_logs`
- **Tracked Metrics**: Prompt tokens, completion tokens, total cost, model used
- **Aggregation**: Daily per organization, monthly billing cycles
- **Quota Management**: `check_token_quota()` function enforces limits
- **Alerts**: 80% and 90% quota warnings

### Storage Tracking
- **Buckets**: Separate buckets per data type (documents, reports, avatars)
- **Metrics**: File count, total size, upload frequency
- **Retention**: Automated cleanup based on `data_retention_policies`

### Compute Tracking
- **Edge Functions**: Execution time, invocation count, error rate
- **Database**: Query performance, connection pool usage
- **Connectors**: Sync duration, data volume transferred

---

## 🚀 Deployment & Scaling

### Current Architecture
- **Frontend**: Deployed on Lovable Cloud CDN
- **Edge Functions**: Auto-scaling Deno runtime
- **Database**: Managed PostgreSQL with connection pooling
- **Storage**: Distributed object storage with CDN

### Scaling Strategy
- **Horizontal**: Add more edge function instances
- **Vertical**: Increase database instance size
- **Caching**: Redis layer for frequently accessed data
- **CDN**: Geographic distribution for global users

### High Availability
- **Database**: Multi-zone replication
- **Functions**: Automatic failover
- **Storage**: Cross-region replication
- **Monitoring**: 24/7 uptime tracking

---

## 📖 Quick Start

1. Review [Architecture Overview](./ARCHITECTURE_OVERVIEW.md) for system topology
2. Study [Module Dependencies](./MODULE_DEPENDENCY_GRAPH.md) for integration points
3. Examine [API Contracts](./API_CONTRACTS.md) for endpoint specifications
4. Check [Integration Gaps](./INTEGRATION_GAPS_REPORT.md) for known issues

---

## 🔍 Validation Status

✅ **Architecture**: Complete  
✅ **Module Registry**: Verified  
✅ **API Contracts**: Documented  
✅ **Security**: Audited  
⚠️ **ESG Ingestion**: Pending migration approval  
⚠️ **Advanced Analytics**: Planned for Phase 7

---

## 📞 Support

For questions or issues related to this documentation:
- **Technical Support**: [Platform Documentation](./README.md)
- **Security Issues**: [Security Center](./SECURITY.md)
- **API Questions**: [API Documentation](./docs/API_DOCUMENTATION.md)

---

**Document Control**  
Created by: Lovable AI System Architect  
Review Cycle: Quarterly  
Next Review: 2025-02-12
