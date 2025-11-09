-- Create model_usage_logs table for tracking AI model usage and costs
CREATE TABLE IF NOT EXISTS public.model_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  model text NOT NULL,
  prompt_tokens integer DEFAULT 0,
  completion_tokens integer DEFAULT 0,
  total_tokens integer NOT NULL,
  cost_estimate numeric(10, 6) NOT NULL DEFAULT 0,
  request_payload jsonb,
  response_summary jsonb,
  custom_endpoint text,
  status text NOT NULL DEFAULT 'success',
  error_message text,
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add index for fast organization queries
CREATE INDEX idx_model_usage_logs_org_timestamp 
ON public.model_usage_logs(organization_id, timestamp DESC);

-- Enable RLS
ALTER TABLE public.model_usage_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their organization's usage logs
CREATE POLICY "Users can view their organization's model usage logs"
ON public.model_usage_logs
FOR SELECT
TO authenticated
USING (organization_id = get_user_organization_id(auth.uid()));

-- Policy: Service role can insert usage logs
CREATE POLICY "Service role can insert model usage logs"
ON public.model_usage_logs
FOR INSERT
TO service_role
WITH CHECK (true);

-- Create function to get daily token usage for an organization
CREATE OR REPLACE FUNCTION public.get_daily_token_usage(org_id uuid, target_date date DEFAULT CURRENT_DATE)
RETURNS TABLE (
  total_tokens bigint,
  total_cost numeric,
  request_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COALESCE(SUM(total_tokens), 0)::bigint as total_tokens,
    COALESCE(SUM(cost_estimate), 0)::numeric as total_cost,
    COUNT(*)::bigint as request_count
  FROM public.model_usage_logs
  WHERE organization_id = org_id
    AND timestamp >= target_date::timestamp
    AND timestamp < (target_date + interval '1 day')::timestamp
    AND status = 'success';
$$;

-- Create organization budget settings table
CREATE TABLE IF NOT EXISTS public.organization_budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL UNIQUE REFERENCES public.organizations(id) ON DELETE CASCADE,
  daily_token_limit integer NOT NULL DEFAULT 10000,
  daily_cost_limit_usd numeric(10, 2) NOT NULL DEFAULT 10.00,
  fallback_model text NOT NULL DEFAULT 'google/gemini-2.5-flash',
  custom_api_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on budgets
ALTER TABLE public.organization_budgets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their organization's budget settings
CREATE POLICY "Users can view their organization's budget settings"
ON public.organization_budgets
FOR SELECT
TO authenticated
USING (organization_id = get_user_organization_id(auth.uid()));

-- Policy: Admins can manage their organization's budget settings
CREATE POLICY "Admins can manage organization budget settings"
ON public.organization_budgets
FOR ALL
TO authenticated
USING (
  organization_id = get_user_organization_id(auth.uid()) 
  AND has_role(auth.uid(), 'admin')
);

-- Add trigger for updated_at
CREATE TRIGGER update_organization_budgets_updated_at
BEFORE UPDATE ON public.organization_budgets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();