// ============================================================================
// Check Password Expiry Edge Function
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

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // Get user's profile with password expiry info
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('password_expires_at, force_password_change, password_changed_at, password_expiry_days')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Profile error:', profileError)
      throw new Error('Failed to get profile')
    }

    const now = new Date()
    const expiresAt = profile.password_expires_at ? new Date(profile.password_expires_at) : null
    const changedAt = profile.password_changed_at ? new Date(profile.password_changed_at) : null

    let isExpired = false
    let daysUntilExpiry = null
    let reason = null

    // Check if force password change is set
    if (profile.force_password_change) {
      isExpired = true
      reason = 'Administrator has required a password change'
    }
    // Check if password has expired
    else if (expiresAt && expiresAt < now) {
      isExpired = true
      reason = 'Password has expired'
      daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    }
    // Check days until expiry for warnings
    else if (expiresAt) {
      daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    }

    // Check account lockout status
    const { data: lockoutCheck } = await supabaseClient
      .rpc('is_account_locked', { user_email: user.email })

    return new Response(JSON.stringify({
      expired: isExpired,
      reason,
      days_until_expiry: daysUntilExpiry,
      password_changed_at: changedAt?.toISOString(),
      password_expires_at: expiresAt?.toISOString(),
      password_expiry_days: profile.password_expiry_days,
      force_password_change: profile.force_password_change,
      account_status: lockoutCheck
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Password expiry check error:', error)
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
