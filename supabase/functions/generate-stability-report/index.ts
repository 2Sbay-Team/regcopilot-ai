import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const reportTimestamp = new Date().toISOString();

    // 1. Gather health check summary (last 24h)
    const { data: healthChecks } = await supabase
      .from('system_health_checks')
      .select('status, component')
      .gte('checked_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const healthSummary = {
      total: healthChecks?.length || 0,
      healthy: healthChecks?.filter((h) => h.status === 'healthy').length || 0,
      warnings: healthChecks?.filter((h) => h.status === 'warning').length || 0,
      critical: healthChecks?.filter((h) => h.status === 'critical').length || 0,
    };

    // 2. Security audit summary
    const { data: securityFindings } = await supabase
      .from('security_audit_logs')
      .select('severity, remediation_status, auto_fixed')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const securitySummary = {
      total: securityFindings?.length || 0,
      critical: securityFindings?.filter((f) => f.severity === 'critical').length || 0,
      auto_fixed: securityFindings?.filter((f) => f.auto_fixed).length || 0,
      pending: securityFindings?.filter((f) => f.remediation_status === 'pending').length || 0,
    };

    // 3. RLS validation summary
    const { data: rlsChecks } = await supabase
      .from('rls_validation_logs')
      .select('*')
      .order('validated_at', { ascending: false })
      .limit(1);

    const rlsSummary = {
      tables_checked: rlsChecks?.[0] ? 1 : 0,
      tables_with_issues: rlsChecks?.[0]?.issues_found?.length || 0,
    };

    // 4. RAG accuracy summary
    const { data: ragTests } = await supabase
      .from('rag_accuracy_metrics')
      .select('passed')
      .gte('tested_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const ragSummary = {
      total_tests: ragTests?.length || 0,
      passed: ragTests?.filter((r) => r.passed).length || 0,
      pass_rate: ragTests?.length ? (ragTests.filter((r) => r.passed).length / ragTests.length) * 100 : 0,
    };

    // 5. Performance metrics
    const { data: perfChecks } = await supabase
      .from('system_health_checks')
      .select('latency_ms')
      .not('latency_ms', 'is', null)
      .gte('checked_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const latencies = perfChecks?.map((p) => p.latency_ms).filter((l) => l) || [];
    const p95Latency = latencies.length
      ? latencies.sort((a, b) => a - b)[Math.floor(latencies.length * 0.95)]
      : 0;

    const perfSummary = {
      p95_latency_ms: p95Latency,
      avg_latency_ms: latencies.length ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0,
    };

    // Calculate overall readiness score (0-100)
    const readinessScore = Math.round(
      (healthSummary.healthy / Math.max(healthSummary.total, 1)) * 40 +
        (1 - securitySummary.critical / Math.max(securitySummary.total, 1)) * 30 +
        (ragSummary.pass_rate / 100) * 20 +
        (p95Latency < 2000 ? 10 : 0)
    );

    const issuesFound =
      healthSummary.critical + healthSummary.warnings + securitySummary.critical + securitySummary.pending;
    const autoFixesApplied = securitySummary.auto_fixed;

    const reportStatus = readinessScore >= 90 ? 'stable' : readinessScore >= 70 ? 'warning' : 'critical';

    const reportData = {
      timestamp: reportTimestamp,
      readiness_score: readinessScore,
      health_summary: healthSummary,
      security_summary: securitySummary,
      rls_summary: rlsSummary,
      rag_summary: ragSummary,
      performance_summary: perfSummary,
    };

    // Store report
    const { error: insertError } = await supabase.from('stability_reports').insert({
      report_type: 'daily_stability',
      status: reportStatus,
      metrics: reportData,
      issues_found: issuesFound,
      auto_fixes_applied: autoFixesApplied,
    });

    if (insertError) {
      console.error('Failed to store stability report:', insertError);
    }

    return new Response(
      JSON.stringify({
        ...reportData,
        status: reportStatus,
        issues_found: issuesFound,
        auto_fixes_applied: autoFixesApplied,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Stability report error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
