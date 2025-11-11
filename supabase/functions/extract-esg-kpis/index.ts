import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.80.0";

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
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { organization_id, fiscal_year } = await req.json();

    console.log('Extracting KPIs for org:', organization_id, 'fiscal year:', fiscal_year);

    // Fetch all processed data for the organization
    const { data: dataLake, error: fetchError } = await supabase
      .from('esg_data_lake')
      .select('*')
      .eq('organization_id', organization_id)
      .not('processed_data', 'is', null);

    if (fetchError) throw fetchError;

    // Fetch ESRS modules for context
    const { data: esrsModules } = await supabase
      .from('esrs_modules')
      .select('*');

    // Use RAG to get ESRS KPI definitions
    const { data: esrsChunks } = await supabase
      .rpc('match_regulatory_chunks', {
        query_embedding: null, // Will use keyword search
        match_threshold: 0.7,
        match_count: 10
      });

    // Use LLM to extract KPIs from all data sources
    const extractionPrompt = `You are an ESRS compliance expert. Extract all relevant KPIs from the following data sources.

ESRS Modules Context:
${JSON.stringify(esrsModules, null, 2)}

Available Data Sources:
${JSON.stringify(dataLake.map(d => ({
  source: d.source_name,
  connector_type: d.connector_type,
  data: d.processed_data
})), null, 2)}

For each KPI found, return:
- esrs_module: The ESRS module code (E1, E2, S1, etc.)
- kpi_name: Clear name of the KPI
- kpi_value: Numeric value
- kpi_unit: Unit of measurement
- calculation_method: How it was calculated
- data_sources: Which sources contributed to this KPI
- confidence_score: 0-100 confidence in the extraction

Return a JSON array of KPI objects. Focus on ESRS-required metrics like:
- E1: GHG emissions (Scope 1, 2, 3), energy consumption
- E2: Pollution metrics
- E3: Water usage
- E4: Biodiversity impacts
- E5: Circular economy metrics
- S1: Workforce diversity, training hours, accidents
- S2: Workers in value chain
- S3: Communities impacts
- S4: Consumers metrics
- G1: Governance structure, ethics`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an ESRS KPI extraction expert. Always return valid JSON array.' },
          { role: 'user', content: extractionPrompt }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiResult = await aiResponse.json();
    const extractionResult = JSON.parse(aiResult.choices[0].message.content);
    const kpis = extractionResult.kpis || [];

    console.log('Extracted KPIs:', kpis.length);

    // Insert KPIs into database
    const kpisToInsert = kpis.map((kpi: any) => ({
      organization_id,
      esrs_module: kpi.esrs_module,
      kpi_name: kpi.kpi_name,
      kpi_value: kpi.kpi_value,
      kpi_unit: kpi.kpi_unit,
      calculation_method: kpi.calculation_method,
      data_sources: kpi.data_sources || [],
      confidence_score: kpi.confidence_score,
      fiscal_year,
      validated: false,
      metadata: {
        extracted_from: dataLake.map(d => d.source_name),
        extraction_date: new Date().toISOString()
      }
    }));

    const { data: insertedKpis, error: insertError } = await supabase
      .from('esg_kpis')
      .insert(kpisToInsert)
      .select();

    if (insertError) throw insertError;

    // Create lineage records for KPI extraction
    const lineageRecords = insertedKpis?.map(kpi => ({
      organization_id,
      transformation_type: 'extract',
      input_data: { data_lake_ids: dataLake.map(d => d.id) },
      output_data: { kpi_id: kpi.id },
      quality_score: kpi.confidence_score,
      lineage_metadata: {
        kpi_name: kpi.kpi_name,
        esrs_module: kpi.esrs_module
      }
    }));

    if (lineageRecords) {
      await supabase.from('esg_data_lineage').insert(lineageRecords);
    }

    return new Response(
      JSON.stringify({
        success: true,
        kpis_extracted: insertedKpis?.length || 0,
        kpis: insertedKpis
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error extracting KPIs:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
