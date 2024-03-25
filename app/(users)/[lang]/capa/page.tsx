import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionary';
import CapaCard from './components/capaCard';

export default async function AuthPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(lang);
  // return <main className='m-2 flex justify-center'>test</main>;
  return (
    <main className='m-2'>
      <CapaCard cDict={dict?.capa} />
    </main>
  );
}
