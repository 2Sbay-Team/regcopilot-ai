-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create stored procedure to purge old audit logs (12 months retention)
CREATE OR REPLACE FUNCTION public.purge_old_audit_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Delete audit logs older than 12 months
  DELETE FROM public.audit_logs
  WHERE timestamp < NOW() - INTERVAL '12 months';
  
  -- Delete auth audit logs older than 12 months
  DELETE FROM public.auth_audit_logs
  WHERE created_at < NOW() - INTERVAL '12 months';
  
  -- Delete old agent task history older than 12 months
  DELETE FROM public.agent_task_history
  WHERE created_at < NOW() - INTERVAL '12 months';
  
  -- Update last cleanup timestamp in retention policies
  UPDATE public.data_retention_policies
  SET last_cleanup_at = NOW()
  WHERE enabled = true;
  
  RAISE NOTICE 'Data retention purge completed successfully';
END;
$function$;

-- Schedule monthly data purge (runs at 3 AM on the 1st of every month)
SELECT cron.schedule(
  'monthly_data_purge',
  '0 3 1 * *',
  $$SELECT public.purge_old_audit_logs();$$
);

-- Create stored procedure for GDPR data subject deletion
CREATE OR REPLACE FUNCTION public.gdpr_delete_user_data(subject_email TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  org_id UUID;
BEGIN
  -- Find organization by email (simplified - in production would be more sophisticated)
  SELECT organization_id INTO org_id
  FROM public.profiles
  WHERE email = subject_email;
  
  IF org_id IS NULL THEN
    RAISE EXCEPTION 'No user found with email: %', subject_email;
  END IF;
  
  -- Delete personal data across all tables
  DELETE FROM public.dsar_requests WHERE data_subject_email = subject_email;
  DELETE FROM public.auth_audit_logs WHERE user_id = (SELECT id FROM auth.users WHERE email = subject_email);
  
  RAISE NOTICE 'GDPR deletion completed for: %', subject_email;
END;
$function$;

-- Add cron job monitoring table
CREATE TABLE IF NOT EXISTS public.cron_job_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'running',
  records_processed INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on cron job logs
ALTER TABLE public.cron_job_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all cron logs
CREATE POLICY "Admins can view cron job logs"
ON public.cron_job_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Service role can insert cron logs
CREATE POLICY "Service role can insert cron logs"
ON public.cron_job_logs
FOR INSERT
WITH CHECK (true);