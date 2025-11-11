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

    console.log('Creating demo data for org:', orgId);

    // 1. Create demo connectors
    const { data: energyConnector } = await supabase
      .from('connectors')
      .insert({
        organization_id: orgId,
        connector_type: 'postgres',
        name: 'Energy Monitoring DB',
        config: { host: 'demo.internal', database: 'energy_data' },
        load_type: 'delta',
        status: 'active',
        last_sync_at: new Date(Date.now() - 86400000).toISOString()
      })
      .select()
      .single();

    const { data: emissionsConnector } = await supabase
      .from('connectors')
      .insert({
        organization_id: orgId,
        connector_type: 'postgres',
        name: 'Emissions Tracking DB',
        config: { host: 'demo.internal', database: 'emissions' },
        load_type: 'full',
        status: 'active',
        last_sync_at: new Date(Date.now() - 172800000).toISOString()
      })
      .select()
      .single();

    const { data: hrConnector } = await supabase
      .from('connectors')
      .insert({
        organization_id: orgId,
        connector_type: 'mssql',
        name: 'HR System',
        config: { host: 'demo.internal', database: 'hr' },
        load_type: 'delta',
        status: 'active',
        last_sync_at: new Date(Date.now() - 259200000).toISOString()
      })
      .select()
      .single();

    if (!energyConnector || !emissionsConnector || !hrConnector) {
      throw new Error('Failed to create connectors');
    }

    // 2. Create schema cache
    const schemaEntries = [
      // Energy tables
      { connector_id: energyConnector.id, table_name: 'energy_usage', column_name: 'id', data_type: 'uuid', is_primary_key: true },
      { connector_id: energyConnector.id, table_name: 'energy_usage', column_name: 'facility_id', data_type: 'uuid', is_foreign_key: true, fk_target_table: 'facilities', fk_target_column: 'id' },
      { connector_id: energyConnector.id, table_name: 'energy_usage', column_name: 'kwh_consumed', data_type: 'numeric' },
      { connector_id: energyConnector.id, table_name: 'energy_usage', column_name: 'recorded_at', data_type: 'timestamptz' },
      { connector_id: energyConnector.id, table_name: 'facilities', column_name: 'id', data_type: 'uuid', is_primary_key: true },
      { connector_id: energyConnector.id, table_name: 'facilities', column_name: 'name', data_type: 'text' },
      { connector_id: energyConnector.id, table_name: 'facilities', column_name: 'country', data_type: 'text' },
      // Emissions tables
      { connector_id: emissionsConnector.id, table_name: 'emissions_scope1', column_name: 'id', data_type: 'uuid', is_primary_key: true },
      { connector_id: emissionsConnector.id, table_name: 'emissions_scope1', column_name: 'facility_id', data_type: 'uuid', is_foreign_key: true, fk_target_table: 'facilities', fk_target_column: 'id' },
      { connector_id: emissionsConnector.id, table_name: 'emissions_scope1', column_name: 'co2_tonnes', data_type: 'numeric' },
      { connector_id: emissionsConnector.id, table_name: 'emissions_scope1', column_name: 'period', data_type: 'date' },
      { connector_id: emissionsConnector.id, table_name: 'emissions_scope2', column_name: 'id', data_type: 'uuid', is_primary_key: true },
      { connector_id: emissionsConnector.id, table_name: 'emissions_scope2', column_name: 'facility_id', data_type: 'uuid', is_foreign_key: true, fk_target_table: 'facilities', fk_target_column: 'id' },
      { connector_id: emissionsConnector.id, table_name: 'emissions_scope2', column_name: 'co2_tonnes', data_type: 'numeric' },
      { connector_id: emissionsConnector.id, table_name: 'emissions_scope2', column_name: 'period', data_type: 'date' },
      // HR tables
      { connector_id: hrConnector.id, table_name: 'hr_headcount', column_name: 'id', data_type: 'uuid', is_primary_key: true },
      { connector_id: hrConnector.id, table_name: 'hr_headcount', column_name: 'employee_count', data_type: 'integer' },
      { connector_id: hrConnector.id, table_name: 'hr_headcount', column_name: 'period', data_type: 'date' },
      { connector_id: hrConnector.id, table_name: 'hr_diversity', column_name: 'id', data_type: 'uuid', is_primary_key: true },
      { connector_id: hrConnector.id, table_name: 'hr_diversity', column_name: 'gender', data_type: 'text' },
      { connector_id: hrConnector.id, table_name: 'hr_diversity', column_name: 'count', data_type: 'integer' },
      { connector_id: hrConnector.id, table_name: 'hr_diversity', column_name: 'period', data_type: 'date' },
    ];

    await supabase.from('source_schema_cache').insert(schemaEntries);

    // 3. Create staging data
    const currentMonth = new Date();
    const periods = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(currentMonth);
      d.setMonth(d.getMonth() - i);
      return d.toISOString().slice(0, 7);
    });

    const stagingData = [];
    for (const period of periods) {
      // Energy data
      for (let i = 1; i <= 5; i++) {
        const payload = {
          id: crypto.randomUUID(),
          facility_id: `facility-${i}`,
          kwh_consumed: 50000 + Math.random() * 20000,
          recorded_at: `${period}-15T12:00:00Z`
        };
        stagingData.push({
          connector_id: energyConnector.id,
          source_table: 'energy_usage',
          payload,
          source_hash: hashData(JSON.stringify(payload)),
          period: `${period}-01`,
          arrived_at: new Date().toISOString()
        });
      }

      // Emissions scope 1
      for (let i = 1; i <= 5; i++) {
        const payload = {
          id: crypto.randomUUID(),
          facility_id: `facility-${i}`,
          co2_tonnes: 10 + Math.random() * 5,
          period: `${period}-01`
        };
        stagingData.push({
          connector_id: emissionsConnector.id,
          source_table: 'emissions_scope1',
          payload,
          source_hash: hashData(JSON.stringify(payload)),
          period: `${period}-01`,
          arrived_at: new Date().toISOString()
        });
      }

      // Emissions scope 2
      for (let i = 1; i <= 5; i++) {
        const payload = {
          id: crypto.randomUUID(),
          facility_id: `facility-${i}`,
          co2_tonnes: 20 + Math.random() * 10,
          period: `${period}-01`
        };
        stagingData.push({
          connector_id: emissionsConnector.id,
          source_table: 'emissions_scope2',
          payload,
          source_hash: hashData(JSON.stringify(payload)),
          period: `${period}-01`,
          arrived_at: new Date().toISOString()
        });
      }

      // HR data
      const headcountPayload = {
        id: crypto.randomUUID(),
        employee_count: 1000 + Math.floor(Math.random() * 200),
        period: `${period}-01`
      };
      stagingData.push({
        connector_id: hrConnector.id,
        source_table: 'hr_headcount',
        payload: headcountPayload,
        source_hash: hashData(JSON.stringify(headcountPayload)),
        period: `${period}-01`,
        arrived_at: new Date().toISOString()
      });

      // Gender diversity
      const malePayload = { id: crypto.randomUUID(), gender: 'male', count: 600 + Math.floor(Math.random() * 100), period: `${period}-01` };
      const femalePayload = { id: crypto.randomUUID(), gender: 'female', count: 400 + Math.floor(Math.random() * 100), period: `${period}-01` };
      stagingData.push({
        connector_id: hrConnector.id,
        source_table: 'hr_diversity',
        payload: malePayload,
        source_hash: hashData(JSON.stringify(malePayload)),
        period: `${period}-01`,
        arrived_at: new Date().toISOString()
      });
      stagingData.push({
        connector_id: hrConnector.id,
        source_table: 'hr_diversity',
        payload: femalePayload,
        source_hash: hashData(JSON.stringify(femalePayload)),
        period: `${period}-01`,
        arrived_at: new Date().toISOString()
      });
    }

    await supabase.from('staging_rows').insert(stagingData);

    // 4. Create mapping profile
    const { data: mappingProfile } = await supabase
      .from('mapping_profiles')
      .insert({
        organization_id: orgId,
        name: 'Standard ESG Mapping',
        status: 'active',
        description: 'Pre-configured mapping for demo data'
      })
      .select()
      .single();

    if (!mappingProfile) {
      throw new Error('Failed to create mapping profile');
    }

    // 5. Create mapping tables
    await supabase.from('mapping_tables').insert([
      { profile_id: mappingProfile.id, source_table: 'energy_usage', table_alias: 'energy', connector_id: energyConnector.id },
      { profile_id: mappingProfile.id, source_table: 'emissions_scope1', table_alias: 'scope1', connector_id: emissionsConnector.id },
      { profile_id: mappingProfile.id, source_table: 'emissions_scope2', table_alias: 'scope2', connector_id: emissionsConnector.id },
      { profile_id: mappingProfile.id, source_table: 'hr_diversity', table_alias: 'diversity', connector_id: hrConnector.id },
    ]);

    // 6. Create mapping fields
    await supabase.from('mapping_fields').insert([
      { profile_id: mappingProfile.id, source_table: 'energy_usage', source_column: 'kwh_consumed', target_metric_code: 'E1-2.energy_total', unit: 'kWh', transform: { type: 'sum', aggregation: 'period' } },
      { profile_id: mappingProfile.id, source_table: 'emissions_scope1', source_column: 'co2_tonnes', target_metric_code: 'E1-1.scope1', unit: 'tCO2e', transform: { type: 'sum', aggregation: 'period' } },
      { profile_id: mappingProfile.id, source_table: 'emissions_scope2', source_column: 'co2_tonnes', target_metric_code: 'E1-1.scope2', unit: 'tCO2e', transform: { type: 'sum', aggregation: 'period' } },
      { profile_id: mappingProfile.id, source_table: 'hr_diversity', source_column: 'count', target_metric_code: 'S1-1.gender_count', unit: 'count', transform: { type: 'group_by', field: 'gender' } },
    ]);

    // 7. Create KPI rules
    await supabase.from('esg_kpi_rules').insert([
      {
        organization_id: orgId,
        metric_code: 'E1-1.scope1',
        formula: { type: 'field_sum', field: 'E1-1.scope1' },
        unit: 'tCO2e',
        esrs_reference: 'ESRS E1-1: Direct GHG Emissions (Scope 1)',
        version: 1,
        active: true
      },
      {
        organization_id: orgId,
        metric_code: 'E1-1.scope2',
        formula: { type: 'field_sum', field: 'E1-1.scope2' },
        unit: 'tCO2e',
        esrs_reference: 'ESRS E1-1: Indirect GHG Emissions from Energy (Scope 2)',
        version: 1,
        active: true
      },
      {
        organization_id: orgId,
        metric_code: 'E1-1.total',
        formula: { type: 'sum', fields: ['E1-1.scope1', 'E1-1.scope2'] },
        unit: 'tCO2e',
        esrs_reference: 'ESRS E1-1: Total GHG Emissions',
        version: 1,
        active: true
      },
      {
        organization_id: orgId,
        metric_code: 'E1-2.energy_total',
        formula: { type: 'field_sum', field: 'E1-2.energy_total' },
        unit: 'kWh',
        esrs_reference: 'ESRS E1-2: Total Energy Consumption',
        version: 1,
        active: true
      },
      {
        organization_id: orgId,
        metric_code: 'S1-1.gender_ratio',
        formula: { type: 'ratio', numerator: 'S1-1.gender_count.female', denominator: 'S1-1.gender_count.male' },
        unit: 'ratio',
        esrs_reference: 'ESRS S1-1: Gender Diversity Ratio',
        version: 1,
        active: true
      },
    ]);

    // 8. Create scheduled job
    await supabase.from('scheduled_jobs').insert({
      organization_id: orgId,
      job_name: 'Monthly ESG Data Sync',
      job_type: 'connector-sync',
      cron_expression: '0 2 1 * *',
      enabled: true,
      config: { connector_ids: [energyConnector.id, emissionsConnector.id, hrConnector.id] }
    });

    console.log('Demo data created successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Demo data created',
        data: {
          connectors: 3,
          staging_rows: stagingData.length,
          mapping_profile: mappingProfile.id,
          kpi_rules: 5
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error creating demo data:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
