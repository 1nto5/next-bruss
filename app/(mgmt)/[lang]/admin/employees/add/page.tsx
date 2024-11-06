import { Locale } from '@/i18n.config';
import AddEmployee from './components/add-employee';

export default async function EditUserPage(
  props: {
    params: Promise<{ lang: Locale }>;
  }
) {
  const params = await props.params;

  const {
    lang
  } = params;

  return <AddEmployee lang={lang} />;
}
