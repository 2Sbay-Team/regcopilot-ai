-- Update handle_new_user trigger to assign default 'analyst' role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- Assign default 'analyst' role to new users
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'analyst');
  
  RETURN NEW;
END;
$$;

-- Enable RLS on dsar_responses table
ALTER TABLE public.dsar_responses ENABLE ROW LEVEL SECURITY;

-- RLS policies for dsar_responses (scope by organization through dsar_requests)
CREATE POLICY "Users can view their organization's DSAR responses"
ON public.dsar_responses
FOR SELECT
TO authenticated
USING (
  request_id IN (
    SELECT id FROM public.dsar_requests
    WHERE organization_id = get_user_organization_id(auth.uid())
  )
);

CREATE POLICY "Analysts can create DSAR responses"
ON public.dsar_responses
FOR INSERT
TO authenticated
WITH CHECK (
  (has_role(auth.uid(), 'analyst') OR has_role(auth.uid(), 'admin'))
  AND request_id IN (
    SELECT id FROM public.dsar_requests
    WHERE organization_id = get_user_organization_id(auth.uid())
  )
);

CREATE POLICY "Analysts can update DSAR responses"
ON public.dsar_responses
FOR UPDATE
TO authenticated
USING (
  (has_role(auth.uid(), 'analyst') OR has_role(auth.uid(), 'admin'))
  AND request_id IN (
    SELECT id FROM public.dsar_requests
    WHERE organization_id = get_user_organization_id(auth.uid())
  )
);

-- Enable RLS on model_datasets table
ALTER TABLE public.model_datasets ENABLE ROW LEVEL SECURITY;

-- RLS policies for model_datasets (scope by organization through ml_models)
CREATE POLICY "Users can view their organization's model datasets"
ON public.model_datasets
FOR SELECT
TO authenticated
USING (
  model_id IN (
    SELECT id FROM public.ml_models
    WHERE organization_id = get_user_organization_id(auth.uid())
  )
);

CREATE POLICY "Analysts can manage model datasets"
ON public.model_datasets
FOR ALL
TO authenticated
USING (
  (has_role(auth.uid(), 'analyst') OR has_role(auth.uid(), 'admin'))
  AND model_id IN (
    SELECT id FROM public.ml_models
    WHERE organization_id = get_user_organization_id(auth.uid())
  )
);