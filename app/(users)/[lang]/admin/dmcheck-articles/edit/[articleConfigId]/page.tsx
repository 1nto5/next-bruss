import { Locale } from '@/i18n.config';
// import { getDictionary } from '@/lib/dictionary';
import EditArticleConfig from './components/EditArticleConfig';
import { getArticleConfig } from '../../actions';
import { redirect } from 'next/navigation';
import { ObjectId } from 'mongodb';

export default async function EditArticleConfigPage({
  params: { lang, articleConfigId },
}: {
  params: { lang: Locale; articleConfigId: string };
}) {
  // const dict = await getDictionary(lang);
  const articleConfig = await getArticleConfig(new ObjectId(articleConfigId));
  console.log('articleConfig', articleConfig);
  if (!articleConfig || !articleConfig._id) {
    redirect('/admin/dmcheck-articles');
  }

  return (
    <main className='m-2 flex justify-center'>
      {/* <EditArticleConfig
        articleConfigObject={{
          _id: articleConfig._id.toString(),
        }}
      /> */}
    </main>
  );
}
