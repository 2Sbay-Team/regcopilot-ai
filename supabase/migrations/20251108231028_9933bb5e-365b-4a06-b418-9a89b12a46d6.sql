-- Create a table to track seeding progress
CREATE TABLE IF NOT EXISTS public.seeding_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  status text NOT NULL,
  current_step text,
  total_chunks integer DEFAULT 0,
  processed_chunks integer DEFAULT 0,
  progress_percentage numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.seeding_progress ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read seeding progress
CREATE POLICY "Anyone can read seeding progress"
  ON public.seeding_progress
  FOR SELECT
  USING (true);

-- Allow service role to insert/update
CREATE POLICY "Service role can manage seeding progress"
  ON public.seeding_progress
  FOR ALL
  USING (true);

-- Enable realtime for the seeding_progress table
ALTER PUBLICATION supabase_realtime ADD TABLE public.seeding_progress;