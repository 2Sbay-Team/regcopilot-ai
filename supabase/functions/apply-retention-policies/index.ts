import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0'
import { corsHeaders } from '../_shared/cors.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    console.log('Starting retention policy enforcement...')

    // Get all active retention policies
    const { data: policies, error: policiesError } = await supabase
      .from('data_retention_policies')
      .select('*')
      .eq('enabled', true)

    if (policiesError) {
      throw policiesError
    }

    if (!policies || policies.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No active retention policies found',
          deleted_records: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const deletionLog: any[] = []
    let totalDeleted = 0

    for (const policy of policies) {
      try {
        const retentionDate = new Date()
        retentionDate.setDate(retentionDate.getDate() - (policy.retention_days || 365))

        console.log(`Processing policy for table: ${policy.table_name}, retention: ${policy.retention_days} days`)

        // Determine date column based on table
        const dateColumn = policy.table_name.includes('audit') ? 'timestamp' : 'created_at'

        // Delete expired records
        const { error: deleteError, count } = await supabase
          .from(policy.table_name)
          .delete()
          .lt(dateColumn, retentionDate.toISOString())

        if (deleteError) {
          console.error(`Error deleting from ${policy.table_name}:`, deleteError)
          deletionLog.push({
            table: policy.table_name,
            status: 'error',
            error: deleteError.message
          })
          continue
        }

        const recordsDeleted = count || 0
        totalDeleted += recordsDeleted

        deletionLog.push({
          table: policy.table_name,
          status: 'success',
          records_deleted: recordsDeleted,
          retention_date: retentionDate.toISOString()
        })

        // Update last cleanup timestamp
        await supabase
          .from('data_retention_policies')
          .update({ last_cleanup_at: new Date().toISOString() })
          .eq('id', policy.id)

      } catch (tableError) {
        console.error(`Error processing ${policy.table_name}:`, tableError)
        deletionLog.push({
          table: policy.table_name,
          status: 'error',
          error: tableError instanceof Error ? tableError.message : 'Unknown error'
        })
      }
    }

    // Log to cron job logs
    await supabase.from('cron_job_logs').insert({
      job_name: 'apply_retention_policies',
      status: 'completed',
      records_processed: totalDeleted,
      completed_at: new Date().toISOString()
    })

    console.log(`Retention policy enforcement completed. Total records deleted: ${totalDeleted}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Retention policies applied successfully',
        total_deleted: totalDeleted,
        policies_processed: policies.length,
        deletion_log: deletionLog
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in apply-retention-policies:', error)
    
    // Log error to cron job logs
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    await supabase.from('cron_job_logs').insert({
      job_name: 'apply_retention_policies',
      status: 'failed',
      error_message: error instanceof Error ? error.message : 'Unknown error',
      completed_at: new Date().toISOString()
    })

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
