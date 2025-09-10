import { Locale } from '@/i18n.config';
import { getDictionary } from '@/lib/dictionary';
import ExportCard from './components/export-card';

export default async function ExportData(
  props: {
    params: Promise<{ lang: Locale }>;
  }
) {
  const params = await props.params;

  const {
    lang
  } = params;

  const dict = await getDictionary(lang);
  const articlesConfigJson = await fetch(
    `${process.env.API}/generate-excel/article-configs`,
    {
      next: { tags: ['articles-config'], revalidate: 60 * 15 },
    },
  );
  const articlesConfig = await articlesConfigJson.json();

  return <ExportCard cDict={dict.exportData} articlesConfig={articlesConfig} />;
}
