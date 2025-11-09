import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0'
import { corsHeaders } from '../_shared/cors.ts'
import { sanitizeInput } from '../_shared/sanitize.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// PII Detection Patterns
const PII_PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /\b(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}\b/g,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  credit_card: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
  iban: /\b[A-Z]{2}\d{2}[A-Z0-9]{4}\d{7}([A-Z0-9]?){0,16}\b/g,
  passport: /\b[A-Z]{1,2}\d{6,9}\b/g,
  ip_address: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g
}

interface PIIDetection {
  type: string
  original: string
  redacted: string
  position: number
}

function detectAndRedactPII(text: string): { redacted: string, detections: PIIDetection[] } {
  let redactedText = text
  const detections: PIIDetection[] = []
  
  // Email
  let match
  while ((match = PII_PATTERNS.email.exec(text)) !== null) {
    const email = match[0]
    const domain = email.split('@')[1]
    const redacted = `***@${domain}`
    detections.push({ type: 'email', original: email, redacted, position: match.index })
    redactedText = redactedText.replace(email, redacted)
  }
  
  // Phone
  PII_PATTERNS.phone.lastIndex = 0
  while ((match = PII_PATTERNS.phone.exec(text)) !== null) {
    const phone = match[0]
    const redacted = '***-***-' + phone.slice(-4)
    detections.push({ type: 'phone', original: phone, redacted, position: match.index })
    redactedText = redactedText.replace(phone, redacted)
  }
  
  // SSN
  PII_PATTERNS.ssn.lastIndex = 0
  while ((match = PII_PATTERNS.ssn.exec(text)) !== null) {
    const ssn = match[0]
    const redacted = '***-**-' + ssn.slice(-4)
    detections.push({ type: 'ssn', original: ssn, redacted, position: match.index })
    redactedText = redactedText.replace(ssn, redacted)
  }
  
  // Credit Card
  PII_PATTERNS.credit_card.lastIndex = 0
  while ((match = PII_PATTERNS.credit_card.exec(text)) !== null) {
    const card = match[0]
    const redacted = '****-****-****-' + card.replace(/[-\s]/g, '').slice(-4)
    detections.push({ type: 'credit_card', original: card, redacted, position: match.index })
    redactedText = redactedText.replace(card, redacted)
  }
  
  // IBAN
  PII_PATTERNS.iban.lastIndex = 0
  while ((match = PII_PATTERNS.iban.exec(text)) !== null) {
    const iban = match[0]
    const redacted = iban.slice(0, 4) + '****' + iban.slice(-4)
    detections.push({ type: 'iban', original: iban, redacted, position: match.index })
    redactedText = redactedText.replace(iban, redacted)
  }
  
  return { redacted: redactedText, detections }
}

async function hashText(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile?.organization_id) {
      throw new Error('No organization found')
    }

    // Check organization settings
    const { data: orgSettings } = await supabase
      .from('organization_settings' as any)
      .select('auto_redact_pii, allow_raw_embeddings')
      .eq('organization_id', profile.organization_id)
      .single()

    const { text, source_table, source_id } = await req.json()

    if (!text || !source_table || !source_id) {
      throw new Error('text, source_table, and source_id are required')
    }

    const sanitizedText = sanitizeInput(text)

    // If PII redaction is disabled for this org, return original
    if (orgSettings?.allow_raw_embeddings && !orgSettings?.auto_redact_pii) {
      return new Response(
        JSON.stringify({
          success: true,
          redacted_text: sanitizedText,
          detections: [],
          redaction_applied: false
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Detect and redact PII
    const { redacted, detections } = detectAndRedactPII(sanitizedText)

    // Log each detection
    for (const detection of detections) {
      const originalHash = await hashText(detection.original)
      
      await supabase.from('pii_redactions' as any).insert({
        organization_id: profile.organization_id,
        source_table,
        source_id,
        pii_type: detection.type,
        original_text_hash: originalHash,
        redacted_text: detection.redacted,
        detection_method: 'regex',
        redacted_by: user.id
      })
    }

    // Log to audit trail
    await supabase.from('audit_logs').insert({
      organization_id: profile.organization_id,
      agent: 'pii_redactor',
      action: 'redact_pii',
      event_type: 'data_protection',
      event_category: 'gdpr_compliance',
      status: 'success',
      input_hash: await hashText(sanitizedText),
      request_payload: {
        source_table,
        source_id,
        detection_count: detections.length
      },
      response_summary: {
        pii_types_found: [...new Set(detections.map(d => d.type))],
        redaction_applied: detections.length > 0
      }
    })

    return new Response(
      JSON.stringify({
        success: true,
        redacted_text: redacted,
        detections: detections.map(d => ({ type: d.type, position: d.position })),
        redaction_applied: detections.length > 0,
        message: `Detected and redacted ${detections.length} PII instances`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in pii-redactor:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
