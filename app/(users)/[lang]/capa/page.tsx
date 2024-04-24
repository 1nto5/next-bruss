import { Locale } from '@/i18n.config';
// import { getDictionary } from '@/lib/dictionary';
import { Capa, columns } from './table/columns';
import { DataTable } from './table/data-table';
import { extractNameFromEmail } from '@/lib//utils/nameFormat';

let fetched: string;

async function getData(lang: string): Promise<Capa[]> {
  // Fetch data from your API here.
  try {
    const response = await fetch(`${process.env.API}/capa/getAllCapa`, {
      next: { revalidate: 600 * 8, tags: ['capa'] },
    });
    console.log('response', response);

    const dateFromResponse = new Date(response.headers.get('date') || '');
    fetched = dateFromResponse.toLocaleString(lang);

    let allCapa = await response.json();
    // Sort the data by articleNumber in ascending order
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

    return allCapa;
  } catch (error) {
    throw new Error('Fetching all capa error: ' + error);
  }
}

export default async function CapaPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const data = await getData(lang);
  return (
    // <main className='m-2 flex justify-center'>
    //   {' '}
    // container
    <div className='mx-auto px-12 py-4 lg:px-24'>
      <DataTable columns={columns} data={data} fetched={fetched} />
    </div>
    // </main>
  );
}
