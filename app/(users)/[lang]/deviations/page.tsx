import { Locale } from '@/i18n.config';
// import { getDictionary } from '@/lib/dictionary';
import { columns } from './table/columns';
import { DataTable } from './table/data-table';
import { extractNameFromEmail } from '@/lib//utils/nameFormat';
import { DeviationType } from '@/lib/types/deviation';
async function getDeviations(lang: string): Promise<{
  fetchTime: string;
  deviations: DeviationType[];
}> {
  try {
    console.log('fetching all deviations');
    const res = await fetch(`${process.env.API}/deviations/get-deviations`, {
      next: { revalidate: 0, tags: ['deviations'] },
    });
    if (!res.ok) {
      throw new Error('getting deviation reasons: ' + res.status);
    }
    const dateFromResponse = new Date(res.headers.get('date') || '');
    const fetchTime = dateFromResponse.toLocaleString(lang);
    const deviations = await res.json();
    const deviationsFormatted = deviations.map((deviation: DeviationType) => {
      const formattedTimePeriod = {
        from: new Date(deviation.timePeriod.from).toLocaleDateString(lang),
        to: new Date(deviation.timePeriod.to).toLocaleDateString(lang),
      };
      return { ...deviation, timePeriod: formattedTimePeriod };
    });
    return { fetchTime, deviations: deviationsFormatted };
  } catch (error) {
    throw new Error('Fetching all deviations error: ' + error);
  }
}

export default async function DeviationsPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const { fetchTime, deviations } = await getDeviations(lang);
  return (
    <main className='mx-auto px-4 py-4 lg:px-8'>
      <DataTable columns={columns} data={deviations} fetchTime={fetchTime} />
    </main>
  );
}
