import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Search, 
  BookOpen, 
  PlayCircle, 
  FileText, 
  MessageSquare, 
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Shield,
  FileCheck,
  Leaf,
  Database,
  Zap,
  Calendar,
  GitBranch
} from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState("")

  const faqs = [
    {
      category: "Getting Started",
      icon: BookOpen,
      questions: [
        {
          q: "What is Regulix and how does it help with compliance?",
          a: "Regulix is a comprehensive regulatory intelligence platform that automates compliance monitoring for EU AI Act, GDPR, and ESG/CSRD requirements. It helps organizations assess AI systems, manage data privacy, track sustainability metrics, and maintain audit trails—all from a single dashboard."
        },
        {
          q: "How do I get started with my first compliance assessment?",
          a: "Start by navigating to the relevant copilot:\n• AI Act Auditor: For AI system risk classification\n• GDPR Checker: For privacy compliance scanning\n• ESG Reporter: For sustainability reporting\n\nEach copilot has guided forms with tooltips explaining every field. Fill in your information and submit for automated analysis."
        },
        {
          q: "What's the difference between the copilots and the dashboard?",
          a: "The Dashboard provides an overview of your compliance status across all regulations. Copilots are specialized tools for specific compliance tasks (AI Act, GDPR, ESG, NIS2, DORA, DMA). Use the dashboard to monitor, and copilots to perform assessments and generate reports."
        }
      ]
    },
    {
      category: "AI Act Compliance",
      icon: Shield,
      questions: [
        {
          q: "How does the AI Act risk classification work?",
          a: "The AI Act Auditor analyzes your AI system based on its purpose, deployment sector, and potential impact. It classifies systems into:\n• Minimal Risk: Standard AI applications (most chatbots, spam filters)\n• Limited Risk: Systems with transparency obligations\n• High Risk: Critical applications (employment, law enforcement)\n• Unacceptable Risk: Prohibited uses (social scoring, real-time biometric ID)\n\nThe classification determines your compliance obligations."
        },
        {
          q: "What is an Annex IV Summary and when do I need it?",
          a: "Annex IV of the EU AI Act lists mandatory technical documentation requirements for high-risk AI systems. You need this if your AI system is classified as high-risk. Our platform auto-generates this summary, including:\n• System description and intended purpose\n• Risk management documentation\n• Data governance measures\n• Technical specifications\n• Human oversight mechanisms"
        },
        {
          q: "Can I register multiple AI models?",
          a: "Yes! Use the Model Registry to track all AI models in your organization. Register each model with its version, provider, risk classification, and compliance status. This creates a centralized inventory for governance and audit purposes."
        }
      ]
    },
    {
      category: "GDPR & Privacy",
      icon: FileCheck,
      questions: [
        {
          q: "What is a DSAR and how do I handle them?",
          a: "Data Subject Access Request (DSAR) is a GDPR right where individuals can request access to their personal data. In Regulix:\n1. Go to DSAR Management\n2. Create a new request with the data subject's email\n3. Select the request type (Access, Erasure, Portability, etc.)\n4. Click 'Fulfill Request' to automatically search connected systems\n5. Review and download the compiled data\n\nYou have 30 days to fulfill DSARs under GDPR Article 12.3."
        },
        {
          q: "How does the GDPR privacy scanner work?",
          a: "The GDPR Checker scans documents and text for:\n• Personal identifiable information (PII)\n• Sensitive data categories (health, biometric, etc.)\n• Processing activities without legal basis\n• Data retention policy violations\n• Cross-border data transfer risks\n\nIt generates a compliance summary with flagged violations and remediation steps."
        },
        {
          q: "Can I connect my existing data systems for automated GDPR monitoring?",
          a: "Yes! Use Connectors to link:\n• Cloud storage (AWS S3, Azure Blob)\n• Document systems (SharePoint, OneDrive)\n• Business systems (SAP, Jira)\n• Communication (Slack, Teams)\n\nOnce connected, scheduled jobs automatically scan for privacy compliance issues."
        }
      ]
    },
    {
      category: "ESG & Sustainability",
      icon: Leaf,
      questions: [
        {
          q: "What ESG metrics should I track for CSRD compliance?",
          a: "For CSRD (Corporate Sustainability Reporting Directive), track:\n• Environmental: CO₂ emissions, energy consumption, waste\n• Social: Workforce diversity, employee wellbeing, human rights\n• Governance: Board composition, ethics policies, transparency\n\nOur ESG Copilot guides you through each metric with examples and calculates your completeness score."
        },
        {
          q: "How do I generate an ESG report?",
          a: "1. Navigate to ESG Copilot\n2. Enter your metrics (CO₂, energy, diversity, etc.)\n3. Upload supporting documents if available\n4. Click 'Generate Report'\n5. Review the AI-generated CSRD/ESRS narrative\n6. Download as PDF or export for editing\n\nThe system uses RAG (Retrieval-Augmented Generation) to reference relevant ESRS standards."
        }
      ]
    },
    {
      category: "Connectors & Automation",
      icon: GitBranch,
      questions: [
        {
          q: "What data sources can I connect?",
          a: "Regulix supports:\n• AWS S3, Azure Blob Storage\n• SharePoint, OneDrive\n• SAP/ERP systems\n• Jira, Confluence\n• Slack, Microsoft Teams\n• RSS feeds for regulatory updates\n• LinkedIn, Glassdoor for sentiment analysis"
        },
        {
          q: "How do I set up a scheduled compliance scan?",
          a: "1. Go to Scheduled Jobs\n2. Click 'New Job'\n3. Choose job type (Compliance Scan, Connector Sync, etc.)\n4. Set frequency (Hourly, Daily, Weekly)\n5. Configure which systems to scan\n6. Test and activate\n\nJobs run automatically and notify you of any compliance issues found."
        },
        {
          q: "Are my connector credentials secure?",
          a: "Yes. All credentials are:\n• Encrypted at rest and in transit\n• Stored in secure environment variables\n• Never logged or exposed in audit trails\n• Accessible only to authorized edge functions\n• Compliant with SOC 2 security standards"
        }
      ]
    },
    {
      category: "Model Management",
      icon: Database,
      questions: [
        {
          q: "Why should I register AI models in the Model Registry?",
          a: "The Model Registry:\n• Tracks AI model inventory across your organization\n• Documents risk classifications for EU AI Act compliance\n• Monitors model versions and updates\n• Links models to training datasets\n• Provides audit trail of model usage\n• Flags models requiring compliance review"
        },
        {
          q: "What's the difference between Model Registry and Model Management?",
          a: "• Model Registry: Static catalog of registered AI models (name, version, risk tag, compliance status)\n• Model Management: Active monitoring of model performance, usage patterns, and operational metrics\n\nUse Registry for compliance documentation, Management for operational oversight."
        }
      ]
    },
    {
      category: "AI Gateway & Usage",
      icon: Zap,
      questions: [
        {
          q: "What is the AI Gateway and why should I use it?",
          a: "The AI Gateway is a unified interface for calling multiple AI models (OpenAI, Google, Anthropic, Mistral) with:\n• Usage tracking and cost monitoring\n• Rate limiting and quota management\n• Prompt logging for compliance\n• Model fallback and retry logic\n• Unified API regardless of provider\n\nThis helps control AI spending and maintain audit trails."
        },
        {
          q: "How do I monitor AI usage and costs?",
          a: "Navigate to Usage & Billing to see:\n• Token consumption by model and user\n• Cost breakdown by project\n• Usage trends over time\n• Top consumers and endpoints\n• Budget alerts and quota warnings"
        }
      ]
    },
    {
      category: "Audit & Compliance",
      icon: FileCheck,
      questions: [
        {
          q: "What is the Audit Trail and why is it important?",
          a: "The Audit Trail is an immutable, hash-chained log of all compliance activities:\n• Who performed what action\n• When and why it was done\n• Input and output data\n• AI reasoning and decisions\n• Changes to models or policies\n\nThis is critical for regulatory audits, proving compliance, and incident investigation."
        },
        {
          q: "How does hash-chain verification work?",
          a: "Each audit entry includes:\n• Hash of previous entry (creating a chain)\n• Hash of current entry data\n• Timestamp and actor information\n\nUse Audit Chain Verify to detect any tampering. If the chain is broken, it indicates data manipulation."
        },
        {
          q: "Can I export compliance reports for regulators?",
          a: "Yes! Go to Reports to generate:\n• AI Act compliance reports (Annex IV documentation)\n• GDPR data processing records (Article 30)\n• ESG/CSRD sustainability reports\n• Unified compliance summary across all regulations\n\nExport as PDF, Word, or JSON format."
        }
      ]
    }
  ]

  const quickGuides = [
    {
      title: "5-Minute Quickstart",
      description: "Get up and running with your first compliance assessment",
      icon: PlayCircle,
      duration: "5 min",
      steps: [
        "Create your organization account",
        "Run your first AI Act audit",
        "Review compliance score on dashboard",
        "Set up automated monitoring"
      ]
    },
    {
      title: "Setting Up Connectors",
      description: "Connect your data sources for automated compliance monitoring",
      icon: GitBranch,
      duration: "10 min",
      steps: [
        "Navigate to Connectors",
        "Choose your data source type",
        "Enter connection credentials",
        "Test and validate connection",
        "Configure sync frequency"
      ]
    },
    {
      title: "DSAR Workflow",
      description: "Handle data subject access requests efficiently",
      icon: FileCheck,
      duration: "3 min",
      steps: [
        "Go to DSAR Management",
        "Create new request with email",
        "Select request type",
        "Click Fulfill Request",
        "Review and send compiled data"
      ]
    },
    {
      title: "Model Registry Setup",
      description: "Track all AI models for compliance governance",
      icon: Database,
      duration: "5 min",
      steps: [
        "Open Model Registry",
        "Click Register Model",
        "Enter model details and risk tag",
        "Link to training dataset",
        "Set compliance status"
      ]
    }
  ]

  const videoTutorials = [
    {
      title: "Platform Overview",
      description: "Complete walkthrough of Regulix features and capabilities",
      duration: "15:30",
      thumbnail: "overview"
    },
    {
      title: "EU AI Act Compliance",
      description: "Step-by-step guide to AI system risk assessment",
      duration: "12:45",
      thumbnail: "ai-act"
    },
    {
      title: "GDPR Automation",
      description: "Automate DSAR handling and privacy compliance",
      duration: "10:20",
      thumbnail: "gdpr"
    },
    {
      title: "ESG Reporting",
      description: "Create CSRD-compliant sustainability reports",
      duration: "8:15",
      thumbnail: "esg"
    }
  ]

  const filteredFAQs = searchQuery
    ? faqs.map(category => ({
        ...category,
        questions: category.questions.filter(
          q => 
            q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.a.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(category => category.questions.length > 0)
    : faqs

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="text-center space-y-4 py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <HelpCircle className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Help Center</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Find answers, tutorials, and comprehensive documentation to master Regulix
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for help articles, guides, or features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base"
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="faqs" className="space-y-6">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
          <TabsTrigger value="faqs">
            <MessageSquare className="h-4 w-4 mr-2" />
            FAQs
          </TabsTrigger>
          <TabsTrigger value="guides">
            <BookOpen className="h-4 w-4 mr-2" />
            Guides
          </TabsTrigger>
          <TabsTrigger value="videos">
            <PlayCircle className="h-4 w-4 mr-2" />
            Videos
          </TabsTrigger>
        </TabsList>

        {/* FAQs Tab */}
        <TabsContent value="faqs" className="space-y-6">
          {filteredFAQs.map((category) => (
            <Card key={category.category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <category.icon className="h-5 w-5 text-primary" />
                  {category.category}
                </CardTitle>
                <CardDescription>
                  {category.questions.length} {category.questions.length === 1 ? 'question' : 'questions'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((item, idx) => (
                    <AccordionItem key={idx} value={`item-${idx}`}>
                      <AccordionTrigger className="text-left">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground whitespace-pre-line">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}

          {filteredFAQs.length === 0 && searchQuery && (
            <Card>
              <CardContent className="text-center py-12">
                <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No results found</h3>
                <p className="text-muted-foreground">
                  Try different keywords or browse all categories
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Quick Guides Tab */}
        <TabsContent value="guides" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {quickGuides.map((guide, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <guide.icon className="h-5 w-5 text-primary" />
                        {guide.title}
                      </CardTitle>
                      <CardDescription>{guide.description}</CardDescription>
                    </div>
                    <Badge variant="outline">{guide.duration}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2">
                    {guide.steps.map((step, stepIdx) => (
                      <li key={stepIdx} className="flex items-start gap-2 text-sm">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0 mt-0.5">
                          {stepIdx + 1}
                        </span>
                        <span className="text-muted-foreground">{step}</span>
                      </li>
                    ))}
                  </ol>
                  <Button variant="outline" className="w-full mt-4">
                    <BookOpen className="h-4 w-4 mr-2" />
                    View Full Guide
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Video Tutorials Tab */}
        <TabsContent value="videos" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {videoTutorials.map((video, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <PlayCircle className="h-16 w-16 text-primary/50" />
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-lg">{video.title}</CardTitle>
                    <Badge variant="secondary">{video.duration}</Badge>
                  </div>
                  <CardDescription>{video.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Watch Tutorial
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Contact Support */}
      <Card className="bg-accent/50">
        <CardHeader>
          <CardTitle>Can't find what you're looking for?</CardTitle>
          <CardDescription>
            Our support team is here to help
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button variant="default">
            <MessageSquare className="h-4 w-4 mr-2" />
            Contact Support
          </Button>
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            View Documentation
          </Button>
          <Button variant="outline">
            <ExternalLink className="h-4 w-4 mr-2" />
            Community Forum
          </Button>
        </CardContent>
      </Card>

      {/* Keyboard Shortcut Hint */}
      <div className="text-center py-8 text-sm text-muted-foreground">
        <p>
          Press <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border rounded">Ctrl</kbd> + <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border rounded">K</kbd> to quickly search help content
        </p>
      </div>
    </div>
  )
}

export default HelpCenter
