-- Create enum for connector types
CREATE TYPE public.connector_type AS ENUM (
  'sap',
  'sharepoint',
  'onedrive',
  'aws_s3',
  'azure_blob',
  'jira',
  'slack',
  'teams',
  'linkedin',
  'glassdoor',
  'rss_feed'
);

-- Create enum for connector status
CREATE TYPE public.connector_status AS ENUM (
  'active',
  'inactive',
  'error',
  'configuring'
);

-- Create enum for sync frequency
CREATE TYPE public.sync_frequency AS ENUM (
  'realtime',
  'hourly',
  'daily',
  'weekly',
  'manual'
);

-- Connector configurations table
CREATE TABLE public.connectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  connector_type public.connector_type NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status public.connector_status DEFAULT 'configuring' NOT NULL,
  sync_frequency public.sync_frequency DEFAULT 'daily' NOT NULL,
  config JSONB NOT NULL, -- Connector-specific configuration
  credentials_ref TEXT, -- Reference to stored credentials in secrets
  last_sync_at TIMESTAMP WITH TIME ZONE,
  last_sync_status TEXT,
  last_error TEXT,
  sync_stats JSONB, -- Stats: files_synced, records_processed, etc.
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Connector sync history
CREATE TABLE public.connector_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connector_id UUID REFERENCES public.connectors(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL, -- 'running', 'completed', 'failed'
  records_processed INTEGER DEFAULT 0,
  records_created INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  error_message TEXT,
  metadata JSONB -- Connector-specific sync metadata
);

-- Data sources - tracks individual files/entities from connectors
CREATE TABLE public.data_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connector_id UUID REFERENCES public.connectors(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  source_type TEXT NOT NULL, -- 'file', 'record', 'message', etc.
  source_id TEXT NOT NULL, -- External ID from the connector
  source_name TEXT NOT NULL,
  source_path TEXT, -- Path or location in external system
  content_type TEXT,
  file_size BIGINT,
  checksum TEXT, -- For detecting changes
  metadata JSONB, -- Source-specific metadata
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  storage_path TEXT, -- Path in Supabase storage if file was copied
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(connector_id, source_id)
);

-- Enable RLS
ALTER TABLE public.connectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connector_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_sources ENABLE ROW LEVEL SECURITY;

-- RLS Policies for connectors
CREATE POLICY "Users can view their organization's connectors"
ON public.connectors FOR SELECT
USING (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "Admins can manage connectors"
ON public.connectors FOR ALL
USING (
  organization_id = public.get_user_organization_id(auth.uid()) 
  AND public.has_role(auth.uid(), 'admin')
);

-- RLS Policies for connector_sync_logs
CREATE POLICY "Users can view their organization's sync logs"
ON public.connector_sync_logs FOR SELECT
USING (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "Service role can manage sync logs"
ON public.connector_sync_logs FOR ALL
USING (true);

-- RLS Policies for data_sources
CREATE POLICY "Users can view their organization's data sources"
ON public.data_sources FOR SELECT
USING (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "Service role can manage data sources"
ON public.data_sources FOR ALL
USING (true);

-- Create indexes
CREATE INDEX idx_connectors_org ON public.connectors(organization_id);
CREATE INDEX idx_connectors_type ON public.connectors(connector_type);
CREATE INDEX idx_connectors_status ON public.connectors(status);
CREATE INDEX idx_connector_sync_logs_connector ON public.connector_sync_logs(connector_id);
CREATE INDEX idx_connector_sync_logs_org ON public.connector_sync_logs(organization_id);
CREATE INDEX idx_data_sources_connector ON public.data_sources(connector_id);
CREATE INDEX idx_data_sources_org ON public.data_sources(organization_id);
CREATE INDEX idx_data_sources_source_id ON public.data_sources(source_id);

-- Trigger for updated_at
CREATE TRIGGER update_connectors_updated_at
BEFORE UPDATE ON public.connectors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_data_sources_updated_at
BEFORE UPDATE ON public.data_sources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-queue connector sync tasks
CREATE OR REPLACE FUNCTION public.queue_connector_sync()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When a new data source is synced, queue appropriate analysis task
  IF NEW.processed_at IS NULL AND NEW.storage_path IS NOT NULL THEN
    -- Queue task based on content type or connector type
    INSERT INTO public.agent_queue (
      organization_id,
      task_type,
      priority,
      payload
    )
    SELECT
      NEW.organization_id,
      CASE
        WHEN NEW.content_type LIKE '%pdf%' OR NEW.content_type LIKE '%document%' THEN 'gdpr_scan'
        WHEN c.connector_type IN ('sharepoint', 'onedrive') THEN 'gdpr_scan'
        WHEN c.connector_type = 'jira' THEN 'ai_act_audit'
        ELSE 'gdpr_scan'
      END,
      4, -- Medium priority for synced data
      jsonb_build_object(
        'data_source_id', NEW.id,
        'file_path', NEW.storage_path,
        'source_name', NEW.source_name,
        'connector_type', c.connector_type,
        'trigger', 'connector_sync'
      )
    FROM public.connectors c
    WHERE c.id = NEW.connector_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-queue analysis when data is synced
CREATE TRIGGER on_data_source_synced
AFTER INSERT OR UPDATE ON public.data_sources
FOR EACH ROW
EXECUTE FUNCTION public.queue_connector_sync();