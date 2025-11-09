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
  DollarSign,
  User,
  TrendingUp,
  Store
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
    { titleKey: "nav.dashboard", url: "/dashboard", icon: LayoutDashboard },
    { titleKey: "nav.aiAct", url: "/ai-act", icon: Shield },
    { titleKey: "nav.gdpr", url: "/gdpr", icon: FileCheck },
    { titleKey: "nav.esg", url: "/esg", icon: Leaf },
  ]

  const toolsItems = [
    { titleKey: "nav.aiGateway", url: "/ai-gateway", icon: Zap },
    { titleKey: "nav.modelManagement", url: "/model-management", icon: Bot },
    { titleKey: "nav.complianceScore", url: "/compliance-score", icon: TrendingUp },
    { titleKey: "nav.dataLineage", url: "/data-lineage", icon: GitBranch },
    { titleKey: "nav.dsar", url: "/dsar", icon: Mail },
    { titleKey: "nav.auditVerify", url: "/audit-verify", icon: ShieldCheck },
    { titleKey: "nav.modelRegistry", url: "/model-registry", icon: Bot },
    { titleKey: "nav.promptManager", url: "/prompts", icon: MessageSquare },
    { titleKey: "nav.usage", url: "/usage", icon: DollarSign },
    { titleKey: "nav.analytics", url: "/analytics", icon: BarChart3 },
    { titleKey: "nav.reports", url: "/reports", icon: FileText },
    { titleKey: "nav.ragSearch", url: "/rag-search", icon: BookOpen },
    { titleKey: "nav.auditTrail", url: "/audit", icon: Database },
    { titleKey: "nav.explainability", url: "/explainability", icon: Eye },
    { titleKey: "nav.marketplace", url: "/marketplace", icon: Store },
    { titleKey: "nav.admin", url: "/admin", icon: Settings },
  ]

  const accountItems = [
    { titleKey: "nav.settings", url: "/settings", icon: User },
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
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.titleKey}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/dashboard"}
                      className="hover:bg-accent/50 transition-colors"
                      activeClassName="bg-accent text-accent-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{t(item.titleKey, language)}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t('nav.tools', language)}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsItems.map((item) => (
                <SidebarMenuItem key={item.titleKey}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className="hover:bg-accent/50 transition-colors"
                      activeClassName="bg-accent text-accent-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{t(item.titleKey, language)}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t('nav.account', language)}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.titleKey}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className="hover:bg-accent/50 transition-colors"
                      activeClassName="bg-accent text-accent-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{t(item.titleKey, language)}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
