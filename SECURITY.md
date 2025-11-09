# Security Architecture & Compliance

## Overview
The Compliance & ESG Copilot implements enterprise-grade security controls aligned with GDPR, EU AI Act, and SOC 2 requirements.

## Authentication & Access Control

### Multi-Factor Authentication (MFA)
- **Status**: Backend Complete, UI In Progress
- **Implementation**: TOTP-based (RFC 6238)
- **Backup Codes**: SHA-256 hashed, stored in `mfa_backup_codes` table
- **MFA Tables**:
  - `profiles.mfa_secret` - Encrypted TOTP secret
  - `profiles.mfa_enabled` - MFA enrollment status
  - `mfa_backup_codes` - Backup recovery codes

### Authentication Audit Logging
- **Table**: `auth_audit_logs`
- **Tracked Events**:
  - `login` - Successful authentication
  - `logout` - User session termination
  - `failed_login` - Failed authentication attempts
  - `mfa_enabled` - MFA enrollment
  - `mfa_disabled` - MFA removal
  - `password_changed` - Password updates
- **Data Captured**:
  - User ID
  - IP address (INET type)
  - User agent string
  - Event metadata (JSONB)
  - Timestamp

### Row-Level Security (RLS)

All tables implement RLS with organization-level isolation:

```sql
-- Organization isolation pattern
CREATE POLICY "Users can view their org data"
ON table_name FOR SELECT TO authenticated
USING (organization_id = get_user_organization_id(auth.uid()));
```

**Critical Tables with RLS**:
- ✅ `profiles` - User can view own, admins view all
- ✅ `organizations` - Users view own org only
- ✅ `audit_logs` - Organization-scoped
- ✅ `auth_audit_logs` - User-scoped + admin override
- ✅ `model_usage_logs` - Organization-scoped
- ✅ `connectors` - Organization-scoped
- ✅ `ai_systems` - Organization-scoped
- ✅ All assessment tables (AI Act, GDPR, ESG)

### Role-Based Access Control (RBAC)

**Roles** (enum `app_role`):
- `admin` - Full system access, user management
- `analyst` - Can create/manage assessments
- `user` - Read-only access to org data

**Implementation**:
```sql
-- Security definer function prevents recursive RLS
CREATE FUNCTION has_role(_user_id uuid, _role app_role)
RETURNS boolean
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = _user_id AND role = _role
  )
$$;
```

## Data Protection

### Password Security
- ✅ **Strength Requirements**: Enforced via Supabase Auth
- ⚠️ **Leaked Password Protection**: Currently disabled (needs configuration)
- ✅ **Password Leak Tracking**: `password_leak_checks` table for HaveIBeenPwned integration

### Data Encryption
- **At Rest**: Supabase native encryption (AES-256)
- **In Transit**: TLS 1.3 for all connections
- **Sensitive Fields**: 
  - `reasoning_chain` in `audit_logs` (planned AES encryption)
  - MFA secrets (encrypted in profiles)
  - Backup codes (SHA-256 hashed)

### Data Retention & Deletion

**Table**: `data_retention_policies`
- Default retention: 365 days for audit logs
- Organization-specific policies
- Automated cleanup jobs (via `scheduled_jobs`)

**GDPR Compliance**:
- Right to erasure: User deletion cascades via `ON DELETE CASCADE`
- Data minimization: Only required fields collected
- Purpose limitation: Clear purpose per table

## API Security

### Edge Function Security
- **JWT Validation**: All functions validate `Authorization` header
- **Input Validation**: Zod schemas for all inputs
- **Rate Limiting**: Via Supabase native limits
- **CORS**: Controlled via `corsHeaders` in functions
- **Service Role**: Only for system operations (audit logging, cron jobs)

### Audit Chain Integrity

**Hash Chain Implementation**:
```
Entry N:
  prev_hash = SHA256(Entry N-1 output)
  input_hash = SHA256(request payload)
  output_hash = SHA256(input_hash + result + timestamp)
```

**Verification**: `verify-audit-chain` edge function validates linkage

## Compliance Alignment

### GDPR
- ✅ Data subject rights (DSAR workflow)
- ✅ Processing records (`data_processing_activities`)
- ✅ Audit logs with retention
- ✅ Data breach detection via monitoring
- ✅ Privacy by design (RLS, encryption)

### EU AI Act
- ✅ Risk classification tracking
- ✅ Model registry with bias documentation
- ✅ Audit trail for AI decisions
- ✅ Explainability through `explainability_views`

### SOC 2 Type II
- ✅ Access controls (RBAC + RLS)
- ✅ Change tracking (audit logs)
- ✅ Monitoring (alert thresholds)
- ✅ Incident response (DSAR, breach notifications)

## Vulnerability Management

### Known Issues (As of Phase 2)
| Priority | Issue | Status | ETA |
|----------|-------|--------|-----|
| P0 | Leaked password protection disabled | In Progress | Week 1 |
| P1 | MFA UI enrollment flow incomplete | Planned | Week 2 |
| P1 | Real RAG embeddings (placeholder vectors) | In Progress | Week 1 |
| P2 | SSO integration (SAML/OAuth) | Planned | Month 2 |

### Security Testing
- **Supabase Linter**: Automated on each migration
- **Manual Review**: RLS policies, edge functions
- **Penetration Testing**: Planned for production launch

## Monitoring & Alerting

### Alert Thresholds
- Failed login attempts > 5 in 10 minutes
- Unusual API usage patterns
- Connector sync failures
- Audit chain integrity breaches

**Table**: `alert_notifications`
- Real-time notification system
- Organization-scoped alerts
- Acknowledgment tracking

## Best Practices

### For Developers
1. **Never expose service role key** in client code
2. **Always validate inputs** using Zod schemas
3. **Use parameterized queries** (Supabase SDK handles this)
4. **Test RLS policies** with different roles
5. **Log security events** to `auth_audit_logs`

### For Administrators
1. **Review auth audit logs** weekly
2. **Monitor alert notifications** daily
3. **Rotate MFA backup codes** for critical accounts
4. **Configure data retention** per compliance requirements
5. **Enable leaked password protection** (Supabase Auth settings)

## Incident Response

### Data Breach Protocol
1. **Detection**: Automated via `alert_notifications`
2. **Containment**: Disable affected user accounts
3. **Investigation**: Query `auth_audit_logs` and `audit_logs`
4. **Notification**: GDPR requires notification within 72 hours
5. **Remediation**: Patch vulnerability, reset credentials
6. **Documentation**: Record in `compliance_reports`

### Contact
- Security issues: security@compliance-copilot.example
- GDPR requests: dpo@compliance-copilot.example

## Changelog

### Phase 2 (Current)
- ✅ Added `auth_audit_logs` table
- ✅ Locked down RLS on all public tables
- ✅ Added `password_leak_checks` table
- ✅ Implemented `data_retention_policies`
- ✅ Added `mfa_backup_codes` table
- ✅ Created `scheduled_jobs` infrastructure

### Phase 3 (Planned)
- [ ] Complete MFA enrollment UI
- [ ] Enable leaked password protection
- [ ] Real RAG embeddings
- [ ] SSO integration (SAML/OAuth)
- [ ] Plugin security sandboxing
