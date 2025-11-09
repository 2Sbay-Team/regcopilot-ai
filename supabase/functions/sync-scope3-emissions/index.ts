import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
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

    console.log('Starting monthly Scope 3 emissions sync...')

    // Get all organizations
    const { data: organizations, error: orgError } = await supabaseClient
      .from('organizations')
      .select('id, name')

    if (orgError) throw orgError

    const results = []

    for (const org of organizations || []) {
      try {
        // Get existing ESG metrics for the organization
        const { data: metrics, error: metricsError } = await supabaseClient
          .from('esg_metrics')
          .select('*')
          .eq('organization_id', org.id)
          .eq('metric_category', 'Environmental')
          .order('created_at', { ascending: false })
          .limit(12) // Last 12 months

        if (metricsError) throw metricsError

        // Calculate trends and anomalies using AI
        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [{
              role: 'system',
              content: 'You are an ESG analyst. Analyze emissions trends and identify anomalies or areas of concern.'
            }, {
              role: 'user',
              content: `Analyze these Scope 3 emissions metrics for ${org.name}:\n${JSON.stringify(metrics)}\n\nProvide insights on trends, anomalies, and recommendations.`
            }]
          }),
        })

        if (!aiResponse.ok) {
          if (aiResponse.status === 429) {
            throw new Error('Rate limit exceeded')
          }
          if (aiResponse.status === 402) {
            throw new Error('AI credits exhausted')
          }
          throw new Error(`AI request failed: ${aiResponse.status}`)
        }

        const aiData = await aiResponse.json()
        const analysis = aiData.choices?.[0]?.message?.content || 'No analysis available'

        // Create audit log
        await supabaseClient.from('audit_logs').insert({
          organization_id: org.id,
          agent: 'scope3_sync',
          event_type: 'scope3_sync_completed',
          event_category: 'automation',
          action: 'sync_emissions',
          status: 'success',
          request_payload: { metrics_count: metrics?.length || 0 },
          response_summary: { analysis_length: analysis.length },
          reasoning_chain: { analysis, automated: true },
          input_hash: Array.from(
            new Uint8Array(
              await crypto.subtle.digest('SHA-256', new TextEncoder().encode(org.id))
            )
          ).map(b => b.toString(16).padStart(2, '0')).join(''),
          output_hash: Array.from(
            new Uint8Array(
              await crypto.subtle.digest('SHA-256', new TextEncoder().encode(analysis))
            )
          ).map(b => b.toString(16).padStart(2, '0')).join('')
        })

        results.push({
          organization: org.name,
          status: 'success',
          metrics_analyzed: metrics?.length || 0
        })

      } catch (error) {
        console.error(`Error syncing Scope 3 for ${org.name}:`, error)
        results.push({
          organization: org.name,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return new Response(JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      results,
      total_organizations: organizations?.length || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in scope3 sync:', error)
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
