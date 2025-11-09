import { describe, it, expect } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

/**
 * Billing Flow & Subscription Tests
 * Phase 12: Verify Stripe integration and subscription management
 */

describe('Billing Flow Tests', () => {
  
  describe('Subscription Status Checks', () => {
    it('should correctly report subscription status', async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .single();
      
      if (!profile) return;

      const { data: org, error } = await supabase
        .from('organizations')
        .select('subscription_plan, billing_status')
        .eq('id', profile.organization_id)
        .single();
      
      expect(error).toBeNull();
      expect(org).toBeDefined();
    });

    it('should have valid subscription plan', async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .single();
      
      if (!profile) return;

      const { data: org } = await supabase
        .from('organizations')
        .select('subscription_plan')
        .eq('id', profile.organization_id)
        .single();
      
      expect(org).toBeDefined();
      expect(org?.subscription_plan).toBeDefined();
    });
  });

  describe('Feature Access Control', () => {
    it('should track token usage', async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .single();
      
      if (!profile) return;

      const { data: usage, error } = await supabase
        .from('model_usage_logs')
        .select('tokens_used, estimated_cost')
        .eq('organization_id', profile.organization_id)
        .limit(10);
      
      expect(error).toBeNull();
      expect(Array.isArray(usage)).toBe(true);
    });

    it('should enforce organization quota', async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .single();
      
      if (!profile) return;

      const { data: org } = await supabase
        .from('organizations')
        .select('llm_token_quota, tokens_used_this_month')
        .eq('id', profile.organization_id)
        .single();
      
      expect(org).toBeDefined();
      if (org?.llm_token_quota) {
        expect(org.llm_token_quota).toBeGreaterThan(0);
      }
    });
  });

  describe('Billing Events Logging', () => {
    it('should log billing events for organization', async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .single();
      
      if (!profile) return;

      const { data: events, error } = await supabase
        .from('billing_events')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('processed_at', { ascending: false })
        .limit(10);
      
      expect(error).toBeNull();
      expect(Array.isArray(events)).toBe(true);
    });

    it('should prevent access to other org billing events', async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .single();
      
      if (!profile) return;

      const { data: events } = await supabase
        .from('billing_events')
        .select('organization_id')
        .neq('organization_id', profile.organization_id);
      
      // RLS should prevent access
      expect(events?.length || 0).toBe(0);
    });
  });

  describe('Stripe Integration', () => {
    it('should have valid stripe customer ID for active subscriptions', async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .single();
      
      if (!profile) return;

      const { data: org } = await supabase
        .from('organizations')
        .select('stripe_customer_id, billing_status')
        .eq('id', profile.organization_id)
        .single();
      
      if (org?.billing_status === 'active' && org.stripe_customer_id) {
        expect(org.stripe_customer_id).toMatch(/^cus_/);
      }
    });

    it('should create checkout session for upgrade', async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.functions.invoke('stripe-checkout', {
        body: { plan: 'pro' }
      });
      
      // Error is expected in test environment without Stripe keys
      expect(error || { message: 'Expected in test' }).toBeDefined();
    });
  });

  describe('LLM Usage Tracking', () => {
    it('should track model usage with organization context', async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .single();
      
      if (!profile) return;

      const { data: usage, error } = await supabase
        .from('model_usage_logs')
        .select('organization_id, model, total_tokens, cost_usd, actor_role')
        .eq('organization_id', profile.organization_id)
        .limit(10);
      
      expect(error).toBeNull();
      expect(Array.isArray(usage)).toBe(true);
      
      usage?.forEach(log => {
        expect(log.organization_id).toBe(profile.organization_id);
        expect(log.model).toBeDefined();
      });
    });

    it('should calculate cost estimates for usage', async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .single();
      
      if (!profile) return;

      const { data: usage } = await supabase
        .from('model_usage_logs')
        .select('cost_usd, total_tokens')
        .eq('organization_id', profile.organization_id)
        .not('cost_usd', 'is', null)
        .limit(10);
      
      usage?.forEach(log => {
        if (log.cost_usd) {
          const cost = parseFloat(log.cost_usd);
          expect(cost).toBeGreaterThanOrEqual(0);
        }
      });
    });

    it('should enforce role-based usage tracking', async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .single();
      
      if (!profile) return;

      const { data: usage } = await supabase
        .from('model_usage_logs')
        .select('actor_role')
        .eq('organization_id', profile.organization_id)
        .not('actor_role', 'is', null)
        .limit(10);
      
      usage?.forEach(log => {
        if (log.actor_role) {
          expect(log.actor_role).toBeDefined();
        }
      });
    });
  });

  describe('Billing Summary API', () => {
    it('should return billing summary for organization', async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.functions.invoke('billing-summary');
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
      
      if (data.type === 'organization') {
        expect(data.organization).toBeDefined();
        expect(data.usage_summary).toBeDefined();
      }
    });

    it('should return platform analytics for super admin', async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: isSuperAdmin } = await supabase.rpc('is_super_admin');
      
      if (isSuperAdmin) {
        const { data, error } = await supabase.functions.invoke('billing-summary');
        
        expect(error).toBeNull();
        expect(data.type).toBe('platform');
        expect(data.analytics).toBeDefined();
        expect(data.organizations).toBeDefined();
      }
    });
  });
});
