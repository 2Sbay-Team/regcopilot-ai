-- ============================================================================
-- RegSense™ Conversational Intelligence Layer - Database Schema
-- ============================================================================

-- Create regsense_sessions table for compliance dialogue tracking
CREATE TABLE IF NOT EXISTS public.regsense_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  context_scope TEXT NOT NULL CHECK (context_scope IN ('ai_act','gdpr','esg','all')),
  query_text TEXT NOT NULL,
  response_text TEXT,
  citations JSONB DEFAULT '[]'::jsonb,
  model_name TEXT,
  fallback_used BOOLEAN DEFAULT FALSE,
  embedding_version TEXT DEFAULT 'v1',
  input_hash TEXT,
  output_hash TEXT,
  response_time_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_regsense_org_created ON public.regsense_sessions(organization_id, created_at DESC);
CREATE INDEX idx_regsense_user ON public.regsense_sessions(user_id);
CREATE INDEX idx_regsense_scope ON public.regsense_sessions(context_scope);

-- Enable Row Level Security
ALTER TABLE public.regsense_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their organization's sessions
CREATE POLICY "Users can view their organization's RegSense sessions"
  ON public.regsense_sessions
  FOR SELECT
  USING (organization_id = get_user_organization_id(auth.uid()));

-- RLS Policy: Users can create sessions for their organization
CREATE POLICY "Users can create RegSense sessions"
  ON public.regsense_sessions
  FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id(auth.uid())
    AND user_id = auth.uid()
  );

-- RLS Policy: Service role can manage all sessions
CREATE POLICY "Service role can manage RegSense sessions"
  ON public.regsense_sessions
  FOR ALL
  USING (true);

-- Create analytics view for RegSense insights
CREATE OR REPLACE VIEW public.regsense_analytics AS
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

COMMENT ON TABLE public.regsense_sessions IS 'RegSense™ conversational compliance query logs with audit trail';
COMMENT ON VIEW public.regsense_analytics IS 'Analytics view for RegSense conversational insights';