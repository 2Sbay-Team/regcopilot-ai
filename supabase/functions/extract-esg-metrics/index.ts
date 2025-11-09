import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { document_id } = await req.json()

    // Get the analyzed document
    const { data: document, error: docError } = await supabaseClient
      .from('uploaded_documents')
      .select('*')
      .eq('id', document_id)
      .eq('doc_type', 'esg')
      .single()

    if (docError || !document) {
      return new Response(JSON.stringify({ error: 'Document not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (document.status !== 'completed') {
      return new Response(JSON.stringify({ error: 'Document analysis not completed' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const extractedData = document.extracted_data as any

    // Map extracted data to ESG form fields
    const enrichment = {
      reporting_period: extractedData.reporting_period || '',
      scope1_emissions: extractedData.scope1_emissions || 0,
      scope2_emissions: extractedData.scope2_emissions || 0,
      scope3_emissions: extractedData.scope3_emissions || 0,
      energy_consumption: extractedData.energy_consumption || 0,
      renewable_energy_percentage: extractedData.renewable_energy_percentage || 0,
      water_consumption: extractedData.water_consumption || 0,
      waste_generated: extractedData.waste_generated || 0,
      employee_count: extractedData.employee_count || 0,
      gender_diversity: extractedData.gender_diversity || {},
      safety_incidents: extractedData.safety_incidents || 0,
      kpis: extractedData.kpis || [],
      esrs_alignment: extractedData.esrs_alignment || [],
      completeness_score: extractedData.completeness_score || 0,
    }

    return new Response(
      JSON.stringify({
        success: true,
        enrichment,
        summary: document.extracted_summary,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error extracting ESG metrics:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})