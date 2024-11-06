import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionary';
import AddArticleConfig from './components/add-article-config';

export default async function ArticleConfig(
  props: {
    params: Promise<{ lang: Locale }>;
  }
) {
  const params = await props.params;

  const {
    lang
  } = params;

  const dict = await getDictionary(lang);
  return <AddArticleConfig dict={dict} lang={lang} />;
}
