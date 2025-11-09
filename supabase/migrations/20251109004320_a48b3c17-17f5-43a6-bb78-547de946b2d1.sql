-- Create ai_models table for Model Registry
CREATE TABLE IF NOT EXISTS public.ai_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  version TEXT,
  provider TEXT,
  model_type TEXT,
  risk_tag TEXT,
  dataset_ref TEXT,
  compliance_status TEXT DEFAULT 'pending',
  registered_by UUID REFERENCES auth.users(id),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create system_prompts table for Prompt Manager
CREATE TABLE IF NOT EXISTS public.system_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'system',
  content TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  modified_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) UNIQUE,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'pro', 'enterprise')) DEFAULT 'free',
  status TEXT NOT NULL CHECK (status IN ('active', 'trialing', 'canceled', 'past_due')) DEFAULT 'trialing',
  trial_end TIMESTAMP WITH TIME ZONE,
  renewal_date TIMESTAMP WITH TIME ZONE,
  monthly_token_limit INTEGER DEFAULT 10000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_models
CREATE POLICY "Users can view their organization's models"
  ON public.ai_models FOR SELECT
  USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Analysts can create models"
  ON public.ai_models FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id(auth.uid()) 
    AND (has_role(auth.uid(), 'analyst') OR has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "Analysts can update models"
  ON public.ai_models FOR UPDATE
  USING (
    organization_id = get_user_organization_id(auth.uid()) 
    AND (has_role(auth.uid(), 'analyst') OR has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "Admins can delete models"
  ON public.ai_models FOR DELETE
  USING (
    organization_id = get_user_organization_id(auth.uid()) 
    AND has_role(auth.uid(), 'admin')
  );

-- RLS Policies for system_prompts (admin only)
CREATE POLICY "Admins can manage system prompts"
  ON public.system_prompts FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their organization's subscription"
  ON public.subscriptions FOR SELECT
  USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Admins can manage subscriptions"
  ON public.subscriptions FOR ALL
  USING (
    organization_id = get_user_organization_id(auth.uid()) 
    AND has_role(auth.uid(), 'admin')
  );

-- Create trigger for updated_at on ai_models
CREATE TRIGGER update_ai_models_updated_at
  BEFORE UPDATE ON public.ai_models
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updated_at on subscriptions
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default system prompts
INSERT INTO public.system_prompts (module, role, content, version) VALUES
('ai_act', 'system', 'You are an EU AI Act compliance expert. Analyze AI systems and classify their risk category (minimal, limited, high, unacceptable) based on Article 6 criteria. Provide detailed reasoning and cite specific articles.', 1),
('gdpr', 'system', 'You are a GDPR compliance auditor. Scan documents and data processing activities for potential violations. Flag issues related to consent, data minimization, purpose limitation, and security measures per GDPR Articles 5-10.', 1),
('esg', 'system', 'You are an ESG reporting specialist focusing on CSRD/ESRS standards. Analyze sustainability metrics and draft narrative sections compliant with European Sustainability Reporting Standards (ESRS). Identify data gaps and anomalies.', 1),
('audit', 'system', 'You are an audit trail analyst. Verify the integrity of compliance actions by checking hash chains and event sequences. Report any inconsistencies or potential tampering.', 1),
('rag', 'system', 'You are a regulatory intelligence assistant. Answer questions by retrieving relevant passages from EU AI Act, GDPR, and CSRD regulations. Always cite the source article and section.', 1);

-- Insert default free trial subscription for existing organizations
INSERT INTO public.subscriptions (organization_id, plan, status, trial_end, monthly_token_limit)
SELECT id, 'free', 'active', NOW() + INTERVAL '30 days', 10000
FROM public.organizations
ON CONFLICT (organization_id) DO NOTHING;