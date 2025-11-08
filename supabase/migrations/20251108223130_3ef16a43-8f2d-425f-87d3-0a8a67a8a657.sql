-- Add vector similarity search function
CREATE OR REPLACE FUNCTION match_regulatory_chunks(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  content text,
  section text,
  source text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    document_chunks.id,
    document_chunks.content,
    document_chunks.metadata->>'section' as section,
    document_chunks.metadata->>'source' as source,
    1 - (document_chunks.embedding <=> query_embedding) as similarity
  FROM document_chunks
  WHERE 1 - (document_chunks.embedding <=> query_embedding) > match_threshold
  ORDER BY document_chunks.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Add trigger for hash chain in audit logs (if not exists)
CREATE OR REPLACE FUNCTION compute_audit_chain()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  last_hash text;
BEGIN
  -- Get the last output_hash for this organization
  SELECT output_hash INTO last_hash
  FROM audit_logs
  WHERE organization_id = NEW.organization_id
  ORDER BY timestamp DESC
  LIMIT 1;
  
  -- Set prev_hash to last hash or zeros if first entry
  IF last_hash IS NULL THEN
    NEW.prev_hash := repeat('0', 64);
  ELSE
    NEW.prev_hash := last_hash;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'audit_chain_trigger'
  ) THEN
    CREATE TRIGGER audit_chain_trigger
    BEFORE INSERT ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION compute_audit_chain();
  END IF;
END $$;