// ============================================================================
// Password Strength Indicator Component
// ============================================================================

import { calculatePasswordStrength, PasswordStrength } from "@/lib/passwordValidation";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, ShieldCheck } from "lucide-react";

interface PasswordStrengthMeterProps {
  password: string;
  showFeedback?: boolean;
}

export function PasswordStrengthMeter({ password, showFeedback = true }: PasswordStrengthMeterProps) {
  if (!password) return null;

  const strength: PasswordStrength = calculatePasswordStrength(password);
  const progressValue = (strength.score / 4) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Progress 
          value={progressValue} 
          className="flex-1"
          style={{
            // @ts-ignore - Custom CSS variable
            '--progress-background': strength.color
          }}
        />
        <span 
          className="text-sm font-medium whitespace-nowrap"
          style={{ color: strength.color }}
        >
          {strength.label}
        </span>
      </div>

      {showFeedback && strength.feedback.length > 0 && (
        <Alert variant={strength.isValid ? "default" : "destructive"}>
          {strength.isValid ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>
            <div className="space-y-1">
              {strength.feedback.map((tip, idx) => (
                <div key={idx} className="text-sm flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {strength.isValid && (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
          <ShieldCheck className="h-4 w-4" />
          <span>Strong password! Your account will be secure.</span>
        </div>
      )}
    </div>
  );
}
