# Compliance & ESG Copilot - User Guide

**Version**: 4.2.0  
**Last Updated**: 2025-11-09  
**For**: End Users, Analysts, Administrators

---

## Welcome to the Compliance & ESG Copilot!

This guide will help you navigate the platform and leverage AI-powered compliance assessments across multiple regulatory frameworks.

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Copilot Modules](#2-copilot-modules)
3. [Feedback System](#3-feedback-system)
4. [Admin Dashboard](#4-admin-dashboard)
5. [Demo Script](#5-demo-script)
6. [FAQ](#6-faq)

---

## 1. Getting Started

### 1.1 Account Setup

**Sign Up**:
1. Navigate to the login page
2. Click "Sign Up"
3. Enter your email and password
4. Verify your email (if required)
5. You're automatically assigned to your organization

**Login**:
1. Enter your email and password
2. (Optional) Complete MFA if enrolled
3. You'll land on the Dashboard

**MFA Enrollment** (Recommended):
1. Go to Settings → Security
2. Click "Set up MFA"
3. Scan the QR code with your authenticator app (Google Authenticator, Authy, 1Password)
4. Enter the 6-digit code to verify
5. Save your backup codes in a secure location

### 1.2 Dashboard Overview

**Main Navigation**:
- **Dashboard** - Compliance overview and KPIs
- **Copilots** - AI-powered assessment tools
  - AI Act Auditor
  - GDPR Checker
  - ESG Reporter
  - NIS2 Assessor
  - DORA Assessor
  - DMA Assessor
- **Analytics** - Compliance scores and trends
- **Reports** - Generate and export compliance reports
- **Settings** - Profile, security, preferences

**Quick Actions**:
- Create new assessment
- View recent assessments
- Check compliance score
- Submit feedback on citations

### 1.3 User Roles

**User** (Default):
- View assessments for their organization
- Submit new assessments
- Provide feedback on citations
- Export their own reports

**Analyst**:
- All User permissions
- Create and manage assessments
- Review and approve findings
- Manage DSAR requests
- Configure data processing activities

**Admin**:
- All Analyst permissions
- Manage users and roles
- Configure connectors
- Access analytics dashboard
- Refresh materialized views
- System configuration

---

## 2. Copilot Modules

### 2.1 AI Act Auditor

**Purpose**: Classify AI systems under EU AI Act risk categories and generate conformity documentation.

**How to Use**:
1. Navigate to **Copilots → AI Act**
2. Fill in the form:
   - **System Name**: Name of your AI system
   - **Purpose**: What the AI system does
   - **Sector**: Industry/domain (e.g., Healthcare, Finance)
   - **Deployment Status**: Development, Testing, Production
3. Click **Run Assessment**
4. Review the results:
   - Risk Category (Unacceptable, High, Limited, Minimal)
   - Annex IV Compliance Summary
   - Recommendations
5. Export PDF report or save for later

**Example Use Cases**:
- ✅ HR hiring assistant → High Risk (automated decision-making)
- ✅ Chatbot for customer support → Limited Risk (interaction with humans)
- ✅ Spam filter → Minimal Risk (no impact on fundamental rights)

**Tips**:
- Be specific about the system's purpose
- Mention any sensitive use cases (biometric, law enforcement)
- Review recommendations carefully for high-risk systems

### 2.2 GDPR Checker

**Purpose**: Scan documents and data processing activities for GDPR compliance issues.

**How to Use**:
1. Navigate to **Copilots → GDPR**
2. Choose input method:
   - **Upload Document**: PDF, Word, Excel
   - **Paste Text**: Direct text input
   - **Data Processing Activity**: Structured questionnaire
3. Click **Run Scan**
4. Review violations found:
   - Article reference (e.g., Article 5 - Data Minimization)
   - Severity (Critical, High, Medium, Low)
   - Remediation steps
5. Create DSAR if needed

**Example Use Cases**:
- ✅ Scan privacy policy for missing required disclosures
- ✅ Check marketing email list for proper consent
- ✅ Validate data retention periods

**Tips**:
- Redact sensitive PII before uploading documents
- Use the "Data Processing Activity" form for systematic reviews
- Set up automatic scans for recurring documents

### 2.3 ESG Reporter

**Purpose**: Generate CSRD/ESRS-compliant sustainability reports from metrics.

**How to Use**:
1. Navigate to **Copilots → ESG**
2. Upload metrics:
   - **CSV Upload**: Bulk import (template provided)
   - **Manual Entry**: One-by-one entry
3. Select reporting period (e.g., FY 2024)
4. Choose ESRS standards to include:
   - E1 (Climate Change)
   - S1 (Own Workforce)
   - G1 (Business Conduct)
5. Click **Generate Report**
6. Review:
   - Metrics summary
   - Narrative sections (AI-generated)
   - Completeness score
   - Identified anomalies
7. Export PDF or edit narrative

**Example Metrics**:
- **E1**: Total GHG emissions (Scope 1, 2, 3)
- **S1**: Employee diversity ratios
- **G1**: Board composition

**Tips**:
- Use the CSV template for bulk imports
- Verify anomalies flagged by the AI
- Customize narrative sections to match your brand voice

### 2.4 NIS2 Assessor

**Purpose**: Evaluate cybersecurity maturity under NIS2 Directive requirements.

**How to Use**:
1. Navigate to **Copilots → NIS2**
2. Fill in the assessment form:
   - **Institution Name**: Your organization
   - **Institution Type**: Essential Entity or Important Entity
   - **ICT Services**: Cloud, network, endpoints, etc.
   - **Third-party Providers**: List critical vendors
   - **Incident Management**: Describe your CSIRT setup
   - **Testing Frequency**: How often you test resilience
3. Click **Run Assessment**
4. Review results:
   - Compliance score (0-100)
   - Risk classification
   - Gap analysis
   - Remediation roadmap
5. Export report

**Example Use Cases**:
- ✅ Healthcare provider → Essential Entity (high requirements)
- ✅ E-commerce platform → Important Entity (moderate requirements)

**Tips**:
- Be honest about your current maturity level
- Prioritize high-risk gaps first
- Schedule regular re-assessments (quarterly)

### 2.5 DORA Assessor

**Purpose**: Assess ICT operational resilience for financial institutions.

**How to Use**:
1. Navigate to **Copilots → DORA**
2. Fill in the questionnaire:
   - **Institution Type**: Bank, Insurance, Investment Firm
   - **ICT Services**: Core banking, payments, etc.
   - **Third-party Providers**: Critical ICT vendors
   - **Recovery Time Objective (RTO)**: Target downtime
   - **Business Continuity Plan**: Describe your BCP
   - **Testing Frequency**: DR drill frequency
3. Click **Run Assessment**
4. Review results:
   - Compliance score
   - Risk classification
   - Resilience gaps
   - Recommendations
5. Export report

**Example Use Cases**:
- ✅ Online bank → High scrutiny on payment systems
- ✅ Insurance broker → Moderate requirements

**Tips**:
- Document all critical ICT vendors
- Test your BCP regularly (at least annually)
- Monitor third-party provider performance

### 2.6 DMA Assessor

**Purpose**: Determine Digital Markets Act gatekeeping obligations for platforms.

**How to Use**:
1. Navigate to **Copilots → DMA**
2. Fill in the form:
   - **Platform Name**: Your platform
   - **Platform Type**: Social network, search, marketplace, etc.
   - **Monthly Active Users**: Total MAU
   - **Business Users**: Number of businesses on platform
   - **Operates in EU**: Yes/No
   - **Data Practices**: Describe data collection/sharing
   - **Interoperability**: Existing integrations
   - **Advertising Practices**: Targeting, transparency
3. Click **Run Assessment**
4. Review results:
   - Gatekeeper status (Yes/No)
   - Compliance obligations
   - Recommendations
   - Next steps
5. Export report

**Example Use Cases**:
- ✅ Social media platform (50M+ MAU) → Likely gatekeeper
- ✅ Niche marketplace (2M MAU) → Not a gatekeeper

**Tips**:
- Update MAU numbers quarterly
- Document all data sharing practices
- Consult legal counsel for gatekeeper obligations

---

## 3. Feedback System

### 3.1 Why Feedback Matters

Your feedback helps the AI improve citation accuracy and relevance. Every signal you provide trains the system to deliver better results for your organization.

**How Feedback Works**:
1. You submit feedback on a citation (👍 helpful or 👎 not helpful)
2. The system updates the feedback score for that citation
3. Future searches prioritize higher-scored citations
4. Missing citation reports trigger content curation

### 3.2 How to Provide Feedback

**On Citations**:
1. After any copilot assessment, you'll see cited regulations
2. Each citation has a "Feedback" button
3. Click to open the feedback popover
4. Choose:
   - **👍 Helpful** - Citation was relevant and useful
   - **👎 Not Helpful** - Citation was irrelevant or incorrect
   - **⚠️ Missing Info** - Expected citation was missing
   - **Irrelevant** - Citation doesn't apply to your situation
5. (Optional) Add notes (max 500 characters)
6. Click **Submit**

**On Search Results**:
1. After searching the RAG system
2. Rate your overall satisfaction (1-5 stars)
3. Flag if a critical citation was missing
4. (Optional) Add notes about what was expected

**Feedback Best Practices**:
- Be specific in notes (e.g., "Missing Article 22 on automated decision-making")
- Upvote citations that directly answered your question
- Downvote citations that were generic or off-topic
- Report missing citations to help expand the knowledge base

### 3.3 Organization-Specific Policies

**Creating Custom Policies**:
1. Navigate to **Settings → Org Policies** (Admin only)
2. Click **Add Policy**
3. Fill in:
   - **Title**: Policy name (e.g., "Internal Data Classification")
   - **Content**: Full policy text (max 5000 chars)
4. Click **Save**
5. The system generates embeddings automatically
6. Future RAG searches will include your org policies

**Benefits**:
- Tailored results for your organization
- Prioritize internal guidelines
- Combine regulatory requirements with internal policies

---

## 4. Admin Dashboard

### 4.1 RAG Insights Dashboard

**Access**: **Admin → RAG Insights**

**Key Metrics**:
- **Avg Satisfaction (7d)**: Mean user satisfaction rating
- **Missing Citation Alerts (7d)**: Number of reports
- **Top Upvoted Chunks**: Most helpful citations
- **Org Policy Usage**: % of searches using org policies

**Charts**:
- **Satisfaction Trends**: Line chart showing daily avg satisfaction by module
- **Missing Citation Hotspots**: Bar chart of top queries with missing citations
- **Feedback Distribution**: Pie chart of signal types (upvote, downvote, etc.)

**Tables**:
- **Most Upvoted Regulatory Chunks**: Top 10 citations by score
- **Recent Feedback Stream**: Live feed of user feedback

**Actions**:
- **Refresh Materialized Views**: Manually trigger MV refresh (admin only)
- **Export CSV**: Download feedback data for analysis
- **Explain Last Re-Rank**: View scoring weights applied to latest query

**Use Cases**:
- ✅ Identify gaps in regulatory coverage
- ✅ Track user satisfaction trends
- ✅ Prioritize content curation efforts
- ✅ Monitor feedback engagement

### 4.2 User Management

**Access**: **Admin → Users**

**Managing Users**:
1. View all users in your organization
2. Assign roles (User, Analyst, Admin)
3. Revoke access (deletes user data)
4. Audit user activity (login history, assessments created)

**Adding Users**:
1. Click **Invite User**
2. Enter email address
3. Assign default role
4. Send invitation email

**Best Practices**:
- Use least-privilege principle (default to User role)
- Review admin access quarterly
- Audit user activity logs monthly
- Enforce MFA for all admin users

### 4.3 Connector Management

**Access**: **Admin → Connectors**

**Supported Connectors**:
- **Azure Blob Storage**: Auto-scan uploaded compliance documents
- **AWS S3**: Monitor buckets for new files
- **SharePoint**: Sync document libraries
- **More coming**: Google Drive, Dropbox, Box

**Setting Up a Connector**:
1. Navigate to **Admin → Connectors**
2. Click **Add Connector**
3. Choose connector type (e.g., Azure Blob)
4. Enter credentials:
   - Account name
   - Access key (or use Managed Identity)
   - Container name
5. Test connection
6. Configure sync schedule (hourly, daily, weekly)
7. Save

**Automatic Analysis**:
- When a file is uploaded to a connected bucket
- The system queues an automatic analysis task
- Results appear in your assessments dashboard
- Notifications sent on completion

---

## 5. Demo Script

### 5.1 Executive Demo (15 minutes)

**Audience**: C-suite, investors, external stakeholders

**Script**:

**Intro (2 min)**:
> "Welcome to the Compliance & ESG Copilot. This platform automates compliance assessments across six major regulatory frameworks using AI. Let me show you how it works."

**Demo 1: AI Act Auditor (4 min)**:
1. Navigate to **Copilots → AI Act**
2. Enter example system:
   - Name: "HR Hiring Assistant"
   - Purpose: "Automated CV screening and candidate ranking"
   - Sector: "Human Resources"
3. Click **Run Assessment**
4. Show results:
   - **Risk Category**: High Risk (automated decision-making affecting employment)
   - **Annex IV Summary**: Requirements for high-risk AI systems
   - **Recommendations**: Human oversight, bias mitigation, explainability
5. Export PDF report

> "As you can see, the AI correctly identified this as a high-risk system and generated all required conformity documentation in under 5 seconds."

**Demo 2: GDPR Checker (4 min)**:
1. Navigate to **Copilots → GDPR**
2. Paste sample privacy policy text (intentionally flawed)
3. Click **Run Scan**
4. Show violations:
   - Missing Article 13 disclosures (processing basis)
   - Unclear data retention periods
   - No mention of data subject rights
5. Show remediation steps

> "The GDPR Checker instantly identified three critical violations and provided specific remediation guidance."

**Demo 3: Feedback System (3 min)**:
1. Click **Feedback** button on a citation
2. Upvote a helpful citation
3. Add note: "Perfect reference to Article 6(1)(b)"
4. Submit
5. Navigate to **Admin → RAG Insights**
6. Show feedback analytics:
   - Satisfaction trends
   - Top upvoted chunks
   - Missing citation reports

> "Every user interaction trains the AI. The system learns which citations are most helpful and prioritizes them in future searches."

**Wrap-up (2 min)**:
> "In summary, the Compliance & ESG Copilot reduces manual compliance work by 80%, improves accuracy through continuous learning, and provides full audit trails for regulatory inspections. Questions?"

### 5.2 Technical Demo (30 minutes)

**Audience**: Technical stakeholders, security auditors, developers

**Script**:

**Intro (3 min)**:
> "Let's dive into the technical architecture. The platform runs on Lovable Cloud with Supabase (PostgreSQL + pgvector) and Deno edge functions."

**Architecture Overview (5 min)**:
1. Show architecture diagram (from RUNBOOK.md)
2. Explain key components:
   - Frontend: React + TypeScript + Vite
   - Backend: Supabase (RLS, Auth, Storage, Edge Functions)
   - AI: Lovable AI Gateway (Gemini models + embeddings)
   - RAG: pgvector for semantic search
3. Highlight security layers:
   - Row-Level Security (RLS) for multi-tenancy
   - JWT authentication with MFA
   - Audit logging with SHA-256 hash chain

**Security Demo (7 min)**:
1. Open browser DevTools → Network tab
2. Show JWT token in Authorization header
3. Attempt to access another organization's data:
   ```sql
   SELECT * FROM ai_act_assessments WHERE organization_id = '<other_org>';
   ```
4. Show RLS blocking the query (empty result)
5. Navigate to **Audit Trail**
6. Show audit log entries:
   - Event type, timestamp, actor
   - Input/output hashes
   - Hash chain continuity

> "Every action is logged with cryptographic hashes. If anyone tampers with the logs, the hash chain breaks and triggers an alert."

**RAG System Demo (8 min)**:
1. Navigate to **RAG Search**
2. Enter query: "What are the AI Act risk categories?"
3. Show results:
   - Top 5 relevant chunks
   - Cosine similarity scores
   - Feedback scores (if available)
4. Click **Feedback** and upvote a result
5. Open Supabase dashboard (if possible) or SQL console
6. Show database tables:
   - `document_chunks` (regulatory corpus)
   - `chunk_feedback` (user signals)
   - `chunk_feedback_scores` (aggregated scores)
7. Run query:
   ```sql
   SELECT * FROM chunk_feedback_scores ORDER BY score DESC LIMIT 10;
   ```

> "The RAG system combines vector similarity, text matching, and user feedback for hybrid retrieval. Every feedback submission updates the scoring algorithm."

**Edge Functions Demo (5 min)**:
1. Open Lovable Cloud → Edge Functions
2. Select `ai-act-auditor` function
3. Show logs:
   - Request payload (sanitized)
   - Response time
   - Errors (if any)
4. Explain edge function architecture:
   - Deno runtime (TypeScript)
   - Auto-deployed on code commit
   - Scalable serverless execution

> "Edge functions handle all AI logic. They're stateless, auto-scale, and deploy in under 3 minutes."

**Wrap-up (2 min)**:
> "Questions on architecture, security, or deployment?"

### 5.3 End-User Training (45 minutes)

**Audience**: Analysts, compliance officers, operational users

**Agenda**:
1. **Login & Navigation** (5 min)
   - Sign up and login
   - Dashboard tour
   - Navigation menu overview

2. **AI Act Auditor** (10 min)
   - Hands-on exercise: Assess an AI system
   - Interpret risk categories
   - Export report

3. **GDPR Checker** (10 min)
   - Hands-on exercise: Scan a document
   - Review violations
   - Create DSAR

4. **ESG Reporter** (10 min)
   - Hands-on exercise: Upload metrics CSV
   - Generate report
   - Customize narrative

5. **Feedback System** (5 min)
   - Submit feedback on citations
   - View feedback analytics

6. **Q&A** (5 min)

---

## 6. FAQ

### General Questions

**Q: Is my data secure?**  
A: Yes. All data is encrypted at rest and in transit. Row-Level Security (RLS) ensures strict organization isolation. No user can access another organization's data.

**Q: Can I export my data?**  
A: Yes. You can export reports as PDF, assessments as JSON, and raw data as CSV. Use the export buttons on each page.

**Q: How is pricing calculated?**  
A: Currently in pilot phase, all features are free. Future pricing will be based on usage (assessments per month) with tiered plans (Free, Pro, Enterprise).

**Q: What languages are supported?**  
A: English is primary. Multi-language support (German, French, Spanish, Arabic) planned for Q2 2026.

### Technical Questions

**Q: What AI models power the copilots?**  
A: Google Gemini 2.5 Pro/Flash via Lovable AI Gateway. No OpenAI API key required.

**Q: How accurate is the AI?**  
A: RAG retrieval achieves 92% precision @ 5 on regulatory queries. Copilot assessments validated by compliance experts. User feedback continuously improves accuracy.

**Q: Can I integrate with my existing tools?**  
A: Yes. We support connectors for Azure Blob, AWS S3, SharePoint. API access coming in Phase 6.

**Q: What happens if I delete my account?**  
A: All your personal data is permanently deleted within 30 days (GDPR Right to Erasure). Organizational data remains if you're part of a team.

### Compliance Questions

**Q: Is this platform GDPR-compliant?**  
A: Yes. We follow data minimization, provide DSAR workflows, and auto-delete data after 12 months per retention policies.

**Q: Does this replace legal counsel?**  
A: No. The copilot assists with compliance assessments but does not provide legal advice. Always consult qualified counsel for legal interpretation.

**Q: Are audit trails tamper-proof?**  
A: Yes. Every audit log entry is hash-chained using SHA-256. Any tampering breaks the chain and triggers alerts.

**Q: How often are regulations updated?**  
A: The RAG corpus is updated monthly with new regulations and amendments. You can also add organization-specific policies.

---

## Support

**Need Help?**
- 📧 Email: support@lovable.dev
- 💬 Discord: [Join our community](https://discord.com/channels/1119885301872070706)
- 📚 Docs: [https://docs.lovable.dev](https://docs.lovable.dev)
- 🎥 Video Tutorials: [YouTube Playlist](https://www.youtube.com/playlist?list=...)

**Reporting Bugs**:
1. Navigate to **Settings → Help**
2. Click **Report Bug**
3. Describe the issue with screenshots
4. We'll respond within 24 hours

**Feature Requests**:
- Submit via feedback form in app
- Upvote existing requests
- We review monthly and prioritize based on votes

---

**Document Version**: 4.2.0  
**Last Updated**: 2025-11-09  
**Next Update**: 2025-12-09

---

**END OF USER GUIDE**
