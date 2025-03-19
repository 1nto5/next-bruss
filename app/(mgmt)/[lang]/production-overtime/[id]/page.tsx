// import { auth } from '@/auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Locale } from '@/i18n.config';
import getEmployees from '@/lib/get-from-api/get-employees';
import { Table } from 'lucide-react';
import Link from 'next/link';
import {
  overtimeRequestEmployeeType,
  OvertimeType,
} from '../lib/production-overtime-types';
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

  const overtimeRequest = await res.json();

  // Transform each employee to include localized agreedReceivingAt
  const employees = overtimeRequest.employees.map(
    (employee: overtimeRequestEmployeeType) => ({
      ...employee,
      agreedReceivingAtLocaleString: employee.agreedReceivingAt
        ? new Date(employee.agreedReceivingAt).toLocaleDateString(lang)
        : null,
    }),
  );

  const overtimeRequestLocaleString = {
    ...overtimeRequest,
    employees,
  };

  return { fetchTime, fetchTimeLocaleString, overtimeRequestLocaleString };
}

export default async function ProductionOvertimePage(props: {
  params: Promise<{ lang: Locale; id: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await props.params;
  const employees = await getEmployees();
  const { lang, id } = params;

  let overtimeRequestLocaleString;
  ({ overtimeRequestLocaleString } = await getOvertimeRequest(lang, id));

  return (
    <Card>
      <CardHeader>
        <div className='space-y-2 sm:flex sm:justify-between sm:gap-4'>
          <CardTitle>
            Pracownicy w zleceniu wykonania pracy w godzinach nadliczbowych -
            produkcja
          </CardTitle>
          <Link href='/production-overtime'>
            <Button variant='outline'>
              <Table /> <span>Tabela zleceń</span>
            </Button>
          </Link>
        </div>

        <CardDescription>ID: {id}</CardDescription>
      </CardHeader>
      <DataTable
        columns={columns}
        data={overtimeRequestLocaleString.employees}
      />
    </Card>
  );
}
