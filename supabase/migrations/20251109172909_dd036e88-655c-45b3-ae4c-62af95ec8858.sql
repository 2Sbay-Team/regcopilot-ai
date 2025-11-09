-- Create organization_domains table for domain verification
CREATE TABLE public.organization_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  domain TEXT NOT NULL UNIQUE,
  verified BOOLEAN DEFAULT FALSE,
  verification_token TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  CONSTRAINT valid_domain CHECK (domain ~* '^[a-z0-9.-]+\.[a-z]{2,}$')
);

-- Create organization_invites table
CREATE TABLE public.organization_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  invited_by UUID REFERENCES auth.users(id) NOT NULL,
  role app_role DEFAULT 'analyst',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  invite_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, email, status)
);

-- Create sso_connections table for Azure AD configuration
CREATE TABLE public.sso_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL UNIQUE,
  provider TEXT NOT NULL DEFAULT 'azure' CHECK (provider IN ('azure', 'okta', 'google-workspace')),
  client_id TEXT,
  tenant_id TEXT,
  enabled BOOLEAN DEFAULT FALSE,
  auto_provision BOOLEAN DEFAULT TRUE,
  default_role app_role DEFAULT 'analyst',
  config JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.organization_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sso_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organization_domains
CREATE POLICY "Users can view their organization domains"
  ON public.organization_domains FOR SELECT
  TO authenticated
  USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage organization domains"
  ON public.organization_domains FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') 
    AND organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

-- RLS Policies for organization_invites
CREATE POLICY "Users can view their organization invites"
  ON public.organization_invites FOR SELECT
  TO authenticated
  USING (
    organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
    OR email = (SELECT email FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can create invites"
  ON public.organization_invites FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    AND organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can update invites"
  ON public.organization_invites FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    AND organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

-- RLS Policies for sso_connections
CREATE POLICY "Admins can view their SSO config"
  ON public.sso_connections FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    AND organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can manage SSO config"
  ON public.sso_connections FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    AND organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

-- Function to find organization by verified email domain
CREATE OR REPLACE FUNCTION public.find_org_by_email_domain(p_email TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_domain TEXT;
  v_org_id UUID;
BEGIN
  -- Extract domain from email
  v_domain := split_part(p_email, '@', 2);
  
  -- Find organization with verified domain
  SELECT organization_id INTO v_org_id
  FROM public.organization_domains
  WHERE domain = v_domain
    AND verified = TRUE
  LIMIT 1;
  
  RETURN v_org_id;
END;
$$;

-- Function to accept invite and join organization
CREATE OR REPLACE FUNCTION public.accept_organization_invite(p_invite_token TEXT, p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite RECORD;
  v_user_email TEXT;
BEGIN
  -- Get user email
  SELECT email INTO v_user_email FROM auth.users WHERE id = p_user_id;
  
  -- Get invite details
  SELECT * INTO v_invite
  FROM public.organization_invites
  WHERE invite_token = p_invite_token
    AND status = 'pending'
    AND expires_at > NOW();
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired invite');
  END IF;
  
  -- Check email matches
  IF v_invite.email != v_user_email THEN
    RETURN jsonb_build_object('success', false, 'error', 'Email does not match invite');
  END IF;
  
  -- Update user's organization
  UPDATE public.profiles
  SET organization_id = v_invite.organization_id
  WHERE id = p_user_id;
  
  -- Assign role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (p_user_id, v_invite.role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Mark invite as accepted
  UPDATE public.organization_invites
  SET status = 'accepted', accepted_at = NOW()
  WHERE id = v_invite.id;
  
  RETURN jsonb_build_object(
    'success', true,
    'organization_id', v_invite.organization_id,
    'role', v_invite.role
  );
END;
$$;

-- Modify handle_new_user to check for domain-based org or invites
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_org_id UUID;
  domain_org_id UUID;
  pending_invite RECORD;
BEGIN
  -- Check for pending invite
  SELECT * INTO pending_invite
  FROM public.organization_invites
  WHERE email = NEW.email
    AND status = 'pending'
    AND expires_at > NOW()
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- If invite exists, use that organization
  IF FOUND THEN
    new_org_id := pending_invite.organization_id;
    
    -- Create profile with invited organization
    INSERT INTO public.profiles (id, email, full_name, organization_id)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      new_org_id
    );
    
    -- Assign invited role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, pending_invite.role);
    
    -- Mark invite as accepted
    UPDATE public.organization_invites
    SET status = 'accepted', accepted_at = NOW()
    WHERE id = pending_invite.id;
    
  ELSE
    -- Check for verified domain match
    domain_org_id := public.find_org_by_email_domain(NEW.email);
    
    IF domain_org_id IS NOT NULL THEN
      -- Join existing organization by domain
      new_org_id := domain_org_id;
      
      INSERT INTO public.profiles (id, email, full_name, organization_id)
      VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        new_org_id
      );
      
      -- Assign default analyst role
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, 'analyst');
      
    ELSE
      -- Create new organization for individual user
      INSERT INTO public.organizations (name, country_code)
      VALUES (
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email) || '''s Organization',
        'US'
      )
      RETURNING id INTO new_org_id;
      
      INSERT INTO public.profiles (id, email, full_name, organization_id)
      VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        new_org_id
      );
      
      -- Assign admin role to first user of new org
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, 'admin');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create indexes for performance
CREATE INDEX idx_organization_domains_domain ON public.organization_domains(domain) WHERE verified = TRUE;
CREATE INDEX idx_organization_invites_email ON public.organization_invites(email) WHERE status = 'pending';
CREATE INDEX idx_organization_invites_token ON public.organization_invites(invite_token);
CREATE INDEX idx_sso_connections_org ON public.sso_connections(organization_id) WHERE enabled = TRUE;