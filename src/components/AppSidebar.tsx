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
  User
} from "lucide-react"
import { NavLink } from "@/components/NavLink"
import { RoboticShieldLogo } from "@/components/RoboticShieldLogo"

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

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "AI Act Auditor", url: "/ai-act", icon: Shield },
  { title: "GDPR Checker", url: "/gdpr", icon: FileCheck },
  { title: "ESG Reporter", url: "/esg", icon: Leaf },
]

const toolsItems = [
  { title: "AI Gateway", url: "/ai-gateway", icon: Zap },
  { title: "DataSage", url: "/data-lineage", icon: GitBranch },
  { title: "DSAR Queue", url: "/dsar", icon: Mail },
  { title: "Audit Verify", url: "/audit-verify", icon: ShieldCheck },
  { title: "Model Registry", url: "/model-registry", icon: Bot },
  { title: "Prompt Manager", url: "/prompts", icon: MessageSquare },
  { title: "Usage & Billing", url: "/usage", icon: DollarSign },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Reports", url: "/reports", icon: FileText },
  { title: "RAG Search", url: "/rag-search", icon: BookOpen },
  { title: "Audit Trail", url: "/audit", icon: Database },
  { title: "Explainability", url: "/explainability", icon: Eye },
  { title: "Admin", url: "/admin", icon: Settings },
]

const accountItems = [
  { title: "Settings", url: "/settings", icon: User },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

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
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/dashboard"}
                      className="hover:bg-accent/50 transition-colors"
                      activeClassName="bg-accent text-accent-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className="hover:bg-accent/50 transition-colors"
                      activeClassName="bg-accent text-accent-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className="hover:bg-accent/50 transition-colors"
                      activeClassName="bg-accent text-accent-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
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
