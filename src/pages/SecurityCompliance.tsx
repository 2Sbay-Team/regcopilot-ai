import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  TrendingUp,
  FileText,
  Scan,
  Activity,
  Lock,
  Eye,
  Package,
  Download,
  Database,
  History,
  Settings
} from "lucide-react"
import { toast } from "sonner"
import { formatComplianceReportForPDF } from "@/lib/pdfExport"

const SecurityCompliance = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [complianceScore, setComplianceScore] = useState(0)
  const [vulnerabilities, setVulnerabilities] = useState<any[]>([])
  const [securityEvents, setSecurityEvents] = useState<any[]>([])
  const [controls, setControls] = useState<any[]>([])
  const [depVulns, setDepVulns] = useState<any[]>([])
  const [scanHistory, setScanHistory] = useState<any[]>([])

  useEffect(() => {
    loadSecurityData()
  }, [])

  const loadSecurityData = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

      if (!profile?.organization_id) return

      // Load all security data
      const [vulnData, eventsData, controlsData, depVulnData, scanData] = await Promise.all([
        (supabase as any).from('security_vulnerabilities').select('*').eq('organization_id', profile.organization_id).order('created_at', { ascending: false }).limit(20),
        (supabase as any).from('security_events').select('*').eq('organization_id', profile.organization_id).order('created_at', { ascending: false }).limit(20),
        (supabase as any).from('compliance_controls').select('*').eq('organization_id', profile.organization_id),
        (supabase as any).from('dependency_vulnerabilities').select('*').eq('organization_id', profile.organization_id).order('detected_at', { ascending: false }),
        (supabase as any).from('security_scan_history').select('*').eq('organization_id', profile.organization_id).order('started_at', { ascending: false }).limit(10)
      ])

      setVulnerabilities(vulnData.data || [])
      setSecurityEvents(eventsData.data || [])
      setControls(controlsData.data || [])
      setDepVulns(depVulnData.data || [])
      setScanHistory(scanData.data || [])

      // Calculate compliance score
      if (controlsData.data && controlsData.data.length > 0) {
        const implemented = controlsData.data.filter((c: any) => 
          c.status === 'implemented' || c.status === 'verified'
        ).length
        const score = Math.round((implemented / controlsData.data.length) * 100)
        setComplianceScore(score)
      }

    } catch (error) {
      console.error('Error loading security data:', error)
      toast.error('Failed to load security data')
    } finally {
      setLoading(false)
    }
  }

  const seedComplianceControls = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session')

      const response = await supabase.functions.invoke('seed-compliance-controls', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      })

      if (response.error) throw response.error

      toast.success(`Compliance controls seeded: ${response.data.summary.total} total`)
      await loadSecurityData()

    } catch (error: any) {
      console.error('Seed error:', error)
      toast.error(error.message || 'Failed to seed controls')
    } finally {
      setLoading(false)
    }
  }

  const runVulnerabilityScan = async () => {
    setScanning(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session')

      const response = await supabase.functions.invoke('vulnerability-scanner', {
        body: { scan_type: 'full' },
        headers: { Authorization: `Bearer ${session.access_token}` }
      })

      if (response.error) throw response.error

      toast.success(`Scan complete: ${response.data.summary.total_vulnerabilities} vulnerabilities found`)
      await loadSecurityData()

    } catch (error: any) {
      console.error('Scan error:', error)
      toast.error(error.message || 'Vulnerability scan failed')
    } finally {
      setScanning(false)
    }
  }

  const runDependencyScan = async () => {
    setScanning(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session')

      const response = await supabase.functions.invoke('dependency-scanner', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      })

      if (response.error) throw response.error

      toast.success(`Dependency scan complete: ${response.data.summary.vulnerabilities_found} issues found`)
      await loadSecurityData()

    } catch (error: any) {
      console.error('Dependency scan error:', error)
      toast.error(error.message || 'Dependency scan failed')
    } finally {
      setScanning(false)
    }
  }

  const generateSecurityReport = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session')

      const response = await supabase.functions.invoke('generate-security-report', {
        body: { report_type: 'full' },
        headers: { Authorization: `Bearer ${session.access_token}` }
      })

      if (response.error) throw response.error

      // Format and download as PDF
      const pdfData = formatComplianceReportForPDF(response.data.report)
      toast.success('Security report generated successfully')

    } catch (error: any) {
      console.error('Report generation error:', error)
      toast.error(error.message || 'Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'outline'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <XCircle className="h-4 w-4" />
      case 'medium':
        return <AlertTriangle className="h-4 w-4" />
      case 'low':
      case 'info':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const criticalVulns = vulnerabilities.filter(v => v.severity === 'critical' && v.status !== 'resolved').length
  const highVulns = vulnerabilities.filter(v => v.severity === 'high' && v.status !== 'resolved').length
  const recentThreats = securityEvents.filter(e => e.is_threat).length
  const openDepVulns = depVulns.filter(d => d.status === 'open').length

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security & Compliance Center</h1>
          <p className="text-muted-foreground">
            Enterprise-grade security monitoring and compliance tracking
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/cicd-setup')} variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            CI/CD Setup
          </Button>
          {controls.length === 0 && (
            <Button onClick={seedComplianceControls} disabled={loading} variant="outline">
              <Database className="h-4 w-4 mr-2" />
              Seed Controls
            </Button>
          )}
          <Button onClick={runDependencyScan} disabled={scanning} variant="outline">
            <Package className="h-4 w-4 mr-2" />
            Scan Dependencies
          </Button>
          <Button onClick={runVulnerabilityScan} disabled={scanning}>
            <Scan className="h-4 w-4 mr-2" />
            {scanning ? 'Scanning...' : 'Run Security Scan'}
          </Button>
          <Button onClick={generateSecurityReport} disabled={loading} variant="secondary">
            <Download className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceScore}%</div>
            <Progress value={complianceScore} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {controls.filter(c => c.status === 'implemented').length} of {controls.length} controls
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{criticalVulns}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dependency Vulnerabilities</CardTitle>
            <Package className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openDepVulns}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Libraries need updates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Threats Detected</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentThreats}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="vulnerabilities" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
          <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
          <TabsTrigger value="threats">Threat Detection</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="history">Scan History</TabsTrigger>
        </TabsList>

        <TabsContent value="vulnerabilities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Vulnerabilities</CardTitle>
              <CardDescription>
                Active vulnerabilities detected in your system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {vulnerabilities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No vulnerabilities detected. Run a scan to check your system.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {vulnerabilities.map((vuln) => (
                    <div key={vuln.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={getSeverityColor(vuln.severity)}>
                              {getSeverityIcon(vuln.severity)}
                              <span className="ml-1">{vuln.severity.toUpperCase()}</span>
                            </Badge>
                            <Badge variant="outline">{vuln.vulnerability_type}</Badge>
                            {vuln.cvss_score && (
                              <span className="text-xs text-muted-foreground">
                                CVSS: {vuln.cvss_score}
                              </span>
                            )}
                          </div>
                          <h4 className="font-semibold">{vuln.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {vuln.description}
                          </p>
                          {vuln.affected_component && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Affected: {vuln.affected_component}
                            </p>
                          )}
                        </div>
                        <Badge variant={vuln.status === 'resolved' ? 'secondary' : 'default'}>
                          {vuln.status}
                        </Badge>
                      </div>
                      {vuln.remediation_steps && (
                        <div className="mt-3 p-3 bg-muted rounded text-sm">
                          <p className="font-medium mb-1">Remediation Steps:</p>
                          <p className="whitespace-pre-wrap text-muted-foreground">
                            {vuln.remediation_steps}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dependencies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dependency Vulnerabilities</CardTitle>
              <CardDescription>
                Known security issues in third-party libraries and packages
              </CardDescription>
            </CardHeader>
            <CardContent>
              {depVulns.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No dependency vulnerabilities detected. Run a dependency scan.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {depVulns.slice(0, 20).map((dep) => (
                    <div key={dep.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={getSeverityColor(dep.severity)}>
                              {dep.severity.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">{dep.source}</Badge>
                            {dep.cvss_score && (
                              <span className="text-xs text-muted-foreground">
                                CVSS: {dep.cvss_score}
                              </span>
                            )}
                          </div>
                          <h4 className="font-semibold">{dep.package_name}@{dep.package_version}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {dep.vulnerability_id}: {dep.description}
                          </p>
                          {dep.fixed_version && (
                            <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                              Fix available: Update to {dep.fixed_version}
                            </p>
                          )}
                        </div>
                        <Badge variant={dep.status === 'patched' ? 'secondary' : 'default'}>
                          {dep.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="threats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Threat Detection</CardTitle>
              <CardDescription>
                Real-time security events and AI-powered threat analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {securityEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No security events recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {securityEvents.map((event) => (
                    <div key={event.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={getSeverityColor(event.severity)}>
                            {event.severity.toUpperCase()}
                          </Badge>
                          {event.is_threat && (
                            <Badge variant="destructive">THREAT</Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(event.created_at).toLocaleString()}
                        </span>
                      </div>
                      <h4 className="font-semibold">{event.event_type.replace(/_/g, ' ').toUpperCase()}</h4>
                      {event.source_ip && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Source: {event.source_ip}
                        </p>
                      )}
                      {event.risk_score && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground mb-1">
                            Risk Score: {event.risk_score}/10
                          </p>
                          <Progress value={event.risk_score * 10} className="h-2" />
                        </div>
                      )}
                      {event.ai_analysis_result && (
                        <div className="mt-3 p-3 bg-muted rounded text-sm">
                          <p className="font-medium mb-1">AI Analysis:</p>
                          <p className="text-muted-foreground">{event.ai_analysis_result.summary}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Controls</CardTitle>
              <CardDescription>
                Track readiness for SOC 2, ISO 27001, and GDPR
              </CardDescription>
            </CardHeader>
            <CardContent>
              {controls.length === 0 ? (
                <div className="text-center py-8">
                  <Lock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-4">No compliance controls found</p>
                  <Button onClick={seedComplianceControls} disabled={loading}>
                    <Database className="h-4 w-4 mr-2" />
                    Seed Compliance Controls
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {['SOC2', 'ISO27001', 'GDPR'].map((framework) => {
                    const frameworkControls = controls.filter(c => 
                      c.required_for?.includes(framework)
                    )
                    const implemented = frameworkControls.filter(c => 
                      c.status === 'implemented' || c.status === 'verified'
                    ).length
                    const progress = frameworkControls.length > 0 
                      ? Math.round((implemented / frameworkControls.length) * 100)
                      : 0

                    return (
                      <div key={framework}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{framework}</h4>
                          <span className="text-sm text-muted-foreground">
                            {implemented} / {frameworkControls.length} controls
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100">Need certification help?</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Our compliance team can help you prepare for SOC 2 and ISO 27001 audits.
                    </p>
                    <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate('/contact')}>
                      Contact Compliance Team
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scan History</CardTitle>
              <CardDescription>
                Historical record of all security scans performed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {scanHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No scan history available yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {scanHistory.map((scan) => (
                    <div key={scan.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <Badge variant="outline">{scan.scan_type.toUpperCase()}</Badge>
                          <span className="ml-2 text-sm font-medium">{scan.status}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(scan.started_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-5 gap-2 mt-2 text-sm">
                        <div className="text-center">
                          <div className="font-bold text-destructive">{scan.critical_count || 0}</div>
                          <div className="text-xs text-muted-foreground">Critical</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-orange-500">{scan.high_count || 0}</div>
                          <div className="text-xs text-muted-foreground">High</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold">{scan.medium_count || 0}</div>
                          <div className="text-xs text-muted-foreground">Medium</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold">{scan.low_count || 0}</div>
                          <div className="text-xs text-muted-foreground">Low</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold">{scan.vulnerabilities_found || 0}</div>
                          <div className="text-xs text-muted-foreground">Total</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SecurityCompliance