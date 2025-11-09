import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Scale, Users, Lock as LockIcon, HelpCircle, CheckCircle2, Info, Database } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { supabase } from "@/integrations/supabase/client"

const DMACopilot = () => {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    platformName: '',
    platformType: '',
    monthlyUsers: '',
    operatesInEu: true,
    businessUsers: '',
    dataPractices: '',
    advertisingPractices: '',
    interoperability: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { data, error } = await supabase.functions.invoke('dma-assessor', {
        body: formData
      })

      if (error) throw error

      toast({
        title: "DMA Assessment Complete",
        description: `Compliance score: ${data.assessment.compliance_score}/100. ${data.assessment.gatekeeper_status}`
      })

      // Reset form
      setFormData({
        platformName: '',
        platformType: '',
        monthlyUsers: '',
        operatesInEu: true,
        businessUsers: '',
        dataPractices: '',
        advertisingPractices: '',
        interoperability: ''
      })
    } catch (error) {
      console.error('DMA assessment error:', error)
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
        <div className="flex items-center gap-3 mb-2">
          <Scale className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Digital Markets Act Copilot
          </h1>
        </div>
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
            <LockIcon className="h-8 w-8 text-amber-600 mb-2" />
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
              <Label htmlFor="platformType">Platform Type *</Label>
              <Select value={formData.platformType} onValueChange={(val) => setFormData({ ...formData, platformType: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="search">Search Engine</SelectItem>
                  <SelectItem value="social">Social Network</SelectItem>
                  <SelectItem value="marketplace">Online Marketplace</SelectItem>
                  <SelectItem value="app-store">App Store</SelectItem>
                  <SelectItem value="messaging">Messaging Platform</SelectItem>
                  <SelectItem value="video">Video Platform</SelectItem>
                  <SelectItem value="cloud">Cloud Computing</SelectItem>
                  <SelectItem value="advertising">Advertising Platform</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyUsers">Monthly Active Users *</Label>
              <Input
                id="monthlyUsers"
                placeholder="e.g., 50 million"
                value={formData.monthlyUsers}
                onChange={(e) => setFormData({ ...formData, monthlyUsers: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">Gatekeeper threshold: 45M+ EU users</p>
            </div>

            <div className="flex items-center space-x-2 py-2">
              <Checkbox
                id="operatesInEu"
                checked={formData.operatesInEu}
                onCheckedChange={(checked) => setFormData({ ...formData, operatesInEu: checked as boolean })}
              />
              <label
                htmlFor="operatesInEu"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Platform operates in the European Union
              </label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessUsers">Business Users</Label>
              <Textarea
                id="businessUsers"
                placeholder="Describe the business users on your platform (merchants, content creators, app developers)..."
                value={formData.businessUsers}
                onChange={(e) => setFormData({ ...formData, businessUsers: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataPractices">Data Practices</Label>
              <Textarea
                id="dataPractices"
                placeholder="Describe how you collect, use, and combine user data. Include consent mechanisms and data portability features..."
                value={formData.dataPractices}
                onChange={(e) => setFormData({ ...formData, dataPractices: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="advertisingPractices">Advertising Practices</Label>
              <Textarea
                id="advertisingPractices"
                placeholder="Describe your advertising model, targeting practices, and how you use user data for ads..."
                value={formData.advertisingPractices}
                onChange={(e) => setFormData({ ...formData, advertisingPractices: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interoperability">Interoperability</Label>
              <Textarea
                id="interoperability"
                placeholder="Describe your APIs, integration capabilities, and how third parties can access your platform..."
                value={formData.interoperability}
                onChange={(e) => setFormData({ ...formData, interoperability: e.target.value })}
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
