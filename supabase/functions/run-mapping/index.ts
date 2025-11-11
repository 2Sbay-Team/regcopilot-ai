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

function applyTransform(value: any, transform: any): any {
  if (!transform || !transform.type) return value;

  switch (transform.type) {
    case 'sum':
      return value; // Aggregation happens at query level
    case 'convert_unit':
      const factor = transform.factor || 1;
      return value * factor;
    case 'normalize':
      return value;
    default:
      return value;
  }
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

    const { profile_id } = await req.json();

    if (!profile_id) {
      return new Response(JSON.stringify({ error: 'profile_id required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Running mapping for profile:', profile_id);

    // Get mapping profile
    const { data: mappingProfile } = await supabase
      .from('mapping_profiles')
      .select('*')
      .eq('id', profile_id)
      .eq('organization_id', orgId)
      .single();

    if (!mappingProfile) {
      return new Response(JSON.stringify({ error: 'Mapping profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get mapping configuration
    const { data: mappingTables } = await supabase
      .from('mapping_tables')
      .select('*, connectors(*)')
      .eq('profile_id', profile_id);

    const { data: mappingFields } = await supabase
      .from('mapping_fields')
      .select('*')
      .eq('profile_id', profile_id);

    if (!mappingFields || mappingFields.length === 0) {
      return new Response(JSON.stringify({ error: 'No field mappings configured' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Process each mapped field
    const aggregatedResults = new Map<string, Map<string, number>>();

    for (const field of mappingFields) {
      console.log(`Processing field: ${field.source_table}.${field.source_column} -> ${field.target_metric_code}`);

      // Get staging data for this table
      const connector = mappingTables?.find(t => t.source_table === field.source_table)?.connectors;
      
      if (!connector) {
        console.warn(`No connector found for table ${field.source_table}`);
        continue;
      }

      const { data: stagingData } = await supabase
        .from('staging_rows')
        .select('*')
        .eq('connector_id', connector.id)
        .eq('source_table', field.source_table);

      if (!stagingData || stagingData.length === 0) {
        console.warn(`No staging data for ${field.source_table}`);
        continue;
      }

      // Aggregate by period
      for (const row of stagingData) {
        const value = row.payload[field.source_column];
        if (value === null || value === undefined) continue;

        const transformedValue = applyTransform(value, field.transform);
        const period = row.period?.toString() || 'unknown';

        if (!aggregatedResults.has(field.target_metric_code)) {
          aggregatedResults.set(field.target_metric_code, new Map());
        }

        const metricPeriods = aggregatedResults.get(field.target_metric_code)!;
        const currentValue = metricPeriods.get(period) || 0;
        metricPeriods.set(period, currentValue + Number(transformedValue));

        // Create lineage edge
        await supabase.from('data_lineage_edges').insert({
          organization_id: orgId,
          from_reference: `${field.source_table}.${field.source_column}`,
          to_reference: field.target_metric_code,
          relation_type: 'field_mapping',
          metadata: {
            profile_id,
            period,
            transform: field.transform
          }
        });
      }
    }

    // Store aggregated results (ready for KPI evaluation)
    let processedMetrics = 0;
    for (const [metricCode, periods] of aggregatedResults.entries()) {
      for (const [period, value] of periods.entries()) {
        const field = mappingFields.find(f => f.target_metric_code === metricCode);
        
        // Store as intermediate result (can be consumed by kpi-evaluate)
        await supabase.from('esg_kpi_results').insert({
          organization_id: orgId,
          metric_code: metricCode,
          period,
          value,
          unit: field?.unit || 'unknown',
          lineage: {
            profile_id,
            source_table: field?.source_table,
            source_column: field?.source_column
          },
          source_profile_id: profile_id,
          quality_score: 0.85,
          computed_at: new Date().toISOString()
        });

        processedMetrics++;
      }
    }

    // Log audit
    const auditInput = JSON.stringify({ profile_id });
    const auditOutput = JSON.stringify({ metrics_processed: processedMetrics });
    
    const { data: prevAudit } = await supabase
      .from('esg_ingestion_audit')
      .select('output_hash')
      .eq('organization_id', orgId)
      .order('occurred_at', { ascending: false })
      .limit(1)
      .single();

    await supabase.from('esg_ingestion_audit').insert({
      organization_id: orgId,
      event_type: 'run_mapping',
      input_hash: hashData(auditInput),
      output_hash: hashData(auditOutput),
      prev_hash: prevAudit?.output_hash || null,
      metadata: { profile_id, metrics_processed: processedMetrics },
      occurred_at: new Date().toISOString()
    });

    console.log(`Mapping completed: ${processedMetrics} metric-period combinations processed`);

    return new Response(
      JSON.stringify({
        success: true,
        metrics_processed: processedMetrics,
        metric_codes: Array.from(aggregatedResults.keys())
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in run-mapping:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
