import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionary';
import AddCapa from './components/AddCapa';

export default async function AddCapaPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  // const dict = await getDictionary(lang);
  return (
    <main className='m-2 flex justify-center'>
      <AddCapa />
    </main>
  );
}
