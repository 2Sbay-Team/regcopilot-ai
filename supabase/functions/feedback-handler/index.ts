import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0'
import { corsHeaders } from '../_shared/cors.ts'
import { sanitizeInput, sanitizeObject } from '../_shared/sanitize.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get auth user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // Get user's organization
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      throw new Error('Profile not found')
    }

    const body = await req.json()
    const sanitizedBody = sanitizeObject(body)
    const { feedback_type, ...feedbackData } = sanitizedBody

    console.log('Feedback handler received:', { feedback_type, user_id: user.id })

    // Handle chunk feedback
    if (feedback_type === 'chunk') {
      const { chunk_id, signal, notes } = feedbackData

      if (!chunk_id || !signal) {
        throw new Error('chunk_id and signal are required for chunk feedback')
      }

      // Insert chunk feedback
      const { error: insertError } = await supabase
        .from('chunk_feedback')
        .insert({
          chunk_id,
          organization_id: profile.organization_id,
          user_id: user.id,
          signal,
          notes: notes ? sanitizeInput(notes, 500) : null,
          weight: 1
        })

      if (insertError) {
        console.error('Error inserting chunk feedback:', insertError)
        throw insertError
      }

      // Refresh materialized view
      await supabase.rpc('refresh_chunk_feedback_scores')

      // Log in audit trail
      const inputHashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(chunk_id))
      const outputHashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(signal))
      const inputHash = Array.from(new Uint8Array(inputHashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('').padStart(64, '0')
      const outputHash = Array.from(new Uint8Array(outputHashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('').padStart(64, '0')

      await supabase.from('audit_logs').insert({
        organization_id: profile.organization_id,
        actor_id: user.id,
        agent: 'user',
        event_type: 'feedback_submitted',
        event_category: 'feedback',
        action: 'chunk_feedback',
        status: 'success',
        input_hash: inputHash,
        output_hash: outputHash,
        request_payload: { chunk_id, signal, notes: notes ? '[redacted]' : null }
      })

      return new Response(
        JSON.stringify({ success: true, message: 'Chunk feedback recorded' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Handle retrieval feedback
    if (feedback_type === 'retrieval') {
      const { module, query, topk_result_ids, clicked_chunk_id, satisfaction, missing_citation } = feedbackData

      if (!module || !query) {
        throw new Error('module and query are required for retrieval feedback')
      }

      // Insert retrieval feedback
      const { error: insertError } = await supabase
        .from('retrieval_feedback')
        .insert({
          organization_id: profile.organization_id,
          user_id: user.id,
          module,
          query: sanitizeInput(query, 1000),
          topk_result_ids: topk_result_ids || [],
          clicked_chunk_id: clicked_chunk_id || null,
          satisfaction: satisfaction || null,
          missing_citation: missing_citation || false
        })

      if (insertError) {
        console.error('Error inserting retrieval feedback:', insertError)
        throw insertError
      }

      // Log in audit trail
      const inputHashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(query))
      const outputHashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify({ satisfaction, missing_citation })))
      const inputHash = Array.from(new Uint8Array(inputHashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('').padStart(64, '0')
      const outputHash = Array.from(new Uint8Array(outputHashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('').padStart(64, '0')

      await supabase.from('audit_logs').insert({
        organization_id: profile.organization_id,
        actor_id: user.id,
        agent: 'user',
        event_type: 'feedback_submitted',
        event_category: 'feedback',
        action: 'retrieval_feedback',
        status: 'success',
        input_hash: inputHash,
        output_hash: outputHash,
        request_payload: { module, query: '[redacted]', satisfaction, missing_citation }
      })

      return new Response(
        JSON.stringify({ success: true, message: 'Retrieval feedback recorded' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Handle org policy creation
    if (feedback_type === 'org_policy') {
      const { title, content } = feedbackData

      if (!title || !content) {
        throw new Error('title and content are required for org policy')
      }

      // Generate embedding for the policy using Lovable AI Gateway
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
      if (!LOVABLE_API_KEY) {
        throw new Error('LOVABLE_API_KEY not configured')
      }

      const embeddingResponse = await fetch('https://ai.gateway.lovable.dev/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input: `${title}\n\n${content}`,
          model: 'text-embedding-3-large'
        })
      })

      if (!embeddingResponse.ok) {
        throw new Error('Failed to generate embedding for org policy')
      }

      const embeddingData = await embeddingResponse.json()
      const embedding = embeddingData.data[0].embedding

      // Insert org policy
      const { error: insertError } = await supabase
        .from('org_policies')
        .insert({
          organization_id: profile.organization_id,
          title: sanitizeInput(title, 200),
          content: sanitizeInput(content, 5000),
          embedding,
          metadata: { created_by: user.id }
        })

      if (insertError) {
        console.error('Error inserting org policy:', insertError)
        throw insertError
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Organization policy created' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    throw new Error('Invalid feedback_type')

  } catch (error) {
    console.error('Error in feedback-handler:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
