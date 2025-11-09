import { describe, it, expect } from 'vitest';
import { translations } from '../i18n';

type Language = 'en' | 'de' | 'fr' | 'es';

describe('i18n Translations', () => {
  const languages: Language[] = ['en', 'de', 'fr', 'es'];
  
  it('has all required languages', () => {
    expect(Object.keys(translations)).toEqual(expect.arrayContaining(languages));
  });

  it('has consistent keys across all languages', () => {
    const enKeys = Object.keys(translations.en);
    
    languages.forEach(lang => {
      const langKeys = Object.keys(translations[lang]);
      expect(langKeys).toEqual(expect.arrayContaining(enKeys));
    });
  });

  it('has no missing translations', () => {
    const enKeys = Object.keys(translations.en);
    
    languages.forEach(lang => {
      enKeys.forEach(key => {
        expect(translations[lang][key]).toBeDefined();
        expect(translations[lang][key]).not.toBe('');
      });
    });
  });

  it('translates common keys correctly', () => {
    expect(translations.en.dashboard).toBe('Dashboard');
    expect(translations.de.dashboard).toBe('Dashboard');
    expect(translations.fr.dashboard).toBe('Tableau de bord');
    expect(translations.es.dashboard).toBe('Panel de Control');
  });
});
