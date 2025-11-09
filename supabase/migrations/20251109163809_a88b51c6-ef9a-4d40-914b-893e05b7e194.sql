-- Phase 7: EU AI Act Conformity & Public Sector Certification System

-- Enable pgcrypto for digital signatures
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Regulatory requirements reference table
CREATE TABLE IF NOT EXISTS public.regulatory_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  regulation_type TEXT NOT NULL, -- 'eu_ai_act', 'gdpr', 'csrd', etc.
  article_ref TEXT,
  annex_ref TEXT,
  version TEXT NOT NULL DEFAULT '1.0',
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_regulatory_requirements_code ON public.regulatory_requirements(code);
CREATE INDEX idx_regulatory_requirements_type ON public.regulatory_requirements(regulation_type);

-- AI Conformity Reports (Annex IV)
CREATE TABLE IF NOT EXISTS public.ai_conformity_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  ai_system_id UUID REFERENCES public.ai_systems(id) ON DELETE SET NULL,
  report_type TEXT NOT NULL DEFAULT 'annex_iv', -- 'annex_iv', 'risk_assessment', 'conformity_declaration'
  risk_category TEXT NOT NULL,
  annex_iv_items JSONB NOT NULL DEFAULT '{}'::jsonb,
  evidence_summary JSONB DEFAULT '{}'::jsonb,
  compliance_status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'submitted', 'approved', 'rejected'
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  generated_by UUID REFERENCES auth.users(id),
  signed_hash TEXT,
  signature_algorithm TEXT DEFAULT 'sha256',
  pdf_url TEXT,
  version INTEGER DEFAULT 1,
  previous_version_id UUID REFERENCES public.ai_conformity_reports(id),
  expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_conformity_reports_org ON public.ai_conformity_reports(organization_id);
CREATE INDEX idx_ai_conformity_reports_system ON public.ai_conformity_reports(ai_system_id);
CREATE INDEX idx_ai_conformity_reports_status ON public.ai_conformity_reports(compliance_status);

-- Compliance Evidence Links
CREATE TABLE IF NOT EXISTS public.compliance_evidence_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.ai_conformity_reports(id) ON DELETE CASCADE,
  audit_log_id UUID REFERENCES public.audit_logs(id),
  document_url TEXT,
  evidence_type TEXT NOT NULL, -- 'audit_log', 'model_card', 'data_governance', 'test_results', 'human_oversight'
  evidence_category TEXT, -- Maps to Annex IV sections A-F
  requirement_code TEXT,
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id),
  verification_notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_evidence_links_report ON public.compliance_evidence_links(report_id);
CREATE INDEX idx_evidence_links_audit ON public.compliance_evidence_links(audit_log_id);
CREATE INDEX idx_evidence_links_type ON public.compliance_evidence_links(evidence_type);

-- Auditor Sign-offs
CREATE TABLE IF NOT EXISTS public.auditor_signoffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.ai_conformity_reports(id) ON DELETE CASCADE,
  auditor_id UUID NOT NULL REFERENCES auth.users(id),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  decision TEXT NOT NULL, -- 'approved', 'rejected', 'needs_revision'
  review_notes TEXT,
  compliance_score INTEGER CHECK (compliance_score >= 0 AND compliance_score <= 100),
  evidence_coverage_score INTEGER CHECK (evidence_coverage_score >= 0 AND evidence_coverage_score <= 100),
  signed_hash TEXT NOT NULL,
  signature_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expiry_date TIMESTAMP WITH TIME ZONE,
  certification_body TEXT,
  certification_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_auditor_signoffs_report ON public.auditor_signoffs(report_id);
CREATE INDEX idx_auditor_signoffs_auditor ON public.auditor_signoffs(auditor_id);
CREATE INDEX idx_auditor_signoffs_org ON public.auditor_signoffs(organization_id);

-- Annex IV Documents (detailed technical documentation)
CREATE TABLE IF NOT EXISTS public.annex_iv_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conformity_report_id UUID NOT NULL REFERENCES public.ai_conformity_reports(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  ai_system_id UUID REFERENCES public.ai_systems(id),
  document_version TEXT NOT NULL DEFAULT '1.0',
  
  -- Annex IV Section A: General Description
  general_description JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Annex IV Section B: Development Process
  development_process JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Annex IV Section C: Monitoring & Logging
  monitoring_logging JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Annex IV Section D: Risk Management
  risk_management JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Annex IV Section E: Technical Documentation
  technical_documentation JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Annex IV Section F: Transparency & User Info
  transparency_info JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Annex IV Section G: Updates & Maintenance
  updates_maintenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  pdf_export_url TEXT,
  hash_signature TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_annex_iv_docs_report ON public.annex_iv_documents(conformity_report_id);
CREATE INDEX idx_annex_iv_docs_org ON public.annex_iv_documents(organization_id);

-- Add government/public sector configuration to organizations
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS is_public_sector BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS certification_level TEXT,
ADD COLUMN IF NOT EXISTS document_retention_years INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS signing_key_id TEXT,
ADD COLUMN IF NOT EXISTS public_key TEXT;

-- Enable RLS
ALTER TABLE public.regulatory_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conformity_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_evidence_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auditor_signoffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.annex_iv_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for regulatory_requirements (public read)
CREATE POLICY "Anyone can read regulatory requirements"
  ON public.regulatory_requirements FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage regulatory requirements"
  ON public.regulatory_requirements FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- RLS Policies for ai_conformity_reports
CREATE POLICY "Users can view their org's conformity reports"
  ON public.ai_conformity_reports FOR SELECT
  USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Analysts can create conformity reports"
  ON public.ai_conformity_reports FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id(auth.uid())
    AND (has_role(auth.uid(), 'analyst') OR has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "Analysts can update their org's conformity reports"
  ON public.ai_conformity_reports FOR UPDATE
  USING (
    organization_id = get_user_organization_id(auth.uid())
    AND (has_role(auth.uid(), 'analyst') OR has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "Auditors can view conformity reports"
  ON public.ai_conformity_reports FOR SELECT
  USING (has_role(auth.uid(), 'auditor'));

-- RLS Policies for compliance_evidence_links
CREATE POLICY "Users can view their org's evidence links"
  ON public.compliance_evidence_links FOR SELECT
  USING (
    report_id IN (
      SELECT id FROM public.ai_conformity_reports
      WHERE organization_id = get_user_organization_id(auth.uid())
    )
  );

CREATE POLICY "Analysts can manage evidence links"
  ON public.compliance_evidence_links FOR ALL
  USING (
    (has_role(auth.uid(), 'analyst') OR has_role(auth.uid(), 'admin'))
    AND report_id IN (
      SELECT id FROM public.ai_conformity_reports
      WHERE organization_id = get_user_organization_id(auth.uid())
    )
  );

-- RLS Policies for auditor_signoffs
CREATE POLICY "Users can view their org's auditor signoffs"
  ON public.auditor_signoffs FOR SELECT
  USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Auditors can create signoffs"
  ON public.auditor_signoffs FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'auditor') AND auditor_id = auth.uid());

CREATE POLICY "Auditors can view all signoffs"
  ON public.auditor_signoffs FOR SELECT
  USING (has_role(auth.uid(), 'auditor'));

-- RLS Policies for annex_iv_documents
CREATE POLICY "Users can view their org's Annex IV documents"
  ON public.annex_iv_documents FOR SELECT
  USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Service role can manage Annex IV documents"
  ON public.annex_iv_documents FOR ALL
  USING (true);

-- Seed EU AI Act regulatory requirements
INSERT INTO public.regulatory_requirements (code, title, description, regulation_type, article_ref, annex_ref) VALUES
('AI_ACT_ART5', 'Prohibited AI Practices', 'AI systems that manipulate, exploit vulnerabilities, or enable social scoring', 'eu_ai_act', 'Article 5', NULL),
('AI_ACT_ART6', 'High-Risk AI Classification', 'Classification rules for high-risk AI systems', 'eu_ai_act', 'Article 6', 'Annex III'),
('AI_ACT_ART9', 'Risk Management System', 'Continuous iterative risk management throughout AI system lifecycle', 'eu_ai_act', 'Article 9', NULL),
('AI_ACT_ART10', 'Data and Data Governance', 'Requirements for training, validation, and testing datasets', 'eu_ai_act', 'Article 10', NULL),
('AI_ACT_ART11', 'Technical Documentation', 'Preparation of technical documentation (Annex IV)', 'eu_ai_act', 'Article 11', 'Annex IV'),
('AI_ACT_ART12', 'Record-keeping', 'Automatic recording of events (logs)', 'eu_ai_act', 'Article 12', NULL),
('AI_ACT_ART13', 'Transparency and Information', 'Provision of information to users and deployers', 'eu_ai_act', 'Article 13', NULL),
('AI_ACT_ART14', 'Human Oversight', 'Measures to enable effective human oversight', 'eu_ai_act', 'Article 14', NULL),
('AI_ACT_ART15', 'Accuracy, Robustness, Cybersecurity', 'Appropriate levels of accuracy, robustness, and cybersecurity', 'eu_ai_act', 'Article 15', NULL),
('AI_ACT_ANNEX3_1', 'Biometric Identification', 'Remote biometric identification systems', 'eu_ai_act', 'Article 6', 'Annex III-1'),
('AI_ACT_ANNEX3_2', 'Critical Infrastructure', 'AI systems for critical infrastructure management', 'eu_ai_act', 'Article 6', 'Annex III-2'),
('AI_ACT_ANNEX3_3', 'Education & Training', 'AI systems for access to education and vocational training', 'eu_ai_act', 'Article 6', 'Annex III-3'),
('AI_ACT_ANNEX3_4', 'Employment', 'AI systems for recruitment and worker management', 'eu_ai_act', 'Article 6', 'Annex III-4'),
('AI_ACT_ANNEX3_5', 'Essential Services', 'AI systems for access to essential private/public services', 'eu_ai_act', 'Article 6', 'Annex III-5'),
('AI_ACT_ANNEX3_6', 'Law Enforcement', 'AI systems for law enforcement purposes', 'eu_ai_act', 'Article 6', 'Annex III-6'),
('AI_ACT_ANNEX3_7', 'Migration & Asylum', 'AI systems for migration, asylum, and border control', 'eu_ai_act', 'Article 6', 'Annex III-7'),
('AI_ACT_ANNEX3_8', 'Justice & Democracy', 'AI systems for administration of justice and democratic processes', 'eu_ai_act', 'Article 6', 'Annex III-8')
ON CONFLICT (code) DO NOTHING;

-- Add auditor role to app_role enum if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role' AND typcategory = 'E') THEN
    CREATE TYPE app_role AS ENUM ('viewer', 'analyst', 'admin', 'auditor');
  ELSE
    BEGIN
      ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'auditor';
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;

-- Function to generate conformity report hash
CREATE OR REPLACE FUNCTION public.generate_conformity_hash(
  p_report_id UUID
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hash TEXT;
  v_data TEXT;
BEGIN
  -- Aggregate all report data for hashing
  SELECT 
    report_type || risk_category || 
    COALESCE(annex_iv_items::text, '') || 
    COALESCE(evidence_summary::text, '') ||
    generated_at::text
  INTO v_data
  FROM ai_conformity_reports
  WHERE id = p_report_id;
  
  -- Generate SHA256 hash
  v_hash := encode(digest(v_data, 'sha256'), 'hex');
  
  -- Update report with hash
  UPDATE ai_conformity_reports
  SET signed_hash = v_hash
  WHERE id = p_report_id;
  
  RETURN v_hash;
END;
$$;

-- Trigger to auto-generate hash on report creation
CREATE OR REPLACE FUNCTION public.auto_generate_conformity_hash()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Generate hash for new report
  IF NEW.signed_hash IS NULL THEN
    NEW.signed_hash := encode(
      digest(
        NEW.report_type || NEW.risk_category || 
        COALESCE(NEW.annex_iv_items::text, '') || 
        COALESCE(NEW.evidence_summary::text, '') ||
        NEW.generated_at::text,
        'sha256'
      ),
      'hex'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_auto_generate_conformity_hash
  BEFORE INSERT ON public.ai_conformity_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_generate_conformity_hash();

COMMENT ON TABLE public.regulatory_requirements IS 'Master reference table for regulatory requirements (EU AI Act, GDPR, CSRD)';
COMMENT ON TABLE public.ai_conformity_reports IS 'AI Act conformity assessment reports with Annex IV documentation';
COMMENT ON TABLE public.compliance_evidence_links IS 'Links conformity reports to audit logs and supporting evidence';
COMMENT ON TABLE public.auditor_signoffs IS 'External auditor review and certification records';
COMMENT ON TABLE public.annex_iv_documents IS 'Detailed Annex IV technical documentation for AI systems';