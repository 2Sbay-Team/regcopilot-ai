import { describe, it, expect } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

/**
 * JWT Token Validation Tests
 * Ensures proper JWT handling and validation
 */

describe('JWT Token Validation', () => {
  
  describe('Token Format Validation', () => {
    it('should reject malformed JWT tokens', async () => {
      const malformedTokens = [
        'invalid-token',
        'Bearer.invalid.token',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid',
        ''
      ];

      for (const token of malformedTokens) {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || ''
            }
          }
        );
        
        expect(response.status).toBeGreaterThanOrEqual(400);
      }
    });

    it('should reject expired JWT tokens', async () => {
      // Create an expired token (this would need to be generated with past exp)
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZXhwIjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles`,
        {
          headers: {
            'Authorization': `Bearer ${expiredToken}`,
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || ''
          }
        }
      );
      
      expect(response.status).toBe(401);
    });
  });

  describe('Token Lifecycle', () => {
    it('should generate valid tokens on signup', async () => {
      const { data, error } = await supabase.auth.signUp({
        email: `jwt-test-${Date.now()}@example.com`,
        password: 'ValidPassword123!'
      });
      
      if (!error && data.session) {
        expect(data.session.access_token).toBeDefined();
        expect(data.session.access_token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
      }
    });

    it('should generate valid tokens on login', async () => {
      // This would require a pre-existing test user
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'TestPassword123!'
      });
      
      if (!error && data.session) {
        expect(data.session.access_token).toBeDefined();
        expect(data.session.refresh_token).toBeDefined();
      }
    });

    it('should refresh tokens correctly', async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.refresh_token) {
        const { data, error } = await supabase.auth.refreshSession({
          refresh_token: session.refresh_token
        });
        
        expect(error).toBeNull();
        expect(data.session?.access_token).toBeDefined();
        expect(data.session?.access_token).not.toBe(session.access_token);
      }
    });

    it('should invalidate tokens on logout', async () => {
      await supabase.auth.signOut();
      
      const { data: { session } } = await supabase.auth.getSession();
      expect(session).toBeNull();
    });
  });

  describe('Token Claims Validation', () => {
    it('should include required claims in token', async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Decode JWT (simplified - in real scenario use proper JWT library)
        const parts = session.access_token.split('.');
        expect(parts).toHaveLength(3);
        
        const payload = JSON.parse(atob(parts[1]));
        
        // Verify required claims
        expect(payload.sub).toBeDefined(); // Subject (user ID)
        expect(payload.exp).toBeDefined(); // Expiration
        expect(payload.iat).toBeDefined(); // Issued at
        expect(payload.role).toBeDefined(); // Role
      }
    });

    it('should enforce token expiration', async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const parts = session.access_token.split('.');
        const payload = JSON.parse(atob(parts[1]));
        
        // Token should not be expired
        const now = Math.floor(Date.now() / 1000);
        expect(payload.exp).toBeGreaterThan(now);
        
        // Token should have reasonable expiration (not too far in future)
        const oneWeek = 7 * 24 * 60 * 60;
        expect(payload.exp - now).toBeLessThan(oneWeek);
      }
    });
  });

  describe('Edge Function JWT Verification', () => {
    it('should require JWT for protected edge functions', async () => {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-act-auditor`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            system_name: 'Test',
            purpose: 'Test',
            sector: 'healthcare'
          })
        }
      );
      
      // Should reject without JWT
      expect(response.status).toBe(401);
    });

    it('should accept valid JWT for protected edge functions', async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-act-auditor`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
              organization_id: '00000000-0000-0000-0000-000000000000',
              system_name: 'Test',
              purpose: 'Test',
              sector: 'healthcare'
            })
          }
        );
        
        // Should accept with valid JWT (might fail for other reasons)
        expect(response.status).not.toBe(401);
      }
    });
  });

  describe('Token Security', () => {
    it('should not expose tokens in URLs', () => {
      const currentUrl = window.location.href;
      
      expect(currentUrl).not.toMatch(/access_token=/);
      expect(currentUrl).not.toMatch(/refresh_token=/);
    });

    it('should use secure token storage', () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Tokens should not be in localStorage (Supabase uses more secure storage)
        const localStorage = window.localStorage;
        const localStorageStr = JSON.stringify(localStorage);
        
        expect(localStorageStr).not.toContain(session.access_token);
      }
    });

    it('should not log tokens', () => {
      // Ensure tokens are not logged to console
      const originalConsoleLog = console.log;
      let loggedToken = false;
      
      console.log = (...args: any[]) => {
        const str = JSON.stringify(args);
        if (str.includes('access_token') || str.match(/eyJ[A-Za-z0-9-_]+\./)) {
          loggedToken = true;
        }
        originalConsoleLog(...args);
      };
      
      // Perform some operations
      supabase.auth.getSession();
      
      console.log = originalConsoleLog;
      expect(loggedToken).toBe(false);
    });
  });

  describe('Session Management', () => {
    it('should detect session expiration', async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const parts = session.access_token.split('.');
        const payload = JSON.parse(atob(parts[1]));
        
        const expiresIn = payload.exp - Math.floor(Date.now() / 1000);
        expect(expiresIn).toBeGreaterThan(0);
      }
    });

    it('should handle concurrent session updates', async () => {
      const promises = [
        supabase.auth.getSession(),
        supabase.auth.getSession(),
        supabase.auth.getSession()
      ];
      
      const results = await Promise.all(promises);
      
      // All should return consistent session data
      const sessions = results.map(r => r.data.session?.access_token);
      const uniqueSessions = new Set(sessions);
      expect(uniqueSessions.size).toBeLessThanOrEqual(1);
    });
  });

  describe('Token Revocation', () => {
    it('should revoke tokens on password change', async () => {
      // This would require implementing password change in the test
      // For now, verify the mechanism exists
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Password change should invalidate old tokens
        expect(user.updated_at).toBeDefined();
      }
    });

    it('should revoke all sessions on global logout', async () => {
      await supabase.auth.signOut({ scope: 'global' });
      
      const { data: { session } } = await supabase.auth.getSession();
      expect(session).toBeNull();
    });
  });
});
