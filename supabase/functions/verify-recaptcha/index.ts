import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VerifyRequest {
  token: string
  email?: string
}

interface RecaptchaResponse {
  success: boolean
  challenge_ts?: string
  hostname?: string
  score?: number
  action?: string
  'error-codes'?: string[]
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { token, email } = await req.json() as VerifyRequest

    if (!token) {
      console.error('[verify-recaptcha] Missing reCAPTCHA token')
      return new Response(
        JSON.stringify({ success: false, error: 'Missing reCAPTCHA token' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const secretKey = Deno.env.get('RECAPTCHA_SECRET_KEY')
    if (!secretKey) {
      console.error('[verify-recaptcha] RECAPTCHA_SECRET_KEY not configured')
      return new Response(
        JSON.stringify({ success: false, error: 'reCAPTCHA not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[verify-recaptcha] Verifying token for:', email || 'unknown user')

    // Verify with Google reCAPTCHA API
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify`
    const verifyResponse = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${secretKey}&response=${token}`
    })

    const verifyData = await verifyResponse.json() as RecaptchaResponse

    console.log('[verify-recaptcha] Google response:', {
      success: verifyData.success,
      hostname: verifyData.hostname,
      errorCodes: verifyData['error-codes']
    })

    if (!verifyData.success) {
      console.warn('[verify-recaptcha] Verification failed:', verifyData['error-codes'])
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'reCAPTCHA verification failed',
          errorCodes: verifyData['error-codes']
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Optional: Log successful verification to Supabase
    if (email) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, supabaseKey)

      await supabase.from('auth_audit_logs').insert({
        event_type: 'recaptcha_verified',
        user_email: email,
        metadata: {
          challenge_ts: verifyData.challenge_ts,
          hostname: verifyData.hostname
        }
      })
    }

    console.log('[verify-recaptcha] Verification successful')
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[verify-recaptcha] Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
