-- Phase 4.4: Continuous Security Monitoring Infrastructure

-- System Metrics Table
CREATE TABLE IF NOT EXISTS public.system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  cpu_usage NUMERIC,
  memory_usage NUMERIC,
  api_latency_ms INTEGER,
  error_rate NUMERIC,
  storage_utilization_gb NUMERIC,
  active_users INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_system_metrics_org_timestamp ON public.system_metrics(organization_id, timestamp DESC);
CREATE INDEX idx_system_metrics_timestamp ON public.system_metrics(timestamp DESC);

-- Security Events Table (extended)
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- auth_failure, rls_violation, prompt_injection, data_access_anomaly, rate_limit_exceeded
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  user_id UUID,
  ip_address INET,
  user_agent TEXT,
  event_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  threat_indicators TEXT[],
  resolved BOOLEAN DEFAULT false,
  resolved_by UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_security_events_org_created ON public.security_events(organization_id, created_at DESC);
CREATE INDEX idx_security_events_severity ON public.security_events(severity, created_at DESC);
CREATE INDEX idx_security_events_type ON public.security_events(event_type);
CREATE INDEX idx_security_events_unresolved ON public.security_events(organization_id, resolved) WHERE NOT resolved;

-- Alert Policies Table
CREATE TABLE IF NOT EXISTS public.alert_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  policy_name TEXT NOT NULL,
  metric_type TEXT NOT NULL, -- cpu_usage, memory_usage, error_rate, security_event, etc.
  threshold_value NUMERIC NOT NULL,
  comparison_operator TEXT NOT NULL CHECK (comparison_operator IN ('gt', 'lt', 'eq', 'gte', 'lte')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  notification_channels TEXT[] DEFAULT ARRAY['email']::TEXT[], -- email, slack, webhook
  contact_email TEXT,
  webhook_url TEXT,
  enabled BOOLEAN DEFAULT true,
  cooldown_minutes INTEGER DEFAULT 15, -- Prevent alert spam
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_alert_policies_org_enabled ON public.alert_policies(organization_id, enabled);

-- Alert Notifications Table
CREATE TABLE IF NOT EXISTS public.security_alert_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  policy_id UUID REFERENCES public.alert_policies(id) ON DELETE SET NULL,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  message TEXT NOT NULL,
  metric_value NUMERIC,
  threshold_value NUMERIC,
  event_data JSONB,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  sent_channels TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_security_alert_notif_org ON public.security_alert_notifications(organization_id, created_at DESC);
CREATE INDEX idx_security_alert_notif_unack ON public.security_alert_notifications(organization_id, acknowledged) WHERE NOT acknowledged;

-- SOC 2 Evidence Snapshots Table
CREATE TABLE IF NOT EXISTS public.soc2_evidence_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  evidence_type TEXT NOT NULL, -- daily, weekly, monthly, audit_request
  trust_principle TEXT NOT NULL, -- security, availability, processing_integrity, confidentiality, privacy
  metrics_summary JSONB NOT NULL,
  security_events_summary JSONB NOT NULL,
  audit_chain_status JSONB NOT NULL,
  access_logs_summary JSONB NOT NULL,
  storage_path TEXT, -- Path to full JSON/PDF in Supabase Storage
  hash_signature TEXT NOT NULL, -- SHA-256 of snapshot for tamper detection
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(organization_id, snapshot_date, evidence_type)
);

CREATE INDEX idx_soc2_evidence_org_date ON public.soc2_evidence_snapshots(organization_id, snapshot_date DESC);
CREATE INDEX idx_soc2_evidence_type ON public.soc2_evidence_snapshots(evidence_type, snapshot_date DESC);

-- Onboarding Events Table (Phase 5)
CREATE TABLE IF NOT EXISTS public.onboarding_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID,
  event_name TEXT NOT NULL, -- wizard_started, wizard_completed, first_assessment_created, first_connector_added
  event_data JSONB DEFAULT '{}'::jsonb,
  step_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_onboarding_events_org ON public.onboarding_events(organization_id, created_at);

-- Support Tickets Table (Phase 5)
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  category TEXT, -- billing, technical, feature_request, bug_report
  assigned_to UUID,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_support_tickets_org_status ON public.support_tickets(organization_id, status);
CREATE INDEX idx_support_tickets_user ON public.support_tickets(user_id, created_at DESC);

-- Demo Tenants Table (Phase 5)
CREATE TABLE IF NOT EXISTS public.demo_tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_key TEXT UNIQUE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  demo_type TEXT NOT NULL, -- ai_act, gdpr, esg, full
  read_only BOOLEAN DEFAULT true,
  reset_on_reload BOOLEAN DEFAULT true,
  last_reset_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  access_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_demo_tenants_key ON public.demo_tenants(tenant_key);

-- Add trial tracking to organizations (Phase 5)
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'trial';
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trialing';
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- RLS Policies for new tables

ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can insert system metrics" ON public.system_metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view system metrics" ON public.system_metrics FOR SELECT USING (
  organization_id = get_user_organization_id(auth.uid()) AND has_role(auth.uid(), 'admin')
);

ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can insert security events" ON public.security_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage security events" ON public.security_events FOR ALL USING (
  organization_id = get_user_organization_id(auth.uid()) AND has_role(auth.uid(), 'admin')
);

ALTER TABLE public.alert_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage alert policies" ON public.alert_policies FOR ALL USING (
  organization_id = get_user_organization_id(auth.uid()) AND has_role(auth.uid(), 'admin')
);

ALTER TABLE public.security_alert_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view security alerts" ON public.security_alert_notifications FOR SELECT USING (
  organization_id = get_user_organization_id(auth.uid()) AND has_role(auth.uid(), 'admin')
);
CREATE POLICY "Admins can acknowledge alerts" ON public.security_alert_notifications FOR UPDATE USING (
  organization_id = get_user_organization_id(auth.uid()) AND has_role(auth.uid(), 'admin')
);

ALTER TABLE public.soc2_evidence_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can manage SOC2 evidence" ON public.soc2_evidence_snapshots FOR ALL WITH CHECK (true);
CREATE POLICY "Admins can view SOC2 evidence" ON public.soc2_evidence_snapshots FOR SELECT USING (
  organization_id = get_user_organization_id(auth.uid()) AND has_role(auth.uid(), 'admin')
);

ALTER TABLE public.onboarding_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can create onboarding events" ON public.onboarding_events FOR INSERT WITH CHECK (
  organization_id = get_user_organization_id(auth.uid())
);
CREATE POLICY "Admins can view onboarding events" ON public.onboarding_events FOR SELECT USING (
  organization_id = get_user_organization_id(auth.uid()) AND has_role(auth.uid(), 'admin')
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can create support tickets" ON public.support_tickets FOR INSERT WITH CHECK (
  organization_id = get_user_organization_id(auth.uid()) AND user_id = auth.uid()
);
CREATE POLICY "Users can view their tickets" ON public.support_tickets FOR SELECT USING (
  organization_id = get_user_organization_id(auth.uid())
);
CREATE POLICY "Admins can manage all tickets" ON public.support_tickets FOR ALL USING (
  has_role(auth.uid(), 'admin')
);

ALTER TABLE public.demo_tenants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view demo tenants" ON public.demo_tenants FOR SELECT USING (true);
CREATE POLICY "Service role can manage demo tenants" ON public.demo_tenants FOR ALL WITH CHECK (true);