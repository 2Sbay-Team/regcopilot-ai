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

    console.log('Monitoring for new ESG regulations...');

    // Get existing regulations from database
    const { data: existingRegs } = await supabase
      .from('esg_regulation_updates')
      .select('regulation_name, version')
      .order('detected_at', { ascending: false })
      .limit(50);

    // Use LLM to search for new regulations
    const monitoringPrompt = `You are an ESG regulatory monitoring expert. Check for new or updated regulations in:
- ESRS (European Sustainability Reporting Standards)
- CSRD (Corporate Sustainability Reporting Directive)
- SFDR (Sustainable Finance Disclosure Regulation)
- EU Taxonomy
- Other relevant ESG frameworks

Existing regulations we know about:
${JSON.stringify(existingRegs, null, 2)}

Search for and identify any NEW regulations, amendments, or updates that have been published recently.

Return a JSON object with:
- new_regulations: Array of new/updated regulations with:
  - regulation_name
  - regulation_type (ESRS/CSRD/SFDR/etc)
  - version
  - effective_date
  - summary (brief description)
  - impact_assessment (how it affects reporting)
  - key_changes (what's new)

If no new regulations, return empty array.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'You are an ESG regulatory expert with access to latest regulatory updates. Always return valid JSON.' 
          },
          { role: 'user', content: monitoringPrompt }
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
    const monitoringResult = JSON.parse(aiResult.choices[0].message.content);
    const newRegulations = monitoringResult.new_regulations || [];

    console.log('Found new regulations:', newRegulations.length);

    // Insert new regulations
    if (newRegulations.length > 0) {
      const regsToInsert = newRegulations.map((reg: any) => ({
        regulation_name: reg.regulation_name,
        regulation_type: reg.regulation_type,
        version: reg.version,
        effective_date: reg.effective_date,
        summary: reg.summary,
        impact_assessment: reg.impact_assessment,
        metadata: {
          key_changes: reg.key_changes,
          detected_via: 'llm_monitoring'
        }
      }));

      const { data: insertedRegs, error: insertError } = await supabase
        .from('esg_regulation_updates')
        .insert(regsToInsert)
        .select();

      if (insertError) throw insertError;

      return new Response(
        JSON.stringify({
          success: true,
          new_regulations_found: insertedRegs?.length || 0,
          regulations: insertedRegs
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        new_regulations_found: 0,
        message: 'No new regulations detected'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error monitoring regulations:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
