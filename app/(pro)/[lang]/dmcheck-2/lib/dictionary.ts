import 'server-only';
import type { Locale } from '@/i18n.config';

const dictionaries = {
  pl: () => import('@/app/dictionaries/dmcheck2/pl.json').then((module) => module.default),
  de: () => import('@/app/dictionaries/dmcheck2/de.json').then((module) => module.default),
  en: () => import('@/app/dictionaries/dmcheck2/en.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
  if (locale === 'en') {
    return dictionaries.en();
  }
  if (locale === 'de') {
    return dictionaries.de();
  }
  return dictionaries.pl();
};

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;