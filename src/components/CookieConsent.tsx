import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useTranslation } from "@/i18n/useTranslation"
import { Shield, X, User, Monitor, ChevronDown } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface CookiePreferences {
  essential: boolean
  functional: boolean
  analytics: boolean
}

export function CookieConsent() {
  const { t } = useTranslation()
  const [isVisible, setIsVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [learnMoreOpen, setLearnMoreOpen] = useState(false)
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
        <CardHeader className="relative pb-3">
          <div className="flex items-start gap-3">
            <Shield className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
            <div className="flex-1">
              <CardTitle className="text-xl">{String(t('cookies.title'))}</CardTitle>
              <CardDescription className="mt-2 text-sm">
                {String(t('cookies.subtitle'))}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4"
              onClick={rejectAll}
              aria-label="Close cookie banner"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <User className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm">{String(t('cookies.personalizedAds'))}</p>
            </div>
            
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Monitor className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm">{String(t('cookies.storeAccess'))}</p>
            </div>

            <Collapsible open={learnMoreOpen} onOpenChange={setLearnMoreOpen}>
              <CollapsibleTrigger className="flex items-center gap-2 text-sm text-primary hover:underline">
                <ChevronDown className={`h-4 w-4 transition-transform ${learnMoreOpen ? 'rotate-180' : ''}`} />
                {String(t('cookies.learnMore'))}
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 space-y-2 text-xs text-muted-foreground">
                <p>{String(t('cookies.dataProcessing'))}</p>
                <p>{String(t('cookies.vendorInfo'))}</p>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {showDetails && (
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="space-y-1 flex-1">
                  <Label className="text-sm font-semibold">{String(t('cookies.essential'))}</Label>
                  <p className="text-xs text-muted-foreground">
                    {String(t('cookies.essentialDesc'))}
                  </p>
                </div>
                <Switch checked={true} disabled />
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="space-y-1 flex-1">
                  <Label htmlFor="functional" className="text-sm font-semibold">{String(t('cookies.functional'))}</Label>
                  <p className="text-xs text-muted-foreground">
                    {String(t('cookies.functionalDesc'))}
                  </p>
                </div>
                <Switch
                  id="functional"
                  checked={preferences.functional}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, functional: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="space-y-1 flex-1">
                  <Label htmlFor="analytics" className="text-sm font-semibold">{String(t('cookies.analytics'))}</Label>
                  <p className="text-xs text-muted-foreground">
                    {String(t('cookies.analyticsDesc'))}
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

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowDetails(!showDetails)}
              className="w-full sm:w-auto order-1 sm:order-1"
            >
              {showDetails ? String(t('cookies.hideDetails')) : String(t('cookies.manageOptions'))}
            </Button>
            <div className="flex gap-2 flex-1 order-2">
              {showDetails && (
                <Button
                  onClick={acceptSelected}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  {String(t('cookies.savePreferences'))}
                </Button>
              )}
              {!showDetails && (
                <Button
                  onClick={acceptAll}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  {String(t('cookies.consent'))}
                </Button>
              )}
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            {String(t('cookies.footer')).split('Cookie Policy')[0]}
            <a href="/cookies" className="underline hover:text-primary">Cookie Policy</a>
            {String(t('cookies.footer')).split('Cookie Policy')[1]?.split('Privacy Policy')[0]}
            <a href="/privacy-policy" className="underline hover:text-primary">Privacy Policy</a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
