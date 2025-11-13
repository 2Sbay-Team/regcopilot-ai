import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface TourStep {
  target: string;
  title: string;
  description: string;
  image?: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const tourSteps: TourStep[] = [
  {
    target: '.dashboard-header',
    title: 'Welcome to Compliance & ESG Copilot',
    description: 'Your intelligent platform for regulatory compliance and sustainability reporting.',
    position: 'bottom'
  },
  {
    target: '.copilot-modules',
    title: 'AI-Powered Copilots',
    description: 'Access specialized copilots for AI Act, GDPR, ESG, DORA, and more. Each provides automated assessments and reports.',
    position: 'right'
  },
  {
    target: '.audit-trail',
    title: 'Audit Trail',
    description: 'Every action is logged with cryptographic hashing for tamper-proof compliance records.',
    position: 'left'
  },
  {
    target: '.analytics-dashboard',
    title: 'Analytics & Insights',
    description: 'Monitor compliance scores, track progress, and identify areas for improvement.',
    position: 'top'
  },
  {
    target: '.help-center',
    title: 'AI Help Assistant',
    description: 'Get instant answers to your questions using our RAG-powered help system.',
    position: 'left'
  }
];

interface VisualOnboardingTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function VisualOnboardingTour({ onComplete, onSkip }: VisualOnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    onComplete();
  };

  const handleSkipTour = () => {
    setIsVisible(false);
    onSkip();
  };

  const step = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" />

      {/* Tour Card */}
      <Card className="fixed z-50 w-[400px] p-6 shadow-lg animate-in fade-in slide-in-from-bottom-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <h3 className="font-semibold text-lg">{step.title}</h3>
              <p className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {tourSteps.length}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSkipTour}
              className="h-8 w-8"
              aria-label="Skip onboarding tour"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress */}
          <Progress value={progress} className="h-2" />

          {/* Content */}
          <div className="space-y-3">
            {step.image && (
              <img 
                src={step.image} 
                alt={step.title}
                className="w-full h-48 object-cover rounded-md"
              />
            )}
            <p className="text-sm">{step.description}</p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <div className="flex gap-1">
              {tourSteps.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "h-2 w-2 rounded-full transition-colors",
                    index === currentStep
                      ? "bg-primary"
                      : "bg-muted"
                  )}
                />
              ))}
            </div>

            <Button
              size="sm"
              onClick={handleNext}
            >
              {currentStep === tourSteps.length - 1 ? (
                <>
                  Complete
                  <Check className="h-4 w-4 ml-1" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
}