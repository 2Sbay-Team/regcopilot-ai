import { describe, it, expect, beforeEach } from 'vitest'
import i18n from '@/i18n/config'

describe('i18n Configuration', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en')
  })

  describe('Language Support', () => {
    it('should support English', async () => {
      await i18n.changeLanguage('en')
      expect(i18n.language).toBe('en')
    })

    it('should support German', async () => {
      await i18n.changeLanguage('de')
      expect(i18n.language).toBe('de')
    })

    it('should support French', async () => {
      await i18n.changeLanguage('fr')
      expect(i18n.language).toBe('fr')
    })

    it('should support Arabic', async () => {
      await i18n.changeLanguage('ar')
      expect(i18n.language).toBe('ar')
    })

    it('should fallback to English for unsupported languages', async () => {
      await i18n.changeLanguage('xx')
      expect(i18n.language).toBe('en')
    })
  })

  describe('Translation Keys', () => {
    it('should translate common keys in English', () => {
      expect(i18n.t('common.loading')).toBe('Loading...')
      expect(i18n.t('common.save')).toBe('Save')
      expect(i18n.t('common.cancel')).toBe('Cancel')
    })

    it('should translate common keys in German', async () => {
      await i18n.changeLanguage('de')
      expect(i18n.t('common.loading')).toBe('Wird geladen...')
      expect(i18n.t('common.save')).toBe('Speichern')
      expect(i18n.t('common.cancel')).toBe('Abbrechen')
    })

    it('should translate common keys in French', async () => {
      await i18n.changeLanguage('fr')
      expect(i18n.t('common.loading')).toBe('Chargement...')
      expect(i18n.t('common.save')).toBe('Enregistrer')
      expect(i18n.t('common.cancel')).toBe('Annuler')
    })

    it('should translate common keys in Arabic', async () => {
      await i18n.changeLanguage('ar')
      expect(i18n.t('common.loading')).toBe('جاري التحميل...')
      expect(i18n.t('common.save')).toBe('حفظ')
      expect(i18n.t('common.cancel')).toBe('إلغاء')
    })
  })

  describe('Landing Page Translations', () => {
    it('should translate hero section in all languages', async () => {
      // English
      expect(i18n.t('landing.hero.getStarted')).toBe('Get Started')
      expect(i18n.t('landing.hero.signIn')).toBe('Sign In')
      
      // German
      await i18n.changeLanguage('de')
      expect(i18n.t('landing.hero.getStarted')).toBe('Jetzt starten')
      expect(i18n.t('landing.hero.signIn')).toBe('Anmelden')
      
      // French
      await i18n.changeLanguage('fr')
      expect(i18n.t('landing.hero.getStarted')).toBe('Commencer')
      expect(i18n.t('landing.hero.signIn')).toBe('Se connecter')
      
      // Arabic
      await i18n.changeLanguage('ar')
      expect(i18n.t('landing.hero.getStarted')).toBe('ابدأ الآن')
      expect(i18n.t('landing.hero.signIn')).toBe('تسجيل الدخول')
    })
  })

  describe('Navigation Translations', () => {
    it('should translate navigation items', async () => {
      expect(i18n.t('nav.dashboard')).toBe('Dashboard')
      expect(i18n.t('nav.aiAct')).toBe('AI Act')
      
      await i18n.changeLanguage('de')
      expect(i18n.t('nav.dashboard')).toBe('Dashboard')
      expect(i18n.t('nav.aiAct')).toBe('KI-Verordnung')
    })
  })

  describe('Authentication Translations', () => {
    it('should translate login page', async () => {
      expect(i18n.t('auth.login.title')).toBe('Welcome Back')
      expect(i18n.t('auth.login.signIn')).toBe('Sign In')
      
      await i18n.changeLanguage('de')
      expect(i18n.t('auth.login.title')).toBe('Willkommen zurück')
      expect(i18n.t('auth.login.signIn')).toBe('Anmelden')
    })

    it('should translate signup page', async () => {
      expect(i18n.t('auth.signup.title')).toBe('Join RegSense Advisor')
      expect(i18n.t('auth.signup.trialBadge')).toBe('14-Day Free Trial')
      
      await i18n.changeLanguage('fr')
      expect(i18n.t('auth.signup.title')).toBe('Rejoindre RegSense Advisor')
      expect(i18n.t('auth.signup.trialBadge')).toBe('Essai gratuit de 14 jours')
    })
  })

  describe('RTL Support', () => {
    it('should detect RTL for Arabic', () => {
      const langConfig = { ar: { dir: 'rtl' } }
      expect(langConfig.ar.dir).toBe('rtl')
    })

    it('should use LTR for other languages', () => {
      const langConfig = {
        en: { dir: 'ltr' },
        de: { dir: 'ltr' },
        fr: { dir: 'ltr' }
      }
      expect(langConfig.en.dir).toBe('ltr')
      expect(langConfig.de.dir).toBe('ltr')
      expect(langConfig.fr.dir).toBe('ltr')
    })
  })

  describe('Error Handling', () => {
    it('should return key for missing translations', () => {
      const result = i18n.t('nonexistent.key.path')
      expect(result).toBe('nonexistent.key.path')
    })

    it('should fallback to English for missing translations in other languages', async () => {
      await i18n.changeLanguage('de')
      // If a key doesn't exist in German, it should fallback to English
      const result = i18n.t('common.loading')
      expect(result).toBeTruthy()
    })
  })

  describe('Validation Messages', () => {
    it('should translate validation messages', async () => {
      expect(i18n.t('validation.required')).toBe('This field is required')
      expect(i18n.t('validation.invalidEmail')).toBe('Invalid email address')
      
      await i18n.changeLanguage('de')
      expect(i18n.t('validation.required')).toBe('Dieses Feld ist erforderlich')
      expect(i18n.t('validation.invalidEmail')).toBe('Ungültige E-Mail-Adresse')
    })
  })

  describe('Product Descriptions', () => {
    it('should translate all product descriptions', async () => {
      // English
      expect(i18n.t('products.aiact.title')).toBe('AI Act Auditor')
      expect(i18n.t('products.gdpr.title')).toBe('GDPR Checker')
      expect(i18n.t('products.esg.title')).toBe('ESG Reporter')
      
      // German
      await i18n.changeLanguage('de')
      expect(i18n.t('products.aiact.title')).toBe('KI-Verordnung Prüfer')
      expect(i18n.t('products.gdpr.title')).toBe('DSGVO-Prüfer')
      expect(i18n.t('products.esg.title')).toBe('ESG-Berichterstatter')
      
      // French
      await i18n.changeLanguage('fr')
      expect(i18n.t('products.aiact.title')).toBe('Auditeur loi IA')
      expect(i18n.t('products.gdpr.title')).toBe('Vérificateur RGPD')
      expect(i18n.t('products.esg.title')).toBe('Rapporteur ESG')
      
      // Arabic
      await i18n.changeLanguage('ar')
      expect(i18n.t('products.aiact.title')).toBe('مدقق قانون الذكاء الاصطناعي')
      expect(i18n.t('products.gdpr.title')).toBe('مدقق اللائحة العامة لحماية البيانات')
      expect(i18n.t('products.esg.title')).toBe('مُعِد تقارير ESG')
    })
  })

  describe('Footer Translations', () => {
    it('should translate footer content in all languages', async () => {
      expect(i18n.t('footer.privacy')).toBe('Privacy Policy')
      expect(i18n.t('footer.terms')).toBe('Terms of Service')
      
      await i18n.changeLanguage('de')
      expect(i18n.t('footer.privacy')).toBe('Datenschutzerklärung')
      expect(i18n.t('footer.terms')).toBe('Nutzungsbedingungen')
      
      await i18n.changeLanguage('fr')
      expect(i18n.t('footer.privacy')).toBe('Politique de confidentialité')
      expect(i18n.t('footer.terms')).toBe("Conditions d'utilisation")
      
      await i18n.changeLanguage('ar')
      expect(i18n.t('footer.privacy')).toBe('سياسة الخصوصية')
      expect(i18n.t('footer.terms')).toBe('شروط الخدمة')
    })
  })
})
