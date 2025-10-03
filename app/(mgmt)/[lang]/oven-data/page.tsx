import { OvenProcessDataType } from '@/app/(mgmt)/[lang]/oven-data/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Locale } from '@/i18n.config';

import { RefreshButton } from '@/components/refresh-button';
import { revalidateOvenTableData } from './actions';
import OvenDataWithChart from './components/oven-data-with-chart';
import OvenTableFilteringAndOptions from './components/table-filtering-and-options';
import { Button } from '@/components/ui/button';
import { BarChart3 } from 'lucide-react';
import Link from 'next/link';

async function getOvens() {
  const res = await fetch(`${process.env.API}oven-data/ovens`, {
    next: { revalidate: 60 * 60 * 8, tags: ['oven-data-ovens'] },
  });
  if (!res.ok) {
    const json = await res.json();
    throw new Error(
      `getOvens error:  ${res.status}  ${res.statusText} ${json.error}`,
    );
  }

  return await res.json();
}

async function getOvenProcesses(
  lang: string,
  searchParams: { [key: string]: string | undefined },
): Promise<{
  fetchTimeLocaleString: string;
  fetchTime: Date;
  data: OvenProcessDataType[];
}> {
  const filteredSearchParams = Object.fromEntries(
    Object.entries(searchParams).filter(
      ([_, value]) => value !== undefined,
    ) as [string, string][],
  );

  const queryParams = new URLSearchParams(filteredSearchParams).toString();
  const url = `${process.env.API}oven-data/processes?${queryParams}`;

  const res = await fetch(url, {
    next: { revalidate: 0, tags: ['oven-data-processes'] },
  });

  if (!res.ok) {
    const json = await res.json();
    throw new Error(
      `getOvenProcesses error:  ${res.status}  ${res.statusText} ${json.error}`,
    );
  }

  const fetchTime = new Date(res.headers.get('date') || '');
  const fetchTimeLocaleString = fetchTime.toLocaleString(lang);

  let data: OvenProcessDataType[] = await res.json();
  data = data.map((item) => ({
    ...item,
    startTime: new Date(item.startTime),
    endTime: item.endTime ? new Date(item.endTime) : null,
    startTimeLocaleString: new Date(item.startTime).toLocaleString(lang),
    endTimeLocaleString: item.endTime
      ? new Date(item.endTime).toLocaleString(lang)
      : '',
  }));
  return { fetchTimeLocaleString, fetchTime, data };
}

export default async function OvenDataPage(props: {
  params: Promise<{ lang: Locale }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const { lang } = params;

  let fetchTime, fetchTimeLocaleString, data;
  ({ fetchTime, fetchTimeLocaleString, data } = await getOvenProcesses(
    lang,
    searchParams,
  ));
  const ovens = await getOvens();

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle>Oven Data</CardTitle>
            <CardDescription>
              Last sync: {fetchTimeLocaleString}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Link href={`/${lang}/oven-data/oee`}>
              <Button variant="outline" size="sm">
                <BarChart3 className="mr-2 h-4 w-4" />
                View OEE
              </Button>
            </Link>
            <RefreshButton
              fetchTime={fetchTime}
              onRefresh={revalidateOvenTableData}
            />
          </div>
        </div>
        <OvenTableFilteringAndOptions ovens={ovens} fetchTime={fetchTime} />
      </CardHeader>
      <CardContent>
        <OvenDataWithChart
          data={data}
          ovens={ovens}
          fetchTime={fetchTime}
          fetchTimeLocaleString={fetchTimeLocaleString}
          lang={lang}
          searchParams={searchParams}
        />
      </CardContent>
    </Card>
  );
}
