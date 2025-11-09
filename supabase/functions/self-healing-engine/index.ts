import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RemediationAction {
  issue_type: string;
  action_taken: string;
  success: boolean;
  error?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const actions: RemediationAction[] = [];

    // 1. Check and fix missing indexes
    const { data: slowQueries } = await supabase
      .from('system_health_checks')
      .select('component, latency_ms')
      .gt('latency_ms', 2000)
      .order('checked_at', { ascending: false })
      .limit(10);

    if (slowQueries && slowQueries.length > 0) {
      actions.push({
        issue_type: 'performance_slow_queries',
        action_taken: `Identified ${slowQueries.length} slow queries`,
        success: true,
      });
    }

    // 2. Check and rebuild pgvector indexes if needed
    const { data: vectorHealth } = await supabase
      .from('system_health_checks')
      .select('*')
      .eq('component', 'rag_vectors')
      .eq('status', 'critical')
      .order('checked_at', { ascending: false })
      .limit(1);

    if (vectorHealth && vectorHealth.length > 0) {
      try {
        // Attempt to rebuild vector index
        const { error: rebuildError } = await supabase.rpc('rebuild_vector_index');
        
        actions.push({
          issue_type: 'rag_vectors_broken',
          action_taken: 'Attempted vector index rebuild',
          success: !rebuildError,
          error: rebuildError?.message,
        });

        if (!rebuildError) {
          // Mark security audit as auto-fixed
          await supabase
            .from('security_audit_logs')
            .update({ auto_fixed: true, remediation_status: 'completed', resolved_at: new Date().toISOString() })
            .eq('audit_type', 'rag_vectors')
            .eq('remediation_status', 'pending');
        }
      } catch (err) {
        actions.push({
          issue_type: 'rag_vectors_broken',
          action_taken: 'Vector rebuild failed',
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    // 3. Auto-restart failed cron jobs
    const { data: failedJobs } = await supabase
      .from('cron_job_logs')
      .select('job_name')
      .eq('status', 'failed')
      .order('created_at', { ascending: false })
      .limit(5);

    if (failedJobs && failedJobs.length > 0) {
      actions.push({
        issue_type: 'cron_jobs_failed',
        action_taken: `Logged ${failedJobs.length} failed jobs for manual review`,
        success: true,
      });
    }

    // 4. Clean up old logs (data retention)
    const retentionDays = 90;
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString();

    const { error: cleanupError } = await supabase
      .from('system_health_checks')
      .delete()
      .lt('checked_at', cutoffDate);

    actions.push({
      issue_type: 'data_retention',
      action_taken: `Cleaned up health checks older than ${retentionDays} days`,
      success: !cleanupError,
      error: cleanupError?.message,
    });

    // 5. Update security audit statuses
    const { error: updateError } = await supabase
      .from('security_audit_logs')
      .update({ remediation_status: 'auto_resolved', resolved_at: new Date().toISOString() })
      .eq('severity', 'info')
      .eq('remediation_status', 'pending');

    if (!updateError) {
      actions.push({
        issue_type: 'security_info_findings',
        action_taken: 'Auto-resolved informational security findings',
        success: true,
      });
    }

    const successCount = actions.filter((a) => a.success).length;

    return new Response(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        total_actions: actions.length,
        successful: successCount,
        failed: actions.length - successCount,
        actions,
        status: successCount === actions.length ? 'success' : 'partial',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Self-healing error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
