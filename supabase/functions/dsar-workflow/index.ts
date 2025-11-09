import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const DSARRequestSchema = z.object({
  org_id: z.string().uuid(),
  action: z.enum(['create', 'fulfill', 'list']),
  data: z.object({
    request_id: z.string().uuid().optional(),
    email: z.string().email().optional(),
    request_type: z.enum(['access', 'rectification', 'erasure', 'portability', 'restriction']).optional(),
    systems_to_search: z.array(z.string()).optional()
  }).optional()
})

async function getUserFromRequest(supabaseClient: any, req: Request) {
  const { data: { user } } = await supabaseClient.auth.getUser()
  if (user) return user
  const auth = req.headers.get('authorization') || req.headers.get('Authorization')
  if (auth && auth.startsWith('Bearer ')) {
    const token = auth.substring(7)
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
      if (payload?.sub) return { id: payload.sub }
    } catch (_) {
      // ignore
    }
  }
  return null
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

    const user = await getUserFromRequest(supabaseClient, req)
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const rawBody = await req.json()
    const validationResult = DSARRequestSchema.safeParse(rawBody)
    
    if (!validationResult.success) {
      return new Response(JSON.stringify({ 
        error: 'Invalid request data', 
        details: validationResult.error.errors 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { org_id, action, data } = validationResult.data

    // Action: Create new DSAR
    if (action === 'create') {
      if (!data?.email || !data?.request_type) {
        return new Response(JSON.stringify({ error: 'Email and request_type required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Calculate deadline (30 days from now per GDPR Art. 12(3))
      const deadline = new Date()
      deadline.setDate(deadline.getDate() + 30)

      const { data: dsarRequest, error } = await supabaseClient
        .from('dsar_requests')
        .insert({
          organization_id: org_id,
          data_subject_email: data.email,
          request_type: data.request_type,
          status: 'pending',
          deadline: deadline.toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // Audit log
      await supabaseClient.from('audit_logs').insert({
        organization_id: org_id,
        agent: 'dsar_workflow',
        event_type: 'dsar_created',
        event_category: 'privacy',
        actor_id: user.id,
        action: 'create_dsar',
        status: 'success',
        request_payload: { email: data.email, type: data.request_type },
        response_summary: { request_id: dsarRequest.id, deadline: deadline.toISOString() },
        reasoning_chain: { automated: true },
        input_hash: Array.from(
          new Uint8Array(
            await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data.email))
          )
        ).map(b => b.toString(16).padStart(2, '0')).join(''),
        output_hash: Array.from(
          new Uint8Array(
            await crypto.subtle.digest('SHA-256', new TextEncoder().encode(dsarRequest.id))
          )
        ).map(b => b.toString(16).padStart(2, '0')).join('')
      })

      return new Response(JSON.stringify({
        success: true,
        request_id: dsarRequest.id,
        deadline: deadline.toISOString(),
        days_remaining: 30
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Action: Fulfill DSAR (automated data export)
    if (action === 'fulfill') {
      if (!data?.request_id) {
        return new Response(JSON.stringify({ error: 'request_id required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Get DSAR request
      const { data: dsarRequest, error: fetchError } = await supabaseClient
        .from('dsar_requests')
        .select('*')
        .eq('id', data.request_id)
        .eq('organization_id', org_id)
        .single()

      if (fetchError || !dsarRequest) {
        return new Response(JSON.stringify({ error: 'DSAR request not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Simulate data collection (in production, query actual systems)
      const systemsToSearch = data?.systems_to_search || ['CRM', 'Support', 'Analytics']
      const collectedData: Record<string, any> = {}

      for (const system of systemsToSearch) {
        // Mock data retrieval
        collectedData[system] = {
          records_found: Math.floor(Math.random() * 10),
          data_categories: ['contact_info', 'interactions', 'preferences'],
          retrieved_at: new Date().toISOString()
        }
      }

      // Generate AI summary of collected data
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
            content: 'You are a GDPR compliance assistant. Summarize DSAR fulfillment data for the data subject.'
          }, {
            role: 'user',
            content: `Generate a clear summary for a ${dsarRequest.request_type} request. Data collected from systems: ${JSON.stringify(collectedData)}`
          }]
        }),
      })

      if (!aiResponse.ok) {
        if (aiResponse.status === 429 || aiResponse.status === 402) {
          return new Response(JSON.stringify({ 
            error: aiResponse.status === 429 ? 'Rate limit exceeded' : 'AI credits exhausted' 
          }), {
            status: aiResponse.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
      }

      const aiData = await aiResponse.json()
      const summary = aiData.choices?.[0]?.message?.content || 'Data export summary unavailable'

      // Store response
      const { data: response } = await supabaseClient
        .from('dsar_responses')
        .insert({
          request_id: data.request_id,
          data_exported: collectedData,
          response_file_url: null // In production, generate PDF and upload
        })
        .select()
        .single()

      // Update request status
      await supabaseClient
        .from('dsar_requests')
        .update({ status: 'fulfilled' })
        .eq('id', data.request_id)

      // Audit log
      await supabaseClient.from('audit_logs').insert({
        organization_id: org_id,
        agent: 'dsar_workflow',
        event_type: 'dsar_fulfilled',
        event_category: 'privacy',
        actor_id: user.id,
        action: 'fulfill_dsar',
        status: 'success',
        request_payload: { request_id: data.request_id, systems: systemsToSearch },
        response_summary: { response_id: response?.id, systems_searched: systemsToSearch.length },
        reasoning_chain: { summary, automated: true },
        input_hash: Array.from(
          new Uint8Array(
            await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data.request_id))
          )
        ).map(b => b.toString(16).padStart(2, '0')).join(''),
        output_hash: Array.from(
          new Uint8Array(
            await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(collectedData)))
          )
        ).map(b => b.toString(16).padStart(2, '0')).join('')
      })

      return new Response(JSON.stringify({
        success: true,
        response_id: response?.id,
        summary,
        systems_searched: systemsToSearch.length,
        total_records: Object.values(collectedData).reduce((sum, s: any) => sum + (s.records_found || 0), 0)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Action: List DSARs
    if (action === 'list') {
      const { data: requests, error } = await supabaseClient
        .from('dsar_requests')
        .select('*, dsar_responses(*)')
        .eq('organization_id', org_id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      const enrichedRequests = requests?.map(r => ({
        ...r,
        days_remaining: Math.max(0, Math.ceil((new Date(r.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
        is_overdue: new Date(r.deadline) < new Date() && r.status !== 'fulfilled'
      }))

      return new Response(JSON.stringify({
        success: true,
        requests: enrichedRequests,
        total: enrichedRequests?.length || 0,
        pending: enrichedRequests?.filter(r => r.status === 'pending').length || 0,
        overdue: enrichedRequests?.filter(r => r.is_overdue).length || 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in dsar-workflow:', error)
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
