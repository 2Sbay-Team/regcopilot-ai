import { useLanguage } from "@/contexts/LanguageContext"
import { t } from "@/lib/i18n"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const Cookies = () => {
  const { language } = useLanguage()

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Cookie Policy</CardTitle>
          <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-3">1. What Are Cookies</h2>
              <p className="text-muted-foreground">
                Cookies are small text files stored on your device when you visit our website. They help us provide you with 
                a better experience by remembering your preferences and understanding how you use our Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">2. How We Use Cookies</h2>
              <p className="text-muted-foreground mb-2">
                LaterneX uses cookies for the following purposes:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li><strong>Essential Cookies:</strong> Required for the Service to function properly (authentication, security)</li>
                <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how you use the Service to improve it</li>
                <li><strong>Performance Cookies:</strong> Monitor system performance and service quality</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">3. Types of Cookies We Use</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Essential Cookies</h3>
                  <p className="text-muted-foreground mb-2">
                    These cookies are necessary for the website to function and cannot be switched off:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                    <li><strong>Session ID:</strong> Maintains your logged-in state</li>
                    <li><strong>Security tokens:</strong> Prevents cross-site request forgery (CSRF)</li>
                    <li><strong>Load balancing:</strong> Ensures optimal performance</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">Functional Cookies</h3>
                  <p className="text-muted-foreground mb-2">
                    These enhance functionality and personalization:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                    <li><strong>Language preference:</strong> Remembers your selected language</li>
                    <li><strong>Theme preference:</strong> Stores your light/dark mode choice</li>
                    <li><strong>Sidebar state:</strong> Remembers your UI preferences</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">Analytics Cookies</h3>
                  <p className="text-muted-foreground mb-2">
                    Help us understand usage patterns:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                    <li><strong>Page views:</strong> Track which pages are most visited</li>
                    <li><strong>Feature usage:</strong> Understand which features are most valuable</li>
                    <li><strong>Error tracking:</strong> Identify and fix technical issues</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">4. Third-Party Cookies</h2>
              <p className="text-muted-foreground">
                We do not use third-party advertising cookies. Any third-party cookies are limited to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
                <li>Analytics providers (e.g., for aggregated usage statistics)</li>
                <li>Authentication providers (e.g., for SSO functionality)</li>
                <li>Infrastructure providers (e.g., Supabase for backend services)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">5. Managing Cookies</h2>
              <p className="text-muted-foreground mb-2">
                You have several options to manage cookies:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li><strong>Browser Settings:</strong> Most browsers allow you to refuse or delete cookies</li>
                <li><strong>Account Settings:</strong> Manage cookie preferences in your account settings</li>
                <li><strong>Opt-Out:</strong> You can opt out of non-essential cookies at any time</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                Note: Blocking essential cookies may impact the functionality of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">6. Cookie Retention</h2>
              <p className="text-muted-foreground">
                Different cookies have different retention periods:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
                <li><strong>Session cookies:</strong> Deleted when you close your browser</li>
                <li><strong>Persistent cookies:</strong> Remain for up to 1 year unless manually deleted</li>
                <li><strong>Analytics cookies:</strong> Retained for up to 2 years for trend analysis</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">7. Data Protection</h2>
              <p className="text-muted-foreground">
                All cookie data is handled in accordance with GDPR and our Privacy Policy. We:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
                <li>Store all data in EU-based servers</li>
                <li>Encrypt all cookie data in transit (TLS 1.3)</li>
                <li>Do not sell or share cookie data with third parties</li>
                <li>Provide transparency about all cookies we use</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">8. Updates to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this Cookie Policy from time to time. We will notify you of any material changes via email 
                or through a notice on the Service. Your continued use of the Service after such updates constitutes 
                acceptance of the modified policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">9. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have questions about our use of cookies, please contact:
              </p>
              <div className="text-muted-foreground mt-2">
                <p>Data Protection Officer: privacy@laternex.com</p>
                <p>Address: LaterneX Labs AB, Box 220, 101 23 Stockholm, Sweden</p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    )
  }

export default Cookies
