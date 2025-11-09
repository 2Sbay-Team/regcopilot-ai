import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TEST_QUERIES = [
  {
    query: 'EU AI Act high-risk AI systems requirements',
    expected_keywords: ['high-risk', 'ai act', 'requirements', 'annex'],
    min_similarity: 0.85,
  },
  {
    query: 'GDPR data subject rights Article 15',
    expected_keywords: ['gdpr', 'data subject', 'article 15', 'access'],
    min_similarity: 0.85,
  },
  {
    query: 'CSRD sustainability reporting requirements',
    expected_keywords: ['csrd', 'sustainability', 'esrs', 'reporting'],
    min_similarity: 0.85,
  },
];

function calculateRelevance(content: string, keywords: string[]): number {
  const lowerContent = content.toLowerCase();
  const matchCount = keywords.filter((kw) => lowerContent.includes(kw.toLowerCase())).length;
  return matchCount / keywords.length;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const testResults = [];

    for (const test of TEST_QUERIES) {
      try {
        // Call RAG search function
        const { data: ragResults, error } = await supabase.functions.invoke('rag-search', {
          body: { query: test.query, limit: 5 },
        });

        if (error) {
          testResults.push({
            query_text: test.query,
            expected_relevance: test.min_similarity,
            actual_relevance: 0,
            cosine_similarity: 0,
            passed: false,
            error: error.message,
          });
          continue;
        }

        // Calculate relevance of top result
        const topResult = ragResults?.results?.[0];
        const actualRelevance = topResult
          ? calculateRelevance(topResult.content || '', test.expected_keywords)
          : 0;
        const cosineSimilarity = topResult?.similarity || 0;

        const passed = actualRelevance >= test.min_similarity && cosineSimilarity >= test.min_similarity;

        testResults.push({
          query_text: test.query,
          expected_relevance: test.min_similarity,
          actual_relevance: actualRelevance,
          cosine_similarity: cosineSimilarity,
          embedding_model: 'gemini-embedding',
          passed,
        });
      } catch (err) {
        testResults.push({
          query_text: test.query,
          expected_relevance: test.min_similarity,
          actual_relevance: 0,
          cosine_similarity: 0,
          passed: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    // Store results
    const { error: insertError } = await supabase.from('rag_accuracy_metrics').insert(testResults);

    if (insertError) {
      console.error('Failed to store RAG metrics:', insertError);
    }

    const passedTests = testResults.filter((r) => r.passed).length;
    const passRate = testResults.length > 0 ? passedTests / testResults.length : 0;

    return new Response(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        total_tests: testResults.length,
        passed: passedTests,
        failed: testResults.length - passedTests,
        pass_rate: passRate,
        status: passRate >= 0.8 ? 'pass' : 'fail',
        results: testResults,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('RAG validation error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
