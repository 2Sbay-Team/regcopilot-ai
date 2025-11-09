import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Circle, FileText, Users, PlayCircle, Sparkles, ArrowRight, X } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Step {
  id: number
  title: string
  description: string
  icon: React.ReactNode
  actionLabel: string
  actionRoute?: string
  tooltip: string
  completed: boolean
}

interface AdminOnboardingWizardProps {
  open: boolean
  onClose: () => void
}

export const AdminOnboardingWizard = ({ open, onClose }: AdminOnboardingWizardProps) => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [steps, setSteps] = useState<Step[]>([
    {
      id: 1,
      title: "Upload Regulatory Framework",
      description: "Start by uploading official regulation PDFs (EU AI Act, GDPR, CSRD) to power the RAG system with authoritative compliance knowledge.",
      icon: <FileText className="h-8 w-8 text-primary" />,
      actionLabel: "Upload Regulations",
      actionRoute: "/admin/regulations",
      tooltip: "The RAG (Retrieval-Augmented Generation) system needs official regulatory documents to provide accurate compliance guidance. Upload PDFs to create a searchable knowledge base.",
      completed: false
    },
    {
      id: 2,
      title: "Assign User Roles",
      description: "Configure your team by assigning roles (Admin, Analyst, Auditor, Viewer) to control access and permissions across the platform.",
      icon: <Users className="h-8 w-8 text-primary" />,
      actionLabel: "Manage Users",
      actionRoute: "/admin",
      tooltip: "Role-based access control ensures team members have appropriate permissions. Admins have full access, Analysts can create assessments, Auditors can review, and Viewers have read-only access.",
      completed: false
    },
    {
      id: 3,
      title: "Run Test Assessment",
      description: "Try out the AI Act Auditor by running a test assessment on a sample AI system to see the platform in action.",
      icon: <PlayCircle className="h-8 w-8 text-primary" />,
      actionLabel: "Start Test Assessment",
      actionRoute: "/ai-act-copilot",
      tooltip: "Running a test assessment helps you understand the workflow: input AI system details, get risk classification, receive compliance recommendations, and view audit trails.",
      completed: false
    }
  ])

  const completedSteps = steps.filter(s => s.completed).length
  const progress = (completedSteps / steps.length) * 100

  const handleStepAction = (step: Step) => {
    if (step.actionRoute) {
      onClose()
      navigate(step.actionRoute)
      markStepComplete(step.id)
    }
  }

  const markStepComplete = (stepId: number) => {
    setSteps(prev => prev.map(s => 
      s.id === stepId ? { ...s, completed: true } : s
    ))
    // Persist to localStorage
    const wizardState = JSON.parse(localStorage.getItem('admin_wizard_state') || '{}')
    wizardState[`step_${stepId}`] = true
    localStorage.setItem('admin_wizard_state', JSON.stringify(wizardState))
  }

  const handleSkipWizard = () => {
    localStorage.setItem('admin_wizard_skipped', 'true')
    onClose()
  }

  const handleCompleteWizard = () => {
    localStorage.setItem('admin_wizard_completed', 'true')
    onClose()
  }

  // Load saved state
  useEffect(() => {
    const wizardState = JSON.parse(localStorage.getItem('admin_wizard_state') || '{}')
    setSteps(prev => prev.map(s => ({
      ...s,
      completed: wizardState[`step_${s.id}`] || false
    })))
  }, [])

  const allStepsComplete = steps.every(s => s.completed)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <DialogTitle className="text-2xl">Admin Quick Start Guide</DialogTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSkipWizard}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            Complete these 3 steps to set up your compliance platform and start your first assessment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Overall Progress</span>
              <span className="text-muted-foreground">{completedSteps} of {steps.length} completed</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Steps */}
          <TooltipProvider>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <Card 
                  key={step.id} 
                  className={`transition-all ${
                    step.completed 
                      ? 'border-green-500 bg-green-50 dark:bg-green-950/20' 
                      : currentStep === index 
                        ? 'border-primary shadow-lg' 
                        : 'border-border'
                  }`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      {/* Step Icon/Status */}
                      <div className="flex-shrink-0">
                        {step.completed ? (
                          <CheckCircle className="h-8 w-8 text-green-600" />
                        ) : (
                          <Circle className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>

                      {/* Step Content */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Step {step.id}</Badge>
                          <h3 className="font-semibold text-lg">{step.title}</h3>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <Sparkles className="h-4 w-4 text-primary" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="text-sm">{step.tooltip}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>

                        <p className="text-muted-foreground">{step.description}</p>

                        {!step.completed && (
                          <Button 
                            onClick={() => handleStepAction(step)}
                            className="mt-2"
                          >
                            {step.actionLabel}
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        )}

                        {step.completed && (
                          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Completed</span>
                          </div>
                        )}
                      </div>

                      {/* Step Illustration */}
                      <div className="flex-shrink-0">
                        {step.icon}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TooltipProvider>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button variant="ghost" onClick={handleSkipWizard}>
              Skip for now
            </Button>
            
            {allStepsComplete ? (
              <Button onClick={handleCompleteWizard} className="gap-2">
                <CheckCircle className="h-4 w-4" />
                Complete Setup
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Complete all steps to finish setup
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
