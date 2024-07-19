import { Locale } from '@/i18n.config';
// import { getDictionary } from '@/lib/dictionary';
import { Capa, columns } from './table/columns';
import { DataTable } from './table/data-table';
import { extractNameFromEmail } from '@/lib//utils/nameFormat';

async function getData(
  lang: string,
): Promise<{ fetchTime: string; allCapa: Capa[] }> {
  try {
    const response = await fetch(
      `${process.env.API}/api/deviations/get-deviations`,
      {
        next: { revalidate: 0, tags: ['deviations'] },
      },
    );

    const dateFromResponse = new Date(response.headers.get('date') || '');
    const fetchTime = dateFromResponse.toLocaleString(lang);

    let allCapa = await response.json();
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
  } catch (error) {
    throw new Error('Fetching all deviations error: ' + error);
  }
}

export default async function DeviationsPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const { fetchTime, allCapa } = await getData(lang);
  return (
    <main className='mx-auto px-4 py-4 lg:px-8'>
      <DataTable columns={columns} data={allCapa} fetchTime={fetchTime} />
    </main>
  );
}
