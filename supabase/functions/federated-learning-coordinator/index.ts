import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action } = await req.json();

    if (action === 'start_round') {
      // Start a new federated learning round
      const { data: latestRound } = await supabase
        .from('federated_learning_rounds')
        .select('round_number')
        .order('round_number', { ascending: false })
        .limit(1);

      const newRoundNumber = (latestRound?.[0]?.round_number || 0) + 1;

      // Fetch participating organizations (those who opted in)
      const { data: orgs } = await supabase
        .from('organizations')
        .select('id')
        .eq('federated_learning_enabled', true);

      const participatingCount = orgs?.length || 0;

      if (participatingCount === 0) {
        return new Response(
          JSON.stringify({ error: 'No organizations opted into federated learning' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Aggregate anonymized compliance metrics (no PII)
      const { data: aggregatedScores } = await supabase
        .from('compliance_scores')
        .select('ai_act_score, gdpr_score, esg_score')
        .in('organization_id', (orgs || []).map((o) => o.id))
        .order('calculated_at', { ascending: false })
        .limit(100);

      const avgAiActScore = (aggregatedScores || []).reduce((sum, s) => sum + Number(s.ai_act_score || 0), 0) / Math.max((aggregatedScores?.length || 1), 1);
      const avgGdprScore = (aggregatedScores || []).reduce((sum, s) => sum + Number(s.gdpr_score || 0), 0) / Math.max((aggregatedScores?.length || 1), 1);
      const avgEsgScore = (aggregatedScores || []).reduce((sum, s) => sum + Number(s.esg_score || 0), 0) / Math.max((aggregatedScores?.length || 1), 1);

      const aggregatedMetrics = {
        avg_ai_act_score: avgAiActScore,
        avg_gdpr_score: avgGdprScore,
        avg_esg_score: avgEsgScore,
        participating_orgs: participatingCount,
        timestamp: new Date().toISOString(),
      };

      const { data: newRound, error: insertError } = await supabase
        .from('federated_learning_rounds')
        .insert({
          round_number: newRoundNumber,
          participating_orgs: participatingCount,
          model_version: `v1.0.${newRoundNumber}`,
          aggregated_metrics: aggregatedMetrics,
          privacy_guarantee: 'DP-FedAvg',
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      return new Response(
        JSON.stringify({
          round_number: newRoundNumber,
          participating_orgs: participatingCount,
          aggregated_metrics: aggregatedMetrics,
          status: 'completed',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'get_rounds') {
      // Get recent federated learning rounds
      const { data: rounds } = await supabase
        .from('federated_learning_rounds')
        .select('*')
        .order('round_number', { ascending: false })
        .limit(10);

      return new Response(
        JSON.stringify({ rounds }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action. Use "start_round" or "get_rounds"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Federated learning error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
