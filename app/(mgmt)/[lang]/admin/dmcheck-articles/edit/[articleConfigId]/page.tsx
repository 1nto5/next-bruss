import { Locale } from '@/i18n.config';
// import { getDictionary } from '@/lib/dictionary';
import { ObjectId } from 'mongodb';
import { redirect } from 'next/navigation';
import { getArticleConfig } from '../../actions';
import EditArticleConfig from './components/EditArticleConfig';

export default async function EditArticleConfigPage(
  props: {
    params: Promise<{ lang: Locale; articleConfigId: string }>;
  }
) {
  const params = await props.params;

  const {
    lang,
    articleConfigId
  } = params;

  // const dict = await getDictionary(lang);
  const articleConfig = await getArticleConfig(new ObjectId(articleConfigId));
  if (!articleConfig || !articleConfig._id) {
    redirect('/admin/dmcheck-articles');
  }

  return (
    <EditArticleConfig
      lang={lang}
      articleConfigObject={{
        ...articleConfig,
        _id: articleConfig._id.toString(),
      }}
    />
  );
}
