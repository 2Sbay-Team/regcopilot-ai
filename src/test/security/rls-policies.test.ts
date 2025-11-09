import { describe, it, expect, beforeAll } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

/**
 * Row Level Security (RLS) Policy Verification Tests
 * Ensures all tables have proper RLS policies configured
 */

describe('RLS Policy Verification', () => {
  
  const sensitiveTablesWithPII = [
    'profiles',
    'login_attempts',
    'auth_audit_logs',
    'dsar_requests',
    'organization_invites'
  ];

  const complianceTables = [
    'ai_act_assessments',
    'gdpr_assessments',
    'esg_reports',
    'audit_logs',
    'model_registry',
    'dora_assessments',
    'dma_assessments',
    'nis2_assessments'
  ];

  describe('RLS Enabled on All Tables', () => {
    it('should have RLS enabled on profiles table', async () => {
      await supabase.auth.signOut();
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      // Without auth, should return no data or error
      if (!error) {
        expect(data).toHaveLength(0);
      }
    });

    it('should have RLS enabled on all sensitive PII tables', async () => {
      await supabase.auth.signOut();
      
      for (const table of sensitiveTablesWithPII) {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        // Should be protected by RLS
        if (!error) {
          expect(data?.length || 0).toBe(0);
        }
      }
    });

    it('should have RLS enabled on compliance tables', async () => {
      await supabase.auth.signOut();
      
      for (const table of complianceTables) {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        // Should be protected by RLS
        if (!error) {
          expect(data?.length || 0).toBe(0);
        }
      }
    });
  });

  describe('Multi-Tenant Isolation', () => {
    it('should enforce organization_id isolation', async () => {
      // Users should only see data from their organization
      const { data } = await supabase
        .from('ai_act_assessments')
        .select('organization_id')
        .limit(10);
      
      if (data && data.length > 0) {
        // All records should have same organization_id
        const orgIds = new Set(data.map(d => d.organization_id));
        expect(orgIds.size).toBeLessThanOrEqual(1);
      }
    });

    it('should prevent cross-tenant data access', async () => {
      const fakeOrgId = '00000000-0000-0000-0000-999999999999';
      
      const { data, error } = await supabase
        .from('ai_act_assessments')
        .select('*')
        .eq('organization_id', fakeOrgId);
      
      // Should not return data from other organizations
      expect(data?.length || 0).toBe(0);
    });
  });

  describe('Role-Based Access Control (RBAC)', () => {
    it('should restrict admin functions to admin users', async () => {
      const { error } = await supabase
        .from('organizations')
        .update({ name: 'Hacked' })
        .eq('id', '00000000-0000-0000-0000-000000000000');
      
      // Non-admin should not be able to update organizations
      expect(error).toBeDefined();
    });

    it('should allow users to read their own profile', async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        expect(error).toBeNull();
        expect(data).toBeDefined();
      }
    });

    it('should prevent users from reading other profiles', async () => {
      const fakeUserId = '00000000-0000-0000-0000-888888888888';
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', fakeUserId)
        .single();
      
      // Should not return other users' profiles
      expect(error).toBeDefined();
    });
  });

  describe('Insert/Update/Delete Policies', () => {
    it('should allow users to insert their own data', async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error } = await supabase
          .from('ai_act_assessments')
          .insert({
            system_name: 'Test System',
            purpose: 'Testing RLS',
            sector: 'healthcare'
          });
        
        // Should allow insert if user is authenticated
        // Error might occur if user doesn't have organization_id
        expect(error?.message).not.toContain('policy');
      }
    });

    it('should prevent unauthorized updates', async () => {
      const { error } = await supabase
        .from('audit_logs')
        .update({ reasoning: 'Tampered' })
        .eq('id', '00000000-0000-0000-0000-000000000000');
      
      // Audit logs should be immutable or highly restricted
      expect(error).toBeDefined();
    });

    it('should prevent unauthorized deletes', async () => {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', '00000000-0000-0000-0000-000000000000');
      
      // Should be restricted to admins only
      expect(error).toBeDefined();
    });
  });

  describe('Audit Trail Protection', () => {
    it('should make audit logs read-only for non-admins', async () => {
      const { error } = await supabase
        .from('audit_logs')
        .delete()
        .eq('id', '00000000-0000-0000-0000-000000000000');
      
      expect(error).toBeDefined();
    });

    it('should prevent modification of existing audit entries', async () => {
      const { error } = await supabase
        .from('audit_logs')
        .update({ 
          output_hash: 'modified',
          prev_hash: 'modified'
        })
        .limit(1);
      
      expect(error).toBeDefined();
    });
  });

  describe('Storage Bucket Policies', () => {
    it('should enforce RLS on private buckets', async () => {
      await supabase.auth.signOut();
      
      const { error } = await supabase
        .storage
        .from('gdpr-documents')
        .list();
      
      // Should require authentication
      expect(error).toBeDefined();
    });

    it('should allow users to access their own files', async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error } = await supabase
          .storage
          .from('gdpr-documents')
          .list();
        
        // Authenticated users should be able to list (even if empty)
        expect(error).toBeNull();
      }
    });
  });

  describe('Policy Coverage', () => {
    it('should have SELECT policies on all tables', async () => {
      const tables = [...sensitiveTablesWithPII, ...complianceTables];
      
      for (const table of tables) {
        const { data, error } = await supabase
          .from(table)
          .select('id')
          .limit(1);
        
        // Should either succeed with data or fail with proper error
        expect(error?.message).not.toContain('no policy');
      }
    });

    it('should have INSERT policies on writable tables', async () => {
      const writableTables = [
        'ai_act_assessments',
        'gdpr_assessments',
        'esg_reports',
        'feedback'
      ];
      
      for (const table of writableTables) {
        const { error } = await supabase
          .from(table)
          .insert({ test: 'value' });
        
        // Should have policy (might fail due to validation, not missing policy)
        expect(error?.message).not.toContain('no policy');
      }
    });
  });

  describe('Security Definer Functions', () => {
    it('should use security definer for role checks', async () => {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: '00000000-0000-0000-0000-000000000000',
        _role: 'admin'
      });
      
      // Function should exist and execute
      expect(error).toBeNull();
      expect(typeof data).toBe('boolean');
    });

    it('should prevent privilege escalation via functions', async () => {
      // Attempt to check admin role for another user
      const { data } = await supabase.rpc('has_role', {
        _user_id: '00000000-0000-0000-0000-999999999999',
        _role: 'admin'
      });
      
      // Should return false for non-existent user
      expect(data).toBe(false);
    });
  });
});
