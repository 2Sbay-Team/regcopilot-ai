-- =====================================================
-- Automation Actuator Engine Schema
-- =====================================================

-- Actuator Rules Table
CREATE TABLE public.actuator_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL, -- 'gdpr_violation', 'ai_act_assessment', 'esg_metric', 'connector_sync', 'manual'
  trigger_config JSONB NOT NULL DEFAULT '{}', -- specific trigger conditions
  condition_logic JSONB NOT NULL, -- evaluation rules (e.g., {"field": "risk_category", "operator": "equals", "value": "high"})
  action_type TEXT NOT NULL, -- 'email', 'slack', 'jira', 'archive_file', 'trigger_function', 'move_file'
  action_config JSONB NOT NULL, -- action-specific config (e.g., email template, webhook URL)
  enabled BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 5, -- 1-10, higher = more urgent
  ai_managed BOOLEAN DEFAULT false, -- future: AI can modify this rule
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_executed_at TIMESTAMP WITH TIME ZONE,
  execution_count INTEGER DEFAULT 0
);

-- Actuator Logs Table
CREATE TABLE public.actuator_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  rule_id UUID REFERENCES public.actuator_rules(id) ON DELETE SET NULL,
  trigger_source TEXT NOT NULL, -- source table/type
  trigger_id UUID, -- reference to source record
  action_type TEXT NOT NULL,
  action_payload JSONB NOT NULL,
  status TEXT NOT NULL, -- 'success', 'failed', 'skipped'
  result JSONB, -- outcome details
  error_message TEXT,
  execution_time_ms INTEGER,
  reasoning_summary TEXT, -- why this action was taken
  action_hash TEXT NOT NULL, -- SHA-256 of action payload
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Actuator Triggers (optional mapping for connectors)
CREATE TABLE public.actuator_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  rule_id UUID NOT NULL REFERENCES public.actuator_rules(id) ON DELETE CASCADE,
  data_source_type TEXT NOT NULL, -- 'connector', 'storage_bucket', 'table'
  data_source_id UUID, -- connector_id or bucket reference
  filter_config JSONB DEFAULT '{}', -- additional filters
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- AI Actuator Feedback (Phase 2 - AI-Ready)
CREATE TABLE public.ai_actuator_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  rule_id UUID NOT NULL REFERENCES public.actuator_rules(id) ON DELETE CASCADE,
  success_rate NUMERIC(5,2), -- percentage
  avg_time_to_resolution INTEGER, -- milliseconds
  manual_overrides INTEGER DEFAULT 0,
  ai_suggestions JSONB, -- future AI recommendations
  evaluated_period_start TIMESTAMP WITH TIME ZONE,
  evaluated_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.actuator_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actuator_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actuator_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_actuator_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies: actuator_rules
CREATE POLICY "Admins can manage actuator rules"
  ON public.actuator_rules
  FOR ALL
  USING (
    organization_id = get_user_organization_id(auth.uid())
    AND has_role(auth.uid(), 'admin')
  )
  WITH CHECK (
    organization_id = get_user_organization_id(auth.uid())
    AND has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can view their org's actuator rules"
  ON public.actuator_rules
  FOR SELECT
  USING (organization_id = get_user_organization_id(auth.uid()));

-- RLS Policies: actuator_logs
CREATE POLICY "Service role can insert actuator logs"
  ON public.actuator_logs
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their org's actuator logs"
  ON public.actuator_logs
  FOR SELECT
  USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Admins can manage actuator logs"
  ON public.actuator_logs
  FOR ALL
  USING (
    organization_id = get_user_organization_id(auth.uid())
    AND has_role(auth.uid(), 'admin')
  );

-- RLS Policies: actuator_triggers
CREATE POLICY "Admins can manage actuator triggers"
  ON public.actuator_triggers
  FOR ALL
  USING (
    organization_id = get_user_organization_id(auth.uid())
    AND has_role(auth.uid(), 'admin')
  )
  WITH CHECK (
    organization_id = get_user_organization_id(auth.uid())
    AND has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can view their org's actuator triggers"
  ON public.actuator_triggers
  FOR SELECT
  USING (organization_id = get_user_organization_id(auth.uid()));

-- RLS Policies: ai_actuator_feedback
CREATE POLICY "Admins can manage AI actuator feedback"
  ON public.ai_actuator_feedback
  FOR ALL
  USING (
    organization_id = get_user_organization_id(auth.uid())
    AND has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can view their org's AI actuator feedback"
  ON public.ai_actuator_feedback
  FOR SELECT
  USING (organization_id = get_user_organization_id(auth.uid()));

-- Indexes for performance
CREATE INDEX idx_actuator_rules_org_enabled ON public.actuator_rules(organization_id, enabled);
CREATE INDEX idx_actuator_rules_trigger_type ON public.actuator_rules(trigger_type);
CREATE INDEX idx_actuator_logs_org_executed ON public.actuator_logs(organization_id, executed_at DESC);
CREATE INDEX idx_actuator_logs_rule_id ON public.actuator_logs(rule_id);
CREATE INDEX idx_actuator_triggers_rule_id ON public.actuator_triggers(rule_id);

-- Trigger to update updated_at
CREATE TRIGGER update_actuator_rules_updated_at
  BEFORE UPDATE ON public.actuator_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Sample seed rule (commented out - for reference)
-- INSERT INTO public.actuator_rules (organization_id, name, description, trigger_type, condition_logic, action_type, action_config)
-- VALUES (
--   'org-uuid-here',
--   'High-Risk AI System Alert',
--   'Send email alert when high-risk AI system is detected',
--   'ai_act_assessment',
--   '{"field": "risk_category", "operator": "equals", "value": "high"}',
--   'email',
--   '{"to": "compliance@company.com", "subject": "High-Risk AI System Detected", "template": "high_risk_alert"}'
-- );