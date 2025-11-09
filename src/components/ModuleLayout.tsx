import { ReactNode, useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Home, ChevronRight, HelpCircle, Brain, ShieldCheck, Sprout, FileText, TrendingUp, Zap, Network, Workflow } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { NotificationCenter } from "@/components/NotificationCenter"
import { Footer } from "@/components/Footer"
import { RealTimeStatusIndicator } from "@/components/RealTimeStatusIndicator"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"

interface QuickAction {
  label: string
  icon: ReactNode
  onClick: () => void
  variant?: "default" | "outline"
  gradient?: boolean
}

interface ModuleLayoutProps {
  children: ReactNode
  title: string | ReactNode
  description?: string | ReactNode
  quickActions?: QuickAction[]
  showStatus?: boolean
}

export const ModuleLayout = ({ 
  children, 
  title, 
  description,
  quickActions = [],
  showStatus = true 
}: ModuleLayoutProps) => {
  const { user } = useAuth()
  const { language } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    if (user) {
      loadUserProfile()
    }
  }, [user])

  const loadUserProfile = async () => {
    if (!user) return

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*, organizations(*)")
      .eq("id", user.id)
      .single()

    setProfile(profileData)
  }

  const getUserInitials = () => {
    if (profile?.full_name) {
      const names = profile.full_name.split(' ')
      return names.map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return user?.email?.[0]?.toUpperCase() || 'U'
  }

  const getPageIcon = () => {
    const path = location.pathname
    const iconMap: Record<string, JSX.Element> = {
      '/ai-act': <Brain className="h-4 w-4" />,
      '/gdpr': <ShieldCheck className="h-4 w-4" />,
      '/esg': <Sprout className="h-4 w-4" />,
      '/reports': <FileText className="h-4 w-4" />,
      '/compliance-score': <TrendingUp className="h-4 w-4" />,
      '/regsense': <Brain className="h-4 w-4" />,
      '/ai-gateway': <Zap className="h-4 w-4" />,
      '/connectors': <Network className="h-4 w-4" />,
      '/automation': <Workflow className="h-4 w-4" />,
    }
    return iconMap[path] || null
  }

  const getPageName = () => {
    const path = location.pathname
    const segments = path.split('/').filter(Boolean)
    if (segments.length === 0) return 'Dashboard'
    
    // Convert path to readable name
    const pageName = segments[segments.length - 1]
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    
    return pageName
  }

  return (
    <div className="min-h-screen flex flex-col" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Enhanced Top Header - Sticky */}
      <div className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground hover:text-foreground"
                onClick={() => navigate("/")}
              >
                <Home className="h-4 w-4" />
                Startseite
              </Button>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <div className="flex items-center gap-2 font-medium">
                {getPageIcon()}
                <span>{getPageName()}</span>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/help")}
                className="hover:bg-muted"
              >
                <HelpCircle className="h-5 w-5" />
              </Button>
              <NotificationCenter />
              <div className="flex items-center gap-3 pl-3 border-l border-border">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium leading-none">{profile?.full_name || "User"}</p>
                  <p className="text-xs text-muted-foreground">{profile?.organizations?.name || "Organization"}</p>
                </div>
                <Avatar className="h-9 w-9 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1">
        <div className="container mx-auto px-6 py-6 space-y-6">
          {/* Page Title & Status */}
          <div className="flex items-center justify-between p-6 rounded-2xl cockpit-panel">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-primary via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                {title}
              </h1>
              {description && (
                <p className="text-sm text-muted-foreground font-medium">{description}</p>
              )}
            </div>
            {showStatus && <RealTimeStatusIndicator />}
          </div>

          {/* Quick Action Bar */}
          {quickActions.length > 0 && (
            <div className="flex items-center gap-3 flex-wrap">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  onClick={action.onClick}
                  variant={action.variant || "outline"}
                  className={
                    action.gradient
                      ? "gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300"
                      : "gap-2 border-2 hover:bg-muted/50 transition-all duration-300"
                  }
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
            </div>
          )}

          {/* Page Content */}
          {children}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
