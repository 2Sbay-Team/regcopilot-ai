import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, FileCheck, Leaf, Database, LogOut, FileText, BookOpen } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const Dashboard = () => {
  const { user } = useAuth()
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
    if (user) {
      loadUserData()
      checkSystemSetup()
    }
  }, [user])

  const checkSystemSetup = async () => {
    const { count } = await supabase
      .from("document_chunks")
      .select("*", { count: "exact", head: true })

    if (count === 0) {
      toast({
        title: "System Setup Required",
        description: "Initialize the regulatory knowledge base to use AI copilots",
      })
      setTimeout(() => navigate("/setup"), 2000)
    }
  }

  const loadUserData = async () => {
    if (!user) return

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
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}</h1>
            <p className="text-muted-foreground">{profile?.organizations?.name || "Your compliance management hub"}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card className="border-border/50 hover:border-primary/30 transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">AI Systems</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.ai_systems}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered systems</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:border-primary/30 transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">GDPR Checks</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <FileCheck className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.gdpr_assessments}</div>
            <p className="text-xs text-muted-foreground mt-1">Assessments run</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:border-primary/30 transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ESG Reports</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <Leaf className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.esg_reports}</div>
            <p className="text-xs text-muted-foreground mt-1">Generated reports</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:border-primary/30 transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Audit Trail</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Database className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.audit_logs}</div>
            <p className="text-xs text-muted-foreground mt-1">Log entries</p>
          </CardContent>
        </Card>
      </div>

      {/* Copilot Modules */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card className="group hover:shadow-xl transition-all duration-300 hover:border-primary/50 cursor-pointer overflow-hidden" onClick={() => navigate("/ai-act")}>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="relative">
            <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-xl">AI Act Auditor</CardTitle>
            <CardDescription className="text-sm">
              Classify AI systems & generate Annex IV compliance reports
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-0">EU AI Act</Badge>
            <Button className="w-full" onClick={() => navigate("/ai-act")}>
              Start Assessment
            </Button>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 hover:border-accent/50 cursor-pointer overflow-hidden" onClick={() => navigate("/gdpr")}>
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="relative">
            <div className="h-14 w-14 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileCheck className="h-7 w-7 text-accent" />
            </div>
            <CardTitle className="text-xl">GDPR Checker</CardTitle>
            <CardDescription className="text-sm">
              Scan for personal data & identify compliance gaps
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <Badge variant="secondary" className="mb-4 bg-accent/10 text-accent border-0">GDPR</Badge>
            <Button className="w-full" onClick={() => navigate("/gdpr")}>
              Run Check
            </Button>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 hover:border-accent/50 cursor-pointer overflow-hidden" onClick={() => navigate("/esg")}>
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="relative">
            <div className="h-14 w-14 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Leaf className="h-7 w-7 text-accent" />
            </div>
            <CardTitle className="text-xl">ESG Reporter</CardTitle>
            <CardDescription className="text-sm">
              Generate CSRD/ESRS sustainability reports with AI
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <Badge variant="secondary" className="mb-4 bg-accent/10 text-accent border-0">ESG/CSRD</Badge>
            <Button className="w-full" onClick={() => navigate("/esg")}>
              Create Report
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-xl">Quick Actions</CardTitle>
          <CardDescription>Common compliance tasks</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <Button variant="outline" className="justify-start h-auto py-4 hover:bg-accent/50 hover:border-primary/30 transition-all" onClick={() => navigate("/analytics")}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <span className="font-medium">View Analytics</span>
            </div>
          </Button>
          <Button variant="outline" className="justify-start h-auto py-4 hover:bg-accent/50 hover:border-primary/30 transition-all" onClick={() => navigate("/reports")}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <span className="font-medium">Compliance Reports</span>
            </div>
          </Button>
          <Button variant="outline" className="justify-start h-auto py-4 hover:bg-accent/50 hover:border-primary/30 transition-all" onClick={() => navigate("/rag-search")}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <span className="font-medium">Search Regulations</span>
            </div>
          </Button>
          <Button variant="outline" className="justify-start h-auto py-4 hover:bg-accent/50 hover:border-primary/30 transition-all" onClick={() => navigate("/audit")}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <span className="font-medium">View Audit Trail</span>
            </div>
          </Button>
          <Button variant="outline" className="justify-start h-auto py-4 hover:bg-accent/50 hover:border-primary/30 transition-all" onClick={() => navigate("/models")}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <span className="font-medium">Model Registry</span>
            </div>
          </Button>
          <Button variant="outline" className="justify-start h-auto py-4 hover:bg-accent/50 hover:border-primary/30 transition-all" onClick={() => navigate("/admin")}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <span className="font-medium">Admin Panel</span>
            </div>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard
