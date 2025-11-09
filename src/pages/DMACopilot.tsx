import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Database, Users, Lock, HelpCircle, CheckCircle2, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const DMACopilot = () => {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    platformName: '',
    isGatekeeper: '',
    monthlyActiveUsers: '',
    annualRevenue: '',
    marketCap: '',
    coreServices: [] as string[],
    interoperabilityMeasures: '',
    dataSharingPractices: '',
    selfPreferencingPractices: '',
    competitorAccess: ''
  })

  const coreServicesList = [
    'Online search engines',
    'Online social networking services',
    'Video-sharing platform services',
    'Number-independent interpersonal communications services',
    'Operating systems',
    'Web browsers',
    'Cloud computing services',
    'Advertising services',
    'Online intermediation services',
    'Virtual assistants'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast({
        title: "DMA Assessment Started",
        description: "Digital Markets Act compliance assessment is being processed"
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start assessment"
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleService = (service: string) => {
    const newServices = formData.coreServices.includes(service)
      ? formData.coreServices.filter(s => s !== service)
      : [...formData.coreServices, service]
    setFormData({ ...formData, coreServices: newServices })
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          Digital Markets Act Copilot
        </h1>
        <p className="text-muted-foreground font-medium">
          Gatekeeper compliance and fair digital market practices
        </p>
      </div>

      <Alert className="border-orange-500/50 bg-orange-500/10">
        <HelpCircle className="h-4 w-4 text-orange-600" />
        <AlertTitle>What is the Digital Markets Act (DMA)?</AlertTitle>
        <AlertDescription>
          The DMA regulates large online platforms designated as "gatekeepers" to ensure fair and contestable digital markets in the EU. It requires interoperability, data portability, and prohibits self-preferencing.
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-orange-500/20">
          <CardHeader>
            <Users className="h-8 w-8 text-orange-600 mb-2" />
            <CardTitle className="text-lg">Gatekeeper Status</CardTitle>
            <CardDescription>45M+ monthly active users or €7.5B+ revenue</CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="border-red-500/20">
          <CardHeader>
            <Database className="h-8 w-8 text-red-600 mb-2" />
            <CardTitle className="text-lg">Data Portability</CardTitle>
            <CardDescription>Enable user data transfer</CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="border-amber-500/20">
          <CardHeader>
            <Lock className="h-8 w-8 text-amber-600 mb-2" />
            <CardTitle className="text-lg">Interoperability</CardTitle>
            <CardDescription>Open APIs and standards</CardDescription>
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
                  Step 1: Platform Information
                </h4>
                <p className="text-muted-foreground ml-6">
                  Enter your platform name and basic information. The DMA applies to platforms providing "core platform services" in the EU.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Step 2: Gatekeeper Criteria
                </h4>
                <p className="text-muted-foreground ml-6">
                  Check if you meet gatekeeper thresholds: 45M+ monthly active EU users OR €7.5B+ annual EEA turnover OR €75B+ market cap. Add your numbers even if below thresholds.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Step 3: Core Platform Services
                </h4>
                <p className="text-muted-foreground ml-6">
                  Select which core platform services you provide (search engines, social networks, app stores, messaging, etc.). Multiple selections are allowed.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Step 4: DMA Obligations
                </h4>
                <p className="text-muted-foreground ml-6">
                  Describe your current interoperability measures, data sharing practices, and whether you engage in self-preferencing of your own services.
                </p>
              </div>
            </div>
            
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Key DMA Prohibitions for Gatekeepers</AlertTitle>
              <AlertDescription className="space-y-1 mt-2">
                • No combining user data without consent
                <br />• No self-preferencing in rankings
                <br />• Must allow third-party apps
                <br />• Must enable interoperability
                <br />• Must provide data portability
                <br />• Cannot require use of proprietary services
              </AlertDescription>
            </Alert>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>DMA Compliance Assessment</CardTitle>
          <CardDescription>Evaluate your platform's compliance with Digital Markets Act requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="platformName">Platform Name *</Label>
              <Input
                id="platformName"
                placeholder="e.g., MetaConnect Social Platform"
                value={formData.platformName}
                onChange={(e) => setFormData({ ...formData, platformName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="isGatekeeper">Do you believe you're a designated gatekeeper?</Label>
              <Select value={formData.isGatekeeper} onValueChange={(val) => setFormData({ ...formData, isGatekeeper: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes - Formally Designated</SelectItem>
                  <SelectItem value="likely">Likely (meet thresholds)</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="unsure">Unsure - Need Assessment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mau">Monthly Active Users (EU)</Label>
                <Input
                  id="mau"
                  type="number"
                  placeholder="e.g., 50000000"
                  value={formData.monthlyActiveUsers}
                  onChange={(e) => setFormData({ ...formData, monthlyActiveUsers: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Threshold: 45M+ users</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="revenue">Annual EEA Revenue (€)</Label>
                <Input
                  id="revenue"
                  type="number"
                  placeholder="e.g., 8000000000"
                  value={formData.annualRevenue}
                  onChange={(e) => setFormData({ ...formData, annualRevenue: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Threshold: €7.5B+</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="marketCap">Market Capitalization (€)</Label>
                <Input
                  id="marketCap"
                  type="number"
                  placeholder="e.g., 80000000000"
                  value={formData.marketCap}
                  onChange={(e) => setFormData({ ...formData, marketCap: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Threshold: €75B+</p>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Core Platform Services Provided *</Label>
              <div className="grid md:grid-cols-2 gap-3">
                {coreServicesList.map((service) => (
                  <div key={service} className="flex items-center space-x-2">
                    <Checkbox
                      id={service}
                      checked={formData.coreServices.includes(service)}
                      onCheckedChange={() => toggleService(service)}
                    />
                    <label
                      htmlFor={service}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {service}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interop">Interoperability Measures</Label>
              <Textarea
                id="interop"
                placeholder="Describe your APIs, data standards, and interoperability features. Do you allow third-party integrations?"
                value={formData.interoperabilityMeasures}
                onChange={(e) => setFormData({ ...formData, interoperabilityMeasures: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataSharing">Data Sharing & Portability</Label>
              <Textarea
                id="dataSharing"
                placeholder="How do you enable users to export their data? Do you combine data across services? Describe consent mechanisms."
                value={formData.dataSharingPractices}
                onChange={(e) => setFormData({ ...formData, dataSharingPractices: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="selfPref">Self-Preferencing Practices</Label>
              <Textarea
                id="selfPref"
                placeholder="Do you rank your own services higher? Do you pre-install your apps? Describe any preferential treatment of your services."
                value={formData.selfPreferencingPractices}
                onChange={(e) => setFormData({ ...formData, selfPreferencingPractices: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="competitorAccess">Competitor Access to Platform</Label>
              <Textarea
                id="competitorAccess"
                placeholder="Do competitors have fair access to your platform? Describe terms and conditions for third-party access."
                value={formData.competitorAccess}
                onChange={(e) => setFormData({ ...formData, competitorAccess: e.target.value })}
                rows={3}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Processing Assessment..." : "Start DMA Assessment"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default DMACopilot
