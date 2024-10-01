import { Locale } from '@/i18n.config';
import AddArticleConfig from './components/AddArticleConfig';

export default async function EditUserPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  return <AddArticleConfig lang={lang} />;
}
