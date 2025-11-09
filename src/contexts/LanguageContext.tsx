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
      if (!user) return
      
      const { data } = await supabase
        .from('profiles')
        .select('language')
        .eq('id', user.id)
        .single()
      
      if (data?.language) {
        setLanguageState(data.language)
        // Set document direction for RTL languages
        document.documentElement.dir = data.language === 'ar' ? 'rtl' : 'ltr'
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
