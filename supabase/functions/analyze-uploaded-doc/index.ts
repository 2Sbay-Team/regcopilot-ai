import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0'
import { corsHeaders } from '../_shared/cors.ts'

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')

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

    const { document_id, file_path, doc_type } = await req.json()

    // Update status to processing
    await supabaseClient
      .from('uploaded_documents')
      .update({ status: 'processing' })
      .eq('id', document_id)

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabaseClient
      .storage
      .from(doc_type === 'ai_act' ? 'ai-act-documents' : doc_type === 'gdpr' ? 'gdpr-documents' : 'esg-documents')
      .download(file_path)

    if (downloadError) throw downloadError

    // Convert blob to text (simplified - in production, use proper parsers)
    const text = await fileData.text()
    const truncatedText = text.slice(0, 15000) // Limit for AI analysis

    // Check upload policy for embeddings
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    const { data: policy } = await supabaseClient
      .from('upload_policies')
      .select('allow_embeddings')
      .eq('organization_id', profile?.organization_id)
      .single()

    // Analyze document with AI
    const prompt = `Analyze this ${doc_type.replace('_', ' ')} document and extract key information.
    
Document content:
${truncatedText}

For AI Act documents, extract: purpose, sector, risk indicators, system type
For GDPR documents, extract: data categories, legal basis, data subjects, retention period, processing purposes
For ESG documents, extract: CO2 emissions, energy consumption, diversity metrics, sustainability KPIs

Return a JSON object with relevant fields and a summary.`

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a compliance document analyzer. Extract structured data from documents.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      }),
    })

    if (!aiResponse.ok) {
      throw new Error(`AI Gateway error: ${aiResponse.status}`)
    }

    const aiData = await aiResponse.json()
    const analysis = aiData.choices[0].message.content

    let extractedData: any
    try {
      extractedData = JSON.parse(analysis)
    } catch {
      extractedData = { raw_analysis: analysis }
    }

    // Generate embeddings if enabled
    if (policy?.allow_embeddings) {
      const embeddingResponse = await fetch('https://ai.gateway.lovable.dev/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-3-large',
          input: truncatedText.slice(0, 8000),
        }),
      })

      if (embeddingResponse.ok) {
        const embeddingData = await embeddingResponse.json()
        const embedding = embeddingData.data[0].embedding

        // Store chunk in document_chunks
        await supabaseClient.from('document_chunks').insert({
          content: truncatedText.slice(0, 8000),
          embedding,
          chunk_index: 0,
          metadata: {
            source: file_path,
            doc_type,
            document_id,
          }
        })
      }
    }

    // Update document with extracted data
    await supabaseClient
      .from('uploaded_documents')
      .update({
        status: 'completed',
        extracted_summary: extractedData.summary || 'Analysis completed',
        extracted_data: extractedData,
        analyzed_at: new Date().toISOString(),
      })
      .eq('id', document_id)

    // Log to audit trail
    await supabaseClient.from('audit_logs').insert({
      organization_id: profile?.organization_id,
      agent: 'document-analyzer',
      action: 'analyze_document',
      event_type: 'document_analysis',
      status: 'success',
      input_hash: document_id,
      output_hash: document_id,
      request_payload: { doc_type, file_path },
      response_summary: extractedData,
    })

    return new Response(
      JSON.stringify({
        success: true,
        extracted_data: extractedData,
        document_id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error analyzing document:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})