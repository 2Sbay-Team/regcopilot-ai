import { useLanguage } from "@/contexts/LanguageContext"
import { languages, Language } from "@/i18n/config"
import { ChevronDown } from "lucide-react"
import globeIcon from "@/assets/globe-icon.png"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface LanguageSelectorProps {
  variant?: "default" | "ghost" | "outline"
  showLabel?: boolean
}

export function LanguageSelector({ 
  variant = "ghost", 
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
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant={variant} 
          className="gap-2 text-foreground hover:text-foreground/80 font-normal"
          aria-label={showLabel ? undefined : "Select language"}
        >
          <img src={globeIcon} alt="Language" className="h-4 w-4" />
          {showLabel && <span>{languageNames[language]}</span>}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        align="end" 
        className="w-40 p-2 bg-popover border border-border"
      >
        <div className="flex flex-col gap-1">
          {Object.entries(languages).map(([code, config]) => (
            <button
              key={code}
              onClick={() => updateLanguage(code as Language)}
              className={`
                px-3 py-2 text-left text-sm rounded-sm
                hover:bg-accent transition-colors
                ${language === code ? 'font-medium text-primary' : 'text-foreground'}
              `}
            >
              {languageNames[code as Language]}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
