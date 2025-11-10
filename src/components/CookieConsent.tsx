import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/contexts/LanguageContext"
import { t } from "@/lib/i18n"
import { Shield, X } from "lucide-react"

interface CookiePreferences {
  essential: boolean
  functional: boolean
  analytics: boolean
}

export function CookieConsent() {
  const { language } = useLanguage()
  const [isVisible, setIsVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always true, cannot be disabled
    functional: false,
    analytics: false
  })

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent")
    if (!consent) {
      // Show banner after 1 second delay
      setTimeout(() => setIsVisible(true), 1000)
    }
  }, [])

  const acceptAll = () => {
    const allAccepted = {
      essential: true,
      functional: true,
      analytics: true
    }
    saveCookiePreferences(allAccepted)
    setIsVisible(false)
  }

  const acceptSelected = () => {
    saveCookiePreferences(preferences)
    setIsVisible(false)
  }

  const rejectAll = () => {
    const essentialOnly = {
      essential: true,
      functional: false,
      analytics: false
    }
    saveCookiePreferences(essentialOnly)
    setIsVisible(false)
  }

  const saveCookiePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem("cookie-consent", JSON.stringify(prefs))
    localStorage.setItem("cookie-consent-date", new Date().toISOString())
    
    // Apply preferences
    if (!prefs.analytics) {
      // Disable analytics cookies
      document.cookie.split(";").forEach((c) => {
        if (c.trim().startsWith("_ga") || c.trim().startsWith("_gid")) {
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`)
        }
      })
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl animate-in slide-in-from-bottom-4">
        <CardHeader className="relative">
          <div className="flex items-start gap-3">
            <Shield className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
            <div className="flex-1">
              <CardTitle className="text-xl">Cookie Preferences</CardTitle>
              <CardDescription className="mt-2">
                We use cookies to enhance your experience, analyze site traffic, and provide personalized content. 
                All data is processed in accordance with GDPR and stored in EU-based servers.
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4"
              onClick={rejectAll}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {showDetails && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="space-y-1 flex-1">
                  <Label className="text-base font-semibold">Essential Cookies</Label>
                  <p className="text-sm text-muted-foreground">
                    Required for authentication, security, and core functionality. Cannot be disabled.
                  </p>
                </div>
                <Switch checked={true} disabled />
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="space-y-1 flex-1">
                  <Label htmlFor="functional" className="text-base font-semibold">Functional Cookies</Label>
                  <p className="text-sm text-muted-foreground">
                    Remember your preferences (language, theme, sidebar state). Enhance user experience.
                  </p>
                </div>
                <Switch
                  id="functional"
                  checked={preferences.functional}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, functional: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="space-y-1 flex-1">
                  <Label htmlFor="analytics" className="text-base font-semibold">Analytics Cookies</Label>
                  <p className="text-sm text-muted-foreground">
                    Help us understand how you use the service to improve it. No personal data is shared with third parties.
                  </p>
                </div>
                <Switch
                  id="analytics"
                  checked={preferences.analytics}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, analytics: checked })}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowDetails(!showDetails)}
              className="w-full sm:w-auto"
            >
              {showDetails ? "Hide Details" : "Customize"}
            </Button>
            <div className="flex gap-3 flex-1">
              <Button
                variant="outline"
                onClick={rejectAll}
                className="flex-1"
              >
                Reject All
              </Button>
              {showDetails && (
                <Button
                  onClick={acceptSelected}
                  className="flex-1"
                >
                  Save Preferences
                </Button>
              )}
              {!showDetails && (
                <Button
                  onClick={acceptAll}
                  className="flex-1"
                >
                  Accept All
                </Button>
              )}
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            By continuing, you agree to our{" "}
            <a href="/cookies" className="underline hover:text-primary">Cookie Policy</a>
            {" and "}
            <a href="/privacy-policy" className="underline hover:text-primary">Privacy Policy</a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
