import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'
import { sanitizeInput, createStructuredMessages } from '../_shared/sanitize.ts'

// Zod validation schema
const ESGRequestSchema = z.object({
  org_id: z.string().uuid('Invalid organization ID'),
  data: z.object({
    period: z.string().regex(/^\d{4}(-Q[1-4])?$/, 'Period must be YYYY or YYYY-QX format'),
    co2_scope1: z.number().nonnegative('Scope 1 emissions cannot be negative').max(1e9, 'Value unrealistically high').optional(),
    co2_scope2: z.number().nonnegative('Scope 2 emissions cannot be negative').max(1e9, 'Value unrealistically high').optional(),
    co2_scope3: z.number().nonnegative('Scope 3 emissions cannot be negative').max(1e9, 'Value unrealistically high').optional(),
    energy_mwh: z.number().nonnegative('Energy consumption cannot be negative').max(1e12, 'Value unrealistically high').optional(),
    water_m3: z.number().nonnegative('Water usage cannot be negative').max(1e12, 'Value unrealistically high').optional(),
    diversity: z.record(z.any()).optional()
  })
})

interface ESGRequest {
  org_id: string
  data: {
    period: string
    co2_scope1?: number
    co2_scope2?: number
    co2_scope3?: number
    energy_mwh?: number
    water_m3?: number
    diversity?: Record<string, any>
  }
}

interface ESGResponse {
  metrics: Record<string, any>
  narrative: string
  citations: Array<{ source: string; content: string }>
  completeness_score: number
  report_id?: string
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

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Parse and validate request body
    const rawBody = await req.json()
    const validationResult = ESGRequestSchema.safeParse(rawBody)
    
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

    const body = validationResult.data as ESGRequest

    // Sanitize period string to prevent injection
    const sanitizedPeriod = sanitizeInput(body.data.period, 20)

    // Calculate metrics and map to ESRS codes
    const totalCO2 = (body.data.co2_scope1 || 0) + (body.data.co2_scope2 || 0) + (body.data.co2_scope3 || 0)
    const metrics = {
      'ESRS E1-1': { name: 'Total GHG Emissions', value: totalCO2, unit: 'tCO2e' },
      'ESRS E1-2': { name: 'Scope 1 Emissions', value: body.data.co2_scope1 || 0, unit: 'tCO2e' },
      'ESRS E1-3': { name: 'Scope 2 Emissions', value: body.data.co2_scope2 || 0, unit: 'tCO2e' },
      'ESRS E1-4': { name: 'Scope 3 Emissions', value: body.data.co2_scope3 || 0, unit: 'tCO2e' },
      'ESRS E1-5': { name: 'Energy Consumption', value: body.data.energy_mwh || 0, unit: 'MWh' },
    }

    // Calculate completeness
    const requiredFields: (keyof typeof body.data)[] = ['co2_scope1', 'co2_scope2', 'co2_scope3', 'energy_mwh']
    const providedFields = requiredFields.filter(f => body.data[f] !== undefined && body.data[f] !== null)
    const completeness = Math.round((providedFields.length / requiredFields.length) * 100)

    // Store metrics
    const metricsToInsert = Object.entries(metrics).map(([code, data]) => ({
      organization_id: body.org_id,
      reporting_period: sanitizedPeriod,
      metric_category: 'environmental',
      metric_name: data.name,
      metric_code: code,
      value: data.value,
      unit: data.unit,
      verified: false
    }))

    await supabaseClient.from('esg_metrics').insert(metricsToInsert)

    // RAG: Get ESRS guidance
    const { data: chunks } = await supabaseClient
      .from('document_chunks')
      .select('content, metadata')
      .textSearch('content', 'ESRS climate emissions', { type: 'websearch' })
      .limit(2)

    const ragContext = chunks?.map(c => c.content.substring(0, 500)).join('\n\n') || ''

    // Use structured messages with clear role separation
    const systemPrompt = `You are an ESG reporting expert specializing in CSRD compliance. Generate a concise narrative (max 300 words) for the provided environmental metrics.

Cover:
1. Environmental performance summary
2. Key trends and insights from the data
3. Alignment with ESRS E1 requirements

ESRS Regulatory Context:
${ragContext}`

    const userContext = {
      reporting_period: sanitizedPeriod,
      emissions: {
        total_co2_tco2e: Number(totalCO2.toFixed(2)),
        scope_1_tco2e: body.data.co2_scope1 || 0,
        scope_2_tco2e: body.data.co2_scope2 || 0,
        scope_3_tco2e: body.data.co2_scope3 || 0
      },
      energy_consumption_mwh: body.data.energy_mwh || 0,
      water_usage_m3: body.data.water_m3 || 0,
      esrs_metrics: metrics,
      completeness_percentage: completeness
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
    const narrative = aiData.choices?.[0]?.message?.content || 'Unable to generate narrative'

    // Detect anomalies
    const anomalies: string[] = []
    if (totalCO2 === 0) anomalies.push('Total emissions reported as zero - verify data accuracy')
    if (body.data.co2_scope3 && body.data.co2_scope3 > (body.data.co2_scope1 || 0) * 10) {
      anomalies.push('Scope 3 significantly higher than Scope 1 - review supply chain emissions')
    }

    // Store report
    const { data: report } = await supabaseClient
      .from('esg_reports')
      .insert({
        organization_id: body.org_id,
        reporting_period: sanitizedPeriod,
        narrative_sections: { environmental: narrative },
        metrics_summary: metrics,
        anomalies_detected: anomalies,
        completeness_score: completeness,
        status: 'completed'
      })
      .select()
      .single()

    // Audit log
    const inputHash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(JSON.stringify(body))
    )
    const outputHash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(narrative)
    )

    const { data: prevLog } = await supabaseClient
      .from('audit_logs')
      .select('output_hash')
      .eq('organization_id', body.org_id)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single()

    await supabaseClient.from('audit_logs').insert({
      organization_id: body.org_id,
      agent: 'esg_reporter',
      event_type: 'report',
      event_category: 'sustainability',
      actor_id: user.id,
      action: 'generate_esg_report',
      status: 'success',
      request_payload: { period: sanitizedPeriod },
      response_summary: { total_co2: totalCO2, completeness },
      reasoning_chain: { metrics_calculated: Object.keys(metrics), anomalies, sanitized: true },
      input_hash: Array.from(new Uint8Array(inputHash)).map(b => b.toString(16).padStart(2, '0')).join(''),
      output_hash: Array.from(new Uint8Array(outputHash)).map(b => b.toString(16).padStart(2, '0')).join(''),
      prev_hash: prevLog?.output_hash || '0'.repeat(64)
    })

    const citations = chunks?.map(c => ({
      source: c.metadata?.source || 'CSRD/ESRS',
      content: c.content.substring(0, 200) + '...'
    })) || []

    const response: ESGResponse = {
      metrics,
      narrative,
      citations,
      completeness_score: completeness,
      report_id: report?.id
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in esg-reporter:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
