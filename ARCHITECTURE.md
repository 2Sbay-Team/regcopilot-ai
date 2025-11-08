# Compliance & ESG Copilot - Architecture

## 🏗️ System Overview

Full-stack PWA SaaS platform for automated compliance management across EU AI Act, GDPR, and CSRD/ESRS regulations.

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     React PWA Frontend                       │
│  (Vite + TypeScript + Tailwind + shadcn-ui)                │
├─────────────────────────────────────────────────────────────┤
│  Dashboard │ Copilots │ Analytics │ Reports │ Admin        │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Supabase Edge Functions                    │
│              (Deno Runtime - Auto-scaling)                   │
├─────────────────────────────────────────────────────────────┤
│  • ai-act-auditor      → Risk classification + Annex IV     │
│  • gdpr-checker        → PII detection + violations         │
│  • esg-reporter        → Sustainability metrics + narrative │
│  • explainability      → Answer "why" questions             │
│  • rag-search          → Semantic regulatory search         │
│  • generate-compliance-report → Automated summaries         │
│  • seed-regulations    → Initialize knowledge base          │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│              Lovable AI Gateway (Pre-configured)            │
│         https://ai.gateway.lovable.dev/v1/...              │
├─────────────────────────────────────────────────────────────┤
│  • google/gemini-2.5-flash (default)                        │
│  • google/gemini-2.5-pro (advanced reasoning)               │
│  • openai/gpt-5-mini (alternative)                          │
└─────────────────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│              Supabase PostgreSQL + pgvector                 │
│                  (Multi-tenant Database)                     │
├─────────────────────────────────────────────────────────────┤
│  Tables:                                                     │
│  • organizations           → Tenant isolation               │
│  • profiles               → User metadata + org mapping     │
│  • user_roles             → RBAC (admin/analyst/viewer)     │
│  • ai_systems             → AI system registry              │
│  • ai_act_assessments     → Risk classifications            │
│  • gdpr_assessments       → Privacy scan results            │
│  • esg_reports           → Sustainability reports           │
│  • audit_logs            → Hash-chained audit trail         │
│  • alert_thresholds      → Configurable risk limits         │
│  • alert_notifications   → Triggered alerts log             │
│  • compliance_reports    → Generated PDF reports            │
│  • document_chunks       → RAG vector embeddings (1536-dim) │
│  • explainability_views  → Q&A reasoning traces             │
│                                                              │
│  Functions:                                                  │
│  • match_regulatory_chunks() → Cosine similarity search     │
│  • compute_audit_chain()     → SHA-256 hash chaining        │
│  • has_role()                → RBAC helper                  │
└─────────────────────────────────────────────────────────────┘

```

## 🤖 Copilot Modules (MCP-Style)

### 1. AI Act Auditor
**Input**: AI system name, purpose, sector, model type  
**Process**:
- RAG search for relevant EU AI Act articles
- LLM classification (unacceptable/high/limited/minimal risk)
- Generate Annex IV compliance summary
- Store assessment + audit log with hash chain

**Output**: Risk category, compliance report, evidence citations

### 2. GDPR Checker
**Input**: Documents, vendor agreements, system configurations  
**Process**:
- PII detection (email, phone, SSN patterns)
- Violation scanning (retention, cross-border transfers)
- RAG search for GDPR guidance
- LLM-generated privacy summary

**Output**: Violations by article, findings, recommendations

### 3. ESG Reporter
**Input**: CO₂ emissions (Scope 1/2/3), energy, water, diversity metrics  
**Process**:
- Calculate ESRS E1 KPIs
- Detect anomalies (e.g., zero emissions, unusual ratios)
- RAG search for CSRD/ESRS standards
- LLM-generated sustainability narrative

**Output**: Metrics summary, narrative, completeness score

## 🔍 RAG (Retrieval-Augmented Generation)

**Knowledge Base**: `document_chunks` table with pgvector embeddings  
**Vector Dimensions**: 1536 (compatible with OpenAI text-embedding-3-large)  
**Search Function**: `match_regulatory_chunks(query_embedding, threshold, limit)`  
**Fallback**: PostgreSQL full-text search when vector search unavailable

**Seeded Regulations**:
- EU AI Act (Articles 5, 6, 13, Annex III)
- GDPR (Articles 5, 6, Chapter V)
- ESRS (E1 Climate, S1 Workforce)

## 🔐 Security & Audit

### Hash-Chained Audit Trail
Every copilot action creates an audit log entry with:
- `input_hash`: SHA-256 of request payload
- `output_hash`: SHA-256 of LLM response
- `prev_hash`: Links to previous log entry (blockchain-style)
- `reasoning_chain`: LLM reasoning + evidence sources

**Integrity Verification**: `prev_hash` must match previous `output_hash`

### Row-Level Security (RLS)
- All tables filtered by `organization_id`
- Role-based access: `admin`, `analyst`, `viewer`
- Security definer functions prevent RLS recursion

## 📊 Analytics & Reporting

### Real-Time Analytics
- **Trend Charts**: Assessment volumes over time (LineChart)
- **Risk Distribution**: Pie chart of AI Act risk categories
- **Violation Breakdown**: Top GDPR articles violated (BarChart)
- **Heatmap**: Weekly risk concentration across modules

### Predictive Analytics
- Linear regression forecasting (7/14/30 days ahead)
- Predicted compliance workload calculation
- Dashed line predictions on trend charts

### Alert System
- Configurable thresholds per metric (AI Act risk, GDPR violations, ESG issues)
- Automatic alert logging to `alert_notifications` table
- Admin acknowledgment workflow with notes
- Real-time notifications via Supabase Realtime

### Automated Reports
- **Cron Jobs**: Weekly (Mondays 9 AM) and monthly (1st, 10 AM)
- **Manual Generation**: Ad-hoc, weekly, monthly, quarterly
- **PDF Export**: jsPDF-powered stakeholder reports
- **Risk Scoring**: Weighted score (0-100) from AI Act + GDPR + alerts

## 🚀 Deployment

### PWA Configuration
- Manifest: `/public/manifest.json`
- Service Worker: Vite PWA plugin
- Offline-ready: Workbox caching strategies

### Edge Functions
- **Runtime**: Deno on Lovable Cloud
- **Auto-deploy**: Committed functions deploy automatically
- **Secrets**: `LOVABLE_API_KEY` (pre-configured), `SUPABASE_SERVICE_ROLE_KEY`

### Database
- **Migrations**: Auto-applied SQL in `supabase/migrations/`
- **RLS**: Enforced on all tables
- **Extensions**: `vector`, `pg_cron`, `pg_net`, `pg_trgm`

## 🔄 Data Flow Example (AI Act Audit)

```
User submits form → AIActCopilot.tsx
  ↓
POST /functions/v1/ai-act-auditor
  ↓
Edge Function:
  1. Authenticate user (JWT)
  2. Validate & sanitize input (Zod)
  3. RAG search → match_regulatory_chunks()
  4. LLM analysis → Lovable AI (Gemini 2.5 Flash)
  5. Store assessment → ai_act_assessments table
  6. Compute hashes → SHA-256 (input + output)
  7. Insert audit log → audit_logs with prev_hash
  ↓
Return { risk_class, report, citations, assessment_id }
  ↓
Frontend displays result + "View Explainability" button
```

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + TypeScript + Vite |
| **UI** | shadcn-ui + Tailwind CSS + Radix UI |
| **State** | React Query + React Context |
| **Backend** | Supabase (Lovable Cloud) |
| **Database** | PostgreSQL 15 + pgvector |
| **Auth** | Supabase Auth (JWT + RLS) |
| **Edge Logic** | Deno Edge Functions |
| **AI** | Lovable AI Gateway (Gemini 2.5 Flash) |
| **Charts** | Recharts |
| **PDF** | jsPDF + html2canvas |
| **PWA** | Vite Plugin PWA + Workbox |

## 🧪 Testing the System

1. **Initialize Knowledge Base**: `/setup` → Click "Initialize Knowledge Base"
2. **Run AI Act Audit**: `/ai-act` → Fill form → Submit
3. **View Results**: Check risk classification + Annex IV summary
4. **Search Regulations**: `/rag-search` → Query "high-risk AI employment"
5. **Check Audit Trail**: `/audit` → Verify hash chain integrity
6. **View Analytics**: `/analytics` → See trends + predictions + heatmap
7. **Generate Report**: `/reports` → Create weekly summary → Export PDF

## 🔧 Configuration

### Edge Function Auth
- JWT verification enabled for copilots (requires login)
- Public endpoints: `generate-compliance-report`, `rag-search`, `seed-regulations`

### Cron Jobs
- **Weekly Reports**: `0 9 * * 1` (Mondays 9 AM UTC)
- **Monthly Reports**: `0 10 1 * *` (1st of month 10 AM UTC)

### Environment Variables (Auto-configured)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `LOVABLE_API_KEY`

## 🎯 Key Features

✅ **Multi-tenant**: Organization-based isolation  
✅ **RBAC**: Role-based access control (admin/analyst/viewer)  
✅ **RAG**: Vector search with pgvector + semantic embeddings  
✅ **Audit Trail**: SHA-256 hash-chained logs  
✅ **Explainability**: Q&A on assessments with evidence  
✅ **Real-time**: Supabase Realtime for live updates  
✅ **Predictions**: Linear regression forecasting  
✅ **Alerts**: Configurable thresholds + notifications  
✅ **Automation**: Cron-scheduled reports  
✅ **PWA**: Installable, offline-capable  
✅ **Security**: Input sanitization, RLS policies, JWT auth  

## 📈 Scalability

- **Database**: Supabase Pro supports 500K+ rows, 100+ concurrent connections
- **Edge Functions**: Auto-scales with traffic (Deno Deploy)
- **AI Gateway**: Lovable AI handles rate limiting transparently
- **Storage**: Unlimited file storage in Supabase buckets

## 🔒 Security Best Practices

1. **Never expose service role key** in client-side code
2. **Always use RLS policies** on tables with sensitive data
3. **Sanitize all user inputs** before LLM processing (prevent prompt injection)
4. **Validate with Zod schemas** in edge functions
5. **Use security definer functions** for role checks to avoid RLS recursion
6. **Hash chain audit logs** for tamper-evident compliance records

## 📚 Resources

- [Lovable Docs](https://docs.lovable.dev/)
- [Supabase Vector Docs](https://supabase.com/docs/guides/ai/vector-columns)
- [EU AI Act Official Text](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:52021PC0206)
- [GDPR Full Text](https://gdpr-info.eu/)
- [CSRD/ESRS Standards](https://www.efrag.org/lab6)
