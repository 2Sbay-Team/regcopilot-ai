import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, FileCheck, Leaf, Database, LogOut, AlertTriangle, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const Dashboard = () => {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState({
    ai_systems: 0,
    gdpr_assessments: 0,
    esg_reports: 0,
    audit_logs: 0,
  })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      navigate("/login")
      return
    }

    setUser(user)

    // Get profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*, organizations(*)")
      .eq("id", user.id)
      .single()

    setProfile(profileData)

    if (profileData?.organization_id) {
      // Get stats
      const [aiSystems, gdprAssessments, esgReports, auditLogs] = await Promise.all([
        supabase.from("ai_systems").select("id", { count: "exact", head: true }).eq("organization_id", profileData.organization_id),
        supabase.from("gdpr_assessments").select("id", { count: "exact", head: true }).eq("organization_id", profileData.organization_id),
        supabase.from("esg_reports").select("id", { count: "exact", head: true }).eq("organization_id", profileData.organization_id),
        supabase.from("audit_logs").select("id", { count: "exact", head: true }).eq("organization_id", profileData.organization_id),
      ])

      setStats({
        ai_systems: aiSystems.count || 0,
        gdpr_assessments: gdprAssessments.count || 0,
        esg_reports: esgReports.count || 0,
        audit_logs: auditLogs.count || 0,
      })
    }

    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">RegTech Copilot</h1>
              <p className="text-sm text-muted-foreground">
                {profile?.organizations?.name || "Compliance Dashboard"}
              </p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {profile?.full_name || user?.email}</h2>
          <p className="text-muted-foreground">Your compliance management hub</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Systems</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.ai_systems}</div>
              <p className="text-xs text-muted-foreground">Registered systems</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">GDPR Checks</CardTitle>
              <FileCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.gdpr_assessments}</div>
              <p className="text-xs text-muted-foreground">Assessments run</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ESG Reports</CardTitle>
              <Leaf className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.esg_reports}</div>
              <p className="text-xs text-muted-foreground">Generated reports</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Audit Trail</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.audit_logs}</div>
              <p className="text-xs text-muted-foreground">Log entries</p>
            </CardContent>
          </Card>
        </div>

        {/* Copilot Modules */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/ai-act")}>
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-2" />
              <CardTitle>AI Act Auditor</CardTitle>
              <CardDescription>
                Classify AI systems & generate Annex IV compliance reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="default">EU AI Act</Badge>
              <Button className="w-full mt-4" onClick={() => navigate("/ai-act")}>
                Start Assessment
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/gdpr")}>
            <CardHeader>
              <FileCheck className="h-10 w-10 text-primary mb-2" />
              <CardTitle>GDPR Checker</CardTitle>
              <CardDescription>
                Scan for personal data & identify compliance gaps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="default">GDPR</Badge>
              <Button className="w-full mt-4" onClick={() => navigate("/gdpr")}>
                Run Check
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/esg")}>
            <CardHeader>
              <Leaf className="h-10 w-10 text-primary mb-2" />
              <CardTitle>ESG Reporter</CardTitle>
              <CardDescription>
                Generate CSRD/ESRS sustainability reports with AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="default">ESG/CSRD</Badge>
              <Button className="w-full mt-4" onClick={() => navigate("/esg")}>
                Create Report
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common compliance tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/audit")}>
              <Database className="h-4 w-4 mr-2" />
              View Audit Trail
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/models")}>
              <Shield className="h-4 w-4 mr-2" />
              Model Registry
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
