import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('[job-scheduler] Starting scheduled job runner');

    // Find jobs that are due to run
    const { data: dueJobs, error: fetchError } = await supabase
      .from('scheduled_jobs')
      .select('*')
      .eq('enabled', true)
      .lte('next_run_at', new Date().toISOString())
      .is('last_run_status', null)
      .or('last_run_status.neq.running');

    if (fetchError) {
      console.error('[job-scheduler] Error fetching jobs:', fetchError);
      throw fetchError;
    }

    console.log(`[job-scheduler] Found ${dueJobs?.length || 0} jobs to execute`);

    const results = [];

    for (const job of dueJobs || []) {
      const executionId = crypto.randomUUID();
      const startTime = Date.now();

      console.log(`[job-scheduler] Executing job: ${job.job_name} (${job.id})`);

      // Create execution history record
      await supabase.from('job_execution_history').insert({
        id: executionId,
        job_id: job.id,
        organization_id: job.organization_id,
        status: 'running',
        started_at: new Date().toISOString(),
      });

      // Update job status
      await supabase
        .from('scheduled_jobs')
        .update({ last_run_status: 'running', last_run_at: new Date().toISOString() })
        .eq('id', job.id);

      try {
        // Invoke the edge function
        const { data: funcData, error: funcError } = await supabase.functions.invoke(
          job.edge_function,
          {
            body: job.payload || {},
          }
        );

        const executionTime = Date.now() - startTime;

        if (funcError) {
          throw funcError;
        }

        // Update execution history - success
        await supabase
          .from('job_execution_history')
          .update({
            status: 'success',
            completed_at: new Date().toISOString(),
            result: funcData,
            execution_time_ms: executionTime,
          })
          .eq('id', executionId);

        // Calculate next run time (simple: add 1 day for daily jobs)
        const nextRun = new Date();
        nextRun.setDate(nextRun.getDate() + 1);

        // Update job status
        await supabase
          .from('scheduled_jobs')
          .update({
            last_run_status: 'success',
            next_run_at: nextRun.toISOString(),
            retry_count: 0,
          })
          .eq('id', job.id);

        results.push({
          job_id: job.id,
          job_name: job.job_name,
          status: 'success',
          execution_time_ms: executionTime,
        });

        console.log(`[job-scheduler] Job ${job.job_name} completed successfully in ${executionTime}ms`);

      } catch (error) {
        const executionTime = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        console.error(`[job-scheduler] Job ${job.job_name} failed:`, errorMessage);

        // Update execution history - failed
        await supabase
          .from('job_execution_history')
          .update({
            status: 'failed',
            completed_at: new Date().toISOString(),
            error_message: errorMessage,
            execution_time_ms: executionTime,
          })
          .eq('id', executionId);

        // Update job status with retry logic
        const newRetryCount = (job.retry_count || 0) + 1;
        const shouldRetry = newRetryCount < job.max_retries;

        await supabase
          .from('scheduled_jobs')
          .update({
            last_run_status: 'failed',
            retry_count: newRetryCount,
            next_run_at: shouldRetry ? new Date(Date.now() + 3600000).toISOString() : job.next_run_at,
          })
          .eq('id', job.id);

        results.push({
          job_id: job.id,
          job_name: job.job_name,
          status: 'failed',
          error: errorMessage,
          retry_count: newRetryCount,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        jobs_executed: results.length,
        results,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[job-scheduler] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});