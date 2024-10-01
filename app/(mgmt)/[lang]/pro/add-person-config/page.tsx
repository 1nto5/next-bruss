import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionary';
import AddPersonConfig from './components/add-person-config';

export default async function ArticleConfig({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(lang);
  return <AddPersonConfig cDict={dict?.personsConfig} lang={lang} />;
}
