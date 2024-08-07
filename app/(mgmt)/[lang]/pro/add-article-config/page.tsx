import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionary';
import AddArticleConfig from './components/AddArticleConfig';

export default async function ArticleConfig({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(lang);
  return (
    <main className='m-2 flex justify-center'>
      <AddArticleConfig dict={dict} lang={lang} />
    </main>
  );
}
