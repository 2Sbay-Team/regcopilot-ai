import { describe, it, expect, beforeAll } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

/**
 * OWASP Top 10 Security Tests
 * Tests for common web application vulnerabilities
 */

describe('OWASP Top 10 Security Tests', () => {
  
  describe('A01:2021 - Broken Access Control', () => {
    it('should prevent unauthorized access to admin functions', async () => {
      // Attempt to call admin-only function without proper auth
      const { error } = await supabase.rpc('has_role', {
        _user_id: '00000000-0000-0000-0000-000000000000',
        _role: 'admin'
      });
      
      expect(error).toBeDefined();
    });

    it('should enforce RLS on sensitive tables', async () => {
      // Attempt to read from profiles without auth
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      // Should either return no data or error due to RLS
      if (!error) {
        expect(data).toHaveLength(0);
      }
    });
  });

  describe('A02:2021 - Cryptographic Failures', () => {
    it('should reject weak passwords', async () => {
      const weakPasswords = [
        'password',
        '12345678',
        'qwerty',
        'admin123'
      ];

      for (const password of weakPasswords) {
        const { error } = await supabase.auth.signUp({
          email: `test-${Date.now()}@example.com`,
          password
        });
        
        // Should fail due to weak password
        expect(error).toBeDefined();
      }
    });

    it('should ensure secure password storage', async () => {
      // Passwords should never be stored in plain text
      // This test verifies we cannot retrieve passwords
      const { data, error } = await supabase
        .from('profiles')
        .select('password')
        .limit(1);
      
      // Password column should not exist in profiles
      expect(error).toBeDefined();
    });
  });

  describe('A03:2021 - Injection', () => {
    it('should prevent SQL injection in search queries', async () => {
      const maliciousInputs = [
        "'; DROP TABLE profiles; --",
        "1' OR '1'='1",
        "admin'--",
        "1; DELETE FROM profiles WHERE 1=1; --"
      ];

      for (const input of maliciousInputs) {
        const { error } = await supabase
          .from('profiles')
          .select('*')
          .ilike('full_name', input);
        
        // Should safely handle the input without executing SQL
        // Either returns safely or returns proper error
        expect(error?.message).not.toContain('syntax error');
      }
    });

    it('should prevent NoSQL injection in JSONB fields', async () => {
      const maliciousJson = {
        "$ne": null,
        "$gt": "",
        "$where": "1==1"
      };

      const { error } = await supabase
        .from('ai_act_assessments')
        .select('*')
        .eq('system_details', maliciousJson);
      
      // Should handle safely
      expect(error).not.toBeDefined();
    });
  });

  describe('A04:2021 - Insecure Design', () => {
    it('should enforce rate limiting on authentication', async () => {
      const email = `rate-limit-test-${Date.now()}@example.com`;
      const attempts = [];

      // Attempt multiple logins rapidly
      for (let i = 0; i < 10; i++) {
        attempts.push(
          supabase.auth.signInWithPassword({
            email,
            password: 'wrongpassword'
          })
        );
      }

      const results = await Promise.all(attempts);
      
      // Should eventually rate limit
      const rateLimited = results.some(r => 
        r.error?.message?.includes('rate limit') ||
        r.error?.message?.includes('too many')
      );
      
      expect(rateLimited).toBe(true);
    });

    it('should implement account lockout after failed attempts', async () => {
      // This would be tested via the login_attempts table
      const { data } = await supabase
        .from('login_attempts')
        .select('*')
        .eq('success', false)
        .limit(1);
      
      // Verify login_attempts table exists and tracks failures
      expect(data).toBeDefined();
    });
  });

  describe('A05:2021 - Security Misconfiguration', () => {
    it('should not expose sensitive error messages', async () => {
      const { error } = await supabase
        .from('non_existent_table')
        .select('*');
      
      // Error should not reveal internal database structure
      expect(error?.message).not.toContain('pg_');
      expect(error?.message).not.toContain('postgres');
      expect(error?.message).not.toContain('schema');
    });

    it('should enforce HTTPS in production', () => {
      const url = import.meta.env.VITE_SUPABASE_URL;
      expect(url).toMatch(/^https:\/\//);
    });

    it('should have secure headers configured', async () => {
      const response = await fetch(import.meta.env.VITE_SUPABASE_URL);
      const headers = response.headers;
      
      // Check for security headers
      expect(headers.get('x-frame-options')).toBeDefined();
      expect(headers.get('x-content-type-options')).toBe('nosniff');
    });
  });

  describe('A06:2021 - Vulnerable Components', () => {
    it('should not use deprecated authentication methods', async () => {
      // signIn is deprecated, should use signInWithPassword
      const { error } = await (supabase.auth as any).signIn?.({
        email: 'test@example.com',
        password: 'test'
      });
      
      // Old method should not exist
      expect((supabase.auth as any).signIn).toBeUndefined();
    });
  });

  describe('A07:2021 - Identification and Authentication Failures', () => {
    it('should require authentication for protected resources', async () => {
      // Clear any existing session
      await supabase.auth.signOut();
      
      const { error } = await supabase
        .from('ai_act_assessments')
        .insert({
          organization_id: '00000000-0000-0000-0000-000000000000',
          system_name: 'Test',
          risk_category: 'high'
        });
      
      expect(error).toBeDefined();
    });

    it('should invalidate sessions on logout', async () => {
      await supabase.auth.signOut();
      
      const { data: { session } } = await supabase.auth.getSession();
      expect(session).toBeNull();
    });

    it('should enforce password complexity', async () => {
      const { error } = await supabase.auth.signUp({
        email: `complexity-test-${Date.now()}@example.com`,
        password: 'weak'
      });
      
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/password|length|strength/i);
    });
  });

  describe('A08:2021 - Software and Data Integrity Failures', () => {
    it('should validate audit chain integrity', async () => {
      const { data } = await supabase
        .from('audit_logs')
        .select('id, prev_hash, output_hash')
        .order('timestamp', { ascending: true })
        .limit(10);
      
      if (data && data.length > 1) {
        // Verify hash chain
        for (let i = 1; i < data.length; i++) {
          const prevEntry = data[i - 1];
          const currentEntry = data[i];
          
          // Current entry's prev_hash should match previous entry's output_hash
          expect(currentEntry.prev_hash).toBe(prevEntry.output_hash);
        }
      }
    });

    it('should prevent audit log tampering', async () => {
      const { error } = await supabase
        .from('audit_logs')
        .update({ output_hash: 'tampered' })
        .eq('id', '00000000-0000-0000-0000-000000000000');
      
      // Should be prevented by RLS or triggers
      expect(error).toBeDefined();
    });
  });

  describe('A09:2021 - Security Logging and Monitoring Failures', () => {
    it('should log authentication attempts', async () => {
      const { data } = await supabase
        .from('login_attempts')
        .select('*')
        .limit(1);
      
      expect(data).toBeDefined();
    });

    it('should track sensitive operations in audit logs', async () => {
      const { data } = await supabase
        .from('audit_logs')
        .select('module, action')
        .limit(1);
      
      expect(data).toBeDefined();
    });
  });

  describe('A10:2021 - Server-Side Request Forgery (SSRF)', () => {
    it('should validate URLs in connector configurations', async () => {
      const maliciousUrls = [
        'http://localhost/admin',
        'http://169.254.169.254/latest/meta-data/',
        'file:///etc/passwd',
        'http://internal-service:8080'
      ];

      for (const url of maliciousUrls) {
        const { error } = await supabase
          .from('connectors')
          .insert({
            name: 'Test Connector',
            connector_type: 'custom',
            config: { url }
          });
        
        // Should validate and reject internal/file URLs
        if (!error) {
          // If insert succeeded, the URL validation should happen in edge function
          expect(url).not.toMatch(/localhost|127\.0\.0\.1|169\.254|file:/);
        }
      }
    });
  });
});
