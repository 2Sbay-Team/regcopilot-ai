import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    const { organization_id, period_start, period_end, report_type } = await req.json()

    if (!organization_id || !period_start || !period_end) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Generating report for:', { organization_id, period_start, period_end })

    // Fetch organization details
    const { data: org } = await supabaseClient
      .from('organizations')
      .select('*')
      .eq('id', organization_id)
      .single()

    // Fetch AI Act assessments
    // First get AI systems for this organization
    const { data: aiSystems } = await supabaseClient
      .from('ai_systems')
      .select('id')
      .eq('organization_id', organization_id)

    const aiSystemIds = aiSystems?.map(sys => sys.id) || []

    const { data: aiActData } = await supabaseClient
      .from('ai_act_assessments')
      .select(`
        *,
        ai_systems (
          name,
          purpose,
          deployment_status
        )
      `)
      .gte('assessment_date', period_start)
      .lte('assessment_date', period_end)
      .in('ai_system_id', aiSystemIds)

    // Fetch GDPR assessments
    const { data: gdprData } = await supabaseClient
      .from('gdpr_assessments')
      .select('*')
      .eq('organization_id', organization_id)
      .gte('assessment_date', period_start)
      .lte('assessment_date', period_end)

    // Fetch ESG reports
    const { data: esgData } = await supabaseClient
      .from('esg_reports')
      .select('*')
      .eq('organization_id', organization_id)
      .gte('created_at', period_start)
      .lte('created_at', period_end)

    // Generate report data
    const reportData = {
      organization: org,
      period: { start: period_start, end: period_end },
      ai_act: {
        total_assessments: aiActData?.length || 0,
        risk_distribution: calculateRiskDistribution(aiActData || []),
        summary: generateAIActSummary(aiActData || [])
      },
      gdpr: {
        total_assessments: gdprData?.length || 0,
        violations_found: countGDPRViolations(gdprData || []),
        summary: generateGDPRSummary(gdprData || [])
      },
      esg: {
        total_reports: esgData?.length || 0,
        avg_completeness: calculateAvgCompleteness(esgData || []),
        summary: generateESGSummary(esgData || [])
      },
      generated_at: new Date().toISOString()
    }

    // Generate PDF content as HTML
    const htmlContent = generateHTMLReport(reportData)

    // Store report in database
    const { data: report, error: insertError } = await supabaseClient
      .from('compliance_reports')
      .insert({
        organization_id,
        report_type: report_type || 'unified',
        report_period_start: period_start,
        report_period_end: period_end,
        report_data: reportData,
        status: 'completed'
      })
      .select()
      .single()

    if (insertError) throw insertError

    console.log('Report generated successfully:', report.id)

    return new Response(
      JSON.stringify({
        success: true,
        report_id: report.id,
        report_data: reportData,
        html_content: htmlContent
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error: any) {
    console.error('Error generating report:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

function calculateRiskDistribution(assessments: any[]) {
  const distribution: Record<string, number> = {
    minimal: 0,
    limited: 0,
    high: 0,
    unacceptable: 0
  }
  
  assessments.forEach(assessment => {
    const risk = assessment.risk_category?.toLowerCase() || 'minimal'
    distribution[risk] = (distribution[risk] || 0) + 1
  })
  
  return distribution
}

function countGDPRViolations(assessments: any[]) {
  let total = 0
  assessments.forEach(assessment => {
    if (assessment.violations && Array.isArray(assessment.violations)) {
      total += assessment.violations.length
    }
  })
  return total
}

function calculateAvgCompleteness(reports: any[]) {
  if (reports.length === 0) return 0
  const sum = reports.reduce((acc, report) => acc + (Number(report.completeness_score) || 0), 0)
  return (sum / reports.length).toFixed(1)
}

function generateAIActSummary(assessments: any[]) {
  const highRisk = assessments.filter(a => a.risk_category === 'high').length
  const total = assessments.length
  
  if (total === 0) return 'No AI Act assessments conducted during this period.'
  
  return `Assessed ${total} AI system${total !== 1 ? 's' : ''}. ${highRisk} classified as high-risk, requiring enhanced compliance measures under EU AI Act Articles 9-15.`
}

function generateGDPRSummary(assessments: any[]) {
  const total = assessments.length
  const violations = countGDPRViolations(assessments)
  
  if (total === 0) return 'No GDPR assessments conducted during this period.'
  
  return `Conducted ${total} GDPR assessment${total !== 1 ? 's' : ''}. Identified ${violations} potential violation${violations !== 1 ? 's' : ''} requiring remediation.`
}

function generateESGSummary(reports: any[]) {
  const total = reports.length
  const avgScore = calculateAvgCompleteness(reports)
  
  if (total === 0) return 'No ESG reports generated during this period.'
  
  return `Generated ${total} ESG report${total !== 1 ? 's' : ''} with average completeness score of ${avgScore}%. Tracking environmental, social, and governance metrics per CSRD/ESRS standards.`
}

function generateHTMLReport(data: any) {
  const { organization, period, ai_act, gdpr, esg, generated_at } = data
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Unified Compliance Report</title>
  <style>
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      line-height: 1.6; 
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .header { 
      text-align: center; 
      border-bottom: 3px solid #4F46E5; 
      padding-bottom: 20px;
      margin-bottom: 40px;
    }
    .header h1 { 
      color: #4F46E5; 
      margin: 0 0 10px 0;
      font-size: 32px;
    }
    .header p { 
      color: #666; 
      margin: 5px 0;
    }
    .section { 
      margin: 30px 0;
      padding: 25px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #4F46E5;
    }
    .section h2 { 
      color: #4F46E5;
      margin-top: 0;
      font-size: 24px;
    }
    .metric { 
      display: inline-block;
      background: white;
      padding: 15px 20px;
      margin: 10px 10px 10px 0;
      border-radius: 6px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .metric-label { 
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .metric-value { 
      font-size: 28px;
      font-weight: bold;
      color: #4F46E5;
      margin-top: 5px;
    }
    .summary { 
      background: white;
      padding: 15px;
      border-radius: 6px;
      margin-top: 15px;
      border: 1px solid #e5e7eb;
    }
    .footer { 
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      color: #666;
      font-size: 14px;
    }
    .risk-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      margin: 5px;
    }
    .risk-minimal { background: #10b981; color: white; }
    .risk-limited { background: #f59e0b; color: white; }
    .risk-high { background: #ef4444; color: white; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🛡️ Unified Compliance Report</h1>
    <p><strong>${organization?.name || 'Organization'}</strong></p>
    <p>Report Period: ${new Date(period.start).toLocaleDateString()} - ${new Date(period.end).toLocaleDateString()}</p>
    <p>Generated: ${new Date(generated_at).toLocaleString()}</p>
  </div>

  <div class="section">
    <h2>📊 Executive Summary</h2>
    <div class="metric">
      <div class="metric-label">AI Act Assessments</div>
      <div class="metric-value">${ai_act.total_assessments}</div>
    </div>
    <div class="metric">
      <div class="metric-label">GDPR Assessments</div>
      <div class="metric-value">${gdpr.total_assessments}</div>
    </div>
    <div class="metric">
      <div class="metric-label">ESG Reports</div>
      <div class="metric-value">${esg.total_reports}</div>
    </div>
    <div class="metric">
      <div class="metric-label">GDPR Violations</div>
      <div class="metric-value">${gdpr.violations_found}</div>
    </div>
  </div>

  <div class="section">
    <h2>🤖 EU AI Act Compliance</h2>
    <div class="summary">
      <p>${ai_act.summary}</p>
    </div>
    <div style="margin-top: 20px;">
      <strong>Risk Distribution:</strong><br>
      ${Object.entries(ai_act.risk_distribution).map(([risk, count]) => 
        `<span class="risk-badge risk-${risk}">${risk.toUpperCase()}: ${count}</span>`
      ).join('')}
    </div>
  </div>

  <div class="section">
    <h2>🔒 GDPR Privacy Compliance</h2>
    <div class="summary">
      <p>${gdpr.summary}</p>
    </div>
    ${gdpr.violations_found > 0 ? `
      <div style="margin-top: 15px; padding: 12px; background: #fee2e2; border-radius: 6px; border-left: 4px solid #ef4444;">
        <strong>⚠️ Action Required:</strong> ${gdpr.violations_found} potential violation${gdpr.violations_found !== 1 ? 's' : ''} identified. Review assessment details for remediation steps.
      </div>
    ` : ''}
  </div>

  <div class="section">
    <h2>🌱 ESG & Sustainability Reporting</h2>
    <div class="summary">
      <p>${esg.summary}</p>
    </div>
    ${esg.total_reports > 0 ? `
      <div style="margin-top: 15px;">
        <strong>Average Completeness Score:</strong> 
        <span style="font-size: 24px; color: ${Number(esg.avg_completeness) >= 80 ? '#10b981' : '#f59e0b'}; font-weight: bold;">
          ${esg.avg_completeness}%
        </span>
      </div>
    ` : ''}
  </div>

  <div class="section">
    <h2>✅ Compliance Status</h2>
    <div class="summary">
      <p><strong>Overall Assessment:</strong></p>
      <ul>
        <li>EU AI Act: ${ai_act.total_assessments > 0 ? 'Active monitoring ✓' : 'No activity'}</li>
        <li>GDPR: ${gdpr.violations_found === 0 ? 'Compliant ✓' : `${gdpr.violations_found} issue(s) identified ⚠️`}</li>
        <li>ESG/CSRD: ${esg.total_reports > 0 ? `${esg.avg_completeness}% data coverage` : 'No reports'}</li>
      </ul>
      <p style="margin-top: 20px; font-style: italic; color: #666;">
        This report provides a comprehensive overview of compliance activities. For detailed analysis, 
        access individual module reports through the Regulix platform.
      </p>
    </div>
  </div>

  <div class="footer">
    <p><strong>Regulix</strong> - Regulatory Intelligence Copilot</p>
    <p>Powered by AI • Secured by Design • Compliant by Default</p>
    <p style="font-size: 12px; margin-top: 10px;">
      This report is confidential and intended solely for ${organization?.name || 'the organization'}. 
      Unauthorized distribution is prohibited.
    </p>
  </div>
</body>
</html>
  `
}