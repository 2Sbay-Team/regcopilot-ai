import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Heuristics for identifying ESG-related tables and fields
const ESG_TABLE_PATTERNS = [
  { pattern: /energy|power|electricity|kwh/i, category: 'energy', confidence: 0.9 },
  { pattern: /emission|co2|ghg|carbon|scope/i, category: 'emissions', confidence: 0.95 },
  { pattern: /water|h2o|consumption/i, category: 'water', confidence: 0.85 },
  { pattern: /waste|disposal|recycl/i, category: 'waste', confidence: 0.85 },
  { pattern: /hr|employee|headcount|diversity|gender/i, category: 'social', confidence: 0.8 },
  { pattern: /supplier|vendor|supply_chain/i, category: 'supply_chain', confidence: 0.75 },
];

const METRIC_MAPPINGS: Record<string, { patterns: RegExp[], unit: string, esrs: string }> = {
  'E1-1.scope1': {
    patterns: [/scope_?1|direct.*emission|stationary.*combustion/i],
    unit: 'tCO2e',
    esrs: 'ESRS E1-1: Direct GHG Emissions'
  },
  'E1-1.scope2': {
    patterns: [/scope_?2|indirect.*energy|purchased.*electricity/i],
    unit: 'tCO2e',
    esrs: 'ESRS E1-1: Indirect Energy Emissions'
  },
  'E1-2.energy_total': {
    patterns: [/energy|electricity|kwh|power.*consum/i],
    unit: 'kWh',
    esrs: 'ESRS E1-2: Total Energy Consumption'
  },
  'E1-3.renewable_energy': {
    patterns: [/renewable|solar|wind|green.*energy/i],
    unit: 'kWh',
    esrs: 'ESRS E1-3: Renewable Energy'
  },
  'S1-1.headcount': {
    patterns: [/employee.*count|headcount|workforce.*size/i],
    unit: 'count',
    esrs: 'ESRS S1-1: Employee Count'
  },
  'S1-1.gender_count': {
    patterns: [/gender|male|female|diversity/i],
    unit: 'count',
    esrs: 'ESRS S1-1: Gender Diversity'
  },
};

function suggestJoins(schemaCache: any[]): any[] {
  const joins: any[] = [];
  const tableGroups = new Map<string, any[]>();

  // Group columns by table
  for (const col of schemaCache) {
    if (!tableGroups.has(col.table_name)) {
      tableGroups.set(col.table_name, []);
    }
    tableGroups.get(col.table_name)!.push(col);
  }

  // Find FK relationships
  for (const [tableName, columns] of tableGroups.entries()) {
    for (const col of columns) {
      if (col.is_foreign_key && col.fk_target_table) {
        joins.push({
          left_table: tableName,
          right_table: col.fk_target_table,
          left_key: col.column_name,
          right_key: col.fk_target_column || 'id',
          join_type: 'inner',
          confidence_score: 0.95
        });
      }
    }
  }

  // Heuristic joins based on column name patterns
  for (const [leftTable, leftCols] of tableGroups.entries()) {
    for (const [rightTable, rightCols] of tableGroups.entries()) {
      if (leftTable === rightTable) continue;

      for (const leftCol of leftCols) {
        for (const rightCol of rightCols) {
          // Check if column names suggest a relationship
          const leftName = leftCol.column_name.toLowerCase();
          const rightName = rightCol.column_name.toLowerCase();

          // Pattern: left_table_id matches right_table primary key
          if (
            leftName.includes(rightTable.toLowerCase()) &&
            (leftName.includes('_id') || leftName.includes('id')) &&
            rightCol.is_primary_key
          ) {
            joins.push({
              left_table: leftTable,
              right_table: rightTable,
              left_key: leftCol.column_name,
              right_key: rightCol.column_name,
              join_type: 'left',
              confidence_score: 0.75
            });
          }
        }
      }
    }
  }

  return joins;
}

function suggestFieldMappings(schemaCache: any[]): any[] {
  const mappings: any[] = [];

  for (const col of schemaCache) {
    const colName = col.column_name.toLowerCase();
    const tableName = col.table_name.toLowerCase();
    const combined = `${tableName}.${colName}`;

    // Skip non-numeric columns for metrics
    if (!['numeric', 'integer', 'bigint', 'double precision', 'real'].includes(col.data_type?.toLowerCase())) {
      continue;
    }

    // Try to match to metric codes
    for (const [metricCode, config] of Object.entries(METRIC_MAPPINGS)) {
      for (const pattern of config.patterns) {
        if (pattern.test(combined) || pattern.test(colName)) {
          mappings.push({
            source_table: col.table_name,
            source_column: col.column_name,
            target_metric_code: metricCode,
            unit: config.unit,
            transform: { type: 'sum', aggregation: 'period' },
            notes: `Auto-mapped based on pattern match to ${config.esrs}`
          });
          break;
        }
      }
    }
  }

  return mappings;
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

    const { connector_ids } = await req.json();

    if (!connector_ids || !Array.isArray(connector_ids)) {
      return new Response(JSON.stringify({ error: 'connector_ids array required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Generating mapping suggestions for connectors:', connector_ids);

    // Get schema cache for all connectors
    const { data: schemaCache, error: schemaError } = await supabase
      .from('source_schema_cache')
      .select('*')
      .in('connector_id', connector_ids);

    if (schemaError || !schemaCache || schemaCache.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No schema cache found. Run connector discovery first.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Identify relevant ESG tables
    const relevantTables = new Set<string>();
    for (const col of schemaCache) {
      for (const { pattern, category, confidence } of ESG_TABLE_PATTERNS) {
        if (pattern.test(col.table_name)) {
          relevantTables.add(col.table_name);
          break;
        }
      }
    }

    // Filter schema to relevant tables
    const filteredSchema = schemaCache.filter(col => relevantTables.has(col.table_name));

    // Suggest joins
    const suggestedJoins = suggestJoins(filteredSchema);

    // Suggest field mappings
    const suggestedFields = suggestFieldMappings(filteredSchema);

    // Create draft mapping profile
    const { data: mappingProfile } = await supabase
      .from('mapping_profiles')
      .insert({
        organization_id: orgId,
        name: `Auto-suggested Mapping ${new Date().toISOString().split('T')[0]}`,
        status: 'draft',
        description: 'Automatically generated mapping suggestions'
      })
      .select()
      .single();

    if (!mappingProfile) {
      throw new Error('Failed to create mapping profile');
    }

    // Insert mapping tables
    const mappingTables = Array.from(relevantTables).map(tableName => {
      const connector = schemaCache.find(c => c.table_name === tableName);
      return {
        profile_id: mappingProfile.id,
        source_table: tableName,
        table_alias: tableName.replace(/^(.*_)/, ''),
        connector_id: connector?.connector_id
      };
    });

    if (mappingTables.length > 0) {
      await supabase.from('mapping_tables').insert(mappingTables);
    }

    // Insert suggested joins
    const joinsToInsert = suggestedJoins.map(j => ({
      ...j,
      profile_id: mappingProfile.id
    }));

    if (joinsToInsert.length > 0) {
      await supabase.from('mapping_joins').insert(joinsToInsert);
    }

    // Insert suggested field mappings
    const fieldsToInsert = suggestedFields.map(f => ({
      ...f,
      profile_id: mappingProfile.id
    }));

    if (fieldsToInsert.length > 0) {
      await supabase.from('mapping_fields').insert(fieldsToInsert);
    }

    console.log('Mapping suggestions created:', {
      profile_id: mappingProfile.id,
      tables: mappingTables.length,
      joins: joinsToInsert.length,
      fields: fieldsToInsert.length
    });

    return new Response(
      JSON.stringify({
        success: true,
        mapping_profile: mappingProfile,
        suggestions: {
          tables: mappingTables.length,
          joins: joinsToInsert.length,
          fields: fieldsToInsert.length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in mapping-suggest:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
