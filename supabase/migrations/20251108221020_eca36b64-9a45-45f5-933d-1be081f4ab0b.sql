-- Fix search_path for prevent_organization_change function
CREATE OR REPLACE FUNCTION prevent_organization_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.organization_id IS DISTINCT FROM NEW.organization_id THEN
    RAISE EXCEPTION 'Cannot change organization_id after user creation';
  END IF;
  RETURN NEW;
END;
$$;