import { Locale } from '@/i18n.config';
import { CardType } from '@/lib/types/inventory';
import { columns } from './table/columns';
import { DataTable } from './table/data-table';

async function getCards(
  lang: string,
  searchParams: { [key: string]: string | undefined },
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

  let cards: CardType[] = await res.json();

  const { number, creator, warehouse } = searchParams;
  console.log('searchParams:', searchParams);
  if (number) {
    cards = cards.filter((card) => card.number === Number(number));
  }
  if (creator) {
    cards = cards.filter((card) => card.creators.includes(creator));
  }
  if (warehouse) {
    cards = cards.filter((card) => card.warehouse === warehouse);
  }

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
