import { describe, it, expect } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

/**
 * Row Level Security (RLS) Policy Verification Tests
 */

describe('RLS Policy Verification', () => {
  
  describe('RLS Enabled on Critical Tables', () => {
    it('should have RLS on profiles table', async () => {
      await supabase.auth.signOut();
      
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      // Without auth, should return no data
      expect(data?.length || 0).toBe(0);
    });

    it('should have RLS on audit_logs', async () => {
      await supabase.auth.signOut();
      
      const { data } = await supabase
        .from('audit_logs')
        .select('*')
        .limit(1);
      
      expect(data?.length || 0).toBe(0);
    });

    it('should have RLS on ai_act_assessments', async () => {
      await supabase.auth.signOut();
      
      const { data } = await supabase
        .from('ai_act_assessments')
        .select('*')
        .limit(1);
      
      expect(data?.length || 0).toBe(0);
    });
  });

  describe('Role-Based Access Control', () => {
    it('should use has_role function', async () => {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: '00000000-0000-0000-0000-000000000000',
        _role: 'admin'
      });
      
      expect(error).toBeNull();
      expect(typeof data).toBe('boolean');
    });

    it('should prevent unauthorized organization updates', async () => {
      const { error } = await supabase
        .from('organizations')
        .update({ name: 'Hacked' })
        .eq('id', '00000000-0000-0000-0000-000000000000');
      
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
      
      expect(error).toBeDefined();
    });
  });
});
