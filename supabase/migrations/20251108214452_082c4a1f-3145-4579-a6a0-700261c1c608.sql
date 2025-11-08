-- Create a default organization for existing users without one
INSERT INTO public.organizations (name, country_code)
SELECT 'Default Organization', 'US'
WHERE NOT EXISTS (SELECT 1 FROM public.organizations WHERE name = 'Default Organization');

-- Assign all profiles without organization to the default org
UPDATE public.profiles
SET organization_id = (SELECT id FROM public.organizations WHERE name = 'Default Organization' LIMIT 1)
WHERE organization_id IS NULL;

-- Make organization_id NOT NULL
ALTER TABLE public.profiles
ALTER COLUMN organization_id SET NOT NULL;

-- Add immutability constraint via trigger
CREATE OR REPLACE FUNCTION prevent_organization_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.organization_id IS DISTINCT FROM NEW.organization_id THEN
    RAISE EXCEPTION 'Cannot change organization_id after user creation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_org_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_organization_change();

-- Update handle_new_user to create organization per user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_org_id uuid;
BEGIN
  -- Create a new organization for each user
  INSERT INTO public.organizations (name, country_code)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email) || '''s Organization',
    'US'
  )
  RETURNING id INTO new_org_id;
  
  -- Create profile with organization
  INSERT INTO public.profiles (id, email, full_name, organization_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    new_org_id
  );
  
  -- Assign default 'analyst' role to new users
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'analyst');
  
  RETURN NEW;
END;
$$;

-- Enable RLS on explainability_views
ALTER TABLE public.explainability_views ENABLE ROW LEVEL SECURITY;

-- RLS policy for viewing explainability views based on assessment type
CREATE POLICY "Users can view their organization's explainability views"
ON public.explainability_views
FOR SELECT
TO authenticated
USING (
  CASE assessment_type
    WHEN 'ai_act' THEN
      assessment_id IN (
        SELECT aa.id FROM public.ai_act_assessments aa
        JOIN public.ai_systems ais ON aa.ai_system_id = ais.id
        WHERE ais.organization_id = get_user_organization_id(auth.uid())
      )
    WHEN 'gdpr' THEN
      assessment_id IN (
        SELECT id FROM public.gdpr_assessments
        WHERE organization_id = get_user_organization_id(auth.uid())
      )
    WHEN 'esg' THEN
      assessment_id IN (
        SELECT id FROM public.esg_reports
        WHERE organization_id = get_user_organization_id(auth.uid())
      )
    ELSE false
  END
);

-- Analysts can create explainability views
CREATE POLICY "Analysts can create explainability views"
ON public.explainability_views
FOR INSERT
TO authenticated
WITH CHECK (
  (has_role(auth.uid(), 'analyst') OR has_role(auth.uid(), 'admin'))
  AND (
    CASE assessment_type
      WHEN 'ai_act' THEN
        assessment_id IN (
          SELECT aa.id FROM public.ai_act_assessments aa
          JOIN public.ai_systems ais ON aa.ai_system_id = ais.id
          WHERE ais.organization_id = get_user_organization_id(auth.uid())
        )
      WHEN 'gdpr' THEN
        assessment_id IN (
          SELECT id FROM public.gdpr_assessments
          WHERE organization_id = get_user_organization_id(auth.uid())
        )
      WHEN 'esg' THEN
        assessment_id IN (
          SELECT id FROM public.esg_reports
          WHERE organization_id = get_user_organization_id(auth.uid())
        )
      ELSE false
    END
  )
);