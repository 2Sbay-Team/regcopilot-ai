-- Fix: Secure the chunk_feedback_scores materialized view from API exposure
-- Option 1: Move it to a separate schema not exposed by PostgREST
CREATE SCHEMA IF NOT EXISTS analytics;

-- Drop the existing materialized view from public schema
DROP MATERIALIZED VIEW IF EXISTS public.chunk_feedback_scores CASCADE;

-- Recreate in analytics schema (not exposed by default)
CREATE MATERIALIZED VIEW analytics.chunk_feedback_scores AS
SELECT 
  chunk_id,
  organization_id,
  COUNT(*) FILTER (WHERE signal = 'upvote') as upvotes,
  COUNT(*) FILTER (WHERE signal = 'downvote') as downvotes,
  COUNT(*) FILTER (WHERE signal = 'irrelevant') as irrelevant_count,
  COUNT(*) FILTER (WHERE signal = 'missing_info') as missing_info_count,
  (COUNT(*) FILTER (WHERE signal = 'upvote') - COUNT(*) FILTER (WHERE signal = 'downvote'))::float as net_score,
  COUNT(DISTINCT user_id) as unique_raters,
  MAX(created_at) as last_feedback_at
FROM public.chunk_feedback
GROUP BY chunk_id, organization_id;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_chunk_feedback_scores_chunk 
ON analytics.chunk_feedback_scores(chunk_id);

CREATE INDEX IF NOT EXISTS idx_chunk_feedback_scores_org 
ON analytics.chunk_feedback_scores(organization_id);

-- Grant access only to authenticated users via a secure function
CREATE OR REPLACE FUNCTION public.get_chunk_feedback_scores(
  p_chunk_id UUID DEFAULT NULL,
  p_organization_id UUID DEFAULT NULL
)
RETURNS TABLE (
  chunk_id UUID,
  upvotes BIGINT,
  downvotes BIGINT,
  net_score FLOAT,
  unique_raters BIGINT,
  last_feedback_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public, analytics
LANGUAGE plpgsql
AS $$
BEGIN
  -- Verify user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Return filtered results
  RETURN QUERY
  SELECT 
    cfs.chunk_id,
    cfs.upvotes,
    cfs.downvotes,
    cfs.net_score,
    cfs.unique_raters,
    cfs.last_feedback_at
  FROM analytics.chunk_feedback_scores cfs
  WHERE 
    (p_chunk_id IS NULL OR cfs.chunk_id = p_chunk_id)
    AND (p_organization_id IS NULL OR cfs.organization_id = p_organization_id);
END;
$$;

-- Update the refresh function to target the new location
CREATE OR REPLACE FUNCTION public.refresh_chunk_feedback_scores()
RETURNS void
SECURITY DEFINER
SET search_path = public, analytics
LANGUAGE plpgsql
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY analytics.chunk_feedback_scores;
END;
$$;