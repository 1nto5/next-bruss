import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Locale } from '@/i18n.config';
import {
  ScanType,
  ScanTableDataType as TableDataType,
} from '@/lib/types/dmcheck-data';
import { dmcColumns } from './dmc-table/dmc-columns';
import { DmcDataTable } from './dmc-table/dmc-data-table';

async function getConfigs() {
  const res = await fetch(`${process.env.API}/dmcheck-configs`, {
    next: { revalidate: 60 * 60 * 24, tags: ['dmcheck-configs'] },
  });
  if (!res.ok) {
    const json = await res.json();
    throw new Error(
      `getConfigs error:  ${res.status}  ${res.statusText} ${json.error}`,
    );
  }

  return await res.json();
}

async function getScans(
  lang: string,
  searchParams: { [key: string]: string | undefined },
): Promise<{
  fetchTime: string;
  data: TableDataType[];
}> {
  console.log('getScans', lang, searchParams);

  const filteredSearchParams = Object.fromEntries(
    Object.entries(searchParams).filter(
      ([_, value]) => value !== undefined,
    ) as [string, string][],
  );

  const queryParams = new URLSearchParams(filteredSearchParams).toString();
  const url = `${process.env.API}/dmcheck-mgmt/table-data?${queryParams}`;

  const res = await fetch(url, {
    next: { revalidate: 600, tags: ['dmcheck-table-data'] },
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
  const configs = await getConfigs();
  console.log('configs', configs);
  return (
    <DmcDataTable
      columns={dmcColumns}
      data={data}
      fetchTime={fetchTime}
      lang={lang}
    />
  );
}
