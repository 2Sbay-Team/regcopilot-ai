import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

interface VerificationResult {
  is_valid: boolean
  total_entries: number
  broken_links: Array<{ entry_id: string; expected_hash: string; actual_hash: string }>
  first_entry_timestamp: string
  last_entry_timestamp: string
}

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

    const { org_id, start_date, end_date } = await req.json()

    if (!org_id) {
      return new Response(JSON.stringify({ error: 'org_id required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get audit logs for organization
    let query = supabaseClient
      .from('audit_logs')
      .select('id, timestamp, prev_hash, output_hash')
      .eq('organization_id', org_id)
      .order('timestamp', { ascending: true })

    if (start_date) {
      query = query.gte('timestamp', start_date)
    }
    if (end_date) {
      query = query.lte('timestamp', end_date)
    }

    const { data: logs, error } = await query

    if (error) throw error

    if (!logs || logs.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        verification: {
          is_valid: true,
          total_entries: 0,
          broken_links: [],
          message: 'No audit logs found for the specified period'
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Verify hash chain integrity
    const brokenLinks: VerificationResult['broken_links'] = []
    let previousOutputHash = logs[0].prev_hash // Should be all zeros for first entry

    // Check if first entry has proper genesis hash
    const genesisHash = '0'.repeat(64)
    if (logs[0].prev_hash !== genesisHash) {
      brokenLinks.push({
        entry_id: logs[0].id,
        expected_hash: genesisHash,
        actual_hash: logs[0].prev_hash
      })
    }

    // Verify each subsequent entry
    for (let i = 1; i < logs.length; i++) {
      const currentLog = logs[i]
      const expectedPrevHash = logs[i - 1].output_hash

      if (currentLog.prev_hash !== expectedPrevHash) {
        brokenLinks.push({
          entry_id: currentLog.id,
          expected_hash: expectedPrevHash,
          actual_hash: currentLog.prev_hash
        })
      }
    }

    const verification: VerificationResult = {
      is_valid: brokenLinks.length === 0,
      total_entries: logs.length,
      broken_links: brokenLinks,
      first_entry_timestamp: logs[0].timestamp,
      last_entry_timestamp: logs[logs.length - 1].timestamp
    }

    // Generate AI analysis if there are issues
    let aiInsights = null
    if (brokenLinks.length > 0) {
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
            content: 'You are an audit trail security expert. Analyze hash chain integrity issues and provide recommendations.'
          }, {
            role: 'user',
            content: `Audit chain verification found ${brokenLinks.length} broken link(s) out of ${logs.length} total entries. 
            
First broken link at entry: ${brokenLinks[0].entry_id}
Expected prev_hash: ${brokenLinks[0].expected_hash}
Actual prev_hash: ${brokenLinks[0].actual_hash}

Provide:
1. Potential causes of hash chain breaks
2. Security implications
3. Recommended remediation steps`
          }]
        }),
      })

      if (aiResponse.ok) {
        const aiData = await aiResponse.json()
        aiInsights = aiData.choices?.[0]?.message?.content
      }
    }

    // Store verification result in audit log
    await supabaseClient.from('audit_logs').insert({
      organization_id: org_id,
      agent: 'audit_verifier',
      event_type: 'verification',
      event_category: 'integrity',
      actor_id: user.id,
      action: 'verify_hash_chain',
      status: verification.is_valid ? 'success' : 'warning',
      request_payload: { start_date, end_date },
      response_summary: { 
        is_valid: verification.is_valid,
        broken_links_count: brokenLinks.length,
        total_verified: logs.length
      },
      reasoning_chain: { 
        verification_method: 'sha256_chain',
        broken_links: brokenLinks,
        ai_insights: aiInsights
      },
      input_hash: Array.from(
        new Uint8Array(
          await crypto.subtle.digest('SHA-256', new TextEncoder().encode(org_id))
        )
      ).map(b => b.toString(16).padStart(2, '0')).join(''),
      output_hash: Array.from(
        new Uint8Array(
          await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(verification)))
        )
      ).map(b => b.toString(16).padStart(2, '0')).join('')
    })

    return new Response(JSON.stringify({
      success: true,
      verification,
      ai_insights: aiInsights,
      recommendation: verification.is_valid 
        ? 'Audit chain integrity verified - no tampering detected' 
        : 'CRITICAL: Hash chain broken - potential data tampering detected'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in audit-chain-verify:', error)
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
