import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SchemaDetectionRequest {
  organizationId: string;
  sourceSystem: string;
  sampleData: Record<string, any>[];
  profileName: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body: SchemaDetectionRequest = await req.json();
    const { organizationId, sourceSystem, sampleData, profileName } = body;

    console.log(`[schema-detector] Analyzing ${sampleData.length} sample records from ${sourceSystem}`);

    // Extract source schema
    const sourceSchema = Object.keys(sampleData[0] || {}).map(key => ({
      field: key,
      type: typeof sampleData[0][key],
      sample: sampleData[0][key]
    }));

    // Use AI to map to ESRS/GRI fields
    const prompt = `You are an ESG data mapping expert. Analyze this data schema from ${sourceSystem} and map it to ESRS (European Sustainability Reporting Standards) and GRI fields.

Source Schema:
${JSON.stringify(sourceSchema, null, 2)}

Sample Data:
${JSON.stringify(sampleData.slice(0, 3), null, 2)}

Return a JSON object with:
{
  "mappings": [
    {
      "sourceField": "field_name",
      "targetStandard": "ESRS E1" or "GRI 305",
      "targetField": "scope_1_emissions",
      "confidence": 0.95,
      "transformation": "multiply by 1000 to convert to kg",
      "reasoning": "why this mapping makes sense"
    }
  ],
  "overallConfidence": 0.85,
  "warnings": ["list of potential issues"]
}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an ESG data mapping expert. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const mappingResult = JSON.parse(aiData.choices[0].message.content);

    // Prepare target schema from mappings
    const targetSchema = mappingResult.mappings.map((m: any) => ({
      standard: m.targetStandard,
      field: m.targetField,
      transformation: m.transformation
    }));

    // Generate audit hash
    const auditData = JSON.stringify({ sourceSchema, targetSchema, timestamp: new Date().toISOString() });
    const encoder = new TextEncoder();
    const data = encoder.encode(auditData);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const auditHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Store mapping profile
    const { data: profile, error: dbError } = await supabase
      .from('esg_mapping_profiles')
      .insert({
        organization_id: organizationId,
        profile_name: profileName,
        source_system: sourceSystem,
        source_schema: sourceSchema,
        target_schema: targetSchema,
        confidence_score: mappingResult.overallConfidence,
        mapping_rules: mappingResult.mappings,
        validation_status: mappingResult.overallConfidence > 0.8 ? 'pending' : 'needs_review',
        audit_hash: auditHash,
      })
      .select()
      .single();

    if (dbError) {
      console.error('[schema-detector] Database error:', dbError);
      throw dbError;
    }

    // Log to audit trail
    await supabase.from('audit_logs').insert({
      organization_id: organizationId,
      module: 'schema_detector',
      action: 'create_mapping_profile',
      input_hash: auditHash,
      output_hash: auditHash,
      reasoning: `AI-detected schema mapping with ${mappingResult.overallConfidence * 100}% confidence`,
    });

    console.log(`[schema-detector] Created mapping profile: ${profile.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        profile,
        mappings: mappingResult.mappings,
        warnings: mappingResult.warnings,
        confidence: mappingResult.overallConfidence,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[schema-detector] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});