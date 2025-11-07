import { CardPositionsTableDataType } from '@/app/[lang]/inventory/lib/types';
import { Locale } from '@/lib/config/i18n';
import { extractNameFromEmail } from '@/lib/utils/name-format';
import { formatDate, formatDateTime } from '@/lib/utils/date-format';
import { getDictionary } from '../lib/dict';
import { DataTable } from './card-positions-table/data-table';

async function getCardPositions(
  lang: string,
  cardNumber: string,
  searchParams: { [key: string]: string | undefined },
): Promise<{
  fetchTime: Date;
  fetchTimeLocaleString: string;
  positions: CardPositionsTableDataType[];
  cardWarehouse: string;
  cardSector: string;
  cardCreators: string[];
}> {
  const filteredSearchParams = Object.fromEntries(
    Object.entries(searchParams).filter(
      ([_, value]) => value !== undefined,
    ) as [string, string][],
  );

  const queryParams = new URLSearchParams(filteredSearchParams).toString();
  const res = await fetch(
    `${process.env.API}/inventory/card-positions?card-number=${cardNumber}&${queryParams}`,
    {
      next: { revalidate: 0, tags: ['inventory-card-positions'] },
    },
  );

  if (!res.ok) {
    const json = await res.json();
    throw new Error(
      `getCardPositions error:  ${res.status}  ${res.statusText} ${json.error}`,
    );
  }

  const fetchTime = new Date(res.headers.get('date') || '');
  const fetchTimeLocaleString = formatDateTime(fetchTime);

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
    fetchTime,
    fetchTimeLocaleString,
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
  const dict = await getDictionary(lang);
  const { fetchTime, fetchTimeLocaleString, positions, cardSector, cardWarehouse, cardCreators } =
    await getCardPositions(lang, cardNumber, searchParams);

  return (
    <DataTable
      dict={dict}
      data={positions}
      fetchTime={fetchTime}
      fetchTimeLocaleString={fetchTimeLocaleString}
      lang={lang}
      cardNumber={cardNumber}
      cardSector={cardSector}
      cardWarehouse={cardWarehouse}
      cardCreators={cardCreators}
    />
  );
}
