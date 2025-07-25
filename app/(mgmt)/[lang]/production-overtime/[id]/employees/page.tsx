// import { auth } from '@/auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Locale } from '@/i18n.config';
import { AlarmClockPlus, ArrowLeft, Table } from 'lucide-react';
import Link from 'next/link';
import { columns } from '../../components/id-table/columns';
import { DataTable } from '../../components/id-table/data-table';
import { getOvertimeRequest } from '../../lib/get-overtime-request';

export default async function ProductionOvertimePage(props: {
  params: Promise<{ lang: Locale; id: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await props.params;
  const { lang, id } = params;

  let overtimeRequestLocaleString;
  ({ overtimeRequestLocaleString } = await getOvertimeRequest(lang, id));

  const shouldShowAddButton =
    overtimeRequestLocaleString.status &&
    overtimeRequestLocaleString.status !== 'completed' &&
    overtimeRequestLocaleString.status !== 'canceled' &&
    overtimeRequestLocaleString.status !== 'accounted';

  return (
    <Card>
      <CardHeader className='pb-2'>
        <div className='mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <CardTitle>Pracownicy odbierający nadgodziny</CardTitle>
            <CardDescription>
              ID zlecenia: {overtimeRequestLocaleString.internalId}
            </CardDescription>
          </div>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
            <Link
              href={`/production-overtime/${id}`}
              className='w-full sm:w-auto'
            >
              <Button variant='outline' className='w-full'>
                <ArrowLeft /> <span>Szczegóły zlecenia</span>
              </Button>
            </Link>
            {shouldShowAddButton && (
              <Link
                href={`/production-overtime/${id}/add-day-off`}
                className='w-full sm:w-auto'
              >
                <Button variant='outline' className='w-full'>
                  <AlarmClockPlus /> <span>Dodaj odbiór</span>
                </Button>
              </Link>
            )}
            <Link href={`/production-overtime`} className='w-full sm:w-auto'>
              <Button variant='outline' className='w-full'>
                <Table /> <span>Zlecenia</span>
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>

      <DataTable
        columns={columns}
        data={(
          overtimeRequestLocaleString.employeesWithScheduledDayOff || []
        ).map((employee) => ({
          ...employee,
          overtimeId: overtimeRequestLocaleString._id,
        }))}
        id={id}
        status={overtimeRequestLocaleString.status}
      />
    </Card>
  );
}
