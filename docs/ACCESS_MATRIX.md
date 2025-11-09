# Access Control Matrix - Phase 12

## Role-Based Access Control (RBAC) Implementation

This document defines the comprehensive access control matrix for the Multi-Tenant Admin Architecture.

## Role Hierarchy

```
super_admin (Platform Owner)
    ├── org_admin (Organization Owner)
    │   ├── admin (Department Admin)
    │   │   ├── analyst (Compliance Analyst)
    │   │   ├── auditor (External Auditor)
    │   │   └── user (Standard User)
    │   └── viewer (Read-Only User)
```

## Access Control Matrix

| Resource | super_admin | org_admin | admin | analyst | auditor | user | viewer |
|----------|------------|-----------|-------|---------|---------|------|--------|
| **Platform Analytics** | ✅ Full | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None |
| **All Organizations** | ✅ Read | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None |
| **Billing (All Orgs)** | ✅ Read | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None |
| **Model Configuration** | ✅ Full | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None |
| **Organization Settings** | ❌ None | ✅ Full | ⚠️ Limited | ❌ None | ❌ None | ❌ None | ❌ None |
| **User Management** | ❌ None | ✅ Full | ⚠️ Limited | ❌ None | ❌ None | ❌ None | ❌ None |
| **Billing (Own Org)** | ❌ None | ✅ Full | ❌ Read | ❌ None | ❌ None | ❌ None | ❌ None |
| **AI Act Assessments** | ❌ None | ✅ Full | ✅ Full | ✅ Create/Edit | ✅ Read | ✅ Read | ✅ Read |
| **GDPR Assessments** | ❌ None | ✅ Full | ✅ Full | ✅ Create/Edit | ✅ Read | ✅ Read | ✅ Read |
| **ESG Reports** | ❌ None | ✅ Full | ✅ Full | ✅ Create/Edit | ✅ Read | ✅ Read | ✅ Read |
| **Connectors** | ❌ None | ✅ Full | ⚠️ Limited | ❌ Read | ❌ None | ❌ None | ❌ None |
| **Audit Logs (Own Org)** | ✅ Read All | ✅ Read | ✅ Read | ✅ Read | ✅ Read | ✅ Read Own | ❌ None |
| **LLM Usage (Own Org)** | ✅ Read All | ✅ Read | ✅ Read | ✅ Read | ❌ None | ✅ Read Own | ❌ None |
| **Conformity Reports** | ❌ None | ✅ Full | ✅ Full | ✅ Create/Edit | ✅ Read/Sign | ✅ Read | ✅ Read |
| **DSAR Requests** | ❌ None | ✅ Full | ✅ Full | ✅ Create/Edit | ❌ None | ✅ Read Own | ❌ None |

## Legend

- ✅ **Full**: Complete CRUD access
- ✅ **Create/Edit**: Can create and edit, but not delete
- ✅ **Read**: Read-only access
- ✅ **Read Own**: Can only read their own records
- ⚠️ **Limited**: Restricted subset of operations
- ❌ **None**: No access

## Super Admin Capabilities

### Platform-Wide Access
- View all organizations and their subscription status
- Monitor platform analytics and LLM usage across all tenants
- Configure AI model providers and pricing
- Manage connector availability by plan tier
- Review aggregated audit logs (anonymized)

### Restrictions
- **Cannot** access raw tenant data without consent
- **Cannot** modify organization-specific assessments or reports
- **Cannot** view document contents uploaded by tenants
- **Cannot** assign roles within tenant organizations

## Organization Admin Capabilities

### Organization Management
- Invite and manage users within organization
- Assign roles (except `super_admin`)
- Configure organization settings and branding
- Manage subscription and billing
- View and export compliance reports

### Feature Access
- Enable/disable copilot modules based on subscription
- Configure connectors and data sources
- Set alert thresholds and automation rules
- Access all assessment data within organization

### Restrictions
- **Cannot** access other organizations' data
- **Cannot** assign `super_admin` role
- **Cannot** modify platform-wide settings
- **Cannot** view cross-tenant analytics

## Tenant Isolation Enforcement

### Database Level (RLS Policies)

```sql
-- Example: Organizations table
CREATE POLICY "org_isolation"
ON organizations
FOR ALL
USING (
  id = current_org() OR is_super_admin()
);

-- Example: Audit logs
CREATE POLICY "audit_log_isolation"
ON audit_logs
FOR SELECT
USING (
  organization_id = current_org()
  OR is_super_admin()
);
```

### Application Level (Edge Functions)

```typescript
// Verify organization context
const { data: profile } = await supabase
  .from('profiles')
  .select('organization_id')
  .eq('id', user.id)
  .single()

if (payload.organization_id !== profile.organization_id 
    && !isSuperAdmin) {
  throw new Error('Access Denied: Organization mismatch')
}
```

### Frontend Level (RoleGuard Component)

```typescript
<RoleGuard requiredRole="org_admin" organizationOnly>
  <OrganizationSettings />
</RoleGuard>
```

## Role Assignment Rules

### Automatic Assignment
- First user of new organization → `org_admin`
- Users joining via domain verification → `analyst`
- Users joining via invite → Role specified in invite

### Manual Assignment
- `org_admin` and `admin` can assign: `analyst`, `auditor`, `user`, `viewer`
- Only `super_admin` can assign: `super_admin`, `org_admin`
- Users cannot escalate their own privileges

## Audit Trail Requirements

All role-based actions are logged with:
- `actor_id` - User performing action
- `actor_role` - Role at time of action
- `organization_id` - Tenant context
- `action` - Operation performed
- `resource` - Target resource
- `timestamp` - When action occurred
- `input_hash` - Hash of request payload
- `output_hash` - Hash of response

## Testing Verification

### Role Isolation Tests
✅ Super admin can view all orgs
✅ Super admin cannot modify org data without proper policy
✅ Org admin can only view own organization
✅ Org admin cannot access other org data
✅ Org admin can manage users in their org
✅ Org admin cannot assign super_admin role

### Cross-Tenant Protection
✅ Audit logs isolated by organization_id
✅ Model usage logs isolated by organization_id
✅ Billing events isolated by organization_id
✅ Assessments isolated via ai_systems.organization_id

### Helper Functions
✅ `is_super_admin()` correctly identifies super admins
✅ `current_org()` returns correct organization
✅ `get_user_role()` returns highest priority role
✅ `has_role()` validates role membership

## Privilege Escalation Prevention

### Security Measures
1. **RLS Enforcement**: All tables have organization-scoped policies
2. **Role Validation**: Edge functions verify roles server-side
3. **Token Verification**: JWT includes organization_id claim
4. **Immutable Roles**: Users cannot modify their own roles
5. **Audit Logging**: All role changes logged with hash chain

### Prohibited Actions
- Client-side role checks only (always verify server-side)
- Storing roles in localStorage or sessionStorage
- Allowing users to modify their own role records
- Bypassing RLS policies via service role in user-facing functions

## Compliance Alignment

### GDPR
- Organization admins control data within their tenant
- Users can request their own data (DSAR)
- Data deletion scoped to organization
- Super admin cannot access PII without consent

### EU AI Act
- Organization admins manage AI system assessments
- External auditors can review conformity reports
- Platform owner monitors aggregate compliance metrics
- Clear separation between platform and tenant responsibilities

### SOC 2
- Least privilege access enforced
- Role changes logged and auditable
- Multi-tenant isolation verified
- Access reviews facilitated by role hierarchy

## Maintenance & Updates

### Role Schema Changes
All role modifications require:
1. Database migration with new enum values
2. Update to RLS policies
3. Frontend RoleGuard updates
4. Documentation updates
5. Test suite updates

### Access Matrix Reviews
- Quarterly review of role permissions
- Annual security audit of RLS policies
- Continuous monitoring of privilege escalation attempts
- Automated testing of tenant isolation

---

**Document Version**: 1.0  
**Last Updated**: Phase 12 Implementation  
**Next Review**: Q2 2025
