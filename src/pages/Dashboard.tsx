import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, FileCheck, Leaf, Database, FileText, BookOpen, TrendingUp, Activity } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { HapticButton } from "@/components/ui/haptic-button"
import { InteractiveCard } from "@/components/ui/interactive-card"
import { useHaptic } from "@/hooks/useHaptic"
import { RealTimeStatusIndicator } from "@/components/RealTimeStatusIndicator"
import { t } from "@/lib/i18n"

const Dashboard = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [language, setLanguage] = useState('en')
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
    if (profileData?.language) setLanguage(profileData.language)

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
          <p className="text-muted-foreground">{t('dashboard.loading', language)}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Command Header */}
      <div className="flex items-center justify-between p-6 rounded-2xl cockpit-panel">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
            {t('dashboard.title', language)}
          </h1>
          <p className="text-sm text-muted-foreground font-medium">{profile?.organizations?.name || "Welcome back"}</p>
        </div>
        <RealTimeStatusIndicator />
      </div>

      {/* Stats Dashboard */}
      <div className="grid gap-4 md:grid-cols-4">
        <InteractiveCard 
          onClick={() => {
            vibrate("selection")
            navigate("/ai-act")
          }}
          className="cockpit-panel group cursor-pointer hover:scale-[1.02] transition-all duration-300"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
            <div className="flex flex-col gap-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">{t('dashboard.aiSystems', language)}</CardTitle>
              <div className="text-4xl font-bold text-foreground">{stats.ai_systems}</div>
            </div>
            <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="h-7 w-7 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground font-medium">{t('dashboard.activeAssessments', language)}</p>
          </CardContent>
        </InteractiveCard>

        <InteractiveCard 
          onClick={() => {
            vibrate("selection")
            navigate("/gdpr")
          }}
          className="cockpit-panel group cursor-pointer hover:scale-[1.02] transition-all duration-300"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
            <div className="flex flex-col gap-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">{t('dashboard.gdprChecks', language)}</CardTitle>
              <div className="text-4xl font-bold text-foreground">{stats.gdpr_assessments}</div>
            </div>
            <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileCheck className="h-7 w-7 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground font-medium">{t('dashboard.complianceVerified', language)}</p>
          </CardContent>
        </InteractiveCard>

        <InteractiveCard 
          onClick={() => {
            vibrate("selection")
            navigate("/esg")
          }}
          className="cockpit-panel group cursor-pointer hover:scale-[1.02] transition-all duration-300"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
            <div className="flex flex-col gap-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">{t('dashboard.esgReports', language)}</CardTitle>
              <div className="text-4xl font-bold text-foreground">{stats.esg_reports}</div>
            </div>
            <div className="h-14 w-14 rounded-xl bg-accent/10 flex items-center justify-center">
              <Leaf className="h-7 w-7 text-accent" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground font-medium">{t('dashboard.reportsGenerated', language)}</p>
          </CardContent>
        </InteractiveCard>

        <InteractiveCard 
          onClick={() => {
            vibrate("selection")
            navigate("/audit")
          }}
          className="cockpit-panel group cursor-pointer hover:scale-[1.02] transition-all duration-300"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
            <div className="flex flex-col gap-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">{t('dashboard.auditLogs', language)}</CardTitle>
              <div className="text-4xl font-bold text-foreground">{stats.audit_logs}</div>
            </div>
            <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <Database className="h-7 w-7 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground font-medium">{t('dashboard.eventsTracked', language)}</p>
          </CardContent>
        </InteractiveCard>
      </div>

      {/* Main Copilot Modules */}
      <div className="grid gap-6 md:grid-cols-3">
        <InteractiveCard 
          onClick={() => {
            vibrate("medium")
            navigate("/ai-act")
          }}
          className="cockpit-panel group cursor-pointer hover:scale-[1.02] transition-all duration-300"
        >
          <CardHeader>
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold mb-2">{t('dashboard.aiActAuditor', language)}</CardTitle>
            <CardDescription className="text-base">
              {t('dashboard.aiActDesc', language)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HapticButton 
              size="lg" 
              className="w-full" 
              onClick={(e) => {
                e.stopPropagation()
                vibrate("medium")
                navigate("/ai-act")
              }}
            >
              {t('dashboard.startAssessment', language)}
            </HapticButton>
          </CardContent>
        </InteractiveCard>

        <InteractiveCard 
          onClick={() => {
            vibrate("medium")
            navigate("/gdpr")
          }}
          className="cockpit-panel group cursor-pointer hover:scale-[1.02] transition-all duration-300"
        >
          <CardHeader>
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileCheck className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold mb-2">{t('dashboard.gdprChecker', language)}</CardTitle>
            <CardDescription className="text-base">
              {t('dashboard.gdprDesc', language)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HapticButton 
              size="lg" 
              className="w-full" 
              onClick={(e) => {
                e.stopPropagation()
                vibrate("medium")
                navigate("/gdpr")
              }}
            >
              {t('dashboard.runCheck', language)}
            </HapticButton>
          </CardContent>
        </InteractiveCard>

        <InteractiveCard 
          onClick={() => {
            vibrate("medium")
            navigate("/esg")
          }}
          className="cockpit-panel group cursor-pointer hover:scale-[1.02] transition-all duration-300"
        >
          <CardHeader>
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Leaf className="h-8 w-8 text-accent" />
            </div>
            <CardTitle className="text-2xl font-bold mb-2">{t('dashboard.esgReporter', language)}</CardTitle>
            <CardDescription className="text-base">
              {t('dashboard.esgDesc', language)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HapticButton 
              size="lg" 
              className="w-full" 
              onClick={(e) => {
                e.stopPropagation()
                vibrate("medium")
                navigate("/esg")
              }}
            >
              {t('dashboard.createReport', language)}
            </HapticButton>
          </CardContent>
        </InteractiveCard>
      </div>

      {/* Quick Actions */}
      <Card className="cockpit-panel">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{t('dashboard.quickActions', language)}</CardTitle>
          <CardDescription className="text-base">{t('dashboard.quickActionsDesc', language)}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <HapticButton 
            variant="outline" 
            className="justify-start h-auto py-5 hover:scale-[1.02] hover:border-primary/40 transition-all group" 
            onClick={() => navigate("/analytics")}
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <span className="font-semibold text-base">{t('dashboard.viewAnalytics', language)}</span>
            </div>
          </HapticButton>
          <HapticButton 
            variant="outline" 
            className="justify-start h-auto py-5 hover:scale-[1.02] hover:border-primary/40 transition-all group" 
            onClick={() => navigate("/reports")}
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <span className="font-semibold text-base">{t('dashboard.complianceReports', language)}</span>
            </div>
          </HapticButton>
          <HapticButton 
            variant="outline" 
            className="justify-start h-auto py-5 hover:scale-[1.02] hover:border-primary/40 transition-all group" 
            onClick={() => navigate("/rag-search")}
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <span className="font-semibold text-base">{t('dashboard.searchRegulations', language)}</span>
            </div>
          </HapticButton>
          <HapticButton 
            variant="outline" 
            className="justify-start h-auto py-5 hover:scale-[1.02] hover:border-primary/40 transition-all group" 
            onClick={() => navigate("/audit")}
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <span className="font-semibold text-base">{t('dashboard.viewAuditTrail', language)}</span>
            </div>
          </HapticButton>
          <HapticButton 
            variant="outline" 
            className="justify-start h-auto py-5 hover:scale-[1.02] hover:border-primary/40 transition-all group" 
            onClick={() => navigate("/models")}
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <span className="font-semibold text-base">{t('dashboard.modelRegistry', language)}</span>
            </div>
          </HapticButton>
          <HapticButton 
            variant="outline" 
            className="justify-start h-auto py-5 hover:scale-[1.02] hover:border-primary/40 transition-all group" 
            onClick={() => navigate("/admin")}
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <span className="font-semibold text-base">{t('dashboard.adminPanel', language)}</span>
            </div>
          </HapticButton>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard
