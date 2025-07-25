// import { auth } from '@/auth';
import { auth } from '@/auth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Locale } from '@/i18n.config';
import { KeyRound, Plus } from 'lucide-react';
import Link from 'next/link';
import TableFilteringAndOptions from './components/table-filtering-and-options';
import { createColumns } from './components/table/columns';
import { DataTable } from './components/table/data-table';
import { OvertimeType } from './lib/types';

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
      next: { revalidate: 0, tags: ['production-overtime'] },
    },
  );

  if (!res.ok) {
    const json = await res.json();
    throw new Error(
      `getOvertimeRequests error: ${res.status} ${res.statusText} ${json.error}`,
    );
  }

  const fetchTime = new Date(res.headers.get('date') || '');
  const fetchTimeLocaleString = fetchTime.toLocaleString();

  const overtimeRequests: OvertimeType[] = await res.json();
  const overtimeRequestsLocaleString = overtimeRequests.map(
    (overtimeRequest) => {
      return {
        ...overtimeRequest,
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
  // Users with any role containing 'manager' (e.g., plant manager, logistics manager, etc.) can create requests
  const isManager =
    session?.user?.roles?.some((role) => role.includes('manager')) || false;
  const isAdmin = session?.user?.roles?.includes('admin') || false;
  const canCreateRequest = isGroupLeader || isManager || isAdmin;
  const userEmail = session?.user?.email || undefined;

  let fetchTime, fetchTimeLocaleString, overtimeRequestsLocaleString;
  ({ fetchTime, fetchTimeLocaleString, overtimeRequestsLocaleString } =
    await getOvertimeRequests(lang, searchParams, userEmail));

  return (
    <Card>
      <CardHeader className='pb-2'>
        <div className='mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <CardTitle>
            Zlecenia wykonania pracy w godzinach nadliczbowych - produkcja
          </CardTitle>

          <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
            {session && canCreateRequest ? (
              <Link href='/production-overtime/new-request'>
                <Button variant={'outline'} className='w-full sm:w-auto'>
                  <Plus /> <span>Nowe zlecenie</span>
                </Button>
              </Link>
            ) : !session ? (
              <Link href={`/auth?callbackUrl=/production-overtime`}>
                <Button variant={'outline'} className='w-full sm:w-auto'>
                  <KeyRound /> <span>Zaloguj się</span>
                </Button>
              </Link>
            ) : null}
          </div>
        </div>
        <TableFilteringAndOptions
          fetchTime={fetchTime}
          isGroupLeader={isGroupLeader}
          isLogged={!!session}
          userEmail={session?.user?.email || undefined}
        />
      </CardHeader>
      <DataTable
        columns={createColumns}
        data={overtimeRequestsLocaleString}
        fetchTimeLocaleString={fetchTimeLocaleString}
        fetchTime={fetchTime}
        session={session}
      />
    </Card>
  );
}
