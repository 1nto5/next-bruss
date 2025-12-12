import { auth } from '@/lib/auth';
import { Locale } from '@/lib/config/i18n';
import { redirect } from 'next/navigation';
import AddRequestForm from '../components/add-request-form';
import { getDictionary } from '../lib/dict';
import { getApprovers } from '../actions';

export default async function NewPurchaseRequestPage(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const params = await props.params;
  const { lang } = params;

  const session = await auth();
  if (!session?.user?.email) {
    redirect(`/${lang}/auth?callbackUrl=/${lang}/purchase-requests/new`);
  }

  const dict = await getDictionary(lang);
  const approversResult = await getApprovers();
  const approvers = approversResult.data || [];

  return (
    <div className='container mx-auto max-w-4xl py-6'>
      <AddRequestForm dict={dict} lang={lang} approvers={approvers} />
    </div>
  );
}
