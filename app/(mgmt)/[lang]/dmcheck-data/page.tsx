import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Locale } from '@/i18n.config';
import {
  ScanType,
  ScanTableDataType as TableDataType,
} from '@/lib/types/dmcheck-data';
import { dmcColumns } from './dmc-table/dmc-columns';
import { DmcDataTable } from './dmc-table/dmc-data-table';

async function getScans(
  lang: string,
  searchParams: { [key: string]: string | undefined },
): Promise<{
  fetchTime: string;
  data: TableDataType[];
}> {
  const res = await fetch(`${process.env.API}/dmcheck-data`, {
    next: { revalidate: 600, tags: ['dmcheck-data'] },
  });

  if (!res.ok) {
    const json = await res.json();
    throw new Error(
      `getScans error:  ${res.status}  ${res.statusText} ${json.error}`,
    );
  }

  const dateFromResponse = new Date(res.headers.get('date') || '');
  const fetchTime = dateFromResponse.toLocaleString(lang);

  let data: TableDataType[] = await res.json();
  data = data.map((item) => ({
    ...item,
    timeLocaleString: new Date(item.time).toLocaleString(lang),
  }));
  return { fetchTime, data };
}

export default async function InventoryPage(props: {
  params: Promise<{ lang: Locale }>;
  // searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const { lang } = params;

  let fetchTime, data;
  ({ fetchTime, data } = await getScans(lang, searchParams));

  return (
    <DmcDataTable
      columns={dmcColumns}
      data={data}
      fetchTime={fetchTime}
      lang={lang}
    />
  );
}
