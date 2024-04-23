import { Locale } from '@/i18n.config';
// import { getDictionary } from '@/lib/dictionary';
import { Capa, columns } from './table/columns';
import { DataTable } from './table/data-table';

async function getData(): Promise<Capa[]> {
  // Fetch data from your API here.
  try {
    const response = await fetch(`${process.env.API}/capa/getAllCapa`, {
      next: { revalidate: 600, tags: ['capa'] },
    });
    let allCapa = await response.json();
    // Sort the data by articleNumber in ascending order
    allCapa.sort((a: Capa, b: Capa) =>
      a.articleNumber.localeCompare(b.articleNumber),
    );
    allCapa = allCapa.map((capa: Capa) => {
      if (capa.editHistory && capa.editHistory.length > 0) {
        const lastEdit = new Date(
          capa.editHistory[capa.editHistory.length - 1].date,
        ).toLocaleString('pl');
        return { ...capa, lastEdit };
      }
      return capa;
    });
    return allCapa;
  } catch (error) {
    throw new Error('Fetching all capa error: ' + error);
  }
}

export default async function CapaPage({
  params: { lang, articleNumber },
}: {
  params: { lang: Locale; articleNumber: string };
}) {
  const data = await getData();
  return (
    // <main className='m-2 flex justify-center'>
    //   {' '}
    // container
    <div className='mx-auto px-12 py-4 lg:px-24'>
      <DataTable columns={columns} data={data} />
    </div>
    // </main>
  );
}
