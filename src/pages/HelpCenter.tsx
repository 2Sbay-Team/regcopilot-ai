import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { VideoPlayer } from "@/components/VideoPlayer"
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
  GitBranch,
  ShieldCheck
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
          a: "For CSRD (Corporate Sustainability Reporting Directive), track:\n• Environmental: CO₂ emissions (Scope 1, 2, 3), energy consumption, water usage, waste management, renewable energy percentage\n• Social: Workforce diversity metrics, employee wellbeing programs, training hours, human rights policies, supply chain labor practices\n• Governance: Board composition and independence, ethics policies, anti-corruption measures, data protection compliance, transparency reporting\n\nOur ESG Copilot guides you through each metric with industry benchmarks and calculates your ESRS completeness score."
        },
        {
          q: "How do I generate an ESG report?",
          a: "1. Navigate to ESG Copilot from the Compliance section\n2. Enter your environmental metrics (CO₂, energy, water, waste)\n3. Add social metrics (diversity, wellbeing, training)\n4. Include governance data (board composition, policies)\n5. Upload supporting documents (emission reports, audit statements)\n6. Click 'Generate Report' for AI-powered CSRD narrative\n7. Review against ESRS (European Sustainability Reporting Standards)\n8. Download as PDF or export to Word for customization\n9. Share with stakeholders or submit to regulators\n\nThe system uses RAG to reference specific ESRS double materiality requirements and best practices."
        },
        {
          q: "Can I track Scope 3 emissions automatically?",
          a: "Yes! Use the Scope 3 Connector to automatically pull emissions data from:\n• Supply chain partners via API integrations\n• Cloud providers (AWS, Azure, GCP carbon footprint)\n• Business travel systems (flight and hotel bookings)\n• Logistics providers (shipping and freight)\n\nSchedule automatic monthly syncs to keep your carbon footprint data current for CSRD reporting."
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
      category: "NIS2, DORA & DMA Compliance",
      icon: ShieldCheck,
      questions: [
        {
          q: "What is NIS2 and who does it apply to?",
          a: "NIS2 (Network and Information Security Directive 2) is the EU's cybersecurity law requiring:\n• Essential entities (energy, transport, banking, healthcare, digital infrastructure)\n• Important entities (postal services, waste management, manufacturing, digital providers)\n\nRequirements include:\n• Cybersecurity risk management measures\n• Incident reporting (24-hour preliminary, 72-hour detailed)\n• Supply chain security assessment\n• Business continuity planning\n\nUse the NIS2 Copilot to assess your obligations and generate compliance reports."
        },
        {
          q: "How does DORA affect financial institutions?",
          a: "DORA (Digital Operational Resilience Act) applies to:\n• Banks, insurance companies, investment firms\n• Payment institutions, crypto-asset service providers\n• Critical ICT third-party service providers\n\nKey requirements:\n• ICT risk management framework\n• Incident reporting to authorities\n• Digital operational resilience testing\n• Third-party ICT service provider oversight\n• Information sharing arrangements\n\nThe DORA Copilot helps assess ICT dependencies and generate resilience documentation."
        },
        {
          q: "What is the Digital Markets Act (DMA)?",
          a: "DMA regulates 'gatekeeper' platforms (large tech companies) to ensure fair competition:\n\nGatekeeper criteria:\n• €7.5B+ annual EEA turnover or €75B+ market value\n• 45M+ monthly active end users in EU\n• 10,000+ yearly active business users\n\nObligations include:\n• Interoperability requirements\n• Data portability and access\n• Anti-self-preferencing rules\n• Transparency in algorithms and ranking\n\nUse the DMA Assessor to determine gatekeeper status and compliance gaps."
        }
      ]
    },
    {
      category: "Audit & Compliance",
      icon: FileCheck,
      questions: [
        {
          q: "What is the Audit Trail and why is it important?",
          a: "The Audit Trail is an immutable, hash-chained log of all compliance activities:\n• Who performed what action (user ID and role)\n• When it was performed (timestamp with timezone)\n• What was changed (input/output data)\n• Why it was done (business justification)\n• AI model reasoning and confidence scores\n• Changes to models, policies, or configurations\n\nThis cryptographic audit trail is critical for:\n• Regulatory audits (demonstrating due diligence)\n• Incident investigation (root cause analysis)\n• Compliance reporting (Article 30 GDPR records)\n• Legal defense (proving proper governance)\n\nAll entries are stored in append-only mode with cryptographic signatures."
        },
        {
          q: "How does hash-chain verification work?",
          a: "Each audit entry includes:\n• Hash of previous entry (SHA-256)\n• Hash of current entry data\n• Timestamp (UTC, millisecond precision)\n• Digital signature of the entry\n• Actor information (user ID, IP, action type)\n\nThe hash chain works like blockchain:\n1. Entry N contains hash of Entry N-1\n2. Any modification to Entry N-1 breaks the chain\n3. Audit Verify tool recalculates all hashes\n4. Flags any discrepancies or tampering\n\nThis makes it cryptographically impossible to alter historical records without detection."
        },
        {
          q: "Can I export compliance reports for regulators?",
          a: "Yes! Navigate to Reports to generate:\n• AI Act: Annex IV technical documentation, conformity assessments, risk management reports\n• GDPR: Article 30 processing records, DPIA summaries, DSAR fulfillment logs\n• ESG/CSRD: ESRS sustainability disclosures, double materiality assessments\n• NIS2: Incident reports, risk management documentation\n• DORA: ICT resilience testing reports, third-party dependency maps\n• DMA: Gatekeeper compliance reports\n• Unified Report: Cross-regulation compliance summary\n\nExport formats:\n• PDF (regulator submission)\n• Word/DOCX (editable for legal review)\n• JSON (system integration)\n• CSV (data analysis)\n\nAll reports include audit trail references and cryptographic signatures."
        },
        {
          q: "How do I prepare for a regulatory audit?",
          a: "Preparation checklist:\n1. Go to Audit Trail → verify hash chain integrity\n2. Generate Unified Compliance Report for last 12 months\n3. Export all assessment results (AI Act, GDPR, ESG)\n4. Download Model Registry inventory with risk tags\n5. Compile DSAR fulfillment logs and response times\n6. Review Explainability logs for AI decision rationale\n7. Prepare evidence from connected systems (Connectors)\n8. Verify all audit entries have proper justifications\n\nRegulators commonly request:\n• Proof of continuous compliance monitoring\n• AI model documentation and testing results\n• Data processing records and legal basis\n• Incident response timelines\n• Third-party risk assessments"
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
        "Create your organization account and verify email",
        "Navigate to AI Act Copilot from sidebar",
        "Fill in your AI system details and risk factors",
        "Review automated risk classification results",
        "Check compliance score on main dashboard"
      ]
    },
    {
      title: "Setting Up Connectors",
      description: "Connect your data sources for automated compliance monitoring",
      icon: GitBranch,
      duration: "10 min",
      steps: [
        "Navigate to Connectors from Tools section",
        "Click 'Add Connector' and choose type (AWS, Azure, SharePoint, etc.)",
        "Enter connection credentials and API keys securely",
        "Test connection and validate access",
        "Configure automatic sync frequency (hourly/daily/weekly)",
        "Monitor connector status in dashboard"
      ]
    },
    {
      title: "DSAR Workflow",
      description: "Handle data subject access requests efficiently under GDPR",
      icon: FileCheck,
      duration: "3 min",
      steps: [
        "Go to DSAR Management from sidebar",
        "Click 'New Request' and enter data subject email",
        "Select request type (Access, Erasure, Rectification, Portability)",
        "Click 'Fulfill Request' to auto-search connected systems",
        "Review compiled personal data results",
        "Download response package and send to requester within 30 days"
      ]
    },
    {
      title: "Model Registry Setup",
      description: "Track all AI models for EU AI Act compliance governance",
      icon: Database,
      duration: "5 min",
      steps: [
        "Open Model Registry from Management section",
        "Click 'Register New Model' button",
        "Enter model details (name, version, provider, purpose)",
        "Assign risk classification tag (minimal/limited/high/unacceptable)",
        "Link to training dataset and documentation",
        "Set compliance status and review schedule",
        "Enable monitoring for production models"
      ]
    },
    {
      title: "NIS2 Incident Reporting",
      description: "Report cybersecurity incidents in compliance with NIS2",
      icon: ShieldCheck,
      duration: "7 min",
      steps: [
        "Go to NIS2 Copilot when incident occurs",
        "Click 'Report Incident' within 24 hours",
        "Document incident type, scope, and impact",
        "Submit preliminary report to authorities",
        "Provide detailed report within 72 hours",
        "Track remediation and follow-up actions"
      ]
    },
    {
      title: "ESG Report Generation",
      description: "Create CSRD-compliant sustainability reports with AI assistance",
      icon: Leaf,
      duration: "15 min",
      steps: [
        "Navigate to ESG Copilot and select reporting period",
        "Input environmental data (CO₂ Scope 1, 2, 3, energy, water, waste)",
        "Add social metrics (diversity, employee wellbeing, training)",
        "Include governance data (board composition, policies, ethics)",
        "Upload supporting evidence documents",
        "Click 'Generate ESRS Report' for AI-powered narrative",
        "Review against double materiality requirements",
        "Export as PDF for stakeholder distribution"
      ]
    }
  ]

  const videoTutorials = [
    {
      title: "Platform Overview & Getting Started",
      description: "Complete walkthrough of Regulix features, navigation, and key capabilities",
      duration: "15:30",
      thumbnail: "overview"
    },
    {
      title: "EU AI Act Compliance Deep Dive",
      description: "Step-by-step guide to AI system risk assessment, Annex IV documentation, and model registry",
      duration: "12:45",
      thumbnail: "ai-act"
    },
    {
      title: "GDPR Automation & DSAR Handling",
      description: "Automate privacy compliance scanning, DSAR fulfillment, and data lineage tracking",
      duration: "10:20",
      thumbnail: "gdpr"
    },
    {
      title: "ESG & CSRD Reporting",
      description: "Create ESRS-compliant sustainability reports with Scope 3 emissions tracking",
      duration: "8:15",
      thumbnail: "esg"
    },
    {
      title: "NIS2 Cybersecurity Compliance",
      description: "Implement NIS2 requirements, incident reporting, and supply chain security",
      duration: "11:05",
      thumbnail: "nis2"
    },
    {
      title: "DORA for Financial Services",
      description: "Digital operational resilience, ICT risk management, and third-party oversight",
      duration: "9:40",
      thumbnail: "dora"
    },
    {
      title: "Connector Integration & Automation",
      description: "Connect AWS, Azure, SharePoint, SAP, and schedule automated compliance scans",
      duration: "13:20",
      thumbnail: "connectors"
    },
    {
      title: "Audit Trail & Explainability",
      description: "Understand hash-chain verification, audit logs, and AI decision transparency",
      duration: "7:50",
      thumbnail: "audit"
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
          {/* Featured Video */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Featured Tutorials</h2>
            <VideoPlayer
              title={videoTutorials[0].title}
              thumbnail={videoTutorials[0].thumbnail}
              className="max-w-4xl mx-auto"
            />
            <div className="mt-4 max-w-4xl mx-auto">
              <p className="text-muted-foreground">{videoTutorials[0].description}</p>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <PlayCircle className="h-3 w-3" />
                  {videoTutorials[0].duration}
                </Badge>
                <span className="text-xs text-muted-foreground">Updated: Nov 2024</span>
              </div>
            </div>
          </div>

          {/* All Tutorials Grid */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">All Tutorials</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {videoTutorials.map((video, idx) => (
                <div key={idx} className="space-y-3">
                  <VideoPlayer
                    title={video.title}
                    thumbnail={video.thumbnail}
                  />
                  <div>
                    <h3 className="font-semibold mb-1">{video.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {video.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {video.duration}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {idx === 0 && "Most Popular"}
                        {idx === 1 && "Trending"}
                        {idx === 2 && "Essential"}
                        {idx === 3 && "New"}
                        {idx > 3 && "Recommended"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Path Suggestion */}
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Recommended Learning Path
              </CardTitle>
              <CardDescription>
                Follow this sequence for comprehensive platform mastery
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { title: "Platform Overview & Getting Started", duration: "15 min", completed: false },
                  { title: "EU AI Act Compliance Deep Dive", duration: "13 min", completed: false },
                  { title: "GDPR Automation & DSAR Handling", duration: "10 min", completed: false },
                  { title: "Connector Integration & Automation", duration: "13 min", completed: false },
                ].map((step, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-semibold shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{step.title}</p>
                      <p className="text-xs text-muted-foreground">{step.duration}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
