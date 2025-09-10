import type { Locale } from '@/i18n.config';
import App from './components/app';
import { getDictionary } from './lib/dictionary';

export default async function OvenPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return <App dict={dict} lang={lang} />;
}
