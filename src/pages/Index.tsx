import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { t } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RoboticShieldLogo } from "@/components/RoboticShieldLogo"
import { Footer } from "@/components/Footer"
import { CookieConsent } from "@/components/CookieConsent"
import { LanguageSelector } from "@/components/LanguageSelector"
import { Shield, FileCheck, Leaf, Lock, Database, Zap } from "lucide-react"
import { useEffect } from "react"
import { analytics } from "@/lib/analytics"

const Index = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { language } = useLanguage()

  useEffect(() => {
    if (user) {
      navigate("/dashboard")
    }
  }, [user, navigate])

  useEffect(() => {
    // Track landing page view
    analytics.trackPageView('landing')
  }, [])

  const handleGetStarted = () => {
    analytics.trackButtonClick({ 
      button: 'get_started', 
      source: 'hero_section' 
    })
    navigate("/signup")
  }

  const handleSignIn = () => {
    analytics.trackButtonClick({ 
      button: 'sign_in', 
      source: 'hero_section' 
    })
    navigate("/login")
  }

  const handleStartTrial = () => {
    analytics.trackButtonClick({ 
      button: 'start_trial', 
      source: 'cta_section' 
    })
    navigate("/signup?trial=true")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <CookieConsent />
      
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RoboticShieldLogo size={32} />
              <span className="font-semibold text-lg">RegSense Advisor</span>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSelector variant="ghost" />
              <Button variant="ghost" onClick={handleSignIn}>
                {t('landing.hero.signIn', language)}
              </Button>
              <Button onClick={handleGetStarted}>
                {t('landing.hero.getStarted', language)}
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex p-8 bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl mb-6 hover:shadow-2xl transition-all duration-300">
            <RoboticShieldLogo size={96} />
          </div>
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "RegSense Advisor",
              "legalName": "RegSense Labs AB",
              "url": window.location.origin,
              "logo": `${window.location.origin}/favicon.png`,
              "description": t('landing.hero.tagline', language),
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Box 220",
                "postalCode": "101 23",
                "addressLocality": "Stockholm",
                "addressCountry": "SE"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "Data Protection Officer",
                "email": "privacy@regsense.dev"
              }
            })}
          </script>
          <h1 className="text-5xl font-bold mb-2 animate-in">
            {t('landing.hero.title', language)}
          </h1>
          <p className="text-lg text-primary font-medium mb-4 animate-in" style={{ animationDelay: "0.1s" }}>
            {t('landing.hero.subtitle', language)}
          </p>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-in" style={{ animationDelay: "0.2s" }}>
            {t('landing.hero.tagline', language)}
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              data-testid="get-started-button"
            >
              {t('landing.hero.getStarted', language)}
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={handleSignIn}
              data-testid="sign-in-button"
            >
              {t('landing.hero.signIn', language)}
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-3 mb-16">
          <Card className="cockpit-panel">
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-2" />
              <CardTitle>{t('products.aiact.title', language)}</CardTitle>
              <CardDescription>
                {t('products.aiact.desc', language)}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cockpit-panel">
            <CardHeader>
              <FileCheck className="h-10 w-10 text-primary mb-2" />
              <CardTitle>{t('products.gdpr.title', language)}</CardTitle>
              <CardDescription>
                {t('products.gdpr.desc', language)}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cockpit-panel">
            <CardHeader>
              <Leaf className="h-10 w-10 text-primary mb-2" />
              <CardTitle>{t('products.esg.title', language)}</CardTitle>
              <CardDescription>
                {t('products.esg.desc', language)}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Key Features */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-8">{t('landing.features.title', language)}</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex flex-col items-center">
              <Database className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t('products.rag.title', language)}</h3>
              <p className="text-muted-foreground">
                {t('products.rag.desc', language)}
              </p>
            </div>

            <div className="flex flex-col items-center">
              <Lock className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t('products.audit.title', language)}</h3>
              <p className="text-muted-foreground">
                {t('products.audit.desc', language)}
              </p>
            </div>

            <div className="flex flex-col items-center">
              <Zap className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t('products.copilots.title', language)}</h3>
              <p className="text-muted-foreground">
                {t('products.copilots.desc', language)}
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="py-12 text-center">
            <h2 className="text-3xl font-bold mb-4">{t('landing.cta.title', language)}</h2>
            <p className="text-lg mb-6 opacity-90">
              {t('landing.cta.subtitle', language)}
            </p>
            <Button 
              size="lg" 
              variant="secondary" 
              onClick={handleStartTrial}
              data-testid="start-trial-button"
            >
              {t('landing.hero.freeTrial', language)}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  )
}

export default Index
