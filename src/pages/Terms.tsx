import { useLanguage } from "@/contexts/LanguageContext"
import { t } from "@/lib/i18n"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const Terms = () => {
  const { language } = useLanguage()

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Terms of Service</CardTitle>
          <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using RegSense Advisor ("the Service"), you accept and agree to be bound by the terms and provisions of this agreement. 
                If you do not agree to these Terms of Service, please do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">2. Description of Service</h2>
              <p className="text-muted-foreground">
                RegSense Advisor provides AI-powered regulatory intelligence and compliance tools for organizations. 
                The Service includes AI Act auditing, GDPR compliance checking, ESG reporting, and related compliance management features.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">3. User Accounts</h2>
              <p className="text-muted-foreground mb-2">
                To use certain features of the Service, you must register for an account. You agree to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain the security of your password and account</li>
                <li>Promptly update your account information</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">4. Data Processing and Privacy</h2>
              <p className="text-muted-foreground">
                Your use of the Service is also governed by our Privacy Policy and Data Processing Agreement (DPA). 
                RegSense Advisor processes data in accordance with GDPR and other applicable data protection regulations. 
                All data is stored in EU-based servers with enterprise-grade encryption.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">5. Acceptable Use</h2>
              <p className="text-muted-foreground mb-2">You agree not to:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Use the Service for any illegal purpose</li>
                <li>Violate any laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Upload malicious code or harmful content</li>
                <li>Attempt to gain unauthorized access to the Service</li>
                <li>Interfere with or disrupt the Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">6. Intellectual Property</h2>
              <p className="text-muted-foreground">
                All content, features, and functionality of the Service are owned by RegSense Labs AB and are protected by 
                international copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, 
                or reverse engineer any part of the Service without explicit written permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">7. Subscription and Payment</h2>
              <p className="text-muted-foreground">
                Certain features require a paid subscription. Subscription fees are billed in advance on a monthly or annual basis. 
                You authorize us to charge your payment method for all subscription fees. Refunds are provided on a case-by-case basis 
                in accordance with our refund policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">8. Service Availability</h2>
              <p className="text-muted-foreground">
                We strive to maintain 99.9% uptime but do not guarantee uninterrupted access. We reserve the right to modify, 
                suspend, or discontinue the Service with reasonable notice. We are not liable for any downtime or service interruptions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">9. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                To the maximum extent permitted by law, RegSense Labs AB shall not be liable for any indirect, incidental, special, 
                consequential, or punitive damages arising from your use of the Service. Our total liability shall not exceed 
                the amount paid by you in the 12 months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">10. Governing Law</h2>
              <p className="text-muted-foreground">
                These Terms shall be governed by and construed in accordance with the laws of Sweden, without regard to its 
                conflict of law provisions. Any disputes shall be resolved in the courts of Stockholm, Sweden.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">11. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these Terms at any time. We will provide notice of material changes via email 
                or through the Service. Your continued use after such changes constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">12. Contact Information</h2>
              <p className="text-muted-foreground">
                For questions about these Terms, please contact us at:
              </p>
              <div className="text-muted-foreground mt-2">
                <p>Email: legal@regsense.dev</p>
                <p>Address: RegSense Labs AB, Box 220, 101 23 Stockholm, Sweden</p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    )
  }

export default Terms
