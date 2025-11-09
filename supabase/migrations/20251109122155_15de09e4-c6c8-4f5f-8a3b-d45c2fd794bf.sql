-- Add LLM quota and billing columns to organizations
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS llm_token_quota INTEGER NOT NULL DEFAULT 100000,
ADD COLUMN IF NOT EXISTS tokens_used_this_month INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS billing_model TEXT NOT NULL DEFAULT 'free' CHECK (billing_model IN ('free', 'paid', 'byok')),
ADD COLUMN IF NOT EXISTS byok_provider TEXT CHECK (byok_provider IN ('openai', 'anthropic', 'google', 'mistral')),
ADD COLUMN IF NOT EXISTS byok_model TEXT,
ADD COLUMN IF NOT EXISTS byok_api_key_encrypted TEXT,
ADD COLUMN IF NOT EXISTS quota_reset_date TIMESTAMP WITH TIME ZONE DEFAULT date_trunc('month', now() + interval '1 month');

-- Create function to check and enforce quota
CREATE OR REPLACE FUNCTION public.check_token_quota(
  org_id UUID,
  requested_tokens INTEGER
) RETURNS JSONB AS $$
DECLARE
  org_record RECORD;
  usage_percentage NUMERIC;
  result JSONB;
BEGIN
  -- Get organization details
  SELECT 
    llm_token_quota,
    tokens_used_this_month,
    billing_model,
    quota_reset_date
  INTO org_record
  FROM public.organizations
  WHERE id = org_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'Organization not found'
    );
  END IF;

  -- Reset quota if new month
  IF org_record.quota_reset_date < now() THEN
    UPDATE public.organizations
    SET tokens_used_this_month = 0,
        quota_reset_date = date_trunc('month', now() + interval '1 month')
    WHERE id = org_id;
    org_record.tokens_used_this_month := 0;
  END IF;

  -- BYOK users have unlimited tokens
  IF org_record.billing_model = 'byok' THEN
    RETURN jsonb_build_object(
      'allowed', true,
      'billing_model', 'byok',
      'remaining_tokens', NULL
    );
  END IF;

  -- Check if quota would be exceeded
  IF (org_record.tokens_used_this_month + requested_tokens) > org_record.llm_token_quota THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'Monthly token quota exceeded',
      'quota', org_record.llm_token_quota,
      'used', org_record.tokens_used_this_month,
      'requested', requested_tokens
    );
  END IF;

  -- Calculate usage percentage for warnings
  usage_percentage := (org_record.tokens_used_this_month::NUMERIC / org_record.llm_token_quota::NUMERIC) * 100;

  result := jsonb_build_object(
    'allowed', true,
    'billing_model', org_record.billing_model,
    'quota', org_record.llm_token_quota,
    'used', org_record.tokens_used_this_month,
    'remaining', org_record.llm_token_quota - org_record.tokens_used_this_month,
    'usage_percentage', usage_percentage
  );

  -- Add warning flags
  IF usage_percentage >= 90 THEN
    result := result || jsonb_build_object('warning', 'critical', 'message', '90% of monthly quota used');
  ELSIF usage_percentage >= 80 THEN
    result := result || jsonb_build_object('warning', 'high', 'message', '80% of monthly quota used');
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to increment token usage
CREATE OR REPLACE FUNCTION public.increment_token_usage(
  org_id UUID,
  tokens_consumed INTEGER
) RETURNS VOID AS $$
BEGIN
  UPDATE public.organizations
  SET tokens_used_this_month = tokens_used_this_month + tokens_consumed
  WHERE id = org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to get BYOK configuration (returns decrypted key)
CREATE OR REPLACE FUNCTION public.get_byok_config(org_id UUID)
RETURNS JSONB AS $$
DECLARE
  org_record RECORD;
BEGIN
  SELECT 
    billing_model,
    byok_provider,
    byok_model,
    byok_api_key_encrypted
  INTO org_record
  FROM public.organizations
  WHERE id = org_id;

  IF NOT FOUND OR org_record.billing_model != 'byok' THEN
    RETURN NULL;
  END IF;

  -- Return configuration (key will be decrypted in edge function for security)
  RETURN jsonb_build_object(
    'provider', org_record.byok_provider,
    'model', org_record.byok_model,
    'has_key', org_record.byok_api_key_encrypted IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create stripe_usage_events table for metered billing
CREATE TABLE IF NOT EXISTS public.stripe_usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  subscription_item_id TEXT NOT NULL,
  tokens_consumed INTEGER NOT NULL,
  cost_usd NUMERIC(10,6) NOT NULL,
  stripe_event_id TEXT,
  reported_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stripe_usage_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their org usage events"
  ON public.stripe_usage_events FOR SELECT
  USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Service role can manage usage events"
  ON public.stripe_usage_events FOR ALL
  USING (true);

-- Indexes
CREATE INDEX idx_stripe_usage_org ON public.stripe_usage_events(organization_id);
CREATE INDEX idx_stripe_usage_reported ON public.stripe_usage_events(reported_at);