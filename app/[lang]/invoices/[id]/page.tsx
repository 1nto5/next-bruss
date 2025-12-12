import { auth } from '@/lib/auth';
import { Locale } from '@/lib/config/i18n';
import { redirect } from 'next/navigation';
import { getDictionary } from '../lib/dict';
import InvoiceDetails from '../components/invoice-details';
import { getAvailablePRs, getMySupplierCodes } from '../actions';

async function getInvoice(id: string) {
  const res = await fetch(`${process.env.API}/invoices/${id}`, {
    next: { revalidate: 0, tags: ['invoices'] },
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}

export default async function InvoiceDetailsPage(props: {
  params: Promise<{ lang: Locale; id: string }>;
}) {
  const params = await props.params;
  const { lang, id } = params;

  const session = await auth();
  const dict = await getDictionary(lang);

  const invoice = await getInvoice(id);
  if (!invoice) {
    redirect(`/${lang}/invoices`);
  }

  // Load available PRs and SCs for confirmation
  const prsResult = await getAvailablePRs();
  const scsResult = await getMySupplierCodes();

  return (
    <div className='container mx-auto max-w-4xl py-6'>
      <InvoiceDetails
        invoice={invoice}
        dict={dict}
        lang={lang}
        session={session}
        availablePRs={prsResult.data || []}
        mySupplierCodes={scsResult.data || []}
      />
    </div>
  );
}
