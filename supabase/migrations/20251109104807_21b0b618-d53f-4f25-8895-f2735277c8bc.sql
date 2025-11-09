-- Enable vector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Chunk-level feedback overlay (per organization)
CREATE TABLE IF NOT EXISTS public.chunk_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chunk_id UUID REFERENCES public.document_chunks(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  signal TEXT NOT NULL CHECK (signal IN ('upvote','downvote','missing','irrelevant','good_citation')),
  weight SMALLINT DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Retrieval session feedback (per query)
CREATE TABLE IF NOT EXISTS public.retrieval_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  module TEXT NOT NULL CHECK (module IN ('ai_act','gdpr','esg','nis2','dora','dma')),
  query TEXT NOT NULL,
  topk_result_ids UUID[],
  clicked_chunk_id UUID,
  satisfaction SMALLINT CHECK (satisfaction BETWEEN 1 AND 5),
  missing_citation BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Organization-specific overlay knowledge base
CREATE TABLE IF NOT EXISTS public.org_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Materialized view for aggregated feedback scores
CREATE MATERIALIZED VIEW IF NOT EXISTS public.chunk_feedback_scores AS
SELECT 
  chunk_id,
  SUM(CASE WHEN signal='upvote' THEN weight ELSE 0 END) - 
  SUM(CASE WHEN signal='downvote' THEN weight ELSE 0 END) AS score,
  COUNT(*) AS total_votes,
  MAX(created_at) AS last_feedback_at
FROM public.chunk_feedback
GROUP BY chunk_id;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_chunk_feedback_scores_chunk_id 
ON public.chunk_feedback_scores(chunk_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chunk_feedback_org 
ON public.chunk_feedback(organization_id, chunk_id);

CREATE INDEX IF NOT EXISTS idx_retrieval_feedback_org_module 
ON public.retrieval_feedback(organization_id, module);

CREATE INDEX IF NOT EXISTS idx_org_policies_org 
ON public.org_policies(organization_id);

CREATE INDEX IF NOT EXISTS idx_org_policies_embedding 
ON public.org_policies USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Enable RLS on new tables
ALTER TABLE public.chunk_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retrieval_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_policies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chunk_feedback
CREATE POLICY "Users can view their org's chunk feedback"
ON public.chunk_feedback FOR SELECT
USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Users can create chunk feedback for their org"
ON public.chunk_feedback FOR INSERT
WITH CHECK (
  organization_id = get_user_organization_id(auth.uid()) AND
  user_id = auth.uid()
);

CREATE POLICY "Service role can manage chunk feedback"
ON public.chunk_feedback FOR ALL
USING (true);

-- RLS Policies for retrieval_feedback
CREATE POLICY "Users can view their org's retrieval feedback"
ON public.retrieval_feedback FOR SELECT
USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Users can create retrieval feedback for their org"
ON public.retrieval_feedback FOR INSERT
WITH CHECK (
  organization_id = get_user_organization_id(auth.uid()) AND
  user_id = auth.uid()
);

CREATE POLICY "Service role can manage retrieval feedback"
ON public.retrieval_feedback FOR ALL
USING (true);

-- RLS Policies for org_policies
CREATE POLICY "Users can view their org's policies"
ON public.org_policies FOR SELECT
USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Analysts can manage org policies"
ON public.org_policies FOR ALL
USING (
  organization_id = get_user_organization_id(auth.uid()) AND
  (has_role(auth.uid(), 'analyst'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

-- Function to refresh feedback scores
CREATE OR REPLACE FUNCTION public.refresh_chunk_feedback_scores()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.chunk_feedback_scores;
END;
$$;

-- Trigger to update org_policies timestamp
CREATE OR REPLACE FUNCTION public.update_org_policy_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_org_policies_updated_at
BEFORE UPDATE ON public.org_policies
FOR EACH ROW
EXECUTE FUNCTION public.update_org_policy_timestamp();