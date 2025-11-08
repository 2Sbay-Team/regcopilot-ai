-- Fix function search path security issues
-- Update match_regulatory_chunks function to have immutable search_path
CREATE OR REPLACE FUNCTION public.match_regulatory_chunks(
  query_embedding extensions.vector, 
  match_threshold double precision DEFAULT 0.7, 
  match_count integer DEFAULT 5
)
RETURNS TABLE(
  id uuid, 
  content text, 
  section text, 
  source text, 
  similarity double precision
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $function$
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
$function$;