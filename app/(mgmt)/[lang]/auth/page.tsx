import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionary';
import Auth from './components/Auth';

export default async function AuthPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(lang);
  return (
    <main className='m-2 flex justify-center'>
      <Auth cDict={dict.auth} />
    </main>
  );
}
