
-- Fix Security Definer View issue
-- The engagement_metrics view needs to be recreated with SECURITY INVOKER
-- This ensures the view uses the permissions of the querying user, not the view creator

-- Drop the existing view
DROP VIEW IF EXISTS public.engagement_metrics;

-- Recreate with SECURITY INVOKER
CREATE VIEW public.engagement_metrics
WITH (security_invoker = true)
AS
SELECT 
  o.id AS organization_id,
  o.name AS organization_name,
  o.subscription_plan AS plan,
  o.created_at AS signup_date,
  p.onboarding_completed,
  p.onboarding_completed_at,
  count(DISTINCT
    CASE
      WHEN me.event_type = 'copilot_run'::text THEN me.id
      ELSE NULL::uuid
    END) AS copilot_runs,
  count(DISTINCT
    CASE
      WHEN me.event_type = 'report_generated'::text THEN me.id
      ELSE NULL::uuid
    END) AS reports_generated,
  count(DISTINCT
    CASE
      WHEN me.event_type = 'file_uploaded'::text THEN me.id
      ELSE NULL::uuid
    END) AS files_uploaded,
  count(DISTINCT
    CASE
      WHEN me.event_type = 'connector_added'::text THEN me.id
      ELSE NULL::uuid
    END) AS connectors_added,
  max(me.created_at) AS last_active_at,
  count(DISTINCT oc.id) AS checklist_items_completed,
  (count(DISTINCT
    CASE
      WHEN oc.completed THEN oc.id
      ELSE NULL::uuid
    END)::double precision / NULLIF(count(DISTINCT oc.id), 0)::double precision * 100::double precision) AS completion_percentage
FROM organizations o
  LEFT JOIN profiles p ON p.organization_id = o.id
  LEFT JOIN marketing_events me ON me.organization_id = o.id
  LEFT JOIN onboarding_checklists oc ON oc.organization_id = o.id
GROUP BY o.id, o.name, o.subscription_plan, o.created_at, p.onboarding_completed, p.onboarding_completed_at;

-- Add comment explaining the security model
COMMENT ON VIEW public.engagement_metrics IS 'Engagement metrics view with SECURITY INVOKER - uses permissions of the querying user for better security isolation';
