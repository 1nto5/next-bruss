import 'server-only';
import type { Locale } from '@/i18n.config';

const dictionaries = {
  pl: () => import('@/app/dictionaries/oven/pl.json').then((module) => module.default),
  de: () => import('@/app/dictionaries/oven/de.json').then((module) => module.default),
  en: () => import('@/app/dictionaries/oven/en.json').then((module) => module.default),
  tl: () => import('@/app/dictionaries/oven/tl.json').then((module) => module.default),
  uk: () => import('@/app/dictionaries/oven/uk.json').then((module) => module.default),
  be: () => import('@/app/dictionaries/oven/be.json').then((module) => module.default),
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