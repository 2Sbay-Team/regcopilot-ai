import { 
  Shield, 
  FileCheck, 
  Leaf, 
  Database, 
  BookOpen, 
  FileText,
  BarChart3,
  Settings,
  LayoutDashboard,
  Eye,
  GitBranch,
  Mail,
  ShieldCheck,
  Zap,
  Bot,
  MessageSquare,
  Activity,
  User,
  TrendingUp,
  Store,
  Play
} from "lucide-react"
import { NavLink } from "@/components/NavLink"
import { RoboticShieldLogo } from "@/components/RoboticShieldLogo"
import { t } from "@/lib/i18n"
import { useLanguage } from "@/contexts/LanguageContext"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  const { state } = useSidebar()
  const { language } = useLanguage()
  const isCollapsed = state === "collapsed"

  const mainItems = [
    { 
      titleKey: "nav.dashboard", 
      url: "/dashboard", 
      icon: LayoutDashboard,
      iconBgClass: "bg-gradient-to-br from-emerald-500 to-green-600",
      iconTextClass: "text-white",
    },
    { 
      titleKey: "nav.aiAct", 
      url: "/ai-act", 
      icon: Shield,
      iconBgClass: "bg-gradient-to-br from-blue-500 to-indigo-600",
      iconTextClass: "text-white",
    },
    { 
      titleKey: "nav.gdpr", 
      url: "/gdpr", 
      icon: FileCheck,
      iconBgClass: "bg-gradient-to-br from-purple-500 to-pink-600",
      iconTextClass: "text-white",
    },
    { 
      titleKey: "nav.esg", 
      url: "/esg", 
      icon: Leaf,
      iconBgClass: "bg-gradient-to-br from-green-500 to-lime-600",
      iconTextClass: "text-white",
    },
  ]

  const toolsItems = [
    { 
      titleKey: "nav.agentDashboard", 
      url: "/agents", 
      icon: Play,
      iconBgClass: "bg-gradient-to-br from-emerald-500 to-green-600",
      iconTextClass: "text-white",
    },
    { 
      titleKey: "nav.aiGateway", 
      url: "/ai-gateway", 
      icon: Zap,
      iconBgClass: "bg-gradient-to-br from-orange-500 to-amber-600",
      iconTextClass: "text-white",
    },
    { 
      titleKey: "nav.modelManagement", 
      url: "/model-management", 
      icon: Bot,
      iconBgClass: "bg-gradient-to-br from-indigo-500 to-purple-600",
      iconTextClass: "text-white",
    },
    { 
      titleKey: "nav.complianceScore", 
      url: "/compliance-score", 
      icon: TrendingUp,
      iconBgClass: "bg-gradient-to-br from-red-500 to-rose-600",
      iconTextClass: "text-white",
    },
    { 
      titleKey: "nav.dataLineage", 
      url: "/data-lineage", 
      icon: GitBranch,
      iconBgClass: "bg-gradient-to-br from-teal-500 to-cyan-600",
      iconTextClass: "text-white",
    },
    { 
      titleKey: "nav.dsar", 
      url: "/dsar", 
      icon: Mail,
      iconBgClass: "bg-gradient-to-br from-sky-500 to-blue-600",
      iconTextClass: "text-white",
    },
    { 
      titleKey: "nav.auditVerify", 
      url: "/audit-verify", 
      icon: ShieldCheck,
      iconBgClass: "bg-gradient-to-br from-violet-500 to-purple-600",
      iconTextClass: "text-white",
    },
    { 
      titleKey: "nav.modelRegistry", 
      url: "/model-registry", 
      icon: Bot,
      iconBgClass: "bg-gradient-to-br from-fuchsia-500 to-pink-600",
      iconTextClass: "text-white",
    },
    { 
      titleKey: "nav.promptManager", 
      url: "/prompts", 
      icon: MessageSquare,
      iconBgClass: "bg-gradient-to-br from-amber-500 to-yellow-600",
      iconTextClass: "text-white",
    },
    { 
      titleKey: "nav.usage", 
      url: "/usage", 
      icon: Activity,
      iconBgClass: "bg-gradient-to-br from-cyan-500 to-teal-600",
      iconTextClass: "text-white",
    },
    { 
      titleKey: "nav.analytics", 
      url: "/analytics", 
      icon: BarChart3,
      iconBgClass: "bg-gradient-to-br from-rose-500 to-red-600",
      iconTextClass: "text-white",
    },
    { 
      titleKey: "nav.reports", 
      url: "/reports", 
      icon: FileText,
      iconBgClass: "bg-gradient-to-br from-slate-500 to-gray-600",
      iconTextClass: "text-white",
    },
    { 
      titleKey: "nav.ragSearch", 
      url: "/rag-search", 
      icon: BookOpen,
      iconBgClass: "bg-gradient-to-br from-lime-500 to-green-600",
      iconTextClass: "text-white",
    },
    { 
      titleKey: "nav.auditTrail", 
      url: "/audit", 
      icon: Database,
      iconBgClass: "bg-gradient-to-br from-zinc-500 to-slate-600",
      iconTextClass: "text-white",
    },
    { 
      titleKey: "nav.explainability", 
      url: "/explainability", 
      icon: Eye,
      iconBgClass: "bg-gradient-to-br from-pink-500 to-rose-600",
      iconTextClass: "text-white",
    },
    { 
      titleKey: "nav.marketplace", 
      url: "/marketplace", 
      icon: Store,
      iconBgClass: "bg-gradient-to-br from-yellow-500 to-orange-600",
      iconTextClass: "text-white",
    },
    { 
      titleKey: "nav.admin", 
      url: "/admin", 
      icon: Settings,
      iconBgClass: "bg-gradient-to-br from-gray-500 to-zinc-600",
      iconTextClass: "text-white",
    },
  ]

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent className="pt-4">
        <SidebarGroup>
          <div className="px-3 mb-2">
            <div className="flex items-center gap-2">
              <RoboticShieldLogo size={32} />
              {!isCollapsed && (
                <div>
                  <span className="font-bold text-lg block leading-tight">Regulix</span>
                  <span className="text-[10px] text-muted-foreground leading-none">Regulatory Intelligence</span>
                </div>
              )}
            </div>
          </div>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t('nav.main', language)}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => {
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.titleKey}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        end={item.url === "/dashboard"}
                        className="hover:bg-accent/50 transition-all group"
                        activeClassName="bg-accent/10 text-accent-foreground font-medium"
                      >
                        <div className={`p-1.5 rounded-lg ${item.iconBgClass} shadow-sm group-hover:shadow-md transition-shadow`}>
                          <Icon className={`h-4 w-4 ${item.iconTextClass}`} />
                        </div>
                        {!isCollapsed && <span>{t(item.titleKey, language)}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t('nav.tools', language)}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsItems.map((item) => {
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.titleKey}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url}
                        className="hover:bg-accent/50 transition-all group"
                        activeClassName="bg-accent/10 text-accent-foreground font-medium"
                      >
                        <div className={`p-1.5 rounded-lg ${item.iconBgClass} shadow-sm group-hover:shadow-md transition-shadow`}>
                          <Icon className={`h-4 w-4 ${item.iconTextClass}`} />
                        </div>
                        {!isCollapsed && <span>{t(item.titleKey, language)}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>
    </Sidebar>
  )
}
