-- Only add columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='mfa_enabled') THEN
    ALTER TABLE public.profiles ADD COLUMN mfa_enabled BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='mfa_secret') THEN
    ALTER TABLE public.profiles ADD COLUMN mfa_secret TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='mfa_secret_temp') THEN
    ALTER TABLE public.profiles ADD COLUMN mfa_secret_temp TEXT;
  END IF;
END $$;

-- Intelligence scores table (new continuous intelligence metric)
CREATE TABLE IF NOT EXISTS public.intelligence_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  overall_score INTEGER DEFAULT 0,
  automation_score INTEGER DEFAULT 0,
  coverage_score INTEGER DEFAULT 0,
  response_score INTEGER DEFAULT 0,
  explainability_score INTEGER DEFAULT 0,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.intelligence_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their org intelligence scores" ON public.intelligence_scores;
CREATE POLICY "Users can view their org intelligence scores"
ON public.intelligence_scores FOR SELECT
USING (organization_id = get_user_organization_id(auth.uid()));

DROP POLICY IF EXISTS "Service role can manage intelligence scores" ON public.intelligence_scores;
CREATE POLICY "Service role can manage intelligence scores"
ON public.intelligence_scores FOR ALL
USING (true);