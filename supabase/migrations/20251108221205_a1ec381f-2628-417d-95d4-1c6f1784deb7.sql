-- Create storage buckets for compliance documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('gdpr-documents', 'gdpr-documents', false, 20971520, ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/csv']),
  ('esg-documents', 'esg-documents', false, 20971520, ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv', 'application/vnd.ms-excel'])
ON CONFLICT (id) DO NOTHING;

-- RLS policies for GDPR documents bucket
CREATE POLICY "Users can view their org's GDPR documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'gdpr-documents' 
  AND (storage.foldername(name))[1] IN (
    SELECT organization_id::text FROM profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can upload GDPR documents to their org folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'gdpr-documents'
  AND (storage.foldername(name))[1] = (SELECT organization_id::text FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can delete their org's GDPR documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'gdpr-documents'
  AND (storage.foldername(name))[1] IN (
    SELECT organization_id::text FROM profiles WHERE id = auth.uid()
  )
);

-- RLS policies for ESG documents bucket
CREATE POLICY "Users can view their org's ESG documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'esg-documents'
  AND (storage.foldername(name))[1] IN (
    SELECT organization_id::text FROM profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can upload ESG documents to their org folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'esg-documents'
  AND (storage.foldername(name))[1] = (SELECT organization_id::text FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can delete their org's ESG documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'esg-documents'
  AND (storage.foldername(name))[1] IN (
    SELECT organization_id::text FROM profiles WHERE id = auth.uid()
  )
);