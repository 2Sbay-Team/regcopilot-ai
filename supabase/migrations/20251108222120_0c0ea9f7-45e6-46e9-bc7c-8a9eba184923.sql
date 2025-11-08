-- Create table for alert threshold configurations
CREATE TABLE public.alert_thresholds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('ai_act_risk', 'gdpr_violations', 'esg_issues')),
  threshold_value INTEGER NOT NULL CHECK (threshold_value >= 0),
  time_period TEXT NOT NULL DEFAULT 'week' CHECK (time_period IN ('day', 'week', 'month')),
  notification_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(organization_id, metric_type, time_period)
);

-- Enable RLS
ALTER TABLE public.alert_thresholds ENABLE ROW LEVEL SECURITY;

-- Users can view their organization's thresholds
CREATE POLICY "Users can view their organization's alert thresholds"
ON public.alert_thresholds
FOR SELECT
USING (organization_id = get_user_organization_id(auth.uid()));

-- Admins can manage alert thresholds
CREATE POLICY "Admins can manage alert thresholds"
ON public.alert_thresholds
FOR ALL
USING (
  organization_id = get_user_organization_id(auth.uid()) 
  AND has_role(auth.uid(), 'admin')
);

-- Create trigger for updated_at
CREATE TRIGGER update_alert_thresholds_updated_at
BEFORE UPDATE ON public.alert_thresholds
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default thresholds for existing organizations
INSERT INTO public.alert_thresholds (organization_id, metric_type, threshold_value, time_period)
SELECT 
  id,
  metric_type,
  CASE 
    WHEN metric_type = 'ai_act_risk' THEN 3
    WHEN metric_type = 'gdpr_violations' THEN 5
    WHEN metric_type = 'esg_issues' THEN 4
  END as threshold_value,
  'week' as time_period
FROM public.organizations
CROSS JOIN (
  SELECT unnest(ARRAY['ai_act_risk', 'gdpr_violations', 'esg_issues']) as metric_type
) metrics
ON CONFLICT (organization_id, metric_type, time_period) DO NOTHING;