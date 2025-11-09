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

    const { organization_id, prediction_horizons } = await req.json();

    if (!organization_id) {
      return new Response(
        JSON.stringify({ error: 'organization_id required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const horizons = prediction_horizons || [30, 60, 90];
    const predictions = [];

    // Fetch historical compliance scores
    const { data: historicalScores } = await supabase
      .from('compliance_scores')
      .select('*')
      .eq('organization_id', organization_id)
      .order('calculated_at', { ascending: true })
      .limit(30);

    if (!historicalScores || historicalScores.length < 3) {
      return new Response(
        JSON.stringify({ error: 'Insufficient historical data for prediction' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Simple linear regression for trend prediction
    const calculateTrend = (values: number[]) => {
      const n = values.length;
      const sumX = values.reduce((sum, _, i) => sum + i, 0);
      const sumY = values.reduce((sum, val) => sum + val, 0);
      const sumXY = values.reduce((sum, val, i) => sum + i * val, 0);
      const sumX2 = values.reduce((sum, _, i) => sum + i * i, 0);
      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;
      return { slope, intercept };
    };

    const aiActScores = historicalScores.map((s) => Number(s.ai_act_score) || 0);
    const gdprScores = historicalScores.map((s) => Number(s.gdpr_score) || 0);
    const esgScores = historicalScores.map((s) => Number(s.esg_score) || 0);

    const aiActTrend = calculateTrend(aiActScores);
    const gdprTrend = calculateTrend(gdprScores);
    const esgTrend = calculateTrend(esgScores);

    for (const days of horizons) {
      const futureIndex = historicalScores.length + days / 7;

      const predictedAiAct = Math.max(0, Math.min(100, aiActTrend.slope * futureIndex + aiActTrend.intercept));
      const predictedGdpr = Math.max(0, Math.min(100, gdprTrend.slope * futureIndex + gdprTrend.intercept));
      const predictedEsg = Math.max(0, Math.min(100, esgTrend.slope * futureIndex + esgTrend.intercept));
      const predictedOverall = (predictedAiAct + predictedGdpr + predictedEsg) / 3;

      // Identify risk factors
      const riskFactors = [];
      if (predictedAiAct < 70) riskFactors.push({ type: 'ai_act', severity: 'high', description: 'AI Act compliance declining' });
      if (predictedGdpr < 70) riskFactors.push({ type: 'gdpr', severity: 'high', description: 'GDPR compliance declining' });
      if (predictedEsg < 70) riskFactors.push({ type: 'esg', severity: 'medium', description: 'ESG metrics declining' });

      // Generate recommendations
      const recommendations = [];
      if (predictedAiAct < 80) recommendations.push({ priority: 'high', action: 'Conduct AI Act gap analysis', impact: 'Prevents compliance drift' });
      if (predictedGdpr < 80) recommendations.push({ priority: 'high', action: 'Review data processing records', impact: 'Ensures GDPR alignment' });
      if (predictedEsg < 80) recommendations.push({ priority: 'medium', action: 'Update sustainability metrics', impact: 'Improves ESG reporting' });

      const confidence = Math.max(0.5, 1 - Math.abs(aiActTrend.slope) * 0.1);

      predictions.push({
        organization_id,
        prediction_horizon_days: days,
        predicted_ai_act_score: predictedAiAct,
        predicted_gdpr_score: predictedGdpr,
        predicted_esg_score: predictedEsg,
        predicted_overall_score: predictedOverall,
        confidence_level: confidence,
        risk_factors: riskFactors,
        recommendations,
      });
    }

    // Store predictions
    const { error: insertError } = await supabase.from('predictive_compliance_scores').insert(predictions);

    if (insertError) {
      console.error('Failed to store predictions:', insertError);
    }

    return new Response(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        organization_id,
        predictions,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Predictive analysis error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
