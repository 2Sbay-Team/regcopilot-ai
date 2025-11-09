-- Create enum for agent task types
CREATE TYPE public.agent_task_type AS ENUM (
  'ai_act_audit',
  'gdpr_scan',
  'esg_analysis',
  'nis2_assessment',
  'dora_assessment',
  'dma_assessment'
);

-- Create enum for agent task status
CREATE TYPE public.agent_task_status AS ENUM (
  'pending',
  'in_progress',
  'completed',
  'failed',
  'cancelled'
);

-- Agent queue table for task orchestration
CREATE TABLE public.agent_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  task_type public.agent_task_type NOT NULL,
  priority INTEGER DEFAULT 5, -- 1 (highest) to 10 (lowest)
  status public.agent_task_status DEFAULT 'pending' NOT NULL,
  payload JSONB NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  result JSONB,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent task history for audit trail
CREATE TABLE public.agent_task_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.agent_queue(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  task_type public.agent_task_type NOT NULL,
  status public.agent_task_status NOT NULL,
  payload JSONB NOT NULL,
  result JSONB,
  error_message TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.agent_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_task_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agent_queue
CREATE POLICY "Users can view their organization's agent tasks"
ON public.agent_queue FOR SELECT
USING (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "Users can create agent tasks for their organization"
ON public.agent_queue FOR INSERT
WITH CHECK (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "Users can update their organization's agent tasks"
ON public.agent_queue FOR UPDATE
USING (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "Admins can delete agent tasks"
ON public.agent_queue FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for agent_task_history
CREATE POLICY "Users can view their organization's task history"
ON public.agent_task_history FOR SELECT
USING (organization_id = public.get_user_organization_id(auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_agent_queue_status ON public.agent_queue(status);
CREATE INDEX idx_agent_queue_scheduled ON public.agent_queue(scheduled_for) WHERE status = 'pending';
CREATE INDEX idx_agent_queue_org_status ON public.agent_queue(organization_id, status);
CREATE INDEX idx_agent_task_history_task_id ON public.agent_task_history(task_id);
CREATE INDEX idx_agent_task_history_org ON public.agent_task_history(organization_id);

-- Trigger for updated_at
CREATE TRIGGER update_agent_queue_updated_at
BEFORE UPDATE ON public.agent_queue
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to archive completed tasks to history
CREATE OR REPLACE FUNCTION public.archive_completed_agent_task()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Archive to history when task is completed or failed
  IF NEW.status IN ('completed', 'failed') AND OLD.status != NEW.status THEN
    INSERT INTO public.agent_task_history (
      task_id,
      organization_id,
      task_type,
      status,
      payload,
      result,
      error_message,
      execution_time_ms
    ) VALUES (
      NEW.id,
      NEW.organization_id,
      NEW.task_type,
      NEW.status,
      NEW.payload,
      NEW.result,
      NEW.error_message,
      EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at)) * 1000
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger to archive completed tasks
CREATE TRIGGER archive_agent_task_on_completion
AFTER UPDATE ON public.agent_queue
FOR EACH ROW
EXECUTE FUNCTION public.archive_completed_agent_task();

-- Function to auto-queue document analysis tasks
CREATE OR REPLACE FUNCTION public.auto_queue_document_analysis()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  org_id UUID;
BEGIN
  -- Get organization_id from the bucket path or metadata
  -- Assuming bucket structure: org_id/filename
  org_id := (NEW.path_tokens[1])::UUID;
  
  -- Queue GDPR scan for documents in gdpr-documents bucket
  IF NEW.bucket_id = 'gdpr-documents' THEN
    INSERT INTO public.agent_queue (
      organization_id,
      task_type,
      priority,
      payload
    ) VALUES (
      org_id,
      'gdpr_scan',
      3,
      jsonb_build_object(
        'file_path', NEW.name,
        'bucket', NEW.bucket_id,
        'trigger', 'auto_document_upload'
      )
    );
  END IF;
  
  -- Queue ESG analysis for documents in esg-documents bucket
  IF NEW.bucket_id = 'esg-documents' THEN
    INSERT INTO public.agent_queue (
      organization_id,
      task_type,
      priority,
      payload
    ) VALUES (
      org_id,
      'esg_analysis',
      3,
      jsonb_build_object(
        'file_path', NEW.name,
        'bucket', NEW.bucket_id,
        'trigger', 'auto_document_upload'
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger on storage.objects for auto-queuing
CREATE TRIGGER on_document_upload
AFTER INSERT ON storage.objects
FOR EACH ROW
EXECUTE FUNCTION public.auto_queue_document_analysis();