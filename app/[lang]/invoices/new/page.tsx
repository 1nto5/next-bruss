import { auth } from '@/lib/auth';
import { Locale } from '@/lib/config/i18n';
import { redirect } from 'next/navigation';
import UploadInvoiceForm from '../components/upload-invoice-form';
import { getDictionary } from '../lib/dict';

export default async function NewInvoicePage(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const params = await props.params;
  const { lang } = params;

  const session = await auth();
  if (!session?.user?.email) {
    redirect(`/${lang}/auth?callbackUrl=/${lang}/invoices/new`);
  }

  // Only bookkeeper or admin can upload
  const hasRole =
    session.user.roles?.includes('bookkeeper') ||
    session.user.roles?.includes('admin');

  if (!hasRole) {
    redirect(`/${lang}/invoices`);
  }

  const dict = await getDictionary(lang);

  return (
    <div className='container mx-auto max-w-3xl py-6'>
      <UploadInvoiceForm dict={dict} lang={lang} />
    </div>
  );
}
