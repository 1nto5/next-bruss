import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { i18n } from '@/lib/config/i18n';

import { match as matchLocale } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';

function isValidLocale(locale: string): boolean {
  try {
    // Filter out wildcards and obviously invalid values
    if (!locale || locale === '*' || locale.length < 2 || /^\d+$/.test(locale)) {
      return false;
    }

    // Test if the locale is valid using Intl.getCanonicalLocales
    Intl.getCanonicalLocales([locale]);
    return true;
  } catch {
    return false;
  }
}

function getLocale(request: NextRequest): string | undefined {
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  // @ts-ignore locales are readonly
  const locales: string[] = i18n.locales;
  const allLanguages = new Negotiator({ headers: negotiatorHeaders }).languages();

  // Filter out invalid locale identifiers to prevent Intl errors
  const validLanguages = allLanguages.filter(isValidLocale);

  try {
    const locale = matchLocale(validLanguages, locales, i18n.defaultLocale);
    return locale;
  } catch (error) {
    // If matching still fails, fallback to default locale
    console.warn('Locale matching failed:', error);
    return i18n.defaultLocale;
  }
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const search = request.nextUrl.search; // Get the query string

  // // `/_next/` and `/api/` are ignored by the watcher, but we need to ignore files in `public` manually.
  // // If you have one
  if (
    [
      '/logo.png',
      '/ok.wav',
      '/nok.mp3',
      '/oven-in.wav',
      '/oven-out.wav',
      '/eol74_dmc.png',
      // Your other files in `public`
    ].includes(pathname) ||
    pathname.startsWith('/flags/')
  )
    return;

  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) =>
      !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
  );

  // Redirect if there is no locale
  // if (pathnameIsMissingLocale) {
  //   const locale = getLocale(request);
  //   return NextResponse.redirect(
  //     new URL(
  //       `/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`,
  //       request.url,
  //     ),
  //   );
  // }
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);
    return NextResponse.redirect(
      new URL(
        `/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}${search}`,
        request.url,
      ),
    );
  }
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
