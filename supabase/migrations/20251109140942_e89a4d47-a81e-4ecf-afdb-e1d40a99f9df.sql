-- Create scheduled_jobs table
CREATE TABLE IF NOT EXISTS public.scheduled_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  name TEXT NOT NULL,
  job_type TEXT NOT NULL,
  schedule TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  config JSONB DEFAULT '{}'::jsonb,
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create index for faster queries
CREATE INDEX idx_scheduled_jobs_org ON public.scheduled_jobs(organization_id);
CREATE INDEX idx_scheduled_jobs_enabled ON public.scheduled_jobs(enabled);

-- Enable RLS
ALTER TABLE public.scheduled_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scheduled_jobs
CREATE POLICY "Users can view their org's scheduled jobs"
  ON public.scheduled_jobs FOR SELECT
  USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Admins can insert scheduled jobs"
  ON public.scheduled_jobs FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id(auth.uid())
    AND has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Admins can update scheduled jobs"
  ON public.scheduled_jobs FOR UPDATE
  USING (
    organization_id = get_user_organization_id(auth.uid())
    AND has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Admins can delete scheduled jobs"
  ON public.scheduled_jobs FOR DELETE
  USING (
    organization_id = get_user_organization_id(auth.uid())
    AND has_role(auth.uid(), 'admin'::app_role)
  );

-- Create module_settings table for feature flags
CREATE TABLE IF NOT EXISTS public.module_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  module_name TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, module_name)
);

-- Create index
CREATE INDEX idx_module_settings_org ON public.module_settings(organization_id);

-- Enable RLS
ALTER TABLE public.module_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for module_settings
CREATE POLICY "Users can view their org's module settings"
  ON public.module_settings FOR SELECT
  USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Admins can manage module settings"
  ON public.module_settings FOR ALL
  USING (
    organization_id = get_user_organization_id(auth.uid())
    AND has_role(auth.uid(), 'admin'::app_role)
  );

-- Insert default modules for all existing organizations
INSERT INTO public.module_settings (organization_id, module_name, enabled)
SELECT 
  o.id,
  module,
  true
FROM public.organizations o
CROSS JOIN (
  VALUES 
    ('scheduled_jobs'),
    ('ai_act_auditor'),
    ('gdpr_checker'),
    ('esg_reporter'),
    ('dma_assessor'),
    ('dora_assessor'),
    ('nis2_assessor'),
    ('connectors'),
    ('social_sentiment'),
    ('ai_gateway'),
    ('model_management'),
    ('data_lineage'),
    ('dsar_management'),
    ('audit_verification'),
    ('continuous_intelligence')
) AS modules(module)
ON CONFLICT (organization_id, module_name) DO NOTHING;

-- Trigger to update updated_at
CREATE TRIGGER update_scheduled_jobs_updated_at
  BEFORE UPDATE ON public.scheduled_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_module_settings_updated_at
  BEFORE UPDATE ON public.module_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();