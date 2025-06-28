import { Locale } from '@/i18n.config';
// import { getDictionary } from '@/lib/dictionary';
import { ArticleConfigType } from '@/lib/types/article-config';
import { columns } from './table/columns';
import { DataTable } from './table/data-table';

async function getArticleConfigs(
  lang: string,
): Promise<{ fetchTime: string; allConfigs: ArticleConfigType[] }> {
  const res = await fetch(`${process.env.API}/admin/article-configs`, {
    next: { revalidate: 60 * 15, tags: ['articleConfigs'] },
  });

  if (!res.ok) {
    const json = await res.json();
    throw new Error(
      `getArticleConfigs error:  ${res.status}  ${res.statusText} ${json.error}`,
    );
  }

  const dateFromResponse = new Date(res.headers.get('date') || '');
  const fetchTime = dateFromResponse.toLocaleString(lang);

  let allConfigs = await res.json();

  return { fetchTime, allConfigs };
}

export default async function ArticleConfigsPage(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const params = await props.params;

  const { lang } = params;

  const { fetchTime, allConfigs } = await getArticleConfigs(lang);
  return (
    <DataTable columns={columns} data={allConfigs} fetchTime={fetchTime} />
  );
}
