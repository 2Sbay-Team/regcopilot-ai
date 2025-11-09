-- Phase 5.1: System Health & Monitoring Infrastructure

-- System health checks log
CREATE TABLE IF NOT EXISTS public.system_health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_type TEXT NOT NULL,
  component TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('healthy', 'warning', 'critical', 'unknown')),
  latency_ms INTEGER,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  checked_at TIMESTAMPTZ DEFAULT now()
);

-- RLS validation logs
CREATE TABLE IF NOT EXISTS public.rls_validation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  rls_enabled BOOLEAN NOT NULL,
  policy_count INTEGER DEFAULT 0,
  issues_found TEXT[],
  validated_at TIMESTAMPTZ DEFAULT now()
);

-- Security audit logs
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  finding TEXT NOT NULL,
  remediation_status TEXT DEFAULT 'pending',
  auto_fixed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- RAG accuracy metrics
CREATE TABLE IF NOT EXISTS public.rag_accuracy_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_text TEXT NOT NULL,
  expected_relevance NUMERIC,
  actual_relevance NUMERIC,
  cosine_similarity NUMERIC,
  embedding_model TEXT,
  passed BOOLEAN,
  tested_at TIMESTAMPTZ DEFAULT now()
);

-- System stability reports
CREATE TABLE IF NOT EXISTS public.stability_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type TEXT NOT NULL,
  status TEXT NOT NULL,
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  issues_found INTEGER DEFAULT 0,
  auto_fixes_applied INTEGER DEFAULT 0,
  generated_at TIMESTAMPTZ DEFAULT now()
);

-- Predictive compliance scores (Phase 7)
CREATE TABLE IF NOT EXISTS public.predictive_compliance_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  prediction_horizon_days INTEGER NOT NULL,
  predicted_ai_act_score NUMERIC,
  predicted_gdpr_score NUMERIC,
  predicted_esg_score NUMERIC,
  predicted_overall_score NUMERIC,
  confidence_level NUMERIC,
  risk_factors JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  predicted_at TIMESTAMPTZ DEFAULT now()
);

-- Federated learning rounds (Phase 8)
CREATE TABLE IF NOT EXISTS public.federated_learning_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_number INTEGER NOT NULL,
  participating_orgs INTEGER DEFAULT 0,
  model_version TEXT NOT NULL,
  aggregated_metrics JSONB DEFAULT '{}'::jsonb,
  privacy_guarantee TEXT DEFAULT 'DP-FedAvg',
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Enable RLS on all new tables
ALTER TABLE public.system_health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rls_validation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rag_accuracy_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stability_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictive_compliance_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.federated_learning_rounds ENABLE ROW LEVEL SECURITY;

-- RLS Policies for system tables (admin-only)
CREATE POLICY "Admins can view health checks"
  ON public.system_health_checks FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can insert health checks"
  ON public.system_health_checks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view RLS validation logs"
  ON public.rls_validation_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can insert RLS logs"
  ON public.rls_validation_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view security audits"
  ON public.security_audit_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can manage security audits"
  ON public.security_audit_logs FOR ALL
  USING (true);

CREATE POLICY "Admins can view RAG metrics"
  ON public.rag_accuracy_metrics FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can insert RAG metrics"
  ON public.rag_accuracy_metrics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view stability reports"
  ON public.stability_reports FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can insert stability reports"
  ON public.stability_reports FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their org's predictive scores"
  ON public.predictive_compliance_scores FOR SELECT
  USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Service role can insert predictive scores"
  ON public.predictive_compliance_scores FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view federated rounds"
  ON public.federated_learning_rounds FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can manage federated rounds"
  ON public.federated_learning_rounds FOR ALL
  USING (true);

-- Indexes for performance
CREATE INDEX idx_health_checks_checked_at ON public.system_health_checks(checked_at DESC);
CREATE INDEX idx_health_checks_status ON public.system_health_checks(status);
CREATE INDEX idx_security_audits_severity ON public.security_audit_logs(severity);
CREATE INDEX idx_predictive_scores_org ON public.predictive_compliance_scores(organization_id, predicted_at DESC);