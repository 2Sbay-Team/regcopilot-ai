import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

// Zod validation schema
const GDPRRequestSchema = z.object({
  org_id: z.string().uuid('Invalid organization ID'),
  payload: z.object({
    documents: z.array(z.string().max(100000, 'Document exceeds 100KB limit')).max(50, 'Too many documents (max 50)').optional(),
    vendor_agreements: z.array(z.string().max(50000, 'Vendor agreement exceeds 50KB limit')).max(50, 'Too many agreements (max 50)').optional(),
    systems: z.array(z.record(z.any())).max(100, 'Too many systems (max 100)').optional()
  })
})

interface GDPRRequest {
  org_id: string
  payload: {
    documents?: string[]
    vendor_agreements?: string[]
    systems?: Record<string, any>[]
  }
}

interface GDPRResponse {
  findings: Array<{ category: string; description: string; severity: string }>
  violations: Array<{ article: string; description: string }>
  citations: Array<{ source: string; content: string }>
  assessment_id?: string
}

// Simple PII detection patterns
const PII_PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
}

function detectPII(text: string): string[] {
  const detected: string[] = []
  if (PII_PATTERNS.email.test(text)) detected.push('Email addresses')
  if (PII_PATTERNS.phone.test(text)) detected.push('Phone numbers')
  if (PII_PATTERNS.ssn.test(text)) detected.push('Social Security Numbers')
  return detected
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
    const validationResult = GDPRRequestSchema.safeParse(rawBody)
    
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

    const body = validationResult.data as GDPRRequest

    // Analyze documents for PII
    const allText = [
      ...(body.payload.documents || []),
      ...(body.payload.vendor_agreements || [])
    ].join(' ')

    const piiDetected = detectPII(allText)
    const violations: GDPRResponse['violations'] = []
    const findings: GDPRResponse['findings'] = []

    // Deterministic GDPR rules
    if (piiDetected.length > 0 && !allText.toLowerCase().includes('retention')) {
      violations.push({
        article: 'Article 5(1)(e)',
        description: 'Personal data detected without clear retention period specified'
      })
      findings.push({
        category: 'Data Retention',
        description: `Found ${piiDetected.join(', ')} but no retention policy documented`,
        severity: 'high'
      })
    }

    if (allText.toLowerCase().includes('us') && allText.toLowerCase().includes('transfer')) {
      violations.push({
        article: 'Chapter V',
        description: 'Potential third-country data transfer to US without adequate safeguards documented'
      })
      findings.push({
        category: 'Cross-Border Transfers',
        description: 'Third-country transfers require GDPR Chapter V compliance (SCCs, adequacy decision)',
        severity: 'high'
      })
    }

    // RAG: Get GDPR guidance
    const { data: chunks } = await supabaseClient
      .from('document_chunks')
      .select('content, metadata')
      .textSearch('content', 'GDPR personal data retention', { type: 'websearch' })
      .limit(2)

    const ragContext = chunks?.map(c => c.content).join('\n\n') || ''

    // LLM analysis
    const prompt = `You are a GDPR compliance expert. Analyze these findings:

Detected PII: ${piiDetected.join(', ') || 'None'}
Violations: ${violations.map(v => v.article).join(', ') || 'None'}

Context from GDPR:
${ragContext}

Provide a concise compliance summary (max 250 words) with:
1. Key risks identified
2. Article violations
3. Remediation recommendations`

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const aiData = await aiResponse.json()
    const summary = aiData.choices?.[0]?.message?.content || 'Unable to generate analysis'

    // Store assessment
    const { data: assessment } = await supabaseClient
      .from('gdpr_assessments')
      .insert({
        organization_id: body.org_id,
        assessor_id: user.id,
        violations: violations,
        findings: { pii_detected: piiDetected, findings },
        summary,
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
      new TextEncoder().encode(summary)
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
      agent: 'gdpr_checker',
      event_type: 'assessment',
      event_category: 'compliance',
      actor_id: user.id,
      action: 'gdpr_scan',
      status: 'success',
      request_payload: { pii_types: piiDetected },
      response_summary: { violations: violations.length, findings: findings.length },
      reasoning_chain: { pii_detected: piiDetected, rules_triggered: violations.map(v => v.article) },
      input_hash: Array.from(new Uint8Array(inputHash)).map(b => b.toString(16).padStart(2, '0')).join(''),
      output_hash: Array.from(new Uint8Array(outputHash)).map(b => b.toString(16).padStart(2, '0')).join(''),
      prev_hash: prevLog?.output_hash || '0'.repeat(64)
    })

    const citations = chunks?.map(c => ({
      source: c.metadata?.source || 'GDPR',
      content: c.content.substring(0, 200) + '...'
    })) || []

    const response: GDPRResponse = {
      findings,
      violations,
      citations,
      assessment_id: assessment?.id
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in gdpr-checker:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
