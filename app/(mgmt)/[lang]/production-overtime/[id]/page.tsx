// import { auth } from '@/auth';
import { auth } from '@/auth';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Locale } from '@/i18n.config';
import { OvertimeType } from '../lib/production-overtime-types';
import TableFilteringAndOptions from './components/table-filtering-and-options';
import { columns } from './components/table/columns';
import { DataTable } from './components/table/data-table';

async function getOvertimeRequest(
  lang: string,
  id: string,
): Promise<{
  fetchTime: Date;
  fetchTimeLocaleString: string;
  overtimeRequestLocaleString: OvertimeType;
}> {
  const res = await fetch(
    `${process.env.API}/production-overtime/request?id=${id}`,
    {
      next: { revalidate: 0, tags: ['production-overtime-request'] },
    },
  );

  if (!res.ok) {
    const json = await res.json();
    throw new Error(
      `getOvertimeRequest error:  ${res.status}  ${res.statusText} ${json.error}`,
    );
  }

  const fetchTime = new Date(res.headers.get('date') || '');
  const fetchTimeLocaleString = fetchTime.toLocaleString(lang);

  const overtimeRequestLocaleString = await res.json();
  return { fetchTime, fetchTimeLocaleString, overtimeRequestLocaleString };
}

export default async function ProductionOvertimePage(props: {
  params: Promise<{ lang: Locale; id: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await props.params;
  const session = await auth();
  const isGroupLeader = session?.user?.roles?.includes('group-leader') || false;
  const isPlantManager =
    session?.user?.roles?.includes('plant-manager') || false;

  const { lang, id } = params;

  let fetchTime, fetchTimeLocaleString, overtimeRequestLocaleString;
  ({ fetchTime, fetchTimeLocaleString, overtimeRequestLocaleString } =
    await getOvertimeRequest(lang, id));

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Pracownicy w zleceniu wykonania pracy w godzinach nadliczbowych -
          produkcja
        </CardTitle>
        <CardDescription>
          ID: {id} | Ostatnia synchronizacja: {fetchTimeLocaleString}
        </CardDescription>
        <TableFilteringAndOptions
          fetchTime={fetchTime}
          isGroupLeader={isGroupLeader}
        />
      </CardHeader>
      <DataTable
        columns={columns}
        data={overtimeRequestLocaleString.employees}
        fetchTimeLocaleString={fetchTimeLocaleString}
        fetchTime={fetchTime}
      />
    </Card>
  );
}
