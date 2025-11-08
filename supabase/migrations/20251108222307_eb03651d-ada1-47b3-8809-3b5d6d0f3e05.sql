-- Create table for alert notification history
CREATE TABLE public.alert_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  threshold_id UUID NOT NULL REFERENCES public.alert_thresholds(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  metric_value INTEGER NOT NULL,
  threshold_value INTEGER NOT NULL,
  time_period TEXT NOT NULL,
  period_label TEXT NOT NULL,
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.alert_notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their organization's alert notifications
CREATE POLICY "Users can view their organization's alert notifications"
ON public.alert_notifications
FOR SELECT
USING (organization_id = get_user_organization_id(auth.uid()));

-- Admins can manage alert notifications
CREATE POLICY "Admins can manage alert notifications"
ON public.alert_notifications
FOR ALL
USING (
  organization_id = get_user_organization_id(auth.uid()) 
  AND has_role(auth.uid(), 'admin')
);

-- Create index for faster queries
CREATE INDEX idx_alert_notifications_org_triggered 
ON public.alert_notifications(organization_id, triggered_at DESC);

CREATE INDEX idx_alert_notifications_acknowledged 
ON public.alert_notifications(organization_id, acknowledged, triggered_at DESC);

-- Enable realtime for alert notifications
ALTER TABLE public.alert_notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alert_notifications;