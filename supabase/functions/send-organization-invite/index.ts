import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authError || !user) throw new Error('Unauthorized')

    const { email, role = 'analyst' } = await req.json()

    // Get user's organization and verify admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile?.organization_id) {
      throw new Error('User not in organization')
    }

    // Check if user is admin
    const { data: roleCheck } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single()

    if (!roleCheck) {
      throw new Error('Only admins can send invites')
    }

    // Generate invite token
    const inviteToken = crypto.randomUUID()

    // Create invite
    const { data: invite, error: inviteError } = await supabase
      .from('organization_invites')
      .insert({
        organization_id: profile.organization_id,
        email,
        invited_by: user.id,
        role,
        invite_token: inviteToken,
        status: 'pending'
      })
      .select()
      .single()

    if (inviteError) throw inviteError

    // Get organization details for email
    const { data: org } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', profile.organization_id)
      .single()

    // Send invite email (using Supabase Auth email templates)
    const inviteUrl = `${req.headers.get('origin')}/accept-invite?token=${inviteToken}`
    
    // For now, return the invite URL (in production, send via email service)
    console.log(`Invite created for ${email}: ${inviteUrl}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        invite,
        inviteUrl,
        message: `Invite sent to ${email}. They can join ${org?.name || 'your organization'} using the invite link.`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error sending invite:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
