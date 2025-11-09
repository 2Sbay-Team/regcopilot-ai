import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return new Response(JSON.stringify({ error: 'Profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const orgId = profile.organization_id;

    // Calculate automation score (0-100)
    const { count: scheduledJobsCount } = await supabaseClient
      .from('scheduled_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('enabled', true);

    const { count: connectorsCount } = await supabaseClient
      .from('connectors')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('status', 'active');

    const automationScore = Math.min(100, 
      ((scheduledJobsCount || 0) * 10) + ((connectorsCount || 0) * 15)
    );

    // Calculate coverage score (0-100)
    const { count: aiActCount } = await supabaseClient
      .from('ai_act_assessments')
      .select('*', { count: 'exact', head: true })
      .eq('ai_system_id', orgId);

    const { count: gdprCount } = await supabaseClient
      .from('gdpr_assessments')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId);

    const { count: esgCount } = await supabaseClient
      .from('esg_reports')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId);

    const { count: nis2Count } = await supabaseClient
      .from('nis2_assessments')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId);

    const { count: doraCount } = await supabaseClient
      .from('dora_assessments')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId);

    const { count: dmaCount } = await supabaseClient
      .from('dma_assessments')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId);

    const totalAssessments = (aiActCount || 0) + (gdprCount || 0) + (esgCount || 0) + 
                            (nis2Count || 0) + (doraCount || 0) + (dmaCount || 0);
    const coverageScore = Math.min(100, totalAssessments * 5);

    // Calculate response score (based on task completion)
    const { count: completedTasks } = await supabaseClient
      .from('agent_task_history')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('status', 'completed');

    const { count: totalTasks } = await supabaseClient
      .from('agent_task_history')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId);

    const responseScore = totalTasks && totalTasks > 0 
      ? Math.round((completedTasks || 0) / totalTasks * 100)
      : 0;

    // Calculate explainability score (audit trail completeness)
    const { count: auditCount } = await supabaseClient
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId);

    const { count: explainabilityCount } = await supabaseClient
      .from('explainability_views')
      .select('*', { count: 'exact', head: true });

    const explainabilityScore = Math.min(100, 
      ((auditCount || 0) / 10) + ((explainabilityCount || 0) * 5)
    );

    // Calculate overall score (weighted average)
    const overallScore = Math.round(
      (automationScore * 0.25) +
      (coverageScore * 0.30) +
      (responseScore * 0.25) +
      (explainabilityScore * 0.20)
    );

    // Store the calculated scores
    const { error: insertError } = await supabaseClient
      .from('intelligence_scores')
      .insert({
        organization_id: orgId,
        overall_score: overallScore,
        automation_score: automationScore,
        coverage_score: coverageScore,
        response_score: responseScore,
        explainability_score: explainabilityScore
      });

    if (insertError) {
      throw insertError;
    }

    return new Response(
      JSON.stringify({
        overall_score: overallScore,
        automation_score: automationScore,
        coverage_score: coverageScore,
        response_score: responseScore,
        explainability_score: explainabilityScore
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error calculating intelligence score:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});