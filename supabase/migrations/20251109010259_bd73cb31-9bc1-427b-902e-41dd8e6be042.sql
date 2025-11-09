-- Model configurations for multi-LLM support
CREATE TABLE IF NOT EXISTS public.model_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  model_name TEXT NOT NULL,
  provider TEXT NOT NULL,
  base_url TEXT,
  api_key_ref TEXT,
  price_per_1k_tokens NUMERIC NOT NULL DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.model_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organization's model configs"
  ON public.model_configs FOR SELECT
  USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Admins can manage model configs"
  ON public.model_configs FOR ALL
  USING (
    organization_id = get_user_organization_id(auth.uid()) 
    AND has_role(auth.uid(), 'admin'::app_role)
  );

-- Compliance scores per organization
CREATE TABLE IF NOT EXISTS public.compliance_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  ai_act_score NUMERIC DEFAULT 0,
  gdpr_score NUMERIC DEFAULT 0,
  esg_score NUMERIC DEFAULT 0,
  overall_score NUMERIC DEFAULT 0,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(organization_id, calculated_at)
);

ALTER TABLE public.compliance_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organization's compliance scores"
  ON public.compliance_scores FOR SELECT
  USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Service role can insert compliance scores"
  ON public.compliance_scores FOR INSERT
  WITH CHECK (true);

-- Tasks and collaboration
CREATE TABLE IF NOT EXISTS public.assessment_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL,
  assessment_type TEXT NOT NULL CHECK (assessment_type IN ('ai_act', 'gdpr', 'esg')),
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.assessment_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tasks for their organization's assessments"
  ON public.assessment_tasks FOR SELECT
  USING (
    CASE assessment_type
      WHEN 'ai_act' THEN assessment_id IN (
        SELECT aa.id FROM ai_act_assessments aa
        JOIN ai_systems ais ON aa.ai_system_id = ais.id
        WHERE ais.organization_id = get_user_organization_id(auth.uid())
      )
      WHEN 'gdpr' THEN assessment_id IN (
        SELECT id FROM gdpr_assessments
        WHERE organization_id = get_user_organization_id(auth.uid())
      )
      WHEN 'esg' THEN assessment_id IN (
        SELECT id FROM esg_reports
        WHERE organization_id = get_user_organization_id(auth.uid())
      )
      ELSE false
    END
  );

CREATE POLICY "Analysts can manage tasks"
  ON public.assessment_tasks FOR ALL
  USING (
    (has_role(auth.uid(), 'analyst'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
    AND
    CASE assessment_type
      WHEN 'ai_act' THEN assessment_id IN (
        SELECT aa.id FROM ai_act_assessments aa
        JOIN ai_systems ais ON aa.ai_system_id = ais.id
        WHERE ais.organization_id = get_user_organization_id(auth.uid())
      )
      WHEN 'gdpr' THEN assessment_id IN (
        SELECT id FROM gdpr_assessments
        WHERE organization_id = get_user_organization_id(auth.uid())
      )
      WHEN 'esg' THEN assessment_id IN (
        SELECT id FROM esg_reports
        WHERE organization_id = get_user_organization_id(auth.uid())
      )
      ELSE false
    END
  );

-- Task comments
CREATE TABLE IF NOT EXISTS public.task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.assessment_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments on accessible tasks"
  ON public.task_comments FOR SELECT
  USING (
    task_id IN (
      SELECT id FROM assessment_tasks
      WHERE CASE assessment_type
        WHEN 'ai_act' THEN assessment_id IN (
          SELECT aa.id FROM ai_act_assessments aa
          JOIN ai_systems ais ON aa.ai_system_id = ais.id
          WHERE ais.organization_id = get_user_organization_id(auth.uid())
        )
        WHEN 'gdpr' THEN assessment_id IN (
          SELECT id FROM gdpr_assessments
          WHERE organization_id = get_user_organization_id(auth.uid())
        )
        WHEN 'esg' THEN assessment_id IN (
          SELECT id FROM esg_reports
          WHERE organization_id = get_user_organization_id(auth.uid())
        )
        ELSE false
      END
    )
  );

CREATE POLICY "Users can create comments on accessible tasks"
  ON public.task_comments FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND task_id IN (
      SELECT id FROM assessment_tasks
      WHERE CASE assessment_type
        WHEN 'ai_act' THEN assessment_id IN (
          SELECT aa.id FROM ai_act_assessments aa
          JOIN ai_systems ais ON aa.ai_system_id = ais.id
          WHERE ais.organization_id = get_user_organization_id(auth.uid())
        )
        WHEN 'gdpr' THEN assessment_id IN (
          SELECT id FROM gdpr_assessments
          WHERE organization_id = get_user_organization_id(auth.uid())
        )
        WHEN 'esg' THEN assessment_id IN (
          SELECT id FROM esg_reports
          WHERE organization_id = get_user_organization_id(auth.uid())
        )
        ELSE false
      END
    )
  );

-- Add triggers for updated_at
CREATE TRIGGER update_model_configs_updated_at
  BEFORE UPDATE ON public.model_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assessment_tasks_updated_at
  BEFORE UPDATE ON public.assessment_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();