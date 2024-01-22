import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionary';
import TabsArticleConfig from './components/TabsArticleConfig';

export default async function ArticleConfig({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(lang);
  console.log(dict?.articleConfig?.tabs?.edit);
  return (
    <main className='m-2 flex justify-center'>
      <TabsArticleConfig dict={dict} />
    </main>
  );
}
