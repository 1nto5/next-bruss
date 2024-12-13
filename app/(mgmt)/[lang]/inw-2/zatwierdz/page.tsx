import { Locale } from '@/i18n.config';
import { CardTableDataType } from '@/lib/types/inventory';
import { columns } from './cards-table/columns';
import { DataTable } from './cards-table/data-table';

async function getCards(
  lang: string,
  searchParams: { [key: string]: string | undefined },
): Promise<{
  fetchTime: string;
  cards: CardTableDataType[];
}> {
  const res = await fetch(`${process.env.API}/inventory/cards`, {
    next: { revalidate: 30, tags: ['inventory-cards'] },
  });

  if (!res.ok) {
    const json = await res.json();
    throw new Error(
      `getCards error:  ${res.status}  ${res.statusText} ${json.error}`,
    );
  }

  const dateFromResponse = new Date(res.headers.get('date') || '');
  const fetchTime = dateFromResponse.toLocaleString(lang);

  let cards: CardTableDataType[] = await res.json();

  cards = cards.map((card) => ({
    ...card,
    positionsLength: card.positions ? card.positions.length : 0,
    approvedPositions: card.positions
      ? card.positions.filter((p) => p.approver).length
      : 0,
  }));

  cards = cards.filter((card) => card.positions && card.positions.length > 0);

  return { fetchTime, cards };
}

export default async function DeviationsPage(props: {
  params: Promise<{ lang: Locale }>;
  // searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const { lang } = params;

  let fetchTime, cards;
  // const { number = '' } = searchParams;
  ({ fetchTime, cards } = await getCards(lang, searchParams));

  return (
    <DataTable
      columns={columns}
      data={cards}
      fetchTime={fetchTime}
      lang={lang}
    />
  );
}
