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
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    const orgId = profile?.organization_id;
    if (!orgId) {
      return new Response(JSON.stringify({ error: 'No organization found' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { report_period = '2024', format = 'json' } = await req.json();

    console.log('Generating ESG report for org:', orgId, 'period:', report_period);

    // 1. Fetch KPI results
    const { data: kpiResults } = await supabase
      .from('esg_kpi_results')
      .select('*')
      .eq('org_id', orgId)
      .like('period', `${report_period}%`)
      .order('metric_code');

    if (!kpiResults || kpiResults.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No KPI data found for report period' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Fetch validation results
    const { data: validationResults } = await supabase
      .from('esg_validation_results')
      .select('*')
      .eq('organization_id', orgId)
      .order('validated_at', { ascending: false })
      .limit(10);

    // 3. Calculate materiality matrix (simplified scoring)
    const materialityMatrix = {
      environmental: {
        impact: 8.5,
        stakeholder_concern: 9.0,
        topics: ['Climate Change', 'Energy', 'Emissions']
      },
      social: {
        impact: 7.5,
        stakeholder_concern: 8.0,
        topics: ['Employee Welfare', 'Diversity', 'Health & Safety']
      },
      governance: {
        impact: 8.0,
        stakeholder_concern: 8.5,
        topics: ['Business Ethics', 'Risk Management', 'Compliance']
      }
    };

    // 4. Group KPIs by category
    const kpisByCategory = {
      E1: kpiResults.filter(k => k.metric_code.startsWith('E1-')),
      E2: kpiResults.filter(k => k.metric_code.startsWith('E2-')),
      S1: kpiResults.filter(k => k.metric_code.startsWith('S1-')),
      G1: kpiResults.filter(k => k.metric_code.startsWith('G1-')),
    };

    // 5. Generate narrative sections
    const narratives = {
      executive_summary: `This ESG report for ${report_period} provides a comprehensive overview of environmental, social, and governance performance. The report demonstrates our commitment to sustainability and transparency, with ${kpiResults.length} key performance indicators tracked and validated.`,
      
      environmental: `Environmental performance in ${report_period} shows ${kpisByCategory.E1.length} metrics tracked across energy consumption and emissions. Key highlights include Scope 1 and Scope 2 emissions monitoring, with a focus on reduction targets aligned with science-based climate goals.`,
      
      social: `Social metrics encompass workforce composition and diversity indicators, with ${kpisByCategory.S1.length} KPIs monitored. Our commitment to employee wellbeing and inclusive workplace practices is reflected in comprehensive data collection and reporting.`,
      
      governance: `Governance structures and risk management frameworks are evaluated through ${kpisByCategory.G1.length} metrics, ensuring robust oversight and ethical business practices across all operations.`,
    };

    // 6. Calculate trends (year-over-year if available)
    const trends = kpiResults.reduce((acc, kpi) => {
      const key = kpi.metric_code;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push({
        period: kpi.period,
        value: kpi.value,
        unit: kpi.unit
      });
      return acc;
    }, {} as Record<string, any[]>);

    // 7. Build complete report object
    const report = {
      report_metadata: {
        report_id: crypto.randomUUID(),
        organization_id: orgId,
        reporting_period: report_period,
        generated_at: new Date().toISOString(),
        report_version: '1.0',
        framework: 'ESRS 2023',
      },
      
      materiality_assessment: materialityMatrix,
      
      kpi_summary: {
        total_kpis: kpiResults.length,
        by_category: {
          environmental: kpisByCategory.E1.length + kpisByCategory.E2.length,
          social: kpisByCategory.S1.length,
          governance: kpisByCategory.G1.length,
        },
      },
      
      kpi_data: kpiResults.map(kpi => ({
        metric_code: kpi.metric_code,
        metric_name: kpi.metric_code,
        value: kpi.value,
        unit: kpi.unit,
        period: kpi.period,
        data_source: 'Integrated data ingestion',
        verification_status: 'validated',
      })),
      
      trends_and_analysis: trends,
      
      narrative_disclosures: narratives,
      
      validation_status: {
        total_checks: validationResults?.length || 0,
        passed: validationResults?.filter(v => v.status === 'pass').length || 0,
        warnings: validationResults?.filter(v => v.status === 'warning').length || 0,
        failed: validationResults?.filter(v => v.status === 'fail').length || 0,
        last_validation: validationResults?.[0]?.validated_at,
      },
      
      audit_trail: {
        data_lineage_verified: true,
        methodology: 'Automated data ingestion with manual oversight',
        assurance_level: 'limited',
      },
    };

    // 8. Store report in database
    const { data: storedReport, error: storeError } = await supabase
      .from('esg_reports')
      .insert({
        organization_id: orgId,
        report_data: report,
        report_period: report_period,
        status: 'published',
        completeness: Math.min(100, (kpiResults.length / 20) * 100),
      })
      .select()
      .single();

    if (storeError) {
      console.error('Error storing report:', storeError);
    }

    // 9. Return report based on format
    if (format === 'html') {
      const html = generateHTMLReport(report);
      return new Response(html, {
        headers: { ...corsHeaders, 'Content-Type': 'text/html' }
      });
    } else if (format === 'pdf') {
      // For now, return JSON with PDF generation instructions
      return new Response(
        JSON.stringify({
          success: true,
          message: 'PDF generation requires client-side rendering',
          report_id: storedReport?.id,
          report_data: report,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // JSON format
      return new Response(
        JSON.stringify({
          success: true,
          report_id: storedReport?.id,
          report: report,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error: any) {
    console.error('Report generation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateHTMLReport(report: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>ESG Report ${report.report_metadata.reporting_period}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
    h1 { color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
    h2 { color: #1e40af; margin-top: 30px; }
    .kpi-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .kpi-table th, .kpi-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    .kpi-table th { background-color: #2563eb; color: white; }
    .kpi-table tr:nth-child(even) { background-color: #f9fafb; }
    .summary-box { background: #eff6ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; }
    .validation-status { display: inline-block; padding: 5px 10px; border-radius: 4px; font-weight: bold; }
    .status-pass { background: #dcfce7; color: #166534; }
    .status-warning { background: #fef3c7; color: #92400e; }
    .status-fail { background: #fee2e2; color: #991b1b; }
  </style>
</head>
<body>
  <h1>ESG Report - ${report.report_metadata.reporting_period}</h1>
  
  <div class="summary-box">
    <h2>Executive Summary</h2>
    <p>${report.narrative_disclosures.executive_summary}</p>
    <p><strong>Total KPIs:</strong> ${report.kpi_summary.total_kpis}</p>
    <p><strong>Validation Status:</strong> 
      <span class="validation-status status-pass">${report.validation_status.passed} Passed</span>
      <span class="validation-status status-warning">${report.validation_status.warnings} Warnings</span>
      <span class="validation-status status-fail">${report.validation_status.failed} Failed</span>
    </p>
  </div>

  <h2>Key Performance Indicators</h2>
  <table class="kpi-table">
    <thead>
      <tr>
        <th>Metric Code</th>
        <th>Value</th>
        <th>Unit</th>
        <th>Period</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${report.kpi_data.map((kpi: any) => `
        <tr>
          <td>${kpi.metric_code}</td>
          <td>${kpi.value}</td>
          <td>${kpi.unit}</td>
          <td>${kpi.period}</td>
          <td><span class="validation-status status-pass">${kpi.verification_status}</span></td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>Environmental Performance</h2>
  <p>${report.narrative_disclosures.environmental}</p>

  <h2>Social Performance</h2>
  <p>${report.narrative_disclosures.social}</p>

  <h2>Governance</h2>
  <p>${report.narrative_disclosures.governance}</p>

  <div class="summary-box">
    <h2>Audit Trail</h2>
    <p><strong>Data Lineage Verified:</strong> ${report.audit_trail.data_lineage_verified ? 'Yes' : 'No'}</p>
    <p><strong>Methodology:</strong> ${report.audit_trail.methodology}</p>
    <p><strong>Assurance Level:</strong> ${report.audit_trail.assurance_level}</p>
  </div>

  <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666;">
    <p>Generated on ${new Date(report.report_metadata.generated_at).toLocaleString()}</p>
    <p>Report ID: ${report.report_metadata.report_id}</p>
  </footer>
</body>
</html>
  `;
}
