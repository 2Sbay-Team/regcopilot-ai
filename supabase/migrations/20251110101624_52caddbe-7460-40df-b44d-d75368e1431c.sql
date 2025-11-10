-- Add additional organization profile fields
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS company_size TEXT;