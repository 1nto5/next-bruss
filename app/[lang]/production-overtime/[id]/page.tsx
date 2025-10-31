// import { auth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Locale } from '@/lib/config/i18n';
import { Table } from 'lucide-react';
import LocalizedLink from '@/components/localized-link';
import { DataTableWrapper } from '../components/id-table/data-table-wrapper';
import { getOvertimeRequest } from '../lib/get-overtime-request';
import { getDictionary } from '../lib/dict';

export default async function ProductionOvertimePage(props: {
  params: Promise<{ lang: Locale; id: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await props.params;
  const { lang, id } = params;
  const dict = await getDictionary(lang);

  let overtimeRequestLocaleString;
  ({ overtimeRequestLocaleString } = await getOvertimeRequest(lang, id));

  return (
    <Card>
      <CardHeader>
        <div className='space-y-2 sm:flex sm:justify-between sm:gap-4'>
          <CardTitle>{dict.idTable.title}</CardTitle>
          <LocalizedLink href='/production-overtime'>
            <Button variant='outline'>
              <Table /> <span>{dict.idTable.requestsTable}</span>
            </Button>
          </LocalizedLink>
        </div>

        {/* <CardDescription>ID: {id}</CardDescription> */}
      </CardHeader>

      <DataTableWrapper
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
