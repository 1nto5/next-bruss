import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionary';
import Info from './components/Info';

export default async function Home({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(lang);
  const infoDescription = (
    <>
      {dict.home.description}
      <a
        href={`mailto:support@bruss-group.com?subject=Next BRUSS: zgłoszenie błędu`}
        className='text-blue-600 hover:text-blue-800'
      >
        adrian.antosiak@bruss-group.com
      </a>
      .
    </>
  );
  return (
    <main className='m-2 flex justify-center'>
      <Info title={dict?.home?.title} description={infoDescription} />
    </main>
  );
}
