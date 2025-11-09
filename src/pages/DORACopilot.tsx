import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Network, Server, AlertTriangle, HelpCircle, CheckCircle2, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { supabase } from "@/integrations/supabase/client"

const DORACopilot = () => {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    institutionName: '',
    institutionType: '',
    ictServices: '',
    thirdPartyProviders: '',
    incidentManagement: '',
    testingFrequency: '',
    recoveryTimeObjective: '',
    businessContinuityPlan: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { data, error } = await supabase.functions.invoke('dora-assessor', {
        body: formData
      })

      if (error) throw error

      toast({
        title: "DORA Assessment Complete",
        description: `Compliance score: ${data.assessment.compliance_score}/100. ${data.assessment.risk_classification}`
      })

      // Reset form
      setFormData({
        institutionName: '',
        institutionType: '',
        ictServices: '',
        thirdPartyProviders: '',
        incidentManagement: '',
        testingFrequency: '',
        recoveryTimeObjective: '',
        businessContinuityPlan: ''
      })
    } catch (error) {
      console.error('DORA assessment error:', error)
      toast({
        variant: "destructive",
        title: "Assessment Failed",
        description: error instanceof Error ? error.message : "Failed to complete assessment"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          DORA Compliance Copilot
        </h1>
        <p className="text-muted-foreground font-medium">
          Digital Operational Resilience Act for Financial Institutions
        </p>
      </div>

      <Alert className="border-purple-500/50 bg-purple-500/10">
        <HelpCircle className="h-4 w-4 text-purple-600" />
        <AlertTitle>What is DORA?</AlertTitle>
        <AlertDescription>
          DORA establishes a regulatory framework for digital operational resilience in the EU financial sector, covering ICT risk management, incident reporting, and third-party oversight.
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-purple-500/20">
          <CardHeader>
            <Network className="h-8 w-8 text-purple-600 mb-2" />
            <CardTitle className="text-lg">ICT Risk Management</CardTitle>
            <CardDescription>Identify and manage operational risks</CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="border-pink-500/20">
          <CardHeader>
            <Server className="h-8 w-8 text-pink-600 mb-2" />
            <CardTitle className="text-lg">Resilience Testing</CardTitle>
            <CardDescription>Regular testing of systems</CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="border-fuchsia-500/20">
          <CardHeader>
            <AlertTriangle className="h-8 w-8 text-fuchsia-600 mb-2" />
            <CardTitle className="text-lg">Incident Reporting</CardTitle>
            <CardDescription>Report major ICT incidents</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="help">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              How to Use This Copilot
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Step 1: Institution Information
                </h4>
                <p className="text-muted-foreground ml-6">
                  Enter your financial institution name and type (Bank, Investment Firm, Insurance, Payment Institution, etc.).
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Step 2: ICT Services
                </h4>
                <p className="text-muted-foreground ml-6">
                  List your critical ICT services and systems: core banking, trading platforms, customer portals, payment processing, etc.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Step 3: Third-Party Providers
                </h4>
                <p className="text-muted-foreground ml-6">
                  Identify critical ICT third-party service providers (cloud providers, software vendors, data centers). DORA requires oversight of these relationships.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Step 4: Resilience Measures
                </h4>
                <p className="text-muted-foreground ml-6">
                  Describe your incident management processes, testing frequency, recovery time objectives (RTO), and business continuity plans.
                </p>
              </div>
            </div>
            
            <Alert className="mt-4">
              <Clock className="h-4 w-4" />
              <AlertTitle>Key DORA Requirements</AlertTitle>
              <AlertDescription>
                • Report major incidents within 4 hours of detection
                <br />• Conduct resilience testing at least annually
                <br />• Maintain up-to-date ICT risk registers
                <br />• Implement business continuity plans with RTOs
              </AlertDescription>
            </Alert>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>DORA Assessment Form</CardTitle>
          <CardDescription>Complete this form to assess your digital operational resilience</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="instName">Institution Name *</Label>
                <Input
                  id="instName"
                  placeholder="e.g., European Investment Bank"
                  value={formData.institutionName}
                  onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="instType">Institution Type *</Label>
                <Select value={formData.institutionType} onValueChange={(val) => setFormData({ ...formData, institutionType: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select institution type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank">Credit Institution / Bank</SelectItem>
                    <SelectItem value="investment">Investment Firm</SelectItem>
                    <SelectItem value="insurance">Insurance / Reinsurance</SelectItem>
                    <SelectItem value="payment">Payment Institution</SelectItem>
                    <SelectItem value="emoney">E-Money Institution</SelectItem>
                    <SelectItem value="crypto">Crypto-Asset Service Provider</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ictServices">Critical ICT Services *</Label>
              <Textarea
                id="ictServices"
                placeholder="List your critical ICT services and systems: core banking platform, trading systems, customer portals, payment processing..."
                value={formData.ictServices}
                onChange={(e) => setFormData({ ...formData, ictServices: e.target.value })}
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thirdParty">Critical Third-Party ICT Providers *</Label>
              <Textarea
                id="thirdParty"
                placeholder="List critical ICT third-party providers: AWS/Azure/GCP, software vendors, telecommunications, data centers..."
                value={formData.thirdPartyProviders}
                onChange={(e) => setFormData({ ...formData, thirdPartyProviders: e.target.value })}
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="incidentMgmt">Incident Management Process</Label>
              <Textarea
                id="incidentMgmt"
                placeholder="Describe your ICT incident detection, response, and reporting procedures. Include incident classification criteria."
                value={formData.incidentManagement}
                onChange={(e) => setFormData({ ...formData, incidentManagement: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="testingFreq">Resilience Testing Frequency *</Label>
                <Select value={formData.testingFrequency} onValueChange={(val) => setFormData({ ...formData, testingFrequency: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="biannual">Bi-annually</SelectItem>
                    <SelectItem value="annual">Annually</SelectItem>
                    <SelectItem value="none">Not Currently Testing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rto">Recovery Time Objective (RTO)</Label>
                <Input
                  id="rto"
                  placeholder="e.g., 4 hours, 24 hours"
                  value={formData.recoveryTimeObjective}
                  onChange={(e) => setFormData({ ...formData, recoveryTimeObjective: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bcp">Business Continuity Plan</Label>
              <Textarea
                id="bcp"
                placeholder="Describe your business continuity and disaster recovery plans for ICT services. Include backup strategies and failover procedures."
                value={formData.businessContinuityPlan}
                onChange={(e) => setFormData({ ...formData, businessContinuityPlan: e.target.value })}
                rows={3}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Processing Assessment..." : "Start DORA Assessment"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default DORACopilot
