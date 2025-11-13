import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidationResult {
  check_type: string;
  status: 'pass' | 'warning' | 'fail';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  affected_kpis?: string[];
  details?: any;
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

    console.log('Running ESG data validation for org:', orgId);

    const validationResults: ValidationResult[] = [];

    // 1. COMPLETENESS CHECK - Verify required KPIs have data
    const requiredKPIs = [
      'E1-1.scope1',
      'E1-1.scope2',
      'E1-2.energy_total',
      'S1-1.headcount'
    ];

    const { data: kpiResults } = await supabase
      .from('esg_kpi_results')
      .select('metric_code, value, period, unit')
      .eq('org_id', orgId);

    const foundKPIs = new Set((kpiResults || []).map(k => k.metric_code));
    const missingKPIs = requiredKPIs.filter(k => !foundKPIs.has(k));

    if (missingKPIs.length > 0) {
      validationResults.push({
        check_type: 'completeness',
        status: 'fail',
        severity: 'high',
        message: `Missing ${missingKPIs.length} required KPIs`,
        affected_kpis: missingKPIs,
        details: { missing_kpis: missingKPIs }
      });
    } else {
      validationResults.push({
        check_type: 'completeness',
        status: 'pass',
        severity: 'low',
        message: 'All required KPIs present',
      });
    }

    // 2. CONSISTENCY CHECK - Unit consistency
    if (kpiResults) {
      const energyKPIs = kpiResults.filter(k => k.metric_code.includes('energy'));
      const inconsistentUnits: string[] = [];

      for (const kpi of energyKPIs) {
        if (kpi.unit && !['kWh', 'MWh', 'GWh'].includes(kpi.unit)) {
          inconsistentUnits.push(kpi.metric_code);
        }
      }

      if (inconsistentUnits.length > 0) {
        validationResults.push({
          check_type: 'consistency',
          status: 'warning',
          severity: 'medium',
          message: `${inconsistentUnits.length} KPIs have unexpected units`,
          affected_kpis: inconsistentUnits,
        });
      }
    }

    // 3. PLAUSIBILITY CHECK - Value ranges
    if (kpiResults) {
      const implausibleValues: string[] = [];

      for (const kpi of kpiResults) {
        const value = parseFloat(kpi.value);
        
        // Check for negative values where not expected
        if (value < 0 && !kpi.metric_code.includes('reduction')) {
          implausibleValues.push(`${kpi.metric_code}: negative value (${value})`);
        }

        // Check for extremely high values (possible data quality issue)
        if (kpi.metric_code.includes('scope1') && value > 1000000) {
          implausibleValues.push(`${kpi.metric_code}: unusually high (${value} tCO2e)`);
        }
      }

      if (implausibleValues.length > 0) {
        validationResults.push({
          check_type: 'plausibility',
          status: 'warning',
          severity: 'medium',
          message: `${implausibleValues.length} KPIs have implausible values`,
          details: { implausible_values: implausibleValues }
        });
      } else {
        validationResults.push({
          check_type: 'plausibility',
          status: 'pass',
          severity: 'low',
          message: 'All KPI values within plausible ranges',
        });
      }
    }

    // 4. TEMPORAL CONSISTENCY - Year-over-year deviation
    if (kpiResults) {
      const kpisByMetric = new Map<string, any[]>();
      
      for (const kpi of kpiResults) {
        if (!kpisByMetric.has(kpi.metric_code)) {
          kpisByMetric.set(kpi.metric_code, []);
        }
        kpisByMetric.get(kpi.metric_code)!.push(kpi);
      }

      const largeDeviations: string[] = [];

      for (const [metricCode, values] of kpisByMetric.entries()) {
        if (values.length >= 2) {
          const sorted = values.sort((a, b) => a.period.localeCompare(b.period));
          
          for (let i = 1; i < sorted.length; i++) {
            const prev = parseFloat(sorted[i - 1].value);
            const curr = parseFloat(sorted[i].value);
            
            if (prev > 0) {
              const deviation = Math.abs((curr - prev) / prev);
              
              if (deviation > 0.3) { // More than 30% change
                largeDeviations.push(
                  `${metricCode}: ${(deviation * 100).toFixed(1)}% change from ${sorted[i - 1].period} to ${sorted[i].period}`
                );
              }
            }
          }
        }
      }

      if (largeDeviations.length > 0) {
        validationResults.push({
          check_type: 'temporal_consistency',
          status: 'warning',
          severity: 'medium',
          message: `${largeDeviations.length} KPIs show large year-over-year deviations`,
          details: { large_deviations: largeDeviations }
        });
      }
    }

    // 5. DATA LINEAGE CHECK - Verify staging data exists
    const { data: connectors } = await supabase
      .from('connectors')
      .select('id')
      .eq('organization_id', orgId);

    if (connectors && connectors.length > 0) {
      const connectorIds = connectors.map(c => c.id);
      
      const { count: stagingCount } = await supabase
        .from('staging_rows')
        .select('id', { count: 'exact', head: true })
        .in('connector_id', connectorIds);

      if (!stagingCount || stagingCount === 0) {
        validationResults.push({
          check_type: 'data_lineage',
          status: 'fail',
          severity: 'critical',
          message: 'No staging data found - KPIs may not be traceable',
        });
      } else {
        validationResults.push({
          check_type: 'data_lineage',
          status: 'pass',
          severity: 'low',
          message: `Data lineage verified (${stagingCount} staging rows)`,
        });
      }
    }

    // Store validation results
    const { error: insertError } = await supabase
      .from('esg_validation_results')
      .insert(
        validationResults.map(r => ({
          organization_id: orgId,
          check_type: r.check_type,
          status: r.status,
          severity: r.severity,
          message: r.message,
          affected_kpis: r.affected_kpis || [],
          details: r.details || {},
          validated_at: new Date().toISOString(),
        }))
      );

    if (insertError) {
      console.error('Error storing validation results:', insertError);
    }

    // Summary
    const summary = {
      total_checks: validationResults.length,
      passed: validationResults.filter(r => r.status === 'pass').length,
      warnings: validationResults.filter(r => r.status === 'warning').length,
      failed: validationResults.filter(r => r.status === 'fail').length,
    };

    return new Response(
      JSON.stringify({
        success: true,
        summary,
        results: validationResults,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Validation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
