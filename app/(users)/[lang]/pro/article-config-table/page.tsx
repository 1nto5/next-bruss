import { Locale } from '@/i18n.config';
// import { getDictionary } from '@/lib/dictionary';
import { columns } from './table/columns';
import { DataTable } from './table/data-table';
import { ArticleConfigType } from '@/lib/types/articleConfig';

async function getData(
  lang: string,
): Promise<{ fetchTime: string; allConfigs: ArticleConfigType[] }> {
  try {
    const response = await fetch(`${process.env.API}/pro/get-article-configs`, {
      next: { revalidate: 60 * 15, tags: ['articleConfigs'] },
    });

    const dateFromResponse = new Date(response.headers.get('date') || '');
    const fetchTime = dateFromResponse.toLocaleString(lang);

    let allConfigs = await response.json();

    return { fetchTime, allConfigs };
  } catch (error) {
    throw new Error('Fetching article configs error: ' + error);
  }
}

export default async function ArticleConfigsPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const { fetchTime, allConfigs } = await getData(lang);
  return (
    // <main className='m-2 flex justify-center'>
    //   {' '}
    // container
    <div className='mx-auto px-12 py-4 lg:px-24'>
      <DataTable columns={columns} data={allConfigs} fetchTime={fetchTime} />
    </div>
    // </main>
  );
}
