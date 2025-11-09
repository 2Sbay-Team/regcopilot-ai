-- Create storage buckets for document uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('ai-act-documents', 'ai-act-documents', false),
  ('gdpr-documents', 'gdpr-documents', false),
  ('esg-documents', 'esg-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for ai-act-documents
CREATE POLICY "Users can upload AI Act docs for their org"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'ai-act-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their org's AI Act docs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'ai-act-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for gdpr-documents (already exists, skip if duplicate)
CREATE POLICY "Users can upload GDPR docs for their org"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'gdpr-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their org's GDPR docs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'gdpr-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for esg-documents (already exists, skip if duplicate)
CREATE POLICY "Users can upload ESG docs for their org"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'esg-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their org's ESG docs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'esg-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create uploaded_documents table
CREATE TABLE IF NOT EXISTS public.uploaded_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  doc_type TEXT NOT NULL CHECK (doc_type IN ('ai_act', 'gdpr', 'esg')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  extracted_summary TEXT,
  extracted_data JSONB,
  file_size_bytes BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  analyzed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.uploaded_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for uploaded_documents
CREATE POLICY "Users can view their org's uploaded documents"
ON public.uploaded_documents FOR SELECT
USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Users can upload documents for their org"
ON public.uploaded_documents FOR INSERT
WITH CHECK (
  organization_id = get_user_organization_id(auth.uid())
  AND user_id = auth.uid()
);

CREATE POLICY "Service role can update document status"
ON public.uploaded_documents FOR UPDATE
USING (true);

-- Create upload_policies table
CREATE TABLE IF NOT EXISTS public.upload_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE UNIQUE,
  ai_act_enabled BOOLEAN DEFAULT TRUE,
  gdpr_enabled BOOLEAN DEFAULT TRUE,
  esg_enabled BOOLEAN DEFAULT TRUE,
  allowed_types TEXT[] DEFAULT ARRAY['pdf', 'docx', 'xlsx', 'doc', 'xls', 'csv'],
  allow_embeddings BOOLEAN DEFAULT TRUE,
  retention_days INTEGER DEFAULT 365,
  max_file_size_mb INTEGER DEFAULT 25,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id)
);

-- Enable RLS
ALTER TABLE public.upload_policies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for upload_policies
CREATE POLICY "Users can view their org's upload policies"
ON public.upload_policies FOR SELECT
USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Admins can manage upload policies"
ON public.upload_policies FOR ALL
USING (
  organization_id = get_user_organization_id(auth.uid())
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Initialize upload policies for existing organizations
INSERT INTO public.upload_policies (organization_id)
SELECT id FROM public.organizations
WHERE NOT EXISTS (
  SELECT 1 FROM public.upload_policies WHERE organization_id = organizations.id
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_uploaded_documents_org_id ON public.uploaded_documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_documents_doc_type ON public.uploaded_documents(doc_type);
CREATE INDEX IF NOT EXISTS idx_uploaded_documents_status ON public.uploaded_documents(status);
CREATE INDEX IF NOT EXISTS idx_upload_policies_org_id ON public.upload_policies(organization_id);

-- Trigger to update updated_at on upload_policies
CREATE OR REPLACE FUNCTION public.update_upload_policy_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_upload_policies_updated_at
BEFORE UPDATE ON public.upload_policies
FOR EACH ROW
EXECUTE FUNCTION public.update_upload_policy_timestamp();