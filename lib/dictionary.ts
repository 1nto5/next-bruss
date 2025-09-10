import 'server-only';
import type { Locale } from '@/i18n.config';
import { i18n } from '@/i18n.config';

const dictionaries = {
  pl: () => import('@/dictionaries/pl.json').then((module) => module.default),
  de: () => import('@/dictionaries/de.json').then((module) => module.default),
  en: () => import('@/dictionaries/en.json').then((module) => module.default),
};

// For non-PRO apps, we only support pl, de, en
type GlobalLocale = 'pl' | 'de' | 'en';

export const getDictionary = async (locale: Locale) => {
  const supportedLocales: GlobalLocale[] = ['pl', 'de', 'en'];
  const defaultLocale = (process.env.DEFAULT_LOCALE || i18n.defaultLocale) as GlobalLocale;
  
  const safeLocale = supportedLocales.includes(locale as GlobalLocale) 
    ? (locale as GlobalLocale) 
    : defaultLocale;
  
  return dictionaries[safeLocale]();
};
