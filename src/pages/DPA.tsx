import { useLanguage } from "@/contexts/LanguageContext"
import { t } from "@/lib/i18n"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const DPA = () => {
  const { language } = useLanguage()

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Data Processing Agreement (DPA)</CardTitle>
          <p className="text-sm text-muted-foreground">Effective date: {new Date().toLocaleDateString()}</p>
        </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-3">1. Definitions and Interpretation</h2>
              <p className="text-muted-foreground mb-2">
                This Data Processing Agreement ("DPA") forms part of the Terms of Service between:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li><strong>Data Controller:</strong> The Customer organization using LaterneX</li>
                <li><strong>Data Processor:</strong> LaterneX Labs AB (the Service provider)</li>
                <li><strong>Personal Data:</strong> Any information relating to an identified or identifiable natural person</li>
                <li><strong>Processing:</strong> Any operation performed on Personal Data</li>
                <li><strong>GDPR:</strong> General Data Protection Regulation (EU) 2016/679</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">2. Scope and Purpose of Processing</h2>
              <p className="text-muted-foreground mb-2">
                LaterneX Labs AB processes Personal Data on behalf of the Customer solely for the purpose of:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Providing AI-powered regulatory compliance services</li>
                <li>Storing and analyzing compliance-related documents</li>
                <li>Generating compliance reports and assessments</li>
                <li>Maintaining audit trails and accountability records</li>
                <li>Providing technical support and service maintenance</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">3. Categories of Data Subjects</h2>
              <p className="text-muted-foreground">
                The Personal Data processed may concern the following categories of data subjects:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
                <li>Employees and contractors of the Customer</li>
                <li>End-users of Customer's AI systems</li>
                <li>Stakeholders mentioned in compliance documents</li>
                <li>Data subjects referenced in ESG or sustainability reports</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">4. Types of Personal Data</h2>
              <p className="text-muted-foreground">
                The processing may involve the following types of Personal Data:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
                <li>Identity data (names, job titles, employee IDs)</li>
                <li>Contact information (email addresses, phone numbers)</li>
                <li>Professional information (roles, departments, responsibilities)</li>
                <li>Compliance-related data (audit records, assessment results)</li>
                <li>Technical data (IP addresses, usage logs, system metadata)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">5. Data Processor Obligations</h2>
              <p className="text-muted-foreground mb-2">
                LaterneX Labs AB undertakes to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Process Personal Data only on documented instructions from the Controller</li>
                <li>Ensure authorized personnel are bound by confidentiality obligations</li>
                <li>Implement appropriate technical and organizational security measures</li>
                <li>Engage sub-processors only with prior written authorization</li>
                <li>Assist the Controller in responding to data subject requests</li>
                <li>Assist in ensuring compliance with GDPR obligations</li>
                <li>Delete or return Personal Data upon termination of services</li>
                <li>Make available all information necessary to demonstrate compliance</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">6. Security Measures</h2>
              <p className="text-muted-foreground mb-2">
                We implement state-of-the-art security measures including:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li><strong>Encryption:</strong> AES-256 encryption at rest, TLS 1.3 in transit</li>
                <li><strong>Access Control:</strong> Role-based access control (RBAC) with MFA</li>
                <li><strong>Infrastructure:</strong> EU-based data centers with ISO 27001 certification</li>
                <li><strong>Monitoring:</strong> 24/7 security monitoring and incident response</li>
                <li><strong>Backup:</strong> Regular encrypted backups with disaster recovery</li>
                <li><strong>Audit:</strong> Hash-chained audit logs for complete traceability</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">7. Sub-Processors</h2>
              <p className="text-muted-foreground mb-2">
                The Processor may engage the following sub-processors:
              </p>
              <table className="w-full text-sm text-muted-foreground border mt-2">
                <thead className="bg-muted">
                  <tr>
                    <th className="border p-2 text-left">Sub-Processor</th>
                    <th className="border p-2 text-left">Service</th>
                    <th className="border p-2 text-left">Location</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-2">Supabase (AWS)</td>
                    <td className="border p-2">Database & Backend Infrastructure</td>
                    <td className="border p-2">EU (Frankfurt)</td>
                  </tr>
                  <tr>
                    <td className="border p-2">OpenAI</td>
                    <td className="border p-2">AI Processing (optional)</td>
                    <td className="border p-2">USA (GDPR-compliant DPA)</td>
                  </tr>
                  <tr>
                    <td className="border p-2">Email Provider</td>
                    <td className="border p-2">Transactional Emails</td>
                    <td className="border p-2">EU</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-muted-foreground mt-2">
                The Controller will be notified of any changes to sub-processors with at least 30 days' notice 
                and may object to such changes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">8. International Data Transfers</h2>
              <p className="text-muted-foreground">
                Primary data storage is within the EU. Any transfers to third countries are conducted in accordance 
                with GDPR Chapter V using Standard Contractual Clauses (SCCs) or adequacy decisions. The Customer 
                may request copies of transfer mechanisms at any time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">9. Data Subject Rights</h2>
              <p className="text-muted-foreground mb-2">
                LaterneX Labs AB will assist the Controller in fulfilling data subject rights requests:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Right of access and data portability</li>
                <li>Right to rectification</li>
                <li>Right to erasure ("right to be forgotten")</li>
                <li>Right to restriction of processing</li>
                <li>Right to object to processing</li>
                <li>Rights related to automated decision-making</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">10. Data Breach Notification</h2>
              <p className="text-muted-foreground">
                In the event of a Personal Data breach, LaterneX Labs AB will notify the Controller without undue delay 
                and within 24 hours of becoming aware of the breach. The notification will include:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
                <li>Nature and categories of Personal Data affected</li>
                <li>Likely consequences of the breach</li>
                <li>Measures taken or proposed to address the breach</li>
                <li>Contact point for further information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">11. Audits and Inspections</h2>
              <p className="text-muted-foreground">
                The Controller may conduct audits or inspections of the Processor's data processing activities, 
                with reasonable notice (minimum 30 days). We provide:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
                <li>Annual SOC 2 Type II audit reports</li>
                <li>ISO 27001 certification documentation</li>
                <li>Security questionnaires and compliance attestations</li>
                <li>On-site audits (at Customer's expense)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">12. Data Retention and Deletion</h2>
              <p className="text-muted-foreground">
                Upon termination of the Service or at the Controller's request:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
                <li>All Personal Data will be deleted within 30 days</li>
                <li>The Controller may request data export before deletion</li>
                <li>Backup copies will be securely erased according to our retention policy</li>
                <li>A certificate of deletion will be provided upon request</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">13. Liability and Indemnification</h2>
              <p className="text-muted-foreground">
                Each party's liability under this DPA is subject to the limitations set forth in the Terms of Service. 
                The Processor shall indemnify the Controller against any claims, fines, or penalties resulting from 
                the Processor's breach of GDPR obligations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">14. Term and Termination</h2>
              <p className="text-muted-foreground">
                This DPA remains in effect for the duration of the Service agreement. Upon termination, all obligations 
                related to data deletion, return, and confidentiality remain in force.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">15. Contact Information</h2>
              <p className="text-muted-foreground">
                For DPA-related inquiries, please contact:
              </p>
              <div className="text-muted-foreground mt-2">
                <p><strong>Data Protection Officer:</strong> privacy@laternex.com</p>
                <p><strong>Address:</strong> LaterneX Labs AB, Box 220, 101 23 Stockholm, Sweden</p>
                <p><strong>EU Representative:</strong> As required under GDPR Article 27</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">16. Governing Law</h2>
              <p className="text-muted-foreground">
                This DPA is governed by Swedish law and the GDPR. Any disputes shall be resolved in accordance 
                with the dispute resolution provisions in the Terms of Service.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    )
  }

export default DPA
