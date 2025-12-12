import { auth } from '@/lib/auth';
import { Locale } from '@/lib/config/i18n';
import { redirect } from 'next/navigation';
import { getDictionary } from '../lib/dict';
import { getSupplierCodes } from '../actions';
import SupplierCodesManagement from '../components/supplier-codes-management';

export default async function SupplierCodesPage(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const params = await props.params;
  const { lang } = params;

  const session = await auth();
  if (!session?.user?.email) {
    redirect(`/${lang}/auth?callbackUrl=/${lang}/invoices/supplier-codes`);
  }

  const isAdmin = session.user.roles?.includes('admin') || false;
  if (!isAdmin) {
    redirect(`/${lang}/invoices`);
  }

  const dict = await getDictionary(lang);
  const codesResult = await getSupplierCodes();
  const codes = codesResult.data || [];

  return (
    <div className='container mx-auto max-w-4xl py-6'>
      <SupplierCodesManagement dict={dict} lang={lang} codes={codes} />
    </div>
  );
}
