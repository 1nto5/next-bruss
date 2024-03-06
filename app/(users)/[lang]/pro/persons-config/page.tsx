import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionary';
import TabsPersonsConfig from './components/TabsPersonsConfig';

export default async function ArticleConfig({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(lang);
  return (
    <main className='m-2 flex justify-center'>
      <TabsPersonsConfig dict={dict} lang={lang} />
    </main>
  );
}
