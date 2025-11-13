import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * ESG Workflow Demo Orchestrator
 * Runs complete end-to-end workflow:
 * 1. Seed demo data
 * 2. Run mapping suggestions
 * 3. Execute KPI evaluation
 * 4. Run validation
 * 5. Generate ESG report
 */

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    const orgId = profile?.organization_id;
    if (!orgId) {
      return new Response(JSON.stringify({ error: 'No organization found' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('='.repeat(60));
    console.log('🚀 Starting ESG Workflow Demo for org:', orgId);
    console.log('='.repeat(60));

    const results: any = {
      workflow_id: crypto.randomUUID(),
      organization_id: orgId,
      started_at: new Date().toISOString(),
      steps: [],
    };

    // STEP 1: Seed demo data
    console.log('\n[STEP 1/5] Seeding demo data...');
    const stepStart1 = Date.now();
    
    try {
      const response1 = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/demo-seed-ingestion`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const seedResult = await response1.json();
      results.steps.push({
        step: 1,
        name: 'seed_demo_data',
        status: response1.ok ? 'success' : 'failed',
        duration_ms: Date.now() - stepStart1,
        result: seedResult,
      });

      if (!response1.ok) throw new Error(`Seed failed: ${JSON.stringify(seedResult)}`);
      console.log('✓ Demo data seeded successfully');
    } catch (error: any) {
      console.error('✗ Seed failed:', error.message);
      results.steps.push({
        step: 1,
        name: 'seed_demo_data',
        status: 'failed',
        duration_ms: Date.now() - stepStart1,
        error: error.message,
      });
      throw error;
    }

    // STEP 2: Get mapping profile
    console.log('\n[STEP 2/5] Getting mapping profile...');
    const stepStart2 = Date.now();

    const { data: mappingProfiles } = await supabase
      .from('mapping_profiles')
      .select('id')
      .eq('organization_id', orgId)
      .limit(1);

    if (!mappingProfiles || mappingProfiles.length === 0) {
      throw new Error('No mapping profile found - seed may have failed');
    }

    const profileId = mappingProfiles[0].id;
    results.steps.push({
      step: 2,
      name: 'get_mapping_profile',
      status: 'success',
      duration_ms: Date.now() - stepStart2,
      result: { profile_id: profileId },
    });
    console.log('✓ Mapping profile found:', profileId);

    // STEP 3: Run mapping
    console.log('\n[STEP 3/5] Executing data mapping...');
    const stepStart3 = Date.now();

    try {
      const response3 = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/run-mapping`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profile_id: profileId }),
      });

      const mappingResult = await response3.json();
      results.steps.push({
        step: 3,
        name: 'run_mapping',
        status: response3.ok ? 'success' : 'failed',
        duration_ms: Date.now() - stepStart3,
        result: mappingResult,
      });

      if (!response3.ok) throw new Error(`Mapping failed: ${JSON.stringify(mappingResult)}`);
      console.log('✓ Mapping executed successfully');
    } catch (error: any) {
      console.error('✗ Mapping failed:', error.message);
      results.steps.push({
        step: 3,
        name: 'run_mapping',
        status: 'failed',
        duration_ms: Date.now() - stepStart3,
        error: error.message,
      });
      throw error;
    }

    // STEP 4: Evaluate KPIs
    console.log('\n[STEP 4/5] Evaluating KPIs...');
    const stepStart4 = Date.now();

    try {
      const response4 = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/kpi-evaluate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const kpiResult = await response4.json();
      results.steps.push({
        step: 4,
        name: 'evaluate_kpis',
        status: response4.ok ? 'success' : 'failed',
        duration_ms: Date.now() - stepStart4,
        result: kpiResult,
      });

      if (!response4.ok) throw new Error(`KPI evaluation failed: ${JSON.stringify(kpiResult)}`);
      console.log('✓ KPIs evaluated successfully');
    } catch (error: any) {
      console.error('✗ KPI evaluation failed:', error.message);
      results.steps.push({
        step: 4,
        name: 'evaluate_kpis',
        status: 'failed',
        duration_ms: Date.now() - stepStart4,
        error: error.message,
      });
      throw error;
    }

    // STEP 5: Run validation
    console.log('\n[STEP 5/5] Running validation checks...');
    const stepStart5 = Date.now();

    try {
      const response5 = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/esg-validate-data`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const validationResult = await response5.json();
      results.steps.push({
        step: 5,
        name: 'validate_data',
        status: response5.ok ? 'success' : 'failed',
        duration_ms: Date.now() - stepStart5,
        result: validationResult,
      });

      if (!response5.ok) throw new Error(`Validation failed: ${JSON.stringify(validationResult)}`);
      console.log('✓ Validation completed');
      console.log(`  Passed: ${validationResult.summary?.passed || 0}`);
      console.log(`  Warnings: ${validationResult.summary?.warnings || 0}`);
      console.log(`  Failed: ${validationResult.summary?.failed || 0}`);
    } catch (error: any) {
      console.error('✗ Validation failed:', error.message);
      results.steps.push({
        step: 5,
        name: 'validate_data',
        status: 'failed',
        duration_ms: Date.now() - stepStart5,
        error: error.message,
      });
    }

    // STEP 6: Generate report
    console.log('\n[STEP 6/6] Generating ESG report...');
    const stepStart6 = Date.now();

    try {
      const response6 = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/esg-generate-report`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          report_period: '2024',
          format: 'json'
        }),
      });

      const reportResult = await response6.json();
      results.steps.push({
        step: 6,
        name: 'generate_report',
        status: response6.ok ? 'success' : 'failed',
        duration_ms: Date.now() - stepStart6,
        result: reportResult,
      });

      if (!response6.ok) throw new Error(`Report generation failed: ${JSON.stringify(reportResult)}`);
      console.log('✓ ESG report generated successfully');
      console.log(`  Report ID: ${reportResult.report_id}`);
    } catch (error: any) {
      console.error('✗ Report generation failed:', error.message);
      results.steps.push({
        step: 6,
        name: 'generate_report',
        status: 'failed',
        duration_ms: Date.now() - stepStart6,
        error: error.message,
      });
    }

    results.completed_at = new Date().toISOString();
    results.total_duration_ms = Date.now() - Date.parse(results.started_at);
    results.status = results.steps.every((s: any) => s.status === 'success') ? 'success' : 'partial';

    console.log('\n' + '='.repeat(60));
    console.log('✓ ESG Workflow Demo completed');
    console.log(`  Status: ${results.status}`);
    console.log(`  Total duration: ${results.total_duration_ms}ms`);
    console.log('='.repeat(60));

    return new Response(
      JSON.stringify({
        success: true,
        workflow: results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('\n❌ Workflow failed:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        workflow_failed: true,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
