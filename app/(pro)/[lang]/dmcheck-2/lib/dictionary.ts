import 'server-only';
import type { Locale } from '@/i18n.config';

const dictionaries = {
  pl: () => import('@/app/dictionaries/dmcheck-2/pl.json').then((module) => module.default),
  de: () => import('@/app/dictionaries/dmcheck-2/de.json').then((module) => module.default),
  en: () => import('@/app/dictionaries/dmcheck-2/en.json').then((module) => module.default),
  tl: () => import('@/app/dictionaries/dmcheck-2/tl.json').then((module) => module.default),
  uk: () => import('@/app/dictionaries/dmcheck-2/uk.json').then((module) => module.default),
  be: () => import('@/app/dictionaries/dmcheck-2/be.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
  if (locale === 'en') {
    return dictionaries.en();
  }
  if (locale === 'de') {
    return dictionaries.de();
  }
  if (locale === 'tl') {
    return dictionaries.tl();
  }
  if (locale === 'uk') {
    return dictionaries.uk();
  }
  if (locale === 'be') {
    return dictionaries.be();
  }
  return dictionaries.pl();
};

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;