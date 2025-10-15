import type { Locale } from '@/lib/config/i18n';

const dictionaries = {
  pl: () => import('../dictionaries/pl.json').then((module) => module.default),
  de: () => import('../dictionaries/de.json').then((module) => module.default),
  en: () => import('../dictionaries/en.json').then((module) => module.default),
  uk: () => import('../dictionaries/uk.json').then((module) => module.default),
  be: () => import('../dictionaries/be.json').then((module) => module.default),
  tl: () => import('../dictionaries/tl.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => dictionaries[locale]();

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;