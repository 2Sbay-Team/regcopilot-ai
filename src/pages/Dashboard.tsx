import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, FileCheck, Leaf, Database, FileText, BookOpen, TrendingUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { HapticButton } from "@/components/ui/haptic-button"
import { InteractiveCard } from "@/components/ui/interactive-card"
import { useHaptic } from "@/hooks/useHaptic"
import owlLogo from "@/assets/owl-logo.png"

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
  const { vibrate } = useHaptic()

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
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center p-2">
            <img src={owlLogo} alt="CompliWise Owl" className="h-full w-full object-contain" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}</h1>
            <p className="text-muted-foreground">{profile?.organizations?.name || "Your wise compliance companion"}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <InteractiveCard 
          onClick={() => {
            vibrate("selection")
            navigate("/ai-act")
          }}
          className="border-border/50 hover:border-primary/30 group"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">AI Systems</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Shield className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              {stats.ai_systems}
              <TrendingUp className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Registered systems</p>
          </CardContent>
        </InteractiveCard>

        <InteractiveCard 
          onClick={() => {
            vibrate("selection")
            navigate("/gdpr")
          }}
          className="border-border/50 hover:border-accent/30 group"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">GDPR Checks</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileCheck className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              {stats.gdpr_assessments}
              <TrendingUp className="h-4 w-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Assessments run</p>
          </CardContent>
        </InteractiveCard>

        <InteractiveCard 
          onClick={() => {
            vibrate("selection")
            navigate("/esg")
          }}
          className="border-border/50 hover:border-accent/30 group"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ESG Reports</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Leaf className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              {stats.esg_reports}
              <TrendingUp className="h-4 w-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Generated reports</p>
          </CardContent>
        </InteractiveCard>

        <InteractiveCard 
          onClick={() => {
            vibrate("selection")
            navigate("/audit")
          }}
          className="border-border/50 hover:border-primary/30 group"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Audit Trail</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Database className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              {stats.audit_logs}
              <TrendingUp className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Log entries</p>
          </CardContent>
        </InteractiveCard>
      </div>

      {/* Copilot Modules */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <InteractiveCard 
          onClick={() => {
            vibrate("medium")
            navigate("/ai-act")
          }}
          className="group hover:shadow-xl hover:border-primary/50 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="relative">
            <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-xl">AI Act Auditor</CardTitle>
            <CardDescription className="text-sm">
              Classify AI systems & generate Annex IV compliance reports
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-0 group-hover:animate-bounce-subtle">EU AI Act</Badge>
            <HapticButton className="w-full group-hover:shadow-lg" onClick={(e) => {
              e.stopPropagation()
              vibrate("medium")
              navigate("/ai-act")
            }}>
              Start Assessment
            </HapticButton>
          </CardContent>
        </InteractiveCard>

        <InteractiveCard 
          onClick={() => {
            vibrate("medium")
            navigate("/gdpr")
          }}
          className="group hover:shadow-xl hover:border-accent/50 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="relative">
            <div className="h-14 w-14 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <FileCheck className="h-7 w-7 text-accent" />
            </div>
            <CardTitle className="text-xl">GDPR Checker</CardTitle>
            <CardDescription className="text-sm">
              Scan for personal data & identify compliance gaps
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <Badge variant="secondary" className="mb-4 bg-accent/10 text-accent border-0 group-hover:animate-bounce-subtle">GDPR</Badge>
            <HapticButton className="w-full group-hover:shadow-lg" onClick={(e) => {
              e.stopPropagation()
              vibrate("medium")
              navigate("/gdpr")
            }}>
              Run Check
            </HapticButton>
          </CardContent>
        </InteractiveCard>

        <InteractiveCard 
          onClick={() => {
            vibrate("medium")
            navigate("/esg")
          }}
          className="group hover:shadow-xl hover:border-accent/50 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="relative">
            <div className="h-14 w-14 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <Leaf className="h-7 w-7 text-accent" />
            </div>
            <CardTitle className="text-xl">ESG Reporter</CardTitle>
            <CardDescription className="text-sm">
              Generate CSRD/ESRS sustainability reports with AI
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <Badge variant="secondary" className="mb-4 bg-accent/10 text-accent border-0 group-hover:animate-bounce-subtle">ESG/CSRD</Badge>
            <HapticButton className="w-full group-hover:shadow-lg" onClick={(e) => {
              e.stopPropagation()
              vibrate("medium")
              navigate("/esg")
            }}>
              Create Report
            </HapticButton>
          </CardContent>
        </InteractiveCard>
      </div>

      {/* Quick Actions */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-xl">Quick Actions</CardTitle>
          <CardDescription>Common compliance tasks</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <HapticButton 
            variant="outline" 
            className="justify-start h-auto py-4 hover:bg-accent/50 hover:border-primary/30 transition-all group" 
            onClick={() => navigate("/analytics")}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <span className="font-medium">View Analytics</span>
            </div>
          </HapticButton>
          <HapticButton 
            variant="outline" 
            className="justify-start h-auto py-4 hover:bg-accent/50 hover:border-primary/30 transition-all group" 
            onClick={() => navigate("/reports")}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <span className="font-medium">Compliance Reports</span>
            </div>
          </HapticButton>
          <HapticButton 
            variant="outline" 
            className="justify-start h-auto py-4 hover:bg-accent/50 hover:border-primary/30 transition-all group" 
            onClick={() => navigate("/rag-search")}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <span className="font-medium">Search Regulations</span>
            </div>
          </HapticButton>
          <HapticButton 
            variant="outline" 
            className="justify-start h-auto py-4 hover:bg-accent/50 hover:border-primary/30 transition-all group" 
            onClick={() => navigate("/audit")}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <span className="font-medium">View Audit Trail</span>
            </div>
          </HapticButton>
          <HapticButton 
            variant="outline" 
            className="justify-start h-auto py-4 hover:bg-accent/50 hover:border-primary/30 transition-all group" 
            onClick={() => navigate("/models")}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <span className="font-medium">Model Registry</span>
            </div>
          </HapticButton>
          <HapticButton 
            variant="outline" 
            className="justify-start h-auto py-4 hover:bg-accent/50 hover:border-primary/30 transition-all group" 
            onClick={() => navigate("/admin")}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <span className="font-medium">Admin Panel</span>
            </div>
          </HapticButton>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard
