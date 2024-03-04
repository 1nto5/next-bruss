import ExportCard from './components/ExportCard';
import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionary';

export default async function ExportData({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(lang);
  const articlesConfigJson = await fetch(
    `${process.env.API}/generate-excel/article-configs`,
    {
      next: { tags: ['articles-config'], revalidate: 60 * 24 * 24 },
    },
  );
  const articlesConfig = await articlesConfigJson.json();

  return (
    <main className='m-2 flex justify-center'>
      <ExportCard cDict={dict.exportData} articlesConfig={articlesConfig} />
    </main>
  );
}
