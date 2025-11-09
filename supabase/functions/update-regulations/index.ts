import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
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

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured')

    console.log('Starting regulation update...')

    // Fetch latest regulatory updates from AI Act, GDPR, CSRD
    const regulatoryTopics = [
      { name: 'EU AI Act 2024', query: 'Latest EU AI Act amendments and updates 2024-2025' },
      { name: 'GDPR Updates', query: 'Recent GDPR guidance and regulatory updates 2024-2025' },
      { name: 'CSRD ESRS', query: 'CSRD and ESRS sustainability reporting standards updates 2024-2025' }
    ]

    const updates: any[] = []

    for (const topic of regulatoryTopics) {
      console.log(`Fetching updates for: ${topic.name}`)
      
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'system',
              content: 'You are a regulatory compliance expert. Summarize the most important recent updates and changes to regulations.'
            },
            {
              role: 'user',
              content: `Provide a concise summary of: ${topic.query}. Focus on practical compliance requirements and key changes.`
            }
          ],
        }),
      })

      if (!response.ok) {
        console.error(`AI API error for ${topic.name}:`, response.status)
        continue
      }

      const data = await response.json()
      const summary = data.choices[0]?.message?.content || ''

      if (summary) {
        updates.push({
          document_name: topic.name,
          document_type: topic.name.includes('AI Act') ? 'ai_act' : 
                        topic.name.includes('GDPR') ? 'gdpr' : 'csrd',
          content: summary,
          version: `${new Date().getFullYear()}-${new Date().getMonth() + 1}`,
          valid_from: new Date().toISOString().split('T')[0],
          metadata: { 
            auto_generated: true, 
            generated_at: new Date().toISOString(),
            source: 'lovable_ai_update_agent'
          }
        })
      }
    }

    // Insert updates into regulatory_documents
    if (updates.length > 0) {
      const { error: insertError } = await supabaseClient
        .from('regulatory_documents')
        .insert(updates)

      if (insertError) throw insertError
      console.log(`Successfully inserted ${updates.length} regulatory updates`)
    }

    // Trigger re-embedding (call seed-regulations with skip_seed flag)
    const { error: seedError } = await supabaseClient.functions.invoke('seed-regulations', {
      body: { skip_initial_seed: true }
    })

    if (seedError) {
      console.warn('Re-embedding warning:', seedError.message)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        updates_count: updates.length,
        topics: regulatoryTopics.map(t => t.name)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error updating regulations:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
