import {
  CardPositionsTableDataType,
  CardTableDataType,
} from '@/app/[lang]/inventory/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Locale } from '@/lib/config/i18n';
import { extractNameFromEmail } from '@/lib/utils/name-format';
import { formatDate, formatDateTime } from '@/lib/utils/date-format';
import { getDictionary } from './lib/dict';
import { CardsDataTable } from './cards-table/cards-data-table';
import { PositionsDataTable } from './positions-table/positions-data-table';

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

async function getPositions(
  lang: string,
  searchParams: { [key: string]: string | undefined },
): Promise<{
  positionsFetchTime: Date;
  positionsFetchTimeLocaleString: string;
  positions: CardPositionsTableDataType[];
}> {
  const filteredSearchParams = Object.fromEntries(
    Object.entries(searchParams).filter(
      ([_, value]) => value !== undefined,
    ) as [string, string][],
  );

  const queryParams = new URLSearchParams(filteredSearchParams).toString();
  const res = await fetch(`${process.env.API}/inventory/positions?${queryParams}`, {
    next: { revalidate: 0, tags: ['inventory-positions'] },
  });

  if (!res.ok) {
    const json = await res.json();
    throw new Error(
      `getCardPositions error:  ${res.status}  ${res.statusText} ${json.error}`,
    );
  }

  const positionsFetchTime = new Date(res.headers.get('date') || '');
  const positionsFetchTimeLocaleString = formatDateTime(positionsFetchTime);

  const resJson: {
    positions: CardPositionsTableDataType[];
    cardWarehouse: string;
    cardSector: string;
    cardCreators: string[];
  } = await res.json();
  let positions = resJson.positions;
  const cardWarehouse = resJson.cardWarehouse;
  const cardSector = resJson.cardSector;
  const cardCreators = resJson.cardCreators;
  positions = positions.map((position) => ({
    ...position,
    timeLocaleString: formatDateTime(position.time),
    approver: position.approver ? extractNameFromEmail(position.approver) : '',
    deliveryDateLocaleString:
      position.deliveryDate &&
      formatDate(position.deliveryDate),
  }));

  return {
    positionsFetchTime,
    positionsFetchTimeLocaleString,
    positions,
  };
}

export default async function InventoryPage(props: {
  params: Promise<{ lang: Locale }>;
  // searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const { lang } = params;
  const dict = await getDictionary(lang);

  let positionsFetchTime, cardsFetchTime, cards, positions;
  let cardsFetchTimeLocaleString, positionsFetchTimeLocaleString;
  ({ cardsFetchTime, cardsFetchTimeLocaleString, cards } = await getCards(lang, searchParams));
  ({ positionsFetchTime, positionsFetchTimeLocaleString, positions } = await getPositions(lang, searchParams));

  return (
    <Tabs defaultValue='cards'>
      <TabsList className='grid w-full grid-cols-2'>
        <TabsTrigger value='cards'>{dict.tabs.cards}</TabsTrigger>
        <TabsTrigger value='positions'>{dict.tabs.positions}</TabsTrigger>
      </TabsList>
      <TabsContent value='cards'>
        <CardsDataTable
          dict={dict}
          data={cards}
          fetchTime={cardsFetchTime}
          fetchTimeLocaleString={cardsFetchTimeLocaleString}
          lang={lang}
        />
      </TabsContent>
      <TabsContent value='positions'>
        <PositionsDataTable
          dict={dict}
          fetchTime={positionsFetchTime}
          fetchTimeLocaleString={positionsFetchTimeLocaleString}
          data={positions}
          lang={lang}
        />
      </TabsContent>
    </Tabs>
  );
}
