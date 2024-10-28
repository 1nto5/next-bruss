import { Locale } from '@/i18n.config';
import { DeviationType } from '@/lib/types/deviation';
import { columns } from './table/columns';
import { DataTable } from './table/data-table';

async function getCards(
  lang: string,
  test: string,
): Promise<{
  fetchTime: string;
  deviations: DeviationType[];
}> {
  const res = await fetch(`${process.env.API}/inventory/cards`, {
    next: { revalidate: 30, tags: ['deviations'] },
  });

  if (!res.ok) {
    const json = await res.json();
    throw new Error(
      `getCards error:  ${res.status}  ${res.statusText} ${json.error}`,
    );
  }

  const dateFromResponse = new Date(res.headers.get('date') || '');
  const fetchTime = dateFromResponse.toLocaleString(lang);

  const deviations: DeviationType[] = await res.json();

  const deviationsFiltered = test
    ? deviations.filter(
        (deviation: DeviationType) => deviation.articleNumber === test,
      )
    : deviations;

  const formatDeviation = (deviation: DeviationType) => {
    const formattedTimePeriod = {
      from: new Date(deviation.timePeriod.from).toLocaleDateString(lang),
      to: new Date(deviation.timePeriod.to).toLocaleDateString(lang),
    };
    return { ...deviation, timePeriodLocalDateString: formattedTimePeriod };
  };

  const deviationsFormatted = deviationsFiltered.map(formatDeviation);

  return { fetchTime, deviations: deviationsFormatted };
}

export default async function DeviationsPage({
  params: { lang },
  searchParams,
}: {
  params: { lang: Locale };
  // searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  let fetchTime, deviations;
  const { test = '' } = await searchParams;
  ({ fetchTime, deviations } = await getCards(lang, test));

  return (
    <DataTable
      columns={columns}
      data={deviations}
      fetchTime={fetchTime}
      lang={lang}
    />
  );
}
