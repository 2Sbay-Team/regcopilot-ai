-- ============================================================================
-- Password Security Enhancement: Strong Password Requirements & Expiration
-- ============================================================================

-- Add password metadata to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS password_expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '90 days'),
ADD COLUMN IF NOT EXISTS password_expiry_days INTEGER DEFAULT 90,
ADD COLUMN IF NOT EXISTS force_password_change BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_password_change_reminder TIMESTAMP WITH TIME ZONE;

-- Create password history table to prevent password reuse
CREATE TABLE IF NOT EXISTS public.password_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_password_history_user ON public.password_history(user_id, created_at DESC);

-- Enable RLS on password_history
ALTER TABLE public.password_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own password history
CREATE POLICY "Users can view their own password history"
ON public.password_history FOR SELECT
USING (user_id = auth.uid());

-- Policy: Service role can manage password history
CREATE POLICY "Service role can manage password history"
ON public.password_history FOR ALL
USING (true);

-- Function to check if password has expired
CREATE OR REPLACE FUNCTION public.is_password_expired(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  expiry_date TIMESTAMP WITH TIME ZONE;
  force_change BOOLEAN;
BEGIN
  SELECT password_expires_at, force_password_change
  INTO expiry_date, force_change
  FROM public.profiles
  WHERE id = user_id;
  
  -- Force change overrides everything
  IF force_change THEN
    RETURN TRUE;
  END IF;
  
  -- Check if password has expired
  IF expiry_date IS NOT NULL AND expiry_date < NOW() THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to update password expiry after password change
CREATE OR REPLACE FUNCTION public.update_password_expiry()
RETURNS TRIGGER AS $$
BEGIN
  -- Update password change timestamp and calculate new expiry
  UPDATE public.profiles
  SET 
    password_changed_at = NOW(),
    password_expires_at = NOW() + (password_expiry_days || ' days')::INTERVAL,
    force_password_change = FALSE
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger on auth.users to update profiles when password changes
-- Note: This is a simplified approach - in production you'd use auth hooks
CREATE OR REPLACE FUNCTION public.handle_password_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If encrypted_password changed, update profile
  IF OLD.encrypted_password IS DISTINCT FROM NEW.encrypted_password THEN
    UPDATE public.profiles
    SET 
      password_changed_at = NOW(),
      password_expires_at = NOW() + (COALESCE(password_expiry_days, 90) || ' days')::INTERVAL,
      force_password_change = FALSE
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- Create password policy configuration table
CREATE TABLE IF NOT EXISTS public.password_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  min_length INTEGER DEFAULT 12,
  require_uppercase BOOLEAN DEFAULT TRUE,
  require_lowercase BOOLEAN DEFAULT TRUE,
  require_numbers BOOLEAN DEFAULT TRUE,
  require_special_chars BOOLEAN DEFAULT TRUE,
  expiry_days INTEGER DEFAULT 90,
  password_history_count INTEGER DEFAULT 5,
  max_login_attempts INTEGER DEFAULT 5,
  lockout_duration_minutes INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id)
);

-- Enable RLS on password_policies
ALTER TABLE public.password_policies ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their org's password policies
CREATE POLICY "Users can view their org password policies"
ON public.password_policies FOR SELECT
USING (organization_id = get_user_organization_id(auth.uid()));

-- Policy: Admins can manage password policies
CREATE POLICY "Admins can manage password policies"
ON public.password_policies FOR ALL
USING (
  organization_id = get_user_organization_id(auth.uid()) 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Trigger for updated_at
CREATE TRIGGER trigger_password_policies_updated_at
BEFORE UPDATE ON public.password_policies
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default password policies for existing organizations
INSERT INTO public.password_policies (
  organization_id,
  min_length,
  require_uppercase,
  require_lowercase,
  require_numbers,
  require_special_chars,
  expiry_days,
  password_history_count,
  max_login_attempts,
  lockout_duration_minutes
)
SELECT 
  id,
  12,
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  90,
  5,
  5,
  30
FROM public.organizations
WHERE NOT EXISTS (
  SELECT 1 FROM public.password_policies pp WHERE pp.organization_id = organizations.id
);

-- Create login attempts tracking table
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  success BOOLEAN NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON public.login_attempts(user_email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_org ON public.login_attempts(organization_id, created_at DESC);

-- Enable RLS on login_attempts
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can manage login attempts
CREATE POLICY "Service role can manage login attempts"
ON public.login_attempts FOR ALL
USING (true);

-- Function to check if account is locked due to failed attempts
CREATE OR REPLACE FUNCTION public.is_account_locked(user_email TEXT)
RETURNS JSONB AS $$
DECLARE
  max_attempts INTEGER;
  lockout_duration INTEGER;
  failed_attempts INTEGER;
  last_failed_attempt TIMESTAMP WITH TIME ZONE;
  lockout_until TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get password policy for this user (via their organization)
  SELECT pp.max_login_attempts, pp.lockout_duration_minutes
  INTO max_attempts, lockout_duration
  FROM public.password_policies pp
  JOIN public.profiles p ON p.organization_id = pp.organization_id
  JOIN auth.users u ON u.id = p.id
  WHERE u.email = user_email
  LIMIT 1;
  
  -- Default values if no policy found
  max_attempts := COALESCE(max_attempts, 5);
  lockout_duration := COALESCE(lockout_duration, 30);
  
  -- Count failed attempts in the lockout window
  SELECT COUNT(*), MAX(created_at)
  INTO failed_attempts, last_failed_attempt
  FROM public.login_attempts
  WHERE login_attempts.user_email = is_account_locked.user_email
    AND success = FALSE
    AND created_at > NOW() - (lockout_duration || ' minutes')::INTERVAL;
  
  -- Check if locked
  IF failed_attempts >= max_attempts THEN
    lockout_until := last_failed_attempt + (lockout_duration || ' minutes')::INTERVAL;
    
    IF lockout_until > NOW() THEN
      RETURN jsonb_build_object(
        'locked', TRUE,
        'attempts', failed_attempts,
        'lockout_until', lockout_until,
        'reason', 'Too many failed login attempts'
      );
    END IF;
  END IF;
  
  RETURN jsonb_build_object(
    'locked', FALSE,
    'attempts', failed_attempts,
    'max_attempts', max_attempts
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;