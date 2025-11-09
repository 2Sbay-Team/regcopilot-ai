import { useState } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { 
  Search, Book, Users, Code, ShieldCheck, FileText, 
  HelpCircle, Lightbulb, AlertCircle, CheckCircle,
  MessageSquare, Rocket, Settings
} from "lucide-react"

interface HelpArticle {
  id: string
  title: string
  content: string
  category: 'business' | 'admin' | 'developer' | 'auditor'
  tags: string[]
}

export default function HelpCenter() {
  const { language } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<string>("all")

  const helpArticles: HelpArticle[] = [
    // Business User Articles
    {
      id: "bu-001",
      title: "AI Act Compliance Basics",
      content: "Learn how to classify AI systems and understand your obligations under the EU AI Act. This guide covers risk categories, documentation requirements, and compliance workflows.",
      category: "business",
      tags: ["ai-act", "compliance", "getting-started"]
    },
    {
      id: "bu-002",
      title: "GDPR Privacy Scanner",
      content: "Use the GDPR Checker to scan documents for personal data, identify privacy risks, and generate compliance reports. Includes automated PII detection and remediation guidance.",
      category: "business",
      tags: ["gdpr", "privacy", "scanning"]
    },
    {
      id: "bu-003",
      title: "ESG Reporting Guide",
      content: "Complete guide to CSRD/ESRS sustainability reporting. Enter environmental, social, and governance metrics to generate compliant reports with AI-powered narratives.",
      category: "business",
      tags: ["esg", "sustainability", "reporting"]
    },
    {
      id: "bu-004",
      title: "Generate Compliance Reports",
      content: "Learn how to generate, customize, and export compliance reports for AI Act, GDPR, and ESG regulations. Includes PDF export, Word templates, and regulatory submission formats.",
      category: "business",
      tags: ["reports", "export", "compliance"]
    },
    {
      id: "bu-005",
      title: "Configure Data Connectors",
      content: "Connect your data sources (SharePoint, AWS, Jira) for automated compliance monitoring. This guide covers authentication, sync schedules, and troubleshooting.",
      category: "business",
      tags: ["connectors", "integration", "data"]
    },
    // Admin Articles
    {
      id: "ad-001",
      title: "Organization Setup",
      content: "Set up your organization including tenant configuration, user roles, and compliance settings. Configure SSO, domain verification, and security policies.",
      category: "admin",
      tags: ["setup", "configuration", "organization"]
    },
    {
      id: "ad-002",
      title: "Team Management",
      content: "Invite team members, assign roles, and manage permissions. Configure domain-based auto-join for enterprise SSO and track user activity.",
      category: "admin",
      tags: ["team", "users", "permissions"]
    },
    {
      id: "ad-003",
      title: "Domain Verification",
      content: "Verify your company domain to enable automatic team member onboarding and enterprise SSO. Includes DNS configuration and troubleshooting steps.",
      category: "admin",
      tags: ["domain", "sso", "verification"]
    },
    {
      id: "ad-004",
      title: "Billing & Quotas",
      content: "Manage your subscription, monitor token usage, and configure billing alerts. Understand pricing tiers and usage-based costs for AI features.",
      category: "admin",
      tags: ["billing", "quotas", "usage"]
    },
    {
      id: "ad-005",
      title: "Audit Trail Exports",
      content: "Export audit logs for regulatory compliance and internal reviews. Generate reports showing all compliance activities with cryptographic verification.",
      category: "admin",
      tags: ["audit", "export", "compliance"]
    },
    // Developer Articles
    {
      id: "dv-001",
      title: "API Overview",
      content: "Complete REST API reference for integrating RegSense Advisor with your applications. Includes authentication, rate limits, and example requests.",
      category: "developer",
      tags: ["api", "integration", "rest"]
    },
    {
      id: "dv-002",
      title: "Partner API Integration",
      content: "Build integrations using the Partner API. Generate API keys, authenticate requests, and access compliance data programmatically.",
      category: "developer",
      tags: ["api", "partner", "authentication"]
    },
    {
      id: "dv-003",
      title: "Build Custom Connectors",
      content: "Develop custom data source connectors for proprietary systems. Includes connector SDK, authentication patterns, and deployment guide.",
      category: "developer",
      tags: ["connectors", "development", "integration"]
    },
    {
      id: "dv-004",
      title: "RAG Document Updates",
      content: "Upload and update regulatory documents in the RAG system. Configure document processing, chunking strategies, and semantic search.",
      category: "developer",
      tags: ["rag", "documents", "ai"]
    },
    {
      id: "dv-005",
      title: "Webhook Configuration",
      content: "Set up webhooks to receive real-time notifications for compliance events. Includes event types, payload formats, and security best practices.",
      category: "developer",
      tags: ["webhooks", "events", "integration"]
    },
    // Auditor Articles
    {
      id: "au-001",
      title: "Review Conformity Reports",
      content: "Guide to reviewing AI Act conformity reports and Annex IV documentation. Verify completeness, accuracy, and regulatory compliance.",
      category: "auditor",
      tags: ["conformity", "reports", "ai-act"]
    },
    {
      id: "au-002",
      title: "Digital Sign-off Process",
      content: "Digitally sign and approve compliance assessments. Understand the cryptographic signing process and legal validity of digital signatures.",
      category: "auditor",
      tags: ["signoff", "verification", "audit"]
    },
    {
      id: "au-003",
      title: "Audit Chain Verification",
      content: "Verify the integrity of the audit trail using cryptographic hash chains. Detect tampering and ensure compliance record authenticity.",
      category: "auditor",
      tags: ["audit-chain", "verification", "integrity"]
    },
    {
      id: "au-004",
      title: "Evidence Collection & Review",
      content: "Collect and review evidence for compliance assessments. Link documents to specific compliance requirements and track evidence provenance.",
      category: "auditor",
      tags: ["evidence", "review", "compliance"]
    },
  ]

  const faqItems = [
    {
      question: "What is RegSense Advisor and how does it help with compliance?",
      answer: "RegSense Advisor is a comprehensive RegTech platform that automates compliance for EU AI Act, GDPR, and ESG/CSRD. It provides AI-powered copilots for risk assessment, document scanning, and report generation—all with built-in audit trails and multi-language support."
    },
    {
      question: "How secure is my data in RegSense Advisor?",
      answer: "All data is encrypted at rest (AES-256) and in transit (TLS 1.3). We use Row-Level Security (RLS) to ensure complete tenant isolation. Each organization's data is accessible only to authorized users within that organization. We are SOC 2 Type II compliant."
    },
    {
      question: "How does multi-tenancy work?",
      answer: "Each organization gets a unique organization ID. All data queries are automatically filtered by organization_id using RLS policies. Users can only access data within their own organization. Files are stored with organization-scoped paths to prevent cross-tenant access."
    },
    {
      question: "What are the data retention policies?",
      answer: "Audit logs: 12 months default, configurable up to 7 years. Compliance reports: Indefinite retention. User data: As per your organization's policy. Documents: 90 days in trash before permanent deletion. You can configure custom retention policies per data type."
    },
    {
      question: "Which AI models does RegSense Advisor use?",
      answer: "We support multiple AI providers: OpenAI (GPT-4, GPT-3.5), Google (Gemini Pro), Anthropic (Claude), and Mistral. Organizations can choose their preferred models or bring their own keys (BYOK) for full control over AI provider and costs."
    },
    {
      question: "How do I export my data?",
      answer: "Navigate to Reports → Export. You can export compliance assessments, audit logs, and reports in multiple formats: PDF (for regulators), CSV (for analysis), JSON (for system integration), and Word (for editing). Bulk exports available for admins."
    },
    {
      question: "How do I set up SSO with Azure AD?",
      answer: "Go to Admin → Team Management → Domain Verification. Add your company domain and complete DNS verification. Then configure Azure AD SSO with your tenant ID and client ID. Once verified, users with your domain automatically join your organization."
    },
    {
      question: "What are the pricing plans?",
      answer: "We offer Free (30 credits/month), Pro (starting at 100 credits/month), Business (team features + SSO), and Enterprise (custom limits + SLA). Pricing is usage-based for AI features. Contact sales for Enterprise pricing."
    },
  ]

  const troubleshootingItems = [
    {
      issue: "Document upload fails",
      solution: "Check file size (max 50MB) and format (PDF, DOCX, TXT supported). Ensure you have storage quota available. Try compressing large PDFs. If issues persist, check your network connection and firewall settings.",
      category: "technical"
    },
    {
      issue: "Report not generating",
      solution: "Verify all required fields are filled. Check that you have sufficient token quota. Review console logs for errors. Try regenerating with a smaller dataset. If using custom templates, verify template syntax.",
      category: "technical"
    },
    {
      issue: "Connector sync failing",
      solution: "Verify credentials are correct and not expired. Check that the data source is accessible from our servers. Review connector logs for specific error messages. Ensure required API permissions are granted. Test connection in connector settings.",
      category: "integration"
    },
    {
      issue: "Access denied error",
      solution: "Contact your organization admin to verify your role and permissions. Check if your account is active. If using SSO, ensure your email domain is verified. Clear browser cache and cookies, then log in again.",
      category: "permissions"
    },
    {
      issue: "Slow performance",
      solution: "Clear browser cache. Check your internet connection speed. If processing large documents, expect longer wait times. Try during off-peak hours. Contact support if issues persist—we may need to scale your instance.",
      category: "performance"
    },
  ]

  const filteredArticles = helpArticles.filter(article => {
    const matchesSearch = searchQuery === "" || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = activeCategory === "all" || article.category === activeCategory

    return matchesSearch && matchesCategory
  })

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <HelpCircle className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold">Help Center</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Find answers, guides, and resources to help you succeed with RegSense Advisor
        </p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search help articles, FAQs, and guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-lg h-12"
              aria-label="Search help center"
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="guides" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="guides" className="flex items-center gap-2">
            <Book className="h-4 w-4" />
            Guides
          </TabsTrigger>
          <TabsTrigger value="faq" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            FAQ
          </TabsTrigger>
          <TabsTrigger value="troubleshoot" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Troubleshooting
          </TabsTrigger>
        </TabsList>

        {/* Guides Tab */}
        <TabsContent value="guides" className="space-y-6">
          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={activeCategory === "all" ? "default" : "outline"}
              onClick={() => setActiveCategory("all")}
              size="sm"
            >
              All Categories
            </Button>
            <Button
              variant={activeCategory === "business" ? "default" : "outline"}
              onClick={() => setActiveCategory("business")}
              size="sm"
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              Business Users
            </Button>
            <Button
              variant={activeCategory === "admin" ? "default" : "outline"}
              onClick={() => setActiveCategory("admin")}
              size="sm"
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              Administrators
            </Button>
            <Button
              variant={activeCategory === "developer" ? "default" : "outline"}
              onClick={() => setActiveCategory("developer")}
              size="sm"
              className="gap-2"
            >
              <Code className="h-4 w-4" />
              Developers
            </Button>
            <Button
              variant={activeCategory === "auditor" ? "default" : "outline"}
              onClick={() => setActiveCategory("auditor")}
              size="sm"
              className="gap-2"
            >
              <ShieldCheck className="h-4 w-4" />
              Auditors
            </Button>
          </div>

          {/* Articles Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {filteredArticles.map((article) => (
              <Card key={article.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{article.title}</CardTitle>
                    <Badge variant="secondary">
                      {article.category === 'business' && <Users className="h-3 w-3 mr-1" />}
                      {article.category === 'admin' && <Settings className="h-3 w-3 mr-1" />}
                      {article.category === 'developer' && <Code className="h-3 w-3 mr-1" />}
                      {article.category === 'auditor' && <ShieldCheck className="h-3 w-3 mr-1" />}
                      {article.category}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-3">
                    {article.content}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {article.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No articles found matching your search</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>Quick answers to common questions</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, index) => (
                  <AccordionItem key={index} value={`faq-${index}`}>
                    <AccordionTrigger className="text-left">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Troubleshooting Tab */}
        <TabsContent value="troubleshoot" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Common Issues & Solutions
              </CardTitle>
              <CardDescription>Step-by-step solutions to common problems</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {troubleshootingItems.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.issue}</h4>
                      <Badge variant="outline" className="mt-1">{item.category}</Badge>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 ml-7">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">{item.solution}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Still Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Contact Support
                </Button>
                <Button variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" />
                  View Documentation
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Start Guide */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Quick Start Guide
          </CardTitle>
          <CardDescription>Get up and running in minutes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                1
              </div>
              <h4 className="font-semibold">Set Up Your Organization</h4>
              <p className="text-sm text-muted-foreground">
                Configure organization details, invite team members, and verify your domain for SSO
              </p>
            </div>
            <div className="space-y-2">
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                2
              </div>
              <h4 className="font-semibold">Connect Your Data</h4>
              <p className="text-sm text-muted-foreground">
                Configure connectors to your data sources for automated compliance monitoring
              </p>
            </div>
            <div className="space-y-2">
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                3
              </div>
              <h4 className="font-semibold">Run Assessments</h4>
              <p className="text-sm text-muted-foreground">
                Use AI Act, GDPR, and ESG copilots to generate compliance reports
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
