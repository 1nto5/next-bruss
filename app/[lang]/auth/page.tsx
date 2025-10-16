import { Locale } from '@/lib/config/i18n';
import { getDictionary } from '@/lib/dict';
import LoginForm from './components/login-form';

export default async function AuthPage(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const params = await props.params;

  const { lang } = params;

  const dict = await getDictionary(lang);
  return <LoginForm cDict={dict.auth} lang={lang} />;
}
