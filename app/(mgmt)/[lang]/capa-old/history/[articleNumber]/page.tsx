import { Locale } from '@/i18n.config';
// import { getDictionary } from '@/lib/dictionary';
import { extractNameFromEmail } from '@/lib/utils/name-format';
import { Capa, columns } from './table/columns';
import { DataTable } from './table/data-table';

async function getCapaHistory(
  lang: string,
  articleNumber: string,
): Promise<{ fetchTime: string; allCapa: Capa[] }> {
  const res = await fetch(
    `${process.env.API}/capa/capa-history?articleNumber=${articleNumber}`,
    {
      next: { revalidate: 60 * 15, tags: ['capaHistory'] },
    },
  );

  if (!res.ok) {
    const json = await res.json();
    throw new Error(
      `getCapaHistory error:  ${res.status}  ${res.statusText} ${json.error}`,
    );
  }

  const dateFromResponse = new Date(res.headers.get('date') || '');
  const fetchTime = dateFromResponse.toLocaleString(lang);

  let allCapa = await res.json();
  allCapa = allCapa
    .sort((a: Capa, b: Capa) => {
      const dateA = a.edited?.date ? new Date(a.edited.date) : new Date(0); // Default to epoch if undefined
      const dateB = b.edited?.date ? new Date(b.edited.date) : new Date(0); // Default to epoch if undefined
      return dateB.getTime() - dateA.getTime();
    })
    .map((capa: Capa) => {
      if (capa.edited) {
        const edited = {
          date: new Date(capa.edited.date).toLocaleString(lang),
          email: capa.edited.email,
          name: extractNameFromEmail(capa.edited.email),
        };
        return { ...capa, edited };
      }
      return capa;
    });

  return { fetchTime, allCapa };
}

export default async function CapaPage(props: {
  params: Promise<{ lang: Locale; articleNumber: string }>;
}) {
  const params = await props.params;

  const { lang, articleNumber } = params;

  const { fetchTime, allCapa } = await getCapaHistory(lang, articleNumber);
  return (
    <DataTable
      columns={columns}
      data={allCapa}
      fetchTime={fetchTime}
      articleNumber={articleNumber}
    />
  );
}
