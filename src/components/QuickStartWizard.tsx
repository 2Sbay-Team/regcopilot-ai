import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Shield, FileCheck, Leaf, Mail, Network, CheckCircle2, ArrowRight, ArrowLeft, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface QuickStartWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const wizardSteps = [
  {
    id: "welcome",
    title: "Welcome to Regulix",
    description: "Let's get you started with compliance assessments",
    icon: Shield,
  },
  {
    id: "ai-act",
    title: "EU AI Act Auditor",
    description: "Assess AI systems for regulatory compliance",
    icon: Shield,
    route: "/ai-act",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    features: [
      "Automated risk classification (Minimal, Limited, High, Unacceptable)",
      "Annex IV technical documentation generation",
      "Article-by-article compliance mapping",
      "Evidence linking and audit trail"
    ],
    useCases: [
      "HR screening tools",
      "Credit scoring systems",
      "Biometric identification",
      "Critical infrastructure AI"
    ]
  },
  {
    id: "gdpr",
    title: "GDPR / DSGVO Checker",
    description: "Scan documents for personal data compliance",
    icon: FileCheck,
    route: "/gdpr",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    features: [
      "Personal data detection (PII scanning)",
      "GDPR violation identification",
      "Legal basis verification",
      "Cross-border transfer checks"
    ],
    useCases: [
      "Employee records audit",
      "Customer database scanning",
      "Privacy policy review",
      "Vendor contract analysis"
    ]
  },
  {
    id: "esg",
    title: "ESG Reporter",
    description: "Generate sustainability reports (CSRD/ESRS)",
    icon: Leaf,
    route: "/esg",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    features: [
      "Carbon emissions tracking (Scope 1, 2, 3)",
      "ESRS standard alignment",
      "KPI calculation and benchmarking",
      "Automated narrative generation"
    ],
    useCases: [
      "Annual sustainability reporting",
      "ESG investor disclosures",
      "Carbon footprint analysis",
      "Supply chain emissions"
    ]
  },
  {
    id: "dsar",
    title: "DSAR Management",
    description: "Handle data subject access requests",
    icon: Mail,
    route: "/dsar",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    features: [
      "30-day deadline tracking",
      "Automated data aggregation",
      "Multi-system search",
      "Response generation"
    ],
    useCases: [
      "Right to access requests",
      "Data portability",
      "Right to erasure ('Right to be forgotten')",
      "Data rectification"
    ]
  },
  {
    id: "dora",
    title: "DORA Compliance",
    description: "Digital operational resilience for financial institutions",
    icon: Network,
    route: "/dora-copilot",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    features: [
      "ICT risk management assessment",
      "Third-party provider oversight",
      "Incident reporting procedures",
      "Resilience testing frameworks"
    ],
    useCases: [
      "Banks and credit institutions",
      "Investment firms",
      "Insurance companies",
      "Payment service providers"
    ]
  },
  {
    id: "complete",
    title: "You're All Set!",
    description: "Choose a module to start your first assessment",
    icon: CheckCircle2,
  },
]

export const QuickStartWizard = ({ open, onOpenChange }: QuickStartWizardProps) => {
  const [currentStep, setCurrentStep] = useState(0)
  const navigate = useNavigate()

  const step = wizardSteps[currentStep]
  const progress = ((currentStep + 1) / wizardSteps.length) * 100

  const handleNext = () => {
    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStartAssessment = (route: string) => {
    onOpenChange(false)
    navigate(route)
    // Mark wizard as completed
    localStorage.setItem("quickstart_completed", "true")
  }

  const handleSkip = () => {
    onOpenChange(false)
    localStorage.setItem("quickstart_skipped", "true")
  }

  const Icon = step.icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Icon className={`h-6 w-6 ${step.color || "text-primary"}`} />
              {step.title}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={handleSkip}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>{step.description}</DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            Step {currentStep + 1} of {wizardSteps.length}
          </p>
        </div>

        {/* Step Content */}
        <div className="py-4">
          {step.id === "welcome" && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>🎯 Your Compliance Journey Starts Here</CardTitle>
                  <CardDescription>
                    Regulix provides AI-powered compliance tools for EU regulations. This wizard will introduce you to each module.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Automated Assessments</p>
                      <p className="text-sm text-muted-foreground">AI-powered risk classification and compliance checks</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Evidence-Based Reports</p>
                      <p className="text-sm text-muted-foreground">Every finding is backed by regulatory citations</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Audit Trail</p>
                      <p className="text-sm text-muted-foreground">Complete cryptographic audit chain for all assessments</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {step.id !== "welcome" && step.id !== "complete" && (
            <div className="space-y-4">
              <Card className={step.bgColor}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${step.color}`} />
                    Key Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {step.features?.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className={`h-4 w-4 ${step.color} mt-1 flex-shrink-0`} />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Common Use Cases</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {step.useCases?.map((useCase, idx) => (
                      <Badge key={idx} variant="secondary">
                        {useCase}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Button 
                className="w-full" 
                size="lg"
                onClick={() => step.route && handleStartAssessment(step.route)}
              >
                Try {step.title} Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {step.id === "complete" && (
            <div className="space-y-4">
              <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <CheckCircle2 className="h-16 w-16 text-primary mx-auto" />
                    <h3 className="text-2xl font-bold">Ready to Ensure Compliance</h3>
                    <p className="text-muted-foreground">
                      You now have an overview of all compliance modules. Select any module from the sidebar to begin your first assessment.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-3">
                {wizardSteps
                  .filter(s => s.route)
                  .map((module) => {
                    const ModuleIcon = module.icon
                    return (
                      <Button
                        key={module.id}
                        variant="outline"
                        className="h-auto py-4 flex-col gap-2"
                        onClick={() => module.route && handleStartAssessment(module.route)}
                      >
                        <ModuleIcon className={`h-6 w-6 ${module.color}`} />
                        <span className="text-sm font-medium">{module.title}</span>
                      </Button>
                    )
                  })}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          <Button variant="ghost" onClick={handleSkip}>
            Skip Tutorial
          </Button>

          {currentStep < wizardSteps.length - 1 ? (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={() => onOpenChange(false)}>
              Finish
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
