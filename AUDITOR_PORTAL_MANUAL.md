# Auditor Portal Manual

## Introduction

The Auditor Portal provides external certification bodies and auditors with secure access to review and certify AI Act conformity reports submitted by organizations.

## Access & Authentication

### Obtaining Auditor Access

1. **Organization Request**: Organizations must invite auditors via admin panel
2. **Account Creation**: Auditors receive invitation email with registration link
3. **Role Assignment**: System administrators grant "auditor" role
4. **Access Scope**: Auditors can view all submitted reports across organizations

### Login Process

1. Navigate to `/login`
2. Enter credentials (email + password)
3. Complete MFA if enabled
4. Access portal at `/audit-portal`

## Portal Overview

### Dashboard Metrics

The portal displays real-time statistics:

- **Pending Reviews**: Reports awaiting auditor decision
- **Approved**: Reports that passed certification
- **Rejected**: Reports that failed conformity assessment

### Report List

All conformity reports are displayed with:
- AI system name
- Organization name
- Compliance status
- Risk category
- Generation date

**Color Coding**:
- 🟢 Green border: Approved
- 🔴 Red border: Rejected  
- 🟡 Yellow badge: Pending review
- ⚪ Gray badge: Draft

## Review Process

### Step 1: Select Report

Click on any report card to view detailed information.

### Step 2: Review Details Tab

**AI System Information**:
- Purpose and intended use
- Risk category classification
- Sector and deployment context
- Report type (Annex IV, Risk Assessment, etc.)

**Cryptographic Verification**:
- SHA-256 signature hash
- Generation timestamp
- Version number
- Previous version references

**Export Options**:
- JSON-LD format (EU-compatible)
- PDF export (with QR code)
- XML format (coming soon)

### Step 3: Evidence Tab

Review supporting evidence linked to the report:

**Evidence Types**:
- **Audit Logs**: System activity records
- **Model Cards**: ML model documentation
- **Data Governance**: Dataset information
- **Test Results**: Validation and testing outcomes
- **Human Oversight**: Oversight procedures

**Verification Status**:
- ✅ Verified: Evidence has been checked and validated
- ⚠️ Unverified: Evidence requires manual verification

**Evidence Categories** (Annex IV Sections):
- Section A: General Description
- Section B: Development Process
- Section C: Monitoring & Logging
- Section D: Risk Management
- Section E: Technical Documentation
- Section F: Transparency
- Section G: Updates & Maintenance

### Step 4: Sign-off Tab

#### Review Previous Sign-offs

View historical auditor decisions:
- Decision type (Approved/Rejected/Needs Revision)
- Compliance score
- Evidence coverage score
- Timestamp and auditor name

#### Submit New Sign-off

**1. Decision Selection**:
- **Approved**: Report meets all requirements
- **Needs Revision**: Report requires modifications
- **Rejected**: Report fails conformity assessment

**2. Review Notes** (Required):
Provide detailed comments including:
- Strengths and positive findings
- Deficiencies and gaps
- Recommended improvements
- Compliance concerns

**3. Compliance Score** (0-100):
Rate overall conformity with EU AI Act requirements:
- 90-100: Excellent compliance
- 80-89: Good compliance
- 70-79: Acceptable with minor issues
- 60-69: Needs improvement
- Below 60: Significant deficiencies

**4. Evidence Coverage Score** (0-100):
Rate completeness of supporting evidence:
- 90-100: Comprehensive documentation
- 80-89: Well-documented
- 70-79: Adequate coverage
- 60-69: Missing some evidence
- Below 60: Insufficient documentation

**5. Digital Signature**:
System automatically generates:
- SHA-256 hash of sign-off data
- Timestamp of certification
- Auditor ID linkage
- Report version reference

## Certification Process

### Approval Workflow

When you approve a report:

1. Status changes to **"approved"**
2. Organization receives notification
3. Report becomes eligible for export to EU repositories
4. Certificate can be generated with your signature

### Rejection Workflow

When you reject a report:

1. Status changes to **"rejected"**
2. Organization receives detailed feedback
3. Report must be revised and resubmitted
4. Previous version remains in history

### Revision Request Workflow

When you request revisions:

1. Status changes to **"needs_revision"**
2. Organization receives your notes
3. Report remains accessible for updates
4. You'll be notified when resubmitted

## Export & Documentation

### JSON-LD Export

**Purpose**: EU Digital Conformity Repository submission

**Contains**:
- Organization and AI system details
- Conformity assessment results
- Annex IV documentation
- Evidence links
- All auditor certifications
- Cryptographic signatures

**Usage**:
```bash
# Click "Export JSON-LD" button
# File downloads as: conformity-{report-id}.jsonld
```

**Format Compliance**:
- W3C JSON-LD 1.1
- Schema.org vocabulary
- Dublin Core metadata
- EU AI Act ontology

### Verification

To verify exported reports:

1. Check SHA-256 hash matches original
2. Verify timestamp chronology
3. Confirm auditor signatures present
4. Validate JSON-LD structure

## Security & Compliance

### Access Control

- **Read-Only Access**: Auditors cannot modify reports
- **Multi-Tenant Isolation**: RLS policies enforce separation
- **Audit Trail**: All auditor actions logged
- **Session Management**: 30-minute timeout

### Data Protection (GDPR)

- **Minimal Access**: Only view necessary information
- **No PII Storage**: Personal data minimized
- **Encryption**: TLS 1.3 in transit, AES-256 at rest
- **Right to Audit**: Full audit logs available

### Professional Standards

As an auditor, you must:

- ✅ Maintain independence and objectivity
- ✅ Follow ISO/IEC 17065 guidelines
- ✅ Protect confidential information
- ✅ Document all findings thoroughly
- ✅ Provide constructive feedback
- ❌ Do not accept conflicts of interest
- ❌ Do not share credentials
- ❌ Do not copy reports outside portal

## Common Scenarios

### Scenario 1: Complete Approval

**Situation**: Report fully compliant with all requirements

**Actions**:
1. Verify evidence completeness (95%+)
2. Check hash-chain integrity ✅
3. Review Annex IV sections (all present)
4. Set compliance score: 90+
5. Decision: **Approved**
6. Notes: "Excellent documentation, all requirements met"

### Scenario 2: Minor Deficiencies

**Situation**: Report mostly compliant but missing some evidence

**Actions**:
1. Identify missing evidence items
2. Check remaining documentation quality
3. Set compliance score: 75-85
4. Decision: **Needs Revision**
5. Notes: "Add Section D risk mitigation details. Include human oversight procedures."

### Scenario 3: Major Non-Conformity

**Situation**: Report fails key requirements

**Actions**:
1. Document specific violations
2. Reference relevant articles
3. Set compliance score: Below 70
4. Decision: **Rejected**
5. Notes: "Risk classification incorrect for use case. Missing Article 10 data governance requirements. Resubmit after addressing."

## Troubleshooting

### Cannot Access Portal

**Symptoms**: Redirected to dashboard or login

**Solutions**:
1. Verify "auditor" role assigned
2. Check account activation status
3. Contact system administrator
4. Clear browser cache and retry

### Reports Not Loading

**Symptoms**: Empty report list

**Solutions**:
1. Check network connection
2. Verify no organizations have submitted reports
3. Refresh browser
4. Contact technical support

### Export Failing

**Symptoms**: Download error or corrupt file

**Solutions**:
1. Try different browser
2. Disable popup blockers
3. Check available disk space
4. Retry after a few minutes

## Support & Contact

### Technical Support
- Email: support@compliance-copilot.eu
- Hours: Monday-Friday, 9:00-17:00 CET
- Response Time: Within 24 hours

### Compliance Questions
- Email: compliance@compliance-copilot.eu
- For regulatory interpretation
- EU AI Act guidance

### Emergency Contact
- Critical issues: +32 2 XXX XXXX
- Available 24/7 for system outages

## Appendix

### Keyboard Shortcuts

- `Ctrl/Cmd + K`: Global search
- `Ctrl/Cmd + E`: Export current report
- `Ctrl/Cmd + S`: Save draft sign-off
- `Esc`: Close modals

### Browser Requirements

**Supported Browsers**:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

**Required**:
- JavaScript enabled
- Cookies enabled
- TLS 1.2+ support

### Regulatory References

- **EU AI Act**: Regulation (EU) 2024/1689
- **Conformity Assessment**: Chapter III, Articles 40-46
- **Notified Bodies**: Annex VII
- **Technical Standards**: Harmonized standards list

---

**Manual Version**: 1.0  
**Last Updated**: November 2024  
**For Platform Version**: 5.0+