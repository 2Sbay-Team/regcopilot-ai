import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0'
import { corsHeaders } from '../_shared/cors.ts'

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

    const { query, top_k = 5, source_filter }: RAGSearchRequest = await req.json()

    if (!query || query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    console.log('RAG search query:', query)

    // Generate embedding for query (placeholder - in production use OpenAI embeddings)
    const queryEmbedding = new Array(1536).fill(0).map(() => Math.random())

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
    console.error('RAG search error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
