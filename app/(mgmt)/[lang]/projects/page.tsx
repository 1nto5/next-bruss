// import { auth } from '@/auth';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Locale } from '@/i18n.config';
import TableFilteringAndOptions from './components/table-filtering-and-options';
import { columns } from './components/table/columns';
import { DataTable } from './components/table/data-table';
import { ProjectsLocaleStringType } from './lib/types';
import { ProjectsType } from './lib/zod';

async function getProjects(
  lang: string,
  searchParams: { [key: string]: string | undefined },
): Promise<{
  fetchTime: Date;
  fetchTimeLocaleString: string;
  dataLocaleString: ProjectsLocaleStringType[];
}> {
  const filteredSearchParams = Object.fromEntries(
    Object.entries(searchParams).filter(
      ([_, value]) => value !== undefined,
    ) as [string, string][],
  );

  const queryParams = new URLSearchParams(filteredSearchParams).toString();
  const res = await fetch(`${process.env.API}/projects?${queryParams}`, {
    next: { revalidate: 60, tags: ['projects'] },
  });

  if (!res.ok) {
    const json = await res.json();
    throw new Error(
      `getProjects error: ${res.status} ${res.statusText} ${json.error}`,
    );
  }

  const fetchTime = new Date(res.headers.get('date') || '');
  const fetchTimeLocaleString = fetchTime.toLocaleString(lang);

  const data: ProjectsType[] = await res.json();
  const dataLocaleString = data.map((data) => {
    return {
      ...data,
      dateLocaleString: data.date
        ? new Date(data.date).toLocaleDateString(lang)
        : '',
    };
  });
  return { fetchTime, fetchTimeLocaleString, dataLocaleString };
}

export default async function ProductionOvertimePage(props: {
  params: Promise<{ lang: Locale }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await props.params;
  const { lang } = params;
  const searchParams = await props.searchParams;

  let fetchTime, fetchTimeLocaleString, dataLocaleString;
  ({ fetchTime, fetchTimeLocaleString, dataLocaleString } = await getProjects(
    lang,
    searchParams,
  ));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Time Sheet - Adrian&apos;s Projects</CardTitle>
        <CardDescription>
          Last synchronization: {fetchTimeLocaleString}
        </CardDescription>
        <TableFilteringAndOptions fetchTime={fetchTime} />
      </CardHeader>
      <DataTable
        columns={columns}
        data={dataLocaleString}
        fetchTimeLocaleString={fetchTimeLocaleString}
        fetchTime={fetchTime}
      />
    </Card>
  );
}
