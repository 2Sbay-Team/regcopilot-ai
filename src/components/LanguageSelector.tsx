import { useLanguage } from "@/contexts/LanguageContext"
import { languages, Language } from "@/i18n/config"
import { Globe, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface LanguageSelectorProps {
  variant?: "default" | "ghost" | "outline"
  showLabel?: boolean
}

export function LanguageSelector({ 
  variant = "outline", 
  showLabel = true 
}: LanguageSelectorProps) {
  const { language, updateLanguage } = useLanguage()

  const languageNames: Record<Language, string> = {
    en: "English",
    de: "Deutsch",
    fr: "Français",
    ar: "العربية"
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} className="gap-2">
          <Globe className="h-4 w-4" />
          {showLabel && <span>{languageNames[language]}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 bg-popover border-border"
      >
        {Object.entries(languages).map(([code, config]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => updateLanguage(code as Language)}
            className="cursor-pointer justify-between"
          >
            <span>{languageNames[code as Language]}</span>
            {language === code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
