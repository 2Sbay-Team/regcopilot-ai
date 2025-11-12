# Architecture Overview
## RegSense Compliance Copilot Platform

---

## 🏛️ High-Level System Architecture

```mermaid
graph TB
    subgraph "User Layer"
        UI[React Frontend]
        Mobile[PWA/Mobile]
    end
    
    subgraph "API Gateway Layer"
        EdgeRouter[Edge Function Router]
        Auth[Authentication Service]
        RateLimit[Rate Limiter]
    end
    
    subgraph "Business Logic Layer"
        AIAct[AI Act Auditor]
        GDPR[GDPR Checker]
        ESG[ESG Reporter]
        RAG[RAG Search Engine]
        Audit[Audit Chain]
        ModelReg[Model Registry]
    end
    
    subgraph "AI & Intelligence Layer"
        AIGateway[Lovable AI Gateway]
        Embeddings[Vector Embeddings]
        LLM[LLM Orchestrator]
    end
    
    subgraph "Data Layer"
        DB[(PostgreSQL + pgvector)]
        Storage[Supabase Storage]
        Cache[Query Cache]
    end
    
    subgraph "Integration Layer"
        Connectors[Data Connectors]
        S3[AWS S3]
        SAP[SAP/ERP]
        SharePoint[SharePoint]
        Blob[Azure Blob]
    end
    
    subgraph "Automation Layer"
        Scheduler[Job Scheduler]
        AgentRunner[Agent Runner]
        Monitoring[Health Monitor]
    end
    
    UI --> EdgeRouter
    Mobile --> EdgeRouter
    EdgeRouter --> Auth
    EdgeRouter --> RateLimit
    Auth --> AIAct
    Auth --> GDPR
    Auth --> ESG
    Auth --> RAG
    Auth --> Audit
    Auth --> ModelReg
    
    AIAct --> LLM
    GDPR --> LLM
    ESG --> LLM
    RAG --> Embeddings
    LLM --> AIGateway
    
    AIAct --> DB
    GDPR --> DB
    ESG --> DB
    RAG --> DB
    Audit --> DB
    ModelReg --> DB
    
    ESG --> Storage
    GDPR --> Storage
    
    Connectors --> S3
    Connectors --> SAP
    Connectors --> SharePoint
    Connectors --> Blob
    Connectors --> DB
    
    Scheduler --> AgentRunner
    AgentRunner --> AIAct
    AgentRunner --> GDPR
    AgentRunner --> ESG
    Monitoring --> EdgeRouter
    Monitoring --> DB
```

---

## 🔄 End-to-End Request Flow

### Flow 1: AI Act Risk Assessment

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant EdgeFn as Edge Function
    participant RAG as RAG Search
    participant AI as AI Gateway
    participant DB as Database
    participant Audit as Audit Log
    
    User->>UI: Submit AI system details
    UI->>EdgeFn: POST /ai-act-auditor
    EdgeFn->>EdgeFn: Validate JWT
    EdgeFn->>EdgeFn: Sanitize input
    EdgeFn->>RAG: Retrieve AI Act articles
    RAG->>DB: Vector search (cosine similarity)
    DB-->>RAG: Relevant regulations
    RAG-->>EdgeFn: Regulatory context
    EdgeFn->>AI: Classify risk + reasoning
    AI-->>EdgeFn: Risk category + explanation
    EdgeFn->>DB: Store assessment
    EdgeFn->>Audit: Log with hash chain
    Audit->>DB: Save audit entry
    EdgeFn-->>UI: Assessment result
    UI-->>User: Display risk analysis
```

### Flow 2: ESG Data Ingestion & Reporting

```mermaid
sequenceDiagram
    participant Scheduler
    participant Connector as Data Connector
    participant EdgeFn as Edge Function
    participant AI as AI Gateway
    participant DB as Database
    participant Audit as Audit Log
    participant User
    
    Scheduler->>Connector: Trigger scheduled sync
    Connector->>Connector: Authenticate with source
    Connector->>EdgeFn: POST /connector-sync
    EdgeFn->>EdgeFn: Fetch data from external API
    EdgeFn->>EdgeFn: Validate & transform data
    EdgeFn->>DB: Store in staging tables
    EdgeFn->>EdgeFn: Auto-map columns to KPIs
    EdgeFn->>AI: Detect anomalies
    AI-->>EdgeFn: Quality assessment
    EdgeFn->>DB: Store cleaned data
    EdgeFn->>Audit: Log lineage
    EdgeFn->>DB: Calculate KPIs
    EdgeFn->>AI: Generate narrative
    AI-->>EdgeFn: Report text
    EdgeFn->>DB: Save ESG report
    User->>DB: Query report
    DB-->>User: ESG dashboard
```

### Flow 3: Agent-Driven Automation

```mermaid
sequenceDiagram
    participant Trigger as Event Trigger
    participant Queue as Agent Queue
    participant Runner as Agent Runner
    participant Agent as Specialized Agent
    participant EdgeFn as Edge Function
    participant DB as Database
    
    Trigger->>Queue: New task (priority 3)
    Note over Queue: Tasks sorted by priority
    Runner->>Queue: Poll for pending tasks
    Queue-->>Runner: Task details
    Runner->>Runner: Mark task in_progress
    Runner->>Agent: Execute task logic
    Agent->>EdgeFn: Call specific function
    EdgeFn->>DB: Perform operations
    DB-->>EdgeFn: Results
    EdgeFn-->>Agent: Success
    Agent-->>Runner: Task completed
    Runner->>DB: Update task status
    Runner->>DB: Log to history
    alt Task Failed
        Runner->>Runner: Check retry count
        Runner->>Queue: Reschedule with backoff
    end
```

---

## 🧩 Component Architecture

### Frontend Architecture

```mermaid
graph LR
    subgraph "React Application"
        Pages[Page Components]
        Layout[Layout Components]
        UI[UI Components]
        Hooks[Custom Hooks]
        Context[Context Providers]
    end
    
    subgraph "State Management"
        Query[React Query]
        Zustand[Zustand Store]
        Local[Local State]
    end
    
    subgraph "Services"
        API[API Client]
        Auth[Auth Service]
        i18n[Internationalization]
    end
    
    Pages --> Layout
    Pages --> UI
    Pages --> Hooks
    Hooks --> Query
    Hooks --> Zustand
    Pages --> Context
    
    API --> Query
    Auth --> Context
    i18n --> Pages
```

### Backend Architecture

```mermaid
graph TB
    subgraph "Edge Functions"
        Public[Public APIs]
        Protected[Protected APIs]
        Internal[Internal Functions]
    end
    
    subgraph "Shared Modules"
        CORS[CORS Headers]
        Auth[JWT Validation]
        Sanitize[Input Sanitization]
        PII[PII Masking]
        Gateway[Model Gateway]
    end
    
    subgraph "Database Functions"
        RLS[RLS Policies]
        Triggers[DB Triggers]
        Functions[SQL Functions]
    end
    
    Public --> CORS
    Protected --> Auth
    Internal --> Gateway
    
    Public --> Sanitize
    Protected --> Sanitize
    Protected --> PII
    
    Public --> RLS
    Protected --> RLS
    RLS --> Triggers
    RLS --> Functions
```

---

## 🔐 Security Architecture

### Authentication & Authorization Flow

```mermaid
graph TD
    User[User Request] --> JWT{Valid JWT?}
    JWT -->|No| Reject[401 Unauthorized]
    JWT -->|Yes| RLS{RLS Check}
    RLS -->|Fail| Deny[403 Forbidden]
    RLS -->|Pass| Role{Role Check}
    Role -->|Admin| FullAccess[Full Access]
    Role -->|Analyst| LimitedAccess[Limited Access]
    Role -->|User| RestrictedAccess[Restricted Access]
    Role -->|Auditor| AuditAccess[Audit-Only Access]
```

### Data Flow Security

```mermaid
graph LR
    subgraph "Input Validation"
        User[User Input]
        Sanitize[Sanitize HTML/SQL]
        Validate[Zod Schema]
    end
    
    subgraph "Processing"
        PII[PII Masking]
        Encrypt[Encryption]
        Hash[SHA-256 Hashing]
    end
    
    subgraph "Storage"
        RLS[Row-Level Security]
        Audit[Audit Logging]
        Backup[Encrypted Backup]
    end
    
    User --> Sanitize
    Sanitize --> Validate
    Validate --> PII
    PII --> Encrypt
    Encrypt --> Hash
    Hash --> RLS
    RLS --> Audit
    Audit --> Backup
```

---

## 📊 Data Architecture

### Database Schema Overview

```mermaid
erDiagram
    organizations ||--o{ profiles : has
    organizations ||--o{ ai_act_assessments : owns
    organizations ||--o{ gdpr_assessments : owns
    organizations ||--o{ esg_reports : owns
    organizations ||--o{ audit_logs : tracks
    
    profiles ||--o{ user_roles : has
    profiles ||--o{ login_attempts : records
    
    document_chunks ||--o{ chunk_feedback : receives
    document_chunks }o--|| regulatory_sources : references
    
    esg_reports ||--o{ esg_kpi_results : contains
    esg_reports }o--|| connectors : sources_from
    
    ai_act_assessments ||--o{ ai_conformity_reports : generates
    
    audit_logs ||--|| audit_logs : chains_to
    
    agent_queue ||--o{ agent_task_history : archives
```

### Storage Structure

```
supabase-storage/
├── avatars/ (public)
│   └── {user_id}/avatar.png
├── gdpr-documents/ (private)
│   └── {org_id}/{document_id}.pdf
├── esg-documents/ (private)
│   └── {org_id}/{year}/{report}.xlsx
├── ai-act-documents/ (private)
│   └── {org_id}/assessments/{id}.pdf
├── regulatory-documents/ (private)
│   └── regulations/{regulation_name}.pdf
└── connector-synced-files/ (private)
    └── {org_id}/{connector_id}/{file}
```

---

## 🚀 Deployment Architecture

### Production Environment

```mermaid
graph TB
    subgraph "CDN Layer"
        CDN[Lovable Cloud CDN]
    end
    
    subgraph "Application Layer"
        App1[Edge Function Instance 1]
        App2[Edge Function Instance 2]
        App3[Edge Function Instance N]
        LB[Load Balancer]
    end
    
    subgraph "Data Layer"
        Primary[(Primary DB)]
        Replica1[(Read Replica 1)]
        Replica2[(Read Replica 2)]
    end
    
    subgraph "Storage Layer"
        S3Primary[Primary Storage]
        S3Replica[Replicated Storage]
    end
    
    CDN --> LB
    LB --> App1
    LB --> App2
    LB --> App3
    
    App1 --> Primary
    App2 --> Replica1
    App3 --> Replica2
    
    Primary -.->|Replication| Replica1
    Primary -.->|Replication| Replica2
    
    App1 --> S3Primary
    S3Primary -.->|Backup| S3Replica
```

---

## 📈 Monitoring & Observability

### System Health Dashboard

```mermaid
graph TD
    subgraph "Monitoring Layer"
        HealthCheck[Health Check Service]
        Metrics[Metrics Collector]
        Alerts[Alert Manager]
    end
    
    subgraph "Targets"
        EdgeFn[Edge Functions]
        DB[Database]
        Storage[Storage]
        AI[AI Gateway]
    end
    
    subgraph "Outputs"
        Dashboard[Admin Dashboard]
        Logs[Log Aggregator]
        Notifications[Notification Service]
    end
    
    HealthCheck --> EdgeFn
    HealthCheck --> DB
    HealthCheck --> Storage
    HealthCheck --> AI
    
    Metrics --> Dashboard
    Alerts --> Notifications
    
    EdgeFn --> Logs
    DB --> Logs
    Storage --> Logs
```

### Performance Metrics

| Metric | Target | Current | Alert Threshold |
|--------|--------|---------|-----------------|
| API Response Time | < 500ms | ~300ms | > 1s |
| Database Query Time | < 100ms | ~50ms | > 500ms |
| AI Gateway Latency | < 2s | ~1.5s | > 5s |
| Uptime | 99.9% | 99.95% | < 99% |
| Error Rate | < 0.1% | 0.05% | > 1% |

---

## 🔧 Technology Stack

### Frontend Stack
- **Framework**: React 18.3.1
- **Build Tool**: Vite
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.x + shadcn/ui
- **State**: Zustand + React Query
- **Routing**: React Router v6
- **Charts**: Recharts
- **i18n**: i18next

### Backend Stack
- **Runtime**: Deno (Edge Functions)
- **Database**: PostgreSQL 15+ with pgvector
- **Auth**: Supabase Auth (JWT + RLS)
- **Storage**: Supabase Storage (S3-compatible)
- **AI**: Lovable AI Gateway (Gemini + GPT)
- **Validation**: Zod schemas

### DevOps Stack
- **CI/CD**: GitHub Actions
- **Monitoring**: Supabase Analytics
- **Testing**: Vitest + Playwright
- **Documentation**: Markdown + Mermaid

---

## 📝 Configuration Management

### Environment Variables

```typescript
// Frontend (.env)
VITE_SUPABASE_URL=https://[project].supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...
VITE_SUPABASE_PROJECT_ID=usaygwvfanqlpruyzmhl

// Backend (Supabase Secrets)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
LOVABLE_API_KEY=[auto-generated]
RECAPTCHA_SECRET_KEY=[user-provided]
RECAPTCHA_SITE_KEY=[user-provided]
stripe_payment=[user-provided]
```

### Feature Flags

```typescript
// Module enablement stored in database
organizations {
  enabled_modules: string[] // ['ai_act', 'gdpr', 'esg']
  billing_model: 'byok' | 'pay_as_you_go'
  llm_token_quota: number
  tokens_used_this_month: number
}
```

---

## 🎯 Key Design Principles

1. **Modularity**: Each compliance module operates independently
2. **Security-First**: Authentication, authorization, and audit at every layer
3. **Scalability**: Horizontal scaling via serverless architecture
4. **Auditability**: Complete data lineage with hash-chained logs
5. **Extensibility**: Plugin architecture for new regulations
6. **Resilience**: Automatic retry, fallback, and error recovery
7. **Performance**: Sub-second API responses, optimized queries
8. **Compliance**: GDPR, SOC 2, ISO 27001 aligned

---

## 📚 Related Documentation

- [Module Dependency Graph](./MODULE_DEPENDENCY_GRAPH.md)
- [API Contracts](./API_CONTRACTS.md)
- [Security Documentation](./SECURITY.md)
- [Deployment Guide](./RUNBOOK.md)
