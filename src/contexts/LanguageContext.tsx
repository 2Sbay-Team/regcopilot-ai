import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './AuthContext'

interface LanguageContextType {
  language: string
  setLanguage: (lang: string) => void
  updateLanguage: (lang: string) => Promise<void>
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth()
  const [language, setLanguageState] = useState('en')

  useEffect(() => {
    const loadLanguage = async () => {
      // Check localStorage first
      const savedLang = localStorage.getItem('preferred_language')
      
      if (!user && savedLang) {
        setLanguageState(savedLang)
        document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr'
        return
      }
      
      if (!user && !savedLang) {
        // Auto-detect browser language
        const browserLang = navigator.language.split('-')[0]
        const supportedLangs = ['en', 'fr', 'de', 'ar']
        const detectedLang = supportedLangs.includes(browserLang) ? browserLang : 'en'
        setLanguageState(detectedLang)
        localStorage.setItem('preferred_language', detectedLang)
        document.documentElement.dir = detectedLang === 'ar' ? 'rtl' : 'ltr'
        return
      }
      
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('language')
          .eq('id', user.id)
          .single()
        
        if (data?.language) {
          setLanguageState(data.language)
          localStorage.setItem('preferred_language', data.language)
          document.documentElement.dir = data.language === 'ar' ? 'rtl' : 'ltr'
        }
      }
    }
    
    loadLanguage()
  }, [user])

  const updateLanguage = async (lang: string) => {
    if (!user) return
    
    // Update in database
    await supabase
      .from('profiles')
      .update({ language: lang })
      .eq('id', user.id)
    
    // Update state immediately
    setLanguageState(lang)
    
    // Update document direction
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  }

  const setLanguage = (lang: string) => {
    setLanguageState(lang)
    localStorage.setItem('preferred_language', lang)
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, updateLanguage }}>
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
