-- Enable vector extension in extensions schema (if not already there)
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Grant usage on extensions schema to authenticated users
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO anon;

-- Ensure the vector type is accessible in public schema by creating a type alias
-- This allows tables in public schema to use vector type without schema qualification
DO $$ 
BEGIN
  -- Drop existing domain if it exists
  DROP DOMAIN IF EXISTS public.vector CASCADE;
  
  -- Create domain in public schema that references the extensions.vector type
  -- Note: We cannot create a true type alias in PostgreSQL, but we can ensure
  -- the search_path includes extensions schema or use explicit schema qualification
  
  -- Set search_path to include extensions schema for all roles
  ALTER DATABASE postgres SET search_path TO public, extensions;
END $$;

-- Verify document_chunks table can use vector type
-- If the table was created before, we need to ensure it uses the correct type
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'document_chunks'
  ) THEN
    -- Recreate the embedding column with explicit schema reference
    ALTER TABLE public.document_chunks 
      ALTER COLUMN embedding TYPE extensions.vector(1536);
  END IF;
END $$;