import { Locale } from '@/i18n.config';
// import { getDictionary } from '@/lib/dictionary';
import { getCapa } from './actions';
import { redirect } from 'next/navigation';
import { Capa, columns } from './table/columns';
import { DataTable } from './table/data-table';

async function getData(): Promise<Capa[]> {
  // Fetch data from your API here.
  // console.log('test');
  try {
    const response = await fetch(`${process.env.API}/capa/getAllCapa`, {
      next: { revalidate: 0 },
    });
    const allCapa = await response.json();
    console.log('capa: ', allCapa);
    // console.log(allCapa.json());
    return allCapa;
  } catch (error) {
    throw new Error('Fetching all capa error: ' + error);
  }
  return [
    {
      client: 'Client A',
      line: 'Line 1',
      articleNumber: 'Article 123',
      articleName: 'Product XYZ',
      clientPartNumber: 'CPN-001',
      piff: 'PIFF-123',
      processDescription:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    },
    {
      client: 'Client B',
      line: 'Line 2',
      articleNumber: 'Article 456',
      articleName: 'Product ABC',
      clientPartNumber: 'CPN-002',
      piff: 'PIFF-456',
      processDescription:
        'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
    // ...
  ];
}

export default async function EditCapaPage({
  params: { lang, articleNumber },
}: {
  params: { lang: Locale; articleNumber: string };
}) {
  // // const dict = await getDictionary(lang);
  // const allCapa = await getCapa(articleNumber);
  // if (!allCapa || !allCapa.editHistory) {
  //   redirect('/allCapa');
  // }
  // // Assuming allCapa is an object of CapaType
  // if (allCapa.editHistory && allCapa.editHistory.length > 0) {
  //   const lastEdit = allCapa.editHistory[0];
  //   delete allCapa.editHistory;
  //   allCapa.lastEdit = {
  //     ...lastEdit,
  //     date: new Date(lastEdit.date).toLocaleString(lang),
  //   };
  // }
  const data = await getData();
  return (
    // <main className='m-2 flex justify-center'>
    //   {' '}
    <div className='container mx-auto py-10'>
      <DataTable columns={columns} data={data} />
    </div>
    // </main>
  );
}
