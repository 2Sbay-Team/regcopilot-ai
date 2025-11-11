import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { crypto } from 'https://deno.land/std@0.177.0/crypto/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function hashData(data: string): string {
  const encoder = new TextEncoder();
  const hash = crypto.subtle.digestSync('SHA-256', encoder.encode(data));
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function evaluateFormula(formula: any, metricData: Map<string, Map<string, number>>): Promise<Map<string, number>> {
  const results = new Map<string, number>();

  if (formula.type === 'field_sum') {
    // Direct field sum - already computed
    const fieldData = metricData.get(formula.field);
    if (fieldData) {
      for (const [period, value] of fieldData.entries()) {
        results.set(period, value);
      }
    }
  } else if (formula.type === 'sum') {
    // Sum multiple fields
    const fields = formula.fields as string[];
    const allPeriods = new Set<string>();
    
    // Collect all periods
    for (const field of fields) {
      const fieldData = metricData.get(field);
      if (fieldData) {
        for (const period of fieldData.keys()) {
          allPeriods.add(period);
        }
      }
    }

    // Sum across fields for each period
    for (const period of allPeriods) {
      let sum = 0;
      for (const field of fields) {
        const fieldData = metricData.get(field);
        sum += fieldData?.get(period) || 0;
      }
      results.set(period, sum);
    }
  } else if (formula.type === 'ratio') {
    // Calculate ratio
    const numeratorData = metricData.get(formula.numerator);
    const denominatorData = metricData.get(formula.denominator);

    if (numeratorData && denominatorData) {
      const allPeriods = new Set([...numeratorData.keys(), ...denominatorData.keys()]);
      for (const period of allPeriods) {
        const num = numeratorData.get(period) || 0;
        const denom = denominatorData.get(period) || 1;
        if (denom !== 0) {
          results.set(period, num / denom);
        }
      }
    }
  }

  return results;
}

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

    console.log('Evaluating KPIs for org:', orgId);

    // Get all active KPI rules
    const { data: kpiRules } = await supabase
      .from('esg_kpi_rules')
      .select('*')
      .eq('organization_id', orgId)
      .eq('active', true)
      .order('metric_code');

    if (!kpiRules || kpiRules.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No active KPI rules found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${kpiRules.length} active KPI rules`);

    // Get all existing metric results (from run-mapping)
    const { data: existingResults } = await supabase
      .from('esg_kpi_results')
      .select('*')
      .eq('organization_id', orgId);

    // Build a map of metric data
    const metricData = new Map<string, Map<string, number>>();
    
    if (existingResults) {
      for (const result of existingResults) {
        if (!metricData.has(result.metric_code)) {
          metricData.set(result.metric_code, new Map());
        }
        metricData.get(result.metric_code)!.set(result.period, Number(result.value));
      }
    }

    let evaluatedCount = 0;
    const newResults = [];

    // Evaluate each KPI rule
    for (const rule of kpiRules) {
      console.log(`Evaluating rule: ${rule.metric_code}`);

      try {
        const periodResults = await evaluateFormula(rule.formula, metricData);

        for (const [period, value] of periodResults.entries()) {
          // Check if result already exists
          const exists = existingResults?.find(
            r => r.metric_code === rule.metric_code && r.period === period
          );

          if (!exists || exists.value !== value) {
            newResults.push({
              organization_id: orgId,
              metric_code: rule.metric_code,
              period,
              value,
              unit: rule.unit,
              lineage: {
                formula: rule.formula,
                rule_id: rule.id,
                evaluated_at: new Date().toISOString()
              },
              quality_score: 0.9,
              computed_at: new Date().toISOString()
            });
            evaluatedCount++;
          }
        }

        // Update metric data map with new computed values
        metricData.set(rule.metric_code, periodResults);

      } catch (error) {
        console.error(`Error evaluating rule ${rule.metric_code}:`, error);
      }
    }

    // Insert new results
    if (newResults.length > 0) {
      const { error: insertError } = await supabase
        .from('esg_kpi_results')
        .upsert(newResults, {
          onConflict: 'organization_id,metric_code,period',
          ignoreDuplicates: false
        });

      if (insertError) {
        console.error('Error inserting KPI results:', insertError);
      }
    }

    // Log audit
    const auditInput = JSON.stringify({ rules_count: kpiRules.length });
    const auditOutput = JSON.stringify({ evaluated_count: evaluatedCount });
    
    const { data: prevAudit } = await supabase
      .from('esg_ingestion_audit')
      .select('output_hash')
      .eq('organization_id', orgId)
      .order('occurred_at', { ascending: false })
      .limit(1)
      .single();

    await supabase.from('esg_ingestion_audit').insert({
      organization_id: orgId,
      event_type: 'kpi_evaluation',
      input_hash: hashData(auditInput),
      output_hash: hashData(auditOutput),
      prev_hash: prevAudit?.output_hash || null,
      metadata: { rules_evaluated: kpiRules.length, results_generated: evaluatedCount },
      occurred_at: new Date().toISOString()
    });

    console.log(`KPI evaluation completed: ${evaluatedCount} results generated`);

    return new Response(
      JSON.stringify({
        success: true,
        rules_evaluated: kpiRules.length,
        results_generated: evaluatedCount,
        metric_codes: kpiRules.map(r => r.metric_code)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in kpi-evaluate:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
