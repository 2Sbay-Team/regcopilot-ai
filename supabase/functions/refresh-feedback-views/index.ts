import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify admin role
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // Check admin role
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single()

    if (!roles) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      throw new Error('Profile not found')
    }

    // Refresh materialized view
    await supabase.rpc('refresh_chunk_feedback_scores')

    // Log admin action
    const inputHashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('refresh_mv'))
    const outputHashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('success'))
    const inputHash = Array.from(new Uint8Array(inputHashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('').padStart(64, '0')
    const outputHash = Array.from(new Uint8Array(outputHashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('').padStart(64, '0')

    await supabase.from('audit_logs').insert({
      organization_id: profile.organization_id,
      actor_id: user.id,
      agent: 'admin',
      event_type: 'admin_action',
      event_category: 'admin_action',
      action: 'refresh_feedback_views',
      status: 'success',
      input_hash: inputHash,
      output_hash: outputHash
    })

    return new Response(
      JSON.stringify({ success: true, message: 'Feedback views refreshed successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error refreshing feedback views:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
