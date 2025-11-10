import { useNavigate } from "react-router-dom"
import { useLanguage } from "@/contexts/LanguageContext"
import { t } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, FileCheck, Leaf, Database, Lock, Zap } from "lucide-react"
import { Footer } from "@/components/Footer"

const Products = () => {
  const navigate = useNavigate()
  const { language } = useLanguage()

  const products = [
    {
      icon: Shield,
      titleKey: 'products.aiact.title',
      descKey: 'products.aiact.desc',
      color: 'text-blue-500'
    },
    {
      icon: FileCheck,
      titleKey: 'products.gdpr.title',
      descKey: 'products.gdpr.desc',
      color: 'text-green-500'
    },
    {
      icon: Leaf,
      titleKey: 'products.esg.title',
      descKey: 'products.esg.desc',
      color: 'text-emerald-500'
    },
    {
      icon: Database,
      titleKey: 'products.rag.title',
      descKey: 'products.rag.desc',
      color: 'text-purple-500'
    },
    {
      icon: Lock,
      titleKey: 'products.audit.title',
      descKey: 'products.audit.desc',
      color: 'text-orange-500'
    },
    {
      icon: Zap,
      titleKey: 'products.copilots.title',
      descKey: 'products.copilots.desc',
      color: 'text-yellow-500'
    }
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">RegSense Advisor</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate("/")}>
                Home
              </Button>
              <Button variant="outline" onClick={() => navigate("/login")}>
                {t('landing.hero.signIn', language)}
              </Button>
              <Button onClick={() => navigate("/signup")}>
                {t('landing.hero.getStarted', language)}
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold mb-4">
            {t('products.hero.title', language)}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            {t('products.hero.subtitle', language)}
          </p>
        </section>

        {/* Products Grid */}
        <section className="container mx-auto px-4 pb-16">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product, index) => {
              const Icon = product.icon
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <Icon className={`h-12 w-12 mb-4 ${product.color}`} />
                    <CardTitle className="text-2xl">
                      {t(product.titleKey, language)}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {t(product.descKey, language)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => navigate("/signup")}
                    >
                      {t('products.requestDemo', language)}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 pb-16">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="py-12 text-center">
              <h2 className="text-3xl font-bold mb-4">
                {t('landing.cta.title', language)}
              </h2>
              <p className="text-lg mb-6 opacity-90">
                {t('landing.cta.subtitle', language)}
              </p>
              <Button 
                size="lg" 
                variant="secondary" 
                onClick={() => navigate("/signup")}
              >
                {t('landing.hero.freeTrial', language)}
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>

      <Footer />
    </div>
  )
}

export default Products
