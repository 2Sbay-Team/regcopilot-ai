import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HealthCheckResult {
  component: string;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  latency_ms?: number;
  error_message?: string;
  metadata?: Record<string, any>;
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

    const results: HealthCheckResult[] = [];

    // 1. Check Database Connection
    const dbStart = Date.now();
    const { error: dbError } = await supabase.from('organizations').select('count').limit(1);
    results.push({
      component: 'database',
      status: dbError ? 'critical' : 'healthy',
      latency_ms: Date.now() - dbStart,
      error_message: dbError?.message,
    });

    // 2. Check Edge Functions (sample key functions)
    const functionsToCheck = [
      'ai-act-auditor',
      'gdpr-checker',
      'esg-reporter',
      'rag-search',
    ];

    for (const fn of functionsToCheck) {
      const fnStart = Date.now();
      try {
        const { error: fnError } = await supabase.functions.invoke(fn, {
          body: { healthCheck: true },
        });
        const latency = Date.now() - fnStart;
        results.push({
          component: `edge_function_${fn}`,
          status: fnError ? 'warning' : latency > 2000 ? 'warning' : 'healthy',
          latency_ms: latency,
          error_message: fnError?.message,
          metadata: { function_name: fn },
        });
      } catch (err) {
        results.push({
          component: `edge_function_${fn}`,
          status: 'critical',
          latency_ms: Date.now() - fnStart,
          error_message: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    // 3. Check Storage Buckets
    const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
    results.push({
      component: 'storage',
      status: storageError ? 'warning' : 'healthy',
      error_message: storageError?.message,
      metadata: { bucket_count: buckets?.length || 0 },
    });

    // 4. Check Auth System
    const authStart = Date.now();
    const { error: authError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
    results.push({
      component: 'auth',
      status: authError ? 'warning' : 'healthy',
      latency_ms: Date.now() - authStart,
      error_message: authError?.message,
    });

    // 5. Check pgvector / RAG embeddings
    const { data: vectorCheck, error: vectorError } = await supabase
      .from('document_chunks')
      .select('id, embedding')
      .limit(1);
    
    const hasValidEmbedding = vectorCheck?.[0]?.embedding && Array.isArray(vectorCheck[0].embedding);
    results.push({
      component: 'rag_vectors',
      status: vectorError ? 'critical' : !hasValidEmbedding ? 'warning' : 'healthy',
      error_message: vectorError?.message || (!hasValidEmbedding ? 'No valid embeddings found' : undefined),
      metadata: { sample_vector_length: vectorCheck?.[0]?.embedding?.length },
    });

    // Store all results
    const { error: insertError } = await supabase.from('system_health_checks').insert(
      results.map((r) => ({
        check_type: 'automated',
        component: r.component,
        status: r.status,
        latency_ms: r.latency_ms,
        error_message: r.error_message,
        metadata: r.metadata || {},
      }))
    );

    if (insertError) {
      console.error('Failed to store health check results:', insertError);
    }

    // Calculate overall health
    const criticalCount = results.filter((r) => r.status === 'critical').length;
    const warningCount = results.filter((r) => r.status === 'warning').length;
    const overallStatus = criticalCount > 0 ? 'critical' : warningCount > 0 ? 'warning' : 'healthy';

    return new Response(
      JSON.stringify({
        overall_status: overallStatus,
        timestamp: new Date().toISOString(),
        results,
        summary: {
          total_checks: results.length,
          healthy: results.filter((r) => r.status === 'healthy').length,
          warnings: warningCount,
          critical: criticalCount,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Health check error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error', overall_status: 'critical' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
