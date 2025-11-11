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

    const { data_lake_id } = await req.json();

    // Fetch raw data from data lake
    const { data: rawData, error: fetchError } = await supabase
      .from('esg_data_lake')
      .select('*')
      .eq('id', data_lake_id)
      .single();

    if (fetchError) throw fetchError;

    console.log('Cleaning data for:', rawData.source_name);

    // Use LLM to clean and normalize data
    const cleaningPrompt = `You are an ESG data cleaning expert. Analyze this raw data and:
1. Detect and fix data quality issues (missing values, inconsistent units, outliers)
2. Normalize units to standard ESG metrics (e.g., kg CO2e, kWh, liters)
3. Extract structured data from unstructured text
4. Flag any anomalies or data quality concerns

Raw data:
${JSON.stringify(rawData.raw_data, null, 2)}

Return a JSON object with:
- cleaned_data: The cleaned and normalized data
- quality_score: A score from 0-100 indicating data quality
- issues_found: Array of issues detected
- transformations: Array of transformations applied`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an ESG data quality expert. Always return valid JSON.' },
          { role: 'user', content: cleaningPrompt }
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
    const cleaningResult = JSON.parse(aiResult.choices[0].message.content);

    // Store cleaned data back to data lake
    const { error: updateError } = await supabase
      .from('esg_data_lake')
      .update({
        processed_data: cleaningResult.cleaned_data,
        quality_score: cleaningResult.quality_score,
        processing_metadata: {
          issues_found: cleaningResult.issues_found,
          transformations: cleaningResult.transformations,
          cleaned_at: new Date().toISOString()
        },
        processed_at: new Date().toISOString()
      })
      .eq('id', data_lake_id);

    if (updateError) throw updateError;

    // Create lineage record
    const { error: lineageError } = await supabase
      .from('esg_data_lineage')
      .insert({
        organization_id: rawData.organization_id,
        source_id: data_lake_id,
        connector_id: rawData.connector_id,
        transformation_type: 'clean',
        input_data: rawData.raw_data,
        output_data: cleaningResult.cleaned_data,
        quality_score: cleaningResult.quality_score,
        lineage_metadata: {
          issues_found: cleaningResult.issues_found,
          transformations: cleaningResult.transformations
        }
      });

    if (lineageError) console.error('Lineage insert error:', lineageError);

    return new Response(
      JSON.stringify({
        success: true,
        quality_score: cleaningResult.quality_score,
        issues_found: cleaningResult.issues_found,
        transformations: cleaningResult.transformations
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error cleaning ESG data:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
