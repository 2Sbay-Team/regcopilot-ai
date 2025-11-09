// ============================================================================
// Log Login Attempt Edge Function
// ============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, success, user_agent } = await req.json()

    if (!email) {
      throw new Error('Email is required')
    }

    // Get organization ID if user exists
    let organizationId = null
    if (success) {
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('organization_id')
        .eq('email', email)
        .single()
      
      organizationId = profile?.organization_id
    }

    // Get IP address from request
    const ip_address = req.headers.get('x-forwarded-for') || 
                       req.headers.get('x-real-ip') || 
                       'unknown'

    // Log the attempt
    const { error: logError } = await supabaseClient
      .from('login_attempts')
      .insert({
        user_email: email,
        organization_id: organizationId,
        success,
        ip_address,
        user_agent: user_agent || req.headers.get('user-agent'),
        created_at: new Date().toISOString()
      })

    if (logError) {
      console.error('Failed to log login attempt:', logError)
    }

    // Check if account should be locked
    const { data: lockoutStatus } = await supabaseClient
      .rpc('is_account_locked', { user_email: email })

    return new Response(JSON.stringify({
      success: true,
      lockout_status: lockoutStatus
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Login attempt logging error:', error)
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
