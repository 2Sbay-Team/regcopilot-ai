import { useNavigate } from "react-router-dom"
import { useLanguage } from "@/contexts/LanguageContext"
import { t } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Footer } from "@/components/Footer"
import { Shield, Lock, Server, FileCheck, Download, CheckCircle, Globe, Award, Eye, Zap } from "lucide-react"
import { Progress } from "@/components/ui/progress"

const TrustCenter = () => {
  const navigate = useNavigate()
  const { language } = useLanguage()

  const certifications = [
    { name: 'SOC 2 Type II', status: 'Certified', year: '2024', icon: Award },
    { name: 'ISO 27001:2022', status: 'Certified', year: '2024', icon: Shield },
    { name: 'GDPR Compliant', status: 'Active', year: 'Ongoing', icon: CheckCircle },
    { name: 'EU AI Act Ready', status: 'Compliant', year: '2024', icon: CheckCircle }
  ]

  const securityMeasures = [
    { title: 'Encryption at Rest', detail: 'AES-256', icon: Lock },
    { title: 'Encryption in Transit', detail: 'TLS 1.3', icon: Lock },
    { title: 'Data Centers', detail: 'EU-Based (Frankfurt)', icon: Server },
    { title: 'Backup Frequency', detail: 'Continuous + Daily', icon: Server },
    { title: 'Access Control', detail: 'RBAC + MFA', icon: Shield },
    { title: 'Penetration Testing', detail: 'Quarterly', icon: Eye }
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">RegSense Advisor</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/products")}>
              Products
            </Button>
            <Button variant="outline" onClick={() => navigate("/login")}>
              {t('landing.hero.signIn', language)}
            </Button>
            <Button onClick={() => navigate("/signup")}>
              {t('landing.hero.getStarted', language)}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12 space-y-12">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Trust Center</h1>
          <p className="text-xl text-muted-foreground">
            Transparency, Security, and Compliance at the Core of Everything We Do
          </p>
        </div>

        {/* Uptime & Performance */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Service Reliability</CardTitle>
            </div>
            <CardDescription>Real-time system performance and availability</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">99.97%</p>
                <p className="text-sm text-muted-foreground mt-1">Uptime (Last 30 Days)</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">24/7</p>
                <p className="text-sm text-muted-foreground mt-1">Monitoring & Support</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">&lt;50ms</p>
                <p className="text-sm text-muted-foreground mt-1">Average API Response</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current Month Uptime</span>
                <span className="font-semibold">99.97%</span>
              </div>
              <Progress value={99.97} className="h-2" />
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Live status: <a href="https://status.regsense.dev" className="text-primary hover:underline">status.regsense.dev</a>
            </p>
          </CardContent>
        </Card>

        {/* Certifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Certifications & Compliance</CardTitle>
            </div>
            <CardDescription>Industry-recognized security and compliance standards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {certifications.map((cert, idx) => {
                const Icon = cert.icon
                return (
                  <div key={idx} className="border rounded-lg p-4 flex items-start gap-3">
                    <Icon className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold">{cert.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-green-500/10 text-green-600 px-2 py-1 rounded">
                          {cert.status}
                        </span>
                        <span className="text-xs text-muted-foreground">{cert.year}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Security Measures */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Security Measures</CardTitle>
            </div>
            <CardDescription>Enterprise-grade security protecting your data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {securityMeasures.map((measure, idx) => {
                const Icon = measure.icon
                return (
                  <div key={idx} className="border rounded-lg p-4 space-y-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-sm">{measure.title}</h3>
                    <p className="text-xs text-muted-foreground">{measure.detail}</p>
                  </div>
                )
              })}
            </div>

            <div className="bg-muted/50 rounded-lg p-4 mt-6 space-y-2">
              <p className="text-sm font-semibold">Additional Security Features</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>✓ Hash-chained audit logs for complete traceability</li>
                <li>✓ Automatic security patches and updates</li>
                <li>✓ DDoS protection and rate limiting</li>
                <li>✓ Vulnerability scanning and monitoring</li>
                <li>✓ Security incident response team (24/7)</li>
                <li>✓ Regular third-party security audits</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Data Protection */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Data Protection & Privacy</CardTitle>
            </div>
            <CardDescription>GDPR-compliant data handling and EU data residency</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold mb-2">🇪🇺 EU Data Residency</h3>
                <p className="text-sm text-muted-foreground">
                  All data stored and processed within the European Union (Frankfurt data centers). 
                  No third-country transfers without explicit consent and Standard Contractual Clauses.
                </p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold mb-2">🔒 GDPR Compliance</h3>
                <p className="text-sm text-muted-foreground">
                  Full compliance with EU GDPR. Data Processing Agreement available. 
                  Data Protection Officer on staff: privacy@regsense.dev
                </p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold mb-2">🗑️ Data Retention</h3>
                <p className="text-sm text-muted-foreground">
                  Configurable retention policies. Right to erasure honored within 30 days. 
                  Secure deletion with certificate of destruction.
                </p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold mb-2">👤 Data Subject Rights</h3>
                <p className="text-sm text-muted-foreground">
                  Full support for GDPR rights: access, rectification, erasure, portability, 
                  restriction, objection. Submit requests via account settings.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Downloadable Documents */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileCheck className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Compliance Documents</CardTitle>
            </div>
            <CardDescription>Download our official compliance documentation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-between" onClick={() => navigate("/dpa")}>
                <span className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Data Processing Agreement (DPA)
                </span>
                <span className="text-xs text-muted-foreground">View Online</span>
              </Button>
              <Button variant="outline" className="w-full justify-between" onClick={() => navigate("/privacy-policy")}>
                <span className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Privacy Policy
                </span>
                <span className="text-xs text-muted-foreground">View Online</span>
              </Button>
              <Button variant="outline" className="w-full justify-between" onClick={() => navigate("/terms")}>
                <span className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Terms of Service
                </span>
                <span className="text-xs text-muted-foreground">View Online</span>
              </Button>
              <Button variant="outline" className="w-full justify-between" onClick={() => navigate("/cookies")}>
                <span className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Cookie Policy
                </span>
                <span className="text-xs text-muted-foreground">View Online</span>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              For SOC 2 or ISO 27001 audit reports, please contact: <a href="mailto:compliance@regsense.dev" className="text-primary hover:underline">compliance@regsense.dev</a>
            </p>
          </CardContent>
        </Card>

        {/* Incident Response */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Eye className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Security Incident Response</CardTitle>
            </div>
            <CardDescription>How we handle security incidents and data breaches</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              We maintain a comprehensive incident response plan and are committed to transparency:
            </p>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">Detection & Analysis</p>
                  <p className="text-xs text-muted-foreground">24/7 monitoring, automated alerts, immediate investigation</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">Containment & Mitigation</p>
                  <p className="text-xs text-muted-foreground">Immediate action to limit impact, preserve evidence</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  3
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">Notification</p>
                  <p className="text-xs text-muted-foreground">Affected customers notified within 24 hours, DPA authorities within 72 hours</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  4
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">Resolution & Post-Mortem</p>
                  <p className="text-xs text-muted-foreground">Root cause analysis, corrective measures, transparency report</p>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm mt-4">
              <p className="font-medium mb-2">Report a Security Issue</p>
              <p className="text-xs text-muted-foreground">
                If you discover a security vulnerability, please report it to:{" "}
                <a href="mailto:security@regsense.dev" className="text-primary hover:underline">security@regsense.dev</a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact CTA */}
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="py-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Questions About Our Security?</h2>
            <p className="text-lg mb-6 opacity-90">
              Our security and compliance team is here to help
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" onClick={() => navigate("/contact")}>
                Contact Security Team
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate("/signup")}>
                Start Free Trial
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}

export default TrustCenter
