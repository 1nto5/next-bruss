import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionary';
import AddPersonConfig from './components/AddPersonConfig';

export default async function ArticleConfig({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(lang);
  return (
    <main className='m-2 flex justify-center'>
      <AddPersonConfig cDict={dict?.personsConfig} lang={lang} />
    </main>
  );
}
