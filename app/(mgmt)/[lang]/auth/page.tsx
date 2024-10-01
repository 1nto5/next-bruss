import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionary';
import Auth from './components/auth';

export default async function AuthPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(lang);
  return <Auth cDict={dict.auth} />;
}
