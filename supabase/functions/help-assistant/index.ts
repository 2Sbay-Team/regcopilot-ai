import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { query, language = 'en', conversationHistory = [] } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log search query
    const { data: { user } } = await supabase.auth.getUser(
      req.headers.get('Authorization')?.replace('Bearer ', '') || ''
    );

    // Step 1: Perform RAG search on documentation
    const { data: ragResults, error: ragError } = await supabase.functions.invoke('rag-search', {
      body: { 
        query, 
        top_k: 5,
        source_filter: ['user_guide', 'admin_guide', 'api_docs']
      }
    });

    let contextChunks = [];
    if (!ragError && ragResults?.results) {
      contextChunks = ragResults.results;
    }

    // Step 2: Search help articles
    const { data: articles } = await supabase
      .from('help_articles')
      .select('*')
      .eq('language', language)
      .textSearch('title', query, { type: 'websearch' })
      .limit(3);

    // Step 3: Build context for LLM
    let context = '# Available Documentation:\n\n';
    
    if (contextChunks.length > 0) {
      context += '## Relevant Sections:\n';
      contextChunks.forEach((chunk: any, i: number) => {
        context += `\n### Source ${i + 1}: ${chunk.source || 'Documentation'}\n`;
        context += `Section: ${chunk.section || 'General'}\n`;
        context += `${chunk.content}\n`;
      });
    }

    if (articles && articles.length > 0) {
      context += '\n## Help Articles:\n';
      articles.forEach((article: any) => {
        context += `\n### ${article.title}\n${article.content.substring(0, 500)}...\n`;
      });
    }

    // Step 4: Call Lovable AI for response
    const systemPrompt = `You are a helpful AI assistant for the Compliance & ESG Copilot platform.

Your role:
- Answer user questions about the platform using ONLY the provided documentation
- Provide clear, step-by-step guidance
- Include specific feature names and navigation paths
- If information is not in the docs, say "I don't have that information in the documentation"
- Always cite sources by mentioning the section or guide
- Be concise but complete
- Use the user's language (${language})

Current user question: "${query}"

${context}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: query }
    ];

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const answer = aiData.choices[0].message.content;

    // Log the search
    const resultFound = contextChunks.length > 0 || (articles && articles.length > 0);
    await supabase.from('help_search_logs').insert({
      user_id: user?.id,
      query,
      result_found: resultFound,
      language,
      result_count: contextChunks.length + (articles?.length || 0)
    });

    return new Response(
      JSON.stringify({
        answer,
        sources: contextChunks.map((c: any) => ({
          source: c.source,
          section: c.section,
          similarity: c.similarity
        })),
        articles: articles?.map(a => ({
          title: a.title,
          slug: a.slug
        }))
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in help-assistant:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});