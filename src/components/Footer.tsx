import { useLanguage } from "@/contexts/LanguageContext"
import { t } from "@/lib/i18n"
import { Link } from "react-router-dom"
import { Shield, Mail } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function Footer() {
  const { language, updateLanguage } = useLanguage()

  const handleLanguageChange = (newLang: string) => {
    updateLanguage(newLang)
  }

  return (
    <footer className="border-t bg-muted/50 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">{t('landing.hero.title', language)}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {t('footer.description', language)}
            </p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-semibold">{t('footer.dpo', language)}</p>
              <a href="mailto:privacy@regsense.dev" className="hover:text-primary flex items-center gap-1">
                <Mail className="h-3 w-3" />
                privacy@regsense.dev
              </a>
              <p className="pt-2">{t('footer.address', language)}</p>
              <p className="text-primary font-medium pt-2">✓ {t('footer.gdprCompliant', language)}</p>
              <p className="text-muted-foreground">🇪🇺 {t('footer.euHosted', language)}</p>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.products', language)}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/products" className="hover:text-primary transition-colors">
                  {t('products.aiact.title', language)}
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-primary transition-colors">
                  {t('products.gdpr.title', language)}
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-primary transition-colors">
                  {t('products.esg.title', language)}
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-primary transition-colors">
                  {t('products.audit.title', language)}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.company', language)}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/signup" className="hover:text-primary transition-colors">
                  {t('footer.about', language)}
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-primary transition-colors">
                  {t('footer.careers', language)}
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-primary transition-colors">
                  {t('footer.blog', language)}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary transition-colors">
                  {t('footer.contact', language)}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Language */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.legal', language)}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
              <li>
                <Link to="/privacy-policy" className="hover:text-primary transition-colors">
                  {t('nav.privacyPolicy', language)}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-primary transition-colors">
                  {t('footer.termsOfService', language)}
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="hover:text-primary transition-colors">
                  {t('footer.cookiePolicy', language)}
                </Link>
              </li>
              <li>
                <Link to="/security-privacy" className="hover:text-primary transition-colors">
                  {t('footer.security', language)}
                </Link>
              </li>
              <li>
                <Link to="/dpa" className="hover:text-primary transition-colors">
                  {t('footer.dpa', language)}
                </Link>
              </li>
            </ul>

            {/* Language Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('footer.languageSelector', language)}</label>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">🇬🇧 English</SelectItem>
                  <SelectItem value="fr">🇫🇷 Français</SelectItem>
                  <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                  <SelectItem value="ar">🇸🇦 العربية</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {t('footer.copyright', language)}</p>
        </div>
      </div>
    </footer>
  )
}
