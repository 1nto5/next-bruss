import { Locale } from '@/i18n.config';
import AddArticleConfig from './components/AddArticleConfig';

export default async function EditUserPage(
  props: {
    params: Promise<{ lang: Locale }>;
  }
) {
  const params = await props.params;

  const {
    lang
  } = params;

  return <AddArticleConfig lang={lang} />;
}
