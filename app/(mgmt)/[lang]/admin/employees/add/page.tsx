import { Locale } from '@/i18n.config';
import AddEmployee from './components/add-employee';

export default async function EditUserPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  return <AddEmployee lang={lang} />;
}
