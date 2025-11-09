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

    console.log('Starting daily audit chain verification...')

    // Get all organizations
    const { data: organizations, error: orgError } = await supabaseClient
      .from('organizations')
      .select('id, name')

    if (orgError) throw orgError

    const results = []

    for (const org of organizations || []) {
      try {
        // Get audit logs for verification
        const { data: logs, error: logsError } = await supabaseClient
          .from('audit_logs')
          .select('id, prev_hash, input_hash, output_hash, timestamp')
          .eq('organization_id', org.id)
          .order('timestamp', { ascending: true })

        if (logsError) throw logsError

        let integrityStatus = 'valid'
        const issues = []

        // Verify hash chain
        for (let i = 1; i < (logs?.length || 0); i++) {
          const current = logs![i]
          const previous = logs![i - 1]

          if (current.prev_hash !== previous.output_hash) {
            integrityStatus = 'broken'
            issues.push({
              log_id: current.id,
              timestamp: current.timestamp,
              expected: previous.output_hash,
              actual: current.prev_hash
            })
          }
        }

        // Create alert if integrity is broken
        if (integrityStatus === 'broken') {
          await supabaseClient.from('alert_notifications').insert({
            organization_id: org.id,
            threshold_id: '00000000-0000-0000-0000-000000000000', // System alert
            metric_type: 'audit_integrity',
            metric_value: issues.length,
            threshold_value: 0,
            time_period: 'day',
            period_label: new Date().toISOString().split('T')[0],
            notes: `Audit chain integrity check failed: ${issues.length} break(s) detected`
          })
        }

        // Create audit log for the verification
        await supabaseClient.from('audit_logs').insert({
          organization_id: org.id,
          agent: 'audit_chain_verifier',
          event_type: 'audit_verification',
          event_category: 'security',
          action: 'verify_chain',
          status: integrityStatus === 'valid' ? 'success' : 'error',
          request_payload: { logs_checked: logs?.length || 0 },
          response_summary: { integrity: integrityStatus, issues_found: issues.length },
          reasoning_chain: { issues, automated: true },
          input_hash: Array.from(
            new Uint8Array(
              await crypto.subtle.digest('SHA-256', new TextEncoder().encode(org.id))
            )
          ).map(b => b.toString(16).padStart(2, '0')).join(''),
          output_hash: Array.from(
            new Uint8Array(
              await crypto.subtle.digest('SHA-256', new TextEncoder().encode(integrityStatus))
            )
          ).map(b => b.toString(16).padStart(2, '0')).join('')
        })

        results.push({
          organization: org.name,
          status: integrityStatus,
          logs_checked: logs?.length || 0,
          issues_found: issues.length
        })

      } catch (error) {
        console.error(`Error verifying audit chain for ${org.name}:`, error)
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
    console.error('Error in audit chain verification:', error)
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
