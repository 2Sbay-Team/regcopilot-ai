import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0'
import { corsHeaders } from '../_shared/cors.ts'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'
import { sanitizeInput, sanitizeObject, createStructuredMessages } from '../_shared/sanitize.ts'

// Zod validation schema
const AIActRequestSchema = z.object({
  org_id: z.string().uuid('Invalid organization ID'),
  system: z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1, 'System name is required').max(200, 'System name too long'),
    purpose: z.string().min(1, 'Purpose is required').max(2000, 'Purpose description too long'),
    sector: z.string().min(1, 'Sector is required').max(100, 'Sector too long'),
    model_type: z.string().max(100).optional()
  })
})

interface AIActRequest {
  org_id: string
  system: {
    id?: string
    name: string
    purpose: string
    sector: string
    model_type?: string
  }
}

interface AIActResponse {
  risk_class: string
  report: string
  citations: Array<{ source: string; content: string }>
  assessment_id?: string
}

async function getUserFromRequest(supabaseClient: any, req: Request) {
  const { data: { user } } = await supabaseClient.auth.getUser()
  if (user) return user
  const auth = req.headers.get('authorization') || req.headers.get('Authorization')
  if (auth && auth.startsWith('Bearer ')) {
    const token = auth.substring(7)
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
      if (payload?.sub) return { id: payload.sub }
    } catch (_) {
      // ignore
    }
  }
  return null
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const user = await getUserFromRequest(supabaseClient, req)
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Parse and validate request body
    const rawBody = await req.json()
    const validationResult = AIActRequestSchema.safeParse(rawBody)
    
    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error)
      return new Response(JSON.stringify({ 
        error: 'Invalid request data', 
        details: validationResult.error.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message
        }))
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const body = validationResult.data as AIActRequest

    // Sanitize user inputs to prevent prompt injection
    const sanitizedSystem = sanitizeObject(body.system)

    // Deterministic risk classification based on sector (EU AI Act Annex III)
    const highRiskSectors = [
      'biometric', 'employment', 'law_enforcement', 'education', 
      'critical_infrastructure', 'essential_services', 'migration', 'justice'
    ]
    
    let riskClass = 'minimal'
    const sector = sanitizedSystem.sector?.toLowerCase() || ''
    
    if (highRiskSectors.some(s => sector.includes(s))) {
      riskClass = 'high'
    } else if (sector.includes('health') || sector.includes('safety')) {
      riskClass = 'limited'
    }

    // RAG: Retrieve relevant chunks from regulatory documents
    // Use sanitized purpose for search to prevent injection
    const searchQuery = sanitizeInput(body.system.purpose, 200)
    const { data: chunks } = await supabaseClient
      .from('document_chunks')
      .select('content, metadata')
      .textSearch('content', searchQuery, { type: 'websearch' })
      .limit(3)

    const ragContext = chunks?.map(c => c.content.substring(0, 500)).join('\n\n') || ''

    // Use structured messages with clear role separation
    const systemPrompt = `You are an EU AI Act compliance expert. Analyze the provided AI system data and generate a concise Annex IV-style compliance summary (max 300 words).

Include:
1. Risk classification justification
2. Key compliance requirements under EU AI Act
3. Recommended next steps for compliance

Regulatory Context:
${ragContext}`

    const userContext = {
      system_name: sanitizedSystem.name,
      purpose: sanitizedSystem.purpose,
      sector: sanitizedSystem.sector,
      detected_risk_class: riskClass,
      high_risk_sectors_matched: highRiskSectors.filter(s => sector.includes(s))
    }

    const messages = createStructuredMessages(systemPrompt, userContext)

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
      }),
    })

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text()
      console.error('AI Gateway error:', aiResponse.status, errorText)
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again in a few moments.',
          code: 'RATE_LIMIT_EXCEEDED'
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'AI credits exhausted. Please add credits to your workspace.',
          code: 'PAYMENT_REQUIRED'
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
      throw new Error(`AI Gateway error: ${aiResponse.status}`)
    }

    const aiData = await aiResponse.json()
    const report = aiData.choices?.[0]?.message?.content || 'Unable to generate report'

    // Store assessment
    const { data: assessment, error: insertError } = await supabaseClient
      .from('ai_act_assessments')
      .insert({
        ai_system_id: body.system.id || null,
        assessor_id: user.id,
        risk_category: riskClass,
        annex_iv_summary: report,
        findings: { deterministic_risk: riskClass, sectors_matched: highRiskSectors.filter(s => sector.includes(s)) },
        status: 'completed'
      })
      .select()
      .single()

    if (insertError) {
      console.error('Failed to store assessment:', insertError)
    }

    // Create audit log entry with hash chain
    const inputHash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(JSON.stringify(body))
    )
    const outputHash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(report)
    )

    // Get previous hash
    const { data: prevLog } = await supabaseClient
      .from('audit_logs')
      .select('output_hash')
      .eq('organization_id', body.org_id)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single()

    const prevHash = prevLog?.output_hash || '0'.repeat(64)

    await supabaseClient.from('audit_logs').insert({
      organization_id: body.org_id,
      agent: 'ai_act_checker',
      event_type: 'assessment',
      event_category: 'compliance',
      actor_id: user.id,
      action: 'classify_ai_system',
      status: 'success',
      request_payload: body,
      response_summary: { risk_class: riskClass, assessment_id: assessment?.id },
      reasoning_chain: { deterministic: riskClass, llm_messages: messages.length, sanitized: true },
      input_hash: Array.from(new Uint8Array(inputHash)).map(b => b.toString(16).padStart(2, '0')).join(''),
      output_hash: Array.from(new Uint8Array(outputHash)).map(b => b.toString(16).padStart(2, '0')).join(''),
      prev_hash: prevHash
    })

    const citations = chunks?.map(c => ({
      source: c.metadata?.source || 'EU AI Act',
      content: c.content.substring(0, 200) + '...'
    })) || []

    const response: AIActResponse = {
      risk_class: riskClass,
      report,
      citations,
      assessment_id: assessment?.id
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in ai-act-auditor:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
