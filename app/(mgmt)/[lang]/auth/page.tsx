import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionary';
import Auth from './components/auth';

export default async function AuthPage(
  props: {
    params: Promise<{ lang: Locale }>;
  }
) {
  const params = await props.params;

  const {
    lang
  } = params;

  const dict = await getDictionary(lang);
  return <Auth cDict={dict.auth} />;
}
