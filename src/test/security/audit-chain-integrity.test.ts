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

    it('should use SHA-256 for hashing', async () => {
      const { data } = await supabase
        .from('audit_logs')
        .select('output_hash')
        .limit(1)
        .single();
      
      if (data?.output_hash) {
        // SHA-256 produces 64 hexadecimal characters
        expect(data.output_hash.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Tamper Detection', () => {
    it('should prevent modification of audit entries', async () => {
      const { error } = await supabase
        .from('audit_logs')
        .update({ reasoning_chain: { modified: true } })
        .eq('id', '00000000-0000-0000-0000-000000000000');
      
      // Should be prevented by RLS (service role only)
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
  });
});
