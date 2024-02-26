import ReworkCard from './components/ReworkCard';
import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionary';

export default async function Rework({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(lang);
  return (
    <main className='m-2 flex justify-center'>
      <ReworkCard cDict={dict.rework} />
    </main>
  );
}
