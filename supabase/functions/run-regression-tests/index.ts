import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0';
import { corsHeaders } from '../_shared/cors.ts';

const TESTS = [
  {
    module: 'ai-act-auditor',
    payload: {
      organization_id: '00000000-0000-0000-0000-000000000001',
      system_name: 'AI Credit Scoring System',
      purpose: 'financial_services',
      sectors: ['financial_services'],
    },
    expectedRisk: 'high',
  },
  {
    module: 'gdpr-checker',
    payload: {
      organization_id: '00000000-0000-0000-0000-000000000001',
      text_input: 'Contact: John Doe, email: john@example.com, phone: +1-555-0123, SSN: 123-45-6789',
    },
    expectedViolations: 1 as number,
  },
  {
    module: 'esg-reporter',
    payload: {
      organization_id: '00000000-0000-0000-0000-000000000001',
      metrics: {
        carbon_emissions: 1000,
        energy_usage: 500,
        water_usage: 200,
        waste_generated: 50,
        employees_total: 100,
        employees_female: 45,
      },
    },
    expectedKeys: ['narrative', 'completeness'] as string[],
  },
  {
    module: 'rag-search',
    payload: {
      query: 'Article 5 EU AI Act prohibited practices',
      top_k: 3,
    },
    expectedCitation: true,
  },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { triggered_by = 'manual' } = await req.json().catch(() => ({}));

    // Create test run
    const { data: testRun, error: runError } = await supabase
      .from('qa_test_runs')
      .insert({
        started_at: new Date().toISOString(),
        total_tests: TESTS.length,
        triggered_by,
      })
      .select()
      .single();

    if (runError) throw runError;

    const results = [];
    let passed = 0;
    let failed = 0;
    let totalLatency = 0;

    // Run each test
    for (const test of TESTS) {
      const startTime = Date.now();
      let status = 'pass';
      let message = '';
      let outputHash = '';
      let actualOutput = '';

      try {
        const { data, error } = await supabase.functions.invoke(test.module, {
          body: test.payload,
        });

        const latency = Date.now() - startTime;
        totalLatency += latency;

        if (error) {
          status = 'fail';
          message = `Function error: ${error.message}`;
        } else {
          actualOutput = JSON.stringify(data);
          outputHash = await generateHash(actualOutput);

          // Validate based on expected criteria
          if (test.module === 'ai-act-auditor') {
            if (data.risk_category !== test.expectedRisk) {
              status = 'fail';
              message = `Expected risk=${test.expectedRisk}, got ${data.risk_category}`;
            } else {
              message = 'Risk classification correct';
            }
          } else if (test.module === 'gdpr-checker') {
            const violationCount = data.violations?.length || 0;
            const expectedViolations = 'expectedViolations' in test ? (test as any).expectedViolations : 0;
            if (violationCount < expectedViolations) {
              status = 'fail';
              message = `Expected ≥${expectedViolations} violations, got ${violationCount}`;
            } else {
              message = `Detected ${violationCount} violations`;
            }
          } else if (test.module === 'esg-reporter') {
            const expectedKeys = 'expectedKeys' in test ? (test as any).expectedKeys : [];
            const hasKeys = expectedKeys.every((key: string) => data[key] !== undefined);
            if (!hasKeys) {
              status = 'fail';
              message = 'Missing expected keys in response';
            } else {
              message = 'ESG report generated with all required fields';
            }
          } else if (test.module === 'rag-search') {
            if (!data.results || data.results.length === 0) {
              status = 'fail';
              message = 'No RAG results returned';
            } else {
              message = `Retrieved ${data.results.length} relevant chunks`;
            }
          }
        }

        if (status === 'pass') passed++;
        else failed++;

        results.push({
          run_id: testRun.id,
          module: test.module,
          status,
          latency_ms: latency,
          message,
          output_hash: outputHash,
          actual_output: actualOutput.substring(0, 1000), // Truncate
        });
      } catch (err) {
        failed++;
        const errorMessage = err instanceof Error ? err.message : String(err);
        results.push({
          run_id: testRun.id,
          module: test.module,
          status: 'fail',
          latency_ms: Date.now() - startTime,
          message: `Exception: ${errorMessage}`,
          actual_output: '',
        });
      }
    }

    // Insert test results
    await supabase.from('qa_test_results').insert(results);

    // Update test run with final stats
    const avgLatency = Math.round(totalLatency / TESTS.length);
    await supabase
      .from('qa_test_runs')
      .update({
        finished_at: new Date().toISOString(),
        passed,
        failed,
        avg_latency_ms: avgLatency,
      })
      .eq('id', testRun.id);

    // Check for drift (compare with previous run)
    const { data: previousRun } = await supabase
      .from('qa_test_runs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(2);

    let driftDetected = false;
    if (previousRun && previousRun.length > 1) {
      const prev = previousRun[1];
      const passRateDelta = Math.abs((passed / TESTS.length) - (prev.passed / prev.total_tests));
      if (passRateDelta >= 0.1) {
        driftDetected = true;
      }
    }

    // Create incident if tests failed
    if (failed > 0 || driftDetected) {
      await supabase.from('incidents').insert({
        organization_id: '00000000-0000-0000-0000-000000000001',
        severity: 'P2',
        component: 'regression',
        title: driftDetected
          ? `Drift detected: ${failed} tests failed, pass rate changed >10%`
          : `Regression tests failed: ${failed}/${TESTS.length} tests`,
        description: `Test run ${testRun.id} completed with ${failed} failures. Avg latency: ${avgLatency}ms`,
        status: 'open',
      });
    }

    return new Response(
      JSON.stringify({
        run_id: testRun.id,
        total_tests: TESTS.length,
        passed,
        failed,
        avg_latency_ms: avgLatency,
        drift_detected: driftDetected,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Regression test error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
