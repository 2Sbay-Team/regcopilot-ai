import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile) throw new Error('Profile not found')

    const organizationId = profile.organization_id

    // Calculate AI Act score
    const { data: aiSystems } = await supabaseClient
      .from('ai_systems')
      .select('id, risk_category')
      .eq('organization_id', organizationId)

    const { data: aiAssessments } = await supabaseClient
      .from('ai_act_assessments')
      .select('ai_system_id, risk_category, annex_iv_compliant')
      .in('ai_system_id', aiSystems?.map(s => s.id) || [])

    let aiActScore = 100
    if (aiAssessments && aiAssessments.length > 0) {
      const highRiskNonCompliant = aiAssessments.filter(
        a => a.risk_category === 'high-risk' && !a.annex_iv_compliant
      ).length
      const totalHighRisk = aiAssessments.filter(a => a.risk_category === 'high-risk').length
      
      if (totalHighRisk > 0) {
        aiActScore = Math.max(0, 100 - (highRiskNonCompliant / totalHighRisk) * 100)
      }
    }

    // Calculate GDPR score
    const { data: gdprAssessments } = await supabaseClient
      .from('gdpr_assessments')
      .select('violations')
      .eq('organization_id', organizationId)

    let gdprScore = 100
    if (gdprAssessments && gdprAssessments.length > 0) {
      const totalViolations = gdprAssessments.reduce((sum, a) => {
        const violations = a.violations as any
        return sum + (Array.isArray(violations) ? violations.length : 0)
      }, 0)
      gdprScore = Math.max(0, 100 - totalViolations * 5)
    }

    // Calculate ESG score
    const { data: esgReports } = await supabaseClient
      .from('esg_reports')
      .select('completeness_score')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(1)

    const esgScore = esgReports?.[0]?.completeness_score || 0

    // Calculate overall score (weighted average)
    const overallScore = (aiActScore * 0.4 + gdprScore * 0.4 + esgScore * 0.2)

    // Insert score
    const { error: insertError } = await supabaseClient
      .from('compliance_scores')
      .insert({
        organization_id: organizationId,
        ai_act_score: Math.round(aiActScore),
        gdpr_score: Math.round(gdprScore),
        esg_score: Math.round(esgScore),
        overall_score: Math.round(overallScore),
      })

    if (insertError) throw insertError

    return new Response(
      JSON.stringify({
        ai_act_score: Math.round(aiActScore),
        gdpr_score: Math.round(gdprScore),
        esg_score: Math.round(esgScore),
        overall_score: Math.round(overallScore),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error calculating compliance score:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
