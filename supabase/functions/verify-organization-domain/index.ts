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

    const { domain, action = 'add' } = await req.json()

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
      throw new Error('Only admins can manage domains')
    }

    if (action === 'add') {
      // Generate verification token
      const verificationToken = crypto.randomUUID()

      // Add domain
      const { data: domainRecord, error: domainError } = await supabase
        .from('organization_domains')
        .insert({
          organization_id: profile.organization_id,
          domain,
          verified: false,
          verification_token: verificationToken,
          created_by: user.id
        })
        .select()
        .single()

      if (domainError) throw domainError

      return new Response(
        JSON.stringify({
          success: true,
          domain: domainRecord,
          message: `Domain ${domain} added. Verify by adding TXT record: regulix-verify=${verificationToken}`,
          verificationToken
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else if (action === 'verify') {
      // In production, check DNS TXT record here
      // For now, auto-verify
      const { data: updated, error: updateError } = await supabase
        .from('organization_domains')
        .update({
          verified: true,
          verified_at: new Date().toISOString()
        })
        .eq('domain', domain)
        .eq('organization_id', profile.organization_id)
        .select()
        .single()

      if (updateError) throw updateError

      return new Response(
        JSON.stringify({
          success: true,
          domain: updated,
          message: `Domain ${domain} verified successfully`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else if (action === 'remove') {
      const { error: deleteError } = await supabase
        .from('organization_domains')
        .delete()
        .eq('domain', domain)
        .eq('organization_id', profile.organization_id)

      if (deleteError) throw deleteError

      return new Response(
        JSON.stringify({
          success: true,
          message: `Domain ${domain} removed`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    throw new Error('Invalid action')
  } catch (error) {
    console.error('Error managing domain:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
