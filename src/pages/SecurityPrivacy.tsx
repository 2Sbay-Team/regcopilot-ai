import { Shield, Lock, Server, Users, Eye, CheckCircle, FileCheck, Database } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

export default function SecurityPrivacy() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Security & Privacy</h1>
                <p className="text-sm text-muted-foreground">Enterprise-grade data protection</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate(-1)}>
              Back
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
        {/* Trust Banner */}
        <Alert className="bg-primary/10 border-primary/20">
          <Shield className="h-5 w-5 text-primary" />
          <AlertDescription className="text-base">
            <strong>Bank-Grade Security:</strong> Your data is protected with the same security standards used by financial institutions and healthcare providers.
          </AlertDescription>
        </Alert>

        {/* Key Security Features */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-primary/20">
            <CardHeader>
              <Lock className="h-10 w-10 text-primary mb-2" />
              <CardTitle>End-to-End Encryption</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                All data encrypted in transit (TLS 1.3) and at rest (AES-256). Your files are encrypted before they ever leave your device.
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <Database className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Organization Isolation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Database-level security policies ensure your data is completely isolated from other organizations. Zero shared access.
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <Server className="h-10 w-10 text-primary mb-2" />
              <CardTitle>EU-Based Servers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                All data stored in GDPR-compliant EU data centers (Frankfurt, Germany). Your data never leaves European jurisdiction.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Multi-Tenant Architecture */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              How Multi-Tenancy Works
            </CardTitle>
            <CardDescription>
              Understanding how your organization's data is isolated in our SaaS platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 p-6 rounded-lg space-y-4">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">1</Badge>
                <div>
                  <h3 className="font-semibold mb-1">Organization Creation</h3>
                  <p className="text-sm text-muted-foreground">
                    When your company signs up, we create a unique <strong>Organization ID</strong> (UUID). All your company's data is tagged with this ID.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">2</Badge>
                <div>
                  <h3 className="font-semibold mb-1">Employee Onboarding</h3>
                  <p className="text-sm text-muted-foreground">
                    Employees join via:<br />
                    • <strong>Email invite</strong> from your admin<br />
                    • <strong>Domain matching</strong> (e.g., all @allianz.com users → Allianz organization)<br />
                    • <strong>SSO/Azure AD</strong> (automatic authentication with your company directory)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">3</Badge>
                <div>
                  <h3 className="font-semibold mb-1">File Storage Structure</h3>
                  <p className="text-sm text-muted-foreground">
                    Files stored as: <code className="bg-background px-2 py-1 rounded">organization_id/filename.pdf</code><br />
                    Example: <code className="bg-background px-2 py-1 rounded">a8f3-4b2e-9d1c/insurance_policy.pdf</code>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">4</Badge>
                <div>
                  <h3 className="font-semibold mb-1">Row-Level Security (RLS)</h3>
                  <p className="text-sm text-muted-foreground">
                    Database enforces: Users can <strong>ONLY</strong> query data where <code className="bg-background px-2 py-1 rounded">organization_id = their_org_id</code><br />
                    This is enforced at the PostgreSQL level, not application level.
                  </p>
                </div>
              </div>
            </div>

            <Alert>
              <Eye className="h-4 w-4" />
              <AlertDescription>
                <strong>Zero Cross-Tenant Access:</strong> Even Regulix administrators cannot access your organization's data without explicit audit trail logging.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Data Access Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-6 w-6 text-primary" />
              Who Can Access Your Files?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-600">Your Organization Members</strong>
                  <p className="text-sm text-muted-foreground">Employees in your organization with proper role permissions (admin, analyst, viewer)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-green-600">Audit Trail Logging</strong>
                  <p className="text-sm text-muted-foreground">Every file access is logged with timestamp, user ID, and action type</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-5 w-5 flex items-center justify-center text-destructive font-bold mt-0.5 flex-shrink-0">✕</div>
                <div>
                  <strong className="text-destructive">Other Organizations</strong>
                  <p className="text-sm text-muted-foreground">Database policies prevent any cross-organization queries</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-5 w-5 flex items-center justify-center text-destructive font-bold mt-0.5 flex-shrink-0">✕</div>
                <div>
                  <strong className="text-destructive">Third Parties</strong>
                  <p className="text-sm text-muted-foreground">We never share, sell, or provide access to third parties</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-5 w-5 flex items-center justify-center text-destructive font-bold mt-0.5 flex-shrink-0">✕</div>
                <div>
                  <strong className="text-destructive">Regulix Staff</strong>
                  <p className="text-sm text-muted-foreground">No access without explicit permission & audit trail (e.g., support ticket)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Certifications */}
        <Card>
          <CardHeader>
            <CardTitle>Compliance & Certifications</CardTitle>
            <CardDescription>Industry-standard security & privacy frameworks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <Badge className="mb-2">GDPR</Badge>
                <h3 className="font-semibold mb-1">EU General Data Protection Regulation</h3>
                <p className="text-sm text-muted-foreground">
                  Full compliance with EU data protection laws. Data Processing Agreement (DPA) available.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <Badge className="mb-2">SOC 2 Type II</Badge>
                <h3 className="font-semibold mb-1">Infrastructure Security</h3>
                <p className="text-sm text-muted-foreground">
                  Our infrastructure provider (Supabase) is SOC 2 Type II certified.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <Badge className="mb-2">ISO 27001</Badge>
                <h3 className="font-semibold mb-1">Information Security Management</h3>
                <p className="text-sm text-muted-foreground">
                  Infrastructure certified under ISO 27001 for information security.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <Badge className="mb-2">EU AI Act Ready</Badge>
                <h3 className="font-semibold mb-1">AI Governance</h3>
                <p className="text-sm text-muted-foreground">
                  Platform designed to help you comply with EU AI Act requirements.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Security Details */}
        <Card>
          <CardHeader>
            <CardTitle>Technical Security Specifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Encryption</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• TLS 1.3 for data in transit</li>
                  <li>• AES-256 for data at rest</li>
                  <li>• SHA-256 hash-chained audit logs</li>
                  <li>• Encrypted database backups</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Access Control</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Role-Based Access Control (RBAC)</li>
                  <li>• JWT token authentication</li>
                  <li>• Row-Level Security (RLS) policies</li>
                  <li>• Multi-Factor Authentication (MFA) available</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Infrastructure</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• EU-based data centers (Frankfurt)</li>
                  <li>• Automated daily backups (30-day retention)</li>
                  <li>• 99.9% uptime SLA</li>
                  <li>• DDoS protection & WAF</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Monitoring</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Real-time intrusion detection</li>
                  <li>• Complete audit trail logging</li>
                  <li>• Automated security scanning</li>
                  <li>• 24/7 infrastructure monitoring</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>Questions About Security?</CardTitle>
            <CardDescription>Our security team is here to help</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">
              For security inquiries, audits, or to request our full security documentation:
            </p>
            <div className="flex gap-4">
              <Button variant="default" onClick={() => navigate("/contact-us")}>
                Contact Security Team
              </Button>
              <Button variant="outline" onClick={() => window.open("mailto:security@regulix.com")}>
                security@regulix.com
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
