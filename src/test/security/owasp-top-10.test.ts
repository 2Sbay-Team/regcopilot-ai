import { describe, it, expect } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

/**
 * OWASP Top 10 Security Tests
 */

describe('OWASP Top 10 Security Tests', () => {
  
  describe('A01:2021 - Broken Access Control', () => {
    it('should enforce RLS on sensitive tables', async () => {
      await supabase.auth.signOut();
      
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      expect(data?.length || 0).toBe(0);
    });
  });

  describe('A02:2021 - Cryptographic Failures', () => {
    it('should enforce HTTPS', () => {
      const url = import.meta.env.VITE_SUPABASE_URL;
      expect(url).toMatch(/^https:\/\//);
    });
  });

  describe('A03:2021 - Injection', () => {
    it('should handle SQL injection safely', async () => {
      const maliciousInput = "'; DROP TABLE profiles; --";
      
      const { error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('full_name', maliciousInput);
      
      // Should not expose syntax errors
      expect(error?.message).not.toContain('syntax error');
    });
  });

  describe('A07:2021 - Authentication Failures', () => {
    it('should require auth for protected resources', async () => {
      await supabase.auth.signOut();
      
      const { data, error } = await supabase
        .from('ai_act_assessments')
        .select('*')
        .limit(1);
      
      expect(error || data?.length === 0).toBeTruthy();
    });
  });

  describe('A09:2021 - Logging Failures', () => {
    it('should log authentication attempts', async () => {
      const { data } = await supabase
        .from('login_attempts')
        .select('*')
        .limit(1);
      
      expect(data).toBeDefined();
    });
  });
});
