import { useLanguage } from "@/contexts/LanguageContext"
import { t } from "@/lib/i18n"
import { Link } from "react-router-dom"
import { LanguageSelector } from "@/components/LanguageSelector"

export function Footer() {
  const { language } = useLanguage()

  return (
    <footer className="border-t bg-muted/50 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
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
                <Link to="/trust-center" className="hover:text-primary transition-colors">
                  Trust Center
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
              <label className="text-sm font-medium">{t('common.selectLanguage', language)}</label>
              <LanguageSelector />
            </div>
          </div>
        </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} {t('footer.copyright', language)} | <a href="/trust-center" className="hover:text-primary">Trust Center</a></p>
          </div>
      </div>
    </footer>
  )
}
