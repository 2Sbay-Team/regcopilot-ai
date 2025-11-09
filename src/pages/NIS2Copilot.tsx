import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Lock, Shield, AlertCircle, HelpCircle, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const NIS2Copilot = () => {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    organizationName: '',
    sector: '',
    entityType: '',
    incidentDescription: '',
    incidentDate: '',
    affectedSystems: '',
    supplyChainImpact: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast({
        title: "Assessment Started",
        description: "NIS2 compliance assessment is being processed"
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

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          NIS2 Compliance Copilot
        </h1>
        <p className="text-muted-foreground font-medium">
          Cybersecurity incident reporting and supply chain risk management
        </p>
      </div>

      <Alert className="border-blue-500/50 bg-blue-500/10">
        <HelpCircle className="h-4 w-4 text-blue-600" />
        <AlertTitle>What is NIS2?</AlertTitle>
        <AlertDescription>
          The NIS2 Directive is the EU-wide legislation on cybersecurity that sets cybersecurity requirements for essential and important entities.
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-blue-500/20">
          <CardHeader>
            <Shield className="h-8 w-8 text-blue-600 mb-2" />
            <CardTitle className="text-lg">Incident Reporting</CardTitle>
            <CardDescription>Report cybersecurity incidents within 24 hours</CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="border-indigo-500/20">
          <CardHeader>
            <Lock className="h-8 w-8 text-indigo-600 mb-2" />
            <CardTitle className="text-lg">Supply Chain Security</CardTitle>
            <CardDescription>Assess third-party cyber risks</CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="border-violet-500/20">
          <CardHeader>
            <AlertCircle className="h-8 w-8 text-violet-600 mb-2" />
            <CardTitle className="text-lg">Risk Management</CardTitle>
            <CardDescription>Implement cybersecurity measures</CardDescription>
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
                  Step 1: Organization Information
                </h4>
                <p className="text-muted-foreground ml-6">
                  Enter your organization name and select your sector (e.g., Healthcare, Energy, Finance). This helps determine your NIS2 classification.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Step 2: Entity Type
                </h4>
                <p className="text-muted-foreground ml-6">
                  Select if you're an "Essential Entity" (critical services) or "Important Entity" (significant services). If unsure, select "Not Sure" for assessment.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Step 3: Incident Details
                </h4>
                <p className="text-muted-foreground ml-6">
                  Describe any cybersecurity incidents: data breaches, system compromises, DDoS attacks. Include when it happened and which systems were affected.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Step 4: Supply Chain Impact
                </h4>
                <p className="text-muted-foreground ml-6">
                  List any third-party services or suppliers affected. NIS2 requires reporting of supply chain cybersecurity risks.
                </p>
              </div>
            </div>
            
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Not sure what to enter?</AlertTitle>
              <AlertDescription>
                You can use this copilot for both incident reporting and preventive assessments. If you haven't had an incident, select "Preventive Assessment" as entity type.
              </AlertDescription>
            </Alert>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>NIS2 Assessment Form</CardTitle>
          <CardDescription>Complete the form below to start your compliance assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="orgName">Organization Name *</Label>
                <Input
                  id="orgName"
                  placeholder="e.g., Acme Healthcare GmbH"
                  value={formData.organizationName}
                  onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sector">Sector *</Label>
                <Select value={formData.sector} onValueChange={(val) => setFormData({ ...formData, sector: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your sector" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="energy">Energy</SelectItem>
                    <SelectItem value="transport">Transport</SelectItem>
                    <SelectItem value="banking">Banking & Finance</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="water">Water</SelectItem>
                    <SelectItem value="digital">Digital Infrastructure</SelectItem>
                    <SelectItem value="public">Public Administration</SelectItem>
                    <SelectItem value="space">Space</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="entityType">Entity Classification *</Label>
              <Select value={formData.entityType} onValueChange={(val) => setFormData({ ...formData, entityType: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select entity type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="essential">Essential Entity (Critical Services)</SelectItem>
                  <SelectItem value="important">Important Entity (Significant Services)</SelectItem>
                  <SelectItem value="preventive">Preventive Assessment (No Incident)</SelectItem>
                  <SelectItem value="notsure">Not Sure - Need Classification</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="incidentDate">Incident Date (if applicable)</Label>
              <Input
                id="incidentDate"
                type="date"
                value={formData.incidentDate}
                onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="incidentDesc">Incident Description</Label>
              <Textarea
                id="incidentDesc"
                placeholder="Describe the cybersecurity incident: type (ransomware, data breach, DDoS), impact, affected data/systems..."
                value={formData.incidentDescription}
                onChange={(e) => setFormData({ ...formData, incidentDescription: e.target.value })}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                If no incident, describe your current cybersecurity measures for assessment
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="affectedSystems">Affected Systems</Label>
              <Input
                id="affectedSystems"
                placeholder="e.g., Customer database, Payment gateway, Internal network"
                value={formData.affectedSystems}
                onChange={(e) => setFormData({ ...formData, affectedSystems: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplyChain">Supply Chain Impact</Label>
              <Textarea
                id="supplyChain"
                placeholder="List affected third-party services, vendors, or suppliers (e.g., Cloud provider AWS, Payment processor Stripe)"
                value={formData.supplyChainImpact}
                onChange={(e) => setFormData({ ...formData, supplyChainImpact: e.target.value })}
                rows={3}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Processing Assessment..." : "Start NIS2 Assessment"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default NIS2Copilot
