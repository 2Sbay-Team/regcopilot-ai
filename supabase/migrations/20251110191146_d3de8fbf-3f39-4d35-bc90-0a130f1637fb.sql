-- Create QA test tracking tables
CREATE TABLE IF NOT EXISTS public.qa_test_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  total_tests INTEGER DEFAULT 0,
  passed INTEGER DEFAULT 0,
  failed INTEGER DEFAULT 0,
  avg_latency_ms INTEGER,
  notes TEXT,
  triggered_by TEXT DEFAULT 'scheduled'
);

CREATE TABLE IF NOT EXISTS public.qa_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID REFERENCES public.qa_test_runs(id) ON DELETE CASCADE,
  module TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pass', 'fail', 'skip')),
  latency_ms INTEGER,
  message TEXT,
  output_hash TEXT,
  expected_output TEXT,
  actual_output TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create regulation sync tracking table
CREATE TABLE IF NOT EXISTS public.regulation_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  regulation_type TEXT NOT NULL,
  source_url TEXT NOT NULL,
  checksum TEXT,
  chunks_created INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.qa_test_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qa_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regulation_sync_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for QA tables (admin only for writes, authenticated for reads)
CREATE POLICY "Admins can manage QA test runs"
  ON public.qa_test_runs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can view QA test runs"
  ON public.qa_test_runs
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage QA test results"
  ON public.qa_test_results
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can view QA test results"
  ON public.qa_test_results
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage regulation sync logs"
  ON public.regulation_sync_logs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can view regulation sync logs"
  ON public.regulation_sync_logs
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_qa_test_runs_started_at ON public.qa_test_runs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_qa_test_results_run_id ON public.qa_test_results(run_id);
CREATE INDEX IF NOT EXISTS idx_qa_test_results_status ON public.qa_test_results(status);
CREATE INDEX IF NOT EXISTS idx_regulation_sync_logs_started_at ON public.regulation_sync_logs(started_at DESC);