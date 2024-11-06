import { Locale } from '@/i18n.config';
import { CardType } from '@/lib/types/inventory';
import { columns } from './table/columns';
import { DataTable } from './table/data-table';

async function getCards(
  lang: string,
  test: string,
): Promise<{
  fetchTime: string;
  cards: CardType[];
}> {
  const res = await fetch(`${process.env.API}/inventory/cards`, {
    // TODO: search params
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

  const cards: CardType[] = await res.json();

  return { fetchTime, cards };
}

export default async function DeviationsPage(
  props: {
    params: Promise<{ lang: Locale }>;
    // searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
    searchParams: Promise<{ [key: string]: string | undefined }>;
  }
) {
  const params = await props.params;

  const {
    lang
  } = params;

  let fetchTime, cards;
  const { test = '' } = await searchParams;
  ({ fetchTime, cards } = await getCards(lang, test));

  return (
    <DataTable
      columns={columns}
      data={cards}
      fetchTime={fetchTime}
      lang={lang}
    />
  );
}
