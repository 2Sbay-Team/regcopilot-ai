-- Fix Security Definer View issue for regsense_analytics
-- Recreate view with explicit SECURITY INVOKER to use querying user's permissions

DROP VIEW IF EXISTS public.regsense_analytics;

CREATE OR REPLACE VIEW public.regsense_analytics
WITH (security_invoker = true)
AS
SELECT 
  organization_id,
  context_scope,
  DATE_TRUNC('day', created_at) as query_date,
  COUNT(*) as query_count,
  AVG(response_time_ms) as avg_response_time_ms,
  SUM(CASE WHEN fallback_used THEN 1 ELSE 0 END) as fallback_count,
  SUM(CASE WHEN error_message IS NOT NULL THEN 1 ELSE 0 END) as error_count,
  COUNT(DISTINCT user_id) as unique_users
FROM public.regsense_sessions
WHERE created_at >= NOW() - INTERVAL '90 days'
GROUP BY organization_id, context_scope, DATE_TRUNC('day', created_at);

COMMENT ON VIEW public.regsense_analytics IS 'Analytics view for RegSense conversational insights (SECURITY INVOKER)';