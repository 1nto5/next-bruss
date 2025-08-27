export const i18n = {
  defaultLocale: (process.env.DEFAULT_LOCALE || 'pl') as 'pl' | 'de' | 'en' | 'tl' | 'uk' | 'be',
  locales: ['pl', 'de', 'en', 'tl', 'uk', 'be'],
} as const;
export type Locale = (typeof i18n.locales)[number];
