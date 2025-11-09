-- Phase 1: Add RLS policies for exposed tables (drop all existing first)

-- Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Service role can manage RegSense sessions" ON public.regsense_sessions;
DROP POLICY IF EXISTS "Users can view their org's RegSense sessions" ON public.regsense_sessions;
DROP POLICY IF EXISTS "Analysts can create RegSense sessions" ON public.regsense_sessions;

DROP POLICY IF EXISTS "Service role can manage intelligence scores" ON public.intelligence_scores;
DROP POLICY IF EXISTS "Users can view their org's intelligence scores" ON public.intelligence_scores;

DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can view their org's subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view their org's plan tier" ON public.subscriptions;

-- Enable RLS on all three tables
ALTER TABLE public.regsense_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intelligence_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RegSense Sessions Policies
CREATE POLICY "Users can view their org's RegSense sessions"
ON public.regsense_sessions
FOR SELECT
TO authenticated
USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Analysts can create RegSense sessions"
ON public.regsense_sessions
FOR INSERT
TO authenticated
WITH CHECK (
  organization_id = get_user_organization_id(auth.uid())
  AND (has_role(auth.uid(), 'analyst'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Service role can manage RegSense sessions"
ON public.regsense_sessions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Intelligence Scores Policies
CREATE POLICY "Users can view their org's intelligence scores"
ON public.intelligence_scores
FOR SELECT
TO authenticated
USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Service role can manage intelligence scores"
ON public.intelligence_scores
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Subscriptions Policies
CREATE POLICY "Admins can view their org's subscription"
ON public.subscriptions
FOR SELECT
TO authenticated
USING (
  organization_id = get_user_organization_id(auth.uid())
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Users can view their org's plan tier"
ON public.subscriptions
FOR SELECT
TO authenticated
USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Service role can manage subscriptions"
ON public.subscriptions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);