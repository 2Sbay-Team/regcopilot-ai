import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    const { report_type = 'full' } = await req.json()

    // Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, organizations(name)')
      .eq('id', user.id)
      .single()

    if (!profile?.organization_id) {
      throw new Error('Organization not found')
    }

    const orgId = profile.organization_id
    const orgName = (profile as any).organizations?.name || 'Your Organization'

    // Gather all security data
    const [vulnerabilities, controls, depVulns, scanHistory, securityEvents] = await Promise.all([
      supabase.from('security_vulnerabilities').select('*').eq('organization_id', orgId),
      supabase.from('compliance_controls').select('*').eq('organization_id', orgId),
      supabase.from('dependency_vulnerabilities').select('*').eq('organization_id', orgId),
      supabase.from('security_scan_history').select('*').eq('organization_id', orgId).order('started_at', { ascending: false }).limit(10),
      supabase.from('security_events').select('*').eq('organization_id', orgId).eq('is_threat', true).order('created_at', { ascending: false }).limit(20)
    ])

    // Generate report data structure
    const reportData = {
      title: 'Security & Compliance Report',
      organization: orgName,
      report_type,
      generated_at: new Date().toISOString(),
      generated_by: user.email,
      
      // Executive Summary
      executive_summary: {
        total_vulnerabilities: vulnerabilities.data?.length || 0,
        critical_vulnerabilities: vulnerabilities.data?.filter(v => v.severity === 'critical' && v.status !== 'resolved').length || 0,
        high_vulnerabilities: vulnerabilities.data?.filter(v => v.severity === 'high' && v.status !== 'resolved').length || 0,
        dependency_vulnerabilities: depVulns.data?.filter(v => v.status === 'open').length || 0,
        threats_detected: securityEvents.data?.length || 0,
        compliance_score: calculateComplianceScore(controls.data || [])
      },

      // Compliance Status
      compliance: {
        soc2: calculateFrameworkProgress(controls.data || [], 'SOC2'),
        iso27001: calculateFrameworkProgress(controls.data || [], 'ISO27001'),
        gdpr: calculateFrameworkProgress(controls.data || [], 'GDPR'),
        controls: controls.data || []
      },

      // Vulnerabilities
      vulnerabilities: {
        summary: groupBySeverity(vulnerabilities.data || []),
        details: vulnerabilities.data?.slice(0, 20) || [], // Top 20
        by_component: groupByComponent(vulnerabilities.data || [])
      },

      // Dependency Vulnerabilities
      dependencies: {
        summary: groupBySeverity(depVulns.data || []),
        critical_packages: depVulns.data?.filter(v => v.severity === 'critical' && v.status === 'open') || [],
        remediation_needed: depVulns.data?.filter(v => v.status === 'open') || []
      },

      // Threat Analysis
      threats: {
        recent_events: securityEvents.data || [],
        by_severity: groupBySeverity(securityEvents.data || []),
        attack_vectors: analyzeAttackVectors(securityEvents.data || [])
      },

      // Scan History
      scan_history: scanHistory.data || [],

      // Recommendations
      recommendations: generateRecommendations(
        vulnerabilities.data || [],
        depVulns.data || [],
        controls.data || [],
        securityEvents.data || []
      )
    }

    // Store report in database
    const { data: savedReport } = await supabase
      .from('compliance_reports')
      .insert({
        organization_id: orgId,
        report_type: 'security_compliance',
        report_period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        report_period_end: new Date().toISOString().split('T')[0],
        report_data: reportData,
        generated_by: user.id,
        status: 'completed'
      })
      .select()
      .single()

    return new Response(
      JSON.stringify({
        success: true,
        report: reportData,
        report_id: savedReport?.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Report generation error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function calculateComplianceScore(controls: any[]): number {
  if (controls.length === 0) return 0
  const implemented = controls.filter(c => c.status === 'implemented' || c.status === 'verified').length
  return Math.round((implemented / controls.length) * 100)
}

function calculateFrameworkProgress(controls: any[], framework: string) {
  const frameworkControls = controls.filter(c => c.required_for?.includes(framework))
  const total = frameworkControls.length
  const implemented = frameworkControls.filter(c => c.status === 'implemented' || c.status === 'verified').length
  const inProgress = frameworkControls.filter(c => c.status === 'in_progress').length
  const notStarted = frameworkControls.filter(c => c.status === 'not_started').length

  return {
    total,
    implemented,
    in_progress: inProgress,
    not_started: notStarted,
    percentage: total > 0 ? Math.round((implemented / total) * 100) : 0
  }
}

function groupBySeverity(items: any[]) {
  return {
    critical: items.filter(i => i.severity === 'critical').length,
    high: items.filter(i => i.severity === 'high').length,
    medium: items.filter(i => i.severity === 'medium').length,
    low: items.filter(i => i.severity === 'low').length,
    info: items.filter(i => i.severity === 'info').length
  }
}

function groupByComponent(vulnerabilities: any[]) {
  const grouped: Record<string, number> = {}
  vulnerabilities.forEach(v => {
    const component = v.affected_component || 'Unknown'
    grouped[component] = (grouped[component] || 0) + 1
  })
  return grouped
}

function analyzeAttackVectors(events: any[]) {
  const vectors: Record<string, number> = {}
  events.forEach(e => {
    const type = e.event_type || 'unknown'
    vectors[type] = (vectors[type] || 0) + 1
  })
  return vectors
}

function generateRecommendations(
  vulnerabilities: any[],
  depVulns: any[],
  controls: any[],
  threats: any[]
): string[] {
  const recommendations: string[] = []

  // Critical vulnerabilities
  const criticalVulns = vulnerabilities.filter(v => v.severity === 'critical' && v.status !== 'resolved')
  if (criticalVulns.length > 0) {
    recommendations.push(`URGENT: Address ${criticalVulns.length} critical vulnerabilities immediately`)
  }

  // Dependency updates
  const criticalDeps = depVulns.filter(d => d.severity === 'critical' && d.status === 'open')
  if (criticalDeps.length > 0) {
    recommendations.push(`Update ${criticalDeps.length} critical dependencies with known vulnerabilities`)
  }

  // Compliance gaps
  const notStartedControls = controls.filter(c => c.status === 'not_started')
  if (notStartedControls.length > 10) {
    recommendations.push(`Begin implementation of ${notStartedControls.length} pending compliance controls`)
  }

  // Threat patterns
  if (threats.length > 10) {
    recommendations.push(`Review ${threats.length} recent security threats and strengthen defenses`)
  }

  // General recommendations
  if (recommendations.length === 0) {
    recommendations.push('Continue regular security scans and monitoring')
    recommendations.push('Review and update security policies quarterly')
    recommendations.push('Conduct security awareness training for all staff')
  }

  return recommendations
}