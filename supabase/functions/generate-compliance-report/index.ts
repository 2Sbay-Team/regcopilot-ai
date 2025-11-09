import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0'
import { corsHeaders } from '../_shared/cors.ts'

interface ReportRequest {
  organization_id: string
  report_type: 'weekly' | 'monthly' | 'quarterly' | 'adhoc'
  period_start: string
  period_end: string
  user_id?: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Support both automated cron jobs and manual requests
    const body = req.method === 'GET' ? {} : await req.json()
    const { organization_id, report_type = 'weekly', period_start, period_end, user_id }: Partial<ReportRequest> = body

    // For automated weekly reports, process all organizations
    if (!organization_id) {
      const { data: organizations } = await supabase
        .from('organizations')
        .select('id, name')
      
      const results = []
      for (const org of organizations || []) {
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - 7) // Last 7 days
        
        const result = await generateReportForOrg(
          supabase, 
          org.id, 
          'weekly',
          startDate.toISOString(),
          endDate.toISOString(),
          null
        )
        results.push({ organization: org.name, ...result })
      }
      
      return new Response(JSON.stringify({ 
        success: true, 
        reports_generated: results.length,
        results 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Single organization report
    const result = await generateReportForOrg(
      supabase,
      organization_id,
      report_type,
      period_start || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      period_end || new Date().toISOString(),
      user_id || null
    )

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: result.success ? 200 : 500
    })

  } catch (error) {
    console.error('Error generating report:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})

async function generateReportForOrg(
  supabase: any,
  organization_id: string,
  report_type: string,
  period_start: string,
  period_end: string,
  user_id: string | null
) {
  try {

    console.log(`Generating ${report_type} compliance report for org ${organization_id}`)

    const startDate = new Date(period_start)
    const endDate = new Date(period_end)

    // Aggregate data from all sources
    const [aiActData, gdprData, esgData, alertData, auditData] = await Promise.all([
      // AI Act assessments
      supabase
        .from('ai_act_assessments')
        .select('risk_category, status, created_at')
        .eq('ai_system_id', organization_id) // This needs proper join
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString()),
      
      // GDPR assessments
      supabase
        .from('gdpr_assessments')
        .select('violations, status, created_at')
        .eq('organization_id', organization_id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString()),
      
      // ESG reports
      supabase
        .from('esg_reports')
        .select('completeness_score, metrics_summary, created_at')
        .eq('organization_id', organization_id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString()),
      
      // Alert notifications
      supabase
        .from('alert_notifications')
        .select('metric_type, metric_value, threshold_value, acknowledged, triggered_at')
        .eq('organization_id', organization_id)
        .gte('triggered_at', startDate.toISOString())
        .lte('triggered_at', endDate.toISOString()),
      
      // Audit logs
      supabase
        .from('audit_logs')
        .select('agent, action, status, timestamp')
        .eq('organization_id', organization_id)
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString())
    ])

    // Calculate summary statistics
    const aiActSummary = {
      total: aiActData.data?.length || 0,
      high_risk: aiActData.data?.filter((a: any) => a.risk_category === 'high' || a.risk_category === 'unacceptable').length || 0,
      limited_risk: aiActData.data?.filter((a: any) => a.risk_category === 'limited').length || 0,
      minimal_risk: aiActData.data?.filter((a: any) => a.risk_category === 'minimal').length || 0,
    }

    const gdprSummary = {
      total: gdprData.data?.length || 0,
      violations: gdprData.data?.reduce((sum: number, a: any) => sum + (Array.isArray(a.violations) ? a.violations.length : 0), 0) || 0,
      by_article: {} as Record<string, number>
    }

    // Aggregate violations by article
    gdprData.data?.forEach((assessment: any) => {
      if (Array.isArray(assessment.violations)) {
        assessment.violations.forEach((v: any) => {
          const article = v.article || 'Unknown'
          gdprSummary.by_article[article] = (gdprSummary.by_article[article] || 0) + 1
        })
      }
    })

    const esgSummary = {
      total: esgData.data?.length || 0,
      avg_completeness: (esgData.data && esgData.data.length > 0) 
        ? esgData.data.reduce((sum: number, r: any) => sum + (r.completeness_score || 0), 0) / esgData.data.length
        : 0,
    }

    const alertSummary = {
      total: alertData.data?.length || 0,
      acknowledged: alertData.data?.filter((a: any) => a.acknowledged).length || 0,
      unacknowledged: alertData.data?.filter((a: any) => !a.acknowledged).length || 0,
      by_type: {} as Record<string, number>
    }

    alertData.data?.forEach((alert: any) => {
      alertSummary.by_type[alert.metric_type] = (alertSummary.by_type[alert.metric_type] || 0) + 1
    })

    const activitySummary = {
      total_actions: auditData.data?.length || 0,
      by_agent: {} as Record<string, number>,
      by_status: {} as Record<string, number>
    }

    auditData.data?.forEach((log: any) => {
      activitySummary.by_agent[log.agent] = (activitySummary.by_agent[log.agent] || 0) + 1
      activitySummary.by_status[log.status] = (activitySummary.by_status[log.status] || 0) + 1
    })

    // Build report data
    const reportData = {
      period: {
        start: period_start,
        end: period_end,
        type: report_type
      },
      summary: {
        ai_act: aiActSummary,
        gdpr: gdprSummary,
        esg: esgSummary,
        alerts: alertSummary,
        activity: activitySummary
      },
      details: {
        ai_act_assessments: aiActData.data || [],
        gdpr_assessments: gdprData.data || [],
        esg_reports: esgData.data || [],
        alert_notifications: alertData.data || [],
      },
      generated_at: new Date().toISOString(),
      risk_score: calculateRiskScore(aiActSummary, gdprSummary, alertSummary)
    }

    // Save report to database
    const { data: report, error: insertError } = await supabase
      .from('compliance_reports')
      .insert({
        organization_id,
        report_type,
        report_period_start: period_start,
        report_period_end: period_end,
        generated_by: user_id,
        report_data: reportData,
        status: 'completed'
      })
      .select()
      .single()

    if (insertError) {
      console.error('Failed to save report:', insertError)
      throw insertError
    }

    console.log(`Report generated successfully: ${report.id}`)

    return { 
      success: true, 
      report_id: report.id,
      report_data: reportData 
    }

  } catch (error) {
    console.error('Error generating report:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

function calculateRiskScore(
  aiAct: any, 
  gdpr: any, 
  alerts: any
): number {
  let score = 0
  
  // AI Act risk contribution (0-40 points)
  const highRiskRatio = aiAct.total > 0 ? aiAct.high_risk / aiAct.total : 0
  score += highRiskRatio * 40
  
  // GDPR violations contribution (0-30 points)
  const violationRatio = gdpr.total > 0 ? Math.min(gdpr.violations / gdpr.total, 1) : 0
  score += violationRatio * 30
  
  // Alerts contribution (0-30 points)
  const unacknowledgedRatio = alerts.total > 0 ? alerts.unacknowledged / alerts.total : 0
  score += unacknowledgedRatio * 30
  
  return Math.round(score)
}
