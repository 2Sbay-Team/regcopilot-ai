import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './AuthContext'
import { Language, languages } from '@/i18n/config'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  updateLanguage: (lang: Language) => Promise<void>
  t: (key: string, options?: any) => string
  isRTL: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth()
  const { i18n, t: translate } = useTranslation()
  const [isRTL, setIsRTL] = useState(false)

  useEffect(() => {
    const loadLanguage = async () => {
      // Check localStorage first
      const savedLang = localStorage.getItem('i18nextLng')
      
      if (!user && savedLang) {
        i18n.changeLanguage(savedLang)
        return
      }
      
      if (!user && !savedLang) {
        // i18next will auto-detect browser language
        return
      }
      
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('language')
          .eq('id', user.id)
          .single()
        
        if (data?.language) {
          i18n.changeLanguage(data.language)
        }
      }
    }
    
    loadLanguage()
  }, [user, i18n])

  useEffect(() => {
    // Update RTL state when language changes
    const updateDirection = () => {
      const currentLang = i18n.language as Language
      const langConfig = languages[currentLang]
      const rtl = langConfig?.dir === 'rtl'
      setIsRTL(rtl)
      document.documentElement.dir = rtl ? 'rtl' : 'ltr'
      document.documentElement.lang = currentLang
    }

    updateDirection()
    i18n.on('languageChanged', updateDirection)

    return () => {
      i18n.off('languageChanged', updateDirection)
    }
  }, [i18n])

  const updateLanguage = async (lang: Language) => {
    // Update i18next
    await i18n.changeLanguage(lang)
    
    // Update in database if user is logged in
    if (user) {
      await supabase
        .from('profiles')
        .update({ language: lang })
        .eq('id', user.id)
    }
  }

  const setLanguage = (lang: Language) => {
    i18n.changeLanguage(lang)
  }

  const t = (key: string, options?: any): string => {
    const result = translate(key, options)
    return typeof result === 'string' ? result : String(result)
  }

  return (
    <LanguageContext.Provider value={{ 
      language: i18n.language as Language, 
      setLanguage, 
      updateLanguage,
      t,
      isRTL 
    }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
