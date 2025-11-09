import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const LineageRequestSchema = z.object({
  org_id: z.string().uuid(),
  action: z.enum(['track', 'query', 'visualize']),
  data: z.object({
    dataset_id: z.string().optional(),
    source: z.string().optional(),
    destination: z.string().optional(),
    transformation: z.string().optional(),
    jurisdiction: z.string().optional(),
    query: z.string().optional()
  }).optional()
})

interface LineageNode {
  id: string
  type: 'source' | 'process' | 'storage' | 'transfer'
  name: string
  jurisdiction?: string
  timestamp: string
}

interface LineageEdge {
  from: string
  to: string
  transformation?: string
}

async function getUserFromRequest(supabaseClient: any, req: Request) {
  // Try standard method first
  const { data: { user } } = await supabaseClient.auth.getUser()
  if (user) return user

  // Fallback: decode JWT from Authorization header
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
    const validationResult = LineageRequestSchema.safeParse(rawBody)
    
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

    // Action: Track new data flow
    if (action === 'track') {
      const lineageEntry = {
        organization_id: org_id,
        dataset_id: data?.dataset_id || crypto.randomUUID(),
        source_system: data?.source || 'unknown',
        destination_system: data?.destination || 'unknown',
        transformation_applied: data?.transformation || 'none',
        source_jurisdiction: data?.jurisdiction || 'EU',
        destination_jurisdiction: data?.jurisdiction || 'EU',
        is_cross_border: false,
        tracked_at: new Date().toISOString(),
        tracked_by: user.id
      }

      // Detect cross-border transfers
      const crossBorderKeywords = ['us', 'united states', 'china', 'third country']
      const destLower = (data?.destination || '').toLowerCase()
      lineageEntry.is_cross_border = crossBorderKeywords.some(k => destLower.includes(k))

      // Create service role client for audit log insertion
      const supabaseServiceClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      // Store in JSONB for flexible schema (no dedicated table yet)
      const { data: stored, error } = await supabaseServiceClient
        .from('audit_logs')
        .insert({
          organization_id: org_id,
          agent: 'data_lineage',
          event_type: 'data_flow',
          event_category: 'governance',
          actor_id: user.id,
          action: 'track_lineage',
          status: 'success',
          request_payload: lineageEntry,
          response_summary: { 
            dataset_id: lineageEntry.dataset_id,
            cross_border: lineageEntry.is_cross_border
          },
          reasoning_chain: { 
            source: data?.source,
            destination: data?.destination,
            risk_flag: lineageEntry.is_cross_border ? 'high' : 'low'
          },
          input_hash: Array.from(
            new Uint8Array(
              await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(data)))
            )
          ).map(b => b.toString(16).padStart(2, '0')).join(''),
          output_hash: Array.from(
            new Uint8Array(
              await crypto.subtle.digest('SHA-256', new TextEncoder().encode(lineageEntry.dataset_id))
            )
          ).map(b => b.toString(16).padStart(2, '0')).join('')
        })
        .select()
        .single()

      if (error) {
        console.error('Failed to store lineage:', error)
        throw error
      }

      return new Response(JSON.stringify({
        success: true,
        lineage_id: stored.id,
        dataset_id: lineageEntry.dataset_id,
        cross_border_transfer: lineageEntry.is_cross_border,
        risk_level: lineageEntry.is_cross_border ? 'high' : 'low'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Action: Query lineage graph
    if (action === 'query') {
      const { data: lineageLogs, error } = await supabaseClient
        .from('audit_logs')
        .select('*')
        .eq('organization_id', org_id)
        .eq('agent', 'data_lineage')
        .order('timestamp', { ascending: false })
        .limit(50)

      if (error) throw error

      // Build graph structure
      const nodes: LineageNode[] = []
      const edges: LineageEdge[] = []
      const seenNodes = new Set<string>()

      lineageLogs?.forEach(log => {
        const payload = log.request_payload as any
        
        // Add source node
        if (payload.source_system && !seenNodes.has(payload.source_system)) {
          nodes.push({
            id: payload.source_system,
            type: 'source',
            name: payload.source_system,
            jurisdiction: payload.source_jurisdiction,
            timestamp: log.timestamp
          })
          seenNodes.add(payload.source_system)
        }

        // Add destination node
        if (payload.destination_system && !seenNodes.has(payload.destination_system)) {
          nodes.push({
            id: payload.destination_system,
            type: 'storage',
            name: payload.destination_system,
            jurisdiction: payload.destination_jurisdiction,
            timestamp: log.timestamp
          })
          seenNodes.add(payload.destination_system)
        }

        // Add edge
        if (payload.source_system && payload.destination_system) {
          edges.push({
            from: payload.source_system,
            to: payload.destination_system,
            transformation: payload.transformation_applied
          })
        }
      })

      return new Response(JSON.stringify({
        success: true,
        graph: { nodes, edges },
        total_flows: lineageLogs?.length || 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Action: Visualize with AI insights
    if (action === 'visualize') {
      const { data: lineageLogs } = await supabaseClient
        .from('audit_logs')
        .select('*')
        .eq('organization_id', org_id)
        .eq('agent', 'data_lineage')
        .order('timestamp', { ascending: false })
        .limit(20)

      const crossBorderCount = lineageLogs?.filter(
        l => (l.request_payload as any)?.is_cross_border
      ).length || 0

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
            content: 'You are a data governance expert. Analyze data lineage and provide compliance insights.'
          }, {
            role: 'user',
            content: `Analyze this data lineage summary and provide governance recommendations:
            
Total data flows: ${lineageLogs?.length || 0}
Cross-border transfers: ${crossBorderCount}
Recent flows: ${JSON.stringify(lineageLogs?.slice(0, 5).map(l => ({
  source: (l.request_payload as any)?.source_system,
  destination: (l.request_payload as any)?.destination_system,
  cross_border: (l.request_payload as any)?.is_cross_border
})))}`
          }]
        }),
      })

      if (!aiResponse.ok) {
        if (aiResponse.status === 429) {
          return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        if (aiResponse.status === 402) {
          return new Response(JSON.stringify({ error: 'AI credits exhausted' }), {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
      }

      const aiData = await aiResponse.json()
      const insights = aiData.choices?.[0]?.message?.content || 'Unable to generate insights'

      return new Response(JSON.stringify({
        success: true,
        insights,
        stats: {
          total_flows: lineageLogs?.length || 0,
          cross_border_transfers: crossBorderCount,
          compliance_risk: crossBorderCount > 5 ? 'high' : 'low'
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in data-lineage:', error)
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
