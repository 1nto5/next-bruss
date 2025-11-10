import { CardTableDataType } from '@/app/[lang]/inventory/lib/types';
import { Locale } from '@/lib/config/i18n';
import { formatDateTime } from '@/lib/utils/date-format';
import { getDictionary } from './lib/dict';
import { CardsDataTable } from './cards-table/cards-data-table';

async function getCards(
  lang: string,
  searchParams: { [key: string]: string | undefined },
): Promise<{
  cardsFetchTime: Date;
  cardsFetchTimeLocaleString: string;
  cards: CardTableDataType[];
}> {
  const filteredSearchParams = Object.fromEntries(
    Object.entries(searchParams).filter(
      ([_, value]) => value !== undefined,
    ) as [string, string][],
  );

  const queryParams = new URLSearchParams(filteredSearchParams).toString();
  const res = await fetch(`${process.env.API}/inventory/cards?${queryParams}`, {
    next: { revalidate: 0, tags: ['inventory-cards'] },
  });

  if (!res.ok) {
    const json = await res.json();
    throw new Error(
      `getCards error:  ${res.status}  ${res.statusText} ${json.error}`,
    );
  }

  const cardsFetchTime = new Date(res.headers.get('date') || '');
  const cardsFetchTimeLocaleString = formatDateTime(cardsFetchTime);

  let cards: CardTableDataType[] = await res.json();

  cards = cards.map((card) => ({
    ...card,
    positionsLength: card.positions ? card.positions.length : 0,
    approvedPositions: card.positions
      ? card.positions.filter((p) => p.approver).length
      : 0,
  }));

  cards = cards.filter((card) => card.positions && card.positions.length > 0);
  return { cardsFetchTime, cardsFetchTimeLocaleString, cards };
}

export default async function InventoryPage(props: {
  params: Promise<{ lang: Locale }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const { lang } = params;
  const dict = await getDictionary(lang);

  const { cardsFetchTime, cardsFetchTimeLocaleString, cards } = await getCards(
    lang,
    searchParams,
  );

  return (
    <CardsDataTable
      dict={dict}
      data={cards}
      fetchTime={cardsFetchTime}
      fetchTimeLocaleString={cardsFetchTimeLocaleString}
      lang={lang}
    />
  );
}
