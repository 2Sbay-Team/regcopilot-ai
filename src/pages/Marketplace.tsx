import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, FileCheck, Leaf, Lock, Network, Database, Star } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useLanguage } from "@/contexts/LanguageContext"
import { t } from "@/lib/i18n"

const AVAILABLE_COPILOTS = [
  {
    id: 'ai-act',
    name: 'AI Act Auditor',
    description: 'Risk classification, conformity assessment, and Annex IV compliance for AI systems',
    icon: Shield,
    status: 'active',
    category: 'AI Compliance',
    features: ['Risk Assessment', 'Annex IV Documentation', 'High-Risk Validation'],
    route: '/ai-act'
  },
  {
    id: 'gdpr',
    name: 'GDPR Checker',
    description: 'Privacy impact assessments, violation detection, and DSAR management',
    icon: FileCheck,
    status: 'active',
    category: 'Data Privacy',
    features: ['Privacy Scanning', 'DSAR Automation', 'Cross-Border Transfer Checks'],
    route: '/gdpr'
  },
  {
    id: 'esg',
    name: 'ESG Reporter',
    description: 'CSRD/ESRS sustainability reporting with automated metric collection',
    icon: Leaf,
    status: 'active',
    category: 'Sustainability',
    features: ['Emission Tracking', 'ESRS Reporting', 'Completeness Scoring'],
    route: '/esg'
  },
  {
    id: 'nis2',
    name: 'NIS2 Compliance',
    description: 'Cybersecurity incident reporting and supply chain risk management',
    icon: Lock,
    status: 'active',
    category: 'Cybersecurity',
    features: ['Incident Reporting', 'Supply Chain Risk', 'Security Measures'],
    route: '/nis2'
  },
  {
    id: 'dora',
    name: 'DORA Compliance',
    description: 'Digital operational resilience for financial institutions',
    icon: Network,
    status: 'active',
    category: 'Financial Services',
    features: ['Resilience Testing', 'ICT Risk Management', 'Third-Party Oversight'],
    route: '/dora'
  },
  {
    id: 'dma',
    name: 'Digital Markets Act',
    description: 'Gatekeeper compliance and interoperability requirements',
    icon: Database,
    status: 'active',
    category: 'Digital Markets',
    features: ['Gatekeeper Assessment', 'Interoperability', 'Fair Competition'],
    route: '/dma'
  },
]

const Marketplace = () => {
  const navigate = useNavigate()
  const { language } = useLanguage()

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {t('marketplace.title', language)}
        </h1>
        <p className="text-muted-foreground font-medium">
          {t('marketplace.subtitle', language)}
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Star className="h-6 w-6 text-primary" />
            {t('marketplace.activeCopilots', language)}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {AVAILABLE_COPILOTS.map((copilot) => {
              const Icon = copilot.icon
              return (
                <Card key={copilot.id} className="border-primary/20">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Icon className="h-10 w-10 text-primary mb-3" />
                      <Badge variant="default">{t('marketplace.active', language)}</Badge>
                    </div>
                    <CardTitle>{copilot.name}</CardTitle>
                    <CardDescription>{copilot.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      {copilot.category}
                    </div>
                    <div className="space-y-1">
                      {copilot.features.map((feature, idx) => (
                        <div key={idx} className="text-sm flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {feature}
                        </div>
                      ))}
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate(copilot.route)}
                    >
                      {t('marketplace.launchCopilot', language)}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>


        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>{t('marketplace.requestCustom', language)}</CardTitle>
            <CardDescription>
              {t('marketplace.requestCustomDesc', language)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {t('marketplace.requestCustomText', language)}
            </p>
            <Button>{t('marketplace.contactSales', language)}</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Marketplace
