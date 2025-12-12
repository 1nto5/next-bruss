import { auth } from '@/lib/auth';
import { Locale } from '@/lib/config/i18n';
import { redirect } from 'next/navigation';
import { getDictionary } from '../lib/dict';
import { getApprovers } from '../actions';
import ApproversSettings from '../components/approvers-settings';

export default async function PurchaseRequestsSettingsPage(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const params = await props.params;
  const { lang } = params;

  const session = await auth();
  if (!session?.user?.email) {
    redirect(`/${lang}/auth?callbackUrl=/${lang}/purchase-requests/settings`);
  }

  const isAdmin = session.user.roles?.includes('admin') || false;
  if (!isAdmin) {
    redirect(`/${lang}/purchase-requests`);
  }

  const dict = await getDictionary(lang);
  const approversResult = await getApprovers();
  const approvers = approversResult.data || [];

  return (
    <div className='container mx-auto max-w-4xl py-6'>
      <ApproversSettings dict={dict} lang={lang} approvers={approvers} />
    </div>
  );
}
