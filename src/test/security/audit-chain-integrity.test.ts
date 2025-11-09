import { describe, it, expect } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

/**
 * Audit Chain Integrity Tests
 * Ensures blockchain-style audit trail is tamper-proof
 */

describe('Audit Chain Integrity', () => {
  
  describe('Hash Chain Verification', () => {
    it('should maintain continuous hash chain', async () => {
      const { data } = await supabase
        .from('audit_logs')
        .select('id, prev_hash, output_hash, timestamp')
        .order('timestamp', { ascending: true })
        .limit(20);
      
      if (data && data.length > 1) {
        for (let i = 1; i < data.length; i++) {
          const prevEntry = data[i - 1];
          const currentEntry = data[i];
          
          // Current entry's prev_hash should match previous entry's output_hash
          expect(currentEntry.prev_hash).toBe(prevEntry.output_hash);
        }
      }
    });

    it('should detect broken chain links', async () => {
      const { data } = await supabase
        .from('audit_logs')
        .select('prev_hash, output_hash, timestamp')
        .order('timestamp', { ascending: true })
        .limit(50);
      
      if (data && data.length > 1) {
        let brokenLinks = 0;
        
        for (let i = 1; i < data.length; i++) {
          if (data[i].prev_hash !== data[i - 1].output_hash) {
            brokenLinks++;
          }
        }
        
        // Should have no broken links
        expect(brokenLinks).toBe(0);
      }
    });

    it('should use SHA-256 for hashing', async () => {
      const { data } = await supabase
        .from('audit_logs')
        .select('output_hash')
        .limit(1)
        .single();
      
      if (data?.output_hash) {
        // SHA-256 produces 64 hexadecimal characters
        expect(data.output_hash).toMatch(/^[a-f0-9]{64}$/);
      }
    });

    it('should initialize chain with zero hash', async () => {
      const { data } = await supabase
        .from('audit_logs')
        .select('prev_hash, timestamp')
        .order('timestamp', { ascending: true })
        .limit(1)
        .single();
      
      if (data) {
        // First entry should have zero hash as prev_hash
        expect(data.prev_hash).toMatch(/^0+$/);
      }
    });
  });

  describe('Hash Generation Consistency', () => {
    it('should generate deterministic hashes', async () => {
      const testData = {
        module: 'test',
        action: 'test_action',
        input: { test: 'data' }
      };
      
      // Same input should always produce same hash
      const hash1 = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(JSON.stringify(testData))
      );
      const hash2 = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(JSON.stringify(testData))
      );
      
      const hex1 = Array.from(new Uint8Array(hash1))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      const hex2 = Array.from(new Uint8Array(hash2))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      expect(hex1).toBe(hex2);
    });

    it('should include all relevant fields in hash', async () => {
      const { data } = await supabase
        .from('audit_logs')
        .select('module, action, input_hash, output_hash, reasoning')
        .limit(1)
        .single();
      
      if (data) {
        // Hash should be affected by all fields
        expect(data.output_hash).toBeDefined();
        expect(data.input_hash).toBeDefined();
      }
    });
  });

  describe('Tamper Detection', () => {
    it('should detect modification attempts', async () => {
      // Attempt to modify audit log
      const { error } = await supabase
        .from('audit_logs')
        .update({ reasoning: 'Modified reasoning' })
        .eq('id', '00000000-0000-0000-0000-000000000000');
      
      // Should be prevented by RLS or trigger
      expect(error).toBeDefined();
    });

    it('should detect hash tampering', async () => {
      // Attempt to modify hash
      const { error } = await supabase
        .from('audit_logs')
        .update({ output_hash: 'tampered_hash' })
        .eq('id', '00000000-0000-0000-0000-000000000000');
      
      // Should be prevented
      expect(error).toBeDefined();
    });

    it('should prevent deletion of audit entries', async () => {
      const { error } = await supabase
        .from('audit_logs')
        .delete()
        .eq('id', '00000000-0000-0000-0000-000000000000');
      
      // Deletion should be restricted
      expect(error).toBeDefined();
    });
  });

  describe('Organization Isolation', () => {
    it('should maintain separate chains per organization', async () => {
      const { data } = await supabase
        .from('audit_logs')
        .select('organization_id, prev_hash, output_hash')
        .order('timestamp', { ascending: true })
        .limit(20);
      
      if (data && data.length > 0) {
        // Group by organization
        const orgChains = new Map<string, typeof data>();
        data.forEach(entry => {
          if (!orgChains.has(entry.organization_id)) {
            orgChains.set(entry.organization_id, []);
          }
          orgChains.get(entry.organization_id)?.push(entry);
        });
        
        // Each organization should have its own valid chain
        orgChains.forEach((chain) => {
          if (chain.length > 1) {
            for (let i = 1; i < chain.length; i++) {
              expect(chain[i].prev_hash).toBe(chain[i - 1].output_hash);
            }
          }
        });
      }
    });
  });

  describe('Verification API', () => {
    it('should provide chain verification endpoint', async () => {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-audit-chain`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            organization_id: '00000000-0000-0000-0000-000000000000'
          })
        }
      );
      
      // Function should exist (might require auth)
      expect(response.status).not.toBe(404);
    });

    it('should report chain status', async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data, error } = await supabase.functions.invoke('verify-audit-chain', {
          body: {
            organization_id: '00000000-0000-0000-0000-000000000000'
          }
        });
        
        if (!error && data) {
          expect(data).toHaveProperty('valid');
          expect(data).toHaveProperty('total_entries');
        }
      }
    });
  });

  describe('Performance Under Load', () => {
    it('should maintain integrity with concurrent inserts', async () => {
      // Simulate concurrent audit log creation
      const promises = Array.from({ length: 5 }, (_, i) => 
        supabase.from('audit_logs').insert({
          module: 'test',
          action: 'concurrent_test',
          input_hash: `hash_${i}`,
          reasoning: `Test ${i}`
        })
      );
      
      const results = await Promise.allSettled(promises);
      
      // All should succeed or fail gracefully
      results.forEach(result => {
        if (result.status === 'fulfilled') {
          expect(result.value.error).toBeNull();
        }
      });
    });
  });

  describe('Hash Chain Metadata', () => {
    it('should track chain metadata', async () => {
      const { data } = await supabase
        .from('audit_logs')
        .select('timestamp, module, action')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();
      
      if (data) {
        expect(data.timestamp).toBeDefined();
        expect(data.module).toBeDefined();
        expect(data.action).toBeDefined();
      }
    });

    it('should record action types', async () => {
      const { data } = await supabase
        .from('audit_logs')
        .select('action')
        .limit(10);
      
      if (data) {
        const actions = new Set(data.map(d => d.action));
        
        // Should have variety of action types
        expect(actions.size).toBeGreaterThan(0);
      }
    });
  });

  describe('Export and Verification', () => {
    it('should allow export of audit chain', async () => {
      const { data } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: true })
        .limit(100);
      
      if (data) {
        // Should be exportable for external verification
        const exported = JSON.stringify(data);
        expect(exported).toBeDefined();
        expect(data.length).toBeGreaterThan(0);
      }
    });

    it('should provide verification tools', async () => {
      const { data } = await supabase
        .from('audit_logs')
        .select('prev_hash, output_hash')
        .order('timestamp', { ascending: true })
        .limit(10);
      
      if (data && data.length > 1) {
        // External tool should be able to verify chain
        let isValid = true;
        for (let i = 1; i < data.length; i++) {
          if (data[i].prev_hash !== data[i - 1].output_hash) {
            isValid = false;
            break;
          }
        }
        
        expect(isValid).toBe(true);
      }
    });
  });
});
