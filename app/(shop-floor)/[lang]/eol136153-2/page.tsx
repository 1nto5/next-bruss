import type { Locale } from '@/lib/config/i18n';
import App from './components/app';
import { getDictionary } from './lib/dict';

export default async function EOL136153Page({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return <App dict={dict} lang={lang} />;
}