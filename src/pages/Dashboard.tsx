import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Shield, FileCheck, Leaf, Database, FileText, BookOpen, TrendingUp, Activity } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { HapticButton } from "@/components/ui/haptic-button"
import { InteractiveCard } from "@/components/ui/interactive-card"
import { useHaptic } from "@/hooks/useHaptic"
import { RealTimeStatusIndicator } from "@/components/RealTimeStatusIndicator"
import { QuotaWarningBanner } from "@/components/QuotaWarningBanner"
import { t } from "@/lib/i18n"

const Dashboard = () => {
  const { user } = useAuth()
  const { language } = useLanguage()
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState({
    ai_systems: 0,
    gdpr_assessments: 0,
    esg_reports: 0,
    audit_logs: 0,
  })
  const [quotaInfo, setQuotaInfo] = useState<any>(null)
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

      // Load quota information
      const { data: org } = await supabase
        .from('organizations')
        .select('llm_token_quota, tokens_used_this_month, billing_model')
        .eq('id', profileData.organization_id)
        .single()

      if (org) {
        const usagePercentage = (org.tokens_used_this_month / org.llm_token_quota) * 100
        setQuotaInfo({
          quota: org.llm_token_quota,
          used: org.tokens_used_this_month,
          percentage: usagePercentage,
          billing_model: org.billing_model
        })
      }
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

      {/* Quota Warning Banner */}
      <QuotaWarningBanner />

      {/* Stats Dashboard */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Token Quota Card */}
        {quotaInfo && quotaInfo.billing_model !== 'byok' && (
          <InteractiveCard 
            onClick={() => {
              vibrate("selection")
              navigate("/usage")
            }}
            className="cockpit-panel group cursor-pointer hover:scale-[1.02] transition-all duration-300"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
              <div className="flex flex-col gap-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground">Token Usage</CardTitle>
                <div className="text-4xl font-bold text-foreground">{quotaInfo.percentage.toFixed(0)}%</div>
              </div>
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Activity className="h-7 w-7 text-white" />
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <Progress value={quotaInfo.percentage} className="h-2" />
              <p className="text-xs text-muted-foreground font-medium">
                {quotaInfo.used.toLocaleString()} / {quotaInfo.quota.toLocaleString()} tokens
              </p>
            </CardContent>
          </InteractiveCard>
        )}

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
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Shield className="h-7 w-7 text-white" />
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
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <FileCheck className="h-7 w-7 text-white" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground font-medium">{t('dashboard.assessments', language)}</p>
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
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
              <Leaf className="h-7 w-7 text-white" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground font-medium">{t('dashboard.reports', language)}</p>
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
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Database className="h-7 w-7 text-white" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground font-medium">{t('dashboard.entries', language)}</p>
          </CardContent>
        </InteractiveCard>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <InteractiveCard onClick={() => {
          vibrate("selection")
          navigate("/ai-act")
        }} className="cockpit-panel group cursor-pointer hover:scale-[1.02] transition-all duration-300">
          <CardHeader>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 mb-3">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <CardTitle>{t('dashboard.aiActCopilot', language)}</CardTitle>
            <CardDescription>{t('dashboard.assessAISystems', language)}</CardDescription>
          </CardHeader>
        </InteractiveCard>

        <InteractiveCard onClick={() => {
          vibrate("selection")
          navigate("/gdpr")
        }} className="cockpit-panel group cursor-pointer hover:scale-[1.02] transition-all duration-300">
          <CardHeader>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-3">
              <FileCheck className="h-6 w-6 text-white" />
            </div>
            <CardTitle>{t('dashboard.gdprCopilot', language)}</CardTitle>
            <CardDescription>{t('dashboard.scanPrivacy', language)}</CardDescription>
          </CardHeader>
        </InteractiveCard>

        <InteractiveCard onClick={() => {
          vibrate("selection")
          navigate("/esg")
        }} className="cockpit-panel group cursor-pointer hover:scale-[1.02] transition-all duration-300">
          <CardHeader>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/20 mb-3">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <CardTitle>{t('dashboard.esgCopilot', language)}</CardTitle>
            <CardDescription>{t('dashboard.generateReports', language)}</CardDescription>
          </CardHeader>
        </InteractiveCard>
      </div>
    </div>
  )
}

export default Dashboard
