import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, Shield, Database, FileText, BarChart3, 
  Settings, Users, Bot, Search, Lock, CheckCircle2,
  ArrowRight, Lightbulb, Zap, Target
} from "lucide-react";

const UserGuide = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Platform User Guide</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your complete guide to mastering the Compliance & ESG Copilot platform
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="getting-started" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          {/* Getting Started Tab */}
          <TabsContent value="getting-started" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Quick Start Guide
                </CardTitle>
                <CardDescription>Get up and running in 5 minutes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="flex gap-4 p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">Create Your Account</h3>
                      <p className="text-sm text-muted-foreground">Sign up and complete your organization profile</p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">2</div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">Explore the Dashboard</h3>
                      <p className="text-sm text-muted-foreground">Navigate to <code className="px-1 py-0.5 bg-muted rounded">/dashboard</code> to see your compliance overview</p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">3</div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">Run Your First Assessment</h3>
                      <p className="text-sm text-muted-foreground">Choose AI Act, GDPR, or ESG copilot and complete your first audit</p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">4</div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">Review Results</h3>
                      <p className="text-sm text-muted-foreground">Check your compliance score, audit trail, and generated reports</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Navigation</CardTitle>
                <CardDescription>Understanding the interface</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="sidebar">
                    <AccordionTrigger>Sidebar Navigation</AccordionTrigger>
                    <AccordionContent className="space-y-2">
                      <p>The left sidebar provides quick access to all major features:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        <li><strong>Dashboard</strong> - Overview of compliance status and KPIs</li>
                        <li><strong>Copilots</strong> - AI Act, GDPR, ESG, NIS2, DORA, DMA assessments</li>
                        <li><strong>Data & Audit</strong> - Audit trail, data lineage, DSAR management</li>
                        <li><strong>AI Governance</strong> - Model registry, AI gateway, usage tracking</li>
                        <li><strong>Intelligence</strong> - RAG search, feedback analytics, sentiment analysis</li>
                        <li><strong>Admin</strong> - User management, connectors, scheduled jobs</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="top-bar">
                    <AccordionTrigger>Top Navigation Bar</AccordionTrigger>
                    <AccordionContent className="space-y-2">
                      <p>The top bar contains global actions:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        <li><strong>Theme Toggle</strong> - Switch between light and dark mode</li>
                        <li><strong>Language Selector</strong> - Change interface language</li>
                        <li><strong>User Menu</strong> - Profile settings, MFA setup, logout</li>
                        <li><strong>Notifications</strong> - System alerts and updates</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="breadcrumbs">
                    <AccordionTrigger>Breadcrumb Navigation</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground">
                        Follow the breadcrumb trail at the top of each page to understand where you are in the platform hierarchy and quickly navigate back to parent sections.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* AI Copilots */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    AI Copilots
                  </CardTitle>
                  <CardDescription>Automated compliance assessments</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">AI Act Auditor</p>
                        <p className="text-sm text-muted-foreground">Classify AI systems by risk level and generate Annex IV documentation</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Lock className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">GDPR Checker</p>
                        <p className="text-sm text-muted-foreground">Scan documents for PII, manage DSARs, and ensure data privacy compliance</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Target className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">ESG Reporter</p>
                        <p className="text-sm text-muted-foreground">Calculate sustainability metrics and draft CSRD/ESRS reports</p>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="mt-4">
                    <ArrowRight className="h-3 w-3 mr-1" />
                    Go to any Copilot page to start an assessment
                  </Badge>
                </CardContent>
              </Card>

              {/* Audit & Compliance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Audit & Compliance
                  </CardTitle>
                  <CardDescription>Track and verify all activities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Audit Trail</p>
                        <p className="text-sm text-muted-foreground">Immutable, hash-chained log of all copilot actions and decisions</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Audit Chain Verification</p>
                        <p className="text-sm text-muted-foreground">Verify cryptographic integrity of audit logs</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Compliance Score</p>
                        <p className="text-sm text-muted-foreground">Real-time scoring across AI Act, GDPR, and ESG frameworks</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Data Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    Data Management
                  </CardTitle>
                  <CardDescription>Control and protect your data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <ArrowRight className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Data Lineage</p>
                        <p className="text-sm text-muted-foreground">Visualize data flow from source to AI model to report</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <ArrowRight className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">DSAR Queue</p>
                        <p className="text-sm text-muted-foreground">Manage data subject access requests with automated workflows</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <ArrowRight className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">PII Redaction</p>
                        <p className="text-sm text-muted-foreground">Automatically detect and redact sensitive personal information</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Analytics & Intelligence */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Analytics & Intelligence
                  </CardTitle>
                  <CardDescription>Insights from your data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Search className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">RAG Search</p>
                        <p className="text-sm text-muted-foreground">Query regulatory documents with AI-powered semantic search</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <BarChart3 className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Feedback Analytics</p>
                        <p className="text-sm text-muted-foreground">Track user feedback to improve RAG accuracy over time</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Lightbulb className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Continuous Intelligence</p>
                        <p className="text-sm text-muted-foreground">Real-time monitoring and automated compliance scoring</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Workflows Tab */}
          <TabsContent value="workflows" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Common Workflows</CardTitle>
                <CardDescription>Step-by-step guides for typical tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="workflow-1">
                    <AccordionTrigger>How to Perform an AI Act Risk Assessment</AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li>Navigate to <strong>AI Act Copilot</strong> from the sidebar</li>
                        <li>Click <strong>New Assessment</strong> button</li>
                        <li>Fill in AI system details:
                          <ul className="list-disc list-inside ml-6 mt-1 text-muted-foreground">
                            <li>System name and description</li>
                            <li>Intended purpose and use case</li>
                            <li>High-risk category (if applicable)</li>
                          </ul>
                        </li>
                        <li>Click <strong>Analyze with AI</strong> to get risk classification</li>
                        <li>Review the generated risk category and reasoning</li>
                        <li>Generate <strong>Annex IV Report</strong> for documentation</li>
                        <li>View audit trail entry for transparency</li>
                      </ol>
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <p className="text-sm"><strong>Tip:</strong> Save assessments as drafts if you need to gather more information before finalizing.</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="workflow-2">
                    <AccordionTrigger>How to Process a GDPR Data Subject Request</AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li>Go to <strong>DSAR Queue</strong> in the sidebar</li>
                        <li>View pending requests or click <strong>New Request</strong></li>
                        <li>Enter data subject email address</li>
                        <li>Select request type:
                          <ul className="list-disc list-inside ml-6 mt-1 text-muted-foreground">
                            <li><strong>Access</strong> - Export all personal data</li>
                            <li><strong>Deletion</strong> - Remove all personal data</li>
                            <li><strong>Rectification</strong> - Update incorrect data</li>
                          </ul>
                        </li>
                        <li>Click <strong>Process Request</strong> to execute</li>
                        <li>System automatically aggregates or deletes data</li>
                        <li>Download generated report for the data subject</li>
                        <li>Mark request as <strong>Completed</strong></li>
                      </ol>
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <p className="text-sm"><strong>Note:</strong> All DSAR processing is logged in the audit trail for compliance verification.</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="workflow-3">
                    <AccordionTrigger>How to Generate an ESG Report</AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li>Navigate to <strong>ESG Copilot</strong></li>
                        <li>Upload sustainability data:
                          <ul className="list-disc list-inside ml-6 mt-1 text-muted-foreground">
                            <li>CSV files with emissions data</li>
                            <li>Energy consumption metrics</li>
                            <li>Diversity and workforce data</li>
                          </ul>
                        </li>
                        <li>Or enter metrics manually in the form</li>
                        <li>Click <strong>Calculate ESG Score</strong></li>
                        <li>Review calculated metrics and KPIs</li>
                        <li>Click <strong>Generate CSRD Report</strong></li>
                        <li>AI drafts narrative based on your data</li>
                        <li>Download PDF report with transparency watermark</li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="workflow-4">
                    <AccordionTrigger>How to Search Regulatory Documents (RAG)</AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li>Go to <strong>RAG Search</strong> from the sidebar</li>
                        <li>Enter your question in natural language, e.g.:
                          <ul className="list-disc list-inside ml-6 mt-1 text-muted-foreground">
                            <li>"What are the high-risk AI system categories?"</li>
                            <li>"GDPR requirements for data retention"</li>
                            <li>"ESRS disclosure requirements for Scope 3 emissions"</li>
                          </ul>
                        </li>
                        <li>Click <strong>Search</strong> to query the knowledge base</li>
                        <li>Review AI-generated answer with source citations</li>
                        <li>Click on source references to view original regulation text</li>
                        <li>Provide feedback (thumbs up/down) to improve accuracy</li>
                        <li>Save useful queries for future reference</li>
                      </ol>
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <p className="text-sm"><strong>Tip:</strong> Your feedback is used to retrain the RAG system and improve future results.</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="workflow-5">
                    <AccordionTrigger>How to Set Up Data Connectors</AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li>Navigate to <strong>Connectors</strong> in admin section</li>
                        <li>Click <strong>Add Connector</strong></li>
                        <li>Choose connector type:
                          <ul className="list-disc list-inside ml-6 mt-1 text-muted-foreground">
                            <li>Azure Blob Storage</li>
                            <li>AWS S3</li>
                            <li>Google Drive</li>
                            <li>SharePoint / OneDrive</li>
                            <li>SAP / JIRA</li>
                          </ul>
                        </li>
                        <li>Enter connection credentials (API keys, tokens)</li>
                        <li>Click <strong>Validate</strong> to test connection</li>
                        <li>Configure sync schedule (hourly, daily, weekly)</li>
                        <li>Enable <strong>Auto-analysis</strong> to queue GDPR/ESG scans</li>
                        <li>Click <strong>Save</strong> to activate connector</li>
                      </ol>
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <p className="text-sm"><strong>Security:</strong> All credentials are encrypted and stored securely. Only authorized users can view or modify connectors.</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    AI Model Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">Control which AI models power your copilots:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Configure models at <strong>Model Management</strong></li>
                    <li>Switch between Gemini, GPT-5, and Mistral</li>
                    <li>Set budget limits per model</li>
                    <li>Monitor token usage and costs</li>
                    <li>View usage analytics at <strong>Usage</strong> page</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    User Roles & Permissions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">Platform supports role-based access control:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li><strong>Admin</strong> - Full system access, user management</li>
                    <li><strong>Analyst</strong> - Run assessments, view reports</li>
                    <li><strong>Auditor</strong> - Read-only audit trail access</li>
                    <li><strong>Viewer</strong> - Dashboard and report viewing only</li>
                  </ul>
                  <p className="text-sm mt-2">Manage roles at <strong>Admin → Settings</strong></p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span><strong>Multi-Factor Authentication (MFA)</strong> - Set up at <code>/mfa-setup</code></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span><strong>Password Leak Detection</strong> - Automatic scanning against breach databases</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span><strong>Audit Logging</strong> - Every action tracked with timestamps and user IDs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span><strong>Data Encryption</strong> - All sensitive data encrypted at rest and in transit</span>
                    </li>
                  </ul>
                  <p className="text-sm mt-3">View security overview at <strong>Security Center</strong></p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>API & Integrations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">Extend platform capabilities:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li><strong>AI Gateway</strong> - Unified API for all AI models</li>
                    <li><strong>Webhooks</strong> - Real-time notifications for events</li>
                    <li><strong>Data Connectors</strong> - Sync with external systems</li>
                    <li><strong>Custom Prompts</strong> - Define reusable prompt templates</li>
                    <li><strong>Scheduled Jobs</strong> - Automate recurring tasks</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Troubleshooting & Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Accordion type="single" collapsible>
                  <AccordionItem value="faq-1">
                    <AccordionTrigger>Why is my assessment taking so long?</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      Large documents or complex analyses may take 30-60 seconds. Check the <strong>Agent Tasks</strong> page to monitor progress. If a task is stuck, you can cancel and retry.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="faq-2">
                    <AccordionTrigger>How do I export my audit trail?</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      Go to <strong>Audit Trail</strong>, use the date range filter, and click the <strong>Export CSV</strong> button. For cryptographic verification, use <strong>Audit Chain Verify</strong>.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="faq-3">
                    <AccordionTrigger>Can I customize the AI copilot prompts?</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      Yes! Navigate to <strong>Prompts</strong> in the admin section to view and edit prompt templates for each copilot. Changes apply to all future assessments.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="faq-4">
                    <AccordionTrigger>What data is stored and where?</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      All data is stored in a secure, encrypted database. Personal data is subject to GDPR protections. View data lineage at <strong>Data Lineage</strong> page. Configure retention policies at <strong>Admin → Settings</strong>.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    Need More Help?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Visit <strong>Admin → Help</strong> for detailed documentation, video tutorials, and contact support options.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserGuide;
