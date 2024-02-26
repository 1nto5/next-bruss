import ExportCard from './components/ExportCard';
import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionary';

export default async function ExportData({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(lang);
  return (
    <main className='m-2 flex justify-center'>
      <ExportCard cDict={dict.exportData} />
    </main>
  );
}
