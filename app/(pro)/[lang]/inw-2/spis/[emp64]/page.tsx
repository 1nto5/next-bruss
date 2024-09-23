import { Locale } from '@/i18n.config';
import CardSelection from './components/CardSelection';

export default async function ArticleSelectionPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  return <CardSelection />;
}
