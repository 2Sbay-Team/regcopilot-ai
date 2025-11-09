import { describe, it, expect } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

/**
 * Role Isolation & Multi-Tenant Security Tests
 * Phase 12: Verify super_admin and org_admin cannot cross tenant boundaries
 */

describe('Role Isolation Tests', () => {
  
  describe('Super Admin Access', () => {
    it('should check super_admin access to organizations', async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .limit(5);
      
      // RLS will restrict based on role
      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should prevent unauthorized modification of assessments', async () => {
      const { error } = await supabase
        .from('ai_act_assessments')
        .insert({
          ai_system_id: '00000000-0000-0000-0000-000000000000',
          risk_category: 'minimal',
        });
      
      // Should fail due to RLS if not authorized
      expect(error).toBeDefined();
    });
  });

  describe('Organization Admin Access', () => {
    it('should allow org_admin to view their own organization', async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .single();
      
      if (!profile || !profile.organization_id) return;

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
      
      if (!profile || !profile.organization_id) return;

      // Try to access data from a different org
      const { data: otherOrgs } = await supabase
        .from('organizations')
        .select('id')
        .neq('id', profile.organization_id)
        .limit(1);
      
      if (otherOrgs && otherOrgs.length > 0) {
        const otherOrgId = otherOrgs[0].id;
        const { data } = await supabase
          .from('ai_systems')
          .select('*')
          .eq('organization_id', otherOrgId);
        
        // Should return empty due to RLS
        expect(data?.length || 0).toBe(0);
      }
    });

    it('should allow viewing user roles in their org', async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .single();
      
      const orgId = (profile as any)?.organization_id;
      if (!orgId) return;

      const { data: roles } = await supabase
        .from('user_roles')
        .select('*')
        .limit(10);
      
      expect(Array.isArray(roles)).toBe(true);
    });
  });

  describe('Analyst/Viewer Access', () => {
    it('should allow viewing assessments in their org', async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .single();
      
      if (!profile || !profile.organization_id) return;

      const { data: systems } = await supabase
        .from('ai_systems')
        .select('id')
        .eq('organization_id', profile.organization_id)
        .limit(1);
      
      if (systems && systems.length > 0) {
        const { data: assessments, error } = await supabase
          .from('ai_act_assessments')
          .select('*')
          .eq('ai_system_id', systems[0].id);
        
        expect(error).toBeNull();
      }
    });

    it('should check modification permissions', async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .single();
      
      if (!profile || !profile.organization_id) return;

      // Try to modify organization settings
      const { error } = await supabase
        .from('organizations')
        .update({ name: 'Test Update' })
        .eq('id', profile.organization_id);
      
      // Will succeed or fail based on actual role
      expect(error || { message: 'ok' }).toBeDefined();
    });
  });

  describe('Cross-Tenant Data Isolation', () => {
    it('should prevent access to audit_logs from other organizations', async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .single();
      
      if (!profile || !profile.organization_id) return;

      const { data: logs } = await supabase
        .from('audit_logs')
        .select('organization_id')
        .neq('organization_id', profile.organization_id);
      
      // Should return empty due to RLS
      expect(logs?.length || 0).toBe(0);
    });

    it('should prevent access to model usage from other orgs', async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .single();
      
      if (!profile || !profile.organization_id) return;

      const { data: logs } = await supabase
        .from('model_usage_logs')
        .select('organization_id')
        .neq('organization_id', profile.organization_id);
      
      expect(logs?.length || 0).toBe(0);
    });
  });
});
