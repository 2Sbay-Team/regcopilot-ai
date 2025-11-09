import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, Users, Settings, BarChart, Shield, FileText, 
  CheckCircle, AlertCircle, Info, ArrowRight 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function AdminGuide() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-6xl">
      <div>
        <h1 className="text-4xl font-bold mb-2">Admin Onboarding Guide</h1>
        <p className="text-muted-foreground text-lg">
          Complete guide to managing the Compliance & ESG Copilot platform
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          This guide covers all administrative functions. Use the tabs below to navigate through different topics.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="regulations">Regulations</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Admin Role & Responsibilities
              </CardTitle>
              <CardDescription>
                What you can do as an administrator
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Upload className="h-4 w-4 text-primary" />
                    Regulation Management
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Upload and manage official regulatory documents (EU AI Act, GDPR, CSRD) 
                    to power the RAG knowledge base
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    User Administration
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Assign roles, manage permissions, and oversee user accounts 
                    across your organization
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <BarChart className="h-4 w-4 text-primary" />
                    Compliance Monitoring
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Track compliance scores, review assessments, and generate 
                    organization-wide reports
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Settings className="h-4 w-4 text-primary" />
                    System Configuration
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Configure organization settings, billing plans, and 
                    automated compliance workflows
                  </p>
                </div>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-900">
                  <strong>Security Note:</strong> Admin actions are logged in the audit trail 
                  for security and compliance purposes.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Start Checklist</CardTitle>
              <CardDescription>Essential first steps for new admins</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold">1. Upload Regulatory Documents</h4>
                    <p className="text-sm text-muted-foreground">
                      Start by uploading official PDFs (EU AI Act, GDPR, CSRD) to enable 
                      accurate compliance assessments
                    </p>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto mt-1"
                      onClick={() => navigate('/admin/regulations')}
                    >
                      Go to Regulation Uploader <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold">2. Review User Roles</h4>
                    <p className="text-sm text-muted-foreground">
                      Verify user access levels and assign appropriate roles 
                      (admin, analyst, viewer)
                    </p>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto mt-1"
                      onClick={() => navigate('/admin')}
                    >
                      Go to User Management <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold">3. Configure Organization Settings</h4>
                    <p className="text-sm text-muted-foreground">
                      Set up organization details, billing plan, and compliance preferences
                    </p>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto mt-1"
                      onClick={() => navigate('/settings')}
                    >
                      Go to Settings <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold">4. Run Initial Assessments</h4>
                    <p className="text-sm text-muted-foreground">
                      Test the copilots by running sample AI Act, GDPR, and ESG assessments
                    </p>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto mt-1"
                      onClick={() => navigate('/dashboard')}
                    >
                      Go to Dashboard <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Regulations Tab */}
        <TabsContent value="regulations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Uploading Regulatory Documents
              </CardTitle>
              <CardDescription>
                How to populate the RAG knowledge base with official regulations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-900">
                  <strong>Important:</strong> Only upload official regulatory documents from 
                  trusted sources (EUR-Lex, official government sites). The RAG system uses 
                  these as the source of truth for compliance assessments.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Step-by-Step Guide</h3>
                
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <Badge variant="secondary" className="h-6 w-6 flex items-center justify-center p-0">1</Badge>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">Access the Regulation Uploader</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Navigate to <code className="bg-muted px-1 py-0.5 rounded">/admin/regulations</code> or 
                        click the "Regulation Uploader" card in the Admin panel
                      </p>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate('/admin/regulations')}
                      >
                        Open Regulation Uploader
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Badge variant="secondary" className="h-6 w-6 flex items-center justify-center p-0">2</Badge>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">Select Regulation Type</h4>
                      <p className="text-sm text-muted-foreground">
                        Choose from: EU AI Act, GDPR, CSRD/ESRS, NIS2, DMA, or DORA
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Badge variant="secondary" className="h-6 w-6 flex items-center justify-center p-0">3</Badge>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">Enter Version/Date</h4>
                      <p className="text-sm text-muted-foreground">
                        Use the publication date (e.g., "2024-06-13") or version number (e.g., "v1.0")
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Badge variant="secondary" className="h-6 w-6 flex items-center justify-center p-0">4</Badge>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">Upload PDF</h4>
                      <p className="text-sm text-muted-foreground">
                        Select the official PDF file (max 20MB). The system will automatically parse, 
                        chunk, and generate embeddings
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Badge variant="secondary" className="h-6 w-6 flex items-center justify-center p-0">5</Badge>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">Wait for Processing</h4>
                      <p className="text-sm text-muted-foreground">
                        Processing typically takes 2-5 minutes. The status will update to "Active" 
                        when complete. You can monitor progress in the "Uploaded Regulations" section
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Where to Find Official Documents</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <FileText className="h-4 w-4 mt-0.5 text-primary" />
                      <div>
                        <strong>EU AI Act:</strong>{" "}
                        <a 
                          href="https://eur-lex.europa.eu/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          EUR-Lex Official Journal
                        </a>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <FileText className="h-4 w-4 mt-0.5 text-primary" />
                      <div>
                        <strong>GDPR:</strong>{" "}
                        <a 
                          href="https://gdpr-info.eu/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          GDPR-info.eu
                        </a>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <FileText className="h-4 w-4 mt-0.5 text-primary" />
                      <div>
                        <strong>CSRD/ESRS:</strong>{" "}
                        <a 
                          href="https://finance.ec.europa.eu/capital-markets-union-and-financial-markets/company-reporting-and-auditing/company-reporting/corporate-sustainability-reporting_en" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          European Commission
                        </a>
                      </div>
                    </li>
                  </ul>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>How RAG Works:</strong> Once uploaded, documents are chunked by 
                    articles/sections, converted to vector embeddings, and stored in the database. 
                    When users run assessments, the system retrieves relevant chunks as context 
                    for AI-powered analysis.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User & Role Management
              </CardTitle>
              <CardDescription>
                Managing user access and permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Role Hierarchy</h3>
                
                <div className="grid gap-3">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge>Admin</Badge>
                      <span className="text-xs text-muted-foreground">Highest Access</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Full system access: manage users, upload regulations, configure settings, 
                      view all data, generate reports
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">Analyst</Badge>
                      <span className="text-xs text-muted-foreground">Standard Access</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Run assessments, view reports, access copilots, manage own organization's data
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">Viewer</Badge>
                      <span className="text-xs text-muted-foreground">Read-Only</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      View-only access to reports, dashboards, and assessment results. 
                      Cannot run new assessments or modify data
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold">Assigning Roles</h3>
                
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <Badge variant="secondary" className="h-6 w-6 flex items-center justify-center p-0">1</Badge>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">Navigate to Admin Panel</h4>
                      <p className="text-sm text-muted-foreground">
                        Go to <code className="bg-muted px-1 py-0.5 rounded">/admin</code>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Badge variant="secondary" className="h-6 w-6 flex items-center justify-center p-0">2</Badge>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">Find the User</h4>
                      <p className="text-sm text-muted-foreground">
                        Locate the user in the "User Management" table
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Badge variant="secondary" className="h-6 w-6 flex items-center justify-center p-0">3</Badge>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">Change Role</h4>
                      <p className="text-sm text-muted-foreground">
                        Use the dropdown in the "Change Role" column to select the new role. 
                        Changes take effect immediately
                      </p>
                    </div>
                  </div>
                </div>

                <Alert className="bg-amber-50 border-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-900">
                    <strong>Note:</strong> You cannot change your own role. 
                    Another admin must modify your permissions.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                Understanding Compliance Scores
              </CardTitle>
              <CardDescription>
                How to interpret and act on compliance metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Score Breakdown</h3>
                
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Overall Compliance Score</h4>
                      <Badge>0-100</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Weighted average of all compliance domains. Calculated daily based on 
                      the latest assessment data.
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="text-center p-2 bg-red-50 rounded">
                        <div className="font-semibold text-red-700">0-60</div>
                        <div className="text-xs text-red-600">Critical</div>
                      </div>
                      <div className="text-center p-2 bg-amber-50 rounded">
                        <div className="font-semibold text-amber-700">61-80</div>
                        <div className="text-xs text-amber-600">Needs Work</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="font-semibold text-green-700">81-100</div>
                        <div className="text-xs text-green-600">Compliant</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">AI Act Score</h4>
                    <p className="text-sm text-muted-foreground">
                      Based on: Risk classification accuracy, Annex IV documentation completeness, 
                      conformity assessment status
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">GDPR Score</h4>
                    <p className="text-sm text-muted-foreground">
                      Based on: Data protection measures, consent management, DSAR response time, 
                      privacy policy completeness
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">ESG Score</h4>
                    <p className="text-sm text-muted-foreground">
                      Based on: Metrics coverage (Environmental, Social, Governance), 
                      data verification status, reporting completeness
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <h3 className="text-lg font-semibold">Taking Action on Scores</h3>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Review Recommendations</h4>
                      <p className="text-sm text-muted-foreground">
                        Each assessment includes AI-generated recommendations. 
                        Review these in the Explainability view
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Generate Reports</h4>
                      <p className="text-sm text-muted-foreground">
                        Use the Reports page to generate compliance reports for stakeholders, 
                        auditors, or regulators
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Track Progress</h4>
                      <p className="text-sm text-muted-foreground">
                        Monitor score trends over time in the Analytics dashboard to 
                        measure improvement
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Configuration
              </CardTitle>
              <CardDescription>
                Configuring organization and system settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Organization Settings</h3>
                
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Basic Information</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Update organization name, country, and contact details in Settings
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigate('/settings')}
                    >
                      Go to Settings
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Billing & Plan</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      View current plan, token usage, and billing history. Upgrade or 
                      downgrade as needed
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigate('/usage')}
                    >
                      View Usage & Billing
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Automated Reports</h4>
                    <p className="text-sm text-muted-foreground">
                      Configure scheduled compliance reports (monthly, quarterly, annual). 
                      Available in Admin panel
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <h3 className="text-lg font-semibold">Security & Audit</h3>
                
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Audit Trail</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      All admin actions are logged with hash-chain verification. 
                      View audit logs at <code className="bg-muted px-1 py-0.5 rounded">/audit</code>
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigate('/audit')}
                    >
                      View Audit Trail
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Multi-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">
                      Enable MFA for enhanced account security. Configurable per user in Settings
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Data Retention</h4>
                    <p className="text-sm text-muted-foreground">
                      Configure automatic data retention policies (default: 12 months for audit logs). 
                      Managed in Admin panel
                    </p>
                  </div>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Need Help?</strong> Visit the Help Center at{" "}
                  <code className="bg-muted px-1 py-0.5 rounded">/help</code> or 
                  contact support for advanced configuration assistance.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle>Additional Resources</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => navigate('/help')}
          >
            <FileText className="h-4 w-4 mr-2" />
            Help Center
          </Button>
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => navigate('/user-guide')}
          >
            <FileText className="h-4 w-4 mr-2" />
            User Guide
          </Button>
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => navigate('/admin')}
          >
            <Shield className="h-4 w-4 mr-2" />
            Admin Panel
          </Button>
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => navigate('/audit')}
          >
            <FileText className="h-4 w-4 mr-2" />
            Audit Trail
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}