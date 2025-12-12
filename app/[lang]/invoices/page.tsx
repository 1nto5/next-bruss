import LocalizedLink from '@/components/localized-link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@/lib/auth';
import { Locale } from '@/lib/config/i18n';
import { KeyRound, Plus, Settings } from 'lucide-react';
import { createColumns } from './components/table/columns';
import { DataTable } from './components/table/data-table';
import { getDictionary } from './lib/dict';
import { InvoiceType } from './lib/types';

async function getInvoices(
  searchParams: { [key: string]: string | undefined },
): Promise<InvoiceType[]> {
  const filteredSearchParams = Object.fromEntries(
    Object.entries(searchParams).filter(
      ([_, value]) => value !== undefined,
    ) as [string, string][],
  );

  const queryParams = new URLSearchParams(filteredSearchParams).toString();
  const res = await fetch(`${process.env.API}/invoices?${queryParams}`, {
    next: { revalidate: 0, tags: ['invoices'] },
  });

  if (!res.ok) {
    throw new Error(`getInvoices error: ${res.status}`);
  }

  return res.json();
}

export default async function InvoicesPage(props: {
  params: Promise<{ lang: Locale }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await props.params;
  const { lang } = params;
  const searchParams = await props.searchParams;
  const dict = await getDictionary(lang);
  const session = await auth();

  const isBookkeeper = session?.user?.roles?.includes('bookkeeper') || false;
  const isAdmin = session?.user?.roles?.includes('admin') || false;
  const canUpload = isBookkeeper || isAdmin;

  const invoices = await getInvoices(searchParams);

  const columns = createColumns(dict, session, lang);

  return (
    <Card>
      <CardHeader className='pb-2'>
        <div className='mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <CardTitle>{dict.page.title}</CardTitle>

          <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
            {isAdmin && (
              <Button variant='outline' className='w-full sm:w-auto' asChild>
                <LocalizedLink href='/invoices/supplier-codes'>
                  <Settings className='mr-2 h-4 w-4' />
                  {dict.page.supplierCodes}
                </LocalizedLink>
              </Button>
            )}

            {session && canUpload ? (
              <Button variant='default' className='w-full sm:w-auto' asChild>
                <LocalizedLink href='/invoices/new'>
                  <Plus className='mr-2 h-4 w-4' />
                  {dict.page.uploadInvoice}
                </LocalizedLink>
              </Button>
            ) : !session ? (
              <Button variant='outline' className='w-full sm:w-auto' asChild>
                <LocalizedLink href={`/auth?callbackUrl=/${lang}/invoices`}>
                  <KeyRound className='mr-2 h-4 w-4' />
                  {dict.page.login}
                </LocalizedLink>
              </Button>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <DataTable columns={columns} data={invoices} dict={dict} />
    </Card>
  );
}
