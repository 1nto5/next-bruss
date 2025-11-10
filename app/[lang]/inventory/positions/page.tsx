import { CardPositionsTableDataType } from '@/app/[lang]/inventory/lib/types';
import { Locale } from '@/lib/config/i18n';
import { extractNameFromEmail } from '@/lib/utils/name-format';
import { formatDate, formatDateTime } from '@/lib/utils/date-format';
import { getDictionary } from '../lib/dict';
import { PositionsDataTable } from '../positions-table/positions-data-table';

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
      `getPositions error:  ${res.status}  ${res.statusText} ${json.error}`,
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

  positions = positions.map((position) => ({
    ...position,
    timeLocaleString: formatDateTime(position.time),
    approver: position.approver ? extractNameFromEmail(position.approver) : '',
    deliveryDateLocaleString:
      position.deliveryDate && formatDate(position.deliveryDate),
  }));

  return {
    positionsFetchTime,
    positionsFetchTimeLocaleString,
    positions,
  };
}

export default async function InventoryPositionsPage(props: {
  params: Promise<{ lang: Locale }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const { lang } = params;
  const dict = await getDictionary(lang);

  const { positionsFetchTime, positionsFetchTimeLocaleString, positions } =
    await getPositions(lang, searchParams);

  return (
    <PositionsDataTable
      dict={dict}
      data={positions}
      fetchTime={positionsFetchTime}
      lang={lang}
    />
  );
}
