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

    const { organizationId } = await req.json().catch(() => ({ organizationId: null }));

    console.log('[system-health] Collecting system metrics');

    const startTime = Date.now();

    // Collect various metrics
    const metrics = [];

    // 1. Database response time
    const dbStart = Date.now();
    await supabase.from('organizations').select('id').limit(1);
    const dbLatency = Date.now() - dbStart;
    metrics.push({
      metric_type: 'database_latency',
      metric_value: dbLatency,
      organization_id: organizationId,
      metadata: { unit: 'ms' },
    });

    // 2. Queue length
    const { count: queueCount } = await supabase
      .from('agent_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    metrics.push({
      metric_type: 'queue_length',
      metric_value: queueCount || 0,
      organization_id: organizationId,
      metadata: { status: 'pending' },
    });

    // 3. Failed jobs in last hour
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const { count: failedJobCount } = await supabase
      .from('job_execution_history')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'failed')
      .gte('created_at', oneHourAgo);

    metrics.push({
      metric_type: 'failed_jobs',
      metric_value: failedJobCount || 0,
      organization_id: organizationId,
      metadata: { timeframe: '1_hour' },
    });

    // 4. API call volume (last hour)
    const { count: apiCallCount } = await supabase
      .from('model_usage_logs')
      .select('*', { count: 'exact', head: true })
      .gte('timestamp', oneHourAgo);

    metrics.push({
      metric_type: 'api_calls',
      metric_value: apiCallCount || 0,
      organization_id: organizationId,
      metadata: { timeframe: '1_hour' },
    });

    // 5. Audit chain integrity
    const { data: auditLogs } = await supabase
      .from('audit_logs')
      .select('prev_hash, output_hash')
      .order('timestamp', { ascending: true })
      .limit(100);

    let chainIntegrity = 1.0;
    if (auditLogs && auditLogs.length > 1) {
      for (let i = 1; i < auditLogs.length; i++) {
        if (auditLogs[i].prev_hash !== auditLogs[i - 1].output_hash) {
          chainIntegrity = 0.0;
          break;
        }
      }
    }

    metrics.push({
      metric_type: 'audit_chain_integrity',
      metric_value: chainIntegrity,
      organization_id: organizationId,
      metadata: { checked_logs: auditLogs?.length || 0 },
    });

    // 6. Storage usage (estimate)
    const { data: storageFiles } = await supabase
      .storage
      .from('gdpr-documents')
      .list();

    metrics.push({
      metric_type: 'storage_documents',
      metric_value: storageFiles?.length || 0,
      organization_id: organizationId,
      metadata: { bucket: 'gdpr-documents' },
    });

    // Store all metrics
    const { error: metricsError } = await supabase
      .from('system_metrics')
      .insert(metrics);

    if (metricsError) {
      console.error('[system-health] Error storing metrics:', metricsError);
    }

    const totalTime = Date.now() - startTime;

    // Calculate health score
    const healthScore = calculateHealthScore(metrics);

    return new Response(
      JSON.stringify({
        success: true,
        health_score: healthScore,
        metrics: metrics.reduce((acc, m) => {
          acc[m.metric_type] = {
            value: m.metric_value,
            metadata: m.metadata,
          };
          return acc;
        }, {} as Record<string, any>),
        collection_time_ms: totalTime,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[system-health] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function calculateHealthScore(metrics: any[]): number {
  let score = 100;

  const dbLatency = metrics.find(m => m.metric_type === 'database_latency')?.metric_value || 0;
  if (dbLatency > 1000) score -= 20;
  else if (dbLatency > 500) score -= 10;

  const queueLength = metrics.find(m => m.metric_type === 'queue_length')?.metric_value || 0;
  if (queueLength > 100) score -= 20;
  else if (queueLength > 50) score -= 10;

  const failedJobs = metrics.find(m => m.metric_type === 'failed_jobs')?.metric_value || 0;
  if (failedJobs > 10) score -= 30;
  else if (failedJobs > 5) score -= 15;

  const chainIntegrity = metrics.find(m => m.metric_type === 'audit_chain_integrity')?.metric_value || 1;
  if (chainIntegrity < 1.0) score -= 50;

  return Math.max(0, score);
}