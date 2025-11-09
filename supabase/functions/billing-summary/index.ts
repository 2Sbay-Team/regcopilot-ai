import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check if user is super admin
    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin', { _user_id: user.id })

    // Get profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile?.organization_id && !isSuperAdmin) {
      return new Response(JSON.stringify({ error: 'No organization found' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!profile) {
      return new Response(JSON.stringify({ error: 'Profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (isSuperAdmin) {
      // Super admin: get platform-wide analytics
      const { data: analytics } = await supabase
        .from('platform_analytics')
        .select('*')
        .single()

      const { data: orgs } = await supabase
        .from('organizations')
        .select('id, name, subscription_plan, billing_status, tokens_used_this_month, created_at')
        .order('created_at', { ascending: false })
        .limit(50)

      // Get LLM usage breakdown by org
      const { data: usageByOrg } = await supabase
        .from('model_usage_logs')
        .select('organization_id, model, total_tokens, cost_usd')
        .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

      // Aggregate usage per org
      const orgUsage = usageByOrg?.reduce((acc, log) => {
        if (!acc[log.organization_id]) {
          acc[log.organization_id] = { tokens: 0, cost: 0, requests: 0 }
        }
        acc[log.organization_id].tokens += log.total_tokens
        acc[log.organization_id].cost += parseFloat(log.cost_usd || '0')
        acc[log.organization_id].requests += 1
        return acc
      }, {} as Record<string, any>)

      return new Response(
        JSON.stringify({
          type: 'platform',
          analytics,
          organizations: orgs,
          usage_by_org: orgUsage,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    } else {
      // Org admin: get organization-specific billing
      const { data: org } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', profile.organization_id)
        .single()

      // Get current month's usage
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { data: usage } = await supabase
        .from('model_usage_logs')
        .select('model, total_tokens, cost_usd, timestamp, actor_role')
        .eq('organization_id', profile.organization_id)
        .gte('timestamp', startOfMonth.toISOString())

      // Aggregate by model
      const usageByModel = usage?.reduce((acc, log) => {
        if (!acc[log.model]) {
          acc[log.model] = { tokens: 0, cost: 0, requests: 0 }
        }
        acc[log.model].tokens += log.total_tokens
        acc[log.model].cost += parseFloat(log.cost_usd || '0')
        acc[log.model].requests += 1
        return acc
      }, {} as Record<string, any>)

      // Get billing history
      const { data: billingHistory } = await supabase
        .from('billing_events')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('processed_at', { ascending: false })
        .limit(10)

      return new Response(
        JSON.stringify({
          type: 'organization',
          organization: org,
          usage_summary: {
            total_tokens: usage?.reduce((sum, log) => sum + log.total_tokens, 0) || 0,
            total_cost: usage?.reduce((sum, log) => sum + parseFloat(log.cost_usd || '0'), 0) || 0,
            total_requests: usage?.length || 0,
          },
          usage_by_model: usageByModel,
          billing_history: billingHistory,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }
  } catch (error) {
    console.error('Billing summary error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
