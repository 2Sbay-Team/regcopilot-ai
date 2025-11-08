-- Fix profiles table RLS to restrict access to same organization
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view profiles in their organization"
ON public.profiles
FOR SELECT
TO authenticated
USING (organization_id = get_user_organization_id(auth.uid()));
