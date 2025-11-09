-- Create storage bucket for synced files from connectors
INSERT INTO storage.buckets (id, name, public)
VALUES ('connector-synced-files', 'connector-synced-files', false);

-- RLS policy: Users can view their organization's synced files
CREATE POLICY "Users can view their organization's synced files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'connector-synced-files' 
  AND (storage.foldername(name))[1] IN (
    SELECT organization_id::text 
    FROM profiles 
    WHERE id = auth.uid()
  )
);

-- RLS policy: Service role can manage synced files
CREATE POLICY "Service role can manage synced files"
ON storage.objects FOR ALL
USING (bucket_id = 'connector-synced-files')
WITH CHECK (bucket_id = 'connector-synced-files');