import { Locale } from '@/i18n.config';
import AddEmployee from './components/add-many-employees';

export default async function EditUserPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  return (
    <main className='m-2 flex justify-center'>
      <AddEmployee lang={lang} />
    </main>
  );
}
