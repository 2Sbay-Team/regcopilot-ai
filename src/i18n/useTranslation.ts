import { useTranslation as useI18nTranslation } from 'react-i18next'

/**
 * Custom hook wrapper for react-i18next
 * Provides translation function with TypeScript support
 */
export function useTranslation() {
  const { t, i18n } = useI18nTranslation()
  
  return {
    t: (key: string, options?: any) => t(key, options),
    i18n,
    language: i18n.language,
    changeLanguage: i18n.changeLanguage
  }
}
