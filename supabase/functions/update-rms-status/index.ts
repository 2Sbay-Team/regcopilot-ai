import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0'
import { corsHeaders } from '../_shared/cors.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Check admin role
    const { data: hasAdmin } = await supabase.rpc('has_role', { 
      _user_id: user.id, 
      _role: 'admin' 
    })

    if (!hasAdmin) {
      throw new Error('Admin role required')
    }

    const { risk_id, status, review_notes } = await req.json()

    if (!risk_id || !status) {
      throw new Error('risk_id and status are required')
    }

    // Update risk status
    const { data: updatedRisk, error: updateError } = await supabase
      .from('risk_management_register')
      .update({
        status,
        last_reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', risk_id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating risk:', updateError)
      throw new Error('Failed to update risk status')
    }

    // Log to audit trail
    await supabase.from('audit_logs').insert({
      organization_id: updatedRisk.organization_id,
      agent: 'risk_management_system',
      action: 'update_risk_status',
      event_type: 'compliance',
      event_category: 'risk_management',
      status: 'success',
      input_hash: risk_id,
      request_payload: {
        risk_id,
        old_status: status,
        new_status: status,
        reviewed_by: user.id,
        notes: review_notes
      },
      response_summary: {
        risk_module: updatedRisk.module,
        risk_score: updatedRisk.risk_score,
        mitigation: updatedRisk.mitigation
      }
    })

    return new Response(
      JSON.stringify({
        success: true,
        risk: updatedRisk,
        message: 'Risk status updated successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in update-rms-status:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
