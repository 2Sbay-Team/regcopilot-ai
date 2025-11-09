-- Create storage bucket for regulatory documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('regulatory-documents', 'regulatory-documents', false);

-- RLS policies for regulatory-documents bucket
CREATE POLICY "Admins can upload regulatory documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'regulatory-documents' 
  AND has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can view regulatory documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'regulatory-documents'
  AND has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete regulatory documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'regulatory-documents'
  AND has_role(auth.uid(), 'admin')
);

-- Create table to track regulation versions
CREATE TABLE IF NOT EXISTS public.regulation_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  regulation_type TEXT NOT NULL, -- 'eu_ai_act', 'gdpr', 'csrd', etc.
  version TEXT NOT NULL,
  file_path TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'processing', -- 'processing', 'active', 'archived', 'failed'
  chunks_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.regulation_versions ENABLE ROW LEVEL SECURITY;

-- RLS policies for regulation_versions
CREATE POLICY "Admins can manage regulation versions"
ON public.regulation_versions
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view active regulations"
ON public.regulation_versions
FOR SELECT
TO authenticated
USING (status = 'active');