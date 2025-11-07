import {
  CardPositionsTableDataType,
  CardTableDataType,
} from '@/app/[lang]/inw-2/zatwierdz/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Locale } from '@/lib/config/i18n';
import { extractNameFromEmail } from '@/lib/utils/name-format';
import { formatDate, formatDateTime } from '@/lib/utils/date-format';
import { getDictionary } from '../lib/dict';
import { CardsDataTable } from './cards-table/cards-data-table';
import { PositionsDataTable } from './positions-table/positions-data-table';

async function getCards(
  lang: string,
  searchParams: { [key: string]: string | undefined },
): Promise<{
  cardsFetchTime: string;
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
  const cardsFetchTime = formatDateTime(dateFromResponse);

  let cards: CardTableDataType[] = await res.json();

  cards = cards.map((card) => ({
    ...card,
    positionsLength: card.positions ? card.positions.length : 0,
    approvedPositions: card.positions
      ? card.positions.filter((p) => p.approver).length
      : 0,
  }));

  cards = cards.filter((card) => card.positions && card.positions.length > 0);
  return { cardsFetchTime, cards };
}

async function getPositions(
  lang: string,
  searchParams: { [key: string]: string | undefined },
): Promise<{
  positionsFetchTime: string;
  positions: CardPositionsTableDataType[];
}> {
  const res = await fetch(`${process.env.API}/inventory/positions`, {
    next: { revalidate: 30, tags: ['inventory-positions'] },
  });

  if (!res.ok) {
    const json = await res.json();
    throw new Error(
      `getCardPositions error:  ${res.status}  ${res.statusText} ${json.error}`,
    );
  }

  const dateFromResponse = new Date(res.headers.get('date') || '');
  const positionsFetchTime = formatDateTime(dateFromResponse);

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
  // const { number = '' } = searchParams;
  ({ cardsFetchTime, cards } = await getCards(lang, searchParams));
  ({ positionsFetchTime, positions } = await getPositions(lang, searchParams));

  return (
    <Tabs defaultValue='cards'>
      <TabsList className='grid w-full grid-cols-2'>
        <TabsTrigger value='cards'>Karty</TabsTrigger>
        <TabsTrigger value='positions'>Pozycje</TabsTrigger>
      </TabsList>
      <TabsContent value='cards'>
        <CardsDataTable
          data={cards}
          fetchTime={cardsFetchTime}
          lang={lang}
        />
      </TabsContent>
      <TabsContent value='positions'>
        <PositionsDataTable
          dict={dict}
          fetchTime={positionsFetchTime}
          data={positions}
          lang={lang}
        />
      </TabsContent>
    </Tabs>
  );
}
