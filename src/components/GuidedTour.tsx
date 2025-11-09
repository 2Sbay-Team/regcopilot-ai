import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, ChevronRight, ChevronLeft, Check } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface TourStep {
  title: string
  description: string
  target?: string
  route?: string
  position?: "top" | "bottom" | "left" | "right"
}

const tours: Record<string, TourStep[]> = {
  platform: [
    {
      title: "Welcome to RegSense Advisor! 🎉",
      description: "Let's take a quick tour to get you started. We'll show you the key features in just 2 minutes.",
    },
    {
      title: "Dashboard Overview",
      description: "This is your compliance command center. See your overall compliance score, recent activity, and alerts at a glance.",
      route: "/dashboard"
    },
    {
      title: "AI Act Auditor",
      description: "Assess your AI systems for EU AI Act compliance. Classify risk levels and generate required documentation.",
      route: "/ai-act"
    },
    {
      title: "GDPR Privacy Checker",
      description: "Scan documents for personal data, handle DSARs (Data Subject Access Requests), and ensure GDPR compliance.",
      route: "/gdpr"
    },
    {
      title: "ESG Reporter",
      description: "Track sustainability metrics and generate CSRD-compliant ESG reports with AI-powered narratives.",
      route: "/esg"
    },
    {
      title: "Connectors",
      description: "Connect external data sources (AWS, SharePoint, SAP) for automated compliance monitoring.",
      route: "/connectors"
    },
    {
      title: "Model Registry",
      description: "Register and track all AI models used in your organization for governance and audit purposes.",
      route: "/model-registry"
    },
    {
      title: "Help Center",
      description: "Access FAQs, video tutorials, and comprehensive documentation anytime. Press Ctrl+K to search help content.",
      route: "/help-center"
    },
    {
      title: "You're All Set! 🚀",
      description: "That's it! You're ready to start managing compliance. Explore the platform and don't hesitate to visit the Help Center if you need assistance.",
    }
  ],
  aiact: [
    {
      title: "AI Act Compliance Made Easy",
      description: "Let's walk through how to assess an AI system for EU AI Act compliance.",
      route: "/ai-act"
    },
    {
      title: "System Information",
      description: "Start by describing your AI system: name, purpose, and deployment sector. This helps determine the risk classification.",
    },
    {
      title: "Risk Classification",
      description: "The system will classify your AI as Minimal, Limited, High, or Unacceptable Risk based on EU AI Act criteria.",
    },
    {
      title: "Generate Documentation",
      description: "For high-risk systems, automatically generate Annex IV technical documentation required for compliance.",
    },
    {
      title: "Review & Export",
      description: "Review the assessment, download the report, and track it in your compliance dashboard.",
    }
  ],
  dsar: [
    {
      title: "Handling DSARs Efficiently",
      description: "Data Subject Access Requests (DSARs) must be fulfilled within 30 days under GDPR. Here's how.",
      route: "/dsar"
    },
    {
      title: "Create DSAR Request",
      description: "Enter the data subject's email and select the request type (Access, Erasure, Portability, etc.).",
    },
    {
      title: "Automatic Data Collection",
      description: "Click 'Fulfill Request' to automatically search all connected systems for the individual's data.",
    },
    {
      title: "Review & Send Response",
      description: "Review the compiled data, ensure accuracy, and send the response to the data subject.",
    }
  ]
}

interface GuidedTourProps {
  tourId?: string
  onComplete?: () => void
  onSkip?: () => void
}

export function GuidedTour({ tourId = "platform", onComplete, onSkip }: GuidedTourProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const navigate = useNavigate()
  
  const steps = tours[tourId] || tours.platform
  const progress = ((currentStep + 1) / steps.length) * 100

  useEffect(() => {
    // Check if user has seen this tour before
    const hasSeenTour = localStorage.getItem(`tour_${tourId}_completed`)
    if (!hasSeenTour && tourId === "platform") {
      // Auto-show platform tour for new users after a short delay
      const timer = setTimeout(() => setIsOpen(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [tourId])

  const handleNext = () => {
    const nextStep = currentStep + 1
    if (nextStep < steps.length) {
      const step = steps[nextStep]
      if (step.route) {
        navigate(step.route)
      }
      setCurrentStep(nextStep)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1
      const step = steps[prevStep]
      if (step.route) {
        navigate(step.route)
      }
      setCurrentStep(prevStep)
    }
  }

  const handleComplete = () => {
    localStorage.setItem(`tour_${tourId}_completed`, "true")
    setIsOpen(false)
    setCurrentStep(0)
    onComplete?.()
  }

  const handleSkip = () => {
    localStorage.setItem(`tour_${tourId}_completed`, "true")
    setIsOpen(false)
    setCurrentStep(0)
    onSkip?.()
  }

  if (!isOpen) return null

  const currentStepData = steps[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-lg mx-4 shadow-2xl">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={handleSkip}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="pr-8">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">
                Step {currentStep + 1} of {steps.length}
              </Badge>
            </div>
            <CardTitle className="text-2xl">{currentStepData.title}</CardTitle>
            <CardDescription className="text-base mt-2">
              {currentStepData.description}
            </CardDescription>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full h-1 bg-muted rounded-full mt-4 overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardHeader>

        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={isFirstStep}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            {!isLastStep && (
              <Button variant="ghost" onClick={handleSkip}>
                Skip Tour
              </Button>
            )}
            <Button onClick={handleNext}>
              {isLastStep ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Finish
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

// Hook to trigger tour
export function useGuidedTour(tourId: string) {
  const [showTour, setShowTour] = useState(false)

  const startTour = () => {
    localStorage.removeItem(`tour_${tourId}_completed`)
    setShowTour(true)
  }

  return { showTour, startTour, setShowTour }
}
