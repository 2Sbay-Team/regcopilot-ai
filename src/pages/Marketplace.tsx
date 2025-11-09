import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, FileCheck, Leaf, Lock, Network, Database, Clock, Star } from "lucide-react"

const AVAILABLE_COPILOTS = [
  {
    id: 'ai-act',
    name: 'AI Act Auditor',
    description: 'Risk classification, conformity assessment, and Annex IV compliance for AI systems',
    icon: Shield,
    status: 'active',
    category: 'AI Compliance',
    features: ['Risk Assessment', 'Annex IV Documentation', 'High-Risk Validation']
  },
  {
    id: 'gdpr',
    name: 'GDPR Checker',
    description: 'Privacy impact assessments, violation detection, and DSAR management',
    icon: FileCheck,
    status: 'active',
    category: 'Data Privacy',
    features: ['Privacy Scanning', 'DSAR Automation', 'Cross-Border Transfer Checks']
  },
  {
    id: 'esg',
    name: 'ESG Reporter',
    description: 'CSRD/ESRS sustainability reporting with automated metric collection',
    icon: Leaf,
    status: 'active',
    category: 'Sustainability',
    features: ['Emission Tracking', 'ESRS Reporting', 'Completeness Scoring']
  },
]

const UPCOMING_COPILOTS = [
  {
    id: 'nis2',
    name: 'NIS2 Compliance',
    description: 'Cybersecurity incident reporting and supply chain risk management',
    icon: Lock,
    status: 'coming-soon',
    category: 'Cybersecurity',
    eta: 'Q2 2025'
  },
  {
    id: 'dora',
    name: 'DORA Compliance',
    description: 'Digital operational resilience for financial institutions',
    icon: Network,
    status: 'coming-soon',
    category: 'Financial Services',
    eta: 'Q3 2025'
  },
  {
    id: 'dma',
    name: 'Digital Markets Act',
    description: 'Gatekeeper compliance and interoperability requirements',
    icon: Database,
    status: 'planned',
    category: 'Digital Markets',
    eta: 'Q4 2025'
  },
]

const Marketplace = () => {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Compliance Marketplace
        </h1>
        <p className="text-muted-foreground font-medium">
          Discover and activate compliance copilots for your organization
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Star className="h-6 w-6 text-primary" />
            Active Copilots
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {AVAILABLE_COPILOTS.map((copilot) => {
              const Icon = copilot.icon
              return (
                <Card key={copilot.id} className="border-primary/20">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Icon className="h-10 w-10 text-primary mb-3" />
                      <Badge variant="default">Active</Badge>
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
                    <Button variant="outline" className="w-full" disabled>
                      Configured
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Clock className="h-6 w-6 text-muted-foreground" />
            Coming Soon
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {UPCOMING_COPILOTS.map((copilot) => {
              const Icon = copilot.icon
              return (
                <Card key={copilot.id} className="opacity-75 hover:opacity-100 transition-opacity">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Icon className="h-10 w-10 text-muted-foreground mb-3" />
                      <Badge variant="secondary">{copilot.eta}</Badge>
                    </div>
                    <CardTitle>{copilot.name}</CardTitle>
                    <CardDescription>{copilot.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      {copilot.category}
                    </div>
                    <Button variant="outline" className="w-full" disabled>
                      Notify Me
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Request a Custom Copilot</CardTitle>
            <CardDescription>
              Need compliance support for a specific regulation not listed here?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Contact our team to discuss custom copilot development for your organization's unique compliance needs.
            </p>
            <Button>Contact Sales</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Marketplace
