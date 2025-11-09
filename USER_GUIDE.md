# Compliance & ESG Copilot – User Guide

## 🌟 Welcome

Welcome to the **Compliance & ESG Copilot** — your intelligent platform for automating regulatory compliance across EU AI Act, GDPR, CSRD/ESRS, DMA, DORA, and NIS2.

This guide will help you navigate the platform, run assessments, and leverage AI-powered copilots to streamline your compliance workflows.

---

## 🚀 Getting Started

### 1. Account Setup

1. **Sign Up**: Visit the platform and create your account at `/signup`
2. **Organization Creation**: Your organization is automatically created upon signup
3. **Email Verification**: Confirm your email address (auto-confirmed in development)
4. **Login**: Access the platform at `/login`

### 2. First Steps After Login

1. **Dashboard Overview**: View your compliance scores and recent activities
2. **Complete Profile**: Navigate to Settings to update your organization details
3. **Enable MFA**: Secure your account with two-factor authentication at `/mfa-setup`
4. **Explore Copilots**: Visit each compliance module to understand available features

---

## 🤖 AI Copilots Overview

### AI Act Auditor (`/ai-act-copilot`)

**Purpose**: Classify AI systems by risk level and generate Annex IV conformity documentation.

**How to Use**:
1. Navigate to AI Act Copilot
2. Fill in system details:
   - System Name
   - Purpose/Description
   - Sector (Healthcare, Finance, etc.)
   - Model Type
3. Click "Run AI Act Assessment"
4. Review risk classification (Minimal, Limited, High, Unacceptable)
5. Download generated Annex IV summary report

**Output**:
- Risk category classification
- Conformity assessment findings
- Recommendations for compliance
- PDF report download

---

### GDPR Privacy Checker (`/gdpr-copilot`)

**Purpose**: Scan documents and data for GDPR compliance, detect personal data, and flag violations.

**How to Use**:
1. Navigate to GDPR Copilot
2. Upload document or paste text
3. Click "Scan for GDPR Compliance"
4. Review detected violations:
   - Personal data exposure
   - Legal basis issues
   - Consent problems
   - Cross-border transfer risks
5. Download compliance summary

**Features**:
- Personal data detection (PII, emails, phone numbers)
- Legal basis validation
- Data processing activity registry
- DSAR (Data Subject Access Request) management

---

### ESG Reporter (`/esg-copilot`)

**Purpose**: Analyze ESG metrics and draft CSRD/ESRS-compliant sustainability reports.

**How to Use**:
1. Navigate to ESG Copilot
2. Input ESG metrics:
   - Environmental: CO₂ emissions, energy consumption
   - Social: Diversity ratios, employee satisfaction
   - Governance: Board structure, ethics policies
3. Click "Generate ESG Report"
4. Review narrative sections with ESRS alignment
5. Download PDF report

**Output**:
- Metrics summary with completeness score
- Narrative sections (E1-E5, S1-S4, G1)
- Anomaly detection
- Recommendations for improvement

---

### DMA Assessor (`/dma-copilot`)

**Purpose**: Assess Digital Markets Act compliance for platform businesses.

**How to Use**:
1. Navigate to DMA Copilot
2. Enter platform details:
   - Platform name and type
   - Monthly active users
   - Business users count
   - EU operations status
3. Click "Run DMA Assessment"
4. Review gatekeeper status and compliance score
5. Download recommendations report

---

### DORA Assessor (`/dora-copilot`)

**Purpose**: Evaluate Digital Operational Resilience Act compliance for financial institutions.

**How to Use**:
1. Navigate to DORA Copilot
2. Enter institution details:
   - Institution name and type
   - ICT services description
   - Third-party providers
   - Testing frequency
3. Click "Run DORA Assessment"
4. Review risk classification and compliance score
5. Download resilience report

---

### NIS2 Assessor (`/nis2-copilot`)

**Purpose**: Assess Network and Information Security Directive 2 compliance.

**How to Use**:
1. Navigate to NIS2 Copilot
2. Enter entity details:
   - Entity name and sector
   - Essential services provided
   - Cybersecurity measures
3. Click "Run NIS2 Assessment"
4. Review compliance score and recommendations

---

## 📊 Dashboard & Analytics

### Compliance Dashboard (`/dashboard`)

**Features**:
- Overall compliance score (weighted average)
- Individual scores: AI Act, GDPR, ESG
- Recent assessments timeline
- Alert notifications
- Quick access to all copilots

### Analytics Page (`/analytics`)

**Metrics Available**:
- Assessment trends over time
- Compliance score evolution
- Module usage statistics
- Risk distribution charts
- Performance benchmarks

---

## 🔍 RAG Search & Explainability

### RAG Search (`/rag-search`)

**Purpose**: Semantic search across regulatory documents (AI Act, GDPR, CSRD, DMA, DORA, NIS2).

**How to Use**:
1. Navigate to RAG Search
2. Enter natural language query (e.g., "What are high-risk AI systems?")
3. Review retrieved regulatory chunks with similarity scores
4. Click on sources to view full context

**Technology**: Uses pgvector + OpenAI embeddings for semantic retrieval.

---

### Explainability (`/explainability`)

**Purpose**: View AI reasoning chains and evidence for all assessments.

**Features**:
- Assessment-linked explanations
- Evidence chunks with source attribution
- Reasoning transparency
- Audit trail integration

---

## 🔗 Data Connectors

### Connector Management (`/connectors`)

**Supported Integrations**:
- Azure Blob Storage
- AWS S3
- SharePoint
- OneDrive
- Google Drive
- Jira
- Confluence

**Setup Process**:
1. Navigate to Connectors
2. Click "Add Connector"
3. Select connector type
4. Configure credentials (stored securely)
5. Set sync frequency (hourly, daily, weekly)
6. Activate connector

**Auto-Analysis**:
- Documents uploaded to `gdpr-documents` bucket trigger automatic GDPR scans
- Documents in `esg-documents` bucket trigger ESG analysis
- Connector synced files are automatically queued for assessment

---

## 🔐 Security Features

### Multi-Factor Authentication (MFA)

**Setup**:
1. Navigate to `/mfa-setup`
2. Click "Enable MFA"
3. Scan QR code with authenticator app (Google Authenticator, Authy, 1Password)
4. Enter verification code
5. Save backup codes securely

**Login with MFA**:
- Enter email and password
- Provide 6-digit TOTP code from authenticator app
- Use backup code if authenticator unavailable

---

### Password Leak Detection

**Automatic Protection**:
- All passwords are checked against 800M+ breached password database
- Uses k-anonymity (Pwned Passwords API)
- No plaintext passwords sent to external services

---

### Audit Trail (`/audit-trail`)

**Features**:
- All copilot actions logged with hash chains
- Input/output hashing for tamper detection
- Reasoning transparency
- Blockchain-inspired integrity verification

**Verification**:
- Navigate to `/audit-chain-verify` to validate hash chain integrity
- Upload audit log export for external verification

---

## 📋 Reports & Documentation

### Generate Reports (`/reports`)

**Available Reports**:
1. **AI Act Compliance Report**
2. **GDPR Assessment Report**
3. **ESG Sustainability Report**
4. **Unified Cross-Regulatory Report**

**How to Generate**:
1. Navigate to Reports
2. Select report type
3. Choose date range
4. Click "Generate Report"
5. Download PDF

---

### Model Registry (`/model-registry`)

**Purpose**: Track AI models, datasets, and bias documentation.

**Features**:
- Register models with version control
- Link to AI Act assessments
- Document training datasets
- Tag risk categories
- Performance metrics tracking

---

## 🛠️ Admin Features

### Admin Dashboard (`/admin`)

**Capabilities** (Admin role required):
- User management
- Role assignment (Viewer, Analyst, Admin)
- Organization settings
- Connector configuration
- Alert threshold management
- Data retention policies

---

### Scheduled Jobs (`/scheduled-jobs`)

**Automated Tasks**:
- Monthly data purge (12-month retention)
- Connector sync schedules
- Compliance score recalculation
- Report generation workflows

**Monitoring**:
- Job execution logs
- Success/failure rates
- Next run schedules
- Manual trigger options

---

## 🌐 Data Lineage (`/data-lineage`)

**Purpose**: Visualize data flow and transformations across the platform.

**Features**:
- Node-based graph visualization
- Source → Processing → Output tracking
- Connector integration mapping
- Assessment workflow visualization

---

## 🔔 Alerts & Notifications

### Alert Thresholds

**Configurable Alerts**:
- High-risk AI systems detected
- GDPR violations threshold exceeded
- ESG completeness below target
- Failed connector syncs
- Authentication anomalies

**Configuration**:
1. Navigate to Settings → Alerts
2. Set threshold values
3. Enable email notifications
4. Configure escalation rules

---

## 📱 Mobile Access (PWA)

**Installation**:
1. Visit platform on mobile browser
2. Click "Add to Home Screen"
3. Platform installs as Progressive Web App
4. Offline capability for cached data

---

## 🆘 Support & Troubleshooting

### Common Issues

**Login Problems**:
- Verify email confirmation
- Check password (8+ characters, uppercase, number, symbol)
- Clear browser cache and cookies

**MFA Issues**:
- Ensure authenticator app time is synced
- Use backup codes if authenticator unavailable
- Contact admin to reset MFA

**Upload Failures**:
- Check file size limits (50MB max)
- Verify supported formats (PDF, DOCX, CSV)
- Ensure stable internet connection

**Assessment Errors**:
- Review input validation errors
- Check required fields are filled
- Verify organization permissions

---

### Contact Us

**Support Channels**:
- Email: support@compliancecopilot.ai
- In-app: Navigate to `/contact-us`
- Documentation: Check `/impressum` and `/privacy-policy`

---

## 📚 Additional Resources

### Documentation Files
- `ARCHITECTURE.md` – System architecture overview
- `SECURITY.md` – Security best practices
- `CONNECTORS.md` – Connector integration guide
- `RAG_OVERVIEW.md` – RAG search technical details
- `RUNBOOK.md` – Operations manual

### API Documentation
- Edge Functions: `/api/[function-name]`
- Authentication: JWT-based with Supabase Auth
- Rate Limits: 100 requests/minute per organization

---

## ✅ Best Practices

1. **Enable MFA immediately** for all users
2. **Run assessments regularly** (monthly minimum)
3. **Review audit logs** for security monitoring
4. **Keep connectors synced** for latest data
5. **Download reports** for external audits
6. **Update retention policies** per GDPR requirements
7. **Monitor compliance scores** for early risk detection
8. **Train team members** on copilot usage

---

## 🎯 Quick Start Checklist

- [ ] Create account and verify email
- [ ] Enable two-factor authentication
- [ ] Complete organization profile
- [ ] Run first AI Act assessment
- [ ] Upload document for GDPR scan
- [ ] Input ESG metrics
- [ ] Configure at least one connector
- [ ] Set up alert thresholds
- [ ] Generate unified compliance report
- [ ] Review audit trail
- [ ] Explore RAG search
- [ ] Bookmark dashboard

---

**Version**: 1.0  
**Last Updated**: 2025-11-09  
**Platform**: Compliance & ESG Copilot  
**Support**: support@compliancecopilot.ai
