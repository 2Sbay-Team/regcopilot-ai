-- Create table for social sentiment data
CREATE TABLE public.social_sentiment_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  source TEXT NOT NULL, -- 'linkedin', 'glassdoor'
  company_name TEXT NOT NULL,
  company_url TEXT,
  overall_rating NUMERIC(3,2), -- e.g., 4.25 out of 5
  total_reviews INTEGER DEFAULT 0,
  sentiment_score NUMERIC(3,2), -- -1 to 1 scale
  
  -- Key metrics
  work_life_balance_rating NUMERIC(3,2),
  culture_values_rating NUMERIC(3,2),
  diversity_inclusion_rating NUMERIC(3,2),
  career_opportunities_rating NUMERIC(3,2),
  compensation_benefits_rating NUMERIC(3,2),
  senior_management_rating NUMERIC(3,2),
  
  -- Extracted themes
  positive_themes JSONB, -- Array of positive themes found
  negative_themes JSONB, -- Array of negative themes found
  esg_indicators JSONB, -- Specific ESG-relevant findings
  
  -- AI Analysis
  ai_summary TEXT, -- AI-generated summary
  recommendations TEXT, -- AI recommendations
  
  -- Sample reviews
  sample_reviews JSONB, -- Array of representative reviews
  
  -- Metadata
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_freshness TIMESTAMP WITH TIME ZONE, -- When source data was current
  raw_data JSONB, -- Full scraped data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.social_sentiment_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their organization's sentiment data"
ON public.social_sentiment_data FOR SELECT
USING (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "Analysts can create sentiment data"
ON public.social_sentiment_data FOR INSERT
WITH CHECK (
  organization_id = public.get_user_organization_id(auth.uid()) 
  AND (public.has_role(auth.uid(), 'analyst') OR public.has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Service role can manage sentiment data"
ON public.social_sentiment_data FOR ALL
USING (true);

-- Create indexes
CREATE INDEX idx_social_sentiment_org ON public.social_sentiment_data(organization_id);
CREATE INDEX idx_social_sentiment_source ON public.social_sentiment_data(source);
CREATE INDEX idx_social_sentiment_analyzed ON public.social_sentiment_data(analyzed_at);

-- Trigger for updated_at
CREATE TRIGGER update_social_sentiment_data_updated_at
BEFORE UPDATE ON public.social_sentiment_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();