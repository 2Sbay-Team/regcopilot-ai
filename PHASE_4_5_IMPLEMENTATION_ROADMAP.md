# Phase 4.4 & 5 Implementation Roadmap

**Platform**: Regulix - Compliance & ESG Copilot  
**Date**: 2025-11-09  
**Status**: Foundation Complete, Implementation In Progress

---

## Executive Summary

This roadmap outlines the complete implementation of **Phase 4.4 (Continuous Security Monitoring & SOC 2 Preparation)** and **Phase 5 (Enterprise Launch & Client Onboarding Pack)**. The foundation has been laid with database schemas and initial monitoring infrastructure.

---

## Phase 4.4: Continuous Security Monitoring & SOC 2 Preparation

### ✅ COMPLETED

#### Database Infrastructure
- ✅ `system_metrics` table - CPU, memory, API latency, error rate tracking
- ✅ `security_events` table - Auth failures, RLS violations, prompt injection attempts
- ✅ `alert_policies` table - Configurable thresholds with notification channels
- ✅ `security_alert_notifications` table - Alert history and acknowledgment
- ✅ `soc2_evidence_snapshots` table - Automated evidence collection
- ✅ RLS policies for all new tables
- ✅ Indexes for performance optimization

---

### 🚧 IN PROGRESS

#### 1. Monitoring Agent Edge Function

**File**: `supabase/functions/monitoring-agent/index.ts`

**Purpose**: Collect system metrics every 5 minutes

**Implementation**:
```typescript
// Collect metrics:
- CPU usage (Deno.systemCpuInfo())
- Memory usage (Deno.memoryUsage())
- API latency (average response time from audit_logs)
- Error rate (failed requests / total requests)
- Storage utilization (Supabase storage API)
- Active users (recent auth activity)

// Insert into system_metrics table
// Check alert_policies for threshold violations
// Trigger notifications if needed
```

**Cron Setup**: Run every 5 minutes via pg_cron

---

#### 2. Alert Engine Edge Function

**File**: `supabase/functions/alert-engine/index.ts`

**Purpose**: Process alert policies and send notifications

**Features**:
- Email notifications (via Resend/SendGrid)
- Slack webhooks
- Custom webhook support
- Cooldown period to prevent spam
- Multi-channel delivery

---

#### 3. SOC 2 Evidence Generator

**File**: `supabase/functions/soc2-generate-evidence/index.ts`

**Purpose**: Daily snapshot of compliance evidence

**Output Format**:
```json
{
  "snapshot_date": "2025-11-09",
  "organization_id": "...",
  "trust_principles": {
    "security": {
      "rls_policies_active": true,
      "auth_failures_30d": 12,
      "prompt_injection_attempts": 3,
      "audit_chain_integrity": "100%"
    },
    "availability": {
      "uptime_percentage": 99.98,
      "api_latency_avg_ms": 145,
      "error_rate": 0.002
    },
    "processing_integrity": {
      "llm_success_rate": 98.5,
      "rag_accuracy": 95.2,
      "audit_logs_complete": true
    },
    "confidentiality": {
      "encryption_at_rest": true,
      "encryption_in_transit": true,
      "data_leakage_incidents": 0
    },
    "privacy": {
      "gdpr_compliant": true,
      "dsar_response_time_avg_days": 8,
      "pii_redaction_active": true
    }
  },
  "hash_signature": "sha256:..."
}
```

**Schedule**: Daily at 00:00 UTC

---

#### 4. SOC 2 Report Generator

**File**: `supabase/functions/soc2-generate-report/index.ts`

**Purpose**: Compile 30-day evidence into PDF report

**Sections**:
1. **Executive Summary** - Overall compliance posture
2. **Security (CC6)** - RLS, auth, encryption, audit trails
3. **Availability (A1)** - Uptime, performance, monitoring
4. **Processing Integrity (PI1)** - LLM accuracy, data quality
5. **Confidentiality (C1)** - Data protection, access controls
6. **Privacy (P1)** - GDPR compliance, DSAR handling
7. **Audit Evidence** - Hash-verified logs, metric snapshots
8. **Appendices** - Technical architecture, security tests

**Output**: PDF stored in Supabase Storage (`/soc2/reports/`)

---

#### 5. Admin Monitoring Dashboard

**File**: `src/pages/MonitoringDashboard.tsx`

**Panels**:
- 📊 **System Health** - Real-time CPU, memory, API latency
- 🔐 **Security Events** - Last 30 days, filterable by severity
- 💬 **Prompt Injection Attempts** - Per copilot module
- 💰 **LLM Usage & Cost** - Per organization, per model
- ⚙️ **Automation Triggers** - Success/failure rates
- 🚨 **Active Alerts** - Unacknowledged alerts
- 📈 **Historical Trends** - Graphs for key metrics

**Access**: Admin role only

---

### 📋 TODO

- [ ] Implement `monitoring-agent` edge function
- [ ] Implement `alert-engine` edge function
- [ ] Implement `soc2-generate-evidence` edge function
- [ ] Implement `soc2-generate-report` edge function
- [ ] Create `MonitoringDashboard.tsx` component
- [ ] Set up pg_cron for scheduled jobs
- [ ] Configure email/Slack notification providers
- [ ] Add "Export SOC 2 Evidence" button to admin dashboard
- [ ] Implement data retention policy automation (90-day cleanup)
- [ ] Create `SOC2_MONITORING_GUIDE.md`
- [ ] Create `SECURITY_OPERATIONS_RUNBOOK.md`
- [ ] Update `SECURITY.md` with monitoring architecture diagram

---

## Phase 5: Enterprise Launch & Client Onboarding Pack

### ✅ COMPLETED

#### Database Infrastructure
- ✅ `onboarding_events` table - Track user onboarding progress
- ✅ `support_tickets` table - Help desk system
- ✅ `demo_tenants` table - Demo environment management
- ✅ Extended `organizations` table with subscription fields
- ✅ RLS policies for all Phase 5 tables

---

### 🚧 IN PROGRESS

#### 1. Demo Environment Setup

**Files**:
- `supabase/functions/demo-provision/index.ts` - Create demo tenants
- `supabase/functions/demo-reset/index.ts` - Reset demo data

**Demo Datasets**:
1. **AI Act Demo**
   - High-risk credit scoring system
   - 3 assessments (2 compliant, 1 non-compliant)
   - Sample audit logs

2. **GDPR Demo**
   - Employee records dataset
   - 2 DSAR requests
   - Data processing activities

3. **ESG Demo**
   - Carbon emissions metrics (Scope 1, 2, 3)
   - Energy consumption data
   - CSRD/ESRS draft report

**Demo Access**:
- "Launch Demo" button on login page
- Read-only mode enforced
- Auto-reset after 2 hours of inactivity

---

#### 2. Onboarding Wizard

**File**: `src/pages/OnboardingWizard.tsx`

**Steps**:

**Step 1: Create Organization**
```typescript
- Organization name
- Industry sector (dropdown)
- Primary region (EU/US/UK/Other)
- Employee count (range)
- Use case (AI Act / GDPR / ESG / All)
```

**Step 2: Configure Connectors**
```typescript
- Optional connector setup
- Azure, AWS, SharePoint, SAP
- Or "Skip for now" option
```

**Step 3: Enable Copilot Modules**
```typescript
- AI Act Auditor ☑️
- GDPR Checker ☑️
- ESG Reporter ☑️
- NIS2 Assessor ☐
- DORA Assessor ☐
- DMA Assessor ☐
```

**Step 4: Choose Subscription Plan**
```typescript
- 🟢 Starter (Free Trial - 14 days)
  - 5 users
  - 1 organization
  - Shared LLM
  - 10K tokens/month

- 🔵 Pro ($199/month)
  - Unlimited users
  - Unlimited copilots
  - Per-token billing
  - Priority support
  
- 🟣 Enterprise (Custom pricing)
  - SLA guarantee
  - Private model endpoint
  - SOC 2 evidence exports
  - Dedicated success manager
```

**Completion**:
- Email confirmation sent
- Onboarding event logged
- Redirect to dashboard with tutorial overlay

---

#### 3. Stripe Integration

**Files**:
- `supabase/functions/stripe-create-subscription/index.ts`
- `supabase/functions/stripe-webhook/index.ts`
- `supabase/functions/stripe-update-plan/index.ts`

**Features**:
- Subscription creation/cancellation
- Usage-based billing for Pro plan
- Webhook handling (payment success/failure)
- Invoice generation
- Trial expiration notifications

**Plan Enforcement**:
```typescript
// In LLM gateway and copilot functions
const subscription = await checkSubscriptionStatus(org_id);
if (subscription.status === 'expired') {
  return { error: 'Subscription expired. Please upgrade.' };
}
if (subscription.tokens_used >= subscription.token_quota) {
  return { error: 'Token quota exceeded. Upgrade plan or wait for reset.' };
}
```

---

#### 4. Guided Tutorial System

**File**: `src/components/GuidedTutorial.tsx`

**Framework**: Use `react-joyride` for interactive tours

**Tours**:
1. **Dashboard Tour** - Overview of key metrics
2. **AI Act Audit Tour** - Create first assessment
3. **GDPR Scan Tour** - Upload document and scan
4. **ESG Reporting Tour** - Import metrics and generate report
5. **Automation Tour** - Create first actuator rule

**Trigger**: Auto-start on first login after onboarding

---

#### 5. Help Center

**File**: `src/pages/HelpCenter.tsx` (already exists, enhance)

**Enhancements**:
- **FAQ Section** - 50+ Q&A pairs
- **API Documentation** - Swagger/OpenAPI spec
- **Compliance Glossary** - EU AI Act, GDPR, CSRD terms
- **Video Tutorials** - Embedded YouTube/Vimeo
- **Search Bar** - Powered by lightweight fuzzy search
- **Report Issue Form** - Creates entry in `support_tickets`

---

#### 6. Custom Branding (Enterprise Only)

**File**: `src/pages/admin/Branding.tsx`

**Customization Options**:
- Upload custom logo
- Choose theme color (primary/accent)
- Set custom favicon
- Configure custom domain (CNAME setup guide)

**Implementation**:
- Store settings in `organization_branding` table
- Apply via CSS variables and React Context

---

### 📋 TODO

- [ ] Implement `demo-provision` and `demo-reset` edge functions
- [ ] Seed demo datasets
- [ ] Create `OnboardingWizard.tsx` component
- [ ] Integrate Stripe (enable using Lovable tool)
- [ ] Implement subscription enforcement logic
- [ ] Create `GuidedTutorial.tsx` component with tours
- [ ] Enhance `HelpCenter.tsx` with FAQ and search
- [ ] Create `Branding.tsx` admin page
- [ ] Add "Launch Demo" button to login page
- [ ] Implement trial expiration email notifications
- [ ] Create `USER_GUIDE_ENTERPRISE.md`
- [ ] Create `ADMIN_RUNBOOK.md`
- [ ] Create `INTEGRATION_GUIDE.md`
- [ ] Create `ESG_REPORTING_MANUAL.md`
- [ ] Create `CHANGELOG_PHASE_5.md`
- [ ] Set up CI/CD for staging/production environments
- [ ] Configure custom domain support
- [ ] Implement daily backup automation

---

## Implementation Priority Order

### Week 1: Critical Monitoring Infrastructure
1. ✅ Database migrations (DONE)
2. Monitoring agent edge function
3. Alert engine edge function
4. Monitoring dashboard UI

### Week 2: SOC 2 Evidence System
5. SOC 2 evidence generator
6. SOC 2 report generator
7. Evidence export functionality
8. Documentation (SOC 2 guide, runbook)

### Week 3: Onboarding System
9. Demo environment setup
10. Onboarding wizard
11. Stripe integration
12. Trial enforcement logic

### Week 4: Enterprise Features
13. Guided tutorial system
14. Help center enhancements
15. Custom branding
16. Enterprise documentation

### Week 5: Testing & Launch
17. End-to-end QA
18. Performance testing
19. Security audit
20. Production deployment

---

## Success Metrics

### Phase 4.4 Success Criteria
- ✅ System metrics collected every 5 minutes
- ✅ Security events logged with < 1s latency
- ✅ Alerts triggered within 2 minutes of threshold breach
- ✅ SOC 2 evidence generated daily with 99%+ completeness
- ✅ Monitoring dashboard loads in < 2s
- ✅ Evidence exports available within 30s

### Phase 5 Success Criteria
- ✅ Demo environment functional with all 3 datasets
- ✅ Onboarding wizard completion rate > 80%
- ✅ Trial-to-paid conversion tracked
- ✅ Support ticket response time < 24h
- ✅ Help center search accuracy > 90%
- ✅ Custom branding applied in < 5 minutes

---

## Risk Mitigation

### Phase 4.4 Risks
- **Monitoring overhead**: Use lightweight metrics, batch inserts
- **Alert fatigue**: Implement cooldown periods, configurable thresholds
- **Storage costs**: 90-day retention, compressed archives

### Phase 5 Risks
- **Stripe integration complexity**: Use official SDK, test webhooks thoroughly
- **Demo data contamination**: Enforce read-only mode, automated resets
- **Onboarding drop-off**: Track step completion, send reminder emails

---

## Next Steps

1. **Immediate**: Implement monitoring-agent edge function
2. **This Week**: Complete Phase 4.4 monitoring infrastructure
3. **Next Week**: Begin SOC 2 evidence automation
4. **Week 3**: Start onboarding wizard and Stripe integration
5. **Week 4**: Enterprise features and documentation
6. **Week 5**: QA and production launch

---

**Status**: Phase 4.4 Foundation Complete ✅  
**Next Milestone**: Monitoring Agent Implementation  
**Target Launch**: 4-5 weeks from now

---

*This roadmap is a living document and will be updated as implementation progresses.*
