import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0';
import { corsHeaders } from '../_shared/cors.ts';
import { sanitizeInput } from '../_shared/sanitize.ts';
import { prepareTextForEmbedding } from '../_shared/pii-masking.ts';

interface RegSenseRequest {
  query: string;
  scope: 'ai_act' | 'gdpr' | 'esg' | 'all';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify authentication
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user profile and organization
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) {
      return new Response(JSON.stringify({ error: 'Organization not found' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { query, scope }: RegSenseRequest = await req.json();

    if (!query || !scope) {
      return new Response(JSON.stringify({ error: 'Missing query or scope' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const startTime = Date.now();

    // Sanitize input and mask PII
    const cleanQuery = sanitizeInput(query, 2000);
    const { maskedText, hadPII } = prepareTextForEmbedding(cleanQuery);

    if (hadPII) {
      console.warn('PII detected in RegSense query, masked before processing');
    }

    // Generate input hash for audit trail
    const encoder = new TextEncoder();
    const data = encoder.encode(maskedText);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const inputHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Call RAG search function
    const { data: ragData, error: ragError } = await supabaseClient.functions.invoke('rag-search', {
      body: {
        query: maskedText,
        top_k: 5,
        source_filter: scope === 'all' ? null : scope.replace('_', ' ').toUpperCase(),
      },
    });

    if (ragError) {
      console.error('RAG search error:', ragError);
      throw new Error('Failed to retrieve regulatory context');
    }

    const relevantChunks = ragData?.results || [];

    // Build context from RAG results
    const context = relevantChunks
      .map((chunk: any, idx: number) => 
        `[${idx + 1}] ${chunk.source || 'Unknown'}, ${chunk.section || 'N/A'}:\n${chunk.content}`
      )
      .join('\n\n');

    // Get API key for LLM
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build system prompt
    const systemPrompt = `You are RegSense™, a compliance intelligence assistant for ${scope === 'all' ? 'EU AI Act, GDPR, and ESG/CSRD' : scope.toUpperCase()} regulations.

CRITICAL INSTRUCTIONS:
1. Answer ONLY using the provided regulatory context below
2. ALWAYS cite specific articles, sections, or references
3. Use precise legal terminology
4. Structure answers: Finding → Reference → Recommendation
5. If the context doesn't contain the answer, clearly state "Based on the available regulatory context, I cannot provide a definitive answer"
6. Never make up information or cite non-existent articles

REGULATORY CONTEXT:
${context}

Provide answers in a professional, legal-grade format suitable for compliance officers.`;

    // Call LLM with primary model
    let response;
    let modelUsed = 'google/gemini-2.5-flash';
    let fallbackUsed = false;

    try {
      const llmResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelUsed,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: maskedText },
          ],
          temperature: 0.3, // Lower temperature for more precise, factual responses
          max_tokens: 1500,
        }),
      });

      if (!llmResponse.ok) {
        throw new Error(`LLM API error: ${llmResponse.status}`);
      }

      const llmData = await llmResponse.json();
      response = llmData.choices[0].message.content;

    } catch (primaryError) {
      console.error('Primary model failed, trying fallback:', primaryError);
      
      // Fallback to gpt-5-mini
      modelUsed = 'openai/gpt-5-mini';
      fallbackUsed = true;

      try {
        const fallbackResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: modelUsed,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: maskedText },
            ],
            max_completion_tokens: 1500,
          }),
        });

        if (!fallbackResponse.ok) {
          throw new Error(`Fallback LLM API error: ${fallbackResponse.status}`);
        }

        const fallbackData = await fallbackResponse.json();
        response = fallbackData.choices[0].message.content;

      } catch (fallbackError) {
        console.error('Fallback model also failed:', fallbackError);
        throw new Error('All LLM models unavailable');
      }
    }

    // Generate output hash
    const outputData = encoder.encode(response);
    const outputHashBuffer = await crypto.subtle.digest('SHA-256', outputData);
    const outputHashArray = Array.from(new Uint8Array(outputHashBuffer));
    const outputHash = outputHashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const responseTime = Date.now() - startTime;

    // Format citations from RAG results
    const citations = relevantChunks.map((chunk: any) => ({
      source: chunk.source || 'Unknown',
      section: chunk.section || 'N/A',
      content: chunk.content?.substring(0, 200) + '...',
      similarity: chunk.similarity || 0,
    }));

    // Store session in database
    const { error: insertError } = await supabaseClient
      .from('regsense_sessions')
      .insert({
        organization_id: profile.organization_id,
        user_id: user.id,
        context_scope: scope,
        query_text: cleanQuery, // Store clean version, not masked
        response_text: response,
        citations,
        model_name: modelUsed,
        fallback_used: fallbackUsed,
        input_hash: inputHash,
        output_hash: outputHash,
        response_time_ms: responseTime,
      });

    if (insertError) {
      console.error('Failed to store session:', insertError);
      // Continue anyway - don't fail the request
    }

    // Log to audit trail
    await supabaseClient.from('audit_logs').insert({
      organization_id: profile.organization_id,
      actor_id: user.id,
      event_type: 'regsense_query',
      event_category: 'compliance_intelligence',
      action: 'query',
      agent: 'regsense',
      status: 'success',
      input_hash: inputHash,
      output_hash: outputHash,
      request_payload: {
        scope,
        query_length: cleanQuery.length,
        had_pii: hadPII,
      },
      response_summary: {
        model_used: modelUsed,
        fallback_used: fallbackUsed,
        citations_count: citations.length,
        response_time_ms: responseTime,
      },
    });

    return new Response(
      JSON.stringify({
        text: response,
        citations,
        metadata: {
          model_used: modelUsed,
          fallback_used: fallbackUsed,
          response_time_ms: responseTime,
          citations_count: citations.length,
          scope,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('RegSense query error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: 'Failed to process compliance query'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
