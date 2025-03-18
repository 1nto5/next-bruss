// import { auth } from '@/auth';
import { auth } from '@/auth';
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
import { OvertimeType } from './lib/production-overtime-types';

async function getOvertimeRequests(
  lang: string,
  searchParams: { [key: string]: string | undefined },
  userEmail?: string,
): Promise<{
  fetchTime: Date;
  fetchTimeLocaleString: string;
  overtimeRequestsLocaleString: OvertimeType[];
}> {
  const filteredSearchParams = Object.fromEntries(
    Object.entries(searchParams).filter(
      ([_, value]) => value !== undefined,
    ) as [string, string][],
  );

  // Add userEmail to query params for draft filtering on the server
  if (userEmail) {
    filteredSearchParams.userEmail = userEmail;
  }

  const queryParams = new URLSearchParams(filteredSearchParams).toString();
  const res = await fetch(
    `${process.env.API}/production-overtime?${queryParams}`,
    {
      next: { revalidate: 60, tags: ['production-overtime'] },
    },
  );

  if (!res.ok) {
    const json = await res.json();
    throw new Error(
      `getOvertimeRequests error: ${res.status} ${res.statusText} ${json.error}`,
    );
  }

  const fetchTime = new Date(res.headers.get('date') || '');
  const fetchTimeLocaleString = fetchTime.toLocaleString(lang);

  const overtimeRequests: OvertimeType[] = await res.json();
  const overtimeRequestsLocaleString = overtimeRequests.map(
    (overtimeRequest) => {
      return {
        ...overtimeRequest,
        fromLocaleString: new Date(overtimeRequest.from).toLocaleString(lang),
        toLocaleString: new Date(overtimeRequest.to).toLocaleString(lang),
        approvedAtLocaleString: overtimeRequest.approvedAt
          ? new Date(overtimeRequest.approvedAt).toLocaleString(lang)
          : undefined,
        requestedAtLocaleString: new Date(
          overtimeRequest.requestedAt,
        ).toLocaleString(lang),
        editedAtLocaleString: new Date(overtimeRequest.editedAt).toLocaleString(
          lang,
        ),
      };
    },
  );
  return { fetchTime, fetchTimeLocaleString, overtimeRequestsLocaleString };
}

export default async function ProductionOvertimePage(props: {
  params: Promise<{ lang: Locale }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await props.params;
  const { lang } = params;
  const searchParams = await props.searchParams;
  const session = await auth();
  const isGroupLeader = session?.user?.roles?.includes('group-leader') || false;
  const userEmail = session?.user?.email || undefined;

  let fetchTime, fetchTimeLocaleString, overtimeRequestsLocaleString;
  ({ fetchTime, fetchTimeLocaleString, overtimeRequestsLocaleString } =
    await getOvertimeRequests(lang, searchParams, userEmail));

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Zlecenia wykonania pracy w godzinach nadliczbowych - produkcja
        </CardTitle>
        <CardDescription>
          Ostatnia synchronizacja: {fetchTimeLocaleString}
        </CardDescription>
        <TableFilteringAndOptions
          fetchTime={fetchTime}
          isGroupLeader={isGroupLeader}
          isLogged={!!session}
          userEmail={session?.user?.email || undefined}
        />
      </CardHeader>
      <DataTable
        columns={columns}
        data={overtimeRequestsLocaleString}
        fetchTimeLocaleString={fetchTimeLocaleString}
        fetchTime={fetchTime}
      />
    </Card>
  );
}
