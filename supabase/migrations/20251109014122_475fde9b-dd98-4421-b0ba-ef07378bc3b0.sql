-- Create NIS2 assessments table
CREATE TABLE IF NOT EXISTS public.nis2_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  organization_name TEXT NOT NULL,
  organization_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  sectors TEXT NOT NULL,
  critical_services TEXT,
  incident_response TEXT,
  vulnerability_management TEXT,
  risk_classification TEXT,
  compliance_score INTEGER,
  recommendations TEXT,
  report_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create DORA assessments table
CREATE TABLE IF NOT EXISTS public.dora_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  institution_name TEXT NOT NULL,
  institution_type TEXT NOT NULL,
  ict_services TEXT NOT NULL,
  third_party_providers TEXT NOT NULL,
  incident_management TEXT,
  testing_frequency TEXT NOT NULL,
  recovery_time_objective TEXT,
  business_continuity_plan TEXT,
  risk_classification TEXT,
  compliance_score INTEGER,
  recommendations TEXT,
  report_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create DMA assessments table
CREATE TABLE IF NOT EXISTS public.dma_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  platform_name TEXT NOT NULL,
  platform_type TEXT NOT NULL,
  monthly_users TEXT NOT NULL,
  operates_in_eu BOOLEAN NOT NULL,
  business_users TEXT,
  data_practices TEXT,
  advertising_practices TEXT,
  interoperability TEXT,
  gatekeeper_status TEXT,
  compliance_score INTEGER,
  recommendations TEXT,
  report_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.nis2_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dora_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dma_assessments ENABLE ROW LEVEL SECURITY;

-- RLS policies for NIS2
CREATE POLICY "Users can view their org's NIS2 assessments"
  ON public.nis2_assessments FOR SELECT
  USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Users can create NIS2 assessments"
  ON public.nis2_assessments FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id(auth.uid()));

-- RLS policies for DORA
CREATE POLICY "Users can view their org's DORA assessments"
  ON public.dora_assessments FOR SELECT
  USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Users can create DORA assessments"
  ON public.dora_assessments FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id(auth.uid()));

-- RLS policies for DMA
CREATE POLICY "Users can view their org's DMA assessments"
  ON public.dma_assessments FOR SELECT
  USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Users can create DMA assessments"
  ON public.dma_assessments FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id(auth.uid()));

-- Add updated_at triggers
CREATE TRIGGER update_nis2_assessments_updated_at
  BEFORE UPDATE ON public.nis2_assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dora_assessments_updated_at
  BEFORE UPDATE ON public.dora_assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dma_assessments_updated_at
  BEFORE UPDATE ON public.dma_assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();