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
      .eq('doc_type', 'gdpr')
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

    // Map extracted data to GDPR form fields
    const enrichment = {
      data_categories: extractedData.data_categories || [],
      legal_basis: extractedData.legal_basis || '',
      data_subjects: extractedData.data_subjects || [],
      retention_period: extractedData.retention_period || '',
      processing_purposes: extractedData.processing_purposes || [],
      third_country_transfers: extractedData.third_country_transfers || false,
      violations: extractedData.violations || [],
      risk_level: extractedData.risk_level || 'low',
      recommendations: extractedData.recommendations || [],
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
    console.error('Error enriching GDPR assessment:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})