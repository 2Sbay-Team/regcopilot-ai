import { useLanguage } from "@/contexts/LanguageContext"
import { t } from "@/lib/i18n"
import { Link } from "react-router-dom"
import { FileText, Mail } from "lucide-react"

export function Footer() {
  const { language } = useLanguage()

  return (
    <footer className="border-t bg-background mt-auto">
      <div className="container flex flex-col items-center justify-between gap-4 py-6 md:h-16 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {new Date().getFullYear()} Compliance & ESG Copilot. All rights reserved.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/impressum"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            {t('nav.impressum', language)}
          </Link>
          <Link
            to="/contact"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            {t('nav.contactUs', language)}
          </Link>
        </div>
      </div>
    </footer>
  )
}
