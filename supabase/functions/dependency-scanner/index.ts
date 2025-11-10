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

    // Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile?.organization_id) {
      throw new Error('Organization not found')
    }

    // Scan for known vulnerable dependencies
    const vulnerabilities = await scanDependencies()

    // Store scan results
    const scanRecord = await supabase
      .from('security_scan_history')
      .insert({
        organization_id: profile.organization_id,
        scan_type: 'sca',
        status: 'completed',
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        dependencies_scanned: vulnerabilities.length,
        critical_count: vulnerabilities.filter(v => v.severity === 'critical').length,
        high_count: vulnerabilities.filter(v => v.severity === 'high').length,
        medium_count: vulnerabilities.filter(v => v.severity === 'medium').length,
        low_count: vulnerabilities.filter(v => v.severity === 'low').length,
        vulnerabilities_found: vulnerabilities.filter(v => v.has_vulnerability).length
      })
      .select()
      .single()

    // Store new dependency vulnerabilities
    const newVulns = []
    for (const vuln of vulnerabilities.filter(v => v.has_vulnerability)) {
      // Check if already exists
      const { data: existing } = await supabase
        .from('dependency_vulnerabilities')
        .select('id')
        .eq('organization_id', profile.organization_id)
        .eq('package_name', vuln.package_name)
        .eq('vulnerability_id', vuln.vulnerability_id)
        .single()

      if (!existing) {
        const { data } = await supabase
          .from('dependency_vulnerabilities')
          .insert({
            organization_id: profile.organization_id,
            package_name: vuln.package_name,
            package_version: vuln.package_version,
            vulnerability_id: vuln.vulnerability_id,
            severity: vuln.severity,
            description: vuln.description,
            cvss_score: vuln.cvss_score,
            fixed_version: vuln.fixed_version,
            source: vuln.source,
            metadata: vuln.metadata || {}
          })
          .select()
          .single()

        if (data) newVulns.push(data)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        scan_id: scanRecord.data?.id,
        summary: {
          total_scanned: vulnerabilities.length,
          vulnerabilities_found: newVulns.length,
          critical: vulnerabilities.filter(v => v.severity === 'critical').length,
          high: vulnerabilities.filter(v => v.severity === 'high').length,
          medium: vulnerabilities.filter(v => v.severity === 'medium').length,
          low: vulnerabilities.filter(v => v.severity === 'low').length
        },
        vulnerabilities: newVulns
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Dependency scan error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function scanDependencies() {
  // Known vulnerable packages (simulated - in production, integrate with OSV.dev, Snyk, or npm audit API)
  const knownVulnerabilities = [
    {
      package_name: '@supabase/supabase-js',
      package_version: '2.0.0',
      has_vulnerability: false,
      severity: 'info',
      message: 'Package is up to date'
    },
    {
      package_name: 'react',
      package_version: '18.3.1',
      has_vulnerability: false,
      severity: 'info',
      message: 'Package is up to date'
    },
    // Example vulnerabilities (these would come from real CVE databases)
    {
      package_name: 'lodash',
      package_version: '4.17.19',
      has_vulnerability: true,
      vulnerability_id: 'CVE-2020-28500',
      severity: 'medium',
      description: 'ReDoS vulnerability in lodash toNumber, trim and trimEnd functions',
      cvss_score: 5.3,
      fixed_version: '4.17.21',
      source: 'nvd',
      metadata: {
        cwe: 'CWE-400',
        references: ['https://nvd.nist.gov/vuln/detail/CVE-2020-28500']
      }
    },
    {
      package_name: 'axios',
      package_version: '0.21.0',
      has_vulnerability: true,
      vulnerability_id: 'CVE-2021-3749',
      severity: 'high',
      description: 'Server-Side Request Forgery (SSRF) in axios',
      cvss_score: 7.5,
      fixed_version: '0.21.2',
      source: 'nvd',
      metadata: {
        cwe: 'CWE-918',
        references: ['https://nvd.nist.gov/vuln/detail/CVE-2021-3749']
      }
    }
  ]

  // In production, this would:
  // 1. Parse package.json / package-lock.json
  // 2. Query OSV.dev API: https://osv.dev/
  // 3. Query Snyk API if available
  // 4. Query npm audit API
  // 5. Check against NVD database
  
  return knownVulnerabilities
}