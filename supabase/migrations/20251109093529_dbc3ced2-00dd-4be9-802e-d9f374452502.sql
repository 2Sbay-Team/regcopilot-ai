-- ==========================================
-- CRITICAL SECURITY FIXES: Phase 1 (Fixed)
-- ==========================================

-- 1. CREATE AUTH AUDIT LOGS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.auth_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.auth_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own auth logs" ON public.auth_audit_logs;
CREATE POLICY "Users can view their own auth logs"
ON public.auth_audit_logs FOR SELECT TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all auth logs" ON public.auth_audit_logs;
CREATE POLICY "Admins can view all auth logs"
ON public.auth_audit_logs FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Service role can insert auth logs" ON public.auth_audit_logs;
CREATE POLICY "Service role can insert auth logs"
ON public.auth_audit_logs FOR INSERT TO service_role
WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_user_id ON public.auth_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_event_type ON public.auth_audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_created_at ON public.auth_audit_logs(created_at DESC);

-- 2. FIX RLS POLICIES - REMOVE PUBLIC ACCESS
-- ==========================================

-- profiles: Lock down to users and admins only
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT TO authenticated
USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- organizations: Lock down properly
DROP POLICY IF EXISTS "Users can view their own organization" ON public.organizations;
DROP POLICY IF EXISTS "Users can view their organization" ON public.organizations;
DROP POLICY IF EXISTS "Admins can view all organizations" ON public.organizations;

CREATE POLICY "Users can view their organization"
ON public.organizations FOR SELECT TO authenticated
USING (id = get_user_organization_id(auth.uid()));

CREATE POLICY "Admins can view all organizations"
ON public.organizations FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. PASSWORD LEAK CHECK TRACKING
-- ==========================================
CREATE TABLE IF NOT EXISTS public.password_leak_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_leaked BOOLEAN NOT NULL,
  hash_prefix TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'
);

ALTER TABLE public.password_leak_checks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own leak checks" ON public.password_leak_checks;
CREATE POLICY "Users can view their own leak checks"
ON public.password_leak_checks FOR SELECT TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role can manage leak checks" ON public.password_leak_checks;
CREATE POLICY "Service role can manage leak checks"
ON public.password_leak_checks FOR ALL TO service_role
USING (true) WITH CHECK (true);

-- 4. DATA RETENTION POLICIES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.data_retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  table_name TEXT NOT NULL,
  retention_days INTEGER NOT NULL DEFAULT 365,
  enabled BOOLEAN DEFAULT true,
  last_cleanup_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(organization_id, table_name)
);

ALTER TABLE public.data_retention_policies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their org retention policies" ON public.data_retention_policies;
CREATE POLICY "Users can view their org retention policies"
ON public.data_retention_policies FOR SELECT TO authenticated
USING (organization_id = get_user_organization_id(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage retention policies" ON public.data_retention_policies;
CREATE POLICY "Admins can manage retention policies"
ON public.data_retention_policies FOR ALL TO authenticated
USING (organization_id = get_user_organization_id(auth.uid()) AND has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (organization_id = get_user_organization_id(auth.uid()) AND has_role(auth.uid(), 'admin'::app_role));

-- Insert default retention policies for existing orgs
INSERT INTO public.data_retention_policies (organization_id, table_name, retention_days)
SELECT id, 'audit_logs', 365 FROM public.organizations
ON CONFLICT (organization_id, table_name) DO NOTHING;

INSERT INTO public.data_retention_policies (organization_id, table_name, retention_days)
SELECT id, 'auth_audit_logs', 365 FROM public.organizations
ON CONFLICT (organization_id, table_name) DO NOTHING;

-- 5. MFA BACKUP CODES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.mfa_backup_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  code_hash TEXT NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.mfa_backup_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own backup codes" ON public.mfa_backup_codes;
CREATE POLICY "Users can view their own backup codes"
ON public.mfa_backup_codes FOR SELECT TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role can manage backup codes" ON public.mfa_backup_codes;
CREATE POLICY "Service role can manage backup codes"
ON public.mfa_backup_codes FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_mfa_backup_codes_user_id ON public.mfa_backup_codes(user_id);

-- 6. SCHEDULED JOBS FOR AUTOMATION
-- ==========================================
CREATE TABLE IF NOT EXISTS public.scheduled_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  job_name TEXT NOT NULL,
  job_type TEXT NOT NULL,
  schedule_cron TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  last_run_at TIMESTAMP WITH TIME ZONE,
  last_status TEXT,
  next_run_at TIMESTAMP WITH TIME ZONE,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.scheduled_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their org scheduled jobs" ON public.scheduled_jobs;
CREATE POLICY "Users can view their org scheduled jobs"
ON public.scheduled_jobs FOR SELECT TO authenticated
USING (organization_id = get_user_organization_id(auth.uid()) OR organization_id IS NULL);

DROP POLICY IF EXISTS "Admins can manage scheduled jobs" ON public.scheduled_jobs;
CREATE POLICY "Admins can manage scheduled jobs"
ON public.scheduled_jobs FOR ALL TO authenticated
USING ((organization_id = get_user_organization_id(auth.uid()) OR organization_id IS NULL) AND has_role(auth.uid(), 'admin'::app_role))
WITH CHECK ((organization_id = get_user_organization_id(auth.uid()) OR organization_id IS NULL) AND has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_scheduled_jobs_next_run ON public.scheduled_jobs(next_run_at) WHERE enabled = true;