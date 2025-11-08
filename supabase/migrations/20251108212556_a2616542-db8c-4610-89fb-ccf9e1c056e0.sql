-- Add RLS policies to ai_act_checks table
ALTER TABLE public.ai_act_checks ENABLE ROW LEVEL SECURITY;

-- Allow users to view checks for assessments in their organization
CREATE POLICY "Users can view checks for their organization's assessments"
ON public.ai_act_checks
FOR SELECT
TO authenticated
USING (
  assessment_id IN (
    SELECT aa.id
    FROM public.ai_act_assessments aa
    JOIN public.ai_systems ais ON aa.ai_system_id = ais.id
    WHERE ais.organization_id = get_user_organization_id(auth.uid())
  )
);

-- Allow analysts and admins to create checks for their organization's assessments
CREATE POLICY "Analysts can create checks for their organization's assessments"
ON public.ai_act_checks
FOR INSERT
TO authenticated
WITH CHECK (
  (has_role(auth.uid(), 'analyst'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  AND assessment_id IN (
    SELECT aa.id
    FROM public.ai_act_assessments aa
    JOIN public.ai_systems ais ON aa.ai_system_id = ais.id
    WHERE ais.organization_id = get_user_organization_id(auth.uid())
  )
);

-- Allow analysts and admins to update checks for their organization's assessments
CREATE POLICY "Analysts can update checks for their organization's assessments"
ON public.ai_act_checks
FOR UPDATE
TO authenticated
USING (
  (has_role(auth.uid(), 'analyst'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  AND assessment_id IN (
    SELECT aa.id
    FROM public.ai_act_assessments aa
    JOIN public.ai_systems ais ON aa.ai_system_id = ais.id
    WHERE ais.organization_id = get_user_organization_id(auth.uid())
  )
);