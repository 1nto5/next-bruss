import { DmcTableDataType as TableDataType } from '@/app/(mgmt)/[lang]/dmcheck-data/lib/dmcheck-data-types';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Locale } from '@/i18n.config';
import DmcTableFilteringAndOptions from './components/dmc-table-filtering-and-options';
import { dmcColumns } from './dmc-table/dmc-columns';
import { DmcDataTable } from './dmc-table/dmc-data-table';

async function getArticles() {
  const res = await fetch(`${process.env.API}/dmcheck-data/articles`, {
    next: { revalidate: 60 * 60 * 8, tags: ['dmcheck-articles'] },
  });
  if (!res.ok) {
    const json = await res.json();
    throw new Error(
      `getArticles error:  ${res.status}  ${res.statusText} ${json.error}`,
    );
  }

  return await res.json();
}

async function getScans(
  lang: string,
  searchParams: { [key: string]: string | undefined },
): Promise<{
  fetchTimeLocaleString: string;
  fetchTime: Date;
  data: TableDataType[];
}> {
  const filteredSearchParams = Object.fromEntries(
    Object.entries(searchParams).filter(
      ([_, value]) => value !== undefined,
    ) as [string, string][],
  );

  const queryParams = new URLSearchParams(filteredSearchParams).toString();
  const url = `${process.env.API}/dmcheck-data/dmc?${queryParams}`;

  const res = await fetch(url, {
    next: { revalidate: 0, tags: ['dmcheck-data-dmc'] },
  });

  if (!res.ok) {
    const json = await res.json();
    throw new Error(
      `getScans error:  ${res.status}  ${res.statusText} ${json.error}`,
    );
  }

  const fetchTime = new Date(res.headers.get('date') || '');
  const fetchTimeLocaleString = fetchTime.toLocaleString(lang);

  let data: TableDataType[] = await res.json();
  data = data.map((item) => ({
    ...item,
    timeLocaleString: new Date(item.time).toLocaleString(lang),
    hydraTimeLocaleString: item.hydra_time
      ? new Date(item.hydra_time).toLocaleString(lang)
      : '',
    palletTimeLocaleString: item.pallet_time
      ? new Date(item.pallet_time).toLocaleString(lang)
      : '',
  }));
  return { fetchTimeLocaleString, fetchTime, data };
}

export default async function InventoryPage(props: {
  params: Promise<{ lang: Locale }>;
  // searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const { lang } = params;

  let fetchTime, fetchTimeLocaleString, data;
  ({ fetchTime, fetchTimeLocaleString, data } = await getScans(
    lang,
    searchParams,
  ));
  const articles = await getArticles();

  return (
    <Card>
      <CardHeader>
        <CardTitle>DMCheck data</CardTitle>
        <CardDescription>Last sync: {fetchTimeLocaleString}</CardDescription>
        <DmcTableFilteringAndOptions
          articles={articles}
          fetchTime={fetchTime}
        />
      </CardHeader>
      <DmcDataTable
        columns={dmcColumns}
        data={data}
        articles={articles}
        fetchTime={fetchTime}
        fetchTimeLocaleString={fetchTimeLocaleString}
        lang={lang}
      />
    </Card>
  );
}
