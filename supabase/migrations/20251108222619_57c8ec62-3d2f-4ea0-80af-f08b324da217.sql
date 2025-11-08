-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions;

-- Create table for compliance reports
CREATE TABLE public.compliance_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('weekly', 'monthly', 'quarterly', 'adhoc')),
  report_period_start DATE NOT NULL,
  report_period_end DATE NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  generated_by UUID REFERENCES auth.users(id),
  report_data JSONB NOT NULL,
  pdf_url TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.compliance_reports ENABLE ROW LEVEL SECURITY;

-- Users can view their organization's reports
CREATE POLICY "Users can view their organization's compliance reports"
ON public.compliance_reports
FOR SELECT
USING (organization_id = get_user_organization_id(auth.uid()));

-- Admins can manage compliance reports
CREATE POLICY "Admins can manage compliance reports"
ON public.compliance_reports
FOR ALL
USING (
  organization_id = get_user_organization_id(auth.uid()) 
  AND has_role(auth.uid(), 'admin')
);

-- Create indexes for faster queries
CREATE INDEX idx_compliance_reports_org_period 
ON public.compliance_reports(organization_id, report_period_end DESC);

CREATE INDEX idx_compliance_reports_type_generated 
ON public.compliance_reports(organization_id, report_type, generated_at DESC);

-- Enable realtime for compliance reports
ALTER TABLE public.compliance_reports REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.compliance_reports;