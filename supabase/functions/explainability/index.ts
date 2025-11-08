import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0'
import { corsHeaders } from '../_shared/cors.ts'

interface ExplainabilityRequest {
  assessment_id: string
  assessment_type: 'ai_act' | 'gdpr' | 'esg'
  user_question: string
  organization_id: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured')
    }

    const { assessment_id, assessment_type, user_question, organization_id }: ExplainabilityRequest = await req.json()

    console.log(`Explainability request for ${assessment_type} assessment ${assessment_id}`)

    // Fetch the original assessment
    let assessmentData: any = null
    let tableName = ''

    switch (assessment_type) {
      case 'ai_act':
        tableName = 'ai_act_assessments'
        const { data: aiActData } = await supabase
          .from('ai_act_assessments')
          .select('*, ai_systems(*)')
          .eq('id', assessment_id)
          .single()
        assessmentData = aiActData
        break
      
      case 'gdpr':
        tableName = 'gdpr_assessments'
        const { data: gdprData } = await supabase
          .from('gdpr_assessments')
          .select('*')
          .eq('id', assessment_id)
          .single()
        assessmentData = gdprData
        break
      
      case 'esg':
        tableName = 'esg_reports'
        const { data: esgData } = await supabase
          .from('esg_reports')
          .select('*')
          .eq('id', assessment_id)
          .single()
        assessmentData = esgData
        break
    }

    if (!assessmentData) {
      return new Response(
        JSON.stringify({ error: 'Assessment not found' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        }
      )
    }

    // Fetch related audit logs
    const { data: auditLogs } = await supabase
      .from('audit_logs')
      .select('reasoning_chain, response_summary')
      .eq('organization_id', organization_id)
      .eq('response_summary->>assessment_id', assessment_id)
      .order('timestamp', { ascending: false })
      .limit(1)

    const reasoning = auditLogs?.[0]?.reasoning_chain || {}
    const responseSummary = auditLogs?.[0]?.response_summary || {}

    // Search for relevant regulatory context
    const { data: ragResults } = await supabase
      .from('document_chunks')
      .select('content, metadata')
      .textSearch('content', user_question, { type: 'websearch' })
      .limit(3)

    const evidenceContext = ragResults?.map(r => 
      `[${r.metadata?.source || 'Regulation'} - ${r.metadata?.section || 'N/A'}]: ${r.content.substring(0, 300)}`
    ).join('\n\n') || 'No specific regulatory context found'

    // Generate explanation using LLM
    const systemPrompt = `You are a compliance expert providing clear explanations. Answer the user's question about a compliance assessment based on the assessment data and regulatory context.

Assessment Type: ${assessment_type.toUpperCase()}
Assessment Data: ${JSON.stringify(assessmentData, null, 2)}
Reasoning Chain: ${JSON.stringify(reasoning, null, 2)}
Response Summary: ${JSON.stringify(responseSummary, null, 2)}

Relevant Regulatory Context:
${evidenceContext}

Provide a clear, detailed answer with specific references to regulations and assessment findings.`

    const llmResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: user_question }
        ]
      })
    })

    if (!llmResponse.ok) {
      const errorText = await llmResponse.text()
      console.error('LLM API error:', llmResponse.status, errorText)
      throw new Error(`LLM API error: ${llmResponse.status}`)
    }

    const llmData = await llmResponse.json()
    const answer = llmData.choices?.[0]?.message?.content || 'Unable to generate explanation'

    // Store explainability view
    const { data: explainView, error: insertError } = await supabase
      .from('explainability_views')
      .insert({
        assessment_id,
        assessment_type,
        user_question,
        answer,
        evidence_chunks: ragResults?.map(r => ({
          source: r.metadata?.source || 'Unknown',
          section: r.metadata?.section || 'N/A',
          content: r.content.substring(0, 500)
        }))
      })
      .select()
      .single()

    if (insertError) {
      console.error('Failed to store explainability view:', insertError)
    }

    console.log('Explainability response generated:', explainView?.id)

    return new Response(
      JSON.stringify({
        success: true,
        answer,
        evidence: ragResults?.map(r => ({
          source: r.metadata?.source || 'Unknown',
          section: r.metadata?.section || 'N/A',
          content: r.content.substring(0, 500)
        })),
        explainability_id: explainView?.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Explainability error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
