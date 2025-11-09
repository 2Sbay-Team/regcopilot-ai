-- Add RLS policies for ESG documents bucket to allow uploads

-- Allow authenticated users to upload their own organization's documents
CREATE POLICY "Users can upload ESG documents for their organization"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'esg-documents' 
  AND (storage.foldername(name))[1] = (
    SELECT organization_id::text 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- Allow authenticated users to read their own organization's documents
CREATE POLICY "Users can read ESG documents from their organization"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'esg-documents'
  AND (storage.foldername(name))[1] = (
    SELECT organization_id::text 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- Allow authenticated users to update their own organization's documents
CREATE POLICY "Users can update ESG documents for their organization"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'esg-documents'
  AND (storage.foldername(name))[1] = (
    SELECT organization_id::text 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- Allow authenticated users to delete their own organization's documents
CREATE POLICY "Users can delete ESG documents for their organization"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'esg-documents'
  AND (storage.foldername(name))[1] = (
    SELECT organization_id::text 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);