-- Phase 13.3: Onboarding & Marketing Automation Tables

-- Onboarding checklists per organization
CREATE TABLE IF NOT EXISTS onboarding_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  task_key TEXT NOT NULL,
  task_order INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Marketing events tracking (GDPR-compliant)
CREATE TABLE IF NOT EXISTS marketing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL CHECK (event_type IN (
    'signup', 'tour_started', 'tour_completed', 'file_uploaded', 
    'copilot_run', 'report_generated', 'upgrade_clicked', 
    'email_sent', 'email_opened', 'email_clicked', 'conversion',
    'trial_started', 'trial_ending', 'feature_discovered',
    'connector_added', 'team_invited', 'onboarding_completed'
  )),
  event_category TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  consent_given BOOLEAN DEFAULT false,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Marketing consent tracking
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS marketing_consent_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE;

-- Engagement metrics view
CREATE OR REPLACE VIEW engagement_metrics AS
SELECT 
  o.id as organization_id,
  o.name as organization_name,
  o.subscription_plan as plan,
  o.created_at as signup_date,
  p.onboarding_completed,
  p.onboarding_completed_at,
  COUNT(DISTINCT CASE WHEN me.event_type = 'copilot_run' THEN me.id END) as copilot_runs,
  COUNT(DISTINCT CASE WHEN me.event_type = 'report_generated' THEN me.id END) as reports_generated,
  COUNT(DISTINCT CASE WHEN me.event_type = 'file_uploaded' THEN me.id END) as files_uploaded,
  COUNT(DISTINCT CASE WHEN me.event_type = 'connector_added' THEN me.id END) as connectors_added,
  MAX(me.created_at) as last_active_at,
  COUNT(DISTINCT oc.id) as checklist_items_completed,
  (COUNT(DISTINCT CASE WHEN oc.completed THEN oc.id END)::float / NULLIF(COUNT(DISTINCT oc.id), 0)) * 100 as completion_percentage
FROM organizations o
LEFT JOIN profiles p ON p.organization_id = o.id
LEFT JOIN marketing_events me ON me.organization_id = o.id
LEFT JOIN onboarding_checklists oc ON oc.organization_id = o.id
GROUP BY o.id, o.name, o.subscription_plan, o.created_at, p.onboarding_completed, p.onboarding_completed_at;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_onboarding_org ON onboarding_checklists(organization_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_completed ON onboarding_checklists(completed);
CREATE INDEX IF NOT EXISTS idx_marketing_events_org ON marketing_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_marketing_events_user ON marketing_events(user_id);
CREATE INDEX IF NOT EXISTS idx_marketing_events_type ON marketing_events(event_type);
CREATE INDEX IF NOT EXISTS idx_marketing_events_date ON marketing_events(created_at DESC);

-- RLS Policies for onboarding_checklists
ALTER TABLE onboarding_checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org's onboarding checklist"
  ON onboarding_checklists FOR SELECT
  USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Users can update their org's checklist"
  ON onboarding_checklists FOR UPDATE
  USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Service role can manage checklists"
  ON onboarding_checklists FOR ALL
  USING (true);

-- RLS Policies for marketing_events
ALTER TABLE marketing_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org's marketing events"
  ON marketing_events FOR SELECT
  USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Service role can manage marketing events"
  ON marketing_events FOR ALL
  USING (true);

CREATE POLICY "Admins can view all marketing events"
  ON marketing_events FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to initialize onboarding checklist for new organization
CREATE OR REPLACE FUNCTION initialize_onboarding_checklist(org_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO onboarding_checklists (organization_id, task_key, task_name, task_order)
  VALUES
    (org_id, 'profile_setup', 'Complete your organization profile', 1),
    (org_id, 'connect_data', 'Connect your first data source', 2),
    (org_id, 'run_copilot', 'Run your first Copilot assessment', 3),
    (org_id, 'generate_report', 'Generate your first compliance report', 4),
    (org_id, 'invite_team', 'Invite team members', 5),
    (org_id, 'explore_dashboard', 'Explore the analytics dashboard', 6);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create checklist on organization creation
CREATE OR REPLACE FUNCTION trigger_initialize_onboarding()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM initialize_onboarding_checklist(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_organization_created
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION trigger_initialize_onboarding();

-- Function to log marketing event
CREATE OR REPLACE FUNCTION log_marketing_event(
  p_org_id UUID,
  p_user_id UUID,
  p_event_type TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
  v_consent BOOLEAN;
BEGIN
  -- Check consent
  SELECT marketing_consent INTO v_consent
  FROM profiles
  WHERE user_id = p_user_id;
  
  -- Insert event
  INSERT INTO marketing_events (
    organization_id, user_id, event_type, metadata, consent_given
  ) VALUES (
    p_org_id, p_user_id, p_event_type, p_metadata, COALESCE(v_consent, false)
  ) RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;