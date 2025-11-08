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
  Eye
} from "lucide-react"
import { NavLink } from "@/components/NavLink"
import { AnimatedOctopus } from "@/components/AnimatedOctopus"

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
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Reports", url: "/reports", icon: FileText },
  { title: "RAG Search", url: "/rag-search", icon: BookOpen },
  { title: "Audit Trail", url: "/audit", icon: Database },
  { title: "Model Registry", url: "/models", icon: Settings },
  { title: "Explainability", url: "/explainability", icon: Eye },
  { title: "Admin", url: "/admin", icon: Settings },
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
              <AnimatedOctopus size="sm" enableBlink={true} enableWave={false} />
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
      </SidebarContent>
    </Sidebar>
  )
}
