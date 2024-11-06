import { Locale } from '@/i18n.config';
import AddEmployee from './components/add-many-employees-inventory';

export default async function EditUserPage(
  props: {
    params: Promise<{ lang: Locale }>;
  }
) {
  const params = await props.params;

  const {
    lang
  } = params;

  return (
    <main className='m-2 flex justify-center'>
      <AddEmployee lang={lang} />
    </main>
  );
}
