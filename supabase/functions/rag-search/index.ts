import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0'
import { corsHeaders } from '../_shared/cors.ts'
import { sanitizeInput } from '../_shared/sanitize.ts'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const RAGSearchSchema = z.object({
  query: z.string().trim().min(1).max(500),
  top_k: z.number().int().min(1).max(20).optional(),
  source_filter: z.string().optional()
})

interface RAGSearchRequest {
  query: string
  top_k?: number
  source_filter?: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured')
    }

    const rawBody = await req.json()
    
    // Validate input
    const validationResult = RAGSearchSchema.safeParse(rawBody)
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid request parameters' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    const { query: rawQuery, top_k = 5, source_filter } = validationResult.data
    
    // Sanitize query input
    const query = sanitizeInput(rawQuery, 500)

    console.log('RAG search query:', query)

    // Generate embedding using Lovable AI Gateway (Gemini)
    let queryEmbedding: number[]
    
    try {
      const embeddingResponse = await fetch('https://ai.gateway.lovable.dev/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'text-embedding-004',
          input: query
        })
      })

      if (!embeddingResponse.ok) {
        throw new Error(`Embedding API error: ${embeddingResponse.status}`)
      }

      const embeddingData = await embeddingResponse.json()
      queryEmbedding = embeddingData.data[0].embedding
      
      console.log('Generated embedding, dimension:', queryEmbedding.length)
    } catch (embeddingError) {
      console.error('Failed to generate embedding:', embeddingError)
      // Fallback to text search immediately
      const { data: textResults } = await supabase
        .from('document_chunks')
        .select('id, content, metadata')
        .textSearch('content', query, { type: 'websearch' })
        .limit(top_k)

      return new Response(
        JSON.stringify({
          success: true,
          results: textResults?.map(r => ({
            content: r.content,
            section: r.metadata?.section || 'N/A',
            source: r.metadata?.source || 'Unknown',
            similarity: 0.5
          })) || [],
          fallback: true,
          reason: 'embedding_generation_failed'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

    // Search for similar chunks
    let searchQuery = supabase
      .rpc('match_regulatory_chunks', {
        query_embedding: queryEmbedding,
        match_threshold: 0.7,
        match_count: top_k
      })

    const { data: results, error } = await searchQuery

    if (error) {
      console.error('Vector search error:', error)
      // Fallback to text search
      const { data: textResults } = await supabase
        .from('document_chunks')
        .select('id, content, metadata')
        .textSearch('content', query, { type: 'websearch' })
        .limit(top_k)

      return new Response(
        JSON.stringify({
          success: true,
          results: textResults?.map(r => ({
            content: r.content,
            section: r.metadata?.section || 'N/A',
            source: r.metadata?.source || 'Unknown',
            similarity: 0.5
          })) || [],
          fallback: true
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        results: results || [],
        query
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('RAG search error:', error) // Log detailed error server-side
    // Return generic error to client (don't leak internals)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'An error occurred processing your search request. Please try again.' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
