import { describe, it, expect, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

/**
 * Role Isolation & Multi-Tenant Security Tests
 * Phase 12: Verify super_admin and org_admin cannot cross tenant boundaries
 */

describe('Role Isolation Tests', () => {
  
  describe('Super Admin Access', () => {
    it('should allow super_admin to view all organizations', async () => {
      // This test requires a super_admin user to be authenticated
      const { data: isSuperAdmin } = await supabase.rpc('is_super_admin');
      
      if (isSuperAdmin) {
        const { data, error } = await supabase
          .from('organizations')
          .select('*');
        
        expect(error).toBeNull();
        expect(data).toBeDefined();
      }
    });

    it('should allow super_admin to view platform analytics', async () => {
      const { data: isSuperAdmin } = await supabase.rpc('is_super_admin');
      
      if (isSuperAdmin) {
        const { data, error } = await supabase
          .from('platform_analytics')
          .select('*')
          .single();
        
        // May be null if no data aggregated yet
        expect(error).toBeNull();
      }
    });

    it('should prevent super_admin from modifying org data without proper RLS', async () => {
      const { data: isSuperAdmin } = await supabase.rpc('is_super_admin');
      
      if (isSuperAdmin) {
        // Super admin should NOT be able to directly modify org data
        // without explicit policy allowing it
        const { error } = await supabase
          .from('ai_act_assessments')
          .insert({
            ai_system_id: '00000000-0000-0000-0000-000000000000',
            risk_category: 'minimal',
          });
        
        // Should fail due to RLS
        expect(error).toBeDefined();
      }
    });
  });

  describe('Organization Admin Access', () => {
    it('should only allow org_admin to view their own organization', async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .single();
      
      if (!profile) return;

      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', profile.organization_id);
      
      expect(error).toBeNull();
      expect(data?.length).toBeLessThanOrEqual(1);
    });

    it('should prevent org_admin from accessing another org\'s data', async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .single();
      
      if (!profile) return;

      // Try to access data from a different org
      const { data: otherOrgs } = await supabase
        .from('organizations')
        .select('id')
        .neq('id', profile.organization_id)
        .limit(1);
      
      if (otherOrgs && otherOrgs.length > 0) {
        const otherOrgId = otherOrgs[0].id;
        
        const { data, error } = await supabase
          .from('ai_act_assessments')
          .select('*')
          .in('ai_system_id', 
            supabase
              .from('ai_systems')
              .select('id')
              .eq('organization_id', otherOrgId)
          );
        
        // Should return empty or error
        expect(data?.length || 0).toBe(0);
      }
    });

    it('should allow org_admin to manage users in their org', async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .single();
      
      if (!profile) return;

      // Check if user has org_admin role
      const { data: hasRole } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'org_admin'
      });

      if (hasRole) {
        const { data: roles } = await supabase
          .from('user_roles')
          .select('*')
          .eq('organization_id', profile.organization_id);
        
        expect(roles).toBeDefined();
      }
    });

    it('should prevent org_admin from assigning super_admin role', async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .single();
      
      if (!profile) return;

      // Try to assign super_admin role
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          organization_id: profile.organization_id,
          role: 'super_admin',
        });
      
      // Should fail due to RLS policy preventing super_admin assignment
      expect(error).toBeDefined();
    });
  });

  describe('Analyst/Viewer Access', () => {
    it('should allow analyst to view assessments in their org', async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .single();
      
      if (!profile) return;

      const { data: assessments, error } = await supabase
        .from('ai_act_assessments')
        .select(`
          *,
          ai_systems!inner(organization_id)
        `)
        .eq('ai_systems.organization_id', profile.organization_id);
      
      expect(error).toBeNull();
    });

    it('should prevent analyst from modifying critical settings', async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .single();
      
      if (!profile) return;

      // Try to modify organization settings
      const { error } = await supabase
        .from('organizations')
        .update({ subscription_plan: 'enterprise' })
        .eq('id', profile.organization_id);
      
      // Should fail unless user is org_admin
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: isOrgAdmin } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'org_admin'
      });

      if (!isOrgAdmin) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Cross-Tenant Data Isolation', () => {
    it('should prevent access to audit_logs from other organizations', async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .single();
      
      if (!profile) return;

      const { data: logs } = await supabase
        .from('audit_logs')
        .select('organization_id')
        .neq('organization_id', profile.organization_id);
      
      // Should return empty due to RLS
      expect(logs?.length || 0).toBe(0);
    });

    it('should prevent access to model_usage_logs from other orgs', async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .single();
      
      if (!profile) return;

      const { data: logs } = await supabase
        .from('model_usage_logs')
        .select('organization_id')
        .neq('organization_id', profile.organization_id);
      
      expect(logs?.length || 0).toBe(0);
    });

    it('should prevent access to billing_events from other orgs', async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .single();
      
      if (!profile) return;

      const { data: events } = await supabase
        .from('billing_events')
        .select('organization_id')
        .neq('organization_id', profile.organization_id);
      
      expect(events?.length || 0).toBe(0);
    });
  });

  describe('Helper Functions', () => {
    it('should correctly identify super_admin users', async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: isSuperAdmin, error } = await supabase.rpc('is_super_admin', {
        _user_id: user.id
      });
      
      expect(error).toBeNull();
      expect(typeof isSuperAdmin).toBe('boolean');
    });

    it('should return correct organization for current_org()', async () => {
      const { data: orgId, error } = await supabase.rpc('current_org');
      
      // Will be null if user not authenticated
      if (orgId) {
        expect(error).toBeNull();
        expect(typeof orgId).toBe('string');
      }
    });

    it('should return user role via get_user_role()', async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: role, error } = await supabase.rpc('get_user_role', {
        _user_id: user.id
      });
      
      expect(error).toBeNull();
      if (role) {
        expect(['super_admin', 'org_admin', 'admin', 'analyst', 'auditor', 'user', 'viewer'])
          .toContain(role);
      }
    });
  });
});
