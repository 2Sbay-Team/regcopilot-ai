-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create app_role enum for RBAC
CREATE TYPE public.app_role AS ENUM ('admin', 'analyst', 'auditor', 'viewer');

-- Organizations table (multi-tenant base)
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country_code TEXT,
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id),
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User roles table (RBAC)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Regulatory documents (source of truth for RAG)
CREATE TABLE public.regulatory_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type TEXT NOT NULL, -- 'eu_ai_act', 'gdpr', 'csrd', 'esrs'
  document_name TEXT NOT NULL,
  version TEXT,
  valid_from DATE,
  valid_until DATE,
  language TEXT DEFAULT 'en',
  source_url TEXT,
  content TEXT,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document chunks for RAG (pgvector embeddings)
CREATE TABLE public.document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.regulatory_documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  embedding VECTOR(1536),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for vector similarity search
CREATE INDEX ON public.document_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Create index for text search
CREATE INDEX ON public.document_chunks USING gin (content gin_trgm_ops);

-- AI systems registry
CREATE TABLE public.ai_systems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  name TEXT NOT NULL,
  purpose TEXT,
  sector TEXT,
  model_type TEXT,
  risk_category TEXT, -- 'minimal', 'limited', 'high', 'unacceptable'
  risk_score DECIMAL(5,2),
  deployment_status TEXT DEFAULT 'development',
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Act assessments
CREATE TABLE public.ai_act_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_system_id UUID REFERENCES public.ai_systems(id) ON DELETE CASCADE,
  assessment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assessor_id UUID REFERENCES auth.users(id),
  risk_category TEXT NOT NULL,
  annex_iv_compliant BOOLEAN,
  annex_iv_summary TEXT,
  findings JSONB,
  recommendations TEXT[],
  status TEXT DEFAULT 'draft',
  report_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Act requirement checks
CREATE TABLE public.ai_act_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES public.ai_act_assessments(id) ON DELETE CASCADE,
  requirement_code TEXT NOT NULL,
  requirement_text TEXT,
  status TEXT NOT NULL, -- 'pass', 'fail', 'n/a'
  evidence TEXT,
  evidence_urls TEXT[],
  notes TEXT,
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data processing activities (GDPR Art. 30)
CREATE TABLE public.data_processing_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  activity_name TEXT NOT NULL,
  purpose TEXT,
  legal_basis TEXT,
  data_categories TEXT[],
  data_subjects TEXT[],
  recipients TEXT[],
  retention_period TEXT,
  third_country_transfers BOOLEAN DEFAULT false,
  third_countries TEXT[],
  security_measures TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GDPR assessments
CREATE TABLE public.gdpr_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  assessment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assessor_id UUID REFERENCES auth.users(id),
  violations JSONB,
  findings JSONB,
  summary TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DSAR (Data Subject Access Request) handling
CREATE TABLE public.dsar_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  request_type TEXT NOT NULL, -- 'access', 'rectification', 'erasure', 'portability'
  data_subject_email TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.dsar_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.dsar_requests(id) ON DELETE CASCADE,
  data_exported JSONB,
  response_file_url TEXT,
  fulfilled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ESG metrics storage
CREATE TABLE public.esg_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  reporting_period TEXT NOT NULL,
  metric_category TEXT NOT NULL, -- 'environmental', 'social', 'governance'
  metric_name TEXT NOT NULL,
  metric_code TEXT, -- ESRS code
  value DECIMAL(18,4),
  unit TEXT,
  verified BOOLEAN DEFAULT false,
  source TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ESG reports
CREATE TABLE public.esg_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  reporting_period TEXT NOT NULL,
  narrative_sections JSONB,
  metrics_summary JSONB,
  anomalies_detected TEXT[],
  completeness_score DECIMAL(5,2),
  report_url TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ML model registry
CREATE TABLE public.ml_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  name TEXT NOT NULL,
  version TEXT,
  model_type TEXT,
  framework TEXT,
  purpose TEXT,
  risk_tags TEXT[],
  bias_documentation TEXT,
  performance_metrics JSONB,
  deployment_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.model_datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID REFERENCES public.ml_models(id) ON DELETE CASCADE,
  dataset_name TEXT NOT NULL,
  dataset_url TEXT,
  description TEXT,
  size_records INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit trail with hash chaining
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  agent TEXT NOT NULL, -- 'ai_act_checker', 'gdpr_checker', 'esg_reporter'
  event_type TEXT NOT NULL,
  event_category TEXT,
  actor_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  status TEXT NOT NULL,
  request_payload JSONB,
  response_summary JSONB,
  reasoning_chain JSONB,
  input_hash CHAR(64) NOT NULL,
  output_hash CHAR(64),
  prev_hash CHAR(64),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Explainability views for Q&A
CREATE TABLE public.explainability_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID, -- generic reference
  assessment_type TEXT, -- 'ai_act', 'gdpr', 'esg'
  user_question TEXT,
  answer TEXT,
  evidence_chunks JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MCP agent registry
CREATE TABLE public.mcp_agents (
  name TEXT PRIMARY KEY,
  version TEXT NOT NULL,
  input_schema JSONB NOT NULL,
  output_schema JSONB NOT NULL,
  policy JSONB,
  endpoint TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_act_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_act_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_processing_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gdpr_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dsar_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dsar_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esg_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esg_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.explainability_views ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Security definer function to get user's organization
CREATE OR REPLACE FUNCTION public.get_user_organization_id(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.profiles WHERE id = _user_id
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for organizations (users can see their org)
CREATE POLICY "Users can view their organization"
  ON public.organizations FOR SELECT
  USING (id = public.get_user_organization_id(auth.uid()));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (user_id = auth.uid());

-- RLS Policies for AI systems (organization-scoped)
CREATE POLICY "Users can view their organization's AI systems"
  ON public.ai_systems FOR SELECT
  USING (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "Analysts can insert AI systems"
  ON public.ai_systems FOR INSERT
  WITH CHECK (
    organization_id = public.get_user_organization_id(auth.uid())
    AND (public.has_role(auth.uid(), 'analyst') OR public.has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "Analysts can update AI systems"
  ON public.ai_systems FOR UPDATE
  USING (
    organization_id = public.get_user_organization_id(auth.uid())
    AND (public.has_role(auth.uid(), 'analyst') OR public.has_role(auth.uid(), 'admin'))
  );

-- RLS Policies for assessments (all types)
CREATE POLICY "Users can view their organization's AI Act assessments"
  ON public.ai_act_assessments FOR SELECT
  USING (
    ai_system_id IN (
      SELECT id FROM public.ai_systems 
      WHERE organization_id = public.get_user_organization_id(auth.uid())
    )
  );

CREATE POLICY "Analysts can create assessments"
  ON public.ai_act_assessments FOR INSERT
  WITH CHECK (
    ai_system_id IN (
      SELECT id FROM public.ai_systems 
      WHERE organization_id = public.get_user_organization_id(auth.uid())
    )
    AND (public.has_role(auth.uid(), 'analyst') OR public.has_role(auth.uid(), 'admin'))
  );

-- RLS Policies for GDPR assessments
CREATE POLICY "Users can view their organization's GDPR assessments"
  ON public.gdpr_assessments FOR SELECT
  USING (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "Analysts can create GDPR assessments"
  ON public.gdpr_assessments FOR INSERT
  WITH CHECK (
    organization_id = public.get_user_organization_id(auth.uid())
    AND (public.has_role(auth.uid(), 'analyst') OR public.has_role(auth.uid(), 'admin'))
  );

-- RLS Policies for ESG reports
CREATE POLICY "Users can view their organization's ESG reports"
  ON public.esg_reports FOR SELECT
  USING (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "Analysts can create ESG reports"
  ON public.esg_reports FOR INSERT
  WITH CHECK (
    organization_id = public.get_user_organization_id(auth.uid())
    AND (public.has_role(auth.uid(), 'analyst') OR public.has_role(auth.uid(), 'admin'))
  );

-- RLS Policies for ESG metrics
CREATE POLICY "Users can view their organization's ESG metrics"
  ON public.esg_metrics FOR SELECT
  USING (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "Analysts can insert ESG metrics"
  ON public.esg_metrics FOR INSERT
  WITH CHECK (
    organization_id = public.get_user_organization_id(auth.uid())
    AND (public.has_role(auth.uid(), 'analyst') OR public.has_role(auth.uid(), 'admin'))
  );

-- RLS Policies for ML models
CREATE POLICY "Users can view their organization's models"
  ON public.ml_models FOR SELECT
  USING (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "Analysts can manage models"
  ON public.ml_models FOR ALL
  USING (
    organization_id = public.get_user_organization_id(auth.uid())
    AND (public.has_role(auth.uid(), 'analyst') OR public.has_role(auth.uid(), 'admin'))
  );

-- RLS Policies for audit logs (read-only for most, write for system)
CREATE POLICY "Users can view their organization's audit logs"
  ON public.audit_logs FOR SELECT
  USING (organization_id = public.get_user_organization_id(auth.uid()));

-- RLS for data processing activities
CREATE POLICY "Users can view their organization's DPAs"
  ON public.data_processing_activities FOR SELECT
  USING (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "Analysts can manage DPAs"
  ON public.data_processing_activities FOR ALL
  USING (
    organization_id = public.get_user_organization_id(auth.uid())
    AND (public.has_role(auth.uid(), 'analyst') OR public.has_role(auth.uid(), 'admin'))
  );

-- RLS for DSAR requests
CREATE POLICY "Users can view their organization's DSAR requests"
  ON public.dsar_requests FOR SELECT
  USING (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "Analysts can manage DSAR requests"
  ON public.dsar_requests FOR ALL
  USING (
    organization_id = public.get_user_organization_id(auth.uid())
    AND (public.has_role(auth.uid(), 'analyst') OR public.has_role(auth.uid(), 'admin'))
  );

-- Public read access for regulatory documents and chunks (reference materials)
CREATE POLICY "Anyone can read regulatory documents"
  ON public.regulatory_documents FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read document chunks"
  ON public.document_chunks FOR SELECT
  USING (true);

-- Public read for MCP agent registry
CREATE POLICY "Anyone can read MCP agent registry"
  ON public.mcp_agents FOR SELECT
  USING (true);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_ai_systems_updated_at
  BEFORE UPDATE ON public.ai_systems
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ml_models_updated_at
  BEFORE UPDATE ON public.ml_models
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_regulatory_documents_updated_at
  BEFORE UPDATE ON public.regulatory_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();