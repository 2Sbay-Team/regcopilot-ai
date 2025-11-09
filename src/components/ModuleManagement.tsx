import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Settings2 } from "lucide-react"

interface ModuleSetting {
  id: string
  module_name: string
  enabled: boolean
  config: any
}

interface ModuleInfo {
  name: string
  displayName: string
  description: string
  category: "copilot" | "tool" | "integration"
}

const MODULE_INFO: Record<string, ModuleInfo> = {
  scheduled_jobs: {
    name: "scheduled_jobs",
    displayName: "Scheduled Jobs",
    description: "Automate compliance workflows and periodic scans",
    category: "tool"
  },
  ai_act_auditor: {
    name: "ai_act_auditor",
    displayName: "AI Act Auditor",
    description: "EU AI Act risk classification and compliance assessment",
    category: "copilot"
  },
  gdpr_checker: {
    name: "gdpr_checker",
    displayName: "GDPR Checker",
    description: "Privacy compliance verification and DSAR management",
    category: "copilot"
  },
  esg_reporter: {
    name: "esg_reporter",
    displayName: "ESG Reporter",
    description: "Sustainability metrics and CSRD reporting",
    category: "copilot"
  },
  dma_assessor: {
    name: "dma_assessor",
    displayName: "DMA Assessor",
    description: "Digital Markets Act compliance for digital platforms",
    category: "copilot"
  },
  dora_assessor: {
    name: "dora_assessor",
    displayName: "DORA Assessor",
    description: "Digital Operational Resilience Act for financial institutions",
    category: "copilot"
  },
  nis2_assessor: {
    name: "nis2_assessor",
    displayName: "NIS2 Assessor",
    description: "Network and Information Security Directive compliance",
    category: "copilot"
  },
  connectors: {
    name: "connectors",
    displayName: "Data Connectors",
    description: "Integrate with external data sources (SAP, Jira, SharePoint)",
    category: "integration"
  },
  social_sentiment: {
    name: "social_sentiment",
    displayName: "Social Sentiment Analysis",
    description: "Monitor brand sentiment and ESG-related social signals",
    category: "tool"
  },
  ai_gateway: {
    name: "ai_gateway",
    displayName: "AI Gateway",
    description: "Unified interface for multiple AI model providers",
    category: "tool"
  },
  model_management: {
    name: "model_management",
    displayName: "Model Management",
    description: "AI/ML model lifecycle and governance",
    category: "tool"
  },
  data_lineage: {
    name: "data_lineage",
    displayName: "Data Lineage (DataSage)",
    description: "Track data flow and transformations across systems",
    category: "tool"
  },
  dsar_management: {
    name: "dsar_management",
    displayName: "DSAR Management",
    description: "Handle data subject access requests",
    category: "tool"
  },
  audit_verification: {
    name: "audit_verification",
    displayName: "Audit Chain Verification",
    description: "Cryptographic verification of audit trail integrity",
    category: "tool"
  },
  continuous_intelligence: {
    name: "continuous_intelligence",
    displayName: "Continuous Intelligence",
    description: "Real-time compliance monitoring and intelligence scoring",
    category: "tool"
  }
}

export const ModuleManagement = () => {
  const { toast } = useToast()
  const [modules, setModules] = useState<ModuleSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    loadModules()
  }, [])

  const loadModules = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single()

      if (!profile) return

      const { data, error } = await supabase
        .from("module_settings")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .order("module_name")

      if (error) throw error
      setModules(data || [])
    } catch (error: any) {
      console.error("Error loading modules:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load module settings"
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleModule = async (moduleId: string, currentState: boolean) => {
    setUpdating(moduleId)
    try {
      const { error } = await supabase
        .from("module_settings")
        .update({ enabled: !currentState })
        .eq("id", moduleId)

      if (error) throw error

      toast({
        title: "Module Updated",
        description: `Module ${!currentState ? "enabled" : "disabled"} successfully`
      })

      await loadModules()
    } catch (error: any) {
      console.error("Error toggling module:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update module status"
      })
    } finally {
      setUpdating(null)
    }
  }

  const groupedModules = modules.reduce((acc, module) => {
    const info = MODULE_INFO[module.module_name]
    if (!info) return acc
    
    const category = info.category
    if (!acc[category]) acc[category] = []
    acc[category].push({ ...module, info })
    return acc
  }, {} as Record<string, Array<ModuleSetting & { info: ModuleInfo }>>)

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-muted-foreground">Loading modules...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          Module Management
        </CardTitle>
        <CardDescription>
          Enable or disable platform modules and features for your organization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedModules).map(([category, categoryModules]) => (
          <div key={category} className="space-y-3">
            <h3 className="text-sm font-semibold uppercase text-muted-foreground">
              {category === "copilot" ? "Compliance Copilots" : category === "tool" ? "Tools & Features" : "Integrations"}
            </h3>
            <div className="grid gap-3">
              {categoryModules.map((module) => (
                <div
                  key={module.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{module.info.displayName}</span>
                      {module.enabled && (
                        <Badge variant="default" className="text-xs">Active</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {module.info.description}
                    </p>
                  </div>
                  <Switch
                    checked={module.enabled}
                    onCheckedChange={() => toggleModule(module.id, module.enabled)}
                    disabled={updating === module.id}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
