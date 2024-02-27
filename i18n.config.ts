export const i18n = {
  defaultLocale: 'pl',
  // locales: ['en', 'pl', 'de'],
  locales: ['pl', 'de'],
} as const;
export type Locale = (typeof i18n.locales)[number];
