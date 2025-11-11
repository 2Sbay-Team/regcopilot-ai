-- Add quality_score and processed_at to esg_data_lake
ALTER TABLE esg_data_lake 
ADD COLUMN IF NOT EXISTS quality_score NUMERIC,
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS processing_metadata JSONB;