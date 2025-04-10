// import { auth } from '@/auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Locale } from '@/i18n.config';
import { Table } from 'lucide-react';
import Link from 'next/link';
import { getOvertimeRequest } from '../lib/get-overtime-request';
import { columns } from './components/table/columns';
import { DataTable } from './components/table/data-table';

export default async function ProductionOvertimePage(props: {
  params: Promise<{ lang: Locale; id: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await props.params;
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

      <CardContent className='py-2'>
        <div className='mb-4'>
          <p className='font-semibold'>
            Łączna liczba pracowników:{' '}
            {overtimeRequestLocaleString.numberOfEmployees}
          </p>
          <p className='text-muted-foreground'>
            Liczba pracowników odbierających dni wolne:{' '}
            {overtimeRequestLocaleString.employeesWithScheduledDayOff?.length ||
              0}
          </p>
        </div>
      </CardContent>

      <DataTable
        columns={columns}
        data={(
          overtimeRequestLocaleString.employeesWithScheduledDayOff || []
        ).map((employee) => ({
          ...employee,
          overtimeId: overtimeRequestLocaleString._id,
        }))}
      />
    </Card>
  );
}
