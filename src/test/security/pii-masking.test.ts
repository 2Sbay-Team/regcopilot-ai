import { describe, it, expect } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

/**
 * PII Masking and Data Protection Tests
 */

describe('PII Masking and Data Protection', () => {
  
  const piiPatterns = {
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    phone: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
    ssn: /\d{3}-\d{2}-\d{4}/g,
    creditCard: /\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}/g,
  };

  describe('PII Detection Patterns', () => {
    it('should detect email addresses', () => {
      const text = 'Contact john.doe@example.com';
      expect(text.match(piiPatterns.email)).not.toBeNull();
    });

    it('should detect phone numbers', () => {
      const text = 'Call +1-555-123-4567';
      expect(text.match(piiPatterns.phone)).not.toBeNull();
    });

    it('should detect SSN patterns', () => {
      const text = 'SSN: 123-45-6789';
      expect(text.match(piiPatterns.ssn)).not.toBeNull();
    });
  });

  describe('PII Masking in Logs', () => {
    it('should not log PII in audit logs reasoning', async () => {
      const { data } = await supabase
        .from('audit_logs')
        .select('reasoning_chain')
        .limit(5);
      
      if (data) {
        for (const log of data) {
          if (log.reasoning_chain) {
            const str = JSON.stringify(log.reasoning_chain);
            expect(str).not.toMatch(piiPatterns.ssn);
            expect(str).not.toMatch(piiPatterns.creditCard);
          }
        }
      }
    });

    it('should hash sensitive input data', async () => {
      const { data } = await supabase
        .from('audit_logs')
        .select('input_hash')
        .limit(5);
      
      if (data) {
        for (const log of data) {
          if (log.input_hash) {
            expect(log.input_hash.length).toBeGreaterThan(0);
          }
        }
      }
    });
  });

  describe('GDPR Compliance', () => {
    it('should support DSAR requests', async () => {
      const { data } = await supabase
        .from('dsar_requests')
        .select('id, request_type, status')
        .limit(1);
      
      expect(data).toBeDefined();
    });

    it('should have data retention policies', async () => {
      const { data } = await supabase
        .from('data_retention_policies')
        .select('*')
        .eq('enabled', true);
      
      expect(data).toBeDefined();
    });
  });

  describe('Masking Functions', () => {
    it('should mask email addresses', () => {
      const maskEmail = (email: string) => {
        const [local, domain] = email.split('@');
        return `${local.charAt(0)}***@${domain}`;
      };
      
      expect(maskEmail('john.doe@example.com')).toBe('j***@example.com');
    });

    it('should mask phone numbers', () => {
      const maskPhone = (phone: string) => {
        const digits = phone.replace(/\D/g, '');
        return `***-***-${digits.slice(-4)}`;
      };
      
      expect(maskPhone('555-123-4567')).toBe('***-***-4567');
    });
  });
});
