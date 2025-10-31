// import { auth } from '@/auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Locale } from '@/i18n.config';
import { AlarmClockPlus, ArrowLeft } from 'lucide-react';
import LocalizedLink from '@/components/localized-link';
import { DataTable } from '../../../components/id-table/data-table';
import { getDictionary } from '../../../lib/dict';
import { getOvertimeRequest } from '../../../lib/get-overtime-request';

export default async function ProductionOvertimePage(props: {
  params: Promise<{ lang: Locale; id: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await props.params;
  const { lang, id } = params;

  const dict = await getDictionary(lang);

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
            <CardTitle>{dict.idTable.title}</CardTitle>
            <CardDescription>
              ID zlecenia: {overtimeRequestLocaleString.internalId}
            </CardDescription>
          </div>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
            <LocalizedLink
              href={`/overtime-orders/${id}`}
              className='w-full sm:w-auto'
            >
              <Button variant='outline' className='w-full'>
                <ArrowLeft /> <span>{dict.addDayOffForm.backToRequest}</span>
              </Button>
            </LocalizedLink>
            {shouldShowAddButton && (
              <LocalizedLink
                href={`/overtime-orders/${id}/add-day-off`}
                className='w-full sm:w-auto'
              >
                <Button variant='outline' className='w-full'>
                  <AlarmClockPlus /> <span>{dict.idTable.addPickup}</span>
                </Button>
              </LocalizedLink>
            )}
            <LocalizedLink href={`/overtime-orders`} className='w-full sm:w-auto'>
              <Button variant='outline' className='w-full'>
                <ArrowLeft /> <span>{dict.detailsPage.backToOrders}</span>
              </Button>
            </LocalizedLink>
          </div>
        </div>
      </CardHeader>

      <DataTable
        data={(
          overtimeRequestLocaleString.employeesWithScheduledDayOff || []
        ).map((employee) => ({
          ...employee,
          overtimeId: overtimeRequestLocaleString._id,
        }))}
        id={id}
        status={overtimeRequestLocaleString.status}
        dict={dict}
      />
    </Card>
  );
}
