import { useLanguage } from "@/contexts/LanguageContext"
import { t } from "@/lib/i18n"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Users, Globe, Award } from "lucide-react"

const About = () => {
  const { language } = useLanguage()

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">{t('about.title', language)}</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          {t('about.subtitle', language)}
        </p>
      </div>

      {/* Mission */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl">{t('about.mission', language)}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {t('about.missionText1', language)}
          </p>
          <p className="text-muted-foreground">
            {t('about.missionText2', language)}
          </p>
        </CardContent>
      </Card>

      {/* Company Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Globe className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl">EU-Based & GDPR Native</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            <strong>LaterneX Labs AB</strong> is headquartered in Stockholm, Sweden, at the heart of 
            Europe's innovation ecosystem. Our EU base ensures:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li><strong>GDPR Compliance by Design:</strong> All data processing follows EU data protection standards</li>
            <li><strong>EU Data Residency:</strong> Your data never leaves the European Union</li>
            <li><strong>European Legal Framework:</strong> Governed by Swedish law and EU regulations</li>
            <li><strong>Sovereignty:</strong> Independent from non-EU jurisdictions</li>
          </ul>
          <div className="bg-muted p-4 rounded-lg mt-4">
            <p className="text-sm font-semibold mb-2">Legal Entity</p>
            <p className="text-sm text-muted-foreground">LaterneX Labs AB</p>
            <p className="text-sm text-muted-foreground">Box 220, 101 23 Stockholm, Sweden</p>
            <p className="text-sm text-muted-foreground mt-2">Organization Number: [SE-ORG-NUMBER]</p>
            <p className="text-sm text-muted-foreground">VAT: SE[VAT-NUMBER]</p>
          </div>
        </CardContent>
      </Card>

      {/* Leadership */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl">Leadership Team</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Chief Executive Officer</h3>
              <p className="text-muted-foreground">
                Leading our mission to democratize regulatory compliance through AI innovation.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Chief Technology Officer</h3>
              <p className="text-muted-foreground">
                Overseeing our AI architecture and ensuring enterprise-grade security and scalability.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Chief Compliance Officer</h3>
              <p className="text-muted-foreground">
                Expert in EU regulations (AI Act, GDPR, CSRD) with 15+ years in RegTech.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Data Protection Officer (DPO)</h3>
              <p className="text-muted-foreground">
                Contact: <a href="mailto:privacy@laternex.com" className="text-primary hover:underline">privacy@laternex.com</a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Values & Certifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Award className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl">Our Commitment</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="border-l-4 border-primary pl-4">
              <h3 className="font-semibold mb-2">🔒 Security First</h3>
              <p className="text-sm text-muted-foreground">
                SOC 2 Type II certified, ISO 27001 compliant, AES-256 encryption, TLS 1.3 in transit
              </p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <h3 className="font-semibold mb-2">🇪🇺 EU Data Protection</h3>
              <p className="text-sm text-muted-foreground">
                Full GDPR compliance, DPO on staff, Data Processing Agreements, EU Standard Contractual Clauses
              </p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <h3 className="font-semibold mb-2">🤖 AI Transparency</h3>
              <p className="text-sm text-muted-foreground">
                Explainable AI, hash-chained audit trails, full reasoning visibility, no black boxes
              </p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <h3 className="font-semibold mb-2">🌍 Sustainability</h3>
              <p className="text-sm text-muted-foreground">
                Carbon-neutral operations, green data centers, ESG reporting for our own operations
              </p>
            </div>
          </div>

          <div className="bg-primary/10 p-4 rounded-lg mt-6">
            <p className="text-sm font-semibold mb-2">🏆 Certifications & Standards</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✓ SOC 2 Type II (Annual audits)</li>
              <li>✓ ISO 27001:2022 Information Security</li>
              <li>✓ GDPR Compliant (EU Regulation 2016/679)</li>
              <li>✓ AI Act Ready (EU Regulation 2024/1689)</li>
              <li>✓ CSRD/ESRS Reporting Framework</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default About
