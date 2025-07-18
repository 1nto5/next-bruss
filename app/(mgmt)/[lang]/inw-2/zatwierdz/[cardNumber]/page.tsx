import { CardPositionsTableDataType } from '@/app/(mgmt)/[lang]/inw-2/zatwierdz/lib/types';
import { Locale } from '@/i18n.config';
import { extractNameFromEmail } from '@/lib/utils/name-format';
import { columns } from './card-positions-table/columns';
import { DataTable } from './card-positions-table/data-table';

async function getCardPositions(
  lang: string,
  cardNumber: string,
  searchParams: { [key: string]: string | undefined },
): Promise<{
  fetchTime: string;
  positions: CardPositionsTableDataType[];
  cardWarehouse: string;
  cardSector: string;
  cardCreators: string[];
}> {
  const res = await fetch(
    `${process.env.API}/inventory/card-positions?card-number=${cardNumber}`,
    {
      next: { revalidate: 30, tags: ['inventory-card-positions'] },
    },
  );

  if (!res.ok) {
    const json = await res.json();
    throw new Error(
      `getCardPositions error:  ${res.status}  ${res.statusText} ${json.error}`,
    );
  }

  const dateFromResponse = new Date(res.headers.get('date') || '');
  const fetchTime = dateFromResponse.toLocaleString(lang);

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
    timeLocaleString: new Date(position.time).toLocaleString(lang),
    approver: position.approver ? extractNameFromEmail(position.approver) : '',
    deliveryDateLocaleString:
      position.deliveryDate &&
      new Date(position.deliveryDate).toLocaleDateString(lang),
  }));

  return {
    fetchTime,
    positions,
    cardWarehouse,
    cardSector,
    cardCreators,
  };
}

export default async function InventoryCardPage(props: {
  params: Promise<{ lang: Locale; cardNumber: string }>;
  // searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { cardNumber, lang } = params;
  const { fetchTime, positions, cardSector, cardWarehouse, cardCreators } =
    await getCardPositions(lang, cardNumber, searchParams);

  return (
    <DataTable
      columns={columns}
      data={positions}
      fetchTime={fetchTime}
      lang={lang}
      cardNumber={cardNumber}
      cardSector={cardSector}
      cardWarehouse={cardWarehouse}
      cardCreators={cardCreators}
    />
  );
}
