import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0'
import { corsHeaders } from '../_shared/cors.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

async function aggregateUserData(supabase: any, organizationId: string, dataSubjectEmail: string) {
  const aggregated: any = {
    subject_email: dataSubjectEmail,
    collected_at: new Date().toISOString(),
    data_sources: {}
  }

  // Aggregate from all relevant tables
  const tables = [
    'profiles',
    'ai_act_assessments',
    'gdpr_assessments',
    'esg_reports',
    'dsar_requests',
    'audit_logs',
    'chunk_feedback',
    'retrieval_feedback'
  ]

  for (const table of tables) {
    try {
      let query
      if (table === 'profiles') {
        query = supabase.from(table).select('*').eq('email', dataSubjectEmail)
      } else if (table === 'audit_logs') {
        // Get audit logs for this user
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', dataSubjectEmail)
          .single()
        
        if (userProfile) {
          query = supabase.from(table).select('*').eq('actor_id', userProfile.id)
        } else {
          continue
        }
      } else {
        // For other tables, filter by organization
        query = supabase.from(table).select('*').eq('organization_id', organizationId)
      }

      const { data, error } = await query

      if (!error && data && data.length > 0) {
        aggregated.data_sources[table] = {
          record_count: data.length,
          records: data
        }
      }
    } catch (error) {
      console.error(`Error aggregating from ${table}:`, error)
    }
  }

  return aggregated
}

async function deleteUserData(supabase: any, organizationId: string, dataSubjectEmail: string) {
  const deletionLog: any = {
    deleted_at: new Date().toISOString(),
    tables_affected: []
  }

  // Get user profile first
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', dataSubjectEmail)
    .single()

  if (!userProfile) {
    throw new Error('User profile not found')
  }

  // Delete from tables (respecting foreign key constraints)
  const deletionOrder = [
    'chunk_feedback',
    'retrieval_feedback',
    'auth_audit_logs',
    'security_audit_events',
    'ai_act_assessments',
    'gdpr_assessments',
    'esg_reports',
    'dsar_responses',
    'dsar_requests',
    'audit_logs',
    'user_roles'
  ]

  for (const table of deletionOrder) {
    try {
      let deleteQuery
      if (['auth_audit_logs', 'audit_logs', 'user_roles'].includes(table)) {
        deleteQuery = supabase.from(table).delete().eq('user_id', userProfile.id)
      } else {
        deleteQuery = supabase.from(table).delete().eq('organization_id', organizationId)
      }

      const { error, count } = await deleteQuery

      if (!error && count && count > 0) {
        deletionLog.tables_affected.push({ table, records_deleted: count })
      }
    } catch (error) {
      console.error(`Error deleting from ${table}:`, error)
    }
  }

  // Finally delete user profile (this will cascade to auth.users)
  await supabase.from('profiles').delete().eq('id', userProfile.id)
  deletionLog.tables_affected.push({ table: 'profiles', records_deleted: 1 })

  return deletionLog
}

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

    // Check analyst/admin role
    const { data: hasRole } = await supabase.rpc('has_role', { 
      _user_id: user.id, 
      _role: 'analyst' 
    })
    
    const { data: hasAdmin } = await supabase.rpc('has_role', { 
      _user_id: user.id, 
      _role: 'admin' 
    })

    if (!hasRole && !hasAdmin) {
      throw new Error('Analyst or admin role required')
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile?.organization_id) {
      throw new Error('No organization found')
    }

    const { dsar_id, action } = await req.json()

    if (!dsar_id) {
      throw new Error('dsar_id is required')
    }

    // Get DSAR request
    const { data: dsarRequest, error: dsarError } = await supabase
      .from('dsar_queue' as any)
      .select('*')
      .eq('id', dsar_id)
      .eq('organization_id', profile.organization_id)
      .single()

    if (dsarError || !dsarRequest) {
      throw new Error('DSAR request not found')
    }

    let result: any = {}

    if (action === 'aggregate' || dsarRequest.request_type === 'access' || dsarRequest.request_type === 'portability') {
      // Aggregate user data
      console.log('Aggregating data for:', dsarRequest.data_subject_email)
      const aggregatedData = await aggregateUserData(
        supabase,
        profile.organization_id,
        dsarRequest.data_subject_email
      )

      // Update DSAR request
      await supabase
        .from('dsar_queue' as any)
        .update({
          status: 'completed',
          aggregated_data: aggregatedData,
          completion_date: new Date().toISOString()
        })
        .eq('id', dsar_id)

      result = {
        action: 'data_aggregated',
        record_count: Object.keys(aggregatedData.data_sources).length,
        data: aggregatedData
      }
    } else if (action === 'delete' || dsarRequest.request_type === 'erasure') {
      // Delete user data
      console.log('Deleting data for:', dsarRequest.data_subject_email)
      const deletionLog = await deleteUserData(
        supabase,
        profile.organization_id,
        dsarRequest.data_subject_email
      )

      // Update DSAR request
      await supabase
        .from('dsar_queue' as any)
        .update({
          status: 'completed',
          aggregated_data: deletionLog,
          completion_date: new Date().toISOString()
        })
        .eq('id', dsar_id)

      result = {
        action: 'data_deleted',
        tables_affected: deletionLog.tables_affected.length,
        log: deletionLog
      }
    }

    // Log to audit trail
    await supabase.from('audit_logs').insert({
      organization_id: profile.organization_id,
      agent: 'dsar_processor',
      action: action || dsarRequest.request_type,
      event_type: 'compliance',
      event_category: 'gdpr_dsar',
      status: 'success',
      input_hash: dsar_id,
      request_payload: {
        dsar_id,
        request_type: dsarRequest.request_type,
        data_subject: dsarRequest.data_subject_email
      },
      response_summary: result
    })

    return new Response(
      JSON.stringify({
        success: true,
        ...result,
        message: `DSAR request processed successfully`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in process-dsar-request:', error)
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
