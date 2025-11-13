import { useState } from "react"
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
  Users,
  TrendingUp,
  Store,
  Play,
  Sparkles,
  Calendar,
  Search,
  ChevronRight,
  HelpCircle,
  Wrench,
  Info,
  CreditCard,
  Building2
} from "lucide-react"
import { NavLink } from "@/components/NavLink"
import { LaterneXLogo } from "@/components/LaterneXLogo"
import { ThemeToggle } from "@/components/ThemeToggle"
import { t } from "@/lib/i18n"
import { useLanguage } from "@/contexts/LanguageContext"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ModuleHelpModal } from "@/components/ModuleHelpModal"
import { moduleHelpContent } from "@/lib/helpContent"

export function AppSidebar() {
  const { state } = useSidebar()
  const { language } = useLanguage()
  const isCollapsed = state === "collapsed"
  const [searchQuery, setSearchQuery] = useState("")
  const [openSections, setOpenSections] = useState({
    compliance: true,
    management: true,
    tools: true
  })
  const [helpModalOpen, setHelpModalOpen] = useState(false)
  const [selectedModule, setSelectedModule] = useState<keyof typeof moduleHelpContent | null>(null)

  const complianceItems = [
    { 
      titleKey: "nav.dashboard", 
      url: "/dashboard", 
      icon: LayoutDashboard,
    },
    { 
      titleKey: "nav.continuousIntelligence", 
      url: "/continuous-intelligence", 
      icon: TrendingUp,
    },
    { 
      titleKey: "nav.aiAct", 
      url: "/ai-act", 
      icon: Shield,
    },
    { 
      titleKey: "nav.gdpr", 
      url: "/gdpr", 
      icon: FileCheck,
    },
    { 
      titleKey: "nav.esg", 
      url: "/esg", 
      icon: Leaf,
    },
    { 
      titleKey: "ESG Reports", 
      url: "/esg-reports", 
      icon: FileText,
    },
    { 
      titleKey: "nav.complianceScore", 
      url: "/compliance-score", 
      icon: TrendingUp,
    },
  ]

  const managementItems = [
    { 
      titleKey: "nav.modelManagement", 
      url: "/model-management", 
      icon: Bot,
    },
    { 
      titleKey: "nav.modelRegistry", 
      url: "/model-registry", 
      icon: Database,
    },
    { 
      titleKey: "nav.dataLineage", 
      url: "/data-lineage", 
      icon: GitBranch,
    },
    { 
      titleKey: "nav.dsar", 
      url: "/dsar", 
      icon: Mail,
    },
    { 
      titleKey: "nav.auditTrail", 
      url: "/audit", 
      icon: Database,
    },
    { 
      titleKey: "nav.auditVerify", 
      url: "/audit-verify", 
      icon: ShieldCheck,
    },
    { 
      titleKey: "nav.explainability", 
      url: "/explainability", 
      icon: Eye,
    },
  ]

  const toolsItems = [
    { 
      titleKey: "nav.scheduledJobs",
      url: "/scheduled-jobs", 
      icon: Calendar,
    },
    { 
      titleKey: "nav.agentDashboard", 
      url: "/agents", 
      icon: Play,
    },
    { 
      titleKey: "nav.connectors", 
      url: "/connectors", 
      icon: GitBranch,
    },
    { 
      titleKey: "nav.socialSentiment", 
      url: "/social-sentiment", 
      icon: User,
    },
    { 
      titleKey: "nav.aiGateway", 
      url: "/ai-gateway", 
      icon: Zap,
    },
    { 
      titleKey: "nav.promptManager", 
      url: "/prompts", 
      icon: MessageSquare,
    },
    { 
      titleKey: "nav.usage", 
      url: "/usage", 
      icon: Activity,
    },
    { 
      titleKey: "nav.billing", 
      url: "/billing", 
      icon: CreditCard,
    },
    { 
      titleKey: "nav.analytics", 
      url: "/analytics", 
      icon: BarChart3,
    },
    { 
      titleKey: "nav.reports", 
      url: "/reports", 
      icon: FileText,
    },
    { 
      titleKey: "nav.ragSearch", 
      url: "/rag-search", 
      icon: BookOpen,
    },
    { 
      titleKey: "nav.marketplace", 
      url: "/marketplace", 
      icon: Store,
    },
    { 
      titleKey: "nav.automation", 
      url: "/automation", 
      icon: Zap,
    },
    { 
      titleKey: "nav.securityCenter", 
      url: "/security-center", 
      icon: Shield,
    },
    { 
      titleKey: "nav.auditPortal", 
      url: "/audit-portal", 
      icon: ShieldCheck,
    },
    { 
      titleKey: "nav.admin",
      url: "/admin", 
      icon: Settings,
    },
    {
      titleKey: "nav.teamManagement",
      url: "/admin/team",
      icon: Users,
    },
    {
      titleKey: "nav.organization",
      url: "/organization",
      icon: Building2,
    },
  ]

  const allItems = [...complianceItems, ...managementItems, ...toolsItems]

  const filterItems = (items: typeof allItems) => {
    if (!searchQuery) return items
    return items.filter(item => 
      t(item.titleKey, language).toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const handleOpenHelp = (url: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Map URLs to help content keys
    const urlToKey: Record<string, keyof typeof moduleHelpContent> = {
      "/ai-act": "ai-act",
      "/gdpr": "gdpr",
      "/esg": "esg",
      "/dsar": "dsar",
      "/dora": "dora",
      "/dora-copilot": "dora"
    }
    
    const key = urlToKey[url]
    if (key && moduleHelpContent[key]) {
      setSelectedModule(key)
      setHelpModalOpen(true)
    }
  }

  const renderMenuItem = (item: typeof allItems[0]) => {
    const Icon = item.icon
    const title = t(item.titleKey, language)
    const hasHelp = ["/ai-act", "/gdpr", "/esg", "/dsar", "/dora", "/dora-copilot"].includes(item.url)
    
    const menuButton = (
      <SidebarMenuButton asChild>
        <div className="flex items-center w-full group">
          <NavLink 
            to={item.url} 
            end={item.url === "/dashboard"}
            className="hover:bg-accent/50 transition-colors py-2 px-3 rounded-md flex-1 flex items-center"
            activeClassName="bg-accent text-accent-foreground font-medium"
          >
            {isCollapsed ? (
              <Icon className="h-5 w-5 mx-auto" />
            ) : (
              <>
                <Icon className="h-5 w-5 shrink-0" />
                <span className="text-sm ml-3">{title}</span>
              </>
            )}
          </NavLink>
          {hasHelp && !isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => handleOpenHelp(item.url, e)}
              aria-label="Help for this section"
            >
              <Info className="h-4 w-4" />
            </Button>
          )}
        </div>
      </SidebarMenuButton>
    )

    if (isCollapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {menuButton}
          </TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {title}
          </TooltipContent>
        </Tooltip>
      )
    }

    return menuButton
  }

  return (
    <TooltipProvider delayDuration={200}>
      {selectedModule && moduleHelpContent[selectedModule] && (
        <ModuleHelpModal
          open={helpModalOpen}
          onOpenChange={setHelpModalOpen}
          module={moduleHelpContent[selectedModule]}
        />
      )}
      
      <Sidebar collapsible="offcanvas" className="border-r">
        <SidebarContent className="pt-3">
          <SidebarGroup>
            <div className={`px-3 mb-4 ${isCollapsed ? 'flex justify-center' : ''}`}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={`flex items-center gap-3 ${isCollapsed ? 'w-10 h-10 justify-center' : ''}`}>
                    <div className="shrink-0">
                      <LaterneXLogo size={isCollapsed ? 28 : 32} />
                    </div>
                    {!isCollapsed && (
                      <div>
                        <span className="font-semibold text-base block leading-tight">
                          LaterneX
                        </span>
                        <span className="text-xs text-muted-foreground leading-none">
                          AI-Powered Regulatory Intelligence
                        </span>
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">
                    <p className="font-semibold">LaterneX</p>
                    <p className="text-xs text-muted-foreground">AI-Powered Regulatory Intelligence</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
          </SidebarGroup>

          {/* Search Bar */}
          {!isCollapsed && (
            <SidebarGroup>
              <div className="px-3 pb-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search pages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 text-sm"
                  />
                </div>
              </div>
            </SidebarGroup>
          )}

          {/* Compliance Section */}
          <Collapsible
            open={isCollapsed || openSections.compliance}
            onOpenChange={(open) => setOpenSections({ ...openSections, compliance: open })}
          >
            <SidebarGroup>
              {!isCollapsed && (
                <CollapsibleTrigger className="w-full">
                  <SidebarGroupLabel className="flex items-center justify-between cursor-pointer hover:bg-accent/50 rounded-md px-3 py-2">
                    <span>Compliance</span>
                    <ChevronRight className={`h-4 w-4 transition-transform ${openSections.compliance ? 'rotate-90' : ''}`} />
                  </SidebarGroupLabel>
                </CollapsibleTrigger>
              )}
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu className="gap-0.5">
                    {filterItems(complianceItems).map((item) => (
                      <SidebarMenuItem key={item.titleKey}>
                        {renderMenuItem(item)}
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>

          {/* Management Section */}
          <Collapsible
            open={isCollapsed || openSections.management}
            onOpenChange={(open) => setOpenSections({ ...openSections, management: open })}
          >
            <SidebarGroup>
              {!isCollapsed && (
                <CollapsibleTrigger className="w-full">
                  <SidebarGroupLabel className="flex items-center justify-between cursor-pointer hover:bg-accent/50 rounded-md px-3 py-2">
                    <span>Management</span>
                    <ChevronRight className={`h-4 w-4 transition-transform ${openSections.management ? 'rotate-90' : ''}`} />
                  </SidebarGroupLabel>
                </CollapsibleTrigger>
              )}
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu className="gap-0.5">
                    {filterItems(managementItems).map((item) => (
                      <SidebarMenuItem key={item.titleKey}>
                        {renderMenuItem(item)}
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>

          {/* Tools Section */}
          <Collapsible
            open={isCollapsed || openSections.tools}
            onOpenChange={(open) => setOpenSections({ ...openSections, tools: open })}
          >
            <SidebarGroup>
              {!isCollapsed && (
                <CollapsibleTrigger className="w-full">
                  <SidebarGroupLabel className="flex items-center justify-between cursor-pointer hover:bg-accent/50 rounded-md px-3 py-2">
                    <span>Tools</span>
                    <ChevronRight className={`h-4 w-4 transition-transform ${openSections.tools ? 'rotate-90' : ''}`} />
                  </SidebarGroupLabel>
                </CollapsibleTrigger>
              )}
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu className="gap-0.5">
                    {filterItems(toolsItems).map((item) => (
                      <SidebarMenuItem key={item.titleKey}>
                        {renderMenuItem(item)}
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>

        </SidebarContent>
        
        <SidebarFooter>
          {/* Help Center Link */}
          {!isCollapsed && (
            <div className="px-3 py-2">
              <NavLink 
                to="/help-center"
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent/50 transition-colors text-sm"
                activeClassName="bg-accent text-accent-foreground font-medium"
              >
                <HelpCircle className="h-4 w-4" />
                <span>Help Center</span>
              </NavLink>
            </div>
          )}
          
          <div className={`flex items-center px-3 py-2 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!isCollapsed && (
              <span className="text-xs text-muted-foreground font-medium">
                Theme
              </span>
            )}
            <ThemeToggle />
          </div>
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  )
}
