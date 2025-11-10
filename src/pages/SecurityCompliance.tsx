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
  Eye
} from "lucide-react"
import { toast } from "sonner"

const SecurityCompliance = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [complianceScore, setComplianceScore] = useState(0)
  const [vulnerabilities, setVulnerabilities] = useState<any[]>([])
  const [securityEvents, setSecurityEvents] = useState<any[]>([])
  const [controls, setControls] = useState<any[]>([])

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

      // Load vulnerabilities
      const { data: vulnData } = await (supabase as any)
        .from('security_vulnerabilities')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false })
        .limit(10)

      setVulnerabilities(vulnData || [])

      // Load security events
      const { data: eventsData } = await (supabase as any)
        .from('security_events')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false })
        .limit(20)

      setSecurityEvents(eventsData || [])

      // Load compliance controls
      const { data: controlsData } = await (supabase as any)
        .from('compliance_controls')
        .select('*')
        .eq('organization_id', profile.organization_id)

      setControls(controlsData || [])

      // Calculate compliance score
      if (controlsData && controlsData.length > 0) {
        const implemented = controlsData.filter(c => 
          c.status === 'implemented' || c.status === 'verified'
        ).length
        const score = Math.round((implemented / controlsData.length) * 100)
        setComplianceScore(score)
      }

    } catch (error) {
      console.error('Error loading security data:', error)
      toast.error('Failed to load security data')
    } finally {
      setLoading(false)
    }
  }

  const runVulnerabilityScan = async () => {
    setScanning(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session')

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/vulnerability-scanner`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ scan_type: 'full' })
        }
      )

      if (!response.ok) throw new Error('Scan failed')

      const result = await response.json()
      toast.success(`Scan complete: ${result.summary.total_vulnerabilities} vulnerabilities found`)
      await loadSecurityData()

    } catch (error) {
      console.error('Scan error:', error)
      toast.error('Vulnerability scan failed')
    } finally {
      setScanning(false)
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

  const criticalVulns = vulnerabilities.filter(v => v.severity === 'critical' && v.status === 'open').length
  const highVulns = vulnerabilities.filter(v => v.severity === 'high' && v.status === 'open').length
  const recentThreats = securityEvents.filter(e => e.is_threat).length

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
        <Button onClick={runVulnerabilityScan} disabled={scanning}>
          <Scan className="h-4 w-4 mr-2" />
          {scanning ? 'Scanning...' : 'Run Security Scan'}
        </Button>
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
            <CardTitle className="text-sm font-medium">High Vulnerabilities</CardTitle>
            <XCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highVulns}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Prioritize remediation
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
          <TabsTrigger value="threats">Threat Detection</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
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

        <TabsContent value="policies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Policies</CardTitle>
              <CardDescription>
                Manage your security and compliance documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Lock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="mb-4">Policy management system coming soon</p>
                <Button onClick={() => navigate('/admin/upload-policies')}>
                  Upload Policies
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SecurityCompliance
