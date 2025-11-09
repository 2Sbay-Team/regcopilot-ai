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

    // Get organization_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile?.organization_id) {
      throw new Error('No organization found')
    }

    // Update data lineage metadata with EU AI Act compliance fields
    const lineageUpdates = [
      {
        source_system: 'ESG Data Upload',
        target_system: 'ESG Metrics Storage',
        data_classification: 'confidential',
        legal_basis: 'Art. 6(1)(b) GDPR - Contract performance',
        consent_basis: 'Explicit consent for ESG reporting',
        retention_period: '7 years (CSRD requirement)',
        transformation: 'CSV parsing → metric calculation → anomaly detection'
      },
      {
        source_system: 'GDPR Document Upload',
        target_system: 'Document Chunks (RAG)',
        data_classification: 'restricted',
        legal_basis: 'Art. 6(1)(c) GDPR - Legal obligation',
        consent_basis: 'Data processing agreement',
        retention_period: '12 months',
        transformation: 'PII detection → embedding generation → vector storage'
      },
      {
        source_system: 'AI Act System Input',
        target_system: 'AI Act Assessments',
        data_classification: 'internal',
        legal_basis: 'Art. 6(1)(f) GDPR - Legitimate interest',
        consent_basis: 'Business compliance advisory',
        retention_period: '12 months',
        transformation: 'Risk classification → RAG retrieval → Annex IV generation'
      },
      {
        source_system: 'User Feedback',
        target_system: 'Chunk Feedback Scores',
        data_classification: 'internal',
        legal_basis: 'Art. 6(1)(f) GDPR - Legitimate interest',
        consent_basis: 'Service improvement',
        retention_period: '24 months',
        transformation: 'Feedback signals → weighted scoring → materialized view refresh'
      },
      {
        source_system: 'Connector Synced Data',
        target_system: 'Agent Queue',
        data_classification: 'confidential',
        legal_basis: 'Art. 6(1)(b) GDPR - Contract performance',
        consent_basis: 'Third-party integration agreement',
        retention_period: '12 months',
        transformation: 'API sync → task queueing → automated assessment'
      }
    ]

    let updatedCount = 0
    let createdCount = 0

    for (const lineage of lineageUpdates) {
      // Check if lineage exists
      const { data: existing } = await supabase
        .from('data_lineage')
        .select('id')
        .eq('organization_id', profile.organization_id)
        .eq('source_system', lineage.source_system)
        .eq('target_system', lineage.target_system)
        .maybeSingle()

      if (existing) {
        // Update existing
        await supabase
          .from('data_lineage')
          .update({
            data_classification: lineage.data_classification,
            legal_basis: lineage.legal_basis,
            consent_basis: lineage.consent_basis,
            retention_period: lineage.retention_period,
            transformation_logic: lineage.transformation,
            last_refreshed_at: new Date().toISOString()
          })
          .eq('id', existing.id)
        
        updatedCount++
      } else {
        // Create new
        await supabase
          .from('data_lineage')
          .insert({
            organization_id: profile.organization_id,
            source_system: lineage.source_system,
            target_system: lineage.target_system,
            data_classification: lineage.data_classification,
            legal_basis: lineage.legal_basis,
            consent_basis: lineage.consent_basis,
            retention_period: lineage.retention_period,
            transformation_logic: lineage.transformation,
            last_refreshed_at: new Date().toISOString()
          })
        
        createdCount++
      }
    }

    // Log to audit trail
    await supabase.from('audit_logs').insert({
      organization_id: profile.organization_id,
      agent: 'data_lineage_refresh',
      action: 'refresh_lineage_graph',
      event_type: 'compliance',
      event_category: 'data_governance',
      status: 'success',
      input_hash: 'lineage_refresh',
      request_payload: {
        requested_by: user.id,
        lineage_count: lineageUpdates.length
      },
      response_summary: {
        updated: updatedCount,
        created: createdCount,
        total: lineageUpdates.length
      }
    })

    return new Response(
      JSON.stringify({
        success: true,
        updated: updatedCount,
        created: createdCount,
        total: lineageUpdates.length,
        message: 'Data lineage graph refreshed successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in refresh-lineage-graph:', error)
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
